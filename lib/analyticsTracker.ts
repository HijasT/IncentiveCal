interface CalculationRecord {
  id: string;
  staffName: string;
  sales: number;
  target: number;
  achievementPercent: number;
  tierName: string;
  splitEqual: number;
  type: string;
  incentiveAmount: number;
  timestamp: Date;
}

class AnalyticsTracker {
  private records: CalculationRecord[] = [];
  private readonly MAX_RECORDS = 500;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('sic_analytics_v5');
      if (stored) {
        const data = JSON.parse(stored);
        this.records = Array.isArray(data) ? data.map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp),
        })) : [];
      }
    } catch (e) {
      console.error('Failed to load analytics from storage:', e);
      this.records = [];
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('sic_analytics_v5', JSON.stringify(this.records));
    } catch (e) {
      console.error('Failed to save analytics to storage:', e);
    }
  }

  trackCalculation(data: Omit<CalculationRecord, 'id' | 'timestamp'>) {
    const record: CalculationRecord = {
      ...data,
      id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.records.unshift(record);

    // Keep only latest MAX_RECORDS
    if (this.records.length > this.MAX_RECORDS) {
      this.records = this.records.slice(0, this.MAX_RECORDS);
    }

    this.saveToStorage();
  }

  getRecords(limit?: number): CalculationRecord[] {
    return limit ? this.records.slice(0, limit) : this.records;
  }

  getStats() {
    if (this.records.length === 0) {
      return {
        totalCalculations: 0,
        averageAchievement: 0,
        averageIncentive: 0,
        totalIncentiveDistributed: 0,
        mostCommonTier: null,
        recordsCount: 0,
      };
    }

    const avgAchievement = this.records.reduce((sum, r) => sum + r.achievementPercent, 0) / this.records.length;
    const avgIncentive = this.records.reduce((sum, r) => sum + r.incentiveAmount, 0) / this.records.length;
    const totalIncentive = this.records.reduce((sum, r) => sum + r.incentiveAmount, 0);

    const tierCounts = this.records.reduce((acc: Record<string, number>, r) => {
      acc[r.tierName] = (acc[r.tierName] || 0) + 1;
      return acc;
    }, {});

    const mostCommonTier = Object.entries(tierCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      totalCalculations: this.records.length,
      averageAchievement: avgAchievement,
      averageIncentive: avgIncentive,
      totalIncentiveDistributed: totalIncentive,
      mostCommonTier,
      recordsCount: this.records.length,
    };
  }

  getMetrics() {
    const stats = this.getStats();
    const individualCount = this.records.filter(r => r.type === 'individual').length;
    const bulkCount = this.records.filter(r => r.type === 'bulk').length;

    // Get most common tier with count
    const tierCounts = this.records.reduce((acc: Record<string, number>, r) => {
      acc[r.tierName] = (acc[r.tierName] || 0) + 1;
      return acc;
    }, {});

    const mostCommonTierEntry = Object.entries(tierCounts).sort((a, b) => b[1] - a[1])[0];
    const mostCommonTier = mostCommonTierEntry ? { name: mostCommonTierEntry[0], count: mostCommonTierEntry[1] } : null;
    
    return {
      totalCalculations: stats.totalCalculations,
      individualCalculations: individualCount,
      bulkCalculations: bulkCount,
      averageAchievement: Math.round(stats.averageAchievement * 100) / 100,
      averageIncentive: Math.round(stats.averageIncentive * 100) / 100,
      totalIncentiveDistributed: Math.round(stats.totalIncentiveDistributed * 100) / 100,
      mostCommonTier,
    };
  }

  getTierDistribution() {
    const distribution = this.records.reduce((acc: Record<string, number>, r) => {
      acc[r.tierName] = (acc[r.tierName] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(distribution).map(([tier, count]) => ({
      tierName: tier,
      count: count,
      percentage: (count / Math.max(this.records.length, 1)) * 100,
    }));
  }

  getPerformanceInsights() {
    if (this.records.length === 0) {
      return {
        topPerformers: [],
        improvementAreas: [],
        underPerformers: [],
        averageAchievementTrend: [],
        recommendations: [],
      };
    }

    const sortedByIncentive = [...this.records].sort((a, b) => b.incentiveAmount - a.incentiveAmount);
    const topPerformers = sortedByIncentive.slice(0, 5).map(r => ({
      name: r.staffName,
      incentive: r.incentiveAmount,
      achievement: r.achievementPercent,
    }));

    const sortedByAchievement = [...this.records].sort((a, b) => a.achievementPercent - b.achievementPercent);
    const improvementAreas = sortedByAchievement.slice(0, 5).map(r => ({
      name: r.staffName,
      achievement: r.achievementPercent,
      gap: 75 - r.achievementPercent,
    }));

    // Under performers: those below 50% achievement
    const underPerformers = sortedByAchievement
      .filter(r => r.achievementPercent < 50)
      .slice(0, 3)
      .map(r => ({
        name: r.staffName,
        achievement: r.achievementPercent,
        gap: 75 - r.achievementPercent,
      }));

    // Generate recommendations based on data
    const recommendations: string[] = [];
    const avgAchievement = this.records.reduce((sum, r) => sum + r.achievementPercent, 0) / this.records.length;
    const avgIncentive = this.records.reduce((sum, r) => sum + r.incentiveAmount, 0) / this.records.length;

    if (avgAchievement < 75) {
      recommendations.push('Focus on improving team achievement rates - currently below 75% target');
    }
    if (improvementAreas.length > 3) {
      recommendations.push(`Consider mentoring programs for ${improvementAreas.length} team members below 75% achievement`);
    }
    if (underPerformers.length > 0) {
      recommendations.push(`Urgent: ${underPerformers.length} staff member(s) below 50% achievement - intervention recommended`);
    }
    if (topPerformers.length > 0 && topPerformers[0].achievement > 110) {
      recommendations.push('Recognize top performers - they are exceeding targets significantly');
    }
    if (recommendations.length === 0) {
      recommendations.push('Team is performing well - continue current strategy');
    }

    return {
      topPerformers,
      improvementAreas,
      underPerformers,
      averageAchievementTrend: this.getTrendData(30),
      recommendations,
    };
  }

  getAchievementHistogram() {
    const ranges = [
      { range: '0-50%', min: 0, max: 50, count: 0 },
      { range: '50-75%', min: 50, max: 75, count: 0 },
      { range: '75-100%', min: 75, max: 100, count: 0 },
      { range: '100-110%', min: 100, max: 110, count: 0 },
      { range: '110%+', min: 110, max: Infinity, count: 0 },
    ];

    this.records.forEach(r => {
      const range = ranges.find(rng => r.achievementPercent >= rng.min && r.achievementPercent < rng.max);
      if (range) range.count += 1;
    });

    return ranges.map(r => ({
      range: r.range,
      count: r.count,
      percentage: (r.count / Math.max(this.records.length, 1)) * 100,
    }));
  }

  getTrendData(days: number = 30) {
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    const cutoffTime = now - days * msPerDay;

    const dailyData: Record<string, { count: number; totalIncentive: number; avgAchievement: number }> = {};

    this.records
      .filter(r => new Date(r.timestamp).getTime() > cutoffTime)
      .forEach(r => {
        const date = new Date(r.timestamp).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { count: 0, totalIncentive: 0, avgAchievement: 0 };
        }
        dailyData[date].count += 1;
        dailyData[date].totalIncentive += r.incentiveAmount;
        dailyData[date].avgAchievement += r.achievementPercent;
      });

    return Object.entries(dailyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date,
        count: data.count,
        totalIncentive: Math.round(data.totalIncentive * 100) / 100,
        avgAchievement: Math.round((data.avgAchievement / data.count) * 100) / 100,
      }));
  }

  clearAll() {
    this.records = [];
    this.saveToStorage();
  }

  clearAnalytics() {
    this.clearAll();
  }

  exportAsJSON(): string {
    return JSON.stringify(this.records, null, 2);
  }

  importFromJSON(jsonStr: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonStr);
      if (!Array.isArray(data)) {
        return { success: false, error: 'Invalid format: expected array' };
      }
      this.records = data.map((r: any) => ({
        ...r,
        timestamp: new Date(r.timestamp),
      }));
      this.saveToStorage();
      return { success: true };
    } catch (e) {
      return { success: false, error: `Parse error: ${e}` };
    }
  }
}

const analyticsTrackerInstance = new AnalyticsTracker();

export default analyticsTrackerInstance;
