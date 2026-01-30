"use client";

import { useEffect, useMemo, useState } from "react";
import { PostComposer } from "@/components/PostComposer";
import { PostList } from "@/components/PostList";
import type { ApiRes, Post } from "@/lib/mock";

type Props = {
  threadId: string;
};

function toISO(v: unknown): string {
  if (!v) return new Date().toISOString();
  if (typeof v === "string") return v;
  try {
    return new Date(v as any).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function normalizePosts(raw: any[]): Post[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((p) => ({
    id: String(p.id),
    threadId: p.threadId ? String(p.threadId) : undefined, // 無くてもOK
    content: String(p.content ?? ""),
    authorType: p.authorType === "ai" ? "ai" : "user",
    createdAt: toISO(p.createdAt),
    expiresAt: p.expiresAt ? String(p.expiresAt) : null,
    isGhost: Boolean(p.isGhost),
  }));
}

export default function ThreadClient({ threadId }: Props) {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [err, setErr] = useState<string>("");

  const expiresText = useMemo(() => {
    if (!expiresAt) return "";
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (Number.isNaN(diff)) return "";
    if (diff <= 0) return "まもなく消える";
    const hr = Math.floor(diff / (1000 * 60 * 60));
    const min = Math.floor((diff / (1000 * 60)) % 60);
    if (hr > 0) return `消える予定: あと ${hr}時間`;
    return `消える予定: あと ${min}分`;
  }, [expiresAt]);

  async function load() {
    setErr("");
    try {
      const res = await fetch(`/api/threads/${threadId}`, { cache: "no-store" });
      const data = (await res.json()) as ApiRes | any;

      if (!data || data.ok !== true) {
        const msg =
          (data && typeof data === "object" && "error" in data && (data as any).error) ||
          (data && typeof data === "object" && "message" in data && (data as any).message) ||
          "読み込みに失敗しました";
        throw new Error(String(msg));
      }

      setTitle(String(data.thread.title ?? ""));
      setExpiresAt(String(data.thread.expiresAt ?? ""));
      setPosts(normalizePosts(data.posts));
    } catch (e: any) {
      setErr(e?.message ?? "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // 3秒おきに更新（軽め）
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  // 送信後にすぐ下まで更新されるようにする
  async function onPosted() {
    await load();
    requestAnimationFrame(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }));
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* ===== タイトル枠（新規スレと同じ白枠） ===== */}
      <header
        style={{
          border: "3px solid #fff",
          borderRadius: 22,
          padding: 20,
          background: "#000",
        }}
      >
        <div style={{ display: "grid", gap: 6 }}>
          <div
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: -0.2,
              color: "#fff",
            }}
          >
            {loading ? "読み込み中…" : title || "スレッド"}
          </div>

          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            {expiresText}
          </div>

          {err ? (
            <div style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
              読み込み失敗: {err}
            </div>
          ) : null}
        </div>
      </header>

      {/* ===== 投稿一覧 ===== */}
      <section
        style={{
          border: "3px solid #fff",
          borderRadius: 22,
          padding: 20,
          background: "#000",
          display: "grid",
          gap: 14,
        }}
      >
        <PostList posts={posts} />
      </section>

      {/* ===== 書き込み欄（最下部） ===== */}
      <section
        style={{
          border: "3px solid #fff",
          borderRadius: 22,
          padding: 20,
          background: "#000",
        }}
      >
        <PostComposer threadId={threadId} onPosted={onPosted} />
      </section>
    </div>
  );
}