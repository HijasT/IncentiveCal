// Utility functions extracted from original HTML

export interface Tier {
  id: string
  name: string
  min: number
  max: number
  rate: number
  color: string
}

export const DEFAULT_TIERS: Tier[] = [
  { id: 'tier1', name: 'Tier 1', min: 75, max: 84.99, rate: 4, color: '#ffa726' },
  { id: 'tier2', name: 'Tier 2', min: 85, max: 100.99, rate: 5, color: '#00CED1' },
  { id: 'tier3', name: 'Tier 3', min: 101, max: 110.99, rate: 6, color: '#20B2AA' },
  { id: 'tier4', name: 'Tier 4', min: 111, max: Infinity, rate: 7, color: '#48D1CC' },
]

export function loadTiers(): Tier[] {
  try {
    const stored = localStorage.getItem('sic_tiers')
    return stored ? JSON.parse(stored) : DEFAULT_TIERS
  } catch {
    return DEFAULT_TIERS
  }
}

export function saveTiers(tiers: Tier[]) {
  localStorage.setItem('sic_tiers', JSON.stringify(tiers))
}

export function getTier(achievementPercent: number, tiers: Tier[] = DEFAULT_TIERS): Tier {
  for (const tier of tiers) {
    if (achievementPercent >= tier.min && achievementPercent <= tier.max) {
      return tier
    }
  }
  return { id: 'none', name: 'None', min: 0, max: 74.99, rate: 0, color: '#ff5252' }
}

export function formatCurrency(n: number): string {
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export interface CalculationResult {
  teamAchievement: number
  tier: Tier
  totalPool: number
  p1Pool: number
  p2Pool: number
  myP1: number
  myP2: number
  myTotal: number
  myContribution: number
  teamTarget: number
  teamSales: number
  mySales: number
  staffCount: number
  nextTierInfo: any
  error?: string
}

export function calculateIncentive(
  teamTarget: number,
  teamSales: number,
  mySales: number,
  staffCount: number,
  p1Percent: number,
  customTiers?: Tier[]
): CalculationResult {
  const tiers = customTiers || loadTiers()

  if (teamTarget <= 0 || teamSales <= 0 || mySales < 0 || staffCount <= 0) {
    return { error: 'All values must be positive numbers' } as any
  }

  if (mySales > teamSales) {
    return { error: 'Your sales cannot exceed team sales' } as any
  }

  const teamAchievement = (teamSales / teamTarget) * 100
  const tier = getTier(teamAchievement, tiers)

  // Calculate next tier info
  let nextTierInfo = null
  const sortedTiers = [...tiers].sort((a, b) => a.min - b.min)
  const currentTierIndex = sortedTiers.findIndex(t => t.id === tier.id)

  if (tier.rate === 0) {
    const requiredSales = (75 / 100) * teamTarget
    const deficit = requiredSales - teamSales
    nextTierInfo = {
      nextTierName: 'Tier 1',
      nextTierRate: sortedTiers[0].rate,
      requiredPercentage: 75,
      requiredSales: requiredSales,
      deficit: deficit,
      isMaxTier: false
    }
  } else if (currentTierIndex >= 0 && currentTierIndex < sortedTiers.length - 1) {
    const nextTier = sortedTiers[currentTierIndex + 1]
    const requiredPercentage = nextTier.min
    const requiredSales = (requiredPercentage / 100) * teamTarget
    const deficit = requiredSales - teamSales
    nextTierInfo = {
      nextTierName: nextTier.name,
      nextTierRate: nextTier.rate,
      requiredPercentage: requiredPercentage,
      requiredSales: requiredSales,
      deficit: deficit,
      isMaxTier: false
    }
  } else if (currentTierIndex === sortedTiers.length - 1) {
    const highestTier = sortedTiers[currentTierIndex]
    const thresholdSales = (highestTier.min / 100) * teamTarget
    const thresholdPool = (highestTier.rate / 100) * thresholdSales
    const actualPool = (highestTier.rate / 100) * teamSales
    const extraIncentive = actualPool - thresholdPool

    nextTierInfo = {
      isMaxTier: true,
      currentRate: tier.rate,
      thresholdPercentage: highestTier.min,
      thresholdSales: thresholdSales,
      thresholdPool: thresholdPool,
      extraIncentive: extraIncentive
    }
  }

  const totalPool = (tier.rate / 100) * teamSales
  const p1Pool = (p1Percent / 100) * totalPool
  const p2Pool = ((100 - p1Percent) / 100) * totalPool
  const myP1 = p1Pool / staffCount
  const myContribution = (mySales / teamSales) * 100
  const myP2 = (mySales / teamSales) * p2Pool
  const myTotal = myP1 + myP2

  return {
    teamAchievement,
    tier,
    totalPool,
    p1Pool,
    p2Pool,
    myP1,
    myP2,
    myTotal,
    myContribution,
    teamTarget,
    teamSales,
    mySales,
    staffCount,
    nextTierInfo
  }
}
