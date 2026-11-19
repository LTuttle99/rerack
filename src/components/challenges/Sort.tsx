import { useMemo } from 'react';
import type { SortChallenge } from '../../engine/types';
import { seededShuffle } from '../../engine/random';
import { Icon } from '../Icon';
import type { ChallengeProps } from './shared';

export function Sort({ challenge, response, onChange, revealed, seed }: ChallengeProps<SortChallenge>) {
  const items = useMemo(() => seededShuffle(challenge.items, seed), [challenge.items, seed]);

  const set = (itemId: string, bucket: string) =>
    onChange({ type: 'sort', assign: { ...response.assign, [itemId]: bucket } });

  return (
    <div className="sort">
      <ul className="sort-list">
        {items.map((item) => {
          const chosen = response.assign[item.id];
          const ok = revealed ? chosen === item.bucket : null;
          return (
            <li key={item.id} className={`sort-row ${ok === true ? 'is-correct' : ok === false ? 'is-incorrect' : ''}`}>
              <span className="sort-text" id={`sort-${seed}-${item.id}`}>
                {item.text}
                {ok === false && (
                  <span className="sort-fix">
                    {' '}→ {challenge.buckets.find((x) => x.id === item.bucket)!.label}
                  </span>
                )}
              </span>
              <div className="seg" role="radiogroup" aria-labelledby={`sort-${seed}-${item.id}`}>
                {challenge.buckets.map((bk, i) => (
                  <button
                    key={bk.id}
                    type="button"
                    role="radio"
                    aria-checked={chosen === bk.id}
                    className={`seg-btn seg-btn--${i ? 'b' : 'a'} ${chosen === bk.id ? 'is-on' : ''}`}
                    disabled={revealed}
                    onClick={() => set(item.id, bk.id)}
                  >
                    {bk.label}
                  </button>
                ))}
              </div>
              {ok === true && <Icon name="check" className="sort-mark" />}
              {ok === false && <Icon name="x" className="sort-mark" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
