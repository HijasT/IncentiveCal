export interface Tier {
  id: string;
  name: string;
  min: number;
  max?: number;
  rate: number;
}

export interface Config {
  tiers: Tier[];
  defaultSplit: {
    equal: number;
    personal: number;
  };
}

export interface CalculationResult {
  achievement: number;
  tier: Tier;
  baseIncentive: number;
  p1Share: number;
  p2Share: number;
  totalIncentive: number;
}

export interface AnalyticsRecord {
  id: string;
  type: 'individual' | 'bulk';
  staffName: string;
  staffSales: number;
  totalSales: number;
  target: number;
  achievement: number;
  tierName: string;
  incentive: number;
  timestamp: number;
}

export interface AnalyticsStats {
  totalCalculations: number;
  avgAchievement: number;
  mostCommonTier: { name: string; count: number } | null;
  tierDistribution: Record<string, number>;
}
