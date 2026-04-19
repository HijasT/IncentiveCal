export interface MonthlyData {
  month: string;
  year: string;
  achievement: number;
  sales: number;
  packages: number;
  tier: string;
  tierRate: number;
  incentive: number;
  timestamp: string;
}

export interface AnalyticsData {
  monthlyData: Record<string, MonthlyData>;
  achievements: string[];
  personalBest: {
    achievement: number;
    month: string | null;
  };
  totalEarned: number;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: (data: AnalyticsData) => boolean;
}

export interface RealtimeProgress {
  daysRemaining: number;
  currentPace: number;
  dailyForTier2: number;
  dailyForTier3: number;
  dailyForTier4: number;
  progressPercent: number;
}

export interface PeerComparison {
  rank: number;
  vsAverage: number;
  percentile: number;
  gapToTop: number;
}
