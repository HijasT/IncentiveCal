'use client';

import { useState } from 'react';
import TabNavigation from '@/components/TabNavigation';
import IndividualMode from '@/components/modes/IndividualMode';
import BulkMode from '@/components/modes/BulkMode';
import SettingsPage from '@/components/SettingsPage';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

type TabId = 'individual' | 'bulk' | 'settings' | 'analytics';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'individual', label: 'Individual', icon: '👤' },
  { id: 'bulk', label: 'Bulk', icon: '📤' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('individual');

  const handleSetActiveTab = (tabId: string) => {
    setActiveTab(tabId as TabId);
  };

  return (
    <>
      {/* Tab Navigation */}
      <div className="sticky top-16 z-40 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleSetActiveTab(tab.id)}
                className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                    : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Tab Content */}
        <div className="mt-8 animate-fade-in">
          {activeTab === 'individual' && <IndividualMode />}
          {activeTab === 'bulk' && <BulkMode />}
          {activeTab === 'settings' && <SettingsPage />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
        </div>
      </main>
    </>
  );
}
