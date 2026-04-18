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
        this.records = Array.isArray(data) ? data : [];
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

  getTrendData(days: number = 30) {
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    const cutoffTime = now - days * msPerDay;

    const dailyData: Record<string, { count: number; totalIncentive: number }> = {};

    this.records
      .filter(r => new Date(r.timestamp).getTime() > cutoffTime)
      .forEach(r => {
        const date = new Date(r.timestamp).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = { count: 0, totalIncentive: 0 };
        }
        dailyData[date].count += 1;
        dailyData[date].totalIncentive += r.incentiveAmount;
      });

    return Object.entries(dailyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date,
        ...data,
      }));
  }

  clearAll() {
    this.records = [];
    this.saveToStorage();
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
      this.records = data;
      this.saveToStorage();
      return { success: true };
    } catch (e) {
      return { success: false, error: `Parse error: ${e}` };
    }
  }
}

export default new AnalyticsTracker();
