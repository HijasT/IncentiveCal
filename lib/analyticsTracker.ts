/**
 * Analytics Tracker
 * Track calculations, metrics, performance insights
 */

import { Tier } from './configManager';
import { roundTo } from './validation';

export interface CalculationRecord {
  id: string;
  timestamp: string;
  type: 'individual' | 'bulk';
  staffName: string;
  sales: number;
  target: number;
  achievementPercent: number;
  tierName: string | null;
  incentiveAmount: number;
  splitEqual: number;
}

export interface AnalyticsMetrics {
  totalCalculations: number;
  individualCalculations: number;
  bulkCalculations: number;
  mostCommonTier: { name: string; count: number } | null;
  averageAchievement: number;
  averageIncentive: number;
  totalIncentiveDistributed: number;
}

class AnalyticsTracker {
  private storageKey = 'sic_analytics_v5';
  private records: CalculationRecord[] = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load records from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.records = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load analytics:', error);
      this.records = [];
    }
  }

  /**
   * Save records to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.records));
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  }

  /**
   * Track a calculation
   */
  trackCalculation(record: Omit<CalculationRecord, 'id' | 'timestamp'>): void {
    const newRecord: CalculationRecord = {
      id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...record,
    };

    this.records.push(newRecord);

    // Keep only last 500 records to prevent storage bloat
    if (this.records.length > 500) {
      this.records = this.records.slice(-500);
    }

    this.saveToStorage();
  }

  /**
   * Get all records
   */
  getRecords(): CalculationRecord[] {
    return [...this.records];
  }

  /**
   * Get records by filter
   */
  getRecordsByFilter(filter: {
    type?: 'individual' | 'bulk';
    startDate?: Date;
    endDate?: Date;
    tierName?: string;
  }): CalculationRecord[] {
    return this.records.filter((record) => {
      if (filter.type && record.type !== filter.type) return false;

      if (filter.startDate) {
        const recordDate = new Date(record.timestamp);
        if (recordDate < filter.startDate) return false;
      }

      if (filter.endDate) {
        const recordDate = new Date(record.timestamp);
        if (recordDate > filter.endDate) return false;
      }

      if (filter.tierName && record.tierName !== filter.tierName) return false;

      return true;
    });
  }

  /**
   * Get analytics metrics
   */
  getMetrics(): AnalyticsMetrics {
    if (this.records.length === 0) {
      return {
        totalCalculations: 0,
        individualCalculations: 0,
        bulkCalculations: 0,
        mostCommonTier: null,
        averageAchievement: 0,
        averageIncentive: 0,
        totalIncentiveDistributed: 0,
      };
    }

    // Count by type
    const individualCount = this.records.filter((r) => r.type === 'individual').length;
    const bulkCount = this.records.filter((r) => r.type === 'bulk').length;

    // Most common tier
    const tierCounts = new Map<string | null, number>();
    this.records.forEach((record) => {
      const tierName = record.tierName || 'No Incentive';
      tierCounts.set(tierName, (tierCounts.get(tierName) || 0) + 1);
    });

    let mostCommonTier: { name: string; count: number } | null = null;
    if (tierCounts.size > 0) {
      const [tierName, count] = Array.from(tierCounts.entries()).sort((a, b) => b[1] - a[1])[0];
      mostCommonTier = { name: tierName || 'No Incentive', count };
    }

    // Averages
    const avgAchievement = roundTo(
      this.records.reduce((sum, r) => sum + r.achievementPercent, 0) / this.records.length,
      2
    );
    const avgIncentive = roundTo(
      this.records.reduce((sum, r) => sum + r.incentiveAmount, 0) / this.records.length,
      2
    );
    const totalIncentive = roundTo(
      this.records.reduce((sum, r) => sum + r.incentiveAmount, 0),
      2
    );

    return {
      totalCalculations: this.records.length,
      individualCalculations: individualCount,
      bulkCalculations: bulkCount,
      mostCommonTier,
      averageAchievement,
      averageIncentive: avgIncentive,
      totalIncentiveDistributed: totalIncentive,
    };
  }

  /**
   * Get tier distribution
   */
  getTierDistribution(): Array<{
    tierName: string;
    count: number;
    percentage: number;
    totalIncentive: number;
    avgIncentive: number;
  }> {
    const distribution = new Map<string | null, CalculationRecord[]>();

    this.records.forEach((record) => {
      const tierName = record.tierName || 'No Incentive';
      if (!distribution.has(tierName)) {
        distribution.set(tierName, []);
      }
      distribution.get(tierName)!.push(record);
    });

    return Array.from(distribution.entries()).map(([tierName, records]) => ({
      tierName: tierName || 'No Incentive',
      count: records.length,
      percentage: roundTo((records.length / this.records.length) * 100, 1),
      totalIncentive: roundTo(
        records.reduce((sum, r) => sum + r.incentiveAmount, 0),
        2
      ),
      avgIncentive: roundTo(
        records.reduce((sum, r) => sum + r.incentiveAmount, 0) / records.length,
        2
      ),
    }));
  }

  /**
   * Get achievement histogram data (for charts)
   */
  getAchievementHistogram(binSize = 10): Array<{
    range: string;
    count: number;
    percentage: number;
  }> {
    const bins = new Map<number, number>();

    this.records.forEach((record) => {
      const bin = Math.floor(record.achievementPercent / binSize) * binSize;
      bins.set(bin, (bins.get(bin) || 0) + 1);
    });

    return Array.from(bins.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([bin, count]) => ({
        range: `${bin}-${bin + binSize}%`,
        count,
        percentage: roundTo((count / this.records.length) * 100, 1),
      }));
  }

  /**
   * Get performance insights
   */
  getPerformanceInsights(): {
    topPerformers: Array<{ name: string; achievement: number; incentive: number }>;
    underPerformers: Array<{ name: string; achievement: number; incentive: number }>;
    recommendations: string[];
  } {
    // Get unique staff
    const staffMap = new Map<string, CalculationRecord[]>();
    this.records.forEach((record) => {
      if (!staffMap.has(record.staffName)) {
        staffMap.set(record.staffName, []);
      }
      staffMap.get(record.staffName)!.push(record);
    });

    // Get latest record per staff
    const latestByStaff = Array.from(staffMap.values()).map((records) => {
      const latest = records.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
      return latest;
    });

    // Sort
    const sorted = [...latestByStaff].sort(
      (a, b) => b.achievementPercent - a.achievementPercent
    );

    const topPerformers = sorted
      .slice(0, 5)
      .map((r) => ({
        name: r.staffName,
        achievement: roundTo(r.achievementPercent, 1),
        incentive: roundTo(r.incentiveAmount, 2),
      }));

    const underPerformers = sorted
      .slice(-5)
      .reverse()
      .map((r) => ({
        name: r.staffName,
        achievement: roundTo(r.achievementPercent, 1),
        incentive: roundTo(r.incentiveAmount, 2),
      }));

    // Generate recommendations
    const recommendations: string[] = [];
    const avgAchievement = latestByStaff.reduce((sum, r) => sum + r.achievementPercent, 0) /
      latestByStaff.length || 0;

    if (avgAchievement < 85) {
      recommendations.push(
        'Average achievement is below Tier 2 threshold (85%). Consider coaching or adjusting targets.'
      );
    }

    const tier3Plus = latestByStaff.filter((r) => r.achievementPercent >= 101).length;
    const tier3Percentage = (tier3Plus / latestByStaff.length) * 100;

    if (tier3Percentage > 50) {
      recommendations.push(
        `Strong performance: ${roundTo(tier3Percentage, 0)}% of staff in Tier 3+. Consider raising targets.`
      );
    }

    if (underPerformers.length > 0) {
      recommendations.push(
        `${underPerformers.length} staff members need support to reach incentive threshold.`
      );
    }

    return {
      topPerformers,
      underPerformers,
      recommendations,
    };
  }

  /**
   * Clear all analytics
   */
  clearAnalytics(): void {
    this.records = [];
    this.saveToStorage();
  }

  /**
   * Export analytics as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        records: this.records,
        metrics: this.getMetrics(),
      },
      null,
      2
    );
  }
}

export default new AnalyticsTracker();
