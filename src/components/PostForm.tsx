"use client";

import { useState } from "react";

function humanizeError(code: string) {
  switch (code) {
    case "content_empty":
      return "本文が空やで";
    case "thread_not_found":
      return "このスレはもう消えたっぽい（24時間ルール）";
    case "expired":
      return "期限切れで書き込めへん（もうすぐ消えるやつ）";
    case "network_error":
      return "通信エラー。電波かサーバーが死んでるかも";
    default:
      return `失敗: ${code}`;
  }
}

export function PostForm({ threadId }: { threadId: string }) {
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "100%",
    display: "block",
    boxSizing: "border-box",

    padding: "14px 16px",
    borderRadius: 18,

    background: "#000",
    color: "#fff",

    fontSize: "var(--size-ui)",
    fontWeight: "var(--font-ui)",
    outline: "none",

    boxShadow: `
      0 0 0 2px rgba(255,255,255,0.35),
      inset 0 0 0 1px rgba(255,255,255,0.15)
    `,
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    const c = content.trim();
    if (!c) return;

    setBusy(true);
    setError(null);

    try {
      const res = await fetch(`/api/threads/${threadId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: c }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        setError(humanizeError(String(data?.error ?? `failed_${res.status}`)));
        return;
      }

      // ✅ 成功：入力クリア
      setContent("");

      // ✅ 今の構成なら確実に反映
      location.reload();
    } catch {
      setError(humanizeError("network_error"));
    } finally {
      setBusy(false);
    }
  }

  const canSubmit = !!content.trim() && !busy;

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="思ったことをそのまま書いていい"
        rows={4}
        style={{
          ...fieldStyle,
          lineHeight: 1.6,
          resize: "vertical",
          opacity: busy ? 0.85 : 1,
        }}
        disabled={busy}
      />

      {error && (
        <div
          style={{
            fontSize: 12,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.8)",
            padding: "10px 12px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.06)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        style={{
          padding: "12px 16px",
          borderRadius: 18,
          background: "#000",
          color: "#fff",

          fontSize: "var(--size-ui)",
          fontWeight: "var(--font-ui)",
          letterSpacing: 0.2,

          cursor: canSubmit ? "pointer" : "not-allowed",
          opacity: canSubmit ? 1 : 0.4,

          boxShadow: `
            0 0 0 2px rgba(255,255,255,0.45),
            0 12px 30px rgba(255,255,255,0.12)
          `,
        }}
      >
        {busy ? "送信中…" : "書き込む"}
      </button>
    </form>
  );
}