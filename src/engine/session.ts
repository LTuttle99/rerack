/**
 * A play session: the queue of challenges for one lesson or review run.
 * Pure functions only. The session is persisted as part of progress so a
 * refresh mid-lesson resumes where the learner was.
 */

export type SessionKind = 'lesson' | 'review';

export interface Session {
  id: string;
  kind: SessionKind;
  /** For lessons: the lesson id. For reviews: 'review'. */
  lessonId: string;
  queue: string[];
  position: number;
  /** 'feedback' means the current item has been graded but not advanced. */
  phase: 'answering' | 'feedback';
  lastCorrect: boolean | null;
  /** Challenges that were missed the first time they appeared. */
  firstTryMisses: string[];
  /** Challenges re-queued after a miss (each at most once). */
  retried: string[];
  /** Missed earlier, then answered correctly on the retry. */
  recovered: string[];
  startedAt: string;
}

export function startSession(
  kind: SessionKind,
  lessonId: string,
  challengeIds: string[],
  id: string,
  now: Date,
): Session {
  if (challengeIds.length === 0) throw new Error('Cannot start an empty session');
  return {
    id,
    kind,
    lessonId,
    queue: challengeIds.slice(),
    position: 0,
    phase: 'answering',
    lastCorrect: null,
    firstTryMisses: [],
    retried: [],
    recovered: [],
    startedAt: now.toISOString(),
  };
}

export function currentChallengeId(s: Session): string | null {
  return s.position < s.queue.length ? s.queue[s.position] : null;
}

export function uniqueCount(s: Session): number {
  return new Set(s.queue).size;
}

/** Record a graded answer for the current challenge. */
export function recordAnswer(s: Session, correct: boolean, requeueable: boolean): Session {
  const id = currentChallengeId(s);
  if (id === null || s.phase !== 'answering') return s;

  const isRetry = s.queue.indexOf(id) !== s.position; // an earlier copy exists
  const next: Session = { ...s, phase: 'feedback', lastCorrect: correct };

  if (!correct) {
    if (!isRetry && !s.firstTryMisses.includes(id)) next.firstTryMisses = [...s.firstTryMisses, id];
    if (requeueable && !s.retried.includes(id)) {
      next.retried = [...s.retried, id];
      next.queue = [...s.queue, id];
    }
  } else if (isRetry && s.firstTryMisses.includes(id) && !s.recovered.includes(id)) {
    next.recovered = [...s.recovered, id];
  }
  return next;
}

export function advance(s: Session): Session {
  if (s.phase !== 'feedback') return s;
  return { ...s, position: s.position + 1, phase: 'answering', lastCorrect: null };
}

export function isFinished(s: Session): boolean {
  return s.position >= s.queue.length;
}

/**
 * When resuming after a refresh, an item that was already graded should not
 * be answerable again — move past it.
 */
export function normalizeOnResume(s: Session): Session {
  return s.phase === 'feedback' ? advance(s) : s;
}

/** Fraction of the lesson done, for the progress bar. Re-queued items extend the bar. */
export function sessionProgress(s: Session): number {
  if (s.queue.length === 0) return 0;
  const done = s.position + (s.phase === 'feedback' ? 1 : 0);
  return Math.min(1, done / s.queue.length);
}

export interface SessionSummary {
  total: number;
  firstTryCorrect: number;
  accuracy: number;
  perfect: boolean;
  recovered: number;
  missedIds: string[];
}

export function summarize(s: Session): SessionSummary {
  const total = uniqueCount(s);
  const firstTryCorrect = total - s.firstTryMisses.length;
  return {
    total,
    firstTryCorrect,
    accuracy: total ? firstTryCorrect / total : 0,
    perfect: s.firstTryMisses.length === 0,
    recovered: s.recovered.length,
    missedIds: s.firstTryMisses.slice(),
  };
}
