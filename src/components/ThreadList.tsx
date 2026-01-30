import Link from "next/link";
import { Thread, getPostsCountByThreadId } from "@/lib/mock";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export function ThreadList({ threads }: { threads: Thread[] }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {threads.map((t) => {
        const count = getPostsCountByThreadId(t.id);
        return (
          <Link
            key={t.id}
            href={`/t/${t.id}`}
            style={{
              display: "block",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 14,
              textDecoration: "none",
              color: "inherit"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{t.title}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{count} posts</div>
            </div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>created: {formatDate(t.createdAt)}</div>
          </Link>
        );
      })}
    </div>
  );
}