# SQL Quest

**Master SQL through real-world financial-compliance investigations.**

SQL Quest is a browser-based SQL learning game with a retro 1990s cyber-arcade look and feel. Instead of abstract exercises, you learn SQL by working cases — sweeping client records for expired KYC status, tracing suspicious transactions, reconciling accounts, and clearing audits. It runs entirely in the browser, installs as an offline-capable PWA, and needs no build step or server-side code.

<!-- Replace with a real screenshot, e.g. assets/images/screenshot.png -->
![SQL Quest screenshot placeholder](assets/images/screenshot.png)

## Features

- **Mission-based investigations** — around 20 missions across scenario tracks: Client Documentation Review, Transaction Monitoring, Reconciliation & Accounting, Advisor Risk Dashboard, Audit Readiness, and the hardest tier, **Boss Mode**.
- **Learning Center** — structured lessons, adaptive hints, and skill-mastery tracking that adjusts to what you've practiced.
- **SQL Training Lab** — a free-practice sandbox with a live schema, helper buttons, and instant results/errors, for experimenting outside of mission constraints.
- **Retro cyber-arcade UI** — dark neon interface (cyan, green, purple, magenta) built to feel like a mission-select training simulator, not a generic form.
- **Installable PWA** — works offline via a service worker and can be installed to your home screen/desktop.
- **Optional Android packaging** — wrapped with [Capacitor](https://capacitorjs.com/) for a native Android build.

## Tech stack

- Vanilla HTML, CSS, and JavaScript — no framework, no bundler, no `package.json`.
- [sql.js](https://sql.js.org/) (SQLite compiled to WebAssembly) powers all SQL execution directly in the browser.
- A hand-rolled syntax highlighter and SQL diagnostics layer for mission/sandbox feedback.
- A service worker (`service-worker.js`) handles offline caching for PWA installs.

## Getting started

No install step, no dependencies to fetch — just serve the files statically:

```bash
git clone https://github.com/joeyolivari/SQL-Quest.git
cd SQL-Quest
python -m http.server 8000
```

Then open `http://127.0.0.1:8000` in your browser.

## Project structure

```
index.html          # App shell: home, Learning Center, Training Lab, game screens
css/                 # Modular styles, imported via css/styles.css
js/features/         # Main game flow (app.js) and SQL Training Lab (sandbox.js)
js/core/             # SQL engine, editor/highlighter, validation, game state, sound
js/data/              # Missions, schema, sample data, scenarios, tutorial content
js/learning/          # Mastery tracking, adaptive queue, hints, learning dashboard
docs/PROJECT_MAP.md   # Full architecture map for contributors/agents
```

See [`docs/PROJECT_MAP.md`](docs/PROJECT_MAP.md) for a detailed breakdown of each area.

## Data & scenarios

All client, account, and transaction data used in missions is **synthetic** — generated for learning purposes only. It does not represent real people, institutions, or events.

## License

SQL Quest is **source-available**, not open source. You may view and study the code for portfolio review and personal learning, but commercial use, redistribution, hosting, or reuse of the project's branding, missions, or design assets is not permitted without written permission. See [`LICENSE.md`](LICENSE.md) for the full terms.

## Author

Built by Joey Carbajo Olivari. For permission requests or questions, reach out at joeyolivari@gmail.com.
