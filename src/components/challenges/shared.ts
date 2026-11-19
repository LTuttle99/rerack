import { useEffect } from 'react';
import type { Challenge, Response } from '../../engine/types';

export interface ChallengeProps<C extends Challenge = Challenge> {
  challenge: C;
  response: Extract<Response, { type: C['type'] }>;
  onChange: (r: Extract<Response, { type: C['type'] }>) => void;
  /** True once the answer has been checked: inputs lock and the answer is shown. */
  revealed: boolean;
  /** Stable per session+challenge, so shuffles survive refresh. */
  seed: string;
}

/** Number keys 1–9 pick an option, when the challenge is still open. */
export function useNumberKeys(count: number, onPick: (i: number) => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const on = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= count) {
        e.preventDefault();
        onPick(n - 1);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [count, onPick, enabled]);
}

export const TYPE_LABEL: Record<Challenge['type'], string> = {
  choice: 'Pick one',
  picture: 'Spot it',
  match: 'Match the pairs',
  sequence: 'Put in order',
  sort: 'Sort it',
  hotspot: 'Tap the picture',
  spot: 'Find the slip-ups',
};
