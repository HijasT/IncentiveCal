/**
 * Tier Manager
 * Calculate tier from achievement %, tier comparison, simulation tool
 */

import { Tier } from './configManager';
import { roundTo } from './validation';

export interface TierResult {
  tier: Tier | null;
  achievementPercent: number;
  baseIncentive: number;
  p1Share: number;
  p2Share: number;
  totalIncentive: number;
  message: string;
}

export interface IncentiveCalculation {
  staffName: string;
  sales: number;
  target: number;
  teamTotalSales: number;
  splitEqual: number;
  splitPersonal: number;
  achievementPercent: number;
  tier: Tier | null;
  baseIncentive: number;
  p1Share: number;
  p2Share: number;
  totalIncentive: number;
}

class TierManager {
  /**
   * Get tier for a given achievement percentage
   */
  getTier(achievementPercent: number, tiers: Tier[]): Tier | null {
    if (achievementPercent < 0) return null;

    // Sort by min descending to find the right tier
    const sorted = [...tiers].sort((a, b) => b.min - a.min);

    for (const tier of sorted) {
      if (achievementPercent >= tier.min) {
        // Check if it falls within max (if max exists)
        if (tier.max === null || achievementPercent <= tier.max) {
          return tier;
        }
      }
    }

    return null;
  }

  /**
   * Calculate complete incentive for one person
   */
  calculateIncentive(
    sales: number,
    target: number,
    teamTotalSales: number,
    splitEqual: number,
    tiers: Tier[]
  ): TierResult {
    const achievementPercent = roundTo((sales / target) * 100, 2);
    const tier = this.getTier(achievementPercent, tiers);

    if (!tier) {
      return {
        tier: null,
        achievementPercent,
        baseIncentive: 0,
        p1Share: 0,
        p2Share: 0,
        totalIncentive: 0,
        message: `Below minimum threshold (< 75%)`,
      };
    }

    const baseIncentive = roundTo((tier.rate / 100) * sales, 2);
    const splitPersonal = 100 - splitEqual;

    const p1Share = roundTo((baseIncentive * splitEqual) / 100, 2);
    const salesContribution = teamTotalSales > 0 ? sales / teamTotalSales : 0;
    const p2Share = roundTo((baseIncentive * splitPersonal) / 100 * salesContribution, 2);
    const totalIncentive = roundTo(p1Share + p2Share, 2);

    return {
      tier,
      achievementPercent,
      baseIncentive,
      p1Share,
      p2Share,
      totalIncentive,
      message: `${tier.name} (${tier.rate}%)`,
    };
  }

  /**
   * Calculate bulk incentives for team
   */
  calculateBulkIncentives(
    staffData: Array<{ name: string; sales: number; target: number }>,
    splitEqual: number,
    tiers: Tier[]
  ): IncentiveCalculation[] {
    const teamTotalSales = staffData.reduce((sum, s) => sum + s.sales, 0);
    const splitPersonal = 100 - splitEqual;

    return staffData.map((staff) => {
      const tierResult = this.calculateIncentive(
        staff.sales,
        staff.target,
        teamTotalSales,
        splitEqual,
        tiers
      );

      return {
        staffName: staff.name,
        sales: staff.sales,
        target: staff.target,
        teamTotalSales,
        splitEqual,
        splitPersonal,
        achievementPercent: tierResult.achievementPercent,
        tier: tierResult.tier,
        baseIncentive: tierResult.baseIncentive,
        p1Share: tierResult.p1Share,
        p2Share: tierResult.p2Share,
        totalIncentive: tierResult.totalIncentive,
      };
    });
  }

