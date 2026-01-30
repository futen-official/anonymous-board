// src/components/ThreadList.tsx
"use client";

import Link from "next/link";

export type Thread = {
  id: string;
  title: string;
  createdAt: string | Date;
  expiresAt: string | Date;
  _count?: {
    posts: number;
  };
};

function formatRemaining(expiresAt: string | Date) {
  const d = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return "まもなく消える";

  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff / (1000 * 60)) % 60);

  return h > 0 ? `あと ${h}時間` : `あと ${m}分`;
}

export function ThreadList({ threads }: { threads: Thread[] }) {
  if (!threads || threads.length === 0) {
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
        まだスレッドがない。
      </div>
    );
  }

  return (
    <section style={{ display: "grid", gap: 14 }}>
      {threads.map((t) => {
        const posts = t._count?.posts ?? 0;

        return (
          <Link
            key={t.id}
            href={`/t/${t.id}`}
            style={{
              display: "block",
              textDecoration: "none",
              color: "#fff",
              background: "#000",
              border: "3px solid #fff",
              borderRadius: 22,
              padding: 18,
            }}
          >
            <div style={{ display: "grid", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    letterSpacing: -0.2,
                  }}
                >
                  {t.title}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "2px solid #fff",
                    opacity: 0.9,
                  }}
                >
                  {posts} posts
                </div>
              </div>

              <div
                style={{
                  fontSize: 12,
                  opacity: 0.75,
                  display: "flex",
                  gap: 10,
                }}
              >
                <span>{formatRemaining(t.expiresAt)}</span>
                <span style={{ opacity: 0.4 }}>•</span>
                <span>
                  {new Date(t.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </section>
  );
}