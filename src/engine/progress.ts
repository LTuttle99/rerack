import { dayKey } from './dates';
import type { Session, SessionSummary } from './session';
import { isFinished, summarize } from './session';
import type { Lesson, Unit } from './types';
import { evaluateAchievements } from './achievements';

export const SCHEMA_VERSION = 1;

export const XP = {
  lesson: 10,
  checkpoint: 20,
  perfectBonus: 5,
  review: 5,
} as const;

export type Experience = 'new' | 'some' | 'returning';
export type Access = 'gym' | 'home' | 'undecided';
export type DailyGoal = 1 | 2 | 3;
export type MotionPref = 'system' | 'reduced' | 'full';

export interface LessonRecord {
  completedAt: string;
  bestAccuracy: number;
  plays: number;
  /** Whether the one-time perfect bonus has been paid for this lesson. */
  perfectAwarded: boolean;
  xp: number;
}

export interface Progress {
  version: typeof SCHEMA_VERSION;
  createdAt: string;
  xp: number;
  lessons: Record<string, LessonRecord>;
  /** Sessions finished per local day. */
  activity: Record<string, number>;
  /** Days on which review XP was already paid. */
  reviewXpDays: string[];
  /** Challenge ids the learner missed and hasn't since got right in review. */
  weakItems: string[];
  achievements: Record<string, string>;
  /** Guards against completing the same session twice. */
  completedSessionIds: string[];
  reviewsCompleted: number;
  replays: number;
  profile: {
    experience: Experience | null;
    access: Access | null;
    dailyGoal: DailyGoal;
    onboarded: boolean;
  };
  settings: { motion: MotionPref };
  activeSession: Session | null;
}

export function freshProgress(now: Date): Progress {
  return {
    version: SCHEMA_VERSION,
    createdAt: now.toISOString(),
    xp: 0,
    lessons: {},
    activity: {},
    reviewXpDays: [],
    weakItems: [],
    achievements: {},
    completedSessionIds: [],
    reviewsCompleted: 0,
    replays: 0,
    profile: { experience: null, access: null, dailyGoal: 1, onboarded: false },
    settings: { motion: 'system' },
    activeSession: null,
  };
}

/* ---------------- Curriculum queries ---------------- */

export function playableLessons(units: Unit[]): Lesson[] {
  return units.filter((u) => u.status === 'playable').flatMap((u) => u.lessons);
}

export function findLesson(units: Unit[], lessonId: string): Lesson | undefined {
  return playableLessons(units).find((l) => l.id === lessonId);
}

export function isCompleted(p: Progress, lessonId: string): boolean {
  return Boolean(p.lessons[lessonId]);
}

/** Lessons unlock strictly in order. Planned units are never unlocked. */
export function isUnlocked(p: Progress, units: Unit[], lessonId: string): boolean {
  const all = playableLessons(units);
  const i = all.findIndex((l) => l.id === lessonId);
  if (i === -1) return false;
  if (i === 0) return true;
  return isCompleted(p, all[i - 1].id);
}

/** The first unlocked lesson that hasn't been completed, or null if all done. */
export function nextLesson(p: Progress, units: Unit[]): Lesson | null {
  return playableLessons(units).find((l) => !isCompleted(p, l.id)) ?? null;
}

export function isUnitComplete(p: Progress, unit: Unit): boolean {
  return unit.status === 'playable' && unit.lessons.every((l) => isCompleted(p, l.id));
}

export function sessionsOn(p: Progress, d: Date): number {
  return p.activity[dayKey(d)] ?? 0;
}

/* ---------------- Completing a session ---------------- */

export interface CompletionResult {
  sessionId: string;
  kind: Session['kind'];
  lessonId: string;
  summary: SessionSummary;
  xp: number;
  breakdown: { label: string; xp: number }[];
  /** Explains a zero-XP result so it never feels like a bug. */
  xpNote: string | null;
  firstClear: boolean;
  newAchievements: string[];
  unlockedLessonId: string | null;
  completedUnitId: string | null;
  sessionsToday: number;
  dailyGoalJustMet: boolean;
}

