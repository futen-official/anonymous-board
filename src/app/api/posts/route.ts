import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const { threadId, content } = await req.json()

  // バリデーション
  if (
    !threadId ||
    typeof threadId !== "string" ||
    !content ||
    typeof content !== "string"
  ) {
    return NextResponse.json(
      { error: "threadId and content are required" },
      { status: 400 }
    )
  }

  // スレ存在 & 期限チェック
  const thread = await prisma.thread.findFirst({
    where: {
      id: threadId,
      expiresAt: { gt: new Date() },
    },
  })

  if (!thread) {
    return NextResponse.json(
      { error: "thread not found or expired" },
      { status: 404 }
    )
  }

  // 書き込みの寿命（24h）
  const postExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  // Post作成
  const post = await prisma.post.create({
    data: {
      threadId,
      content,
      expiresAt: postExpiresAt,
    },
  })

  // スレの寿命を延長（最後の書き込みから24h）
  const threadExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await prisma.thread.update({
    where: { id: threadId },
    data: { expiresAt: threadExpiresAt },
  })

  return NextResponse.json(post)
}