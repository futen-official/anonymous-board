import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://anonymous-board-6zvjltxba-futen-officials-projects.vercel.app";
// ↑ ここは後で独自ドメインに変えればOK

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 生きてるスレだけ
  const threads = await prisma.thread.findMany({
    where: {
      expiresAt: {
        gt: now,
      },
    },
    select: {
      id: true,
      lastActivityAt: true,
    },
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
  ];

  const threadPages: MetadataRoute.Sitemap = threads.map((t) => ({
    url: `${BASE_URL}/t/${t.id}`,
    lastModified: t.lastActivityAt,
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  return [...staticPages, ...threadPages];
}