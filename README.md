# Rerack

**Learn the gym before you walk in.** Rerack is a game for complete beginners: three-minute levels that teach the layout, equipment, vocabulary and unwritten rules of a gym, so the first real visit feels familiar.

The first zone, **Front Door**, is fully playable: 5 levels and a checkpoint with 38 challenges across 7 interaction types. Zones 2–6 appear on the map as "Being written" and can't be entered.

## Run it locally

You need Node.js 20 or newer (built and tested on Node 24).

```bash
cd ~/Downloads/rerack
```

```bash
npm install
```

```bash
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173). In VS Code, open the `rerack` folder and run the same commands in the integrated terminal (`` Ctrl+` ``).

Other commands:

| Command | What it does |
| --- | --- |
| `npm test` | Runs the engine unit tests and the UI integration tests (Vitest + Testing Library) |
| `npm run build` | Type-checks and builds a static site into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Lints with oxlint |

The build is a plain static site (hash routing), so `dist/` can be hosted anywhere without server configuration.

## Project layout

```
src/
  engine/          Pure TypeScript game logic, no React
    types.ts         Content model: units, lessons, 7 challenge types
    grading.ts       Readiness + grading for every challenge type
    session.ts       Lesson queue: re-queue on a miss, resume, summary
    progress.ts      XP rules, unlocks, completion, daily activity
    achievements.ts  Badge definitions and rules
    review.ts        Builds tune-up (review) sessions from missed items
    storage.ts       Versioned save format, repair, ProgressRepository
  content/         Lesson content as data (unit1.ts, curriculum.ts)
  components/      Challenge components, SVG art, badges, nav
  screens/         Map, Player, Results, Tune-up, Badges, You, Welcome
  state/           React store (wraps the engine) and hash router
  styles/          Design tokens + app styles
  test/            UI integration tests
```

## Adding content

Lessons are plain data. To add a level, add a `Lesson` object to a unit in `src/content/` and give every challenge a globally unique `id`. The tests check that every challenge has a valid answer key, that wrong choice options explain themselves, and that ids are unique. To open a new zone, set its `status` to `'playable'`.

## Data and privacy

Progress is stored in `localStorage` under `rerack.progress.v1` on the current device only. There is no account, no server and no analytics. Clearing browser data erases progress.

## Safety note

Rerack is general education for beginners, not medical advice or a personal training plan. Exercise and safety content should be reviewed by a qualified fitness professional before public release.
