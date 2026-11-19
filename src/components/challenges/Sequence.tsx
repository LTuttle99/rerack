import { useMemo } from 'react';
import type { SequenceChallenge } from '../../engine/types';
import { shuffleAwayFromOriginal } from '../../engine/random';
import { Icon } from '../Icon';
import type { ChallengeProps } from './shared';

export function Sequence({ challenge, response, onChange, revealed, seed }: ChallengeProps<SequenceChallenge>) {
  const bank = useMemo(() => shuffleAwayFromOriginal(challenge.steps, seed), [challenge.steps, seed]);
  const byId = useMemo(() => new Map(challenge.steps.map((s) => [s.id, s])), [challenge.steps]);
  const placed = new Set(response.order);
  const correctIndex = (id: string) => challenge.steps.findIndex((s) => s.id === id);

  const add = (id: string) => onChange({ type: 'sequence', order: [...response.order, id] });
  const remove = (id: string) => onChange({ type: 'sequence', order: response.order.filter((x) => x !== id) });

  return (
    <div className="sequence">
      <ol className="seq-slots" aria-label="Your order">
        {challenge.steps.map((_, i) => {
          const id = response.order[i];
          const step = id ? byId.get(id) : undefined;
          const ok = revealed && id ? correctIndex(id) === i : null;
          return (
            <li key={i} className={`seq-slot ${step ? 'is-filled' : ''} ${ok === true ? 'is-correct' : ok === false ? 'is-incorrect' : ''}`}>
              <span className="seq-num" aria-hidden="true">{i + 1}</span>
              {step ? (
                <button type="button" className="seq-chip seq-chip--placed" disabled={revealed} onClick={() => remove(step.id)}>
                  {step.text}
                  <span className="sr-only">{revealed ? (ok ? ' (right place)' : ` (belongs at step ${correctIndex(step.id) + 1})`) : ', tap to remove'}</span>
                </button>
              ) : (
                <span className="seq-empty">Step {i + 1}</span>
              )}
              {ok === true && <Icon name="check" className="seq-mark" />}
              {ok === false && <span className="seq-should" aria-hidden="true">→ {correctIndex(id!) + 1}</span>}
            </li>
          );
        })}
      </ol>
      {!revealed && (
        <div className="seq-bank" aria-label="Steps to place">
          {bank.map((s) => (
            <button key={s.id} type="button" className="seq-chip" disabled={placed.has(s.id)} onClick={() => add(s.id)}>
              {placed.has(s.id) ? <span className="sr-only">(placed) </span> : null}
              {s.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