export function completeSession(
  before: Progress,
  session: Session,
  units: Unit[],
  now: Date,
): { progress: Progress; result: CompletionResult } | null {
  if (!isFinished(session)) return null;
  if (before.completedSessionIds.includes(session.id)) return null;

  const summary = summarize(session);
  const today = dayKey(now);
  const breakdown: { label: string; xp: number }[] = [];
  let xpNote: string | null = null;
  let firstClear = false;

  const p: Progress = {
    ...before,
    lessons: { ...before.lessons },
    activity: { ...before.activity },
    achievements: { ...before.achievements },
    completedSessionIds: [...before.completedSessionIds, session.id].slice(-50),
    activeSession: before.activeSession?.id === session.id ? null : before.activeSession,
  };

  // Weak items: misses go in, clean answers in review come out.
  const weak = new Set(before.weakItems);
  summary.missedIds.forEach((id) => weak.add(id));
  if (session.kind === 'review') {
    session.queue.forEach((id) => {
      if (!summary.missedIds.includes(id)) weak.delete(id);
    });
  }
  p.weakItems = [...weak];

  if (session.kind === 'lesson') {
    const lesson = findLesson(units, session.lessonId);
    if (!lesson) return null;
    const prev = before.lessons[lesson.id];
    const base = lesson.kind === 'checkpoint' ? XP.checkpoint : XP.lesson;

    if (!prev) {
      firstClear = true;
      breakdown.push({ label: lesson.kind === 'checkpoint' ? 'Checkpoint cleared' : 'Level cleared', xp: base });
      if (summary.perfect) breakdown.push({ label: 'Clean sheet bonus', xp: XP.perfectBonus });
      p.lessons[lesson.id] = {
        completedAt: now.toISOString(),
        bestAccuracy: summary.accuracy,
        plays: 1,
        perfectAwarded: summary.perfect,
        xp: base + (summary.perfect ? XP.perfectBonus : 0),
      };
    } else {
      p.replays = before.replays + 1;
      const payBonus = summary.perfect && !prev.perfectAwarded;
      if (payBonus) breakdown.push({ label: 'First clean sheet on this level', xp: XP.perfectBonus });
      else xpNote = prev.perfectAwarded
        ? 'You already earned every XP point on this level. Replays are for practice.'
        : 'Replays earn XP only for a first clean sheet. Get every answer right first try to claim it.';
      p.lessons[lesson.id] = {
        ...prev,
        bestAccuracy: Math.max(prev.bestAccuracy, summary.accuracy),
        plays: prev.plays + 1,
        perfectAwarded: prev.perfectAwarded || summary.perfect,
        xp: prev.xp + (payBonus ? XP.perfectBonus : 0),
      };
    }
  } else {
    p.reviewsCompleted = before.reviewsCompleted + 1;
    if (!before.reviewXpDays.includes(today)) {
      breakdown.push({ label: 'Daily tune-up', xp: XP.review });
      p.reviewXpDays = [...before.reviewXpDays, today].slice(-60);
    } else {
      xpNote = 'Tune-up XP is once a day. This one still counts toward your daily goal.';
    }
  }

  const gained = breakdown.reduce((n, b) => n + b.xp, 0);
  p.xp = before.xp + gained;

  const sessionsToday = (before.activity[today] ?? 0) + 1;
  p.activity[today] = sessionsToday;
  const dailyGoalJustMet = sessionsToday === before.profile.dailyGoal;

  // Unlocks are computed by diffing before/after, so they can't drift from isUnlocked.
  let unlockedLessonId: string | null = null;
  let completedUnitId: string | null = null;
  if (firstClear) {
    const nb = nextLesson(before, units);
    const na = nextLesson(p, units);
    if (na && na.id !== nb?.id) unlockedLessonId = na.id;
    const unit = units.find((u) => u.id === findLesson(units, session.lessonId)?.unitId);
    if (unit && isUnitComplete(p, unit) && !isUnitComplete(before, unit)) completedUnitId = unit.id;
  }

  const newAchievements = evaluateAchievements({ before, after: p, session, summary, units, now }).filter(
    (id) => !before.achievements[id],
  );
  newAchievements.forEach((id) => (p.achievements[id] = now.toISOString()));

  return {
    progress: p,
    result: {
      sessionId: session.id,
      kind: session.kind,
      lessonId: session.lessonId,
      summary,
      xp: gained,
      breakdown,
      xpNote: gained === 0 ? xpNote : null,
      firstClear,
      newAchievements,
      unlockedLessonId,
      completedUnitId,
      sessionsToday,
      dailyGoalJustMet,
    },
  };
}
