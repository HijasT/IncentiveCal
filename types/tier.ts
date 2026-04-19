export interface Tier {
  id: string;
  name: string;
  min: number;
  max: number;
  rate: number;
  color: string;
}

export interface TierResult {
  tier: Tier;
  achievement: number;
  totalIncentive: number;
  p1: number;
  p2: number;
  individualPercent: number;
}

export const DEFAULT_TIERS: Tier[] = [
  { id: 'tier1', name: 'Tier 1', min: 75, max: 84.99, rate: 4, color: '#FFA726' },
  { id: 'tier2', name: 'Tier 2', min: 85, max: 100.99, rate: 5, color: '#00CED1' },
  { id: 'tier3', name: 'Tier 3', min: 101, max: 110.99, rate: 6, color: '#20B2AA' },
  { id: 'tier4', name: 'Tier 4', min: 111, max: Infinity, rate: 7, color: '#48D1CC' },
];

export interface NextTierInfo {
  nextTierName?: string;
  nextTierRate?: number;
  requiredPercentage?: number;
  requiredSales?: number;
  deficit?: number;
  isMaxTier: boolean;
  currentRate?: number;
  thresholdPercentage?: number;
  thresholdSales?: number;
  thresholdPool?: number;
  extraIncentive?: number;
}
