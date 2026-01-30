import Link from "next/link";

type Props = {
  id: string;
  title: string;
  createdAt: Date | string;
  postsCount: number;
};

function formatRelative(date: Date) {
  const diff = Date.now() - date.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}秒前`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}分前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}時間前`;
  const day = Math.floor(hr / 24);
  return `${day}日前`;
}

export function ThreadCard({ id, title, createdAt, postsCount }: Props) {
  const d = createdAt instanceof Date ? createdAt : new Date(createdAt);

  return (
    <Link href={`/t/${id}`} className="card">
      <div className="cardTop">
        <div className="cardTitle">{title}</div>
        <div className="pill">{postsCount} posts</div>
      </div>

      <div className="metaRow">
        <span>🕒 {formatRelative(d)}</span>
        <span style={{ opacity: 0.35 }}>•</span>
        <span>{d.toLocaleString()}</span>
      </div>
    </Link>
  );
}
