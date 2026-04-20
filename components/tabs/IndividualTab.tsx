'use client'
import { useState } from 'react'
import { calculateIncentive, formatCurrency, type CalculationResult } from '@/lib/utils'

export function IndividualTab() {
  const [teamTarget, setTeamTarget] = useState('')
  const [teamSales, setTeamSales] = useState('')
  const [mySales, setMySales] = useState('')
  const [staffCount, setStaffCount] = useState('29')
  const [p1Split, setP1Split] = useState(60)
  const [results, setResults] = useState<CalculationResult | null>(null)

  const calculate = () => {
    const target = parseFloat(teamTarget)
    const sales = parseFloat(teamSales)
    const my = parseFloat(mySales) || 0
    const staff = parseInt(staffCount)
    
    const result = calculateIncentive(target, sales, my, staff, p1Split)
    setResults(result)
  }

  return (
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
          onChange={(e) => setP1Split(Number(e.target.value))}
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

          {results.nextTierInfo && (
            <div className="reverse-calc" style={results.nextTierInfo.isMaxTier ? {
              borderColor: 'rgba(0, 230, 118, 0.3)',
              background: 'rgba(0, 230, 118, 0.08)'
            } : {}}>
              <div className="reverse-calc-title" style={results.nextTierInfo.isMaxTier ? {color: 'var(--success)'} : {}}>
                <span>{results.nextTierInfo.isMaxTier ? '🎉' : '🎯'}</span>
                <span>Tier Ladder</span>
              </div>
              {results.nextTierInfo.isMaxTier ? (
                <>
                  <div className="reverse-calc-value" style={{color: 'var(--success)'}}>
                    + AED {formatCurrency(results.nextTierInfo.extraIncentive)}
                  </div>
                  <div className="reverse-calc-details">
                    Maximum tier achieved! Your team is at <strong>{results.teamAchievement.toFixed(2)}%</strong> achievement, earning an additional <strong>AED {formatCurrency(results.nextTierInfo.extraIncentive)}</strong> compared to the {results.nextTierInfo.thresholdPercentage}% threshold.
                  </div>
                </>
              ) : (
                <>
                  <div className="reverse-calc-value">AED {formatCurrency(results.nextTierInfo.deficit)}</div>
                  <div className="reverse-calc-details">
                    Team needs an additional <strong>AED {formatCurrency(results.nextTierInfo.deficit)}</strong> in sales to reach <strong>AED {formatCurrency(results.nextTierInfo.requiredSales)}</strong> ({results.nextTierInfo.requiredPercentage}% of target) and qualify for {results.nextTierInfo.nextTierName} incentive ({results.nextTierInfo.nextTierRate}% rate).
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {results && results.error && (
        <div className="alert alert-error" style={{marginTop: '24px'}}>{results.error}</div>
      )}
    </section>
  )
}
