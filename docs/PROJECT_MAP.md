# SQL Quest Project Map

This document gives coding agents a quick map of the repository before making changes.

## Purpose

SQL Quest is a browser-based SQL learning game. It combines mission-based SQL challenges, synthetic financial investigation data, a Learning Center, and a free-practice SQL Training Lab.

## App entry points

### `index.html`

Main app shell and screen markup.

Contains:

- Header/stats area.
- Home screen.
- Learning Center mount point.
- SQL Training Lab screen.
- Game screen.
- Tutorial/modal/certificate sections.
- Script imports.

Avoid turning this into a large unstructured file again. Prefer moving reusable screen logic into `js/components/` when appropriate.

### `css/styles.css`

Central CSS import file. New CSS files should be imported here.

Current style areas include:

- `base.css` — global defaults and variables baseline.
- `theme.css` — theme/color behavior.
- `layout.css` — core layout.
- `components.css` — shared UI components.
- `editor.css` — SQL highlighter/editor visuals.
- `learning.css` — Learning Center visuals.
- `difficulty-*.css` — difficulty card reset and design.
- `sandbox.css` — SQL Training Lab layout.
- `sandbox-editor.css` — sandbox helper buttons and editor sizing.
- `mobile.css` — mobile-specific layout.
- `arcade.css` — retro arcade layer.

## JavaScript map

### `js/features/app.js`

Main game/home flow.

Likely responsibilities:

- Home screen navigation.
- Difficulty selection.
- Mission selection.
- Start/continue mission flow.
- Game state updates.
- Buttons and main listeners.

Touch carefully because it connects many app areas.

### `js/features/sandbox.js`

SQL Training Lab/free-practice mode.

Responsibilities:

- Opening/closing sandbox.
- Sandbox database reset.
- Running free SQL queries.
- Rendering sandbox schema/results/errors.
- SQL usage XP stats.
- Sandbox mobile tabs.
- Sandbox SQL helper buttons.
- Reusing the SQL highlighter via `js/core/editor.js`.

### `js/components/learningScreen.js`

Learning Center screen component.

Responsibilities:

- Renders Learning Center markup.
- Provides fallback button behavior for opening/closing/selecting modes.
- Exposes `window.ensureLearningScreen` for app safety.

### `js/core/editor.js`

Lightweight SQL editor/highlighter.

Responsibilities:

- Native textarea remains the editable field.
- Mirrored `<pre>` layer displays syntax-highlighted SQL.
- Main mission editor support.
- Reusable highlighter controller for sandbox editor.
- Insert/wrap helper functions.

### `js/core/sqlEngine.js`

SQLite/sql.js engine setup and query execution.

Touch carefully. Changes can break both missions and sandbox.

### `js/core/validation.js`

Mission answer validation.

Touch carefully. Changes can alter gameplay correctness.

### `js/core/gameState.js`

Game state, saved progress, scoring, hints, badges, and related state behavior.

Touch carefully.

### `js/core/diagnostics.js`

SQL diagnostics/feedback logic.

### `js/core/sound.js`

Sound effects/audio behavior.

## Data map

### `js/data/missions.js`

Mission definitions. Avoid changing mission order or answers unless explicitly requested.

### `js/data/schema.js`

Database schema reference used in UI and sandbox.

### `js/data/data.js`

Synthetic sample data.

### `js/data/casefiles.js`

Casefile/briefing content.

### `js/data/scenarios.js`

Scenario grouping/content.

### `js/data/tutorial.js`

Tutorial/learning content.

## Learning map

### `js/learning/masteryTracker.js`

Skill mastery calculations.

### `js/learning/adaptiveQueue.js`

Learning mode/adaptive mission ordering.

### `js/learning/hintEngine.js`

Hint behavior.

### `js/learning/diagnostics.js`

Learning diagnostics.

### `js/learning/skillMap.js`

Skill definitions/mapping.

### `js/learning/dashboard.js`

Learning dashboard summary.

### `js/learning/sqlUsageTracker.js`

Sandbox SQL usage XP tracking.

## PWA map

### `manifest.webmanifest`

PWA app metadata.

### `service-worker.js`

Offline support and cache list.

Important rule: when changing cached files or adding imported CSS/JS assets, update `APP_SHELL` and bump `CACHE_VERSION`.

## Assets

### `assets/icons/`

PWA icons.

### `assets/images/`

Logo and visual assets.

## Agent workflow files

### `CLAUDE.md`

Project-wide instructions for Claude/coding agents.

### `.claude/skills/frontend-design/SKILL.md`

Design skill for distinctive frontend work.

### `.claude/skills/superpowers-lite/SKILL.md`

Repo-local planning/testing/review workflow skill.

### `docs/WORKFLOW.md`

Human-readable development workflow for future changes.
