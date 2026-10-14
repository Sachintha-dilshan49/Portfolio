/**
 * Tiny fuzzy matcher for the command palette (no dependency): the query's
 * characters must appear in order. Consecutive runs and matches at the start
 * of a word score higher; gaps cost a little. Returns null when it doesn't match.
 */
export function fuzzyScore(query: string, text: string): number | null {
  const q = query.toLowerCase().replace(/\s+/g, "");
  const s = text.toLowerCase();
  if (!q) return 0;

  let score = 0;
  let qi = 0;
  let prev = -2;
  for (let i = 0; i < s.length && qi < q.length; i++) {
    if (s[i] !== q[qi]) continue;
    const wordStart = i === 0 || /[\s\-–·/.(]/.test(s[i - 1]);
    score += 1;
    if (i === prev + 1) score += 3;
    if (wordStart) score += 4;
    if (prev >= 0) score -= Math.min(i - prev - 1, 3) * 0.2;
    prev = i;
    qi++;
  }
  if (qi < q.length) return null;
  // Whole query found as a substring: clearly what was meant.
  if (s.includes(query.toLowerCase().trim())) score += 5;
  return score;
}

/** Ranks items by their best score over the title (preferred) and keywords. */
export function fuzzyFilter<T extends { title: string; keywords?: string }>(items: T[], query: string): T[] {
  if (!query.trim()) return items;
  const scored: { item: T; score: number; i: number }[] = [];
  items.forEach((item, i) => {
    const title = fuzzyScore(query, item.title);
    const keywords = item.keywords ? fuzzyScore(query, item.keywords) : null;
    const best = Math.max(title ?? -Infinity, keywords === null ? -Infinity : keywords - 3);
    if (best > -Infinity) scored.push({ item, score: best, i });
  });
  return scored.sort((a, b) => b.score - a.score || a.i - b.i).map((s) => s.item);
}
