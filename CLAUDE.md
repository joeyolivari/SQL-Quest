# SQL Quest — Claude/Coding Agent Instructions

## Project identity

SQL Quest is a browser-based SQL learning game and PWA. It teaches SQL through mission-style investigations, a Learning Center, and a free-practice SQL Training Lab.

## Core rule

Do not jump straight into code for meaningful changes.

For new features, UX changes, architecture changes, bug fixes with unclear cause, PWA/APK work, or anything touching multiple files, use this flow:

1. Clarify the goal.
2. Identify affected files and risks.
3. Write a small spec.
4. Write a short implementation plan.
5. Wait for approval when the user has not clearly said to implement.
6. Edit in small safe steps.
7. Verify before saying done.
8. Summarize exactly what changed.

For tiny text/CSS tweaks, direct edits are acceptable, but still verify the result.

## Protect these areas

Do not break or rewrite without explicit approval:

- Mission data and mission order.
- SQL validation behavior.
- Scoring, hints, attempts, timer, badges, and saved progress.
- PWA manifest and service worker behavior.
- GitHub Pages deployment compatibility.
- Mobile layout and Android/PWA install behavior.
- Existing synthetic-data disclaimer and learning purpose.

## Current architecture map

Use `docs/PROJECT_MAP.md` before making structural changes.

High-level areas:

- `index.html` — app shell and screen markup.
- `css/` — modular styles imported by `css/styles.css`.
- `js/features/app.js` — main game flow and home/game navigation.
- `js/features/sandbox.js` — SQL Training Lab/free practice.
- `js/components/learningScreen.js` — Learning Center screen markup and fallback wiring.
- `js/core/` — SQL engine, editor highlighter, validation, diagnostics, state, sound.
- `js/data/` — missions, schema, sample data, tutorial/scenario content.
- `js/learning/` — mastery, adaptive queue, hints, diagnostics, dashboard, usage tracking.
- `service-worker.js` — offline/PWA cache. Bump cache when changing cached app files.

## Design direction

Default SQL Quest aesthetic:

- Retro 1990s cyber-arcade training simulator.
- Dark cyber/data interface with neon cyan, green, purple, and magenta accents.
- Mission-select/game UI feeling, not generic SaaS.
- Polished and professional enough for a portfolio project.

When making visual changes, prefer the local `frontend-design` skill:

`.claude/skills/frontend-design/SKILL.md`

## Superpowers-lite workflow

When the task is bigger than a tiny tweak, use:

`.claude/skills/superpowers-lite/SKILL.md`

Short version:

- Brainstorm first.
- Write a spec.
- Plan file-by-file.
- Execute small tasks.
- Test.
- Review.
- Then summarize.

## Testing checklist

Before saying a change is complete, use the smallest relevant checks:

- Local server: `python -m http.server 8000`
- Open: `http://127.0.0.1:8000`
- Check browser console for errors.
- Test desktop width and mobile width.
- If changing PWA/cached files, bump `CACHE_VERSION` in `service-worker.js` and add any new cached files to `APP_SHELL`.
- If changing editor/sandbox behavior, test typing, helper buttons, running a valid query, and a SQL error.
- If changing Learning Center/navigation, test open, close, and back buttons.
- If changing mission logic, test at least one beginner mission end-to-end.

## Communication style for Joey

Use clear, simple language. Prefer ELI12 explanations when explaining concepts. Keep implementation summaries short and concrete. Avoid fake certainty: say exactly what was changed and what still needs testing.
