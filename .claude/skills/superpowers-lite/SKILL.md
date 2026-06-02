---
name: superpowers-lite
description: Use a lightweight Superpowers-style development workflow for SQL Quest. Brainstorm before coding, create a small spec, write a file-by-file plan, execute in small safe steps, verify, review, and summarize. Use for non-trivial features, bug fixes, UX changes, PWA/APK work, architecture changes, and any task touching multiple files.
---

# Superpowers-lite Skill

This is a repo-local workflow skill for SQL Quest. It is not the official Superpowers plugin. It imitates the most useful behavior for this project: think first, plan, edit safely, verify, and summarize.

## When to use

Use this skill when the user asks for:

- A new feature.
- A bug fix where the cause is unclear.
- A UX/UI redesign.
- Mobile/PWA/APK changes.
- Learning Center, SQL Training Lab, editor, validation, scoring, or mission changes.
- Any change that touches more than one file.

For tiny wording or CSS adjustments, direct edits are acceptable.

## Workflow

### 1. Brainstorm

Before editing files, clarify:

- What problem are we solving?
- Who is the end user?
- What should change visually or functionally?
- What should not change?
- What could break?

Ask only necessary questions. If the request is clear, state assumptions and continue.

### 2. Write a small spec

Summarize the approved goal in plain language:

- Desired behavior.
- Files likely affected.
- User-visible result.
- Out-of-scope items.
- Risks.

Keep the spec short enough to read.

### 3. Write a plan

Create a file-by-file plan with small tasks.

Each task should include:

- File path.
- Exact purpose.
- Verification step.

Prefer 2–5 minute tasks. Avoid massive rewrites.

### 4. Execute safely

When implementing:

- Change one logical area at a time.
- Preserve game logic unless explicitly asked to change it.
- Do not delete large sections without checking why they exist.
- Do not claim something is fixed until verified.
- Use existing styles, naming, and architecture where possible.

### 5. Verify

Use the smallest relevant checklist:

- App loads without console errors.
- Home screen still works.
- Mission flow still works if touched.
- Learning Center buttons work if touched.
- SQL Training Lab runs valid SQL and shows errors if touched.
- Mobile layout remains usable if touched.
- Service worker cache is bumped if cached files changed.

### 6. Review

Before final response, review for:

- Broken imports.
- Missing CSS imports.
- New cached files missing from `service-worker.js`.
- Stale `CACHE_VERSION`.
- IDs/classes mismatched between HTML, CSS, and JS.
- Mobile regressions.
- Overwriting user work.

### 7. Summarize

Final answer should say:

- What changed.
- What files changed.
- How to test.
- Any honest caveats.

## SQL Quest protected areas

Do not casually alter:

- `js/data/missions.js`
- `js/core/validation.js`
- scoring and saved progress logic
- service worker/PWA behavior
- mobile navigation
- SQL engine setup

## Preferred language

Use simple, clear explanations. Joey prefers ELI12 explanations, short prompts, and practical test steps.
