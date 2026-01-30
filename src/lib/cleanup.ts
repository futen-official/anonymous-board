import { prisma } from "@/lib/prisma";

export async function cleanupExpired() {
  const now = new Date();

  // 念のため、子(Post)→親(Thread)の順で掃除（Cascadeがあっても安全）
  await prisma.post.deleteMany({
    where: { expiresAt: { lt: now } },
  });

  await prisma.thread.deleteMany({
    where: { expiresAt: { lt: now } },
  });
}