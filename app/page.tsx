'use client'

import { useState } from 'react'

// Placeholder components - you'll implement these
function IndividualTab() {
  return <div className="card">Individual Calculator - To be implemented</div>
}

function BulkTab() {
  return <div className="card">Bulk Mode - To be implemented</div>
}

function AnalyticsTab() {
  return <div className="card">Analytics Dashboard - To be implemented</div>
}

function SettingsTab() {
  return <div className="card">Settings - To be implemented</div>
}

function AboutTab() {
  return <div className="card">About - To be implemented</div>
}

type Tab = 'individual' | 'bulk' | 'analytics' | 'settings' | 'about'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('individual')

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            💰 Smart Incentive Calculator
          </h1>
          <p className="text-text-secondary">
            Track your performance, calculate incentives, and unlock achievements
          </p>
        </header>

        {/* Navigation */}
        <nav className="mb-8 border-b border-border-color">
          <div className="flex gap-2 overflow-x-auto">
            {(['individual', 'bulk', 'analytics', 'settings', 'about'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </nav>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'individual' && <IndividualTab />}
          {activeTab === 'bulk' && <BulkTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'about' && <AboutTab />}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-text-muted text-sm">
          © 2026 HT - Licensed for general use, Smart Salem prohibited from deployment
        </footer>
      </div>
    </main>
  )
}
