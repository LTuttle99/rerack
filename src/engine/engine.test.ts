import { describe, expect, it } from 'vitest';
import { UNITS, getChallenge } from '../content/curriculum';
import { emptyResponse, grade, isReady } from './grading';
import {
  completeSession,
  freshProgress,
  isUnlocked,
  nextLesson,
  playableLessons,
  XP,
  type Progress,
} from './progress';
import { advance, isFinished, normalizeOnResume, recordAnswer, startSession, summarize, type Session } from './session';
import { buildReviewQueue } from './review';
import { LocalProgressRepository, STORAGE_KEY, parseProgress } from './storage';
import { currentRun, dayKey } from './dates';
import type { Challenge } from './types';

const NOW = new Date(2026, 10, 19, 12, 0, 0);
const lessons = playableLessons(UNITS);

/** Play a whole session, answering everything correctly except the ids in `miss` (first time only). */
function play(lessonId: string, miss: string[] = [], id = `s-${lessonId}-${Math.random()}`): Session {
  const lesson = lessons.find((l) => l.id === lessonId)!;
  let s = startSession('lesson', lessonId, lesson.challenges.map((c) => c.id), id, NOW);
  const missedOnce = new Set<string>();
  while (!isFinished(s)) {
    const cid = s.queue[s.position];
    const shouldMiss = miss.includes(cid) && !missedOnce.has(cid);
    if (shouldMiss) missedOnce.add(cid);
    s = recordAnswer(s, !shouldMiss, getChallenge(cid)!.type !== 'match');
    s = advance(s);
  }
  return s;
}

function clear(p: Progress, lessonId: string, miss: string[] = []): Progress {
  const r = completeSession(p, play(lessonId, miss), UNITS, NOW);
  if (!r) throw new Error('completion failed');
  return r.progress;
}

describe('content integrity', () => {
  it('has a fully playable first unit with a checkpoint', () => {
    const u1 = UNITS[0];
    expect(u1.status).toBe('playable');
    expect(u1.lessons.length).toBeGreaterThanOrEqual(5);
    expect(u1.lessons.at(-1)!.kind).toBe('checkpoint');
  });

  it('uses at least seven challenge types', () => {
    const types = new Set(lessons.flatMap((l) => l.challenges.map((c) => c.type)));
    expect(types.size).toBeGreaterThanOrEqual(7);
  });

  it('every challenge has a valid answer key', () => {
    for (const c of lessons.flatMap((l) => l.challenges) as Challenge[]) {
      expect(c.explain.length, c.id).toBeGreaterThan(20);
      if (c.type === 'choice' || c.type === 'picture') expect(c.options.some((o) => o.id === c.answer), c.id).toBe(true);
      if (c.type === 'hotspot') expect(c.regions.some((r) => r.id === c.answer), c.id).toBe(true);
      if (c.type === 'sort') c.items.forEach((i) => expect(c.buckets.map((b) => b.id)).toContain(i.bucket));
      if (c.type === 'spot') expect(c.lines.some((l) => l.wrong), c.id).toBe(true);
    }
  });

  it('wrong multiple-choice options explain themselves', () => {
    for (const c of lessons.flatMap((l) => l.challenges)) {
      if (c.type !== 'choice') continue;
      c.options.filter((o) => o.id !== c.answer).forEach((o) => expect(o.why, `${c.id}/${o.id}`).toBeTruthy());
    }
  });

  it('planned units contain no playable lessons', () => {
    UNITS.filter((u) => u.status === 'planned').forEach((u) => expect(u.lessons).toHaveLength(0));
  });
});

