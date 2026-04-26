'use client'
import { useState, useEffect } from 'react'
import { IndividualTab } from '@/components/tabs/IndividualTab'
import { BulkTab } from '@/components/tabs/BulkTab'
import { AnalyticsTab } from '@/components/tabs/AnalyticsTab'
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
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
        <h1>Smart Incentive Calculator</h1>
        <p className="subtitle">v5.1</p>
      </header>

      <nav className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'individual' ? 'active' : ''}`}
          onClick={() => setActiveTab('individual')}
        >
          Individual
        </button>
        <button 
          className={`nav-tab ${activeTab === 'bulk' ? 'active' : ''}`}
          onClick={() => setActiveTab('bulk')}
        >
          Bulk
        </button>
	{/* ANALYTICS TAB - HIDDEN (Uncomment to show)
		<button 
		className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
		onClick={() => setActiveTab('analytics')}
		>
		Analytics <span style={{fontSize: '10px', opacity: '0.7'}}>*beta</span>
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

    {/* {activeTab === 'analytics' && <AnalyticsTab />} 
	*/}
      {activeTab === 'bulk' && <BulkTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
      {activeTab === 'settings' && <SettingsTab />}
      {activeTab === 'about' && <AboutTab />}
    </div>
  )
}
