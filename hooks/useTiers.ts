'use client'

import { useState, useEffect } from 'react';
import { Tier, DEFAULT_TIERS } from '@/types/tier';
import { getTiersFromStorage, saveTiersToStorage, resetTiers as resetTiersStorage } from '@/lib/storage';

export function useTiers() {
  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedTiers = getTiersFromStorage();
    setTiers(storedTiers);
    setIsLoaded(true);
  }, []);

  const updateTier = (id: string, updates: Partial<Tier>) => {
    const updatedTiers = tiers.map((tier) =>
      tier.id === id ? { ...tier, ...updates } : tier
    );
    setTiers(updatedTiers);
    saveTiersToStorage(updatedTiers);
  };

  const resetTiers = () => {
    setTiers(DEFAULT_TIERS);
    resetTiersStorage();
  };

  return {
    tiers,
    isLoaded,
    updateTier,
    resetTiers,
  };
}
