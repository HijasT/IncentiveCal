'use client'
import { useState, useEffect } from 'react'
import {
  getTeamHistory,
  getPersonalHistory,
  getLifetimeStats,
  getRankHistory,
  getCurrentMonthData,
  getAvailableNames,
  getSelectedName,
  setSelectedName,
  getPersonBadges,
  checkAndAwardBadges,
  getBadgeInfo
} from '@/lib/analyticsUtils'
import { formatCurrency } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { exportAnalyticsToPDF } from '@/lib/pdfUtils'

export function AnalyticsTab() {
  const [selectedPersonName, setSelectedPersonName] = useState<string | null>(null)
  const [availableNames, setAvailableNames] = useState<string[]>([])
  const [personalHistory, setPersonalHistory] = useState<any[]>([])
  const [lifetimeStats, setLifetimeStats] = useState<any>(null)
  const [rankHistory, setRankHistory] = useState<any[]>([])
  const [currentMonth, setCurrentMonth] = useState<any>(null)
  const [badges, setBadges] = useState<string[]>([])
  const [teamHistory, setTeamHistory] = useState<any[]>([])
  const [newBadges, setNewBadges] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedPersonName) {
      loadPersonalData(selectedPersonName)
      setSelectedName(selectedPersonName)
    }
  }, [selectedPersonName])

  const loadData = () => {
    const names = getAvailableNames()
    setAvailableNames(names)
    setTeamHistory(getTeamHistory())
    
    const savedName = getSelectedName()
    if (savedName && names.includes(savedName)) {
      setSelectedPersonName(savedName)
    }
  }

  const loadPersonalData = (name: string) => {
    const history = getPersonalHistory(name)
    setPersonalHistory(history)
    setLifetimeStats(getLifetimeStats(name))
    setRankHistory(getRankHistory(name))
    setCurrentMonth(getCurrentMonthData(name))
    setBadges(getPersonBadges(name))
    
    // Check for new badges
    if (history.length > 0) {
      const latestMonth = history[history.length - 1]
      const newlyAwarded = checkAndAwardBadges(name, latestMonth)
      if (newlyAwarded.length > 0) {
        setNewBadges(newlyAwarded)
        setBadges(getPersonBadges(name))
      }
    }
  }

  const handleNameChange = (name: string) => {
    if (name === '') {
      setSelectedPersonName(null)
      setPersonalHistory([])
      setLifetimeStats(null)
      setRankHistory([])
      setCurrentMonth(null)
      setBadges([])
    } else {
      setSelectedPersonName(name)
    }
  }

  if (teamHistory.length === 0) {
    return (
      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Performance Analytics</h2>
          <div className="card-description">
            Track your progress, spot trends, and unlock achievements based on your performance history.
          </div>
        </div>

        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          border: '2px dashed var(--border-color)'
        }}>
          <div style={{fontSize: '48px', marginBottom: '16px'}}>📊</div>
          <h3 style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px'}}>
            No Data Yet
          </h3>
          <p style={{color: 'var(--text-muted)', marginBottom: '24px'}}>
            Calculate team incentives in Bulk mode (Monthly view) to start tracking performance history.
          </p>
          <div style={{
            display: 'inline-block',
            padding: '8px 16px',
            background: 'var(--accent-primary)',
            color: 'white',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            → Go to Bulk tab to get started
          </div>
        </div>
      </section>
    )
  }

  const getProjections = () => {
    if (!currentMonth) return null

    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysPassed = now.getDate()
    const daysLeft = daysInMonth - daysPassed

    const dailyAvg = currentMonth.sales / daysPassed
    const projectedSales = dailyAvg * daysInMonth
    const projectedAchievement = (projectedSales / teamHistory[teamHistory.length - 1].teamTarget) * 100

    let projectedTier = 'Below Target'
    let projectedRate = 0
    if (projectedAchievement >= 111) {
      projectedTier = 'Tier 4'
      projectedRate = 3.5
    } else if (projectedAchievement >= 101) {
      projectedTier = 'Tier 3'
      projectedRate = 3.0
    } else if (projectedAchievement >= 85) {
      projectedTier = 'Tier 2'
      projectedRate = 2.5
    } else if (projectedAchievement >= 75) {
      projectedTier = 'Tier 1'
      projectedRate = 1.5
    }

    return {
      dailyAvg,
      projectedSales,
      projectedAchievement,
      projectedTier,
      projectedRate,
      daysLeft
    }
  }

  const projections = getProjections()
  const chartData = personalHistory.slice(-6).map(m => ({
    month: m.monthKey.substring(5),
    achievement: m.achievement,
    earnings: m.totalEarnings / 1000
  }))

  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Performance Analytics</h2>
        <div className="card-description">
          Track your progress, spot trends, and unlock achievements.
        </div>
      </div>

      {/* Name Selector */}
      <div style={{marginBottom: '24px'}}>
        <label style={{display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px'}}>
          Select Your Name (Optional)
        </label>
        <select 
          value={selectedPersonName || ''}
          onChange={(e) => handleNameChange(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px',
            fontSize: '14px',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          <option value="">View Team Overview</option>
          {availableNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <p style={{fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px'}}>
          {selectedPersonName 
            ? `Viewing personal analytics for ${selectedPersonName}` 
            : 'Select your name to see personalized analytics and badges'}
        </p>
      </div>

      {/* Team Overview (when no name selected) */}
      {!selectedPersonName && (
        <div>
          <h3 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px'}}>
            📊 Team Overview
          </h3>
          <div style={{padding: '24px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
            <div style={{marginBottom: '20px'}}>
              <div style={{fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px'}}>Months Tracked</div>
              <div style={{fontSize: '28px', fontWeight: '700', color: 'var(--accent-primary)', fontFamily: "'JetBrains Mono', monospace"}}>
                {teamHistory.length}
              </div>
            </div>
            <div style={{marginBottom: '16px'}}>
              <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px'}}>Recent Months</div>
              {teamHistory.slice(-6).map(month => (
                <div key={month.monthKey} style={{
                  padding: '12px',
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}}>
                    <span style={{fontWeight: '600', color: 'var(--text-primary)'}}>{month.monthKey}</span>
                    <span style={{fontSize: '13px', color: 'var(--text-muted)'}}>{month.totalStaff} staff</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{fontSize: '13px', color: 'var(--text-secondary)'}}>
                      {month.teamAchievement.toFixed(1)}% • {month.tier}
                    </span>
                    <span style={{fontSize: '13px', fontWeight: '600', color: 'var(--success)'}}>
                      AED {formatCurrency(month.totalPool)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              padding: '12px',
              background: 'rgba(0, 206, 209, 0.08)',
              border: '1px solid rgba(0, 206, 209, 0.2)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              color: 'var(--text-secondary)'
            }}>
              💡 <strong>Select your name above</strong> to see personalized analytics, performance trends, and unlock achievement badges!
            </div>
          </div>
        </div>
      )}

      {/* Personal Analytics (when name selected) */}
      {selectedPersonName && personalHistory.length > 0 && (
        <div>
          {currentMonth && projections && (
            <div style={{padding: '24px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '32px', border: '2px solid var(--border-color)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                <span style={{fontSize: '24px'}}>⏱️</span>
                <div>
                  <h3 style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px'}}>
                    {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} - Current Month
                  </h3>
                  <p style={{fontSize: '13px', color: 'var(--text-muted)'}}>Live progress tracking</p>
                </div>
              </div>

              <div style={{marginBottom: '20px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                  <span style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)'}}>
                    Achievement: {currentMonth.achievement.toFixed(1)}%
                  </span>
                  <span style={{fontSize: '14px', color: 'var(--text-muted)'}}>
                    Projected: {projections.projectedAchievement.toFixed(1)}%
                  </span>
                </div>
                <div style={{height: '12px', background: 'var(--bg-secondary)', borderRadius: '6px', overflow: 'hidden', position: 'relative'}}>
                  <div style={{
                    width: `${Math.min(currentMonth.achievement, 100)}%`,
                    height: '100%',
                    background: currentMonth.achievement >= 85 ? 'var(--success)' : currentMonth.achievement >= 75 ? 'var(--warning)' : 'var(--error)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px'}}>
                <div style={{padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)'}}>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Your Rank</div>
                  <div style={{fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)'}}>#{currentMonth.rank}</div>
                  <div style={{fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px'}}>of {currentMonth.totalStaff}</div>
                </div>
                
                <div style={{padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)'}}>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Projected Tier</div>
                  <div style={{fontSize: '20px', fontWeight: '700', color: 'var(--accent-primary)'}}>{projections.projectedTier}</div>
                  <div style={{fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px'}}>{projections.projectedRate}% rate</div>
                </div>

                <div style={{padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)'}}>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Days Left</div>
                  <div style={{fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)'}}>{projections.daysLeft}</div>
                  <div style={{fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px'}}>AED {formatCurrency(projections.dailyAvg)}/day avg</div>
                </div>
              </div>

              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: projections.projectedAchievement >= 85 ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 193, 7, 0.08)',
                border: `1px solid ${projections.projectedAchievement >= 85 ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 193, 7, 0.3)'}`,
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                color: 'var(--text-secondary)'
              }}>
                {projections.projectedAchievement >= 85 ? '🟢' : '🟡'} <strong>Status:</strong> {projections.projectedAchievement >= 85 ? 'On track!' : 'Need to accelerate'} — 
                Projected {projections.projectedTier} with AED {formatCurrency(projections.projectedSales)} sales
              </div>
            </div>
          )}

          <div style={{marginBottom: '32px'}}>
            <h3 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px'}}>
              📈 6-Month Performance Trend
            </h3>
            <div style={{padding: '24px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" style={{fontSize: '12px'}} />
                  <YAxis stroke="var(--text-muted)" style={{fontSize: '12px'}} />
                  <Tooltip 
                    contentStyle={{background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px'}}
                    formatter={(value: any) => [`${value.toFixed(1)}%`, 'Achievement']}
                  />
                  <Line type="monotone" dataKey="achievement" stroke="var(--accent-primary)" strokeWidth={3} dot={{ fill: 'var(--accent-primary)', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px'}}>
            {lifetimeStats && (
              <div style={{padding: '24px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                <h3 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span>🏆</span> Career Highlights
                </h3>
                
                <div style={{marginBottom: '20px'}}>
                  <div style={{fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px'}}>Total Earned</div>
                  <div style={{fontSize: '28px', fontWeight: '700', color: 'var(--success)', fontFamily: "'JetBrains Mono', monospace"}}>
                    AED {formatCurrency(lifetimeStats.totalEarnings)}
                  </div>
                </div>

                <div style={{display: 'grid', gap: '12px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)'}}>
                    <span style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Months Tracked</span>
                    <span style={{fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)'}}>{lifetimeStats.monthsTracked}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)'}}>
                    <span style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Avg per Month</span>
                    <span style={{fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)'}}>AED {formatCurrency(lifetimeStats.avgEarnings)}</span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)'}}>
                    <span style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Best Month</span>
                    <span style={{fontSize: '13px', fontWeight: '600', color: 'var(--success)'}}>
                      {lifetimeStats.bestMonth.achievement.toFixed(1)}% • {lifetimeStats.bestMonth.monthKey}
                    </span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)'}}>
                    <span style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Current Streak</span>
                    <span style={{fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)'}}>
                      {lifetimeStats.currentStreak > 0 ? `🔥 ${lifetimeStats.currentStreak} months` : 'None'}
                    </span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0'}}>
                    <span style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Longest Streak</span>
                    <span style={{fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)'}}>
                      {lifetimeStats.longestStreak > 0 ? `${lifetimeStats.longestStreak} months` : 'None'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {rankHistory.length > 0 && (
              <div style={{padding: '24px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                <h3 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <span>📊</span> Rank History
                </h3>

                <div style={{marginBottom: '20px'}}>
                  <div style={{fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px'}}>Current Rank</div>
                  <div style={{fontSize: '28px', fontWeight: '700', color: 'var(--accent-primary)', fontFamily: "'JetBrains Mono', monospace"}}>
                    #{rankHistory[rankHistory.length - 1].rank} <span style={{fontSize: '16px', color: 'var(--text-muted)'}}>of {rankHistory[rankHistory.length - 1].totalStaff}</span>
                  </div>
                  <div style={{fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px'}}>
                    Top {rankHistory[rankHistory.length - 1].percentile.toFixed(0)}%
                  </div>
                </div>

                <div style={{display: 'grid', gap: '12px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)'}}>
                    <span style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Best Rank</span>
                    <span style={{fontSize: '13px', fontWeight: '600', color: 'var(--success)'}}>
                      #{Math.min(...rankHistory.map(r => r.rank))}
                    </span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)'}}>
                    <span style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Average Rank</span>
                    <span style={{fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)'}}>
                      #{Math.round(rankHistory.reduce((sum, r) => sum + r.rank, 0) / rankHistory.length)}
                    </span>
                  </div>
                </div>

                <div style={{marginTop: '16px'}}>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px'}}>Recent Months</div>
                  <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap'}}>
                    {rankHistory.slice(-6).map(r => (
                      <div key={r.month} style={{
                        padding: '4px 8px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        fontFamily: "'JetBrains Mono', monospace"
                      }}>
                        {r.month.substring(5)}: #{r.rank}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {badges.length > 0 && (
            <div style={{marginBottom: '32px'}}>
              <h3 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px'}}>
                🎖️ Achievement Badges ({badges.length} unlocked)
              </h3>
              <div style={{padding: '24px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px'}}>
                  {badges.map(badgeId => {
                    const badge = getBadgeInfo(badgeId)
                    return (
                      <div key={badgeId} style={{
                        padding: '16px',
                        background: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-sm)',
                        border: '2px solid var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span style={{fontSize: '32px'}}>{badge.icon}</span>
                        <div>
                          <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)'}}>{badge.name}</div>
                          <div style={{fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px'}}>{badge.description}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Data Management */}
      <div style={{
        padding: '16px',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)'}}>Analytics Data</div>
          <div style={{fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px'}}>
            Tracking {teamHistory.length} months • Stored locally in your browser
          </div>
        </div>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          {selectedPersonName && personalHistory.length > 0 && (
            <button 
              className="btn btn-secondary"
              onClick={() => exportAnalyticsToPDF(personalHistory, lifetimeStats, rankHistory)}
            >
              📕 Export PDF
            </button>
          )}
          <button 
            className="btn btn-secondary"
            onClick={() => {
              if (confirm('Clear all analytics data? This cannot be undone.')) {
                localStorage.removeItem('smart_incentive_analytics')
                window.location.reload()
              }
            }}
          >
            Clear Data
          </button>
        </div>
      </div>

      {/* New Badges Notification */}
      {newBadges.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'var(--bg-primary)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          border: '2px solid var(--success)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          maxWidth: '300px'
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px'}}>
            <h4 style={{fontSize: '16px', fontWeight: '600', color: 'var(--success)'}}>
              🎉 New Achievement{newBadges.length > 1 ? 's' : ''}!
            </h4>
            <button
              onClick={() => setNewBadges([])}
              style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-muted)'}}
            >
              ×
            </button>
          </div>
          <div style={{fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px'}}>
            You've unlocked {newBadges.length} new badge{newBadges.length > 1 ? 's' : ''}!
          </div>
          <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>
            {newBadges.map(b => getBadgeInfo(b).name).join(', ')}
          </div>
        </div>
      )}
    </section>
  )
}
