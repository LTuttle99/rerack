import { useCallback, useMemo } from 'react';
import type { ChoiceChallenge, PictureChallenge } from '../../engine/types';
import { seededShuffle } from '../../engine/random';
import { Art, ART_DESCRIPTIONS } from '../art/Art';
import { Icon } from '../Icon';
import { useNumberKeys, type ChallengeProps } from './shared';

function optionState(id: string, selected: string | null, answer: string, revealed: boolean) {
  if (!revealed) return id === selected ? 'selected' : 'idle';
  if (id === answer) return 'correct';
  if (id === selected) return 'incorrect';
  return 'dimmed';
}

export function Choice({ challenge, response, onChange, revealed, seed }: ChallengeProps<ChoiceChallenge>) {
  const options = useMemo(() => seededShuffle(challenge.options, seed), [challenge.options, seed]);
  const pick = useCallback((i: number) => onChange({ type: 'choice', selected: options[i].id }), [options, onChange]);
  useNumberKeys(options.length, pick, !revealed);

  return (
    <div className="choice">
      {challenge.art && (
        <figure className="choice-art">
          <Art name={challenge.art} title={ART_DESCRIPTIONS[challenge.art]} />
        </figure>
      )}
      <div className="options" role="radiogroup" aria-label="Answers">
        {options.map((o, i) => {
          const state = optionState(o.id, response.selected, challenge.answer, revealed);
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={response.selected === o.id}
              className={`option option--${state}`}
              disabled={revealed}
              onClick={() => pick(i)}
            >
              <kbd className="option-key" aria-hidden="true">{i + 1}</kbd>
              <span className="option-text">{o.text}</span>
              {state === 'correct' && <Icon name="check" className="option-mark" />}
              {state === 'incorrect' && <Icon name="x" className="option-mark" />}
              {state === 'correct' && <span className="sr-only"> (correct answer)</span>}
              {state === 'incorrect' && <span className="sr-only"> (your answer, incorrect)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Picture({ challenge, response, onChange, revealed, seed }: ChallengeProps<PictureChallenge>) {
  const options = useMemo(() => seededShuffle(challenge.options, seed), [challenge.options, seed]);
  const pick = useCallback((i: number) => onChange({ type: 'picture', selected: options[i].id }), [options, onChange]);
  useNumberKeys(options.length, pick, !revealed);

  return (
    <div className="picture-grid" role="radiogroup" aria-label="Pictures">
      {options.map((o, i) => {
        const state = optionState(o.id, response.selected, challenge.answer, revealed);
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={response.selected === o.id}
            aria-label={`Picture ${i + 1}: ${ART_DESCRIPTIONS[o.art]}${revealed ? ` It’s a ${o.label.toLowerCase()}.` : ''}`}
            className={`tile tile--${state}`}
            disabled={revealed}
            onClick={() => pick(i)}
          >
            <kbd className="option-key" aria-hidden="true">{i + 1}</kbd>
            <Art name={o.art} className="tile-art" />
            <span className={`tile-label ${revealed ? 'is-shown' : ''}`} aria-hidden="true">
              {revealed ? o.label : ' '}
            </span>
          </button>
        );
      })}
    </div>
  );
}
