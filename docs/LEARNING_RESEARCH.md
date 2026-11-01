# Research-informed tutorial design

Research reviewed 2026-11-01. This is a design rationale, not evidence that SQL Quest improves retention. General findings do not determine an optimal SQL curriculum or exact review intervals.

## Evidence and decisions

1. **Retrieval and spacing.** Dunlosky et al. (2013), [review](https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html), rates practice testing and distributed practice highly across the conditions surveyed. Reading a solution and reproducing it immediately is weak evidence of durable knowledge. Decision: add recall questions, different transfer queries and optional delayed reviews. Completion and delayed retrieval remain separate signals.
2. **Manage cognitive load.** Sweller, van Merriënboer and Paas (2019), [review](https://doi.org/10.1007/s10648-019-09465-5), describes limited working memory for unfamiliar material and the need to fade guidance as expertise increases. Decision: show tiny labeled tables before large-table practice; keep one main new idea per lesson; move from a worked example to a partial query and then an empty editor. Do not equate visual decoration or speed with learning.
3. **Examples plus explanation.** Atkinson, Renkl and Merrill (2003), [study record](https://eric.ed.gov/?id=EJ678596), examines fading worked steps and self-explanation prompts. This is not a SQL-specific trial. Decision: prediction and “why does this work?” questions target reasoning about rows, groups and matches rather than keyword recognition alone.
4. **Instructional synthesis.** The IES [Organizing Instruction and Study guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1) recommends spacing, quizzing, integrating concrete and abstract representations, and alternating examples with problem solving. Evidence strength varies by recommendation. Decision: alternate small examples and executable queries, and revisit earlier skills in later investigations. Do not force mixed, unintroduced concepts on first exposure.
5. **Useful feedback.** Wisniewski, Zierer and Hattie (2020), [meta-analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC6987456/), finds substantial variation between feedback interventions; information content matters. Decision: wrong choices explain the relevant misconception; queries retain actual grader errors and offer progressive hints. After success, invite explanation of grain, exclusions or boundary cases. Avoid claims about intelligence or fixed ability.
6. **Applied SQL instruction.** [SQLBolt](https://sqlbolt.com/) introduces concepts with immediate browser exercises and distinguishes SQL dialects. This shows an instructional pattern, not comparative evidence of effectiveness. Decision: remove installation as an early obstacle and identify SQLite date/string conventions explicitly. All lesson language, data and exercises here are original; no third-party exercises are copied.

## Community observations (anecdotal)

In [How did you guys learn SQL?](https://www.reddit.com/r/learnSQL/comments/1re48mb/how_did_you_guys_learn_sql/), participants recommend structured foundations, interactive practice and answering their own questions with data. Other comments describe learning on the job. This is a self-selected discussion with no representative sampling or controlled comparisons.

In [How did you learn SQL when you were a beginner?](https://www.reddit.com/r/learnSQL/comments/1u73s99/how_did_you_learn_sql_when_you_were_a_beginner/), respondents describe books, hands-on datasets and starting from a concrete use case. We considered individual comments, not the page's automated summary. Decision: keep the recurring financial investigation setting and add query-repair tasks and a final case brief. These suggestions cannot establish the fastest route or an expected time to proficiency.

## Proposed learner loop

Observe a small table → predict a result → study a worked explanation → finish or repair a query → solve a changed task from a blank editor → explain a key decision → return for a short delayed retrieval question.

Use existing step types (concept, choice, fill, query) so the course is understandable and maintainable. Stage labels describe the purpose of the activity. Wrong choices provide corrective explanations; hints progress from an approach to a clause to a concrete cue. Worked examples remain available through lesson replay, and hints remain available during practice. Difficulty comes from meaningful decisions, not withholding essential schema information.

## Iteration plan and acceptance criteria

1. Content iteration: add missing bridges (aliases, grain, boundary logic, counting NULLs, join fanout, dates, text cleaning, unions and deterministic windows). Existing lesson IDs and existing step indices remain stable. Test every new solution, prediction example and accepted fill alternative.
2. Practice iteration: add prediction tables, step-purpose labels, layered hints and explanation prompts to the player. Do not change mission scoring or timers. Check rendering and interaction where execution permits.
3. Retention iteration: add an optional three-question review using completed content and mixed units. Initial review is suggested after one day, then clean retrieval schedules 3/7/14/30-day gaps. These intervals are an adjustable product heuristic, not a validated optimum. A wrong attempt or hint schedules an earlier supported review rather than claiming independent recall. Review never relocks the course or alters mission scores; main-course resume and drafts remain intact.
4. Regression iteration: verify due dates, mixed-unit selection, wrong/assisted review, one completion per review session, storage failure behavior, migrations, course resume isolation, SQL correctness and PWA asset coverage. Report native SQLite and browser validation separately.

## Human evaluation to run after release

Recruit 5–8 beginners for observed sessions, with consent. Ask them to predict, explain and solve a changed query without coaching. Record confusing wording, hint use, time spent stuck and whether they can describe one result row. Revisit with different questions after 2–7 days. These small pilots find usability problems; they do not establish causal efficacy.

Compare supported practice with independent delayed retrieval, not only lesson completion or self-reported confidence. If learners struggle, inspect prerequisite knowledge and wording before adding more repetition. If lessons feel trivial, reduce scaffolding for those learners. Keep these as hypotheses until observed. No learner data is sent externally by this change, and there are no retention promises, punitive streaks or learning-style classifications.

## SQL semantics references

Technical examples were checked against SQLite's [aggregate documentation](https://www.sqlite.org/lang_aggfunc.html), [SELECT processing and joins](https://www.sqlite.org/lang_select.html), and [date functions](https://www.sqlite.org/lang_datefunc.html). Dates here use the seeded ISO text format. An ordered top list specifies a unique tie-breaker. SQLite is permissive about some aggregate queries; lessons teach explicit grouping instead of relying on arbitrary bare-column values.

## Implementation and iterative validation

Content pass: 14 new bridge lessons bring the course to 51. Fourteen prediction tasks use executable miniature fixtures (two join tasks show both input tables), followed by 14 broken queries and 14 changed independent tasks. Each new lesson has a further, different delayed-review question. Existing lessons gain purpose labels, hint stages and explanation prompts without shifting their saved step indices.

Practice pass: staged hints, labeled prediction tables, corrective feedback and self-explanation prompts use the existing player. Review pass: a separate local-only review store schedules completed query content and preserves assistance across exiting/reopening a question. Main-course drafts and position remain isolated.

The first repair regression caught a weak exercise: unmodified email values already matched the cleaned result. Two explicit untidy synthetic emails were added to dataset version 3. The regression now verifies that every broken query fails its task. Answer positions vary to avoid a predictable button pattern.

Automated checks: `node tests/verify.mjs`, `node tests/research-learning.mjs` and `node tests/learn-controller.mjs`. These cover native SQLite solutions, every tiny prediction, repair failures, changed review solutions, scheduler dates, assisted recall, persistence, malformed storage, source-draft isolation, hint progression, prediction retries and course completion. The controller harness uses DOM/editor adapters. Desktop/mobile rendering, actual browser/sql.js execution and learning effectiveness remain unverified. Prior sandbox attempts to launch HTTP serving and Chromium were blocked; no browser result is claimed.
