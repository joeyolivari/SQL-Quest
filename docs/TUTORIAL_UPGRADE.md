# Tutorial and dataset upgrade

Goal: extend the progressive tutorial from first queries through investigations, with a reproducible synthetic dataset that exercises each concept.

Plan:
1. Fix distinct client counts, deterministic sorting, honest mastery, and lesson resume in missions.js, validation.js, learn.js and learnProgress.js. Verify with regression checks.
2. Expand data.js to 200 clients, 350 accounts, 5,000 transactions across 24 months, with reviews, journal records, flags, missing values and boundary fixtures. Verify relationships and coverage.
3. Extend lessons.js with filtering, summaries, relationships, analysis and window units. Preview tables in the query player and preserve lesson IDs. Verify every solution and unit progression.
4. Bump the PWA cache; add repeatable query and progress checks, then review changes and open a draft PR.

Risks: join fanout, sort ties, changed expected results, saved progress compatibility. Reference answers are computed from the live seed. Existing lesson/mission IDs remain stable. No production data is used.

Validation: `node tests/verify.mjs` passes all 32 tutorial queries, 30 mission solutions and fill exercises, dataset relationships and coverage, independent audit counts, order checks and progress/mastery checks. Native SQLite is used by this harness. Browser serving was blocked by the execution sandbox (listen EPERM); desktop/mobile navigation, resume UI and actual sql.js/PWA execution still require browser validation.

## Follow-up review

Goal: make the expanded tutorial behave as a progressive course and preserve work accurately.

Plan:
1. learnProgress.js and learn.js: enforce unit prerequisites without locking existing completed lessons; validate resume positions; persist SQL drafts; count actual attempts and hints without replay farming. Verify progress and browser interactions.
2. lessons.js: remove invalid DESC synonym; explain COALESCE and NOT EXISTS before requiring them. Verify all fill alternatives and reference queries.
3. learn.js, learnScreen.js and learn.css: replace raw JSON previews with labeled tables for relevant query tables, loaded when expanded; add accessible feedback and inputs. Verify narrow-screen overflow.
4. validation.js: distinguish real NULL from literal text and compare returned text faithfully. Verify negative grading cases. Bump PWA cache and update the same PR.

Follow-up validation: `node tests/verify.mjs` passes 35 tutorial query solutions, all 30 mission solutions, and every accepted fill alternative. Additional regressions cover unit prerequisites, saved draft reload, wrong attempts, hint deduplication, replay credit, malformed saves, duplicate rows and exact NULL/text distinctions. The tutorial now has 37 lessons. Both HTTP serving and Chromium launch were blocked by the sandbox (socket operations denied); no browser or sql.js validation is claimed.


## Research-informed expansion

See [LEARNING_RESEARCH.md](LEARNING_RESEARCH.md) for sources, design choices, iteration notes and human evaluation plans. Added 14 bridge lessons (51 total), miniature prediction tables, genuine query repair, changed independent tasks and review variants. The player adds staged hints and explanation prompts. A separate optional review store spaces practice without changing mission scoring or main-course drafts. Dataset version 3 adds two untidy email fixtures. PWA cache v21 includes lessonExpansion.js and learnReview.js.

Validation: all three Node test commands in README pass, including 63 tutorial query solutions, 30 missions, 14 miniature predictions, 14 broken starters and 14 separate review queries. The controller integration harness uses DOM/editor adapters, not a browser. Learning effectiveness and browser layout/sql.js/PWA behavior remain to be evaluated.
