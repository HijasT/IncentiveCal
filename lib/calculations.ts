import { Tier, NextTierInfo } from '@/types/tier';
import { IndividualCalculation, BulkResult, StaffMember } from '@/types/calculator';

export function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function getTier(achievement: number, tiers: Tier[]): Tier {
  const belowTarget: Tier = {
    id: 'below',
    name: 'Below Target',
    min: 0,
    max: 74.99,
    rate: 0,
    color: '#FF5252',
  };

  if (achievement < 75) return belowTarget;

  const sortedTiers = [...tiers].sort((a, b) => a.min - b.min);
  const matchedTier = sortedTiers.find(
    (tier) => achievement >= tier.min && achievement <= tier.max
  );

  return matchedTier || belowTarget;
}

export function calculateIndividual(
  target: number,
  mySales: number,
  teamSales: number,
  packages: number,
  staffCount: number,
  p1Split: number,
  tiers: Tier[]
): IndividualCalculation {
  const teamAchievement = (teamSales / target) * 100;
  const tier = getTier(teamAchievement, tiers);
  const totalPool = (tier.rate / 100) * teamSales;
  const p1Pool = (p1Split / 100) * totalPool;
  const p2Pool = ((100 - p1Split) / 100) * totalPool;
  const p1PerPerson = p1Pool / staffCount;
  const individualPercent = (mySales / teamSales) * 100;
  const p2 = (mySales / teamSales) * p2Pool;
  const totalIncentive = p1PerPerson + p2;
  const achievement = (mySales / (target / staffCount)) * 100;

  return {
    target,
    sales: mySales,
    packages,
    staffCount,
    p1Split,
    achievement,
    tier,
    totalIncentive,
    p1: p1PerPerson,
    p2,
    individualPercent,
  };
}

export function calculateBulkResults(
  staff: StaffMember[],
  target: number,
  p1Percent: number,
  tiers: Tier[]
): BulkResult[] {
  const teamSales = staff.reduce((sum, s) => sum + s.sales, 0);
  const teamAchievement = (teamSales / target) * 100;
  const tier = getTier(teamAchievement, tiers);
  const totalPool = (tier.rate / 100) * teamSales;
  const p1Pool = (p1Percent / 100) * totalPool;
  const p2Pool = ((100 - p1Percent) / 100) * totalPool;
  const p1PerPerson = p1Pool / staff.length;

  const results = staff.map((person) => {
    const individualPercent = (person.sales / teamSales) * 100;
    const p2Share = (person.sales / teamSales) * p2Pool;
    const totalIncentive = p1PerPerson + p2Share;

    return {
      name: person.name,
      totalIncentive,
      packages: person.packages,
      sales: person.sales,
      individualPercent,
      p1: p1PerPerson,
      p2: p2Share,
    };
  });

  // Sort by SALES (highest to lowest)
  results.sort((a, b) => b.sales - a.sales);

  return results;
}

export function calculateNextTier(
  teamAchievement: number,
  tier: Tier,
  target: number,
  teamSales: number,
  tiers: Tier[]
): NextTierInfo {
  const sortedTiers = [...tiers].sort((a, b) => a.min - b.min);
  const currentTierIndex = sortedTiers.findIndex((t) => t.id === tier.id);

  if (tier.rate === 0) {
    const requiredSales = (75 / 100) * target;
    const deficit = requiredSales - teamSales;
    return {
      nextTierName: 'Tier 1',
      nextTierRate: sortedTiers[0].rate,
      requiredPercentage: 75,
      requiredSales,
      deficit,
      isMaxTier: false,
    };
  } else if (currentTierIndex >= 0 && currentTierIndex < sortedTiers.length - 1) {
    const nextTier = sortedTiers[currentTierIndex + 1];
    const requiredPercentage = nextTier.min;
    const requiredSales = (requiredPercentage / 100) * target;
    const deficit = requiredSales - teamSales;
    return {
      nextTierName: nextTier.name,
      nextTierRate: nextTier.rate,
      requiredPercentage,
      requiredSales,
      deficit,
      isMaxTier: false,
    };
  } else {
    const highestTier = sortedTiers[currentTierIndex];
    const thresholdSales = (highestTier.min / 100) * target;
    const thresholdPool = (highestTier.rate / 100) * thresholdSales;
    const actualPool = (highestTier.rate / 100) * teamSales;
    const extraIncentive = actualPool - thresholdPool;

    return {
      isMaxTier: true,
      currentRate: tier.rate,
      thresholdPercentage: highestTier.min,
      thresholdSales,
      thresholdPool,
      extraIncentive,
    };
  }
}

export function calculateReverse(
  targetPercentage: number,
  teamSales: number,
  staffCount: number,
  target: number,
  p1Split: number,
  tiers: Tier[]
): { requiredSales: number; newIncentive: number } {
  const requiredTeamSales = (targetPercentage / 100) * target;
  const tier = getTier(targetPercentage, tiers);
  const totalPool = (tier.rate / 100) * requiredTeamSales;
  const p1Pool = (p1Split / 100) * totalPool;
  const p2Pool = ((100 - p1Split) / 100) * totalPool;
  const p1PerPerson = p1Pool / staffCount;

  const yourCurrentSales = teamSales / staffCount;
  const requiredSales = requiredTeamSales / staffCount;
  const additionalSales = requiredSales - yourCurrentSales;

  const individualPercent = (requiredSales / requiredTeamSales) * 100;
  const p2 = (requiredSales / requiredTeamSales) * p2Pool;
  const newIncentive = p1PerPerson + p2;

  return {
    requiredSales: additionalSales,
    newIncentive,
  };
}
