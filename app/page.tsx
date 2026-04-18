'use client';

import { useState, useEffect } from 'react';
import TabNavigation from '@/components/TabNavigation';
import IndividualMode from '@/components/modes/IndividualMode';
import BulkMode from '@/components/modes/BulkMode';
import SettingsPage from '@/components/SettingsPage';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

type TabId = 'individual' | 'bulk' | 'analytics' | 'settings';

const tabs = [
  { id: 'individual' as const, label: 'Individual', icon: '👤', desc: 'Single calculation' },
  { id: 'bulk' as const, label: 'Bulk Mode', icon: '📤', desc: 'Upload & process' },
  { id: 'analytics' as const, label: 'Analytics', icon: '📊', desc: 'Insights & trends' },
  { id: 'settings' as const, label: 'Settings', icon: '⚙️', desc: 'Configure tiers' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('individual');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load dark mode preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sic_dark_mode');
      const isDark = saved ? JSON.parse(saved) : false;
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    localStorage.setItem('sic_dark_mode', JSON.stringify(newValue));
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-slate-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-teal-600 to-teal-500 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  💼 Smart Incentive Calculator
                </span>
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                v5.0 • Modular • Analytics • Team Comparison
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} tabs={tabs} setActiveTab={(tabId) => setActiveTab(tabId as TabId)} />

        {/* Tab Content */}
        <div className="mt-8 animate-fade-in">
          {activeTab === 'individual' && <IndividualMode />}
          {activeTab === 'bulk' && <BulkMode />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'settings' && <SettingsPage />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-gray-800 mt-16 py-8 bg-slate-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>© 2026 Smart Incentive Calculator v5.0 • All data processed locally</p>
          <p className="mt-2 text-xs">
            Restriction: Smart Salem and affiliates prohibited from use/copy/deploy
          </p>
        </div>
      </footer>
    </div>
  );
}
