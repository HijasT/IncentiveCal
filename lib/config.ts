/**
 * lib/config.ts — Single source of truth for app-wide constants.
 *
 * HOW TO UPDATE:
 *   - Version:        bump APP_VERSION here; page.tsx and AboutTab read it automatically
 *   - Default split:  change DEFAULT_P1_SPLIT (0–100; P2 = 100 - P1)
 *   - Default staff:  change DEFAULT_STAFF_COUNT
 *   - Default theme:  change DEFAULT_THEME ('light' | 'dark')
 *
 * Every component that needs these values imports from here — no more
 * hunting through multiple files to change a default.
 */

/** Displayed in the header, About tab, and page title. */
export const APP_VERSION = '7.3.2'

/** Default P1 percentage (0–100). P2 = 100 - DEFAULT_P1_SPLIT. */
export const DEFAULT_P1_SPLIT = 50

/** Default staff count shown in the Individual calculator. */
export const DEFAULT_STAFF_COUNT = 29

/**
 * Default colour theme on first visit.
 * 'light' | 'dark'
 */
export const DEFAULT_THEME: 'light' | 'dark' = 'light'
