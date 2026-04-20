// Analytics data storage and retrieval utilities

export interface MonthlyAnalytics {
  monthKey: string // "2026-04"
  date: string
  achievement: number
  tier: string
  tierRate: number
  tierColor: string
  totalEarnings: number
  rank: number
  totalStaff: number
  sales: number
  packages: number
  contribution: number
  teamSales: number
  teamAchievement: number
  teamTarget: number
  p1: number
  p2: number
}

export interface AnalyticsData {
  history: Record<string, MonthlyAnalytics>
  badges: string[]
}

const STORAGE_KEY = 'smart_incentive_analytics'

export function saveMonthlyData(data: MonthlyAnalytics): void {
  try {
    const existing = getAnalyticsData()
    existing.history[data.monthKey] = data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch (error) {
    console.error('Failed to save analytics:', error)
  }
}

export function getAnalyticsData(): AnalyticsData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { history: {}, badges: [] }
    }
    return JSON.parse(stored)
  } catch (error) {
    console.error('Failed to load analytics:', error)
    return { history: {}, badges: [] }
  }
}

export function getMonthlyHistory(): MonthlyAnalytics[] {
  const data = getAnalyticsData()
  return Object.values(data.history).sort((a, b) => a.date.localeCompare(b.date))
}

export function getLifetimeStats() {
  const history = getMonthlyHistory()
  
  if (history.length === 0) {
    return null
  }

  const totalEarnings = history.reduce((sum, m) => sum + m.totalEarnings, 0)
  const avgEarnings = totalEarnings / history.length
  
  const bestMonth = history.reduce((best, m) => 
    m.achievement > best.achievement ? m : best
  )
  
  const worstMonth = history.reduce((worst, m) => 
    m.achievement < worst.achievement ? m : worst
  )

  // Calculate current streak (consecutive months above 75%)
  let currentStreak = 0
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].achievement >= 75) {
      currentStreak++
    } else {
      break
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 0
  for (const month of history) {
    if (month.achievement >= 75) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }

  return {
    totalEarnings,
    avgEarnings,
    monthsTracked: history.length,
    bestMonth,
    worstMonth,
    currentStreak,
    longestStreak
  }
}

export function getRankHistory() {
  const history = getMonthlyHistory()
  return history.map(m => ({
    month: m.monthKey,
    rank: m.rank,
    totalStaff: m.totalStaff,
    percentile: ((m.totalStaff - m.rank + 1) / m.totalStaff) * 100
  }))
}

export function getCurrentMonthData(): MonthlyAnalytics | null {
  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const data = getAnalyticsData()
  return data.history[monthKey] || null
}

export function checkAndAwardBadges(newData: MonthlyAnalytics): string[] {
  const analytics = getAnalyticsData()
  const newBadges: string[] = []
  
  // First Sale
  if (!analytics.badges.includes('first-sale') && newData.sales > 0) {
    analytics.badges.push('first-sale')
    newBadges.push('first-sale')
  }

  // Tier achievements
  const tierBadges = ['tier-1', 'tier-2', 'tier-3', 'tier-4']
  const tierNames = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4']
  tierNames.forEach((tierName, idx) => {
    const badge = tierBadges[idx]
    if (!analytics.badges.includes(badge) && newData.tier === tierName) {
      analytics.badges.push(badge)
      newBadges.push(badge)
    }
  })

  // 100% Club
  if (!analytics.badges.includes('100-club') && newData.achievement >= 100) {
    analytics.badges.push('100-club')
    newBadges.push('100-club')
  }

  // Streaks
  const stats = getLifetimeStats()
  if (stats) {
    if (!analytics.badges.includes('streak-3') && stats.currentStreak >= 3) {
      analytics.badges.push('streak-3')
      newBadges.push('streak-3')
    }
    if (!analytics.badges.includes('streak-6') && stats.currentStreak >= 6) {
      analytics.badges.push('streak-6')
      newBadges.push('streak-6')
    }
    if (!analytics.badges.includes('streak-12') && stats.currentStreak >= 12) {
      analytics.badges.push('streak-12')
      newBadges.push('streak-12')
    }
  }

  // Rankings
  if (!analytics.badges.includes('top-10') && newData.rank <= 10) {
    analytics.badges.push('top-10')
    newBadges.push('top-10')
  }
  if (!analytics.badges.includes('top-5') && newData.rank <= 5) {
    analytics.badges.push('top-5')
    newBadges.push('top-5')
  }
  if (!analytics.badges.includes('top-3') && newData.rank <= 3) {
    analytics.badges.push('top-3')
    newBadges.push('top-3')
  }
  if (!analytics.badges.includes('champion') && newData.rank === 1) {
    analytics.badges.push('champion')
    newBadges.push('champion')
  }

  if (newBadges.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(analytics))
  }

  return newBadges
}

export function getBadgeInfo(badgeId: string) {
  const badges: Record<string, { name: string; icon: string; description: string }> = {
    'first-sale': {
      name: 'First Sale',
      icon: '🎯',
      description: 'Made your first sale'
    },
    'tier-1': {
      name: 'Tier 1',
      icon: '🥉',
      description: 'Reached Tier 1 (75%+)'
    },
    'tier-2': {
      name: 'Tier 2',
      icon: '🥈',
      description: 'Reached Tier 2 (85%+)'
    },
    'tier-3': {
      name: 'Tier 3',
      icon: '🥇',
      description: 'Reached Tier 3 (101%+)'
    },
    'tier-4': {
      name: 'Tier 4 Master',
      icon: '💎',
      description: 'Reached Tier 4 (111%+)'
    },
    '100-club': {
      name: '100% Club',
      icon: '💯',
      description: 'Achieved 100%+ in a month'
    },
    'streak-3': {
      name: '3-Month Streak',
      icon: '🔥',
      description: '3 consecutive months above 75%'
    },
    'streak-6': {
      name: '6-Month Streak',
      icon: '🔥🔥',
      description: '6 consecutive months above 75%'
    },
    'streak-12': {
      name: 'Year Streak',
      icon: '🔥🔥🔥',
      description: '12 consecutive months above 75%'
    },
    'top-10': {
      name: 'Top 10',
      icon: '🏆',
      description: 'Ranked in top 10'
    },
    'top-5': {
      name: 'Top 5',
      icon: '⭐',
      description: 'Ranked in top 5'
    },
    'top-3': {
      name: 'Top 3',
      icon: '🌟',
      description: 'Ranked in top 3'
    },
    'champion': {
      name: 'Champion',
      icon: '👑',
      description: 'Ranked #1'
    }
  }
  return badges[badgeId] || { name: badgeId, icon: '🎖️', description: '' }
}

export function clearAnalyticsData(): void {
  localStorage.removeItem(STORAGE_KEY)
}
