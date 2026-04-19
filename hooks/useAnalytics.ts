'use client'

import { useState, useEffect, useCallback } from 'react';
import { AnalyticsData, Achievement } from '@/types/analytics';
import { Tier } from '@/types/tier';
import { getAnalyticsFromStorage, saveAnalyticsToStorage } from '@/lib/storage';
import { recordCalculation as recordCalc, calculateStreak } from '@/lib/analytics';

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    monthlyData: {},
    achievements: [],
    personalBest: { achievement: 0, month: null },
    totalEarned: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = getAnalyticsFromStorage();
    setAnalytics(stored);
    setIsLoaded(true);
  }, []);

  const recordCalculation = useCallback(
    (
      month: string,
      year: string,
      achievement: number,
      sales: number,
      packages: number,
      tier: Tier,
      incentive: number
    ): Achievement[] => {
      const { data, newAchievements } = recordCalc(
        analytics,
        month,
        year,
        achievement,
        sales,
        packages,
        tier,
        incentive
      );

      setAnalytics(data);
      saveAnalyticsToStorage(data);

      return newAchievements;
    },
    [analytics]
  );

  const getStreak = useCallback(() => {
    return calculateStreak(analytics);
  }, [analytics]);

  const clearAnalytics = useCallback(() => {
    const empty: AnalyticsData = {
      monthlyData: {},
      achievements: [],
      personalBest: { achievement: 0, month: null },
      totalEarned: 0,
    };
    setAnalytics(empty);
    saveAnalyticsToStorage(empty);
  }, []);

  return {
    analytics,
    isLoaded,
    recordCalculation,
    getStreak,
    clearAnalytics,
  };
}
