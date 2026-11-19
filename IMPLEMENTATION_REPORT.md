# Implementation Report

## Stack and why

| Choice | Reason |
| --- | --- |
| **React 19 + TypeScript + Vite** | Component model fits reusable challenge types, TypeScript keeps the content model honest (a typo in a challenge is a compile error), and Vite gives fast dev and a small static build. |
| **No router library** | Seven routes. A ~60-line hash router survives refresh on any static host with no server config. |
| **No state library** | Game logic lives in pure functions (`src/engine`). One React context wraps them. Nothing else needed. |
| **CSS with custom properties** | One token file plus one stylesheet. No runtime CSS-in-JS and no utility framework fighting a custom visual language. |
| **Hand-built SVG** | Consistent, tiny, themeable, and hotspot coordinates can point at exact parts of the drawing. |
| **localStorage behind `ProgressRepository`** | Local-first for v1. Cloud sync later means a second implementation of the same interface, with no changes to the engine. |
| **Vitest + Testing Library** | Same config as Vite. Tests drive the real UI the way a learner would. |

Runtime dependencies are React, ReactDOM and two self-hosted font packages. Nothing is paid, and the app makes no network calls.

## What's built

- **Floor-map home screen**: zones, plate-shaped level nodes (cleared / current / locked / checkpoint), painted path, popover per level (start, resume, replay with XP status, lock reason), zone progress, "Being written" shutters for Zones 2–6, resume banner, first-run "Start here" note shaped by onboarding answers.
- **Welcome / onboarding**: one screen. You can start level 1 immediately, and three optional questions sit in a disclosure. No sign-up.
- **Lesson engine** with 7 challenge types: multiple choice (scenario), picture identification, matching pairs, sequencing, two-way sort, picture hotspot, find-the-slip-ups (multi-select log). All share one `ChallengeProps` contract and pure grading functions. Answer states: unanswered → selected → checked (correct / incorrect with explanation) → completed.
- **Feedback**: option-specific "why" plus the concept explanation, every time. A missed item comes back once at the end of the level, and a recovered miss is called out on results.
- **Unit 1 content**: 5 levels + checkpoint, 38 challenges, takeaways per level.
- **Progression**: strict unlock order; XP = 10 per level / 20 for the checkpoint on first clear, +5 one-time clean-sheet bonus, +5 for the first tune-up each day. Replays and extra tune-ups give no XP, and the screen says so.
- **Daily goal** (1–3 sessions; any level, replay or tune-up counts), **weekly calendar** and **current run**, with no penalty for missed days.
- **Tune-up**: up to 7 questions, weak items first. Answering a weak item cleanly removes it. There's also a replay list for every cleared level.
- **8 badges** with specific earn conditions, a badge wall with a real record (XP, levels, days learned, run), and the **Front Door Pass** unit celebration.
- **Persistence**: versioned save, field-by-field repair of damaged data, unreadable saves kept under a backup key, friendly notices, multi-tab sync via the `storage` event, idempotent completion (a session id can't be counted twice), refresh mid-lesson resumes at the same question (and an already-graded question isn't re-asked), and a "storage blocked" warning for private browsing.
- **Settings**: edit onboarding answers, daily goal, motion preference, and reset with an explicit confirm.
- **Responsive**: 3-column desktop, 2-column tablet, phone layout with tab bar and bottom-sheet level details.
- **Accessibility**: keyboard play (1–9, Enter, Esc), radio semantics, live feedback, labelled progress bars, focus management, reduced-motion support, 44px+ targets.

## Verification performed

**Automated: `npm test` → 38 passing**
- Engine (28): content integrity (unique ids, valid answer keys, every wrong choice explained, 7 types used, planned units empty), grading for every type, session re-queue/recovery/no double grading/resume, unlock order, first-clear XP, no XP farming, one-time perfect bonus on replay, duplicate completion ignored, unfinished session rejected, unit completion and pass badge, weak-item lifecycle, review XP once per day, daily goal counting, run calculation, storage round-trip, garbage recovery with backup, partial repair, unknown schema version.
- UI integration (10): welcome → level 1, full level 1 played through the UI with XP/unlock/badge checks, wrong-answer explanation and re-queue, refresh-resume, corrupted-save notice, locked-level redirect, planned zone not enterable, unknown route, **the full checkpoint played through the UI using all 7 challenge types**, and a tune-up run that clears weak items and pays XP.

**`npm run build`** succeeds (≈99 KB gzipped JS). **`npm run lint`** has no errors, only React-compiler style warnings (see limitations).

**Manual browser checks** (in the in-app browser, at 1360×860 desktop and 375×812 phone): welcome, map at several progress states, level popover (desktop and phone bottom sheet), choice with wrong-answer feedback, sort with a mistake, sequence, floor-plan hotspot, machine/rack/treadmill hotspots, find-the-slip-ups feedback, picture choice, matching with a mismatch, resume after reload, checkpoint results with the Front Door Pass and new badges, map after clearing the unit, and the badges page. Problems found and fixed during these checks:
- the path line ran through level labels
- the "Next" flag overlapped the previous label
- auto-scroll hid the current level under the phone header
- hotspot markers covered the very pins being asked about (markers now sit on a configurable corner)
- the kettlebell handle read as a solid blob
- the unit stamp overlapped text
- the match headline was too harsh
- the Enter key used stale state
- a redirect during first mount was missed by the router
- recovery notices were hidden on the welcome screen

**Not manually checked:** a real screen reader (VoiceOver/NVDA), real touch devices, Safari/Firefox (Chromium-based pane only), and the Tune-up and You pages on a phone.

## Known limitations

- **Only Zone 1 is playable.** Zones 2–6 are outlines (see CONTENT_ROADMAP.md).
- **Content has not been reviewed by a fitness professional.** Required before public release.
- **Local-only data.** No account or sync, so clearing browser data loses progress. There's no export yet.
- **No sound** (intentional for v1).
- **Onboarding answers only change copy** (the map's "Start here" note) and the daily goal. They don't change the curriculum.
- The name **Rerack** has only had an informal conflict search, not trademark or domain clearance.
- Lint shows React-compiler advisories (`Date` during render, a ref read during render in the store and player, two effects that set state). They're harmless here, but worth cleaning up.
- Dev-only: hot reload while mid-question resets the unsaved selection. The saved position is unaffected.

## Suggested next steps

1. Expert review of Unit 1. Then write Zone 2 (Body Basics) with a body-map hotspot.
2. A progress export/import file as a stopgap before accounts.
3. Screen-reader pass on VoiceOver and NVDA, and testing on real phones.
4. Opt-in confidence survey (before and after Unit 1) to test the core promise.
