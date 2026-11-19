/**
 * Content model. Lesson content lives in /src/content as plain data;
 * nothing in here knows about React or storage.
 */

export type ArtName =
  | 'dumbbell'
  | 'kettlebell'
  | 'barbell'
  | 'bench'
  | 'treadmill'
  | 'rack'
  | 'cable'
  | 'machine'
  | 'floorplan';

interface ChallengeBase {
  /** Globally unique, stable id. Changing it orphans saved review data. */
  id: string;
  prompt: string;
  /** The teaching point. Always shown after checking, right or wrong. */
  explain: string;
}

export interface ChoiceChallenge extends ChallengeBase {
  type: 'choice';
  art?: ArtName;
  options: { id: string; text: string; why?: string }[];
  answer: string;
}

export interface PictureChallenge extends ChallengeBase {
  type: 'picture';
  options: { id: string; art: ArtName; label: string }[];
  answer: string;
}

export interface MatchChallenge extends ChallengeBase {
  type: 'match';
  pairs: { id: string; left: string; right: string }[];
}

export interface SequenceChallenge extends ChallengeBase {
  type: 'sequence';
  /** Listed in the correct order. Shuffled at play time. */
  steps: { id: string; text: string }[];
}

export interface SortChallenge extends ChallengeBase {
  type: 'sort';
  buckets: [{ id: string; label: string }, { id: string; label: string }];
  items: { id: string; text: string; bucket: string }[];
}

/** Region coordinates are in the art's 400×300 viewBox units. */
export interface HotspotRegion {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Which corner the number marker sits on, so it never hides the detail being asked about. */
  marker?: 'tl' | 'tr' | 'bl' | 'br';
}

export interface HotspotChallenge extends ChallengeBase {
  type: 'hotspot';
  art: ArtName;
  /** Plain-language description of the picture for screen readers. */
  artDescription: string;
  regions: HotspotRegion[];
  answer: string;
}

export interface SpotChallenge extends ChallengeBase {
  type: 'spot';
  scene: string;
  lines: { id: string; time: string; text: string; wrong: boolean; why: string }[];
}

export type Challenge =
  | ChoiceChallenge
  | PictureChallenge
  | MatchChallenge
  | SequenceChallenge
  | SortChallenge
  | HotspotChallenge
  | SpotChallenge;

export type ChallengeType = Challenge['type'];

export interface Lesson {
  id: string;
  unitId: string;
  kind: 'lesson' | 'checkpoint';
  title: string;
  summary: string;
  minutes: number;
  /** Shown on the results screen. What you should walk away knowing. */
  takeaways: string[];
  challenges: Challenge[];
}

export interface Unit {
  id: string;
  number: number;
  title: string;
  tagline: string;
  /** CSS custom property name for the zone colour, e.g. '--plate-green'. */
  color: string;
  status: 'playable' | 'planned';
  lessons: Lesson[];
  /** For planned units: the topics we intend to cover. */
  plannedTopics?: string[];
}

/* ---------- Responses (what the learner has entered so far) ---------- */

export type Response =
  | { type: 'choice'; selected: string | null }
  | { type: 'picture'; selected: string | null }
  | { type: 'hotspot'; selected: string | null }
  | { type: 'sequence'; order: string[] }
  | { type: 'sort'; assign: Record<string, string> }
  | { type: 'spot'; selected: string[] }
  | { type: 'match'; matched: string[]; wrong: number };

export interface Grade {
  correct: boolean;
  /** Short note about the learner's specific answer, if we have one. */
  note?: string;
}
