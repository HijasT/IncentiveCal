'use client';

import { useState } from 'react';
import { Config } from '@/lib/types';
import { ConfigManager } from '@/lib/ConfigManager';

interface Props {
  config: Config;
  onConfigUpdate: (config: Config) => void;
  onToast: (message: string, type?: 'success' | 'error') => void;
}

export default function SettingsTab({ config, onConfigUpdate, onToast }: Props) {
  const [splitValue, setSplitValue] = useState(config.defaultSplit.equal);
  const [tiers, setTiers] = useState(config.tiers);

  const handleSave = () => {
    const newConfig: Config = {
      tiers,
      defaultSplit: { equal: splitValue, personal: 100 - splitValue },
    };
    onConfigUpdate(newConfig);
  };

  const handleReset = () => {
    if (confirm('Reset all settings to defaults?')) {
      ConfigManager.reset();
      onToast('Reset to defaults', 'success');
      window.location.reload();
    }
  };

  const handleExport = () => {
    ConfigManager.export(config);
    onToast('✓ Settings exported', 'success');
  };

  return (
    <div className="card">
      <h2>⚙️ Settings</h2>

      <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Tier Structure</h3>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Tier Name</th>
              <th>Min %</th>
              <th>Max %</th>
              <th>Rate %</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => (
              <tr key={tier.id}>
                <td>
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => {
                      const updated = tiers.map((t) =>
                        t.id === tier.id ? { ...t, name: e.target.value } : t
                      );
                      setTiers(updated);
                    }}
                    style={{ width: '100%' }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={tier.min}
                    onChange={(e) => {
                      const updated = tiers.map((t) =>
                        t.id === tier.id ? { ...t, min: parseFloat(e.target.value) } : t
                      );
                      setTiers(updated);
                    }}
                    style={{ width: '100%' }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={tier.max || '∞'}
                    onChange={(e) => {
                      const updated = tiers.map((t) =>
                        t.id === tier.id ? { ...t, max: e.target.value === '∞' ? undefined : parseFloat(e.target.value) } : t
                      );
                      setTiers(updated);
                    }}
                    style={{ width: '100%' }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={tier.rate}
                    onChange={(e) => {
                      const updated = tiers.map((t) =>
                        t.id === tier.id ? { ...t, rate: parseFloat(e.target.value) } : t
                      );
                      setTiers(updated);
                    }}
                    step="0.1"
                    style={{ width: '100%' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Default Split</h3>
      <div style={{ marginBottom: '20px' }}>
        <label>P1 (Equal): {splitValue}% / P2 (Personal): {100 - splitValue}%</label>
        <input
          type="range"
          min="0"
          max="100"
          value={splitValue}
          onChange={(e) => setSplitValue(parseInt(e.target.value))}
          style={{
            background: `linear-gradient(to right, var(--darkblue) ${splitValue}%, rgba(150,150,150,0.3) ${splitValue}%)`,
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={handleSave}>
          💾 Save Settings
        </button>
        <button className="btn-secondary" onClick={handleExport}>
          📥 Export
        </button>
        <button className="btn-secondary" onClick={handleReset} style={{ color: 'var(--err-color)' }}>
          🔄 Reset
        </button>
      </div>
    </div>
  );
}
