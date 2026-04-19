import { Tier, DEFAULT_TIERS } from '@/types/tier';
import { AnalyticsData } from '@/types/analytics';

const STORAGE_KEYS = {
  TIERS: 'sic_tiers_v5',
  THEME: 'sic_theme',
  ANALYTICS: 'sic_analytics_data',
  USER_NAME: 'sic_user_name',
} as const;

// Tier Management
export function getTiersFromStorage(): Tier[] {
  if (typeof window === 'undefined') return DEFAULT_TIERS;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TIERS);
    if (!stored) return DEFAULT_TIERS;
    return JSON.parse(stored);
  } catch {
    return DEFAULT_TIERS;
  }
}

export function saveTiersToStorage(tiers: Tier[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TIERS, JSON.stringify(tiers));
}

export function resetTiers(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TIERS, JSON.stringify(DEFAULT_TIERS));
}

// Theme Management
export function getThemeFromStorage(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  
  const stored = localStorage.getItem(STORAGE_KEYS.THEME);
  return (stored === 'light' || stored === 'dark') ? stored : 'dark';
}

export function saveThemeToStorage(theme: 'light' | 'dark'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

// Analytics Management
export function getAnalyticsFromStorage(): AnalyticsData {
  if (typeof window === 'undefined') {
    return getEmptyAnalytics();
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
    if (!stored) return getEmptyAnalytics();
    return JSON.parse(stored);
  } catch {
    return getEmptyAnalytics();
  }
}

export function saveAnalyticsToStorage(data: AnalyticsData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(data));
}

function getEmptyAnalytics(): AnalyticsData {
  return {
    monthlyData: {},
    achievements: [],
    personalBest: { achievement: 0, month: null },
    totalEarned: 0,
  };
}

// User Name Management
export function getUserNameFromStorage(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.USER_NAME) || '';
}

export function saveUserNameToStorage(name: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
}
