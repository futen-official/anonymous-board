// src/components/PostList.tsx
"use client";

import React from "react";
import { PostItem, type Post } from "@/components/PostItem";

type Props = {
  posts: Post[];
};

export function PostList({ posts }: Props) {
  if (!posts || posts.length === 0) {
    return (
      <div
        style={{
          border: "2px dashed rgba(255,255,255,0.4)",
          borderRadius: 18,
          padding: 20,
          color: "#fff",
          opacity: 0.7,
          background: "#000",
        }}
      >
        まだ投稿がない。
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {posts.map((p) => (
        <PostItem key={p.id} post={p} />
      ))}
    </div>
  );
}