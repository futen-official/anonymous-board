"use client";

import { useEffect, useMemo, useState } from "react";
import { PostList } from "@/components/PostList";
import { PostComposer } from "@/components/PostComposer";

type ApiOk = {
  ok: true;
  thread: {
    id: string;
    title: string;
    createdAt: string;
    expiresAt: string;
    lastActivityAt: string;
    lastGhostAt: string | null;
  };
  posts: Array<{
    id: string;
    content: string;
    authorType: "user" | "ai";
    createdAt: string;
    expiresAt: string;
    isGhost: boolean;
  }>;
};

type ApiNg = { ok: false; message: string };
type ApiRes = ApiOk | ApiNg;
type Post = ApiOk["posts"][number];

function formatJst(iso: string) {
  return new Date(iso).toLocaleString();
}

export function ThreadClient({ threadId }: { threadId: string }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);

  const remainText = useMemo(() => {
    if (!expiresAt) return "";
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return "まもなく消える";
    const hr = Math.floor(diff / (1000 * 60 * 60));
    const min = Math.floor((diff / (1000 * 60)) % 60);
    return hr > 0 ? `あと ${hr}時間` : `あと ${min}分`;
  }, [expiresAt]);

  async function refresh() {
    setErr(null);
    try {
      const res = await fetch(`/api/threads/${threadId}`, { cache: "no-store" });
      const data = (await res.json()) as ApiRes;

      if (!data.ok) throw new Error(data.message);

      setTitle(data.thread.title);
      setExpiresAt(data.thread.expiresAt);
      setPosts(data.posts);
    } catch (e: any) {
      setErr(e?.message ?? "読み込み失敗");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* タイトル + 期限 */}
      <section className="whiteBox">
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.2 }}>
            {title || "…"}
          </div>

          <div
            style={{
              fontSize: 12,
              opacity: 0.8,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span>{remainText}</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>消える予定: {expiresAt ? formatJst(expiresAt) : "…"}</span>
          </div>
        </div>
      </section>

      {/* 投稿一覧 */}
      <section className="whiteBox">
        {loading ? (
          <div style={{ opacity: 0.75, fontSize: 13 }}>読み込み中…</div>
        ) : err ? (
          <div style={{ opacity: 0.9, fontSize: 13 }}>{err}</div>
        ) : posts.length === 0 ? (
          <div style={{ opacity: 0.75, fontSize: 13 }}>まだ投稿がない。</div>
        ) : (
          <PostList posts={posts} />
        )}
      </section>

      {/* 追加投稿（下） */}
      <section className="whiteBox">
        <PostComposer threadId={threadId} onPosted={refresh} />
      </section>
    </div>
  );
}