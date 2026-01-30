"use client";

import { useState } from "react";

type ApiOk = { ok: true; threadId: string };
type ApiNg = { ok: false; error: string };
type ApiRes = ApiOk | ApiNg;

// ★ 型ガード（これで確実に絞れる）
function isNg(data: ApiRes): data is ApiNg {
  return data.ok === false;
}

export function CreateThreadForm() {
  const [title, setTitle] = useState("");
  const [firstPost, setFirstPost] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const t = title.trim();
    const p = firstPost.trim();
    if (!t || !p) return;

    try {
      setLoading(true);

      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: t, firstPost: p }),
      });

      const data = (await res.json()) as ApiRes;

      if (isNg(data)) {
        // ★ここは確実に ApiNg
        throw new Error(data.error);
      }

      // ★ここは確実に ApiOk
      window.location.href = `/t/${data.threadId}`;
    } catch (err) {
      alert(err instanceof Error ? err.message : "作成に失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <input
        className="input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="スレのタイトル"
        maxLength={60}
      />

      <textarea
        className="textarea"
        value={firstPost}
        onChange={(e) => setFirstPost(e.target.value)}
        placeholder="一投稿目（本文）"
        maxLength={1000}
      />

      <button
        className="btn"
        disabled={loading || !title.trim() || !firstPost.trim()}
      >
        {loading ? "作成中..." : "スレ立て"}
      </button>
    </form>
  );
}