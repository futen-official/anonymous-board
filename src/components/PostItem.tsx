// src/components/PostItem.tsx
"use client";

import React from "react";

export type AuthorType = "user" | "ai";

export type Post = {
  id: string;
  content: string;
  authorType: AuthorType;
  createdAt: string | Date;
  isGhost?: boolean;
};

type Props = {
  post: Post;
};

function formatTime(value: string | Date) {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export function PostItem({ post }: Props) {
  return (
    <div
      style={{
        border: "3px solid #fff",
        borderRadius: 22,
        padding: 16,
        background: "#000",
        color: "#fff",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      <div style={{ fontSize: 14, lineHeight: 1.7 }}>{post.content}</div>

      <div
        style={{
          marginTop: 10,
          fontSize: 12,
          opacity: 0.65,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span>{formatTime(post.createdAt)}</span>
        {/* authorType / ghost表示は出さない（要望） */}
      </div>
    </div>
  );
}