describe('grading', () => {
  it('grades choice and gives the option-specific reason when wrong', () => {
    const c = getChallenge('u1-fv-1')!;
    expect(grade(c, { type: 'choice', selected: 'a' }).correct).toBe(true);
    const g = grade(c, { type: 'choice', selected: 'b' });
    expect(g.correct).toBe(false);
    expect(g.note).toMatch(/max/i);
  });

  it('requires a complete sequence before it is ready, and checks order', () => {
    const c = getChallenge('u1-fv-3')!;
    if (c.type !== 'sequence') throw new Error();
    expect(isReady(c, emptyResponse(c))).toBe(false);
    const ids = c.steps.map((s) => s.id);
    expect(grade(c, { type: 'sequence', order: ids }).correct).toBe(true);
    expect(grade(c, { type: 'sequence', order: [...ids].reverse() }).correct).toBe(false);
  });

  it('spot challenge fails on both misses and false flags', () => {
    const c = getChallenge('u1-fv-6')!;
    if (c.type !== 'spot') throw new Error();
    const wrong = c.lines.filter((l) => l.wrong).map((l) => l.id);
    expect(grade(c, { type: 'spot', selected: wrong }).correct).toBe(true);
    expect(grade(c, { type: 'spot', selected: wrong.slice(1) }).note).toMatch(/missed 1/);
    expect(grade(c, { type: 'spot', selected: [...wrong, 'l1'] }).note).toMatch(/flagged 1/);
  });

  it('sort requires every item assigned, and counts misplacements', () => {
    const c = getChallenge('u1-fv-2')!;
    if (c.type !== 'sort') throw new Error();
    const right = Object.fromEntries(c.items.map((i) => [i.id, i.bucket]));
    expect(isReady(c, { type: 'sort', assign: { water: 'bring' } })).toBe(false);
    expect(grade(c, { type: 'sort', assign: right }).correct).toBe(true);
    expect(grade(c, { type: 'sort', assign: { ...right, jeans: 'bring' } }).correct).toBe(false);
  });

  it('match is correct only with zero wrong pairings', () => {
    const c = getChallenge('u1-fl-2')!;
    if (c.type !== 'match') throw new Error();
    const all = c.pairs.map((p) => p.id);
    expect(isReady(c, { type: 'match', matched: all, wrong: 0 })).toBe(true);
    expect(grade(c, { type: 'match', matched: all, wrong: 2 }).correct).toBe(false);
  });
});

describe('sessions', () => {
  it('re-queues a missed challenge exactly once and tracks recovery', () => {
    let s = startSession('lesson', 'x', ['a', 'b'], 's1', NOW);
    s = advance(recordAnswer(s, false, true)); // miss a
    expect(s.queue).toEqual(['a', 'b', 'a']);
    s = advance(recordAnswer(s, true, true)); // b
    s = recordAnswer(s, false, true); // miss a again on retry
    expect(s.queue).toHaveLength(3); // not re-queued twice
    s = advance(s);
    expect(isFinished(s)).toBe(true);
    expect(summarize(s)).toMatchObject({ total: 2, firstTryCorrect: 1, perfect: false, recovered: 0 });
  });

  it('records recovery when the retry is answered correctly', () => {
    let s = startSession('lesson', 'x', ['a'], 's1', NOW);
    s = advance(recordAnswer(s, false, true));
    s = advance(recordAnswer(s, true, true));
    expect(summarize(s).recovered).toBe(1);
  });

  it('cannot be graded twice on the same item', () => {
    let s = startSession('lesson', 'x', ['a'], 's1', NOW);
    s = recordAnswer(s, true, true);
    const again = recordAnswer(s, false, true);
    expect(again).toBe(s);
  });

  it('skips past an already-graded item on resume', () => {
    let s = startSession('lesson', 'x', ['a', 'b'], 's1', NOW);
    s = recordAnswer(s, true, true);
    expect(normalizeOnResume(s).position).toBe(1);
  });
});

