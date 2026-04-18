import { Tier, Config, CalculationResult } from './types';

export class TierManager {
  private static config: Config | null = null;

  static init(config: Config) {
    this.config = config;
  }

  static getConfig(): Config {
    if (!this.config) {
      throw new Error('TierManager not initialized');
    }
    return this.config;
  }

  static getTier(achievement: number): Tier {
    const config = this.getConfig();
    for (const tier of config.tiers) {
      const min = tier.min;
      const max = tier.max ?? Infinity;
      if (achievement >= min && achievement <= max) {
        return tier;
      }
    }
    return config.tiers[0];
  }

  static calculate(
    staffSales: number,
    totalSales: number,
    target: number,
    numStaff: number,
    split: { equal: number; personal: number }
  ): CalculationResult {
    const config = this.getConfig();

    // Achievement based on total sales vs target
    const achievement = target > 0 ? (totalSales / target) * 100 : 0;
    const tier = this.getTier(achievement);

    // Pool incentive calculation
    const baseIncentive = (tier.rate / 100) * totalSales;
    const p1Share = (split.equal / 100) * baseIncentive;
    const p2Share = (split.personal / 100) * baseIncentive;

    // Individual gets equal share from P1
    const p1Individual = p1Share / Math.max(numStaff, 1);
    // Individual gets share from P2 based on sales contribution
    const salesRatio = totalSales > 0 ? staffSales / totalSales : 0;
    const p2Individual = salesRatio * p2Share;

    const totalIncentive = p1Individual + p2Individual;

    return {
      achievement,
      tier,
      baseIncentive,
      p1Share,
      p2Share,
      totalIncentive,
    };
  }

  static validate(): { valid: boolean; error?: string } {
    const config = this.getConfig();
    if (!config.tiers || config.tiers.length === 0) {
      return { valid: false, error: 'At least one tier required' };
    }
    for (const tier of config.tiers) {
      if (typeof tier.rate !== 'number' || tier.rate < 0) {
        return { valid: false, error: `Invalid rate for ${tier.name}` };
      }
    }
    return { valid: true };
  }
}
