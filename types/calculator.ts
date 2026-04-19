import { Tier } from './tier';

export interface StaffMember {
  name: string;
  packages: number;
  sales: number;
}

export interface BulkResult {
  name: string;
  totalIncentive: number;
  packages: number;
  sales: number;
  individualPercent: number;
  p1: number;
  p2: number;
}

export interface BulkCalculation {
  results: BulkResult[];
  teamAchievement: number;
  tier: Tier;
  totalPool: number;
  target: number;
  teamSales: number;
  teamPackages: number;
  p1Pool: number;
  p2Pool: number;
  staffCount: number;
  viewMode: ViewMode;
  sheets: string[];
}

export type ViewMode = 'monthly' | 'q1' | 'q2' | 'q3' | 'q4' | 'yearly' | 'alltime';

export interface ExcelSheetData {
  staff: StaffMember[];
  target: number;
}

export interface IndividualCalculation {
  target: number;
  sales: number;
  packages: number;
  staffCount: number;
  p1Split: number;
  achievement: number;
  tier: Tier;
  totalIncentive: number;
  p1: number;
  p2: number;
  individualPercent: number;
}
