# SQL Quest Development Workflow

Use this workflow for meaningful changes to SQL Quest.

This is a lightweight, repo-local version of a Superpowers-style workflow. It helps future AI coding agents and humans avoid random edits, broken game logic, stale PWA caches, and untested changes.

## 1. Start with the goal

Before editing, write the goal in one or two sentences.

Good examples:

- Improve SQL Training Lab mobile usability without changing mission scoring.
- Add a tutorial page for JOINs using chronological learning steps.
- Fix Learning Center buttons without changing mission selection logic.

Bad examples:

- Make it better.
- Fix everything.
- Redesign the app.

## 2. Identify protected areas

Check whether the task touches any protected area:

- Mission data.
- SQL validation.
- Scoring, hints, attempts, timer, badges.
- Saved progress/localStorage.
- SQL engine setup.
- PWA/service worker.
- Mobile navigation.
- Learning Center mode selection.

If yes, plan more carefully and test the affected flow.

## 3. Write a small spec

Use this format:

```text
Goal:

User-visible change:

Files likely affected:

Out of scope:

Risks:

Test steps:
```

Keep it short.

## 4. Make a file-by-file plan

Use this format:

```text
Task 1 — file/path.js
Purpose:
Change:
Verify:

Task 2 — css/file.css
Purpose:
Change:
Verify:
```

Small tasks are safer than one large rewrite.

## 5. Implement carefully

Rules:

- Prefer minimal changes.
- Preserve existing IDs/classes when JS depends on them.
- Do not duplicate large blocks of logic.
- Do not silently remove working behavior.
- Do not declare done just because code was edited.

## 6. PWA/cache rule

If a cached file changes or a new imported CSS/JS file is added:

1. Add the file to `APP_SHELL` in `service-worker.js` if needed.
2. Bump `CACHE_VERSION`.

Example:

```js
const CACHE_VERSION = 'csq-v12';
```

This prevents the PWA/GitHub Pages version from showing stale files.

## 7. Test checklist

Use the smallest relevant test.

### Basic app check

```bash
python -m http.server 8000
```

Open:

```text
http://127.0.0.1:8000
```

Check:

- Home screen loads.
- Browser console has no new errors.
- Desktop layout is not broken.
- Mobile width is usable.

### Mission check

Use when changing game flow, validation, editor, state, or data.

Check:

- Start a beginner mission.
- Type/run SQL.
- Wrong query shows useful feedback.
- Correct query completes mission.
- Score/hints/attempts still update.

### SQL Training Lab check

Use when changing sandbox/editor/schema/results.

Check:

- Open SQL Training Lab.
- Syntax colors appear.
- SQL helper buttons insert text.
- Example chips load queries.
- A valid query returns rows.
- A bad query shows an error.
- Reset DB still works.
- Mobile tabs still work.

### Learning Center check

Use when changing learning screen/adaptive behavior.

Check:

- Open Learning Center.
- Main Menu button works.
- Back to Missions works.
- Story/Training/Review mode selection visibly updates.
- Mission list behavior still makes sense.

### PWA check

Use when changing manifest, service worker, icons, or cached files.

Check:

- Service worker registers.
- Cache version changed.
- New files are listed in `APP_SHELL` if needed.
- GitHub Pages/PWA may require clearing site data or reinstalling after major cache changes.

## 8. Review before final answer

Before saying done, review:

- Did I touch the intended files only?
- Did I accidentally remove IDs/classes used by JS?
- Did I update `styles.css` if I added a CSS file?
- Did I update the service worker if I added cached assets?
- Did I test the user-visible behavior?
- Are there honest caveats?

## 9. Final summary format

Use this format:

```text
Done.

Changed:
- file 1: what changed
- file 2: what changed

Test:
- how to test locally

Note:
- any caveat or thing still needing manual confirmation
```

## Design workflow

For visual/frontend work, combine this workflow with:

```text
.claude/skills/frontend-design/SKILL.md
```

Default design direction:

- 1990s cyber-arcade SQL training simulator.
- Dark neon interface.
- Mission-select/game UI feel.
- Professional portfolio quality.
- Strong contrast in both dark and light mode.

## Superpowers-lite workflow

For larger work, use:

```text
.claude/skills/superpowers-lite/SKILL.md
```

Short version:

```text
Brainstorm → Spec → Plan → Execute → Verify → Review → Summarize
```
