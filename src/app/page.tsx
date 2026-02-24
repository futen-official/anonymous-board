import Link from "next/link";
import { Container } from "@/components/Container";
import { CreateThreadForm } from "@/components/CreateThreadForm";
import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** 残り時間表示 */
function formatRemaining(expiresAt: Date) {
  const diff = expiresAt.getTime() - Date.now();
  if (diff <= 0) return "まもなく消える";

  const hr = Math.floor(diff / (1000 * 60 * 60));
  const min = Math.floor((diff / (1000 * 60)) % 60);

  if (hr > 0) return `あと ${hr}時間`;
  return `あと ${min}分`;
}

export default async function HomePage() {
  // ✅ 常に最新取得（キャッシュ事故防止）
  noStore();

  const now = new Date();

  // ✅ ここで deleteMany しない（DB不調でトップが死ぬのを防ぐ）
  // 期限切れは表示から除外するだけにする
  let threads: Array<{
    id: string;
    title: string;
    createdAt: Date;
    expiresAt: Date;
    _count: { posts: number };
  }> = [];

  let dbError: string | null = null;

  try {
    threads = await prisma.thread.findMany({
      where: { expiresAt: { gt: now } },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { posts: true } } },
    });
  } catch (e) {
    dbError = e instanceof Error ? e.message : "DB error";
    threads = [];
  }

  return (
    <Container>
      {/* ===== タイトル枠 ===== */}
      <header
        style={{
          border: "3px solid #fff",
          borderRadius: 22,
          paddingTop: 12,
          paddingRight: 20,
          paddingBottom: 18,
          paddingLeft: 20,
          marginBottom: 24,
          background: "#000",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: -0.4,
            color: "#fff",
            lineHeight: 1.15,
          }}
        >
          匿名掲示板
        </h1>

        <div
          style={{
            marginTop: 6,
            fontSize: 14,
            opacity: 0.75,
            color: "#fff",
          }}
        >
          誰にも監視されない。24時間で消える。
        </div>
      </header>

      {/* ===== 新規スレッド枠 ===== */}
      <section
        style={{
          border: "3px solid #fff",
          borderRadius: 22,
          padding: 20,
          marginBottom: 28,
          background: "#000",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            marginBottom: 14,
            color: "#fff",
          }}
        >
          新規スレッド
        </div>

        <CreateThreadForm />

        <div
          style={{
            marginTop: 14,
            fontSize: 12,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          ※ この掲示板は、思ったことを自由に残すための場所です。<br />
          誰かを攻撃したり、傷つける目的での利用はしないでください。
        </div>
      </section>

      {/* ===== DBエラー表示（落とさない） ===== */}
      {dbError && (
        <div
          style={{
            border: "2px dashed rgba(255,255,255,0.4)",
            borderRadius: 18,
            padding: 16,
            color: "#fff",
            opacity: 0.85,
            background: "#000",
            marginBottom: 14,
          }}
        >
          DBに接続できないみたい。環境変数 or Neon 側を確認してな。
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
            {dbError}
          </div>
        </div>
      )}

      {/* ===== スレ一覧 ===== */}
      <section style={{ display: "grid", gap: 14 }}>
        {threads.length === 0 ? (
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
        ) : (
          threads.map((t) => {
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
                  transition: "transform 120ms ease, box-shadow 120ms ease",
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
                    <span>{formatRemaining(new Date(t.expiresAt))}</span>
                    <span style={{ opacity: 0.4 }}>•</span>
                    <span>{new Date(t.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <style>{`
                  a[href="/t/${t.id}"]:hover {
                    box-shadow: 0 12px 32px rgba(255,255,255,0.25);
                    transform: translateY(-2px);
                  }
                  a[href="/t/${t.id}"]:active {
                    transform: translateY(0);
                    box-shadow: 0 6px 16px rgba(255,255,255,0.2);
                  }
                `}</style>
              </Link>
            );
          })
        )}
      </section>
    </Container>
  );
}