// src/components/PostList.tsx
import { PostItem } from "@/components/PostItem";
import type { Post } from "@/lib/mock";

export function PostList({ posts }: { posts: Post[] }) {
  if (!posts || posts.length === 0) {
    return (
      <div
        style={{
          border: "2px dashed rgba(255,255,255,0.4)",
          borderRadius: 18,
          padding: 20,
          color: "#fff",
          opacity: 0.7,
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