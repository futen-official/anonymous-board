import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { title?: string };
    const title = (body.title ?? "").trim();
    if (!title) {
      return NextResponse.json({ ok: false, error: "title empty" }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const thread = await prisma.thread.create({
      data: {
        title,
        expiresAt,
        lastActivityAt: now,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, threadId: thread.id });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown error" },
      { status: 500 }
    );
  }
}