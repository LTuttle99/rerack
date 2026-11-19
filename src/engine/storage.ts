import { freshProgress, SCHEMA_VERSION } from './progress';
import type { Progress } from './progress';
import type { Session } from './session';

/**
 * Persistence boundary. The app only talks to a ProgressRepository, so a
 * future cloud-backed implementation can replace LocalProgressRepository
 * without touching the lesson engine.
 */
export interface LoadResult {
  progress: Progress;
  /** Set when saved data existed but could not be read cleanly. */
  recovered: 'none' | 'partial' | 'reset';
}

export interface ProgressRepository {
  load(now: Date): LoadResult;
  save(p: Progress): boolean;
  clear(): void;
}

export const STORAGE_KEY = 'rerack.progress.v1';

/* ---------------- Validation ---------------- */

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isIsoDate = (v: unknown): v is string => typeof v === 'string' && !Number.isNaN(Date.parse(v));
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseSession(v: unknown): Session | null {
  if (!isObj(v)) return null;
  const ok =
    typeof v.id === 'string' &&
    (v.kind === 'lesson' || v.kind === 'review') &&
    typeof v.lessonId === 'string' &&
    isStrArr(v.queue) &&
    v.queue.length > 0 &&
    isNum(v.position) &&
    v.position >= 0 &&
    v.position <= v.queue.length &&
    (v.phase === 'answering' || v.phase === 'feedback') &&
    isStrArr(v.firstTryMisses) &&
    isStrArr(v.retried) &&
    isStrArr(v.recovered) &&
    isIsoDate(v.startedAt);
  if (!ok) return null;
  return {
    id: v.id as string,
    kind: v.kind as Session['kind'],
    lessonId: v.lessonId as string,
    queue: v.queue as string[],
    position: v.position as number,
    phase: v.phase as Session['phase'],
    lastCorrect: typeof v.lastCorrect === 'boolean' ? v.lastCorrect : null,
    firstTryMisses: v.firstTryMisses as string[],
    retried: v.retried as string[],
    recovered: v.recovered as string[],
    startedAt: v.startedAt as string,
  };
}

/**
 * Field-by-field repair: anything malformed is dropped rather than throwing
 * away the whole save. Returns null only if the root isn't usable at all.
 */
