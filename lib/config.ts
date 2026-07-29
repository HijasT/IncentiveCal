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
export const APP_VERSION = '8.3.0'

/** Default P1 percentage (0–100). P2 = 100 - DEFAULT_P1_SPLIT. */
export const DEFAULT_P1_SPLIT = 50

/** Default staff count shown in the Individual calculator. */
export const DEFAULT_STAFF_COUNT = 29

/**
 * Default colour theme on first visit.
 * 'light' | 'dark'
 */
export const DEFAULT_THEME: 'light' | 'dark' = 'light'

/**
 * Center names shown in the Bulk Results "Center-wise Stats" section.
 * Edit the display labels here without touching STAFF_CENTERS below.
 */
export const CENTERS: Record<string, string> = {
  C: 'Center C',
  I: 'Center I',
  D: 'Center D',
}

/**
 * Maps each staff member's name — exactly as it appears in the uploaded
 * Excel sheet — to a center key from CENTERS above. Staff not listed here
 * are grouped as "Unassigned" in the center-wise stats and flagged so it's
 * obvious the mapping needs updating (e.g. after a new hire).
 *
 * Example:
 *   export const STAFF_CENTERS: Record<string, string> = {
 *     'Ahmed Ali': 'C',
 *     'Fatima Noor': 'I',
 *     'John Smith': 'D',
 *   }
 */
export const STAFF_CENTERS: Record<string, string> = {}
