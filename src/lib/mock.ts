export type Thread = {
  id: string;
  title: string;
  createdAt: string; // ISO
};

export type Post = {
  id: string;
  threadId: string;
  content: string;
  createdAt: string; // ISO
};

export const threads: Thread[] = [
  { id: "1", title: "雑談スレ", createdAt: "2026-01-22T00:00:00.000Z" },
  { id: "2", title: "筋トレスレ", createdAt: "2026-01-22T01:00:00.000Z" },
  { id: "3", title: "開発ログスレ", createdAt: "2026-01-22T02:00:00.000Z" }
];

export const posts: Post[] = [
  { id: "p1", threadId: "1", content: "匿名掲示板って結局どんな空気が正義なん？", createdAt: "2026-01-22T00:10:00.000Z" },
  { id: "p2", threadId: "1", content: "荒れる前提で防御から作るのが大事やと思う", createdAt: "2026-01-22T00:12:00.000Z" },
  { id: "p3", threadId: "1", content: "まずは最小で動かしてからやな", createdAt: "2026-01-22T00:15:00.000Z" },
  { id: "p4", threadId: "2", content: "ベンチの停滞どう突破する？", createdAt: "2026-01-22T01:10:00.000Z" },
  { id: "p5", threadId: "2", content: "まず回復と痛みゼロ確認から", createdAt: "2026-01-22T01:14:00.000Z" },
  { id: "p6", threadId: "3", content: "UI骨格できた。次DBや。", createdAt: "2026-01-22T02:10:00.000Z" }
];

export function getThreadById(id: string) {
  return threads.find((t) => t.id === id) ?? null;
}

export function getPostsByThreadId(threadId: string) {
  return posts
    .filter((p) => p.threadId === threadId)
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getPostsCountByThreadId(threadId: string) {
  return posts.filter((p) => p.threadId === threadId).length;
}