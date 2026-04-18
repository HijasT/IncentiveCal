import { roundTo } from './validation';

interface TeamMetrics {
  totalSales: number;
  totalTarget: number;
  totalIncentive: number;
  averageAchievement: number;
  staffCount: number;
}

interface ComparisonResult {
  teamNameA: string;
  teamNameB: string;
  metricA: TeamMetrics;
  metricB: TeamMetrics;
  comparison: {
    salesDiff: number;
    salesDiffPercent: number;
    incentiveDiff: number;
    incentiveDiffPercent: number;
    winner: string;
  };
}

interface PeriodComparison {
  period: string;
  value: number;
}

class TeamComparisonEngine {
  compareTeams(
    teamA: { name: string; calculations: any[] },
    teamB: { name: string; calculations: any[] }
  ): ComparisonResult {
    const metricsA = this.calculateMetrics(teamA.calculations);
    const metricsB = this.calculateMetrics(teamB.calculations);

    const salesDiff = metricsA.totalSales - metricsB.totalSales;
    const salesDiffPercent = metricsB.totalSales !== 0 ? (salesDiff / metricsB.totalSales) * 100 : 0;
    const incentiveDiff = metricsA.totalIncentive - metricsB.totalIncentive;
    const incentiveDiffPercent = metricsB.totalIncentive !== 0 ? (incentiveDiff / metricsB.totalIncentive) * 100 : 0;

    const winner = metricsA.totalIncentive > metricsB.totalIncentive ? teamA.name : metricsB.totalIncentive > metricsA.totalIncentive ? teamB.name : 'Tie';

    return {
      teamNameA: teamA.name,
      teamNameB: teamB.name,
      metricA: metricsA,
      metricB: metricsB,
      comparison: {
        salesDiff: roundTo(salesDiff, 2),
        salesDiffPercent: roundTo(salesDiffPercent, 2),
        incentiveDiff: roundTo(incentiveDiff, 2),
        incentiveDiffPercent: roundTo(incentiveDiffPercent, 2),
        winner,
      },
    };
  }

  private calculateMetrics(calculations: any[]): TeamMetrics {
    const totalSales = calculations.reduce((sum, c) => sum + c.sales, 0);
    const totalTarget = calculations.reduce((sum, c) => sum + c.target, 0);
    const totalIncentive = calculations.reduce((sum, c) => sum + c.totalIncentive, 0);
    const avgAchievement = calculations.reduce((sum, c) => sum + c.achievementPercent, 0) / Math.max(calculations.length, 1);

    return {
      totalSales: roundTo(totalSales, 2),
      totalTarget: roundTo(totalTarget, 2),
      totalIncentive: roundTo(totalIncentive, 2),
      averageAchievement: roundTo(avgAchievement, 2),
      staffCount: calculations.length,
    };
  }

  getTrendComparison(teamAHistory: any[], teamBHistory: any[], periods: number = 6): PeriodComparison[] {
    const trendData: PeriodComparison[] = [];

    for (let i = 0; i < periods; i++) {
      const periodA = teamAHistory[i]?.totalIncentive || 0;
      const periodB = teamBHistory[i]?.totalIncentive || 0;
      const diff = periodA - periodB;

      trendData.push({
        period: `Period ${i + 1}`,
        value: roundTo(diff, 2),
      });
    }

    return trendData;
  }

  getPerformanceMatrix(teamA: any[], teamB: any[]) {
    const metricsA = this.calculateMetrics(teamA);
    const metricsB = this.calculateMetrics(teamB);

    return [
      { metric: 'Sales', A: metricsA.totalSales, B: metricsB.totalSales },
      { metric: 'Target', A: metricsA.totalTarget, B: metricsB.totalTarget },
      { metric: 'Incentive', A: metricsA.totalIncentive, B: metricsB.totalIncentive },
      { metric: 'Avg Achievement', A: metricsA.averageAchievement, B: metricsB.averageAchievement },
      { metric: 'Staff Count', A: metricsA.staffCount, B: metricsB.staffCount },
    ];
  }
}

export default new TeamComparisonEngine();
export type { TeamMetrics, ComparisonResult, PeriodComparison };
