import { useEffect, useRef, useState } from 'react';
import { UNITS } from '../content/curriculum';
import { isCompleted, isUnitComplete, isUnlocked, nextLesson, type Progress } from '../engine/progress';
import type { Lesson, Unit } from '../engine/types';
import { Icon } from '../components/Icon';
import { navigate } from '../state/route';
import { useStore } from '../state/store';
import { takePendingUnlock } from './mapSignals';

const W = 440; // logical trail width; nodes are placed as % of this
const ROW = 158;
const TOP = 74;
const OFFSETS = [0, 78, 104, 60, -30, -96, -84, -10];

type NodeState = 'done' | 'current' | 'locked';

function nodeState(p: Progress, lesson: Lesson): NodeState {
  if (isCompleted(p, lesson.id)) return 'done';
  return isUnlocked(p, UNITS, lesson.id) ? 'current' : 'locked';
}

export function MapScreen() {
  const { progress } = useStore();
  const next = nextLesson(progress, UNITS);
  const active = progress.activeSession;
  const activeLesson = active?.kind === 'lesson' ? UNITS.flatMap((u) => u.lessons).find((l) => l.id === active.lessonId) : undefined;

  return (
    <div className="map">
      {progress.profile.onboarded && Object.keys(progress.lessons).length === 0 && !active && <SpotterNote progress={progress} />}

      {active && active.position < active.queue.length && (
        <div className="resume">
          <div>
            <span className="resume-kicker">Saved mid-way</span>
            <span className="resume-title">
              {activeLesson ? activeLesson.title : 'Tune-up'} · {active.position} of {active.queue.length} done
            </span>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => navigate(`/play/${active.lessonId}`)}>
            Resume
          </button>
        </div>
      )}

      {UNITS.map((u) =>
        u.status === 'playable' ? (
          <Zone key={u.id} unit={u} progress={progress} nextId={next?.id ?? null} />
        ) : (
          <PlannedZone key={u.id} unit={u} />
        ),
      )}
    </div>
  );
}

function SpotterNote({ progress }: { progress: Progress }) {
  const { experience, access } = progress.profile;
  let line = 'Level 1 starts at the front desk. Each level takes about three minutes.';
  if (experience === 'returning') line = 'Been before? These levels will go fast, and the checkpoint will confirm what you already know.';
  else if (experience === 'some') line = 'Been once or twice? Level 1 fills the gaps people usually skip.';
  if (access === 'home') line += ' Training at home for now? This unit is what makes the first gym trip easy.';
  return (
    <aside className="spotter-note" aria-label="Getting started">
      <span className="spotter-label">Start here</span>
      <p>{line}</p>
    </aside>
  );
}

function ZoneSign({ unit, cleared, total }: { unit: Unit; cleared?: number; total?: number }) {
  return (
    <header className="zone-sign">
      <span className="zone-tab">Zone {String(unit.number).padStart(2, '0')}</span>
      <div className="zone-text">
        <h2 className="zone-title">{unit.title}</h2>
        <p className="zone-tag">{unit.tagline}</p>
      </div>
      {total !== undefined && (
        <div className="zone-progress">
          <span className="zone-count">
            <strong>{cleared}</strong>/{total}
          </span>
          <span
            className="zone-bar"
            role="progressbar"
            aria-label={`${unit.title}: ${cleared} of ${total} levels cleared`}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={cleared}
          >
            <span style={{ width: `${((cleared ?? 0) / total) * 100}%` }} />
          </span>
        </div>
      )}
    </header>
  );
}

