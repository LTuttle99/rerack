import { useEffect, useMemo, useRef, useState } from 'react';
import type { MatchChallenge } from '../../engine/types';
import { shuffleAwayFromOriginal } from '../../engine/random';
import type { ChallengeProps } from './shared';

type Side = 'left' | 'right';

export function Match({ challenge, response, onChange, revealed, seed }: ChallengeProps<MatchChallenge>) {
  const left = useMemo(() => shuffleAwayFromOriginal(challenge.pairs, `${seed}:L`), [challenge.pairs, seed]);
  const right = useMemo(() => shuffleAwayFromOriginal(challenge.pairs, `${seed}:R`), [challenge.pairs, seed]);
  const [active, setActive] = useState<{ side: Side; id: string } | null>(null);
  const [wrong, setWrong] = useState<{ left: string; right: string } | null>(null);
  const [justMatched, setJustMatched] = useState<string | null>(null);
  const [announce, setAnnounce] = useState('');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const matched = new Set(response.matched);

  function tap(side: Side, id: string) {
    if (revealed || matched.has(id)) return;
    if (!active || active.side === side) {
      setActive(active?.side === side && active.id === id ? null : { side, id });
      return;
    }
    const leftId = side === 'left' ? id : active.id;
    const rightId = side === 'right' ? id : active.id;
    setActive(null);
    if (leftId === rightId) {
      const pair = challenge.pairs.find((p) => p.id === leftId)!;
      setJustMatched(leftId);
      setAnnounce(`Matched: ${pair.left} — ${pair.right}.`);
      onChange({ type: 'match', matched: [...response.matched, leftId], wrong: response.wrong });
    } else {
      setWrong({ left: leftId, right: rightId });
      setAnnounce('Not a pair. Try again.');
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setWrong(null), 650);
      onChange({ type: 'match', matched: response.matched, wrong: response.wrong + 1 });
    }
  }

  function cls(side: Side, id: string) {
    const parts = ['match-item'];
    if (matched.has(id)) parts.push('is-matched');
    if (justMatched === id) parts.push('is-pop');
    if (active?.side === side && active.id === id) parts.push('is-active');
    if (wrong && wrong[side] === id) parts.push('is-wrong');
    return parts.join(' ');
  }

  const column = (side: Side, items: typeof left) => (
    <ul className={`match-col match-col--${side}`} aria-label={side === 'left' ? 'Terms' : 'Meanings'}>
      {items.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            className={cls(side, p.id)}
            aria-pressed={active?.side === side && active.id === p.id}
            disabled={revealed || matched.has(p.id)}
            onClick={() => tap(side, p.id)}
          >
            {side === 'left' ? p.left : p.right}
            {matched.has(p.id) && <span className="sr-only"> (matched)</span>}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="match">
      <p className="hint">Tap a term, then its meaning.</p>
      <div className="match-grid">
        {column('left', left)}
        {column('right', right)}
      </div>
      <p className="sr-only" aria-live="polite">{announce}</p>
    </div>
  );
}
