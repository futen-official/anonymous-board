"use client";

import { useState } from "react";

type ApiOk = { ok: true; thread: { id: string } };
type ApiNg = { ok: false; message: string };
type ApiRes = ApiOk | ApiNg;

export function CreateThreadForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    setErr(null);

    const t = title.trim();
    const c = content.trim();
    if (!t) return setErr("タイトルを入れて");
    if (!c) return setErr("一投稿目を書いて");

    try {
      setBusy(true);

      // スレ作成（タイトル + 一投稿目）
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: t, firstPost: c }),
      });

      const data = (await res.json()) as ApiRes;

      if (!data.ok) {
        throw new Error(data.message);
      }

      // 作成したスレへ遷移
      window.location.href = `/t/${data.thread.id}`;
    } catch (e: any) {
      setErr(e?.message ?? "エラー");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="field">
        <div className="label">タイトル</div>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：今日だるい"
          maxLength={80}
        />
      </div>

      <div className="field">
        <div className="label">一投稿目</div>
        <textarea
          className="textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="ここに書く"
          rows={5}
          maxLength={2000}
        />
      </div>

      {err && <div className="error">{err}</div>}

      <button className="btn" type="submit" disabled={busy}>
        {busy ? "作成中…" : "スレ立て"}
      </button>
    </form>
  );
}