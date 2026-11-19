import { useCallback, useId } from 'react';
import type { HotspotChallenge } from '../../engine/types';
import { Art } from '../art/Art';
import { useNumberKeys, type ChallengeProps } from './shared';

const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export function Hotspot({ challenge, response, onChange, revealed }: ChallengeProps<HotspotChallenge>) {
  const descId = useId();
  const pick = useCallback(
    (i: number) => onChange({ type: 'hotspot', selected: challenge.regions[i].id }),
    [challenge.regions, onChange],
  );
  useNumberKeys(challenge.regions.length, pick, !revealed);

  return (
    <figure className="hotspot">
      <p id={descId} className="sr-only">{challenge.artDescription}</p>
      <div className="hotspot-stage">
        <Art name={challenge.art} className="hotspot-art" />
        {challenge.regions.map((r, i) => {
          const selected = response.selected === r.id;
          const state = !revealed
            ? selected ? 'selected' : 'idle'
            : r.id === challenge.answer ? 'correct' : selected ? 'incorrect' : 'dimmed';
          return (
            <button
              key={r.id}
              type="button"
              className={`spot spot--${state} spot--m-${r.marker ?? 'tl'}`}
              style={{ left: pct(r.x, 400), top: pct(r.y, 300), width: pct(r.w, 400), height: pct(r.h, 300) }}
              aria-label={`Spot ${i + 1}${revealed && (state === 'correct' || state === 'incorrect') ? `: ${r.label}` : ''}`}
              aria-describedby={descId}
              aria-pressed={selected}
              disabled={revealed}
              onClick={() => pick(i)}
            >
              <span className="spot-dot" aria-hidden="true">{i + 1}</span>
              {revealed && (state === 'correct' || state === 'incorrect') && (
                <span className="spot-tag" aria-hidden="true">{r.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </figure>
  );
}
