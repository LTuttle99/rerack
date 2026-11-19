import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { ART_DESCRIPTIONS } from '../components/art/Art';
import { getChallenge, UNITS } from '../content/curriculum';
import { STORAGE_KEY } from '../engine/storage';
import type { Challenge } from '../engine/types';
import { StoreProvider } from '../state/store';

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function renderApp() {
  return render(
    <StoreProvider>
      <App />
    </StoreProvider>,
  );
}

async function go(hash: string) {
  await act(async () => {
    window.location.hash = hash;
    await new Promise((r) => setTimeout(r, 0));
  });
}

/** Read which challenge is on screen by matching the prompt heading. */
function currentChallenge(): Challenge {
  const heading = screen.getByRole('heading', { level: 1 });
  const all = UNITS.flatMap((u) => u.lessons.flatMap((l) => l.challenges));
  const c = all.find((x) => x.prompt === heading.textContent);
  if (!c) throw new Error(`No challenge for prompt: ${heading.textContent}`);
  return c;
}

/** Answer the on-screen challenge correctly using only the UI, then continue. */
async function answerCorrectly(user: ReturnType<typeof userEvent.setup>) {
  const c = currentChallenge();
  switch (c.type) {
    case 'choice': {
      const opt = c.options.find((o) => o.id === c.answer)!;
      await user.click(screen.getByRole('radio', { name: new RegExp(esc(opt.text)) }));
      break;
    }
    case 'picture': {
      const opt = c.options.find((o) => o.id === c.answer)!;
      await user.click(screen.getByRole('radio', { name: new RegExp(esc(ART_DESCRIPTIONS[opt.art])) }));
      break;
    }
    case 'hotspot': {
      const i = c.regions.findIndex((r) => r.id === c.answer);
      await user.click(screen.getByRole('button', { name: `Spot ${i + 1}` }));
      break;
    }
    case 'sequence':
      for (const s of c.steps) await user.click(screen.getByRole('button', { name: s.text }));
      break;
    case 'sort':
      for (const item of c.items) {
        const group = screen.getByRole('radiogroup', { name: item.text });
        const label = c.buckets.find((b) => b.id === item.bucket)!.label;
        await user.click(within(group).getByRole('radio', { name: label }));
      }
      break;
    case 'spot':
      for (const l of c.lines.filter((x) => x.wrong)) {
        await user.click(screen.getByRole('button', { name: new RegExp(esc(l.text)) }));
      }
      break;
    case 'match':
      for (const p of c.pairs) {
        await user.click(screen.getByRole('button', { name: p.left }));
        await user.click(screen.getByRole('button', { name: p.right }));
      }
      break;
  }
  if (c.type !== 'match') await user.click(screen.getByRole('button', { name: 'Check' }));
  await screen.findByRole('button', { name: 'Continue' }, { timeout: 2000 });
  expect(screen.getByRole('status')).toHaveTextContent(c.explain.slice(0, 40));
  await user.click(screen.getByRole('button', { name: 'Continue' }));
}

beforeEach(async () => {
  window.scrollTo = () => {};
  history.replaceState(null, '', '#/');
});

describe('first-time learner', () => {
  it('lands on the welcome card and can start level 1 immediately', async () => {
    const user = userEvent.setup();
    renderApp();
    const start = await screen.findByRole('button', { name: /Start level 1/ });
    await user.click(start);
    expect(await screen.findByRole('progressbar', { name: 'Lesson progress' })).toBeInTheDocument();
    expect(currentChallenge().id).toBe('u1-fv-1');
  });

  it('plays level 1 end-to-end, earns XP and unlocks level 2', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(await screen.findByRole('button', { name: /Start level 1/ }));
    await screen.findByRole('progressbar', { name: 'Lesson progress' });

    const lesson = UNITS[0].lessons[0];
    for (let i = 0; i < lesson.challenges.length; i++) await answerCorrectly(user);

    expect(await screen.findByText('Level cleared', { selector: '.results-sign' })).toBeInTheDocument();
    expect(screen.getByText('Clean sheet bonus')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Continue to next level/ }));

    expect(await screen.findByRole('button', { name: /Level 2: Read the Floor\. Ready to play/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Level 1: First Visit\. Cleared/ })).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.xp).toBe(15);
    expect(saved.achievements['first-rep']).toBeTruthy();
  }, 20000);
});

describe('mistakes', () => {
  it('explains a wrong answer and brings the question back at the end', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(await screen.findByRole('button', { name: /Start level 1/ }));
    await screen.findByRole('progressbar', { name: 'Lesson progress' });

    await user.click(screen.getByRole('radio', { name: /heaviest weight/ }));
    await user.click(screen.getByRole('button', { name: 'Check' }));
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(/Testing your max on day one/);
    expect(status).toHaveTextContent(/come back at the end/);
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.activeSession.queue.at(-1)).toBe('u1-fv-1');
    expect(saved.activeSession.firstTryMisses).toEqual(['u1-fv-1']);
  });
});

