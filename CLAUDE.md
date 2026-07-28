# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server at http://localhost:3000
npm run build     # production build
npm run start     # run the production build
```

There is no lint script, no test framework, and no CI configured in this repo. There is nothing to run beyond the above — verify changes by running `npm run dev` and exercising the UI manually, or `npm run build` to catch type errors (Next.js runs `tsc` as part of build even though `tsconfig.json` has `strict: false`).

## Architecture

This is a single-page Next.js 14 (App Router) app with **no backend and no database**. Everything runs client-side in the browser; all persistence is `localStorage`. The UI displays a permanent "100% local calculation · No data shared" notice — preserve this property when adding features (no fetch calls to external services for calculator data).

### Tab structure

`app/page.tsx` is the only route. It's a client component that owns theme state and renders one of four tabs from `components/tabs/`:

- **IndividualTab** — single-person incentive calculator, manual input form
- **BulkAnalyticsTab** — shell with a single shared Excel upload, then two sub-views toggled internally:
  - **BulkResultsView** — computed incentive table for all staff in the uploaded sheet(s)
  - **AnalyticsDashboardView** — historical/gamified performance dashboard (badges, streaks, rankings) built from the same uploaded data plus saved history
- **SettingsTab** — CRUD UI for incentive tiers (add/edit/remove/reset), persisted to `localStorage`
- **AboutTab** — static info, reads `APP_VERSION` from `lib/config.ts`

`BulkAnalyticsTab` supports view modes beyond a single month (`monthly`, `q1`–`q4`, `h1`/`h2`, `yearly`, `alltime`); `BulkResultsView` and `AnalyticsDashboardView` both filter/aggregate the same `ExcelData[]` by whichever `viewMode` is active rather than re-parsing per view.

### Core incentive math (`lib/utils.ts`)

`calculateIncentive()` is the domain logic all tabs build on:

1. Team achievement % = teamSales / teamTarget.
2. That % is mapped to a `Tier` (rate depends on achievement bracket — see `DEFAULT_TIERS`, overridable via Settings and stored under `localStorage['sic_tiers']`). Tier lookup is lower-bound-inclusive, upper-bound-exclusive.
3. `totalPool = tier.rate% × teamSales`, split into a **P1 pool** (divided equally among `staffCount`) and a **P2 pool** (divided by each person's share of `teamSales`) according to a user-adjustable P1/P2 split percentage.
4. A "next tier" projection is computed showing how much more team sales are needed to reach the next tier, or (at the top tier) how much extra was earned versus the tier's threshold.

Bulk calculations (`BulkResultsView`) apply this same per-staff-member logic across everyone in an uploaded sheet rather than a single manual entry.

### Excel ingestion (`lib/excelUtils.ts`)

`parseExcelFile()` parses `.xlsx` uploads against one specific company spreadsheet layout, not a generic table — it locates data by scanning for literal cell content and fixed structural conventions:

- Sheet names are only treated as data sheets if they contain a recognized month name + a 2-digit year (e.g. `"May 26"`, full month names like `"September"` are normalized to short form first).
- A `TARGET` label cell is searched for row-by-row to find the team target value.
- The "month total" column is located by matching the sheet's month/year against header row 3 (0-indexed row 2) containing "ttl"/"total".
- Staff rows start at row 4; each staff block is identified by a `"Count of Packages"` type-cell, with an optional `"Count of Clients"` row (newer sheet format, May 2026+) shifting the sales row offset by one.
- "Working days" are inferred by counting non-blank, non-`"NA"` daily sales cells across detected day-of-month columns (handles plain integers, Excel date serials, and string day values).

If this parsing breaks, the fix is almost always in the heuristics above, not in the calculation logic — check against an actual sample sheet before changing assumptions.

### Analytics/gamification (`lib/analyticsUtils.ts`)

Persists monthly team snapshots and per-person history to `localStorage['smart_incentive_analytics']`: `teamHistory` (keyed by `"YYYY-MM"`), a `selectedName` (whose personal stats are shown), and `badges` per person. Badges are awarded idempotently via `checkAndAwardBadges()` (first sale, tier reached, 100% club, achievement streaks, top-N rank, champion) — badge IDs are checked against what's already stored before appending, so this is safe to call repeatedly.

### PDF/export (`lib/pdfUtils.ts`)

Uses `jspdf`/`jspdf-autotable` via dynamic `import()` (not a CDN script tag) so exports work without a network request. Two report types: bulk results table and analytics/lifetime history.

### Config (`lib/config.ts`)

Single source of truth for `APP_VERSION` and app-wide defaults (default P1/P2 split, default staff count, default theme). Update values here rather than in the components that consume them.

### Other notes

- Path alias `@/*` maps to the repo root (see `tsconfig.json`).
- `index.html` at the repo root is the pre-Next.js legacy standalone version, kept for reference only — the live app is entirely under `app/`, `components/`, and `lib/`. Don't edit it expecting it to affect the running app.
- `archive/` contains historical changelogs from earlier versions; not part of the running app.
- `localStorage` keys in use: `sic_theme`, `sic_tiers`, `sic_tiers_saved_at`, `sic_tiers_backup` (one-slot undo for tier reset), `smart_incentive_analytics`, `sic_bulk_upload`.
- `sessionStorage` keys in use: `sic_individual_inputs` (Individual tab form persistence — cleared when the tab closes, unlike the `localStorage` keys above).

## Role

Analyze requirements, suggest solutions, modify local files, debug, maintain code quality within the existing architecture, and commit/push changes to GitHub on the developer's behalf. Not in scope: publishing releases, deployments, or final architectural decisions without approval.

## Git rules

Claude commits and pushes directly to this repo (`origin/main`) using the developer's own configured git identity (`git config user.name`/`user.email`). Commits must read as authored by the developer alone — never add a Claude/AI co-author trailer or attribution of any kind.

`git commit`, `git push`, and `git pull` are allowed for normal work. Still never force-push, hard-reset, rewrite published history, create/delete tags or branches, or modify Git/GitHub configuration or permissions without explicit approval.

After every change (however small), write a clear commit message (subject + brief body if needed) summarizing what changed and why, then commit and push it — don't just suggest the message and wait.

## File modification rules

Before major changes: explain which files will change, why, and any risks or side effects.

For normal fixes: make the change directly and summarize what was modified afterward.

Don't rewrite whole files when a targeted edit will do, remove existing functionality without approval, change project structure without explanation, or swap a working solution for a new framework/library without approval. Prefer minimal diffs that follow the patterns already established in this codebase (see Architecture above).

## Dependency rules

Before adding a dependency, explain why it's needed, what the alternatives are (including not adding one), and its impact on bundle size/maintenance — this app already bundles heavy libraries (`xlsx`, `jspdf`) via dynamic `import()` specifically to avoid CDN/global-script patterns, so new deps should follow that same convention. Don't install anything without approval.

## Environment and security rules

Never modify `.env` files, API keys, passwords, auth secrets, or production credentials, and never expose tokens, private keys, database credentials, or user data. This app currently has no `.env` file, backend, or credentials of its own — if that changes, use environment variables for anything sensitive.

## Code quality rules

Clean, readable code; no duplication; meaningful names; comments only where the logic genuinely isn't obvious; keep functions focused; follow the existing style (see the per-file conventions in Architecture above). Before calling a task done, check for syntax errors, type errors, broken imports, and missing dependencies.

## Testing rules

This repo has no lint script and no test suite configured (see Commands above), so the only automated check available is `npm run build` (type errors surface there). Run it after non-trivial changes. If it fails: explain the error, identify the cause, propose a fix, and apply it — confirm first if the fix touches major functionality.

## Versioning

Semantic versioning: `MAJOR.MINOR.PATCH`. The single source of truth is `APP_VERSION` in `lib/config.ts` — bump it there (it flows into the header and About tab automatically).

- **PATCH** — bug fixes, small/cosmetic tweaks (colors, fonts, spacing), performance or security fixes, internal cleanup.
- **MINOR** — new features, pages, components, or optional capabilities; large redesigns depending on impact.
- **MAJOR** — breaking changes, removing a user-facing feature, large architectural changes, or anything requiring user action.

When classifying a change (feature = MINOR, bug fix = PATCH, feature removal = MAJOR, removing unused internal code = PATCH), state the current version, the proposed new version, and why — don't bump it unilaterally without saying so.

## Changelog

The project previously tracked per-release notes as standalone files under `archive/` (`CHANGELOG_v7.0.0.md`, `CHANGELOG_v7.1.0.md`), but that stopped after v7.1.0 and there is currently no root `CHANGELOG.md`. Going forward, maintain one `CHANGELOG.md` at the repo root with `Added` / `Fixed` / `Changed` / `Removed` sections per version, rather than a new standalone file per release. Don't create git tags or releases.

## Database

This app has no database — all state is `localStorage` (see keys listed above). If that ever changes, apply the same discipline: before altering structure, explain affected tables, data impact, migration requirements, and rollback considerations, and never delete production data.

## UI/UX rules

Maintain the existing design language (see the CSS custom properties in `app/globals.css` and the flat, non-gradient surface style currently in use), responsive behavior, accessibility, and mobile compatibility. Don't redesign sections unrelated to the requested change.

## Communication style

Lead with a short summary. For changes, list the files modified, explain non-obvious logic changes, and flag risks. Skip unnecessary explanation — be precise and practical.

## Final safety rule

When uncertain, ask before destructive changes. Never assume removing data, breaking changes, new dependencies, or architecture changes are acceptable without approval.