  /**
   * Compare two tier configurations on same data
   */
  compareTierConfigs(
    staffData: Array<{ name: string; sales: number; target: number }>,
    splitEqual: number,
    tiersA: Tier[],
    tiersB: Tier[]
  ): {
    configA: IncentiveCalculation[];
    configB: IncentiveCalculation[];
    differences: Array<{
      staffName: string;
      differenceInTotal: number;
      percentageChange: number;
    }>;
  } {
    const configA = this.calculateBulkIncentives(staffData, splitEqual, tiersA);
    const configB = this.calculateBulkIncentives(staffData, splitEqual, tiersB);

    const differences = configA.map((calcA, idx) => {
      const calcB = configB[idx];
      const differenceInTotal = roundTo(calcB.totalIncentive - calcA.totalIncentive, 2);
      const percentageChange =
        calcA.totalIncentive > 0
          ? roundTo((differenceInTotal / calcA.totalIncentive) * 100, 2)
          : 0;

      return {
        staffName: calcA.staffName,
        differenceInTotal,
        percentageChange,
      };
    });

    return {
      configA,
      configB,
      differences,
    };
  }

  /**
   * Simulate what-if scenario (e.g., new achievement %)
   */
  simulateAchievement(
    currentSales: number,
    currentTarget: number,
    targetAchievement: number,
    teamTotalSales: number,
    currentTeamTotalSales: number,
    splitEqual: number,
    tiers: Tier[]
  ): {
    currentResult: TierResult;
    newResult: TierResult;
    additionalSalesNeeded: number;
    incentiveIncrease: number;
  } {
    const currentResult = this.calculateIncentive(
      currentSales,
      currentTarget,
      currentTeamTotalSales,
      splitEqual,
      tiers
    );

    const requiredSales = roundTo((targetAchievement / 100) * currentTarget, 2);
    const additionalSalesNeeded = roundTo(requiredSales - currentSales, 2);

    const newResult = this.calculateIncentive(
      requiredSales,
      currentTarget,
      teamTotalSales,
      splitEqual,
      tiers
    );

    const incentiveIncrease = roundTo(newResult.totalIncentive - currentResult.totalIncentive, 2);

    return {
      currentResult,
      newResult,
      additionalSalesNeeded,
      incentiveIncrease,
    };
  }

  /**
   * Get tier distribution stats
   */
  getTierDistribution(calculations: IncentiveCalculation[]): {
    tierName: string;
    count: number;
    percentage: number;
    totalIncentive: number;
    averageIncentive: number;
  }[] {
    const distribution = new Map<string, IncentiveCalculation[]>();

    calculations.forEach((calc) => {
      const tierName = calc.tier?.name || 'No Incentive';
      if (!distribution.has(tierName)) {
        distribution.set(tierName, []);
      }
      distribution.get(tierName)!.push(calc);
    });

    return Array.from(distribution.entries()).map(([tierName, items]) => ({
      tierName,
      count: items.length,
      percentage: roundTo((items.length / calculations.length) * 100, 1),
      totalIncentive: roundTo(
        items.reduce((sum, calc) => sum + calc.totalIncentive, 0),
        2
      ),
      averageIncentive: roundTo(
        items.reduce((sum, calc) => sum + calc.totalIncentive, 0) / items.length,
        2
      ),
    }));
  }

  /**
   * Get achievement statistics
   */
  getAchievementStats(calculations: IncentiveCalculation[]): {
    min: number;
    max: number;
    average: number;
    median: number;
    standardDeviation: number;
  } {
    if (calculations.length === 0) {
      return { min: 0, max: 0, average: 0, median: 0, standardDeviation: 0 };
    }

    const achievements = calculations.map((c) => c.achievementPercent);
    const sorted = [...achievements].sort((a, b) => a - b);

    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const average = roundTo(achievements.reduce((a, b) => a + b, 0) / achievements.length, 2);

    // Median
    const median =
      achievements.length % 2 === 0
        ? roundTo((sorted[achievements.length / 2 - 1] + sorted[achievements.length / 2]) / 2, 2)
        : sorted[Math.floor(achievements.length / 2)];

    // Standard deviation
    const variance =
      achievements.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) /
      achievements.length;
    const standardDeviation = roundTo(Math.sqrt(variance), 2);

    return {
      min: roundTo(min, 2),
      max: roundTo(max, 2),
      average,
      median,
      standardDeviation,
    };
  }
}

export default new TierManager();
