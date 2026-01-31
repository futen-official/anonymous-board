"use client";

import { useState } from "react";

type ApiOk = { ok: true };
type ApiNg = { ok: false; message: string };
type ApiRes = ApiOk | ApiNg;

type Props = {
  threadId: string;
  onPosted: () => void;
};

export function PostComposer({ threadId, onPosted }: Props) {
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (busy) return;
    setErr(null);

    const c = content.trim();
    if (!c) return;

    try {
      setBusy(true);
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ threadId, content: c }),
      });

      const data = (await res.json()) as ApiRes;
      if (!data.ok) throw new Error(data.message);

      setContent("");
      onPosted();
    } catch (e: any) {
      setErr(e?.message ?? "投稿失敗");
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="composer">
      <textarea
        className="composerTextarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="ここに書く"
        rows={4}
        maxLength={2000}
      />

      {err && <div className="composerError">{err}</div>}

      <button className="composerBtn" onClick={submit} disabled={busy}>
        {busy ? "送信中…" : "送信"}
      </button>
    </div>
  );
}