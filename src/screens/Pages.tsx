import { useState } from 'react';
import { UNITS } from '../content/curriculum';
import { ACHIEVEMENTS } from '../engine/achievements';
import { currentRun, dayKey } from '../engine/dates';
import { playableLessons, XP, type Access, type DailyGoal, type Experience, type MotionPref } from '../engine/progress';
import { REVIEW_SIZE, weakItemCount } from '../engine/review';
import { Badge } from '../components/Badge';
import { Icon, RackMark } from '../components/Icon';
import { navigate } from '../state/route';
import { useStore } from '../state/store';

/* ---------------- Tune-up & replay hub ---------------- */

export function TuneUpPage() {
  const { progress } = useStore();
  const cleared = playableLessons(UNITS).filter((l) => progress.lessons[l.id]);
  const weak = weakItemCount(progress, UNITS);
  const xpToday = !progress.reviewXpDays.includes(dayKey(new Date()));

  return (
    <div className="page">
      <h1 className="page-title">Tune-up</h1>
      <p className="page-lead">Short mixed reviews pull back the questions you missed so they stick. Replays let you run any cleared level again.</p>

      <section className="panel tune">
        <div className="tune-main">
          <span className="tune-count">{weak}</span>
          <div>
            <p className="tune-line">{weak === 1 ? 'question' : 'questions'} waiting for a second look</p>
            <p className="fine">
              {REVIEW_SIZE} questions per tune-up · {xpToday ? `+${XP.review} XP for your first one today` : 'Today’s tune-up XP is earned'}
            </p>
          </div>
        </div>
        <button type="button" className="btn btn-primary" disabled={cleared.length === 0} onClick={() => navigate('/play/review')}>
          <Icon name="tune" size={18} /> Start tune-up
        </button>
        {cleared.length === 0 && <p className="fine">Clear your first level to unlock tune-ups.</p>}
      </section>

      <h2 className="section-label">Replay a level</h2>
      {cleared.length === 0 ? (
        <p className="empty">Levels you clear will show up here.</p>
      ) : (
        <ul className="replay-list">
          {cleared.map((l) => {
            const rec = progress.lessons[l.id];
            return (
              <li key={l.id} className="replay-row">
                <div>
                  <span className="replay-title">{l.title}</span>
                  <span className="fine">
                    Best {Math.round(rec.bestAccuracy * 100)}% first try · played {rec.plays}×
                  </span>
                </div>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(`/play/${l.id}`)} aria-label={`Replay ${l.title}`}>
                  <Icon name="replay" size={18} /> Replay
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------------- Badges & record ---------------- */

export function BadgesPage() {
  const { progress } = useStore();
  const cleared = Object.keys(progress.lessons).length;
  const days = Object.values(progress.activity).filter((n) => n > 0).length;
  const total = playableLessons(UNITS).length;

  return (
    <div className="page">
      <h1 className="page-title">Badges</h1>
      <dl className="record">
        <div><dt>XP</dt><dd>{progress.xp}</dd></div>
        <div><dt>Levels cleared</dt><dd>{cleared}<small>/{total}</small></dd></div>
        <div><dt>Days learned</dt><dd>{days}</dd></div>
        <div><dt>Current run</dt><dd>{currentRun(progress.activity, new Date())}<small> days</small></dd></div>
      </dl>
      <ul className="badge-wall">
        {ACHIEVEMENTS.map((a) => {
          const at = progress.achievements[a.id];
          return (
            <li key={a.id} className={`badge-card ${at ? 'is-earned' : ''}`}>
              <Badge def={a} earned={Boolean(at)} />
              <div>
                <h2 className="badge-title">{a.title}</h2>
                <p className="badge-desc">{at ? a.meaning : a.how}</p>
                <p className="fine">{at ? `Earned ${new Date(at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'Not yet'}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------------- Profile & settings ---------------- */

function Chips<T extends string | number>({ label, value, options, onPick }: { label: string; value: T | null; options: { v: T; l: string }[]; onPick: (v: T) => void }) {
  return (
    <fieldset className="chips">
      <legend>{label}</legend>
      <div className="chips-row">
        {options.map((o) => (
          <button key={String(o.v)} type="button" className={`chip-btn ${value === o.v ? 'is-on' : ''}`} aria-pressed={value === o.v} onClick={() => onPick(o.v)}>
            {o.l}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export const EXPERIENCE_OPTS: { v: Experience; l: string }[] = [
  { v: 'new', l: 'Never been' },
  { v: 'some', l: 'Once or twice' },
  { v: 'returning', l: 'Coming back' },
];
export const ACCESS_OPTS: { v: Access; l: string }[] = [
  { v: 'gym', l: 'I have a gym' },
  { v: 'home', l: 'Home for now' },
  { v: 'undecided', l: 'Still deciding' },
];
export const GOAL_OPTS: { v: DailyGoal; l: string }[] = [
  { v: 1, l: '1 a day · ~3 min' },
  { v: 2, l: '2 a day · ~6 min' },
  { v: 3, l: '3 a day · ~10 min' },
];

export function YouPage() {
  const { progress, updateProfile, updateSettings, resetAll, storageAvailable } = useStore();
  const [confirming, setConfirming] = useState(false);
  const motion: { v: MotionPref; l: string }[] = [
    { v: 'system', l: 'Match device' },
    { v: 'reduced', l: 'Reduced' },
    { v: 'full', l: 'Full' },
  ];

  return (
    <div className="page">
      <h1 className="page-title">You</h1>
      <section className="panel stack">
        <Chips label="Gym experience" value={progress.profile.experience} options={EXPERIENCE_OPTS} onPick={(v) => updateProfile({ experience: v })} />
        <Chips label="Where you’ll train" value={progress.profile.access} options={ACCESS_OPTS} onPick={(v) => updateProfile({ access: v })} />
        <Chips label="Daily goal" value={progress.profile.dailyGoal} options={GOAL_OPTS} onPick={(v) => updateProfile({ dailyGoal: v })} />
        <Chips label="Motion" value={progress.settings.motion} options={motion} onPick={(v) => updateSettings({ motion: v })} />
      </section>

      <section className="panel stack">
        <h2 className="section-label">Your data</h2>
        <p>
          {storageAvailable
            ? 'Your progress is saved in this browser on this device. There’s no account and nothing is sent anywhere. Clearing your browser data will erase it.'
            : 'This browser is blocking storage (often private mode), so progress will be lost when you close the tab.'}
        </p>
        {!confirming ? (
          <button type="button" className="btn btn-quiet" onClick={() => setConfirming(true)}>Reset all progress…</button>
        ) : (
          <div className="confirm" role="alertdialog" aria-label="Confirm reset">
            <p><strong>Erase all XP, levels and badges?</strong> This can’t be undone.</p>
            <div className="confirm-row">
              <button type="button" className="btn btn-danger" onClick={() => { resetAll(); setConfirming(false); navigate('/welcome'); }}>Erase everything</button>
              <button type="button" className="btn btn-secondary" autoFocus onClick={() => setConfirming(false)}>Keep my progress</button>
            </div>
          </div>
        )}
      </section>

      <section className="panel stack">
        <h2 className="section-label">About the content</h2>
        <p>Rerack teaches general gym knowledge for beginners. It isn’t medical advice or a personal training plan. If something hurts, stop, and check with a qualified professional.</p>
      </section>
    </div>
  );
}

/* ---------------- First run ---------------- */

export function Welcome() {
  const { progress, updateProfile, notice, setNotice } = useStore();
  const [exp, setExp] = useState<Experience | null>(progress.profile.experience);
  const [access, setAccess] = useState<Access | null>(progress.profile.access);
  const [goal, setGoal] = useState<DailyGoal>(progress.profile.dailyGoal);
  const first = playableLessons(UNITS)[0];

  const go = (to: string) => {
    updateProfile({ experience: exp, access, dailyGoal: goal, onboarded: true });
    navigate(to, true);
  };

  return (
    <div className="welcome">
      <div className="welcome-card">
        {notice && (
          <div className={`notice notice--${notice.tone}`} role="status">
            <span>{notice.text}</span>
            <button type="button" className="icon-btn icon-btn--sm" aria-label="Dismiss" onClick={() => setNotice(null)}>
              <Icon name="x" size={18} />
            </button>
          </div>
        )}
        <RackMark size={56} />
        <h1 className="welcome-title">Learn the gym<br />before you walk in.</h1>
        <p className="welcome-lead">
          Three-minute levels on the stuff nobody explains: where things are, what they’re called, and the unwritten rules.
        </p>
        <button type="button" className="btn btn-primary btn-lg btn-block" onClick={() => go(`/play/${first.id}`)}>
          Start level 1: {first.title} <Icon name="arrow-right" size={20} />
        </button>

        <details className="welcome-more">
          <summary>Tell us a little first (optional)</summary>
          <div className="stack">
            <Chips label="Gym experience" value={exp} options={EXPERIENCE_OPTS} onPick={setExp} />
            <Chips label="Where you’ll train" value={access} options={ACCESS_OPTS} onPick={setAccess} />
            <Chips label="Daily goal" value={goal} options={GOAL_OPTS} onPick={setGoal} />
          </div>
        </details>

        <button type="button" className="link-btn" onClick={() => go('/')}>Look at the map first</button>
        <p className="fine welcome-fine">No sign-up. Progress stays on this device.</p>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="page">
      <h1 className="page-title">Wrong turn</h1>
      <p className="page-lead">That page doesn’t exist. Your progress is safe.</p>
      <button type="button" className="btn btn-primary" onClick={() => navigate('/', true)}>Back to the map</button>
    </div>
  );
}
