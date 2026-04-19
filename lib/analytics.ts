import { AnalyticsData, Achievement, MonthlyData } from '@/types/analytics';
import { Tier } from '@/types/tier';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_timer',
    name: 'First Timer',
    icon: '🌟',
    description: 'Calculate your first incentive',
    condition: (data) => Object.keys(data.monthlyData).length >= 1,
  },
  {
    id: 'tier_1',
    name: 'Getting Started',
    icon: '🥉',
    description: 'Reach Tier 1 (75%+)',
    condition: (data) => Object.values(data.monthlyData).some((m) => m.achievement >= 75),
  },
  {
    id: 'tier_2',
    name: 'Solid Performer',
    icon: '🥈',
    description: 'Reach Tier 2 (85%+)',
    condition: (data) => Object.values(data.monthlyData).some((m) => m.achievement >= 85),
  },
  {
    id: 'tier_3',
    name: 'High Achiever',
    icon: '🥇',
    description: 'Reach Tier 3 (101%+)',
    condition: (data) => Object.values(data.monthlyData).some((m) => m.achievement >= 101),
  },
  {
    id: 'tier_4',
    name: 'Peak Performer',
    icon: '👑',
    description: 'Reach Tier 4 (111%+)',
    condition: (data) => Object.values(data.monthlyData).some((m) => m.achievement >= 111),
  },
  {
    id: 'consistent_3',
    name: 'Consistency',
    icon: '🔥',
    description: '3 months above 85%',
    condition: (data) => calculateStreak(data) >= 3,
  },
  {
    id: 'consistent_6',
    name: 'Unstoppable',
    icon: '⚡',
    description: '6 months above 85%',
    condition: (data) => calculateStreak(data) >= 6,
  },
  {
    id: 'century_club',
    name: 'Century Club',
    icon: '💯',
    description: '100+ packages in a month',
    condition: (data) => Object.values(data.monthlyData).some((m) => m.packages >= 100),
  },
  {
    id: 'millionaire',
    name: 'Millionaire',
    icon: '💰',
    description: 'AED 1M+ lifetime earnings',
    condition: (data) => data.totalEarned >= 1000000,
  },
];

export function calculateStreak(analytics: AnalyticsData): number {
  const months = Object.entries(analytics.monthlyData).sort(
    (a, b) => new Date(b[1].timestamp).getTime() - new Date(a[1].timestamp).getTime()
  );

  let streak = 0;
  for (const [, data] of months) {
    if (data.achievement >= 75) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function checkAchievements(analytics: AnalyticsData): {
  data: AnalyticsData;
  newAchievements: Achievement[];
} {
  const newAchievements: Achievement[] = [];

  ACHIEVEMENTS.forEach((achievement) => {
    if (!analytics.achievements.includes(achievement.id)) {
      if (achievement.condition(analytics)) {
        analytics.achievements.push(achievement.id);
        newAchievements.push(achievement);
      }
    }
  });

  return { data: analytics, newAchievements };
}

export function recordCalculation(
  analytics: AnalyticsData,
  month: string,
  year: string,
  achievement: number,
  sales: number,
  packages: number,
  tier: Tier,
  incentive: number
): { data: AnalyticsData; newAchievements: Achievement[] } {
  const key = `${month}_${year}`;

  analytics.monthlyData[key] = {
    month,
    year,
    achievement,
    sales,
    packages,
    tier: tier.name,
    tierRate: tier.rate,
    incentive,
    timestamp: new Date().toISOString(),
  };

  analytics.totalEarned += incentive;

  if (achievement > analytics.personalBest.achievement) {
    analytics.personalBest = { achievement, month: key };
  }

  return checkAchievements(analytics);
}

export function getRecentMonths(analytics: AnalyticsData, count: number = 12): MonthlyData[] {
  return Object.values(analytics.monthlyData)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-count);
}

export function getTierDistribution(analytics: AnalyticsData): Record<string, number> {
  const distribution: Record<string, number> = {
    'Below Target': 0,
    'Tier 1': 0,
    'Tier 2': 0,
    'Tier 3': 0,
    'Tier 4': 0,
  };

  Object.values(analytics.monthlyData).forEach((data) => {
    distribution[data.tier] = (distribution[data.tier] || 0) + 1;
  });

  return distribution;
}

export function getHeatmapLevel(achievement: number): number {
  if (achievement >= 111) return 5;
  if (achievement >= 101) return 4;
  if (achievement >= 85) return 3;
  if (achievement >= 75) return 2;
  if (achievement >= 50) return 1;
  return 0;
}

export function generateAnalyticsReport(analytics: AnalyticsData): string {
  let report = 'PERFORMANCE ANALYTICS REPORT\n';
  report += '='.repeat(50) + '\n\n';
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  report += `Lifetime Earned: AED ${analytics.totalEarned.toLocaleString()}\n`;
  report += `Personal Best: ${analytics.personalBest.achievement.toFixed(1)}% (${analytics.personalBest.month})\n`;
  report += `Current Streak: ${calculateStreak(analytics)} months\n`;
  report += `Achievements: ${analytics.achievements.length}/${ACHIEVEMENTS.length}\n\n`;
  report += 'MONTHLY HISTORY:\n';
  report += '-'.repeat(50) + '\n';

  Object.entries(analytics.monthlyData)
    .sort((a, b) => new Date(b[1].timestamp).getTime() - new Date(a[1].timestamp).getTime())
    .forEach(([key, data]) => {
      report += `${key}: ${data.achievement.toFixed(1)}% (${data.tier}) - AED ${data.incentive.toLocaleString()}\n`;
    });

  return report;
}
