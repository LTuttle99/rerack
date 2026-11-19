import type { AchievementDef } from '../engine/achievements';

/**
 * Badges are drawn like embroidered gym patches: a stitched outline, a
 * shape that varies by badge, and one simple glyph.
 */
const SHAPES: Record<AchievementDef['shape'], string> = {
  round: 'M50 6a44 44 0 110 88 44 44 0 010-88z',
  shield: 'M50 5l38 12v30c0 24-16 40-38 48C28 87 12 71 12 47V17z',
  hex: 'M50 5l39 22.5v45L50 95 11 72.5v-45z',
  ticket: 'M8 22h84v16a12 12 0 000 24v16H8V62a12 12 0 000-24z',
};

const GLYPHS: Record<AchievementDef['glyph'], string> = {
  rep: 'M30 50h40M34 40v20M66 40v20M26 44v12M74 44v12',
  sheet: 'M36 30h28v40H36zM42 42l6 6 10-12M42 60h16',
  bounce: 'M30 62c6-18 14-26 20-26s14 8 20 26M64 54l6 8 8-6',
  rules: 'M38 30h24M38 42h24M38 54h16M34 70h32',
  wrench: 'M58 34a10 10 0 00-12 13L32 61l7 7 14-14a10 10 0 0013-12l-6 6-7-2-2-7z',
  calendar: 'M32 36h36v32H32zM32 46h36M40 30v10M60 30v10M40 56h4M48 56h4M56 56h4',
  pass: 'M30 42h40M30 52h28M30 62h20M64 56l4 4 8-10',
  replay: 'M36 50a14 14 0 1014-14h-8M46 30l-6 6 6 6',
};

export function Badge({ def, earned, size = 88 }: { def: AchievementDef; earned: boolean; size?: number }) {
  const fill = earned ? `var(${def.color})` : 'var(--paper-2)';
  const glyph = earned ? (def.color === '--signal' ? 'var(--ink)' : 'var(--paper-hi)') : 'var(--ink-3)';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={`badge ${earned ? 'is-earned' : 'is-locked'}`} aria-hidden="true" focusable="false">
      <path d={SHAPES[def.shape]} fill={fill} stroke="var(--ink)" strokeWidth={4} strokeLinejoin="round" />
      <path
        d={SHAPES[def.shape]}
        fill="none"
        stroke={earned ? 'rgba(255,255,255,.55)' : 'var(--ink-3)'}
        strokeWidth={1.6}
        strokeDasharray="3 3"
        transform="translate(50 50) scale(.84) translate(-50 -50)"
      />
      <path d={GLYPHS[def.glyph]} fill="none" stroke={glyph} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
