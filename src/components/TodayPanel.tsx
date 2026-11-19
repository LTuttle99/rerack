import { UNITS } from '../content/curriculum';
import { ACHIEVEMENTS } from '../engine/achievements';
import { currentRun, dayKey, weekDays } from '../engine/dates';
import { nextLesson, sessionsOn } from '../engine/progress';
import { weakItemCount } from '../engine/review';
import { navigate } from '../state/route';
import { useStore } from '../state/store';
import { Icon } from './Icon';

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function TodayPanel() {
  const { progress } = useStore();
  const now = new Date();
  const today = sessionsOn(progress, now);
  const goal = progress.profile.dailyGoal;
  const run = currentRun(progress.activity, now);
  const next = nextLesson(progress, UNITS);
  const weak = weakItemCount(progress, UNITS);
  const earned = Object.keys(progress.achievements).length;
  const anyCleared = Object.keys(progress.lessons).length > 0;
  const todayKey = dayKey(now);

  return (
    <aside className="today" aria-label="Your progress today">
      <section className="today-block today-xp">
        <span className="today-label">Total XP</span>
        <span className="today-big">{progress.xp}</span>
        <button type="button" className="link-btn" onClick={() => navigate('/badges')}>
          {earned} of {ACHIEVEMENTS.length} badges <Icon name="arrow-right" size={16} />
        </button>
      </section>

      <section className="today-block">
        <div className="today-row">
          <span className="today-label">Today</span>
          <span className="today-val">{Math.min(today, goal)}/{goal} {goal === 1 ? 'session' : 'sessions'}</span>
        </div>
        <div className="goal-segs" role="progressbar" aria-label="Daily goal" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={Math.min(today, goal)}>
          {Array.from({ length: goal }, (_, i) => <span key={i} className={i < today ? 'is-on' : ''} />)}
        </div>
        <p className="today-fine">{today >= goal ? 'Goal met. Nice work.' : 'Any level, replay or tune-up counts.'}</p>
      </section>

      <section className="today-block">
        <div className="today-row">
          <span className="today-label">This week</span>
          <span className="today-val">{run > 0 ? `${run}-day run` : 'No run yet'}</span>
        </div>
        <ol className="week" aria-label="Days learned this week">
          {weekDays(now).map((d, i) => {
            const k = dayKey(d);
            const on = (progress.activity[k] ?? 0) > 0;
            return (
              <li key={k} className={`${on ? 'is-on' : ''} ${k === todayKey ? 'is-today' : ''}`}>
                <span aria-hidden="true">{DOW[i]}</span>
                <span className="sr-only">{d.toLocaleDateString(undefined, { weekday: 'long' })}: {on ? 'learned' : 'no session'}</span>
              </li>
            );
          })}
        </ol>
        <p className="today-fine">Missing a day doesn’t cost you anything.</p>
      </section>

      {next && (
        <section className="today-block today-next">
          <span className="today-label">Up next</span>
          <span className="today-title">{next.title}</span>
          <button type="button" className="btn btn-primary btn-block" onClick={() => navigate(`/play/${next.id}`)}>
            {progress.activeSession?.lessonId === next.id ? 'Resume' : 'Start'} <Icon name="arrow-right" size={18} />
          </button>
        </section>
      )}

      {anyCleared && (
        <section className="today-block">
          <span className="today-label">Tune-up</span>
          <p className="today-fine today-fine--lead">
            {weak > 0 ? `${weak} ${weak === 1 ? 'question' : 'questions'} you missed, mixed with a few you know.` : 'A quick mixed review of what you’ve cleared.'}
          </p>
          <button type="button" className="btn btn-secondary btn-block" onClick={() => navigate('/play/review')}>
            <Icon name="tune" size={18} /> Start tune-up
          </button>
        </section>
      )}
    </aside>
  );
}
