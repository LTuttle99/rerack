import { useEffect } from 'react';
import { SideRail, TabBar, TopBar } from './components/Nav';
import { TodayPanel } from './components/TodayPanel';
import { Icon } from './components/Icon';
import { MapScreen } from './screens/MapScreen';
import { BadgesPage, NotFound, TuneUpPage, Welcome, YouPage } from './screens/Pages';
import { Player } from './screens/Player';
import { Results } from './screens/Results';
import { navigate, useRoute } from './state/route';
import { useStore } from './state/store';

export default function App() {
  const route = useRoute();
  const { progress, notice, setNotice, storageAvailable } = useStore();

  // Motion preference drives a data attribute the CSS reads.
  useEffect(() => {
    document.documentElement.dataset.motion = progress.settings.motion;
  }, [progress.settings.motion]);

  // First run goes to the welcome card; returning learners go straight to the map.
  const firstRun = !progress.profile.onboarded && Object.keys(progress.lessons).length === 0 && !progress.activeSession;
  useEffect(() => {
    if (firstRun && route.name === 'map') navigate('/welcome', true);
  }, [firstRun, route.name]);

  useEffect(() => {
    const titles: Record<string, string> = { map: 'Map', 'tune-up': 'Tune-up', badges: 'Badges', you: 'You', results: 'Results', play: 'Playing', welcome: 'Welcome' };
    document.title = `${titles[route.name] ?? 'Rerack'} · Rerack`;
  }, [route.name]);

  if (route.name === 'welcome') return <Welcome />;
  if (route.name === 'play') return <Player key={route.id} id={route.id} />;
  if (route.name === 'results') return <Results />;

  return (
    <div className="shell">
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a>
      <SideRail route={route.name} />
      <TopBar />
      <main id="main" className="main" tabIndex={-1}>
        {!storageAvailable && (
          <div className="notice notice--warn" role="status">This browser is blocking storage, so progress won’t be kept after you close the tab.</div>
        )}
        {notice && (
          <div className={`notice notice--${notice.tone}`} role="status">
            <span>{notice.text}</span>
            <button type="button" className="icon-btn icon-btn--sm" aria-label="Dismiss" onClick={() => setNotice(null)}>
              <Icon name="x" size={18} />
            </button>
          </div>
        )}
        {route.name === 'map' && <MapScreen />}
        {route.name === 'tune-up' && <TuneUpPage />}
        {route.name === 'badges' && <BadgesPage />}
        {route.name === 'you' && <YouPage />}
        {route.name === 'not-found' && <NotFound />}
      </main>
      {route.name === 'map' && <TodayPanel />}
      <TabBar route={route.name} />
    </div>
  );
}
