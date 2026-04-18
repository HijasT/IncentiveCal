'use client';

import { useState, useEffect } from 'react';
import { AnalyticsTracker } from '@/lib/AnalyticsTracker';
import { AnalyticsStats } from '@/lib/types';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface Props {
  onToast: (message: string, type?: 'success' | 'error') => void;
}

export default function AnalyticsTab({ onToast }: Props) {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const data = AnalyticsTracker.getStats();
    setStats(data);
  }, [refreshKey]);

  const handleClear = () => {
    if (confirm('Clear all analytics data?')) {
      AnalyticsTracker.clear();
      setRefreshKey((prev) => prev + 1);
      onToast('Analytics cleared', 'success');
    }
  };

  if (!stats) {
    return (
      <div className="card">
        <h2>📈 Analytics</h2>
        <div className="alert warning">No calculations tracked yet. Start calculating to see analytics.</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>📈 Analytics</h2>

      <div className="grid">
        <div className="result-box">
          <div className="rb-label">Total Calculations</div>
          <div className="rb-val">{stats.totalCalculations}</div>
        </div>
        <div className="result-box">
          <div className="rb-label">Avg Achievement</div>
          <div className="rb-val">{stats.avgAchievement.toFixed(2)}%</div>
        </div>
        <div className="result-box">
          <div className="rb-label">Most Common Tier</div>
          <div className="rb-val">
            {stats.mostCommonTier ? `${stats.mostCommonTier.name} (${stats.mostCommonTier.count})` : 'N/A'}
          </div>
        </div>
      </div>

      {Object.keys(stats.tierDistribution).length > 0 && (
        <div className="chart-wrap">
          <div className="chart-title">Tier Distribution</div>
          {Object.entries(stats.tierDistribution)
            .sort((a, b) => b[1] - a[1])
            .map(([tierName, count]) => {
              const pct = ((count / stats.totalCalculations) * 100).toFixed(1);
              const width = (count / stats.totalCalculations) * 100;
              return (
                <div key={tierName} className="bar-row">
                  <div className="bar-label">{tierName}</div>
                  <div className="bar-track">
                    <div className="bar-fill blue" style={{ width: `${width}%` }}>
                      {count}
                    </div>
                  </div>
                  <div className="bar-amount">{pct}%</div>
                </div>
              );
            })}
        </div>
      )}

      <button className="btn-secondary" onClick={handleClear} style={{ marginTop: '20px', color: 'var(--err-color)' }}>
        🗑️ Clear Analytics
      </button>
    </div>
  );
}
