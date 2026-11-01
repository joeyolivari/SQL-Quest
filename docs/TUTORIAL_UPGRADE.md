# Tutorial and dataset upgrade

Goal: extend the progressive tutorial from first queries through investigations, with a reproducible synthetic dataset that exercises each concept.

Plan:
1. Fix distinct client counts, deterministic sorting, honest mastery, and lesson resume in missions.js, validation.js, learn.js and learnProgress.js. Verify with regression checks.
2. Expand data.js to 200 clients, 350 accounts, 5,000 transactions across 24 months, with reviews, journal records, flags, missing values and boundary fixtures. Verify relationships and coverage.
3. Extend lessons.js with filtering, summaries, relationships, analysis and window units. Preview tables in the query player and preserve lesson IDs. Verify every solution and unit progression.
4. Bump the PWA cache; add repeatable query and progress checks, then review changes and open a draft PR.

Risks: join fanout, sort ties, changed expected results, saved progress compatibility. Reference answers are computed from the live seed. Existing lesson/mission IDs remain stable. No production data is used.

Validation: `node tests/verify.mjs` passes all 32 tutorial queries, 30 mission solutions and fill exercises, dataset relationships and coverage, independent audit counts, order checks and progress/mastery checks. Native SQLite is used by this harness. Browser serving was blocked by the execution sandbox (listen EPERM); desktop/mobile navigation, resume UI and actual sql.js/PWA execution still require browser validation.
