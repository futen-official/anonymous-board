"use client";

import { useState } from "react";

type Props = {
  threadId: string;
  onPosted?: () => void;
};

export function PostComposer({ threadId, onPosted }: Props) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    const text = content.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    setErr(null);

    try {
      const res = await fetch(`/api/threads/${threadId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      // JSONの型は信用しない（ここが核）
      const data: unknown = await res.json();

      // ★ここで "error を持つか" で分岐する（ApiResがどう定義されてても通る）
      if (
        !data ||
        typeof data !== "object" ||
        ("ok" in data && (data as any).ok === false) ||
        "error" in (data as any)
      ) {
        const msg =
          (data as any)?.error ||
          (data as any)?.message ||
          "投稿に失敗しました";
        setErr(String(msg));
        return;
      }

      // ok=true想定
      setContent("");
      onPosted?.();
    } catch {
      setErr("通信エラー：もう一回やってみて");
    } finally {
      setSubmitting(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="書き込む"
        rows={3}
        style={{
          width: "100%",
          resize: "vertical",
          padding: 14,
          borderRadius: 16,
          border: "3px solid #fff",
          background: "#000",
          color: "#fff",
          outline: "none",
          lineHeight: 1.6,
          fontSize: 14,
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div
          style={{
            minHeight: 18,
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          {err ?? ""}
        </div>

        <button
          onClick={submit}
          disabled={submitting || content.trim().length === 0}
          style={{
            border: "3px solid #fff",
            background: submitting ? "rgba(255,255,255,0.12)" : "#000",
            color: "#fff",
            borderRadius: 999,
            padding: "10px 14px",
            fontWeight: 800,
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.7 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {submitting ? "送信中" : "送信"}
        </button>
      </div>
    </div>
  );
}