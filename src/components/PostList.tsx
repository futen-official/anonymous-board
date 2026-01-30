import { Post } from "@/lib/mock";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {posts.map((p, idx) => (
        <div
          key={p.id}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 12
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>#{idx + 1}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{formatDate(p.createdAt)}</div>
          </div>
          <div style={{ whiteSpace: "pre-wrap", marginTop: 8, lineHeight: 1.6 }}>{p.content}</div>
        </div>
      ))}
    </div>
  );
}