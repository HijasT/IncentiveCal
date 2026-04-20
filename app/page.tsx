'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('individual')
  const [theme, setTheme] = useState('dark')
  
  // Individual tab state
  const [teamTarget, setTeamTarget] = useState('')
  const [teamSales, setTeamSales] = useState('')
  const [mySales, setMySales] = useState('')
  const [staffCount, setStaffCount] = useState('29')
  const [p1Split, setP1Split] = useState(60)
  const [results, setResults] = useState<any>(null)

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

  const updateSlider = (value: number) => {
    setP1Split(value)
  }

  const formatCurrency = (n: number) => {
    return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const getTier = (achievementPercent: number) => {
    const tiers = [
      { id: 'tier1', name: 'Tier 1', min: 75, max: 84.99, rate: 4, color: '#ffa726' },
      { id: 'tier2', name: 'Tier 2', min: 85, max: 100.99, rate: 5, color: '#00CED1' },
      { id: 'tier3', name: 'Tier 3', min: 101, max: 110.99, rate: 6, color: '#20B2AA' },
      { id: 'tier4', name: 'Tier 4', min: 111, max: Infinity, rate: 7, color: '#48D1CC' },
    ]
    
    for (const tier of tiers) {
      if (achievementPercent >= tier.min && achievementPercent <= tier.max) {
        return tier
      }
    }
    
    return { id: 'none', name: 'None', min: 0, max: 74.99, rate: 0, color: '#ff5252' }
  }

  const calculateIncentive = (teamTarget: number, teamSales: number, mySales: number, staffCount: number, p1Percent: number) => {
    if (!teamTarget || teamTarget <= 0) {
      return { error: 'Please enter a valid team target.' }
    }
    
    if (!teamSales || teamSales < 0) {
      return { error: 'Please enter valid team sales.' }
    }
    
    if (!staffCount || staffCount <= 0) {
      return { error: 'Please enter a valid staff count.' }
    }
    
    const teamAchievement = (teamSales / teamTarget) * 100
    const tier = getTier(teamAchievement)
    const totalPool = (teamSales * tier.rate) / 100
    const myContribution = teamSales > 0 ? (mySales / teamSales) * 100 : 0
    
    const p1Pool = (totalPool * p1Percent) / 100
    const p2Pool = (totalPool * (100 - p1Percent)) / 100
    
    const myP1 = p1Pool / staffCount
    const myP2 = (p2Pool * myContribution) / 100
    const myTotal = myP1 + myP2
    
    // Calculate next tier info
    let nextTierInfo = null
    if (tier.rate === 7) {
      const threshold = teamTarget * 1.11
      const extraSales = teamSales - threshold
      const extraIncentive = extraSales > 0 ? (extraSales * 0.07) : 0
      nextTierInfo = {
        isMaxTier: true,
        extraIncentive,
        thresholdPercentage: 111,
        currentRate: 7
      }
    } else {
      const nextTierThreshold = tier.rate === 0 ? 0.75 : tier.rate === 4 ? 0.85 : tier.rate === 5 ? 1.01 : 1.11
      const requiredSales = teamTarget * nextTierThreshold
      const deficit = requiredSales - teamSales
      const nextTierName = tier.rate === 0 ? 'Tier 1' : tier.rate === 4 ? 'Tier 2' : tier.rate === 5 ? 'Tier 3' : 'Tier 4'
      const nextTierRate = tier.rate === 0 ? 4 : tier.rate === 4 ? 5 : tier.rate === 5 ? 6 : 7
      
      nextTierInfo = {
        isMaxTier: false,
        deficit: Math.max(0, deficit),
        requiredSales,
        requiredPercentage: nextTierThreshold * 100,
        nextTierName,
        nextTierRate
      }
    }
    
    return {
      teamAchievement,
      tier,
      totalPool,
      myContribution,
      p1Pool,
      p2Pool,
      myP1,
      myP2,
      myTotal,
      nextTierInfo
    }
  }

  const calculate = () => {
    const target = parseFloat(teamTarget)
    const sales = parseFloat(teamSales)
    const my = parseFloat(mySales) || 0
    const staff = parseInt(staffCount)
    
    const result = calculateIncentive(target, sales, my, staff, p1Split)
    setResults(result)
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
        <button 
          className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
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

      {/* INDIVIDUAL TAB */}
      {activeTab === 'individual' && (
        <section className="card">
          <div className="privacy-notice">
            <span className="privacy-icon">🔒</span>
            <span>100% local calculation • No data shared • Browser-only processing • Your data stays private</span>
          </div>

          <div className="card-header">
            <h2 className="card-title">Calculate Your Incentive</h2>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Team Target (AED)</label>
              <input 
                type="number" 
                value={teamTarget}
                onChange={(e) => setTeamTarget(e.target.value)}
                placeholder="700000" 
                min="0" 
              />
            </div>
            <div className="form-group">
              <label>Team Sales (AED)</label>
              <input 
                type="number"
                value={teamSales}
                onChange={(e) => setTeamSales(e.target.value)}
                placeholder="735000" 
                min="0" 
              />
            </div>
            <div className="form-group">
              <label>My Sales (AED)</label>
              <input 
                type="number"
                value={mySales}
                onChange={(e) => setMySales(e.target.value)}
                placeholder="73500" 
                min="0" 
              />
            </div>
            <div className="form-group">
              <label>Staff Count</label>
              <input 
                type="number"
                value={staffCount}
                onChange={(e) => setStaffCount(e.target.value)}
                placeholder="29" 
                min="1"
              />
            </div>
          </div>

          <div className="slider-section">
            <div className="slider-header">
              <span className="slider-label">Pool Split Distribution</span>
              <div className="slider-values">
                <span className="slider-badge slider-badge-p1">P1: {p1Split}%</span>
                <span className="slider-badge slider-badge-p2">P2: {100 - p1Split}%</span>
              </div>
            </div>
            <input 
              type="range" 
              min="10" 
              max="90" 
              value={p1Split}
              step="5" 
              onChange={(e) => updateSlider(Number(e.target.value))}
            />
            <div className="slider-ticks">
              <span>10/90</span>
              <span>30/70</span>
              <span>50/50</span>
              <span>70/30</span>
              <span>90/10</span>
            </div>
          </div>

          <button className="btn btn-primary btn-block" onClick={calculate}>
            <span>Calculate Incentive</span>
            <span>→</span>
          </button>

          {results && !results.error && (
            <div className="results-panel">
              <div className="results-header">
                <span>💰</span>
                <span>Your Incentive Breakdown</span>
              </div>
              
              <div className="results-grid">
                <div className="result-card">
                  <div className="result-label">Team Achievement</div>
                  <div className="result-value">{results.teamAchievement.toFixed(2)}<span className="result-unit">%</span></div>
                </div>
                
                <div className="result-card">
                  <div className="result-label">Tier</div>
                  <div className="result-value" style={{fontSize: '20px'}}>{results.tier.name}</div>
                  <div className="tier-badge" style={{
                    background: `${results.tier.color}22`,
                    color: results.tier.color
                  }}>{results.tier.rate}% rate</div>
                </div>
                
                <div className="result-card">
                  <div className="result-label">Total Pool</div>
                  <div className="result-value" style={{fontSize: '20px'}}>AED {formatCurrency(results.totalPool)}</div>
                </div>
                
                <div className="result-card">
                  <div className="result-label">My Contribution</div>
                  <div className="result-value">{results.myContribution.toFixed(2)}<span className="result-unit">%</span></div>
                </div>
              </div>
              
              {results.tier.rate > 0 && (
                <>
                  <div className="breakdown-section">
                    <div className="breakdown-row">
                      <span className="breakdown-label" style={{color: '#42a5f5'}}>P1 (Equal Share)</span>
                      <span className="breakdown-value">AED {formatCurrency(results.myP1)}</span>
                    </div>
                    
                    <div className="breakdown-row">
                      <span className="breakdown-label" style={{color: '#ffa726'}}>P2 (Personal Share)</span>
                      <span className="breakdown-value">AED {formatCurrency(results.myP2)}</span>
                    </div>
                    
                    <div className="breakdown-row total-row">
                      <span className="breakdown-label">TOTAL INCENTIVE</span>
                      <span className="breakdown-value">AED {formatCurrency(results.myTotal)}</span>
                    </div>
                  </div>
                  
                  <div style={{marginTop: '16px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace"}}>
                    P1 Pool: {formatCurrency(results.p1Pool)} ÷ {staffCount} staff | P2 Pool: {formatCurrency(results.p2Pool)} × {results.myContribution.toFixed(2)}%
                  </div>
                </>
              )}
            </div>
          )}

          {results && results.error && (
            <div className="alert alert-error" style={{marginTop: '24px'}}>{results.error}</div>
          )}
        </section>
      )}

      {/* OTHER TABS - Placeholder */}
      {activeTab === 'bulk' && (
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Bulk Processing</h2>
            <p className="card-description">Upload Excel file to calculate for entire team</p>
          </div>
          <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-muted)'}}>
            <p>Bulk mode coming soon...</p>
            <p style={{marginTop: '8px', fontSize: '14px'}}>Upload your Excel file to process multiple staff members at once</p>
          </div>
        </section>
      )}

      {activeTab === 'analytics' && (
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Performance Analytics</h2>
            <p className="card-description">Track your progress and achievements</p>
          </div>
          <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-muted)'}}>
            <p>Analytics coming soon...</p>
            <p style={{marginTop: '8px', fontSize: '14px'}}>View trends, milestones, and performance data</p>
          </div>
        </section>
      )}

      {activeTab === 'settings' && (
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">Settings</h2>
            <p className="card-description">Configure tiers and preferences</p>
          </div>
          <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-muted)'}}>
            <p>Settings coming soon...</p>
            <p style={{marginTop: '8px', fontSize: '14px'}}>Customize tier rates and thresholds</p>
          </div>
        </section>
      )}

      {activeTab === 'about' && (
        <section className="card">
          <div className="card-header">
            <h2 className="card-title">About</h2>
          </div>
          <div style={{padding: '20px'}}>
            <h3 style={{color: 'var(--accent-primary)', marginBottom: '12px'}}>Smart Incentive Calculator v5.1</h3>
            <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
              A comprehensive tool for calculating sales incentives based on team performance and achievement tiers.
            </p>
            
            <h4 style={{color: 'var(--text-primary)', marginBottom: '8px', marginTop: '20px'}}>Features:</h4>
            <ul style={{color: 'var(--text-secondary)', lineHeight: '1.8'}}>
              <li>Individual incentive calculation</li>
              <li>Bulk team processing</li>
              <li>Performance analytics and tracking</li>
              <li>Customizable tier system</li>
              <li>100% private - all data stays in your browser</li>
            </ul>

            <div style={{marginTop: '24px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)'}}>
              <p style={{fontSize: '12px', color: 'var(--text-muted)'}}>
                © 2026 HT - Licensed for general use, Smart Salem prohibited from deployment<br/>
                All calculations performed locally in your browser
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
