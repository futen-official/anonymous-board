"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PostList } from "@/components/PostList";
import { PostComposer } from "@/components/PostComposer";

/** ===== 表示用の型（UIで必要な分だけ） ===== */
export type AuthorType = "user" | "ai";

export type Post = {
  id: string;
  content: string;
  authorType: AuthorType;
  createdAt: string; // ISO
  isGhost: boolean;
};

type ApiOk = {
  ok: true;
  thread: {
    id: string;
    title: string;
    expiresAt: string; // ISO
  };
  posts: Post[];
};

type ApiNg = {
  ok: false;
  error: string;
};

type ApiRes = ApiOk | ApiNg;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function formatRemaining(expiresAtIso: string) {
  const diff = new Date(expiresAtIso).getTime() - Date.now();
  if (diff <= 0) return "まもなく消える";

  const hr = Math.floor(diff / (1000 * 60 * 60));
  const min = Math.floor((diff / (1000 * 60)) % 60);
  if (hr > 0) return `消える予定: あと ${hr}時間`;
  return `消える予定: あと ${min}分`;
}

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  return "unknown error";
}

export default function ThreadClient({ threadId }: { threadId: string }) {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [err, setErr] = useState<string>("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const sortedPosts = useMemo(() => {
    // createdAt昇順（古い→新しい）で表示
    return [...posts].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [posts]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchThread = useCallback(async () => {
    setErr("");
    setLoading(true);
    try {
      const res = await fetch(`/api/threads/${threadId}`, { method: "GET" });
      const data = (await res.json()) as ApiRes;

      // ✅ これでTSも100%理解する
      if ("error" in data) {
        throw new Error(data.error);
      }

      setTitle(data.thread.title);
      setExpiresAt(data.thread.expiresAt);
      setPosts(data.posts);
    } catch (e) {
      console.error(e);
      setErr(`読み込み失敗: ${getErrorMessage(e)}`);
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  useEffect(() => {
    if (!loading) scrollToBottom();
  }, [loading, scrollToBottom, posts.length]);

  const handlePosted = useCallback(
    (post: Post) => {
      setPosts((prev) => [...prev, post]);
      setTimeout(scrollToBottom, 0);
    },
    [scrollToBottom]
  );

  return (
    <div className="page">
      <div className="container">
        {/* ===== タイトル枠（Homeと同じ幅） ===== */}
        <header className="box">
          <div className="rowBetween">
            <h1 className="h1">{title || "…"}</h1>
            {expiresAt ? <div className="pill">{formatRemaining(expiresAt)}</div> : null}
          </div>
          <div className="sub">{expiresAt ? `最終期限: ${formatDate(expiresAt)}` : ""}</div>
        </header>

        {/* ===== 本文枠 ===== */}
        <section className="box" style={{ marginTop: 18 }}>
          {loading ? (
            <div className="muted">読み込み中…</div>
          ) : err ? (
            <div className="muted">{err}</div>
          ) : sortedPosts.length === 0 ? (
            <div className="muted">まだ投稿がない。</div>
          ) : (
            <PostList posts={sortedPosts} />
          )}

          <div ref={bottomRef} />
        </section>

        {/* ===== 書き込み欄：一番下 ===== */}
        <div style={{ marginTop: 18 }}>
          <PostComposer threadId={threadId} onPosted={handlePosted} />
        </div>
      </div>
    </div>
  );
}