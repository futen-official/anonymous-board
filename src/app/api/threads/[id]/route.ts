import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    if (!id) {
      return NextResponse.json(
        { ok: false, message: "id is missing" },
        { status: 400 }
      );
    }

    const thread = await prisma.thread.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        createdAt: true,
        expiresAt: true,
        lastActivityAt: true,
        lastGhostAt: true,
        posts: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            content: true,
            authorType: true,
            createdAt: true,
            expiresAt: true,
            isGhost: true,
          },
        },
      },
    });

    if (!thread) {
      return NextResponse.json(
        { ok: false, message: "thread not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, thread, posts: thread.posts });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message ?? "server error" },
      { status: 500 }
    );
  }
}