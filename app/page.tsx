'use client'
import { useState, useEffect } from 'react'
import { IndividualTab } from '@/components/tabs/IndividualTab'
import { MoonIcon, SunIcon } from '@/components/icons'
import { BulkAnalyticsTab } from '@/components/tabs/BulkAnalyticsTab'
import { SettingsTab } from '@/components/tabs/SettingsTab'
import { AboutTab } from '@/components/tabs/AboutTab'

export default function Home() {
  const [activeTab, setActiveTab] = useState('individual')
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const saved = localStorage.getItem('sic_theme')
    if (saved === 'light') {
      setTheme('light')
      document.body.classList.add('light-mode')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.body.classList.toggle('light-mode')
    localStorage.setItem('sic_theme', newTheme)
  }

  return (
    <div className="container">
      <header className="header">
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <MoonIcon large /> : <SunIcon large />}
        </button>
        <h1>Smart Incentive Calculator</h1>
        <p className="subtitle">v7.2.1</p>
      </header>

      <nav className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'individual' ? 'active' : ''}`}
          onClick={() => setActiveTab('individual')}
        >
          Individual
        </button>
        <button 
          className={`nav-tab ${activeTab === 'bulk-analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('bulk-analytics')}
        >
          Bulk & Analytics
        </button>
        {/* DATA ENTRY TAB - MOCKUP (Uncomment to show)
        <button 
          className={`nav-tab ${activeTab === 'dataentry' ? 'active' : ''}`}
          onClick={() => setActiveTab('dataentry')}
        >
          Data Entry <span style={{fontSize: '10px', opacity: '0.7'}}>*mockup</span>
        </button>
        */}
        <button 
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button 
          className={`nav-tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
      </nav>

      {activeTab === 'individual' && <IndividualTab />}
      {activeTab === 'bulk-analytics' && <BulkAnalyticsTab />}
      {/* DATA ENTRY TAB - MOCKUP (Uncomment to show) */}
      {/* {activeTab === 'dataentry' && <DataEntryTab />} */}
      {activeTab === 'settings' && <SettingsTab />}
      {activeTab === 'about' && <AboutTab />}
    </div>
  )
}
