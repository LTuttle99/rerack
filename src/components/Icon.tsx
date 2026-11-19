/** 24px stroke icons, drawn to match the 2px-ish weight of the UI. */

export type IconName =
  | 'check'
  | 'x'
  | 'lock'
  | 'play'
  | 'map'
  | 'tune'
  | 'badge'
  | 'user'
  | 'arrow-right'
  | 'replay'
  | 'flag'
  | 'clock';

const paths: Record<IconName, string> = {
  check: 'M5 12.5l4.5 4.5L19 7.5',
  x: 'M6 6l12 12M18 6L6 18',
  lock: 'M7 11V8a5 5 0 0110 0v3M5.5 11h13v9h-13z',
  play: 'M8 5.5v13l10.5-6.5z',
  map: 'M4 6.5l5-2 6 2 5-2v13l-5 2-6-2-5 2zM9 4.5v13M15 6.5v13',
  tune: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 4.5v5M9 14.5v5',
  badge: 'M12 3l2.6 2 3.3-.2.9 3.2 2.7 1.9-1.2 3.1 1.2 3.1-2.7 1.9-.9 3.2-3.3-.2L12 23l-2.6-2-3.3.2-.9-3.2L2.5 16.1l1.2-3.1-1.2-3.1 2.7-1.9.9-3.2 3.3.2z',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6',
  'arrow-right': 'M5 12h14M13 6l6 6-6 6',
  replay: 'M4.5 12a7.5 7.5 0 107.5-7.5H7M9.5 1.5L6.5 4.5l3 3',
  flag: 'M6 21V4M6 4.5h11l-2.5 4 2.5 4H6',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7.5V12l3 2',
};

export function Icon({ name, size = 22, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  );
}

/** The Rerack mark: two rack uprights with a plate seated on the J-hooks. */
export function RackMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect x="5" y="4" width="5" height="33" rx="1" fill="var(--ink)" />
      <rect x="30" y="4" width="5" height="33" rx="1" fill="var(--ink)" />
      <rect x="2" y="17" width="36" height="4" rx="1.5" fill="var(--ink)" />
      <circle cx="20" cy="19" r="10" fill="var(--signal)" stroke="var(--ink)" strokeWidth="3" />
      <circle cx="20" cy="19" r="2.6" fill="var(--ink)" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <RackMark />
      <span className="wordmark-text">Rerack</span>
    </span>
  );
}
