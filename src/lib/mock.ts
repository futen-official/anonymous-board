// src/lib/mock.ts
export type AuthorType = "user" | "ai";

/**
 * UIで必要な最小のPost型。
 * APIが threadId を返さない実装でも通るように threadId は optional。
 */
export type Post = {
  id: string;
  threadId?: string; // ← ★ここがポイント（必須にしない）
  content: string;
  authorType: AuthorType;
  createdAt: string; // ISO文字列で統一（DBでもJSONでも事故らない）
  expiresAt?: string | null;
  isGhost: boolean;
};

export type Thread = {
  id: string;
  title: string;
  expiresAt: string; // ISO
};

export type ApiOk = {
  ok: true;
  thread: Thread;
  posts: Post[];
};

export type ApiNg = {
  ok: false;
  error: string;
};

export type ApiRes = ApiOk | ApiNg;