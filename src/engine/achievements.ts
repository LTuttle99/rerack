import type { Progress } from './progress';
import type { Session, SessionSummary } from './session';
import type { Unit } from './types';

export interface AchievementDef {
  id: string;
  title: string;
  /** How to earn it — shown on locked badges, so it must be specific. */
  how: string;
  /** What it means once earned. */
  meaning: string;
  shape: 'round' | 'shield' | 'hex' | 'ticket';
  color: string;
  glyph: 'rep' | 'sheet' | 'bounce' | 'rules' | 'wrench' | 'calendar' | 'pass' | 'replay';
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-rep', title: 'First Rep', how: 'Clear your first level.', meaning: 'You started. That is the hardest part.', shape: 'round', color: '--plate-green', glyph: 'rep' },
  { id: 'clean-sheet', title: 'Clean Sheet', how: 'Clear any level with every answer right on the first try.', meaning: 'A full level without a single miss.', shape: 'shield', color: '--plate-blue', glyph: 'sheet' },
  { id: 'bounce-back', title: 'Bounce Back', how: 'Miss a question, then get it right when it comes back.', meaning: 'You learned from a miss inside the same lesson.', shape: 'hex', color: '--plate-red', glyph: 'bounce' },
  { id: 'house-rules', title: 'House Rules', how: 'Clear the House Rules level.', meaning: 'You know the unwritten rules most people learn the awkward way.', shape: 'shield', color: '--signal', glyph: 'rules' },
  { id: 'tune-up', title: 'Tune-Up', how: 'Finish a tune-up review session.', meaning: 'You came back to the hard stuff on purpose.', shape: 'round', color: '--plate-blue', glyph: 'wrench' },
  { id: 'second-look', title: 'Second Look', how: 'Replay a level you already cleared.', meaning: 'Repetition is how this sticks.', shape: 'hex', color: '--plate-green', glyph: 'replay' },
  { id: 'three-days', title: 'Three Days In', how: 'Learn on three different days.', meaning: 'Short, spread-out sessions beat one long cram.', shape: 'round', color: '--plate-red', glyph: 'calendar' },
  { id: 'front-door-pass', title: 'Front Door Pass', how: 'Pass the Front Door checkpoint.', meaning: 'You know your way around a gym before you walk in.', shape: 'ticket', color: '--signal', glyph: 'pass' },
];

export interface AchievementContext {
  before: Progress;
  after: Progress;
  session: Session;
  summary: SessionSummary;
  units: Unit[];
  now: Date;
}

const RULES: Record<string, (c: AchievementContext) => boolean> = {
  'first-rep': (c) => c.session.kind === 'lesson' && Object.keys(c.after.lessons).length >= 1,
  'clean-sheet': (c) => c.session.kind === 'lesson' && c.summary.perfect,
  'bounce-back': (c) => c.summary.recovered > 0,
  'house-rules': (c) => Boolean(c.after.lessons['u1-etiquette']),
  'tune-up': (c) => c.after.reviewsCompleted >= 1,
  'second-look': (c) => c.after.replays >= 1,
  'three-days': (c) => Object.values(c.after.activity).filter((n) => n > 0).length >= 3,
  'front-door-pass': (c) => Boolean(c.after.lessons['u1-checkpoint']),
};

export function evaluateAchievements(c: AchievementContext): string[] {
  return ACHIEVEMENTS.filter((a) => RULES[a.id]?.(c)).map((a) => a.id);
}

export function achievementById(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
