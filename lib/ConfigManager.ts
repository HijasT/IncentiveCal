import { Config, Tier } from './types';

const DEFAULT_CONFIG: Config = {
  tiers: [
    { id: 'tier-1', name: 'No Incentive', min: 0, max: 74.99, rate: 0 },
    { id: 'tier-2', name: 'Tier 1', min: 75, max: 84.99, rate: 1.5 },
    { id: 'tier-3', name: 'Tier 2', min: 85, max: 100, rate: 2.5 },
    { id: 'tier-4', name: 'Tier 3', min: 101, max: 110, rate: 3 },
    { id: 'tier-5', name: 'Tier 4', min: 111, max: undefined, rate: 3.5 },
  ],
  defaultSplit: { equal: 60, personal: 40 },
};

export class ConfigManager {
  private static STORAGE_KEY = 'sic_config_v5';

  static load(): Config {
    try {
      if (typeof window === 'undefined') return DEFAULT_CONFIG;
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : { ...DEFAULT_CONFIG };
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  }

  static save(config: Config): { success: boolean; message: string } {
    try {
      if (typeof window === 'undefined') return { success: false, message: 'Not in browser' };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      return { success: true, message: 'Settings saved' };
    } catch (e) {
      return { success: false, message: String(e) };
    }
  }

  static reset(): { success: boolean; message: string } {
    try {
      if (typeof window === 'undefined') return { success: false, message: 'Not in browser' };
      localStorage.removeItem(this.STORAGE_KEY);
      return { success: true, message: 'Reset to defaults' };
    } catch (e) {
      return { success: false, message: String(e) };
    }
  }

  static export(config: Config): string {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sic-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return json;
  }

  static import(jsonStr: string): { success: boolean; config?: Config; error?: string } {
    try {
      const config = JSON.parse(jsonStr) as Config;
      if (!config.tiers || !Array.isArray(config.tiers)) {
        return { success: false, error: 'Invalid config format' };
      }
      return { success: true, config };
    } catch (e) {
      return { success: false, error: 'Invalid JSON: ' + String(e) };
    }
  }
}
