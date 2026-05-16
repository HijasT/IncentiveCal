'use client'
import { useState, useEffect, useMemo } from 'react'
import { type ExcelData } from '@/lib/excelUtils'
import { formatCurrency } from '@/lib/utils'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type SubTab = 'overview' | 'individual' | 'leaderboards' | 'achievements' | 'insights'
type ViewMode = 'monthly' | 'q1' | 'q2' | 'q3' | 'q4' | 'h1' | 'h2' | 'yearly' | 'alltime'

const COLORS = ['#667eea', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4']

interface PersonData {
  name: string
  sales: number
  packages: number
  workingDays: number
  clients?: number
  rank?: number
  // Performance score components (v7.2.0 Percentile Formula)
  performanceScore?: number      // Overall: 0-100
  salesScore?: number            // 50% weight: Hybrid (rank 60% + volume 40%)
  productivityScore?: number     // 25% weight: Percentile-based daily sales
  efficiencyScore?: number       // 25% weight: Percentile-based sales per client
  // Rankings for percentile calculation
  productivityRank?: number      // Rank by daily sales
  efficiencyRank?: number        // Rank by sales per client
  // Legacy fields (for backwards compatibility)
  attendanceScore?: number
  consistency?: number
  streak?: number
}

interface AnalyticsDashboardViewProps {
  excelData: ExcelData[]
  viewMode: ViewMode
  selectedMonth: string
  selectedYear: string
}

export function AnalyticsDashboardView({ excelData, viewMode, selectedMonth, selectedYear }: AnalyticsDashboardViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('overview')
  const [personData, setPersonData] = useState<PersonData[]>([])
  const [selectedPerson, setSelectedPerson] = useState<string>('')

  // Process excelData when it changes or when view selection changes
  useEffect(() => {
    if (excelData.length === 0) return

    // Filter sheets based on view mode (same logic as BulkResultsView)
    let sheetsToProcess: ExcelData[] = []
    
    if (viewMode === 'monthly') {
      const sheetName = `${selectedMonth} ${selectedYear}`.replace('  ', '')
      sheetsToProcess = excelData.filter(d => d.sheetName === sheetName || d.sheetName === `${selectedMonth}${selectedYear}`)
    } else if (viewMode === 'alltime') {
      sheetsToProcess = excelData
    } else if (viewMode === 'yearly') {
      sheetsToProcess = excelData.filter(d => d.sheetName.includes(selectedYear))
    } else {
      // Quarterly or half-yearly
      const quarters: Record<string, string[]> = {
        q1: ['Jan', 'Feb', 'Mar'],
        q2: ['Apr', 'May', 'Jun'],
        q3: ['Jul', 'Aug', 'Sep'],
        q4: ['Oct', 'Nov', 'Dec'],
        h1: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        h2: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      }
      const quarterMonths = quarters[viewMode]
      sheetsToProcess = excelData.filter(d => {
        const [monthName, year] = d.sheetName.split(' ')
        return quarterMonths.includes(monthName) && year === selectedYear
      })
    }

    if (sheetsToProcess.length === 0) {
      setPersonData([])
      return
    }

    const allPeople = new Map<string, PersonData>()
    
    sheetsToProcess.forEach(sheet => {
      sheet.staff.forEach(person => {
        if (allPeople.has(person.name)) {
          const existing = allPeople.get(person.name)!
          existing.sales += person.sales
          existing.packages += person.packages
          existing.workingDays += person.workingDays
          if (person.clients) {
            existing.clients = (existing.clients || 0) + person.clients
          }
        } else {
          allPeople.set(person.name, {
            name: person.name,
            sales: person.sales,
            packages: person.packages,
            workingDays: person.workingDays,
            clients: person.clients || 0
          })
        }
      })
    })
    
    const people = Array.from(allPeople.values()).sort((a, b) => b.sales - a.sales)
    
    // Calculate v7.2.0 percentile-based performance scores
    const totalPeople = people.length
    const topSellerSales = people.length > 0 ? people[0].sales : 1
    
    // Calculate daily sales and sales per client for everyone
    const peopleWithMetrics = people.map(p => ({
      ...p,
      dailySales: p.sales / Math.max(p.workingDays, 1),
      salesPerClient: (p.clients && p.clients > 0) ? p.sales / p.clients : 0
    }))
    
    // Rank by productivity (daily sales)
    const byProductivity = [...peopleWithMetrics].sort((a, b) => b.dailySales - a.dailySales)
    const productivityRanks = new Map<string, number>()
    byProductivity.forEach((p, idx) => productivityRanks.set(p.name, idx + 1))
    
    // Rank by efficiency (sales per client)
    const byEfficiency = [...peopleWithMetrics].filter(p => p.salesPerClient > 0).sort((a, b) => b.salesPerClient - a.salesPerClient)
    const efficiencyRanks = new Map<string, number>()
    byEfficiency.forEach((p, idx) => efficiencyRanks.set(p.name, idx + 1))
    
    // Assign scores to each person
    people.forEach((person, index) => {
      const rank = index + 1 // Sales rank
      person.rank = rank
      
      // 1. SALES PERFORMANCE (50% weight) - HYBRID
      // Rank component (60%)
      const rankScore = ((totalPeople - rank + 1) / totalPeople) * 100
      // Volume component (40%)
      const volumeScore = (person.sales / topSellerSales) * 100
      // Combined sales score
      const salesScore = (rankScore * 0.6) + (volumeScore * 0.4)
      
      // 2. PRODUCTIVITY (25% weight) - PERCENTILE-BASED
      const productivityRank = productivityRanks.get(person.name) || totalPeople
      const productivityScore = ((totalPeople - productivityRank + 1) / totalPeople) * 100
      person.productivityRank = productivityRank
      
      // 3. EFFICIENCY (25% weight) - PERCENTILE-BASED
      const efficiencyRank = efficiencyRanks.get(person.name) || totalPeople
      const efficiencyScore = efficiencyRank > 0 
        ? ((byEfficiency.length - efficiencyRank + 1) / byEfficiency.length) * 100
        : 50 // Default if no client data
      person.efficiencyRank = efficiencyRank
      
      // PERFORMANCE SCORE (v7.2.0)
      const performanceScore = (
        (salesScore * 0.50) +
        (productivityScore * 0.25) +
        (efficiencyScore * 0.25)
      )
      
      // Assign scores
      person.salesScore = Math.round(salesScore)
      person.productivityScore = Math.round(productivityScore)
      person.efficiencyScore = Math.round(efficiencyScore)
      person.performanceScore = Math.round(performanceScore)
      
      // Legacy fields for backwards compatibility
      const expectedWorkingDays = 22
      person.attendanceScore = Math.min((person.workingDays / expectedWorkingDays) * 100, 100)
      person.consistency = Math.round(person.attendanceScore)
      person.streak = person.rank <= 3 ? 10 - person.rank : Math.floor(Math.random() * 5) + 1
    })
    
    setPersonData(people)
    if (people.length > 0) setSelectedPerson(people[0].name)
  }, [excelData, viewMode, selectedMonth, selectedYear])

  const teamTotal = useMemo(() => personData.reduce((sum, p) => sum + p.sales, 0), [personData])
  const teamPackages = useMemo(() => personData.reduce((sum, p) => sum + p.packages, 0), [personData])
  const avgDaily = useMemo(() => teamTotal / Math.max(personData.reduce((sum, p) => sum + p.workingDays, 0), 1), [personData, teamTotal])
  const selected = useMemo(() => personData.find(p => p.name === selectedPerson), [personData, selectedPerson])

  const topPerformers = useMemo(() => 
    personData.slice(0, 10).map(p => ({ name: p.name.split(' ')[0], sales: p.sales })),
    [personData]
  )
  const contributionData = useMemo(() => 
    personData.slice(0, 5).map((p, i) => ({ name: p.name.split(' ')[0], value: (p.sales / teamTotal) * 100, color: COLORS[i] })),
    [personData, teamTotal]
  )

  // Alphabetically sorted list for dropdown
  const sortedPersonData = useMemo(() => 
    [...personData].sort((a, b) => a.name.localeCompare(b.name)),
    [personData]
  )

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { emoji: '🥇', color: '#ffd700' }
    if (rank === 2) return { emoji: '🥈', color: '#c0c0c0' }
    if (rank === 3) return { emoji: '🥉', color: '#cd7f32' }
    return { emoji: `#${rank}`, color: '#9ca3af' }
  }

  const getViewModeLabel = (mode: ViewMode): string => {
    const labels: Record<ViewMode, string> = {
      monthly: selectedMonth ? `${selectedMonth} 20${selectedYear}` : 'Monthly',
      q1: `Q1 20${selectedYear}`,
      q2: `Q2 20${selectedYear}`,
      q3: `Q3 20${selectedYear}`,
      q4: `Q4 20${selectedYear}`,
      h1: `H1 20${selectedYear}`,
      h2: `H2 20${selectedYear}`,
      yearly: `20${selectedYear}`,
      alltime: 'All-Time'
    }
    return labels[mode]
  }

  return (
    <>
      {personData.length > 0 ? (
        <div>
          <div style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '24px',
            overflowX: 'auto',
            padding: '6px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)'
          }}>
            {[
              { id: 'overview', label: '🏠 Overview & Team' },
              { id: 'individual', label: '👤 Individual' },
              { id: 'leaderboards', label: '🏆 Leaderboards' },
              { id: 'achievements', label: '🎖️ Achievements' },
              { id: 'insights', label: '💡 Insights' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SubTab)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  background: activeSubTab === tab.id ? 'var(--gradient-primary)' : 'transparent',
                  color: activeSubTab === tab.id ? 'white' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: activeSubTab === tab.id ? 'var(--shadow-md), var(--glow-turquoise)' : 'none'
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
                  <div style={{fontSize: '13px', opacity: 0.9}}>{getViewModeLabel(viewMode)}</div>
                </div>
                <div style={{padding: '20px', background: 'linear-gradient(135deg, #f093fb, #f5576c)', borderRadius: 'var(--radius-md)', color: 'white'}}>
                  <div style={{fontSize: '12px', opacity: 0.9, marginBottom: '8px'}}>TOTAL PACKAGES</div>
                  <div style={{fontSize: '28px', fontWeight: '700'}}>{teamPackages}</div>
                  <div style={{fontSize: '13px', opacity: 0.9}}>{getViewModeLabel(viewMode)}</div>
                </div>
                <div style={{padding: '20px', background: 'linear-gradient(135deg, #4facfe, #00f2fe)', borderRadius: 'var(--radius-md)', color: 'white'}}>
                  <div style={{fontSize: '12px', opacity: 0.9, marginBottom: '8px'}}>DAILY AVERAGE</div>
                  <div style={{fontSize: '28px', fontWeight: '700'}}>{formatCurrency(avgDaily)}</div>
                  <div style={{fontSize: '13px', opacity: 0.9}}>Per working day</div>
                </div>
                <div style={{padding: '20px', background: 'linear-gradient(135deg, #43e97b, #38f9d7)', borderRadius: 'var(--radius-md)', color: 'white'}}>
                  <div style={{fontSize: '12px', opacity: 0.9, marginBottom: '8px'}}>TEAM SIZE</div>
                  <div style={{fontSize: '28px', fontWeight: '700'}}>{personData.length}</div>
                  <div style={{fontSize: '13px', opacity: 0.9}}>Active members</div>
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

              <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '16px'}}>📊 Team Performance Comparison</h3>
                <div style={{height: '320px'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={personData.slice(0, 10).map(p => ({name: p.name.split(' ')[0], sales: p.sales, packages: p.packages}))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sales" fill="#667eea" name="Sales" />
                      <Bar dataKey="packages" fill="#10b981" name="Packages" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : null}

          {activeSubTab === 'individual' && selected ? (
            <div>
              <div style={{marginBottom: '24px'}}>
                <label style={{fontWeight: '600', marginRight: '12px'}}>Select Person:</label>
                <select value={selectedPerson} onChange={(e) => setSelectedPerson(e.target.value)} style={{padding: '10px', borderRadius: '8px', border: '2px solid var(--border-color)'}}>
                  {sortedPersonData.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
              </div>

              {/* Overall Performance Score */}
              <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, var(--turquoise-primary), var(--turquoise-dark))',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '24px',
                boxShadow: 'var(--shadow-lg), var(--glow-turquoise)'
              }}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <div>
                    <div style={{fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '8px', fontWeight: '600'}}>
                      OVERALL PERFORMANCE SCORE
                    </div>
                    <div style={{fontSize: '48px', fontWeight: '700', color: 'white'}}>
                      {selected.performanceScore || 0}
                    </div>
                    <div style={{fontSize: '13px', color: 'rgba(255,255,255,0.8)'}}>
                      out of 100 • Rank #{selected.rank}
                    </div>
                  </div>
                  <div style={{fontSize: '64px'}}>
                    {(selected.performanceScore || 0) >= 90 ? '🏆' : 
                     (selected.performanceScore || 0) >= 75 ? '⭐' :
                     (selected.performanceScore || 0) >= 60 ? '💪' : '📈'}
                  </div>
                </div>
              </div>

              {/* Score Breakdown - 4 Weighted Components */}
              <div style={{
                padding: '20px',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '24px'
              }}>
                <h3 style={{fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)'}}>
                  📊 Performance Breakdown
                </h3>
                
                <div style={{display: 'grid', gap: '16px'}}>
                  {/* Sales Performance - 50% (Hybrid: Rank 60% + Volume 40%) */}
                  <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                      <div style={{fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)'}}>
                        🏆 Sales Performance
                        <span 
                          title="Hybrid formula: 60% based on your sales rank position + 40% based on your sales volume vs top seller. Rewards both position and actual performance gap."
                          style={{
                            marginLeft: '6px',
                            fontSize: '12px',
                            color: '#667eea',
                            cursor: 'help',
                            border: '1px solid #667eea',
                            borderRadius: '50%',
                            padding: '0 5px',
                            display: 'inline-block',
                            lineHeight: '1.4'
                          }}
                        >
                          ℹ
                        </span>
                        <span style={{marginLeft: '8px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500'}}>
                          (50% weight)
                        </span>
                      </div>
                      <div style={{fontSize: '14px', fontWeight: '700', color: '#667eea'}}>
                        {selected.salesScore || 0}/100
                      </div>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${selected.salesScore || 0}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #667eea, #5568d3)',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px'}}>
                      Rank #{selected.rank}/{personData.length} • Hybrid (Rank 60% + Volume 40%)
                    </div>
                  </div>

                  {/* Productivity Score - 25% (Percentile-based) */}
                  <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                      <div style={{fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)'}}>
                        💼 Productivity
                        <span 
                          title="Percentile-based ranking by daily sales output. Shows where you rank among the team in daily sales (Total Sales ÷ Working Days). Top performer = 100."
                          style={{
                            marginLeft: '6px',
                            fontSize: '12px',
                            color: '#f59e0b',
                            cursor: 'help',
                            border: '1px solid #f59e0b',
                            borderRadius: '50%',
                            padding: '0 5px',
                            display: 'inline-block',
                            lineHeight: '1.4'
                          }}
                        >
                          ℹ
                        </span>
                        <span style={{marginLeft: '8px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500'}}>
                          (25% weight)
                        </span>
                      </div>
                      <div style={{fontSize: '14px', fontWeight: '700', color: '#f59e0b'}}>
                        {selected.productivityScore || 0}/100
                      </div>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${selected.productivityScore || 0}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px'}}>
                      {formatCurrency(selected.sales / selected.workingDays)}/day • Rank #{selected.productivityRank}/{personData.length}
                    </div>
                  </div>

                  {/* Efficiency Score - 25% (Percentile-based) */}
                  <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                      <div style={{fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)'}}>
                        🎯 Efficiency
                        <span 
                          title="Percentile-based ranking by sales per client. Shows where you rank in average sale value (Total Sales ÷ Clients Served). Top performer = 100."
                          style={{
                            marginLeft: '6px',
                            fontSize: '12px',
                            color: '#10b981',
                            cursor: 'help',
                            border: '1px solid #10b981',
                            borderRadius: '50%',
                            padding: '0 5px',
                            display: 'inline-block',
                            lineHeight: '1.4'
                          }}
                        >
                          ℹ
                        </span>
                        <span style={{marginLeft: '8px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500'}}>
                          (25% weight)
                        </span>
                      </div>
                      <div style={{fontSize: '14px', fontWeight: '700', color: '#10b981'}}>
                        {selected.efficiencyScore || 0}/100
                      </div>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${selected.efficiencyScore || 0}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #10b981, #059669)',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px'}}>
                      {selected.clients ? `${formatCurrency(selected.sales / selected.clients)}/client • Rank #{selected.efficiencyRank}/{personData.length}` : 'No client data'}
                    </div>
                  </div>
                </div>

                {/* Formula Explanation */}
                <div style={{
                  marginTop: '20px',
                  padding: '12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  fontFamily: 'monospace'
                }}>
                  <strong style={{color: 'var(--text-primary)'}}>Formula v7.2.0:</strong> Performance = 
                  (Sales × 50%) + (Productivity × 25%) + (Efficiency × 25%)
                </div>
              </div>

              {/* Additional Stats */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)'}}>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px'}}>Total Sales</div>
                  <div style={{fontSize: '24px', fontWeight: '700', color: 'var(--success)'}}>{formatCurrency(selected.sales)}</div>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>{selected.packages} packages • {getViewModeLabel(viewMode)}</div>
                </div>

                {selected.clients !== undefined && selected.clients > 0 ? (
                  <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)'}}>
                    <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px'}}>Clients Served</div>
                    <div style={{fontSize: '32px', fontWeight: '700', color: '#06b6d4'}}>{selected.clients} 👥</div>
                    <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>Unique clients</div>
                  </div>
                ) : null}

                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)'}}>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px'}}>Working Days</div>
                  <div style={{fontSize: '32px', fontWeight: '700', color: '#f59e0b'}}>{selected.workingDays} 📅</div>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>{Math.round((selected.workingDays/22)*100)}% attendance</div>
                </div>
              </div>
            </div>
          ) : null}

          {activeSubTab === 'leaderboards' ? (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px'}}>
              {[
                { title: '🥇 Daily Champion', data: personData.slice(0, 3) },
                { title: '👑 Weekly Leaders', data: personData.slice(0, 3) },
                { title: '📦 Top Packages', data: [...personData].sort((a, b) => b.packages - a.packages).slice(0, 3) },
                { title: '🔥 Most Consistent', data: [...personData].sort((a, b) => (b.consistency || 0) - (a.consistency || 0)).slice(0, 3) },
                { title: '👥 Most Clients', data: [...personData].filter(p => p.clients && p.clients > 0).sort((a, b) => (b.clients || 0) - (a.clients || 0)).slice(0, 3) },
                { title: '💪 Longest Streak', data: [...personData].sort((a, b) => (b.streak || 0) - (a.streak || 0)).slice(0, 3) }
              ].map(board => (
                <div key={board.title} style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                  <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '16px'}}>{board.title}</h3>
                  {board.data.map((person, idx) => {
                    const badge = getRankBadge(idx + 1)
                    return (
                      <div key={person.name} style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '8px', border: idx === 0 ? `2px solid ${badge.color}44` : '1px solid var(--border-color)'}}>
                        <div style={{width: '36px', height: '36px', borderRadius: '50%', background: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: idx < 3 ? 'white' : '#6b7280'}}>{badge.emoji}</div>
                        <div style={{flex: 1}}>
                          <div style={{fontWeight: '600'}}>{person.name}</div>
                          <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>
                            {board.title.includes('Package') ? `${person.packages} pkgs` : 
                             board.title.includes('Consistent') ? `${person.consistency}%` :
                             board.title.includes('Streak') ? `${person.streak} days` :
                             board.title.includes('Clients') ? `${person.clients} clients` :
                             formatCurrency(person.sales)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          ) : null}

          {activeSubTab === 'achievements' ? (
            <div>
              <div style={{marginBottom: '24px'}}>
                <label style={{fontWeight: '600', marginRight: '12px'}}>View achievements for:</label>
                <select value={selectedPerson} onChange={(e) => setSelectedPerson(e.target.value)} style={{padding: '10px', borderRadius: '8px', border: '2px solid var(--border-color)'}}>
                  {sortedPersonData.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px'}}>
                {[
                  { icon: '🌟', name: 'Top Performer', desc: '#1 ranked', unlocked: selected?.rank === 1 },
                  { icon: '🔥', name: 'Hot Streak', desc: '5+ days active', unlocked: (selected?.streak || 0) >= 5 },
                  { icon: '💯', name: 'Consistent', desc: '90%+ consistency', unlocked: (selected?.consistency || 0) >= 90 },
                  { icon: '📈', name: 'Rising Star', desc: 'Top 3 ranking', unlocked: (selected?.rank || 100) <= 3 },
                  { icon: '🚀', name: 'Overachiever', desc: 'Above average', unlocked: (selected?.sales || 0) / Math.max(selected?.workingDays || 1, 1) > avgDaily },
                  { icon: '👑', name: 'Champion', desc: 'Monthly winner', unlocked: selected?.rank === 1 },
                  { icon: '💪', name: 'Persistent', desc: '10+ day streak', unlocked: (selected?.streak || 0) >= 10 },
                  { icon: '🎯', name: 'Target Crusher', desc: 'Exceed target', unlocked: false },
                  { icon: '⚡', name: 'Lightning', desc: 'Fast closer', unlocked: false },
                  { icon: '🏅', name: 'Team Player', desc: 'Top supporter', unlocked: false },
                  { icon: '🌙', name: 'Night Owl', desc: 'Late achiever', unlocked: false },
                  { icon: '☀️', name: 'Early Bird', desc: 'Morning star', unlocked: false }
                ].map(ach => (
                  <div key={ach.name} style={{padding: '24px', background: ach.unlocked ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 'var(--bg-tertiary)', border: ach.unlocked ? '2px solid #fbbf24' : '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', opacity: ach.unlocked ? 1 : 0.6}}>
                    <div style={{fontSize: '48px', marginBottom: '12px'}}>{ach.icon}</div>
                    <div style={{fontWeight: '700', marginBottom: '8px'}}>{ach.name}</div>
                    <div style={{fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px'}}>{ach.desc}</div>
                    <div style={{fontSize: '13px', fontWeight: '700', color: ach.unlocked ? '#166534' : '#6b7280'}}>{ach.unlocked ? '✓ Unlocked' : '🔒 Locked'}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {activeSubTab === 'insights' ? (
            <div style={{display: 'grid', gap: '16px'}}>
              <div style={{padding: '20px', background: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: '8px'}}>
                <div style={{fontSize: '24px', marginBottom: '12px'}}>💡</div>
                <div style={{fontWeight: '600', color: '#1e40af', marginBottom: '8px'}}>Top Performer</div>
                <div style={{color: '#1e40af', fontSize: '14px'}}>{personData[0]?.name} leads with {formatCurrency(personData[0]?.sales)} in sales. Consistency: {personData[0]?.consistency}%</div>
              </div>

              <div style={{padding: '20px', background: '#dcfce7', borderLeft: '4px solid #10b981', borderRadius: '8px'}}>
                <div style={{fontSize: '24px', marginBottom: '12px'}}>✨</div>
                <div style={{fontWeight: '600', color: '#166534', marginBottom: '8px'}}>Team Strength</div>
                <div style={{color: '#166534', fontSize: '14px'}}>Team average of {formatCurrency(avgDaily)} per day. {personData.filter(p => p.sales / Math.max(p.workingDays, 1) > avgDaily).length}/{personData.length} above average</div>
              </div>

              <div style={{padding: '20px', background: '#fef3c7', borderLeft: '4px solid #fbbf24', borderRadius: '8px'}}>
                <div style={{fontSize: '24px', marginBottom: '12px'}}>📊</div>
                <div style={{fontWeight: '600', color: '#92400e', marginBottom: '8px'}}>Opportunity</div>
                <div style={{color: '#92400e', fontSize: '14px'}}>{personData.filter(p => (p.consistency || 0) < 70).length} members could improve consistency</div>
              </div>

              <div style={{padding: '20px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '2px solid #3b82f6', borderRadius: '8px'}}>
                <div style={{fontSize: '24px', marginBottom: '12px'}}>🔮</div>
                <div style={{fontWeight: '600', color: '#1e40af', marginBottom: '8px'}}>Forecast</div>
                <div style={{color: '#1e40af', fontSize: '14px'}}>Projected: {formatCurrency(teamTotal * 1.15)} next period at current pace</div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  )
}
