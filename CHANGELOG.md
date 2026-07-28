# Changelog

All notable changes to this project are documented in this file.

## [8.2.0]

### Added
- Individual tab now gives live feedback: team achievement, tier, and pool breakdown recalculate automatically (debounced) as you type, instead of only on clicking "Calculate".
- Individual tab inputs (target, sales, staff count, P1/P2 split) persist to `sessionStorage` so switching tabs and coming back no longer blanks the form.
- Settings tab shows a "Last saved" timestamp for tier configuration, and offers a one-step "Restore previous tiers" undo after "Reset to Defaults".

### Fixed
- `getTier()` defaulted to the hardcoded `DEFAULT_TIERS` when called without an explicit tiers argument (as `BulkResultsView`'s tier-ladder calculation does), ignoring the user's saved tier configuration. Now defaults to `loadTiers()`.
- Individual Tab's staff count placeholder was hardcoded to `"29"` instead of reading `DEFAULT_STAFF_COUNT` from `lib/config.ts`.

### Changed
- Settings tab's "Current Tier System" preview no longer shows the raw hex color code under each tier card.

## [8.1.1]

### Fixed
- Month sheets and the `getAvailableMonths()` helper now sort chronologically (Jan → Dec, then by year) instead of alphabetically, so e.g. `["Apr 26", "Feb 26", "Jan 26"]` orders as Jan, Feb, Apr.
- A malformed/unexpected Excel file could throw during parsing and crash the whole app to a blank screen. The Bulk & Analytics tab is now wrapped in a React error boundary that shows a recoverable error message instead.
