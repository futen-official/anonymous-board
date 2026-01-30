function normalize(s: string) {
  return (s ?? "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[　]/g, "")
    .replace(/[。、．，！!？?（）()\[\]「」『』"“”'’：:;；…\-—_]/g, "");
}

// 日本語でも効く：文字2-gramのDice係数
export function diceSimilarity(a: string, b: string) {
  const A = normalize(a);
  const B = normalize(b);
  if (!A || !B) return 0;
  if (A === B) return 1;

  const grams = (x: string) => {
    const arr: string[] = [];
    for (let i = 0; i < x.length - 1; i++) arr.push(x.slice(i, i + 2));
    return arr;
  };

  const gA = grams(A);
  const gB = grams(B);
  if (gA.length === 0 || gB.length === 0) return 0;

  const map = new Map<string, number>();
  for (const g of gA) map.set(g, (map.get(g) ?? 0) + 1);

  let inter = 0;
  for (const g of gB) {
    const n = map.get(g) ?? 0;
    if (n > 0) {
      inter++;
      map.set(g, n - 1);
    }
  }

  return (2 * inter) / (gA.length + gB.length);
}

export function isTooSimilar(candidate: string, recentAi: string[], threshold = 0.78) {
  return recentAi.some((x) => diceSimilarity(candidate, x) >= threshold);
}