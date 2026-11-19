import { useEffect, useState } from 'react';

/**
 * Hash routing: survives refresh on any static host with no server config.
 *   #/            floor map
 *   #/play/:id    lesson or 'review'
 *   #/results     last session's results
 *   #/tune-up     review hub
 *   #/badges      achievements
 *   #/you         profile & settings
 *   #/welcome     first-run
 */
export type Route =
  | { name: 'map' }
  | { name: 'play'; id: string }
  | { name: 'results' }
  | { name: 'tune-up' }
  | { name: 'badges' }
  | { name: 'you' }
  | { name: 'welcome' }
  | { name: 'not-found'; path: string };

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/\/+$/, '') || '/';
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'map' };
  switch (parts[0]) {
    case 'play':
      return parts[1] ? { name: 'play', id: decodeURIComponent(parts[1]) } : { name: 'map' };
    case 'results':
      return { name: 'results' };
    case 'tune-up':
      return { name: 'tune-up' };
    case 'badges':
      return { name: 'badges' };
    case 'you':
      return { name: 'you' };
    case 'welcome':
      return { name: 'welcome' };
    default:
      return { name: 'not-found', path };
  }
}

export function navigate(to: string, replace = false) {
  const hash = to.startsWith('#') ? to : `#${to}`;
  if (replace) {
    history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = hash;
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', on);
    // A child may have redirected during the first commit, before this listener existed.
    on();
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}
