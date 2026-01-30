import Link from "next/link";
import { Container } from "@/components/Container";
import { CreateThreadForm } from "@/components/CreateThreadForm";
import { prisma } from "@/lib/prisma";

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
  const now = new Date();

  // 期限切れ削除（Home表示タイミングで清掃）
  await prisma.post.deleteMany({ where: { expiresAt: { lte: now } } });
  await prisma.thread.deleteMany({ where: { expiresAt: { lte: now } } });

  const threads = await prisma.thread.findMany({
    where: { expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <Container>
      {/* タイトル枠 */}
      <header className="card">
        <h1 className="h1">匿名掲示板</h1>
        <div className="sub">誰にも監視されない。24時間で消える。</div>
      </header>

      <div style={{ height: 24 }} />

      {/* 新規スレ枠 */}
      <section className="card">
        <div className="sectionTitle">新規スレッド</div>
        <CreateThreadForm />
        <div className="help">
          ※ この掲示板は、思ったことを自由に残すための場所です。<br />
          誰かを攻撃したり、傷つける目的での利用はしないでください。
        </div>
      </section>

      <div style={{ height: 28 }} />

      {/* スレ一覧 */}
      <section className="stack">
        {threads.length === 0 ? (
          <div className="empty">まだスレッドがない。</div>
        ) : (
          threads.map((t) => {
            const posts = t._count.posts ?? 0;
            return (
              <Link key={t.id} href={`/t/${t.id}`} className="threadLink">
                <div className="card">
                  <div className="row">
                    <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.2 }}>
                      {t.title}
                    </div>
                    <div className="badge">{posts} posts</div>
                  </div>

                  <div className="meta" style={{ marginTop: 10 }}>
                    <span>{formatRemaining(new Date(t.expiresAt))}</span>
                    <span className="dot">•</span>
                    <span>{new Date(t.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </section>
    </Container>
  );
}