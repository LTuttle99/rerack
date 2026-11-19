/** Small deterministic helpers so a refreshed lesson shows the same shuffle. */

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededRandom(seed: number): () => number {
  let a = seed || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const out = items.slice();
  const rand = seededRandom(hashString(seed));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Shuffle, but never hand back the original order when there's a choice. */
export function shuffleAwayFromOriginal<T>(items: readonly T[], seed: string): T[] {
  if (items.length < 2) return items.slice();
  let out = seededShuffle(items, seed);
  let n = 0;
  while (out.every((x, i) => x === items[i]) && n < 5) {
    out = seededShuffle(items, `${seed}:${++n}`);
  }
  if (out.every((x, i) => x === items[i])) out = [...items.slice(1), items[0]];
  return out;
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
