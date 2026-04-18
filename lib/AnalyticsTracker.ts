import { AnalyticsRecord, AnalyticsStats } from './types';

export class AnalyticsTracker {
  private static STORAGE_KEY = 'sic_analytics_v5';
  private static MAX_RECORDS = 500;

  static track(
    type: 'individual' | 'bulk',
    staffName: string,
    staffSales: number,
    totalSales: number,
    target: number,
    achievement: number,
    tierName: string,
    incentive: number
  ): AnalyticsRecord {
    const record: AnalyticsRecord = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      staffName,
      staffSales,
      totalSales,
      target,
      achievement,
      tierName,
      incentive,
      timestamp: Date.now(),
    };

    try {
      if (typeof window === 'undefined') return record;
      const records = this.getRecords();
      records.push(record);
      if (records.length > this.MAX_RECORDS) {
        records.splice(0, records.length - this.MAX_RECORDS);
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch {
      // Silent fail
    }

    return record;
  }

  static getRecords(): AnalyticsRecord[] {
    try {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static getStats(): AnalyticsStats | null {
    const records = this.getRecords();
    if (records.length === 0) return null;

    const stats: AnalyticsStats = {
      totalCalculations: records.length,
      avgAchievement: records.reduce((sum, r) => sum + r.achievement, 0) / records.length,
      mostCommonTier: null,
      tierDistribution: {},
    };

    const tierCounts: Record<string, number> = {};
    for (const record of records) {
      tierCounts[record.tierName] = (tierCounts[record.tierName] || 0) + 1;
    }

    stats.tierDistribution = tierCounts;

    const maxTier = Object.entries(tierCounts).sort((a, b) => b[1] - a[1])[0];
    if (maxTier) {
      stats.mostCommonTier = { name: maxTier[0], count: maxTier[1] };
    }

    return stats;
  }

  static clear(): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // Silent fail
    }
  }
}
