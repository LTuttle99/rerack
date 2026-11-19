# Design Rationale

## Name

**Rerack** is what you're asked to do with weights when you're finished: put them back where they belong. It's the first piece of gym culture most beginners learn, and it doubles as "re-" (learning again, coming back). It's short and pronounceable, and it isn't a fitness cliché. A quick app-store and web search found no app called Rerack. Similar names exist (Rack Strength, Rack Up, RackCoach). This is not a trademark or domain clearance, which still needs doing before launch.

## Visual concept: gym wayfinding

Instead of generic app chrome, the interface borrows from what's physically in a gym: **floor tape, wall signage and bumper plates.**

- **Paper and ink.** A warm off-white "floor" (`--paper #f2ede2`) with a faint rubber-floor speckle, and near-black ink (`--ink #1c201e`) for every outline and for text.
- **Bumper-plate colours as wayfinding.** Green, blue, red and yellow are the standard competition plate colours. Each zone gets one (Front Door = green). They identify places. They never measure strength, so the brand never implies "heavier is better".
- **Signal yellow** (`--signal #f2b92b`) is the single action colour: primary buttons, the current level, XP. It reads like safety markings.
- **Correct/incorrect** use a deeper green and brick red on tinted backgrounds, always with an icon and text, never colour alone.

## Typography

- **Archivo** (variable, width axis) at 68–90% width for signage: zone names, titles and labels. Narrow, bold, uppercase type looks like gym wall graphics without feeling aggressive.
- **Atkinson Hyperlegible** for reading. It was designed by the Braille Institute for low-vision legibility, which matters for an app that's mostly short explanatory text.

Both are self-hosted through Fontsource (SIL Open Font License). No external font requests.

## Components

- **Buttons and options** are flat "plates" with a 2px ink outline and a solid 4px ink base. Pressing one moves it down into its base, so presses feel physical without gradients or glow.
- **Level nodes** are weight plates seen from the front: a coloured ring and a centre hub that shows state (play / check / lock). The checkpoint is a larger plate with a stitched inner ring. Locked plates are unpainted.
- **The path** is painted floor tape: solid zone colour for cleared stretches and a dotted line ahead.
- **Planned zones** are a roll-down shutter labelled "Being written" with their topic list. That's honest, and it still shows where the journey goes.
- **The progress bar** is a strip of hazard tape that fills with yellow.
- **"Find the slip-ups"** is a timestamped session log (a real gym visit as a timeline), not a generic list.
- **Badges** are drawn as embroidered patches (stitched inner outline) in four shapes, so the badge wall isn't a grid of identical cards.
- **The unit reward** is a physical-feeling pass card with a stamp, tying the reward to the idea of being ready to walk in.

## Illustration

All equipment art is hand-built SVG in one pictogram style: 400×300 viewBox, 4px ink outline, flat plate-palette fills, side elevations. It's deliberately signage-like rather than realistic, so it reads at small sizes, stays consistent, and avoids awkward anatomy. Hotspot coordinates in the content files refer directly to these drawings. **No people are drawn.** A mascot was considered and rejected: there was no learning job for it, and a faceless signage style suits the "calm, knowledgeable gym-floor" voice better.

## Voice

Calm, specific, a little dry. Like a friendly regular, not a hype coach. Explanations say *why*, in one or two sentences. Feedback headlines are short ("Spot on.", "Not quite."). There are no exclamation-mark walls, no "crush it", and no guilt about missed days.

## Motion

- Short, purposeful motion: the answer press, a shake on a wrong answer, a spring on a correct one, the feedback panel rising, a stamp on results, the unlock spin of the next plate, an XP count-up.
- The only ambient motion is on the current level (a pulsing ring and a bobbing "Start" flag) and the hotspot markers, so the eye knows where to go.
- `prefers-reduced-motion` is honoured, and the You screen has a Motion override (match device / reduced / full).
- No sound. That avoids surprise audio and the need for a mute control. Sound could be added later as opt-in.

## Layout

- **Desktop (≥1100px):** left navigation rail, the floor map as the centre column, and a "Today" panel (XP, daily goal, week, up next, tune-up) on the right. The first screen is the game, not a marketing hero.
- **Tablet:** rail + map.
- **Phone:** compact top bar (daily goal + XP), map, bottom tab bar. Level details open as a bottom sheet.
- **Lessons are full-screen** with the action bar pinned to the bottom (thumb reach), and feedback appears in that same bar.

## Accessibility

Keyboard: number keys pick options and hotspot spots, Enter checks and continues, Escape closes the level popover, and focus moves to each new prompt. Choice groups use radio semantics, progress bars expose values, and feedback is announced with `role="status"`. Hotspots have neutral labels ("Spot 2") plus a text description of the picture. Picture choices describe the picture without naming the item. Touch targets are at least 44px. Contrast was chosen to meet WCAG AA for text (white text is only used on the darker plate greens and blues).
