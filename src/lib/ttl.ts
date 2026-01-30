import { prisma } from "@/lib/prisma";

export const TTL_HOURS = 24;

export function calcExpiresAt(from: Date = new Date()) {
  return new Date(from.getTime() + TTL_HOURS * 60 * 60 * 1000);
}

/**
 * スレの寿命を「今から24時間」に延長し、
 * そのスレの全投稿の expiresAt も同じ値に揃える。
 */
export async function bumpThreadTTL(threadId: string, now: Date = new Date()) {
  const expiresAt = calcExpiresAt(now);

  await prisma.$transaction([
    prisma.thread.update({
      where: { id: threadId },
      data: { expiresAt },
      select: { id: true },
    }),
    prisma.post.updateMany({
      where: { threadId },
      data: { expiresAt },
    }),
  ]);

  return expiresAt;
}