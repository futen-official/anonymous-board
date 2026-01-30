"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PostComposer } from "@/components/PostComposer";

type ApiOk = {
  ok: true;
  thread: { id: string; title: string; expiresAt: string };
  posts: { id: string; content: string; createdAt: string; isGhost: boolean }[];
};

type ApiNg = { ok: false; error: string };

function formatRemainingIso(expiresAtIso: string) {
  const expiresAt = new Date(expiresAtIso);
  const diff = expiresAt.getTime() - Date.now();
  if (diff <= 0) return "まもなく消える";

  const hr = Math.floor(diff / (1000 * 60 * 60));
  const min = Math.floor((diff / (1000 * 60)) % 60);
  if (hr > 0) return `あと ${hr}時間`;
  return `あと ${min}分`;
}

export default function ThreadClient({ threadId }: { threadId: string }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [posts, setPosts] = useState<ApiOk["posts"]>([]);

  const remaining = useMemo(() => {
    if (!expiresAt) return "";
    return formatRemainingIso(expiresAt);
  }, [expiresAt]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch(`/api/threads/${threadId}`, { cache: "no-store" });
      const data = (await res.json()) as ApiOk | ApiNg;

      if (!data.ok) throw new Error(data.error);

      setTitle(data.thread.title);
      setExpiresAt(data.thread.expiresAt);
      setPosts(data.posts);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "読み込み失敗");
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      {/* 上：スレヘッダー（新規スレページと同じ白枠幅＝Container統一） */}
      <section className="card">
        <div className="threadHeader">
          <div>
            <h1 className="threadTitle">{title || "…"}</h1>
            <div className="kv">
              <span>消える予定: {remaining || "…"}</span>
            </div>
          </div>

          <Link href="/" className="badge">
            戻る
          </Link>
        </div>

        {loading && <div className="notice">読み込み中…</div>}
        {err && <div className="notice">読み込み失敗: {err}</div>}
      </section>

      <div style={{ height: 18 }} />

      {/* 中：投稿一覧 */}
      <section className="card">
        {posts.length === 0 ? (
          <div className="empty">まだ投稿がない。</div>
        ) : (
          <div className="postList">
            {posts.map((p) => (
              <div key={p.id} className="postItem">
                <div className="postText">{p.content}</div>
                <div className="postTime">{new Date(p.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div style={{ height: 18 }} />

      {/* 下：入力フォーム（★最下部） */}
      <section className="card">
        <PostComposer threadId={threadId} onPosted={load} />
      </section>
    </>
  );
}