function Zone({ unit, progress, nextId }: { unit: Unit; progress: Progress; nextId: string | null }) {
  const [open, setOpen] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const cleared = unit.lessons.filter((l) => isCompleted(progress, l.id)).length;
  const complete = isUnitComplete(progress, unit);

  const points = unit.lessons.map((_, i) => ({ x: W / 2 + OFFSETS[i % OFFSETS.length], y: TOP + i * ROW }));
  const height = TOP + (unit.lessons.length - 1) * ROW + 110;

  // Scroll the next level into view and play the unlock moment once.
  useEffect(() => {
    const pending = takePendingUnlock();
    if (pending && unit.lessons.some((l) => l.id === pending)) {
      setUnlocking(pending);
      const t = window.setTimeout(() => setUnlocking(null), 1600);
      return () => window.clearTimeout(t);
    }
  }, [unit.lessons]);

  useEffect(() => {
    if (!nextId) return;
    const raf = requestAnimationFrame(() => {
      const el = trailRef.current?.querySelector<HTMLElement>(`[data-lesson="${nextId}"]`);
      if (!el) return;
      const y = el.getBoundingClientRect().top;
      // Only move the page if the next level is out of comfortable view.
      if (y < 140 || y > window.innerHeight - 160) {
        window.scrollTo({ top: Math.max(0, y + window.scrollY - window.innerHeight * 0.42) });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [nextId]);

  // Close the popover on Escape or outside click.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        trailRef.current?.querySelector<HTMLElement>(`[data-lesson="${open}"] .plate`)?.focus();
        setOpen(null);
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest('.node') && !t.closest('.pop')) setOpen(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <section className={`zone ${complete ? 'is-complete' : ''}`} style={{ ['--zone' as string]: `var(${unit.color})` }} aria-label={`Zone ${unit.number}: ${unit.title}`}>
      <ZoneSign unit={unit} cleared={cleared} total={unit.lessons.length} />
      <div className="trail" ref={trailRef} style={{ height }}>
        <svg className="trail-svg" viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" aria-hidden="true">
          {points.slice(0, -1).map((p, i) => {
            const q = points[i + 1];
            const my = (p.y + q.y) / 2;
            const d = `M${p.x} ${p.y} C${p.x} ${my} ${q.x} ${my} ${q.x} ${q.y}`;
            const done = isCompleted(progress, unit.lessons[i].id);
            return (
              <g key={i}>
                <path d={d} className="tape-under" vectorEffect="non-scaling-stroke" />
                <path d={d} className={done ? 'tape-done' : 'tape-todo'} vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}
        </svg>
        <ol className="nodes">
          {unit.lessons.map((lesson, i) => {
            const st = nodeState(progress, lesson);
            const isNext = lesson.id === nextId;
            const resumable = progress.activeSession?.lessonId === lesson.id;
            const pt = points[i];
            const rec = progress.lessons[lesson.id];
            const popId = `pop-${lesson.id}`;
            return (
              <li
                key={lesson.id}
                data-lesson={lesson.id}
                className={`node node--${st} ${lesson.kind === 'checkpoint' ? 'node--checkpoint' : ''} ${isNext ? 'is-next' : ''} ${unlocking === lesson.id ? 'is-unlocking' : ''}`}
                style={{ left: `${(pt.x / W) * 100}%`, top: pt.y }}
              >
                {isNext && <span className="node-flag" aria-hidden="true">{resumable ? 'Resume' : Object.keys(progress.lessons).length === 0 ? 'Start' : 'Next'}</span>}
                <button
                  type="button"
                  className="plate"
                  aria-expanded={open === lesson.id}
                  aria-controls={popId}
                  aria-label={`${lesson.kind === 'checkpoint' ? 'Checkpoint' : `Level ${i + 1}`}: ${lesson.title}. ${st === 'done' ? 'Cleared' : st === 'current' ? 'Ready to play' : 'Locked'}.`}
                  onClick={() => setOpen(open === lesson.id ? null : lesson.id)}
                >
                  <span className="plate-hub" aria-hidden="true">
                    {st === 'done' ? <Icon name="check" size={20} /> : st === 'locked' ? <Icon name="lock" size={17} /> : <Icon name="play" size={18} />}
                  </span>
                </button>
                <span className="node-label" aria-hidden="true">
                  <span className="node-num">{lesson.kind === 'checkpoint' ? 'Checkpoint' : `Level ${i + 1}`}</span>
                  {lesson.title}
                </span>
                {open === lesson.id && (
                  <div className="pop" id={popId} role="dialog" aria-label={lesson.title}>
                    <p className="pop-kicker">
                      <Icon name="clock" size={15} /> ~{lesson.minutes} min · {lesson.challenges.length} challenges
                    </p>
                    <h3 className="pop-title">{lesson.title}</h3>
                    <p className="pop-summary">{lesson.summary}</p>
                    {st === 'locked' && (
                      <p className="pop-locked">Clear {i === 0 ? 'the previous zone' : `“${unit.lessons[i - 1].title}”`} to open this.</p>
                    )}
                    {st === 'current' && (
                      <button type="button" className="btn btn-primary btn-block" autoFocus onClick={() => navigate(`/play/${lesson.id}`)}>
                        {resumable ? 'Resume' : 'Start'} <Icon name="arrow-right" size={18} />
                      </button>
                    )}
                    {st === 'done' && rec && (
                      <>
                        <p className="pop-record">
                          Best: {Math.round(rec.bestAccuracy * 100)}% first try · {rec.xp} XP earned
                        </p>
                        <button type="button" className="btn btn-secondary btn-block" autoFocus onClick={() => navigate(`/play/${lesson.id}`)}>
                          <Icon name="replay" size={18} /> {resumable ? 'Resume replay' : 'Replay'}
                        </button>
                        <p className="pop-fine">{rec.perfectAwarded ? 'Practice only. All XP for this level is earned.' : 'Get a clean sheet for a one-time +5 XP.'}</p>
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
      {complete && <p className="zone-done"><Icon name="check" size={18} /> Zone cleared. Your {unit.title} Pass is on the badges page.</p>}
    </section>
  );
}

function PlannedZone({ unit }: { unit: Unit }) {
  return (
    <section className="zone zone--planned" style={{ ['--zone' as string]: `var(${unit.color})` }} aria-label={`Zone ${unit.number}: ${unit.title}, not available yet`}>
      <ZoneSign unit={unit} />
      <div className="shutter">
        <span className="shutter-plate">Being written</span>
        <ul className="shutter-topics">
          {unit.plannedTopics?.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </div>
    </section>
  );
}
