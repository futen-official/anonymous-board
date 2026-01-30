// src/app/api/cron/ghost/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAIReply } from "@/lib/aiReply";
import type { Msg } from "@/lib/ghostEngine";

export const dynamic = "force-dynamic";

// 本番は 2 * 60 * 60 * 1000（2時間）
const IDLE_MS = 2 * 60 * 60 * 1000;

// スレが延命される時間（24時間）
const EXTEND_MS = 24 * 60 * 60 * 1000;

// 1スレ ghost 上限
const GHOST_LIMIT = 20;

// 一度に見るスレ数（適当でOK）
const BATCH = 30;

export async function GET(req: Request) {
  const url = new URL(req.url);

  const token = url.searchParams.get("token");
  const expected = process.env.CRON_TOKEN;
  const isDev = process.env.NODE_ENV === "development";

  // ===== 認証（devはスキップ）=====
  if (!isDev && expected && token !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();

  try {
    // ===== 期限切れ掃除 =====
    await prisma.post.deleteMany({ where: { expiresAt: { lte: now } } });
    await prisma.thread.deleteMany({ where: { expiresAt: { lte: now } } });

    // ===== 対象スレ（生きてるやつ）=====
    const threads = await prisma.thread.findMany({
      where: { expiresAt: { gt: now } },
      orderBy: { lastActivityAt: "asc" },
      take: BATCH,
      select: { id: true, title: true, expiresAt: true, lastGhostAt: true },
    });

    let replied = 0;
    const errors: string[] = [];

    for (const t of threads) {
      try {
        // --- ghost上限 ---
        const ghostCount = await prisma.post.count({
          where: { threadId: t.id, isGhost: true },
        });
        if (ghostCount >= GHOST_LIMIT) continue;

        // --- 最後の user 投稿 ---
        const lastUser = await prisma.post.findFirst({
          where: { threadId: t.id, authorType: "user" },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true, content: true },
        });
        if (!lastUser) continue;

        const lastUserAt = new Date(lastUser.createdAt).getTime();
        if (Date.now() - lastUserAt < IDLE_MS) continue; // まだ無反応扱いじゃない

        // --- 直近ghostから2時間経ってないなら出さない ---
        if (t.lastGhostAt) {
          const lastGhostAt = new Date(t.lastGhostAt).getTime();
          if (Date.now() - lastGhostAt < IDLE_MS) continue;
        }

        // --- userのあとにAIが既に喋ってたらスキップ（連投防止）---
        const lastAI = await prisma.post.findFirst({
          where: { threadId: t.id, authorType: "ai" },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        });

        if (lastAI) {
          const lastAIAt = new Date(lastAI.createdAt).getTime();
          if (lastAIAt > lastUserAt) {
            // userより後のAIがある＝すでに返信済み
            continue;
          }
        }

        // --- 直近会話（UIでghost感出さない：ラベル付けしない） ---
        const recent = await prisma.post.findMany({
          where: { threadId: t.id },
          orderBy: { createdAt: "desc" },
          take: 12,
          select: { content: true, authorType: true, isGhost: true, createdAt: true },
        });

        const recentMessages: Msg[] = recent
          .reverse()
          .map((p) => ({
            authorType: p.authorType === "user" ? "user" : "ai",
            content: p.content,
            isGhost: p.isGhost,
            createdAt: p.createdAt,
          }));

        const recentGhost = await prisma.post.findMany({
          where: { threadId: t.id, isGhost: true },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { content: true },
        });

        const recentGhostTexts = recentGhost.map((g) => g.content);

        // ===== ここが “核”：ghost生成 =====
        const aiText = await generateAIReply({
          threadTitle: t.title,
          recentMessages,
          lastUserMessage: lastUser.content,
          recentGhostTexts,
          threadIdSeed: t.id,
        });

        const newExpiresAt = new Date(Date.now() + EXTEND_MS);

        // thread延命 + lastGhostAt 更新（lastActivityAtも更新しとく）
        await prisma.thread.update({
          where: { id: t.id },
          data: {
            expiresAt: newExpiresAt,
            lastGhostAt: now,
            lastActivityAt: now,
          },
        });

        // 既存postのexpiresAtも揃える（スレが伸びたら全部伸ばす）
        await prisma.post.updateMany({
          where: { threadId: t.id },
          data: { expiresAt: newExpiresAt },
        });

        // ghost投稿作成
        await prisma.post.create({
          data: {
            threadId: t.id,
            content: aiText,
            expiresAt: newExpiresAt,
            authorType: "ai",
            isGhost: true,
          },
        });

        replied++;
      } catch (e: any) {
        errors.push(`thread ${t.id} failed: ${String(e?.message ?? e)}`);
      }
    }

    return NextResponse.json({ ok: true, replied, errors });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 200 });
  }
}