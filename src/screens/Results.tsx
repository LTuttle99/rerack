import { useEffect, useRef, useState } from 'react';
import { UNITS } from '../content/curriculum';
import { achievementById } from '../engine/achievements';
import { findLesson } from '../engine/progress';
import { Badge } from '../components/Badge';
import { Icon, RackMark } from '../components/Icon';
import { navigate } from '../state/route';
import { useStore } from '../state/store';
import { setPendingUnlock } from './mapSignals';

function useCountUp(target: number, ms = 700) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const reduce =
      document.documentElement.dataset.motion === 'reduced' ||
      (document.documentElement.dataset.motion !== 'full' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    if (reduce || target === 0) {
      setN(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      setN(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

export function Results() {
  const { lastResult: r, progress } = useStore();
  const headRef = useRef<HTMLHeadingElement>(null);
  const xp = useCountUp(r?.xp ?? 0);

  useEffect(() => {
    if (!r) navigate('/', true);
    else headRef.current?.focus();
  }, [r]);
  if (!r) return null;

  const lesson = r.kind === 'lesson' ? findLesson(UNITS, r.lessonId) : undefined;
  const unit = r.completedUnitId ? UNITS.find((u) => u.id === r.completedUnitId) : undefined;
  const goal = progress.profile.dailyGoal;
  const sign =
    r.kind === 'review'
      ? 'Tune-up done'
      : lesson?.kind === 'checkpoint'
        ? r.firstClear ? 'Checkpoint passed' : 'Checkpoint replayed'
        : r.firstClear ? 'Level cleared' : 'Level replayed';

  const done = () => {
    if (r.unlockedLessonId) setPendingUnlock(r.unlockedLessonId);
    navigate('/');
  };

  return (
    <div className="results">
      <div className="results-card">
        <p className="results-sign">{sign}</p>
        <h1 className="results-title" tabIndex={-1} ref={headRef}>{lesson?.title ?? 'Mixed review'}</h1>

        <dl className="results-stats">
          <div className="stat stat--xp">
            <dt>XP earned</dt>
            <dd><span className="stat-big">+{xp}</span></dd>
          </div>
          <div className="stat">
            <dt>First try</dt>
            <dd><span className="stat-big">{r.summary.firstTryCorrect}</span><span className="stat-of">/{r.summary.total}</span></dd>
          </div>
          <div className="stat">
            <dt>Today</dt>
            <dd><span className="stat-big">{Math.min(r.sessionsToday, goal)}</span><span className="stat-of">/{goal} {goal === 1 ? 'session' : 'sessions'}</span></dd>
          </div>
        </dl>

        {r.breakdown.length > 0 && (
          <ul className="results-breakdown">
            {r.breakdown.map((b) => (
              <li key={b.label}><span>{b.label}</span><span>+{b.xp} XP</span></li>
            ))}
          </ul>
        )}
        {r.xpNote && <p className="results-note">{r.xpNote}</p>}
        {r.dailyGoalJustMet && <p className="results-goal"><Icon name="check" size={18} /> Daily goal met. Anything more today is a bonus.</p>}
        {r.summary.recovered > 0 && (
          <p className="results-goal results-goal--soft">
            You fixed {r.summary.recovered} {r.summary.recovered === 1 ? 'miss' : 'misses'} on the second look. That’s the learning part.
          </p>
        )}

        {unit && (
          <section className="pass" aria-label={`${unit.title} pass`}>
            <div className="pass-left">
              <RackMark size={40} />
              <span className="pass-kicker">Rerack · Zone {unit.number}</span>
              <span className="pass-name">{unit.title} Pass</span>
              <span className="pass-sub">Unit complete</span>
            </div>
            <ul className="pass-skills">
              {(lesson?.takeaways ?? []).map((t) => <li key={t}>{t}</li>)}
            </ul>
            <span className="pass-stamp" aria-hidden="true">Cleared</span>
          </section>
        )}

        {r.newAchievements.length > 0 && (
          <section className="results-badges" aria-label="New badges">
            <h2 className="section-label">New {r.newAchievements.length === 1 ? 'badge' : 'badges'}</h2>
            <ul>
              {r.newAchievements.map((id) => {
                const def = achievementById(id);
                if (!def) return null;
                return (
                  <li key={id} className="new-badge">
                    <Badge def={def} earned size={64} />
                    <span><strong>{def.title}</strong><br />{def.meaning}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {lesson && !unit && (
          <section className="takeaways">
            <h2 className="section-label">What you now know</h2>
            <ul>{lesson.takeaways.map((t) => <li key={t}>{t}</li>)}</ul>
          </section>
        )}

        <div className="results-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={done}>
            {r.unlockedLessonId ? 'Continue to next level' : 'Back to the map'} <Icon name="arrow-right" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
