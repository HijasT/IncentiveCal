'use client'
import { useState } from 'react'
import { parseExcelFile, type ExcelData } from '@/lib/excelUtils'
import { formatCurrency } from '@/lib/utils'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type SubTab = 'overview' | 'individual' | 'team' | 'leaderboards' | 'achievements' | 'insights'
type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly'

const COLORS = ['#667eea', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

interface PersonData {
  name: string
  sales: number
  packages: number
  workingDays: number
}

export function AnalyticsTab() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('overview')
  const [personData, setPersonData] = useState<PersonData[]>([])
  const [selectedPerson, setSelectedPerson] = useState<string>('')
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('weekly')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await parseExcelFile(file)
      const allPeople = new Map<string, PersonData>()
      
      data.forEach(sheet => {
        sheet.staff.forEach(person => {
          if (allPeople.has(person.name)) {
            const existing = allPeople.get(person.name)!
            existing.sales += person.sales
            existing.packages += person.packages
            existing.workingDays += person.workingDays
          } else {
            allPeople.set(person.name, {
              name: person.name,
              sales: person.sales,
              packages: person.packages,
              workingDays: person.workingDays
            })
          }
        })
      })
      
      const people = Array.from(allPeople.values()).sort((a, b) => b.sales - a.sales)
      setPersonData(people)
      if (people.length > 0) setSelectedPerson(people[0].name)
    } catch (error) {
      alert('Error processing Excel file')
    }
  }

  const teamTotal = personData.reduce((sum, p) => sum + p.sales, 0)
  const teamPackages = personData.reduce((sum, p) => sum + p.packages, 0)
  const avgDaily = teamTotal / Math.max(personData.reduce((sum, p) => sum + p.workingDays, 0), 1)
  const selected = personData.find(p => p.name === selectedPerson)

  const topPerformers = personData.slice(0, 10).map(p => ({ name: p.name.split(' ')[0], sales: p.sales }))
  const contributionData = personData.slice(0, 5).map((p, i) => ({ name: p.name.split(' ')[0], value: (p.sales / teamTotal) * 100, color: COLORS[i] }))

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { emoji: '🥇', color: '#ffd700' }
    if (rank === 2) return { emoji: '🥈', color: '#c0c0c0' }
    if (rank === 3) return { emoji: '🥉', color: '#cd7f32' }
    return { emoji: `#${rank}`, color: '#9ca3af' }
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">📊 Advanced Analytics Dashboard</h2>
        <div className="card-description">Comprehensive performance tracking with insights and leaderboards</div>
      </div>

      <div style={{marginBottom: '24px', padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
        <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '12px'}}>📂 Upload Excel</h3>
        <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
      </div>

      {personData.length > 0 ? (
        <div>
          <div style={{display: 'flex', gap: '4px', marginBottom: '24px', overflowX: 'auto', borderBottom: '2px solid var(--border-color)'}}>
            {[
              { id: 'overview', label: '🏠 Overview' },
              { id: 'individual', label: '👤 Individual' },
              { id: 'team', label: '👥 Team' },
              { id: 'leaderboards', label: '🏆 Leaderboards' },
              { id: 'achievements', label: '🎖️ Achievements' },
              { id: 'insights', label: '💡 Insights' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SubTab)}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  background: activeSubTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                  color: activeSubTab === tab.id ? 'white' : 'var(--text-primary)',
                  borderBottom: activeSubTab === tab.id ? '3px solid var(--accent-primary)' : '3px solid transparent',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeSubTab === 'overview' ? (
            <div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px'}}>
                <div style={{padding: '20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 'var(--radius-md)', color: 'white'}}>
                  <div style={{fontSize: '12px', opacity: 0.9, marginBottom: '8px'}}>TOTAL SALES</div>
                  <div style={{fontSize: '28px', fontWeight: '700'}}>{formatCurrency(teamTotal)}</div>
                </div>
                <div style={{padding: '20px', background: 'linear-gradient(135deg, #f093fb, #f5576c)', borderRadius: 'var(--radius-md)', color: 'white'}}>
                  <div style={{fontSize: '12px', opacity: 0.9, marginBottom: '8px'}}>TOTAL PACKAGES</div>
                  <div style={{fontSize: '28px', fontWeight: '700'}}>{teamPackages}</div>
                </div>
                <div style={{padding: '20px', background: 'linear-gradient(135deg, #4facfe, #00f2fe)', borderRadius: 'var(--radius-md)', color: 'white'}}>
                  <div style={{fontSize: '12px', opacity: 0.9, marginBottom: '8px'}}>DAILY AVERAGE</div>
                  <div style={{fontSize: '28px', fontWeight: '700'}}>{formatCurrency(avgDaily)}</div>
                </div>
                <div style={{padding: '20px', background: 'linear-gradient(135deg, #43e97b, #38f9d7)', borderRadius: 'var(--radius-md)', color: 'white'}}>
                  <div style={{fontSize: '12px', opacity: 0.9, marginBottom: '8px'}}>TEAM SIZE</div>
                  <div style={{fontSize: '28px', fontWeight: '700'}}>{personData.length}</div>
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px'}}>
                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                  <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '16px'}}>📈 Top 10 Performers</h3>
                  <div style={{height: '280px'}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topPerformers}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sales" fill="#667eea" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                  <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '16px'}}>👥 Team Contribution</h3>
                  <div style={{height: '280px'}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={contributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e) => `${e.name}: ${e.value.toFixed(1)}%`}>
                          {contributionData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeSubTab === 'individual' && selected ? (
            <div>
              <div style={{marginBottom: '24px'}}>
                <label style={{fontWeight: '600', marginRight: '12px'}}>Select Person:</label>
                <select value={selectedPerson} onChange={(e) => setSelectedPerson(e.target.value)} style={{padding: '10px', borderRadius: '8px', border: '2px solid var(--border-color)'}}>
                  {personData.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)'}}>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px'}}>Total Sales</div>
                  <div style={{fontSize: '24px', fontWeight: '700', color: 'var(--success)'}}>{formatCurrency(selected.sales)}</div>
                </div>
                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)'}}>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px'}}>Packages</div>
                  <div style={{fontSize: '24px', fontWeight: '700', color: 'var(--accent-primary)'}}>{selected.packages}</div>
                </div>
                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)'}}>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px'}}>Working Days</div>
                  <div style={{fontSize: '24px', fontWeight: '700'}}>{selected.workingDays}</div>
                </div>
                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)'}}>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px'}}>Rank</div>
                  <div style={{fontSize: '24px', fontWeight: '700'}}>#{personData.findIndex(p => p.name === selectedPerson) + 1}</div>
                </div>
              </div>
            </div>
          ) : null}

          {activeSubTab === 'team' ? (
            <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
              <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '16px'}}>📊 Team Performance</h3>
              <div style={{height: '320px'}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={personData.slice(0, 10).map(p => ({name: p.name.split(' ')[0], sales: p.sales, packages: p.packages}))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#667eea" name="Sales" />
                    <Bar dataKey="packages" fill="#10b981" name="Packages" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : null}

          {activeSubTab === 'leaderboards' ? (
            <div>
              <div style={{display: 'flex', gap: '8px', marginBottom: '24px'}}>
                {(['daily', 'weekly', 'monthly'] as LeaderboardPeriod[]).map(period => (
                  <button key={period} onClick={() => setLeaderboardPeriod(period)} style={{padding: '10px 20px', fontSize: '14px', fontWeight: '600', background: leaderboardPeriod === period ? 'var(--accent-primary)' : 'var(--bg-tertiary)', color: leaderboardPeriod === period ? 'white' : 'var(--text-primary)', border: '2px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer'}}>
                    {period === 'daily' ? '📅 Daily' : period === 'weekly' ? '📊 Weekly' : '📈 Monthly'}
                  </button>
                ))}
              </div>

              <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '16px'}}>
                  {leaderboardPeriod === 'daily' ? '📅 Top Performers (Daily)' : leaderboardPeriod === 'weekly' ? '📊 Top Performers (Weekly)' : '📈 Top Performers (Monthly)'}
                </h3>

                <div style={{display: 'grid', gap: '12px'}}>
                  {personData.slice(0, 10).map((person, idx) => {
                    const rank = idx + 1
                    const badge = getRankBadge(rank)
                    return (
                      <div key={person.name} style={{display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', border: rank <= 3 ? `2px solid ${badge.color}44` : '1px solid var(--border-color)'}}>
                        <div style={{width: '44px', height: '44px', borderRadius: '50%', background: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: rank <= 3 ? 'white' : '#6b7280'}}>{badge.emoji}</div>
                        <div style={{flex: 1}}>
                          <div style={{fontWeight: '600', marginBottom: '4px'}}>{person.name}</div>
                          <div style={{fontSize: '13px', color: 'var(--text-muted)'}}>{person.packages} packages • {person.workingDays} days</div>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <div style={{fontSize: '20px', fontWeight: '700', color: 'var(--success)'}}>{formatCurrency(person.sales)}</div>
                          <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>{((person.sales / teamTotal) * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {activeSubTab === 'achievements' ? (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px'}}>
              {[
                { icon: '🌟', name: 'Top Performer', desc: '#1 ranked', unlocked: true },
                { icon: '🔥', name: 'Hot Streak', desc: '5+ days active', unlocked: true },
                { icon: '💯', name: 'Consistent', desc: 'Stable performance', unlocked: false },
                { icon: '📈', name: 'Rising Star', desc: 'Top 3 ranking', unlocked: true },
                { icon: '🚀', name: 'Overachiever', desc: 'Above average', unlocked: true },
                { icon: '👑', name: 'Champion', desc: 'Monthly winner', unlocked: false }
              ].map(ach => (
                <div key={ach.name} style={{padding: '24px', background: ach.unlocked ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'var(--bg-tertiary)', border: ach.unlocked ? '2px solid #fbbf24' : '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', opacity: ach.unlocked ? 1 : 0.6}}>
                  <div style={{fontSize: '48px', marginBottom: '12px'}}>{ach.icon}</div>
                  <div style={{fontWeight: '700', marginBottom: '8px'}}>{ach.name}</div>
                  <div style={{fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px'}}>{ach.desc}</div>
                  <div style={{fontSize: '13px', fontWeight: '700', color: ach.unlocked ? '#166534' : '#6b7280'}}>{ach.unlocked ? '✓ Unlocked' : '🔒 Locked'}</div>
                </div>
              ))}
            </div>
          ) : null}

          {activeSubTab === 'insights' ? (
            <div style={{display: 'grid', gap: '16px'}}>
              <div style={{padding: '20px', background: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: '8px'}}>
                <div style={{fontSize: '24px', marginBottom: '12px'}}>💡</div>
                <div style={{fontWeight: '600', color: '#1e40af', marginBottom: '8px'}}>Top Performer</div>
                <div style={{color: '#1e40af', fontSize: '14px'}}>{personData[0]?.name} leads with {formatCurrency(personData[0]?.sales)} in sales</div>
              </div>
              <div style={{padding: '20px', background: '#dcfce7', borderLeft: '4px solid #10b981', borderRadius: '8px'}}>
                <div style={{fontSize: '24px', marginBottom: '12px'}}>✨</div>
                <div style={{fontWeight: '600', color: '#166534', marginBottom: '8px'}}>Team Strength</div>
                <div style={{color: '#166534', fontSize: '14px'}}>Team average of {formatCurrency(avgDaily)} per day shows strong performance</div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div style={{padding: '64px', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '2px dashed var(--border-color)'}}>
          <div style={{fontSize: '64px', marginBottom: '20px'}}>📊</div>
          <h3 style={{fontSize: '20px', fontWeight: '700', marginBottom: '12px'}}>Advanced Analytics Dashboard</h3>
          <p style={{color: 'var(--text-muted)'}}>Upload Excel to unlock comprehensive analytics</p>
        </div>
      )}
    </section>
  )
}
