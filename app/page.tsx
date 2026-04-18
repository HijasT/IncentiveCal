'use client';

import { useEffect, useState } from 'react';
import { ConfigManager } from '@/lib/ConfigManager';
import { TierManager } from '@/lib/TierManager';
import { AnalyticsTracker } from '@/lib/AnalyticsTracker';
import { Config } from '@/lib/types';
import IndividualTab from '@/components/tabs/IndividualTab';
import BulkTab from '@/components/tabs/BulkTab';
import SettingsTab from '@/components/tabs/SettingsTab';
import AnalyticsTab from '@/components/tabs/AnalyticsTab';
import Toast from '@/components/Toast';
import DarkModeToggle from '@/components/DarkModeToggle';

type TabType = 'individual' | 'bulk' | 'settings' | 'analytics';

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabType>('individual');
  const [config, setConfig] = useState<Config | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Initialize on client side only
    const cfg = ConfigManager.load();
    TierManager.init(cfg);
    setConfig(cfg);
  }, []);

  const handleShowToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  const handleConfigUpdate = (newConfig: Config) => {
    const result = ConfigManager.save(newConfig);
    setConfig(newConfig);
    TierManager.init(newConfig);
    handleShowToast(result.message || 'Settings saved', 'success');
  };

  if (!config) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <>
      <header className="app-header">
        <div className="title-row">
          <div>
            <h1>💰 Smart Incentive Calculator</h1>
            <span className="version">v5.0</span>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      <nav className="tabs">
        {(['individual', 'bulk', 'settings', 'analytics'] as const).map((tab) => (
          <button
            key={tab}
            className={`pill ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'individual' && '👤 Individual'}
            {tab === 'bulk' && '📊 Bulk'}
            {tab === 'settings' && '⚙️ Settings'}
            {tab === 'analytics' && '📈 Analytics'}
          </button>
        ))}
      </nav>

      <main>
        {activeTab === 'individual' && <IndividualTab config={config} onToast={handleShowToast} />}
        {activeTab === 'bulk' && <BulkTab config={config} onToast={handleShowToast} />}
        {activeTab === 'settings' && (
          <SettingsTab config={config} onConfigUpdate={handleConfigUpdate} onToast={handleShowToast} />
        )}
        {activeTab === 'analytics' && <AnalyticsTab onToast={handleShowToast} />}
      </main>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}
