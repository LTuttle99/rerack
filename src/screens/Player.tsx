import { useCallback, useEffect, useRef, useState } from 'react';
import { getChallenge } from '../content/curriculum';
import { UNITS } from '../content/curriculum';
import { emptyResponse, grade, isReady, isRequeueable } from '../engine/grading';
import { findLesson } from '../engine/progress';
import { hashString } from '../engine/random';
import { advance, currentChallengeId, isFinished, recordAnswer, sessionProgress, type Session } from '../engine/session';
import type { Grade, Response } from '../engine/types';
import { ChallengeView } from '../components/challenges/ChallengeView';
import { TYPE_LABEL } from '../components/challenges/shared';
import { Icon } from '../components/Icon';
import { navigate } from '../state/route';
import { useStore } from '../state/store';

const RIGHT = ['Nice.', 'That’s it.', 'Spot on.', 'Exactly.', 'Got it.', 'Right on.'];
const WRONG = ['Not quite.', 'Close, but no.', 'Good guess, but no.', 'Not this time.'];
const pickLine = (pool: string[], key: string) => pool[hashString(key) % pool.length];

export function Player({ id }: { id: string }) {
  const { openSession, updateSession, finishSession, setNotice } = useStore();
  const [session, setSession] = useState<Session | null>(null);
  // Answer state is keyed to the queue position, so moving on can never leak an old answer.
  const [entry, setEntry] = useState<{ key: string; r: Response; g: Grade | null } | null>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const finish = useCallback(
    (s: Session) => {
      const r = finishSession(s);
      navigate(r ? '/results' : '/', true);
    },
    [finishSession],
  );

  // Open (or resume) the session once per target.
  useEffect(() => {
    const s = openSession(id);
    if (!s) {
      setNotice({
        tone: 'info',
        text: id === 'review' ? 'Clear a level first. Tune-ups are built from what you’ve learned.' : 'That level isn’t open yet. Clear the one before it to unlock it.',
      });
      navigate('/', true);
      return;
    }
    if (isFinished(s)) {
      finish(s);
      return;
    }
    setSession(s);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const cid = session ? currentChallengeId(session) : null;
  const challenge = cid ? getChallenge(cid) : undefined;
  const key = session ? `${session.id}:${session.position}` : '';
  const response: Response | null = entry?.key === key ? entry.r : challenge ? emptyResponse(challenge) : null;
  const result: Grade | null = entry?.key === key ? entry.g : null;
  const setResponse = useCallback((r: Response) => setEntry({ key, r, g: null }), [key]);

  // Move focus to the new prompt for keyboard and screen-reader users.
  useEffect(() => {
    if (key) headingRef.current?.focus({ preventScroll: true });
  }, [key]);

  useEffect(() => {
    if (result) continueRef.current?.focus({ preventScroll: true });
  }, [result]);

  const ready = Boolean(challenge && response && isReady(challenge, response));

  const check = useCallback(() => {
    if (!session || !challenge || !response || result || !isReady(challenge, response)) return;
    const g = grade(challenge, response);
    setEntry({ key, r: response, g });
    const next = recordAnswer(session, g.correct, isRequeueable(challenge));
    setSession(next);
    updateSession(next);
  }, [session, challenge, response, result, key, updateSession]);

  const next = useCallback(() => {
    if (!session || !result) return;
    const s = advance(session);
    if (isFinished(s)) {
      finish(s);
      return;
    }
    setSession(s);
    updateSession(s);
  }, [session, result, finish, updateSession]);

  // Matching finishes itself: check as soon as the last pair lands.
  useEffect(() => {
    if (challenge?.type === 'match' && ready && !result) {
      const t = window.setTimeout(check, 450);
      return () => window.clearTimeout(t);
    }
  }, [challenge?.type, ready, result, check]);

  // Enter = Check / Continue, unless a button already has focus (it handles Enter itself).
  // Refs so the listener always sees the latest state, even between a click and React's commit.
  const latest = useRef({ result, next, check });
  latest.current = { result, next, check };
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.repeat) return;
      const t = e.target as HTMLElement | null;
      const enabledControl = t && ['BUTTON', 'A', 'INPUT', 'SUMMARY'].includes(t.tagName) && !(t as HTMLButtonElement).disabled;
      if (enabledControl) return;
      e.preventDefault();
      if (latest.current.result) latest.current.next();
      else latest.current.check();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  if (!session || !challenge || !response || response.type !== challenge.type) {
    return <div className="player player--loading" aria-busy="true" />;
  }

  const lesson = session.kind === 'lesson' ? findLesson(UNITS, session.lessonId) : undefined;
  const title = lesson ? lesson.title : 'Tune-up';
  const isRetry = session.queue.indexOf(challenge.id) !== session.position;
  const pct = Math.round(sessionProgress(session) * 100);

  return (
    <div className={`player ${session.kind === 'review' ? 'player--review' : ''}`}>
      <header className="player-top">
        <button type="button" className="icon-btn" onClick={() => navigate('/')} aria-label="Save and exit to map">
          <Icon name="x" />
        </button>
        <div className="player-title">
          <span className="player-kicker">{lesson?.kind === 'checkpoint' ? 'Checkpoint' : session.kind === 'review' ? 'Review' : 'Level'}</span>
          <span className="player-name">{title}</span>
        </div>
        <div
          className="tape"
          role="progressbar"
          aria-label="Lesson progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <span className="tape-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="player-saved">Saved as you go</span>
      </header>

      <main className="player-body" key={key}>
        <div className="player-meta">
          <span className="ctype">{TYPE_LABEL[challenge.type]}</span>
          {isRetry && <span className="retry-tag"><Icon name="replay" size={16} /> Second look</span>}
        </div>
        <h1 className="prompt" tabIndex={-1} ref={headingRef}>{challenge.prompt}</h1>
        <ChallengeView
          challenge={challenge}
          response={response}
          onChange={setResponse}
          revealed={Boolean(result)}
          seed={`${session.id}:${challenge.id}`}
        />
      </main>

      <footer className={`player-foot ${result ? (result.correct ? 'is-good' : 'is-bad') : ''}`}>
        {!result ? (
          <div className="foot-inner">
            <p className="foot-hint">
              {challenge.type === 'match' ? 'Find every pair to finish.' : ready ? 'Press Enter or Check.' : hintFor(challenge.type)}
            </p>
            {challenge.type !== 'match' && (
              <button type="button" className="btn btn-primary btn-lg" disabled={!ready} onClick={check}>
                Check
              </button>
            )}
          </div>
        ) : (
          <div className="foot-inner foot-inner--feedback" role="status" aria-live="polite">
            <div className="feedback">
              <span className="feedback-icon" aria-hidden="true">
                <Icon name={result.correct ? 'check' : 'x'} size={26} />
              </span>
              <div className="feedback-text">
                <p className="feedback-head">
                  {result.correct ? pickLine(RIGHT, key) : challenge.type === 'match' ? 'All paired up.' : pickLine(WRONG, key)}
                  {result.note && <span className="feedback-note"> {result.note}</span>}
                </p>
                <p className="feedback-explain">{challenge.explain}</p>
                {!result.correct && isRequeueable(challenge) && !isRetry && (
                  <p className="feedback-later">This one will come back at the end of the level.</p>
                )}
              </div>
            </div>
            <button type="button" ref={continueRef} className="btn btn-primary btn-lg" onClick={next}>
              Continue
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}

function hintFor(t: string) {
  switch (t) {
    case 'sequence':
      return 'Tap steps in order. Tap a placed step to remove it.';
    case 'sort':
      return 'Choose a side for every item.';
    case 'spot':
      return 'Tap each line that’s a slip-up.';
    case 'hotspot':
      return 'Tap a spot on the picture, or press its number.';
    default:
      return 'Choose an answer, or press its number.';
  }
}
