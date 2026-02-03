// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // 変なキャッシュ事故防止

function getBaseUrl() {
  // 本番URLを最優先（ここが無難）
  const prod = process.env.NEXT_PUBLIC_SITE_URL;
  if (prod) return prod.replace(/\/$/, "");

  // 次点：Vercel が用意する URL（preview等）
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  // ローカル
  return "http://localhost:3000";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  // 期限内のスレだけ載せる（いらんなら where 消してOK）
  const threads = await prisma.thread.findMany({
    where: { expiresAt: { gt: now } },
    select: {
      id: true,
      lastActivityAt: true,
      createdAt: true,
    },
    orderBy: { lastActivityAt: "desc" },
    take: 5000,
  });

  const items: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    ...threads.map((t) => ({
      url: `${baseUrl}/t/${t.id}`,
      lastModified: t.lastActivityAt ?? t.createdAt,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    })),
  ];

  return items;
}