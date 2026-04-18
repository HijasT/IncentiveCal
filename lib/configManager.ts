/**
 * Configuration Manager
 * Handles tier configuration, defaults, import/export, localStorage
 */

export interface Tier {
  id: string;
  name: string;
  min: number;
  max: number | null;
  rate: number; // as percentage (e.g., 2.5 for 2.5%)
}

export interface Config {
  tiers: Tier[];
  defaultSplit: {
    equal: number;
    personal: number;
  };
  lastUpdated: string;
}

const DEFAULT_CONFIG: Config = {
  tiers: [
    { id: 'tier1', name: 'Tier 1', min: 75, max: 84, rate: 1.5 },
    { id: 'tier2', name: 'Tier 2', min: 85, max: 100, rate: 2.5 },
    { id: 'tier3', name: 'Tier 3', min: 101, max: 110, rate: 3.0 },
    { id: 'tier4', name: 'Tier 4', min: 111, max: null, rate: 3.5 },
  ],
  defaultSplit: {
    equal: 60,
    personal: 40,
  },
  lastUpdated: new Date().toISOString(),
};

class ConfigManager {
  private storageKey = 'sic_config_v5';
  private config: Config;

  constructor() {
    this.config = this.loadFromStorage() || DEFAULT_CONFIG;
  }

  /**
   * Load config from localStorage (client-side only)
   */
  private loadFromStorage(): Config | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load config from storage:', error);
      return null;
    }
  }

  /**
   * Save config to localStorage
   */
  saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      this.config.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save config to storage:', error);
      throw new Error('Failed to save configuration');
    }
  }

  /**
   * Get current config
   */
  getConfig(): Config {
    return JSON.parse(JSON.stringify(this.config));
  }

  /**
   * Update config
   */
  updateConfig(newConfig: Partial<Config>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveToStorage();
  }

  /**
   * Update tiers
   */
  updateTiers(tiers: Tier[]): { valid: boolean; errors: string[] } {
    const errors = this.validateTiers(tiers);
    if (errors.length > 0) {
      return { valid: false, errors };
    }
    this.config.tiers = tiers;
    this.saveToStorage();
    return { valid: true, errors: [] };
  }

  /**
   * Validate tier configuration
   */
  validateTiers(tiers: Tier[]): string[] {
    const errors: string[] = [];

    if (tiers.length === 0) {
      errors.push('At least one tier is required');
      return errors;
    }

    // Sort by min value
    const sorted = [...tiers].sort((a, b) => a.min - b.min);

    for (let i = 0; i < sorted.length; i++) {
      const tier = sorted[i];

      // Validate min/max
      if (tier.min < 0 || tier.min > 100) {
        errors.push(`${tier.name}: Min must be between 0-100`);
      }
      if (tier.max !== null && (tier.max < tier.min || tier.max > 100)) {
        errors.push(`${tier.name}: Max must be >= Min and <= 100`);
      }

      // Validate rate
      if (tier.rate < 0 || tier.rate > 100) {
        errors.push(`${tier.name}: Rate must be between 0-100`);
      }

      // Check for overlaps
      if (i < sorted.length - 1) {
        const next = sorted[i + 1];
        if (tier.max && tier.max >= next.min) {
          errors.push(
            `${tier.name} and ${next.name} ranges overlap (${tier.name} max: ${tier.max}, ${next.name} min: ${next.min})`
          );
        }
      }
    }

    return errors;
  }

  /**
   * Reset to defaults
   */
  resetToDefaults(): void {
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    this.saveToStorage();
  }

  /**
   * Export as JSON
   */
  exportAsJSON(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import from JSON
   */
  importFromJSON(jsonString: string): { success: boolean; error?: string } {
    try {
      const imported = JSON.parse(jsonString);

      // Validate structure
      if (!imported.tiers || !Array.isArray(imported.tiers)) {
        return { success: false, error: 'Invalid JSON: missing tiers array' };
      }
      if (!imported.defaultSplit) {
        return { success: false, error: 'Invalid JSON: missing defaultSplit' };
      }

      const errors = this.validateTiers(imported.tiers);
      if (errors.length > 0) {
        return { success: false, error: `Tier validation failed: ${errors.join(', ')}` };
      }

      this.config = imported;
      this.saveToStorage();
      return { success: true };
    } catch (error) {
      return { success: false, error: `JSON parsing error: ${error}` };
    }
  }

  /**
   * Get default config
   */
  static getDefaults(): Config {
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }
}

export default new ConfigManager();