describe('progression and XP', () => {
  it('only the first level is open for a new learner', () => {
    const p = freshProgress(NOW);
    expect(isUnlocked(p, UNITS, lessons[0].id)).toBe(true);
    expect(isUnlocked(p, UNITS, lessons[1].id)).toBe(false);
    expect(isUnlocked(p, UNITS, 'nope')).toBe(false);
  });

  it('awards first-clear XP plus perfect bonus and unlocks the next level', () => {
    const r = completeSession(freshProgress(NOW), play(lessons[0].id), UNITS, NOW)!;
    expect(r.result.xp).toBe(XP.lesson + XP.perfectBonus);
    expect(r.result.unlockedLessonId).toBe(lessons[1].id);
    expect(isUnlocked(r.progress, UNITS, lessons[1].id)).toBe(true);
    expect(r.result.newAchievements).toEqual(expect.arrayContaining(['first-rep', 'clean-sheet']));
  });

  it('does not let replays farm XP', () => {
    let p = clear(freshProgress(NOW), lessons[0].id);
    const xp = p.xp;
    for (let i = 0; i < 3; i++) p = clear(p, lessons[0].id);
    expect(p.xp).toBe(xp);
    expect(p.lessons[lessons[0].id].plays).toBe(4);
    expect(p.achievements['second-look']).toBeTruthy();
  });

  it('pays the perfect bonus once on a later replay', () => {
    const miss = [lessons[0].challenges[0].id];
    let p = clear(freshProgress(NOW), lessons[0].id, miss);
    expect(p.xp).toBe(XP.lesson);
    p = clear(p, lessons[0].id);
    expect(p.xp).toBe(XP.lesson + XP.perfectBonus);
    p = clear(p, lessons[0].id);
    expect(p.xp).toBe(XP.lesson + XP.perfectBonus);
  });

  it('ignores a duplicate completion of the same session', () => {
    const s = play(lessons[0].id, [], 'dup');
    const first = completeSession(freshProgress(NOW), s, UNITS, NOW)!;
    expect(completeSession(first.progress, s, UNITS, NOW)).toBeNull();
  });

  it('refuses to complete an unfinished session', () => {
    const s = startSession('lesson', lessons[0].id, ['u1-fv-1'], 'x', NOW);
    expect(completeSession(freshProgress(NOW), s, UNITS, NOW)).toBeNull();
  });

  it('reports unit completion and the pass badge after the checkpoint', () => {
    let p = freshProgress(NOW);
    for (const l of lessons.slice(0, -1)) p = clear(p, l.id);
    const r = completeSession(p, play('u1-checkpoint'), UNITS, NOW)!;
    expect(r.result.completedUnitId).toBe('u1');
    expect(r.result.newAchievements).toContain('front-door-pass');
    expect(nextLesson(r.progress, UNITS)).toBeNull();
  });

  it('missed items become review material and clean reviews clear them', () => {
    const missId = lessons[0].challenges[1].id;
    let p = clear(freshProgress(NOW), lessons[0].id, [missId]);
    expect(p.weakItems).toContain(missId);
    const q = buildReviewQueue(p, UNITS, 'seed');
    expect(q).toContain(missId);

    let s = startSession('review', 'review', q, 'rev1', NOW);
    while (!isFinished(s)) s = advance(recordAnswer(s, true, true));
    const r = completeSession(p, s, UNITS, NOW)!;
    expect(r.progress.weakItems).not.toContain(missId);
    expect(r.result.xp).toBe(XP.review);
    p = r.progress;

    let s2 = startSession('review', 'review', q, 'rev2', NOW);
    while (!isFinished(s2)) s2 = advance(recordAnswer(s2, true, true));
    const r2 = completeSession(p, s2, UNITS, NOW)!;
    expect(r2.result.xp).toBe(0); // once per day
    expect(r2.result.xpNote).toBeTruthy();
  });

  it('counts sessions toward the daily goal', () => {
    const r = completeSession(freshProgress(NOW), play(lessons[0].id), UNITS, NOW)!;
    expect(r.result.sessionsToday).toBe(1);
    expect(r.result.dailyGoalJustMet).toBe(true);
    expect(r.progress.activity[dayKey(NOW)]).toBe(1);
  });
});

describe('dates', () => {
  it('counts a run through yesterday when today has no session yet', () => {
    const a = { '2026-11-17': 1, '2026-11-18': 2 };
    expect(currentRun(a, NOW)).toBe(2);
    expect(currentRun({ ...a, '2026-11-19': 1 }, NOW)).toBe(3);
    expect(currentRun({ '2026-11-10': 1 }, NOW)).toBe(0);
  });
});

describe('storage', () => {
  it('round-trips progress', () => {
    const repo = new LocalProgressRepository(localStorage);
    const p = clear(freshProgress(NOW), lessons[0].id);
    repo.save(p);
    const loaded = repo.load(NOW);
    expect(loaded.recovered).toBe('none');
    expect(loaded.progress).toEqual(p);
  });

  it('recovers from garbage and keeps a copy of the unreadable data', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    const repo = new LocalProgressRepository(localStorage);
    const loaded = repo.load(NOW);
    expect(loaded.recovered).toBe('reset');
    expect(loaded.progress.xp).toBe(0);
    expect(Object.keys(localStorage).some((k) => k.includes('unreadable'))).toBe(true);
  });

  it('repairs individual bad fields instead of wiping everything', () => {
    const good = clear(freshProgress(NOW), lessons[0].id);
    const damaged = JSON.parse(JSON.stringify(good));
    damaged.weakItems = 'oops';
    damaged.activeSession = { id: 5 };
    damaged.lessons['bad'] = { completedAt: 'never' };
    const r = parseProgress(damaged, NOW)!;
    expect(r.partial).toBe(true);
    expect(r.progress.lessons[lessons[0].id]).toBeTruthy();
    expect(r.progress.lessons['bad']).toBeUndefined();
    expect(r.progress.weakItems).toEqual([]);
    expect(r.progress.activeSession).toBeNull();
    expect(r.progress.xp).toBe(good.xp);
  });

  it('rejects data from an unknown schema version', () => {
    expect(parseProgress({ version: 99 }, NOW)).toBeNull();
  });
});
