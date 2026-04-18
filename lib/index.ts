/**
 * Library modules export
 */

export { default as configManager } from './configManager';
export type { Config, Tier } from './configManager';

export * from './validation';

export { default as tierManager } from './tierManager';
export type { TierResult, IncentiveCalculation } from './tierManager';

export { default as analyticsTracker } from './analyticsTracker';
export type { CalculationRecord, AnalyticsMetrics } from './analyticsTracker';

export { default as excelParser } from './excelParser';
export type { StaffRecord, SheetData, ExcelParseResult } from './excelParser';

export { default as teamComparison } from './teamComparison';
export type { TeamComparison, TeamMetrics, PeriodComparison } from './teamComparison';
