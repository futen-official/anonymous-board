// src/lib/ghostEngine.ts
export type AuthorType = "user" | "ai";

export type Msg = {
  authorType: AuthorType;
  content: string;
  isGhost?: boolean;
  createdAt?: Date;
};

type Args = {
  threadTitle: string;
  recentMessages: Msg[];
  lastUserMessage: string;
  recentGhostTexts: string[];
  threadIdSeed: string; // threadId
};

const normalize = (s: string) =>
  s
    .replace(/\s+/g, " ")
    .replace(/[「」『』（）()【】]/g, "")
    .trim()
    .toLowerCase();

const hash32 = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const pickIndex = (seed: string, mod: number) => hash32(seed) % mod;

const POOL: string[] = [
  "水をひと口。次の5分だけ決めよか。立つ/座る/寝たまま、どれが一番マシ？",
  "今日の残り、何を捨てる？ “やる”より“やらない”を1個決めよ。",
  "深呼吸3回だけでいい。で、いま一番しんどいのは体？気分？予定？",
  "肩を10回まわす。終わったら、今日の最低ラインを1個だけ置こう。",
  "窓を少し開ける→水飲む。ここまででOK。次、何を後回しにする？",
  "座ったままでいい。首を左右にゆっくり3回。いま一番重いタスクはどれ？",
  "1分だけ片付け。机の上の“ゴミ1個”捨てて終わり。今日の勝ちにしよ。",
  "顔洗うか歯磨き。どっちか一個だけ。で、次の一手は何にする？",
  "スマホ置いて10秒だけ目閉じよ。いま“やらんでええ事”はどれ？",
  "一番軽い行動でいい。立てる？無理なら座って背中伸ばすだけでOK。",
];

export function buildGhostText(args: Args): string {
  const { threadTitle, recentMessages, lastUserMessage, recentGhostTexts, threadIdSeed } = args;

  // 直近のAI/ghostの文（重複回避）
  const recentTexts = new Set(
    recentMessages
      .filter((m) => m.authorType === "ai")
      .map((m) => normalize(m.content))
  );

  const recentGhostSet = new Set(recentGhostTexts.map(normalize));

  // 日ごとに少し変わるseed（でも“変なghost感”は出さない）
  const dayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const seedBase =
    threadIdSeed +
    "|" +
    dayKey +
    "|" +
    normalize(threadTitle) +
    "|" +
    normalize(lastUserMessage);

  // まず seed から候補を回す
  for (let i = 0; i < POOL.length; i++) {
    const idx = pickIndex(seedBase + "|" + i, POOL.length);
    const candidate = POOL[idx];

    const n = normalize(candidate);
    if (recentTexts.has(n)) continue;
    if (recentGhostSet.has(n)) continue;

    return candidate;
  }

  // 全部被ったら：最後の手段（少しだけ言い回し替える）
  const fallbackIdx = pickIndex(seedBase + "|fallback", POOL.length);
  const base = POOL[fallbackIdx];

  // 同じ意味のまま軽く変形（UIでghost感は出さない）
  return base.replace("次の5分だけ決めよか", "次の一手だけ決めよか");
}