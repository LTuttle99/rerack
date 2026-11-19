import type { Challenge, Unit } from '../engine/types';
import { unit1 } from './unit1';

/**
 * The full map. Only units with status 'playable' can be entered; planned
 * units are shown honestly as "being written" with their topic list.
 */
export const UNITS: Unit[] = [
  unit1,
  {
    id: 'u2',
    number: 2,
    title: 'Body Basics',
    tagline: 'The words trainers use, decoded.',
    color: '--plate-blue',
    status: 'planned',
    lessons: [],
    plannedTopics: ['Major muscle groups', 'Push, pull, hinge, squat', 'Sets, reps and rest', 'Reading an exercise card'],
  },
  {
    id: 'u3',
    number: 3,
    title: 'Equipment Floor',
    tagline: 'Set up machines so they fit you.',
    color: '--signal',
    status: 'planned',
    lessons: [],
    plannedTopics: ['Cardio machines', 'Dumbbells', 'Machine setup', 'Cables and attachments'],
  },
  {
    id: 'u4',
    number: 4,
    title: 'First Moves',
    tagline: 'Patterns before weight.',
    color: '--plate-red',
    status: 'planned',
    lessons: [],
    plannedTopics: ['Squat pattern', 'Pushing and pulling', 'The hinge', 'Effort vs. pain'],
  },
  {
    id: 'u5',
    number: 5,
    title: 'Build a Session',
    tagline: 'Warm-up to cool-down.',
    color: '--plate-green',
    status: 'planned',
    lessons: [],
    plannedTopics: ['Warm-ups', 'Choosing exercises', 'Order and rest', 'Recovery basics'],
  },
  {
    id: 'u6',
    number: 6,
    title: 'Solo Visit',
    tagline: 'Your first trip on your own.',
    color: '--plate-blue',
    status: 'planned',
    lessons: [],
    plannedTopics: ['Real-floor scenarios', 'When equipment is taken', 'A simple starter routine', 'Final review'],
  },
];

const index = new Map<string, Challenge>();
for (const u of UNITS) for (const l of u.lessons) for (const c of l.challenges) {
  if (index.has(c.id)) throw new Error(`Duplicate challenge id: ${c.id}`);
  index.set(c.id, c);
}

export function getChallenge(id: string): Challenge | undefined {
  return index.get(id);
}

export function lessonOfChallenge(id: string): string | undefined {
  for (const u of UNITS) for (const l of u.lessons) if (l.challenges.some((c) => c.id === id)) return l.id;
  return undefined;
}