export function parseProgress(raw: unknown, now: Date): { progress: Progress; partial: boolean } | null {
  if (!isObj(raw) || raw.version !== SCHEMA_VERSION) return null;
  const base = freshProgress(now);
  let partial = false;
  const flag = <T>(ok: boolean, value: T, fallback: T): T => {
    if (!ok) partial = true;
    return ok ? value : fallback;
  };

  const lessons: Progress['lessons'] = {};
  if (isObj(raw.lessons)) {
    for (const [id, rec] of Object.entries(raw.lessons)) {
      if (
        isObj(rec) &&
        isIsoDate(rec.completedAt) &&
        isNum(rec.bestAccuracy) &&
        isNum(rec.plays) &&
        typeof rec.perfectAwarded === 'boolean' &&
        isNum(rec.xp)
      ) {
        lessons[id] = {
          completedAt: rec.completedAt,
          bestAccuracy: Math.min(1, Math.max(0, rec.bestAccuracy)),
          plays: Math.max(1, Math.floor(rec.plays)),
          perfectAwarded: rec.perfectAwarded,
          xp: Math.max(0, rec.xp),
        };
      } else partial = true;
    }
  } else partial = true;

  const activity: Progress['activity'] = {};
  if (isObj(raw.activity)) {
    for (const [day, n] of Object.entries(raw.activity)) {
      if (DAY_RE.test(day) && isNum(n) && n >= 0) activity[day] = Math.floor(n);
      else partial = true;
    }
  } else partial = true;

  const achievements: Progress['achievements'] = {};
  if (isObj(raw.achievements)) {
    for (const [id, at] of Object.entries(raw.achievements)) {
      if (isIsoDate(at)) achievements[id] = at;
      else partial = true;
    }
  } else partial = true;

  const prof = isObj(raw.profile) ? raw.profile : {};
  if (!isObj(raw.profile)) partial = true;
  const set = isObj(raw.settings) ? raw.settings : {};

  let activeSession: Session | null = null;
  if (raw.activeSession !== null && raw.activeSession !== undefined) {
    activeSession = parseSession(raw.activeSession);
    if (!activeSession) partial = true;
  }

  const progress: Progress = {
    version: SCHEMA_VERSION,
    createdAt: flag(isIsoDate(raw.createdAt), raw.createdAt as string, base.createdAt),
    xp: flag(isNum(raw.xp) && (raw.xp as number) >= 0, raw.xp as number, 0),
    lessons,
    activity,
    reviewXpDays: flag(isStrArr(raw.reviewXpDays), raw.reviewXpDays as string[], []),
    weakItems: flag(isStrArr(raw.weakItems), raw.weakItems as string[], []),
    achievements,
    completedSessionIds: flag(isStrArr(raw.completedSessionIds), raw.completedSessionIds as string[], []),
    reviewsCompleted: flag(isNum(raw.reviewsCompleted), raw.reviewsCompleted as number, 0),
    replays: flag(isNum(raw.replays), raw.replays as number, 0),
    profile: {
      experience: ['new', 'some', 'returning'].includes(prof.experience as string) ? (prof.experience as Progress['profile']['experience']) : null,
      access: ['gym', 'home', 'undecided'].includes(prof.access as string) ? (prof.access as Progress['profile']['access']) : null,
      dailyGoal: [1, 2, 3].includes(prof.dailyGoal as number) ? (prof.dailyGoal as Progress['profile']['dailyGoal']) : 1,
      onboarded: prof.onboarded === true,
    },
    settings: {
      motion: ['system', 'reduced', 'full'].includes(set.motion as string) ? (set.motion as Progress['settings']['motion']) : 'system',
    },
    activeSession,
  };

  // XP must never be lower than what completed lessons account for.
  const lessonXp = Object.values(lessons).reduce((n, l) => n + l.xp, 0);
  if (progress.xp < lessonXp) {
    progress.xp = lessonXp;
    partial = true;
  }
  return { progress, partial };
}

/* ---------------- localStorage implementation ---------------- */

export class LocalProgressRepository implements ProgressRepository {
  private storage: Storage | null;

  constructor(storage?: Storage) {
    this.storage = storage ?? LocalProgressRepository.safeLocalStorage();
  }

  private static safeLocalStorage(): Storage | null {
    try {
      const s = window.localStorage;
      const k = '__rerack_probe__';
      s.setItem(k, '1');
      s.removeItem(k);
      return s;
    } catch {
      return null;
    }
  }

  get available(): boolean {
    return this.storage !== null;
  }

  load(now: Date): LoadResult {
    if (!this.storage) return { progress: freshProgress(now), recovered: 'none' };
    let text: string | null = null;
    try {
      text = this.storage.getItem(STORAGE_KEY);
    } catch {
      return { progress: freshProgress(now), recovered: 'none' };
    }
    if (text === null) return { progress: freshProgress(now), recovered: 'none' };

    let parsed: ReturnType<typeof parseProgress> = null;
    try {
      parsed = parseProgress(JSON.parse(text), now);
    } catch {
      parsed = null;
    }
    if (!parsed) {
      // Keep the unreadable data around instead of silently destroying it.
      try {
        this.storage.setItem(`${STORAGE_KEY}.unreadable.${now.getTime()}`, text);
      } catch {
        /* storage full — nothing more we can do */
      }
      return { progress: freshProgress(now), recovered: 'reset' };
    }
    return { progress: parsed.progress, recovered: parsed.partial ? 'partial' : 'none' };
  }

  save(p: Progress): boolean {
    if (!this.storage) return false;
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(p));
      return true;
    } catch {
      return false;
    }
  }

  clear(): void {
    try {
      this.storage?.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}
