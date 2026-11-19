import type { SpotChallenge } from '../../engine/types';
import { Icon } from '../Icon';
import type { ChallengeProps } from './shared';

export function Spot({ challenge, response, onChange, revealed }: ChallengeProps<SpotChallenge>) {
  const selected = new Set(response.selected);
  const toggle = (id: string) =>
    onChange({
      type: 'spot',
      selected: selected.has(id) ? response.selected.filter((x) => x !== id) : [...response.selected, id],
    });

  return (
    <div className="log">
      <div className="log-head">
        <span className="log-title">{challenge.scene}</span>
        <span className="log-count" aria-live="polite">{selected.size} flagged</span>
      </div>
      <ul className="log-list">
        {challenge.lines.map((l) => {
          const on = selected.has(l.id);
          let state = on ? 'flagged' : 'idle';
          if (revealed) {
            if (l.wrong && on) state = 'caught';
            else if (l.wrong && !on) state = 'missed';
            else if (!l.wrong && on) state = 'false';
            else state = 'fine';
          }
          const verdict: Record<string, string> = {
            caught: 'Slip-up — you caught it.',
            missed: 'Slip-up — missed this one.',
            false: 'This one was fine.',
            fine: 'Fine.',
          };
          return (
            <li key={l.id}>
              <button
                type="button"
                className={`log-line log-line--${state}`}
                aria-pressed={on}
                disabled={revealed}
                onClick={() => toggle(l.id)}
              >
                <span className="log-time">{l.time}</span>
                <span className="log-body">
                  <span className="log-text">{l.text}</span>
                  {revealed && (
                    <span className="log-why">
                      <strong>{verdict[state]}</strong> {l.why}
                    </span>
                  )}
                </span>
                <span className="log-flag" aria-hidden="true">
                  {revealed ? (l.wrong ? <Icon name="flag" size={18} /> : <Icon name="check" size={18} />) : on ? <Icon name="flag" size={18} /> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
