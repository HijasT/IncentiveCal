# Changelog

All notable changes to this project are documented in this file.

## [8.1.1]

### Fixed
- Month sheets and the `getAvailableMonths()` helper now sort chronologically (Jan → Dec, then by year) instead of alphabetically, so e.g. `["Apr 26", "Feb 26", "Jan 26"]` orders as Jan, Feb, Apr.
- A malformed/unexpected Excel file could throw during parsing and crash the whole app to a blank screen. The Bulk & Analytics tab is now wrapped in a React error boundary that shows a recoverable error message instead.
