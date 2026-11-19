import type { Progress } from './progress';
import { playableLessons } from './progress';
import { seededShuffle } from './random';
import type { Unit } from './types';

export const REVIEW_SIZE = 7;
const MAX_WEAK = 5;

/**
 * A tune-up mixes things you've missed (weak items first) with a sample of
 * other content from levels you've cleared. Returns [] if nothing is cleared.
 */
export function buildReviewQueue(p: Progress, units: Unit[], seed: string): string[] {
  const cleared = playableLessons(units).filter((l) => p.lessons[l.id]);
  const pool = cleared.flatMap((l) => l.challenges.map((c) => c.id));
  if (pool.length === 0) return [];

  const poolSet = new Set(pool);
  const weak = seededShuffle(p.weakItems.filter((id) => poolSet.has(id)), `${seed}:weak`).slice(0, MAX_WEAK);
  const rest = seededShuffle(pool.filter((id) => !weak.includes(id)), `${seed}:rest`);
  const picked = [...weak, ...rest].slice(0, REVIEW_SIZE);
  return seededShuffle(picked, `${seed}:order`);
}

export function weakItemCount(p: Progress, units: Unit[]): number {
  const cleared = new Set(
    playableLessons(units)
      .filter((l) => p.lessons[l.id])
      .flatMap((l) => l.challenges.map((c) => c.id)),
  );
  return p.weakItems.filter((id) => cleared.has(id)).length;
}
