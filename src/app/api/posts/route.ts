// src/app/api/posts/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Body = {
  threadId?: string;
  content?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const threadId = (body.threadId ?? "").trim();
    const content = (body.content ?? "").trim();

    if (!threadId) {
      return NextResponse.json({ ok: false, error: "threadId is required" }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ ok: false, error: "content is required" }, { status: 400 });
    }

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      select: { id: true, expiresAt: true },
    });

    if (!thread) {
      return NextResponse.json({ ok: false, error: "thread not found" }, { status: 404 });
    }

    // 投稿のexpiresはスレに揃える（今の仕様に一番自然）
    const postExpiresAt = new Date(thread.expiresAt);

    const post = await prisma.post.create({
      data: {
        content,
        expiresAt: postExpiresAt,
        authorType: "user",
        isGhost: false,

        // ✅ threadId を直で入れず connect にする（これで型が通る）
        thread: {
          connect: { id: threadId },
        },
      },
      select: {
        id: true,
        content: true,
        authorType: true,
        createdAt: true,
        expiresAt: true,
        isGhost: true,
      },
    });

    // スレの最終アクティビティ更新（必要なら）
    await prisma.thread.update({
      where: { id: threadId },
      data: { lastActivityAt: new Date() },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, post });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "internal error" },
      { status: 500 }
    );
  }
}