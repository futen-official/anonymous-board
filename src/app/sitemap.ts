// src/app/sitemap.ts
import { prisma } from "@/lib/prisma";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) {
    // これが無いと、Vercelのpreview URLが混ざったりして事故る
    throw new Error("NEXT_PUBLIC_SITE_URL is not set");
  }

  const threads = await prisma.thread.findMany({
    where: {
      expiresAt: { gt: new Date() }, // 消えたスレはサイトマップに載せない
    },
    select: {
      id: true,
      lastActivityAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 500, // 多すぎると重いので上限（必要なら増やす）
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    ...threads.map((t) => ({
      url: `${baseUrl}/t/${t.id}`,
      lastModified: t.lastActivityAt ?? t.createdAt,
    })),
  ];
}