describe('persistence', () => {
  it('resumes mid-lesson after a refresh', async () => {
    const user = userEvent.setup();
    const first = renderApp();
    await user.click(await screen.findByRole('button', { name: /Start level 1/ }));
    await screen.findByRole('progressbar', { name: 'Lesson progress' });
    await answerCorrectly(user);
    const second = currentChallenge().id;
    first.unmount();

    renderApp(); // same hash, fresh app = refresh
    await screen.findByRole('progressbar', { name: 'Lesson progress' });
    expect(currentChallenge().id).toBe(second);
  });

  it('shows a friendly notice when saved data is corrupted', async () => {
    localStorage.setItem(STORAGE_KEY, '{"version":1,"lessons":');
    renderApp();
    expect(await screen.findByText(/couldn’t read your saved progress/)).toBeInTheDocument();
  });
});

describe('locked content', () => {
  it('redirects a locked level back to the map with an explanation', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, createdAt: new Date().toISOString(), xp: 0, lessons: {}, activity: {}, reviewXpDays: [], weakItems: [], achievements: {}, completedSessionIds: [], reviewsCompleted: 0, replays: 0, profile: { experience: null, access: null, dailyGoal: 1, onboarded: true }, settings: { motion: 'system' }, activeSession: null }),
    );
    history.replaceState(null, '', '#/play/u1-kit');
    renderApp();
    expect(await screen.findByText(/isn’t open yet/)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Zone 1: Front Door/ })).toBeInTheDocument();
  });

  it('marks unwritten units as not available and offers no way in', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, createdAt: new Date().toISOString(), xp: 0, lessons: {}, activity: {}, reviewXpDays: [], weakItems: [], achievements: {}, completedSessionIds: [], reviewsCompleted: 0, replays: 0, profile: { experience: null, access: null, dailyGoal: 1, onboarded: true }, settings: { motion: 'system' }, activeSession: null }),
    );
    renderApp();
    const zone2 = await screen.findByRole('region', { name: /Zone 2: Body Basics, not available yet/ });
    expect(within(zone2).queryAllByRole('button')).toHaveLength(0);
  });

  it('sends an unknown route to a recoverable page', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, createdAt: new Date().toISOString(), xp: 0, lessons: {}, activity: {}, reviewXpDays: [], weakItems: [], achievements: {}, completedSessionIds: [], reviewsCompleted: 0, replays: 0, profile: { experience: null, access: null, dailyGoal: 1, onboarded: true }, settings: { motion: 'system' }, activeSession: null }));
    renderApp();
    await go('#/nowhere');
    expect(await screen.findByText('Wrong turn')).toBeInTheDocument();
  });
});

describe('every challenge type works through the UI', () => {
  it('can clear the checkpoint, which uses all seven types', async () => {
    const rec = { completedAt: new Date().toISOString(), bestAccuracy: 1, plays: 1, perfectAwarded: true, xp: 15 };
    const lessons = Object.fromEntries(UNITS[0].lessons.slice(0, -1).map((l) => [l.id, rec]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, createdAt: new Date().toISOString(), xp: 75, lessons, activity: {}, reviewXpDays: [], weakItems: [], achievements: {}, completedSessionIds: [], reviewsCompleted: 0, replays: 0, profile: { experience: null, access: null, dailyGoal: 1, onboarded: true }, settings: { motion: 'system' }, activeSession: null }));
    history.replaceState(null, '', '#/play/u1-checkpoint');
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole('progressbar', { name: 'Lesson progress' });

    const cp = UNITS[0].lessons.at(-1)!;
    expect(new Set(cp.challenges.map((c) => getChallenge(c.id)!.type)).size).toBe(7);
    for (let i = 0; i < cp.challenges.length; i++) await answerCorrectly(user);

    expect(await screen.findByText('Checkpoint passed', { selector: '.results-sign' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Front Door pass' })).toBeInTheDocument();
    expect(screen.getByText('Front Door Pass', { selector: 'strong' })).toBeInTheDocument();
  }, 30000);
});

describe('review', () => {
  it('runs a tune-up from cleared content and pays XP once per day', async () => {
    const rec = { completedAt: new Date().toISOString(), bestAccuracy: 0.8, plays: 1, perfectAwarded: false, xp: 10 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, createdAt: new Date().toISOString(), xp: 10, lessons: { 'u1-first-visit': rec }, activity: {}, reviewXpDays: [], weakItems: ['u1-fv-2'], achievements: {}, completedSessionIds: [], reviewsCompleted: 0, replays: 0, profile: { experience: null, access: null, dailyGoal: 1, onboarded: true }, settings: { motion: 'system' }, activeSession: null }));
    history.replaceState(null, '', '#/play/review');
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole('progressbar', { name: 'Lesson progress' });
    const n = JSON.parse(localStorage.getItem(STORAGE_KEY)!).activeSession.queue.length;
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).activeSession.queue).toContain('u1-fv-2');
    for (let i = 0; i < n; i++) await answerCorrectly(user);
    expect(await screen.findByText('Tune-up done', { selector: '.results-sign' })).toBeInTheDocument();
    expect(screen.getByText('Daily tune-up')).toBeInTheDocument();
    await waitFor(() => expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).weakItems).toEqual([]));
  }, 20000);
});
