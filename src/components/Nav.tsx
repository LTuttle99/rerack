import type { Route } from '../state/route';
import { useStore } from '../state/store';
import { Icon, Wordmark, type IconName } from './Icon';
import { sessionsOn } from '../engine/progress';

const ITEMS: { to: string; label: string; icon: IconName; route: Route['name'] }[] = [
  { to: '#/', label: 'Map', icon: 'map', route: 'map' },
  { to: '#/tune-up', label: 'Tune-up', icon: 'tune', route: 'tune-up' },
  { to: '#/badges', label: 'Badges', icon: 'badge', route: 'badges' },
  { to: '#/you', label: 'You', icon: 'user', route: 'you' },
];

export function SideRail({ route }: { route: Route['name'] }) {
  return (
    <nav className="rail" aria-label="Main">
      <a href="#/" className="rail-brand" aria-label="Rerack home">
        <Wordmark />
      </a>
      <ul>
        {ITEMS.map((i) => (
          <li key={i.to}>
            <a href={i.to} className={`rail-link ${route === i.route ? 'is-active' : ''}`} aria-current={route === i.route ? 'page' : undefined}>
              <Icon name={i.icon} /> {i.label}
            </a>
          </li>
        ))}
      </ul>
      <p className="rail-fine">Progress is saved on this device.</p>
    </nav>
  );
}

export function TabBar({ route }: { route: Route['name'] }) {
  return (
    <nav className="tabbar" aria-label="Main">
      {ITEMS.map((i) => (
        <a key={i.to} href={i.to} className={`tab ${route === i.route ? 'is-active' : ''}`} aria-current={route === i.route ? 'page' : undefined}>
          <Icon name={i.icon} />
          <span>{i.label}</span>
        </a>
      ))}
    </nav>
  );
}

/** Compact stats bar for small screens, where the Today panel doesn't fit beside the map. */
export function TopBar() {
  const { progress } = useStore();
  const today = sessionsOn(progress, new Date());
  const goal = progress.profile.dailyGoal;
  return (
    <header className="topbar">
      <a href="#/" aria-label="Rerack home"><Wordmark /></a>
      <div className="topbar-stats">
        <span className="chip" aria-label={`Today: ${Math.min(today, goal)} of ${goal} sessions`}>
          <span className={`chip-dot ${today >= goal ? 'is-on' : ''}`} aria-hidden="true" />
          {Math.min(today, goal)}/{goal}
        </span>
        <span className="chip chip--xp" aria-label={`${progress.xp} XP`}>{progress.xp} XP</span>
      </div>
    </header>
  );
}
