"use client";

import { useState } from "react";
import type { Post } from "@/app/t/[id]/thread-client";

/** ===== API型 ===== */
type ApiOk = {
  ok: true;
  post: Post;
};

type ApiNg = {
  ok: false;
  error: string;
};

type ApiRes = ApiOk | ApiNg;

type Props = {
  threadId: string;
  onPosted: (post: Post) => void;
};

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  return "unknown error";
}

export function PostComposer({ threadId, onPosted }: Props) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  async function submit() {
    const text = content.trim();
    if (!text) return;

    setSending(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ threadId, content: text }),
      });

      const data = (await res.json()) as ApiRes;

      // ✅ TSが100%理解できる判別（これが一番堅い）
      if ("error" in data) {
        throw new Error(data.error);
      }

      onPosted(data.post);
      setContent("");
    } catch (e) {
      console.error(e);
      alert(`投稿に失敗した: ${getErrorMessage(e)}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      style={{
        border: "3px solid #fff",
        borderRadius: 22,
        padding: 16,
        background: "#000",
      }}
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder="書き込む"
        style={{
          width: "100%",
          background: "#000",
          color: "#fff",
          border: "2px solid #fff",
          borderRadius: 12,
          padding: 10,
          resize: "vertical",
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />

      <button
        onClick={submit}
        disabled={sending}
        style={{
          marginTop: 10,
          width: "100%",
          padding: "10px 0",
          borderRadius: 999,
          border: "2px solid #fff",
          background: "#000",
          color: "#fff",
          fontWeight: 800,
          opacity: sending ? 0.5 : 1,
        }}
      >
        送信
      </button>
    </div>
  );
}