import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;

    const thread = await prisma.thread.findUnique({
      where: { id },
      select: { id: true, title: true, expiresAt: true },
    });

    if (!thread) {
      return NextResponse.json({ ok: false, error: "thread not found" }, { status: 404 });
    }

    const posts = await prisma.post.findMany({
      where: { threadId: id },
      orderBy: { createdAt: "asc" },
      select: { id: true, content: true, createdAt: true, isGhost: true },
    });

    return NextResponse.json({ ok: true, thread, posts });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;

    const body = (await req.json()) as { content?: string };
    const content = (body.content ?? "").trim();
    if (!content) {
      return NextResponse.json({ ok: false, error: "content empty" }, { status: 400 });
    }

    const now = new Date();

    // スレ延命（24h）
    const newExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await prisma.thread.update({
      where: { id },
      data: {
        lastActivityAt: now,
        expiresAt: newExpiresAt,
      },
    });

    const post = await prisma.post.create({
      data: {
        threadId: id,
        content,
        authorType: "user",
        expiresAt: newExpiresAt,
        isGhost: false,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, postId: post.id });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown error" },
      { status: 500 }
    );
  }
}