'use client';

import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon: string;
  desc?: string;
}

interface TabNavigationProps {
  activeTab: string;
  tabs: Tab[];
  setActiveTab: (tabId: string) => void;
}

export default function TabNavigation({ activeTab, tabs, setActiveTab }: TabNavigationProps) {
  return (
    <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
            activeTab === tab.id
              ? 'bg-teal-600 dark:bg-teal-500 text-white shadow-lg'
              : 'bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-700'
          }`}
          title={tab.desc}
        >
          <span className="text-lg">{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
