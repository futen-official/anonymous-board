import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ApiOk = { ok: true; thread: { id: string } };
type ApiNg = { ok: false; message: string };

export async function GET() {
  const now = new Date();

  const threads = await prisma.thread.findMany({
    where: { expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { posts: true } } },
  });

  return NextResponse.json({ ok: true, threads });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = String(body?.title ?? "").trim();
    const firstPost = String(body?.firstPost ?? "").trim();

    if (!title) return NextResponse.json<ApiNg>({ ok: false, message: "タイトルが空" });
    if (!firstPost) return NextResponse.json<ApiNg>({ ok: false, message: "一投稿目が空" });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 1) Thread 作成
    const thread = await prisma.thread.create({
      data: {
        title,
        expiresAt,
        lastActivityAt: now,
        lastGhostAt: null,
      },
      select: { id: true, expiresAt: true },
    });

    // 2) 一投稿目を必ず作る（user）
    await prisma.post.create({
      data: {
        content: firstPost,
        authorType: "user",
        expiresAt: thread.expiresAt,
        isGhost: false,
        thread: { connect: { id: thread.id } },
      },
      select: { id: true },
    });

    return NextResponse.json<ApiOk>({ ok: true, thread: { id: thread.id } });
  } catch (e: any) {
    return NextResponse.json<ApiNg>({
      ok: false,
      message: e?.message ?? "スレ作成エラー",
    });
  }
}