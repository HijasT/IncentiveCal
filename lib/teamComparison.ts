/**
 * Team Comparison Tool
 * Compare teams, time periods, and configurations
 */

import { IncentiveCalculation } from './tierManager';
import { roundTo } from './validation';

export interface TeamComparison {
  teamNameA: string;
  teamNameB: string;
  metricA: TeamMetrics;
  metricB: TeamMetrics;
  differences: {
    totalSalesDiff: number;
    totalIncentiveDiff: number;
    avgAchievementDiff: number;
    avgIncentiveDiff: number;
    staffCountDiff: number;
  };
}

export interface TeamMetrics {
  teamName: string;
  staffCount: number;
  totalSales: number;
  totalTarget: number;
  teamAchievement: number;
  totalIncentive: number;
  averageIncentive: number;
  averageAchievement: number;
  medianAchievement: number;
  topPerformer: {
    name: string;
    achievement: number;
    incentive: number;
  } | null;
  bottomPerformer: {
    name: string;
    achievement: number;
    incentive: number;
  } | null;
}

export interface PeriodComparison {
  period1: {
    label: string;
    metrics: TeamMetrics;
  };
  period2: {
    label: string;
    metrics: TeamMetrics;
  };
  trends: {
    salesTrend: 'up' | 'down' | 'stable';
    achievementTrend: 'up' | 'down' | 'stable';
    incentiveTrend: 'up' | 'down' | 'stable';
    growthRate: number;
  };
}

class TeamComparison {
  /**
   * Calculate team metrics
   */
  calculateTeamMetrics(
    teamName: string,
    calculations: IncentiveCalculation[]
  ): TeamMetrics {
    if (calculations.length === 0) {
      return {
        teamName,
        staffCount: 0,
        totalSales: 0,
        totalTarget: 0,
        teamAchievement: 0,
        totalIncentive: 0,
        averageIncentive: 0,
        averageAchievement: 0,
        medianAchievement: 0,
        topPerformer: null,
        bottomPerformer: null,
      };
    }

    const totalSales = roundTo(
      calculations.reduce((sum, c) => sum + c.sales, 0),
      2
    );
    const totalTarget = roundTo(
      calculations.reduce((sum, c) => sum + c.target, 0),
      2
    );
    const teamAchievement = roundTo((totalSales / totalTarget) * 100, 2);
    const totalIncentive = roundTo(
      calculations.reduce((sum, c) => sum + c.totalIncentive, 0),
      2
    );
    const averageIncentive = roundTo(totalIncentive / calculations.length, 2);
    const averageAchievement = roundTo(
      calculations.reduce((sum, c) => sum + c.achievementPercent, 0) / calculations.length,
      2
    );

    // Median achievement
    const sorted = [...calculations].sort(
      (a, b) => a.achievementPercent - b.achievementPercent
    );
    const medianIdx = Math.floor(sorted.length / 2);
    const medianAchievement =
      sorted.length % 2 === 0
        ? roundTo((sorted[medianIdx - 1].achievementPercent + sorted[medianIdx].achievementPercent) / 2, 2)
        : roundTo(sorted[medianIdx].achievementPercent, 2);

    // Top and bottom performers
    const sortedByAchievement = [...calculations].sort(
      (a, b) => b.achievementPercent - a.achievementPercent
    );

    const topPerformer =
      sortedByAchievement.length > 0
        ? {
            name: sortedByAchievement[0].staffName,
            achievement: roundTo(sortedByAchievement[0].achievementPercent, 2),
            incentive: roundTo(sortedByAchievement[0].totalIncentive, 2),
          }
        : null;

    const bottomPerformer =
      sortedByAchievement.length > 0
        ? {
            name: sortedByAchievement[sortedByAchievement.length - 1].staffName,
            achievement: roundTo(
              sortedByAchievement[sortedByAchievement.length - 1].achievementPercent,
              2
            ),
            incentive: roundTo(
              sortedByAchievement[sortedByAchievement.length - 1].totalIncentive,
              2
            ),
          }
        : null;

    return {
      teamName,
      staffCount: calculations.length,
      totalSales,
      totalTarget,
      teamAchievement,
      totalIncentive,
      averageIncentive,
      averageAchievement,
      medianAchievement,
      topPerformer,
      bottomPerformer,
    };
  }

  /**
   * Compare two teams
   */
  compareTeams(
    teamA: { name: string; calculations: IncentiveCalculation[] },
    teamB: { name: string; calculations: IncentiveCalculation[] }
  ): TeamComparison {
    const metricA = this.calculateTeamMetrics(teamA.name, teamA.calculations);
    const metricB = this.calculateTeamMetrics(teamB.name, teamB.calculations);

    const totalSalesDiff = roundTo(metricB.totalSales - metricA.totalSales, 2);
    const totalIncentiveDiff = roundTo(metricB.totalIncentive - metricA.totalIncentive, 2);
    const avgAchievementDiff = roundTo(
      metricB.averageAchievement - metricA.averageAchievement,
      2
    );
    const avgIncentiveDiff = roundTo(metricB.averageIncentive - metricA.averageIncentive, 2);
    const staffCountDiff = metricB.staffCount - metricA.staffCount;

    return {
      teamNameA: teamA.name,
      teamNameB: teamB.name,
      metricA,
      metricB,
      differences: {
        totalSalesDiff,
        totalIncentiveDiff,
        avgAchievementDiff,
        avgIncentiveDiff,
        staffCountDiff,
      },
    };
  }

  /**
   * Compare two time periods
   */
  comparePeriods(
    period1: { label: string; calculations: IncentiveCalculation[] },
    period2: { label: string; calculations: IncentiveCalculation[] }
  ): PeriodComparison {
    const metrics1 = this.calculateTeamMetrics('Period 1', period1.calculations);
    const metrics2 = this.calculateTeamMetrics('Period 2', period2.calculations);

    // Determine trends
    const salesDiff = metrics2.totalSales - metrics1.totalSales;
    const achievementDiff = metrics2.teamAchievement - metrics1.teamAchievement;
    const incentiveDiff = metrics2.totalIncentive - metrics1.totalIncentive;

    const salesTrend: 'up' | 'down' | 'stable' =
      salesDiff > metrics1.totalSales * 0.05
        ? 'up'
        : salesDiff < -metrics1.totalSales * 0.05
        ? 'down'
        : 'stable';

    const achievementTrend: 'up' | 'down' | 'stable' =
      achievementDiff > 2 ? 'up' : achievementDiff < -2 ? 'down' : 'stable';

    const incentiveTrend: 'up' | 'down' | 'stable' =
      incentiveDiff > metrics1.totalIncentive * 0.05
        ? 'up'
        : incentiveDiff < -metrics1.totalIncentive * 0.05
        ? 'down'
        : 'stable';

    const growthRate =
      metrics1.totalSales > 0
        ? roundTo(((metrics2.totalSales - metrics1.totalSales) / metrics1.totalSales) * 100, 2)
        : 0;

    return {
      period1: {
        label: period1.label,
        metrics: { ...metrics1, teamName: period1.label },
      },
      period2: {
        label: period2.label,
        metrics: { ...metrics2, teamName: period2.label },
      },
      trends: {
        salesTrend,
        achievementTrend,
        incentiveTrend,
        growthRate,
      },
    };
  }

  /**
   * Get comparative insights
   */
  getComparativeInsights(teamComparison: TeamComparison): string[] {
    const insights: string[] = [];
    const { metricA, metricB, differences } = teamComparison;

    // Sales comparison
    if (differences.totalSalesDiff > 0) {
      const pctDiff = roundTo(
        (differences.totalSalesDiff / metricA.totalSales) * 100,
        1
      );
      insights.push(
        `${metricB.teamName} has ${pctDiff}% higher sales than ${metricA.teamName}`
      );
    } else if (differences.totalSalesDiff < 0) {
      const pctDiff = roundTo(
        (-differences.totalSalesDiff / metricB.totalSales) * 100,
        1
      );
      insights.push(
        `${metricA.teamName} has ${pctDiff}% higher sales than ${metricB.teamName}`
      );
    }

    // Achievement comparison
    if (differences.avgAchievementDiff > 5) {
      insights.push(
        `${metricB.teamName} significantly outperforms on achievement (avg: ${metricB.averageAchievement}% vs ${metricA.averageAchievement}%)`
      );
    } else if (differences.avgAchievementDiff < -5) {
      insights.push(
        `${metricA.teamName} significantly outperforms on achievement (avg: ${metricA.averageAchievement}% vs ${metricB.averageAchievement}%)`
      );
    }

    // Incentive efficiency
    const efficiencyA = metricA.totalSales > 0 ? metricA.totalIncentive / metricA.totalSales : 0;
    const efficiencyB = metricB.totalSales > 0 ? metricB.totalIncentive / metricB.totalSales : 0;
    const efficiencyDiff = roundTo(efficiencyB - efficiencyA, 4);

    if (Math.abs(efficiencyDiff) > 0.001) {
      insights.push(
        `${
          efficiencyB > efficiencyA
            ? metricB.teamName
            : metricA.teamName
        } has higher incentive efficiency per AED of sales`
      );
    }

    // Staff count
    if (differences.staffCountDiff > 0) {
      insights.push(`${metricB.teamName} has ${differences.staffCountDiff} more staff`);
    } else if (differences.staffCountDiff < 0) {
      insights.push(`${metricA.teamName} has ${-differences.staffCountDiff} more staff`);
    }

    return insights;
  }
}

export default new TeamComparison();
