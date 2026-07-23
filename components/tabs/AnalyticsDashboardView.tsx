'use client'
import { HomeIcon, UserIcon, TrophyIcon, AwardIcon, InsightIcon, TrendIcon, BarChartIcon, DownloadIcon } from '@/components/icons'
import { useState, useEffect, useMemo } from 'react'
import { type ExcelData } from '@/lib/excelUtils'
import { formatCurrency } from '@/lib/utils'
import {
  getAvailableNames, getPersonalHistory, getTeamHistory, getLifetimeStats,
  getRankHistory, getPersonBadges, getBadgeInfo, ALL_BADGE_IDS,
} from '@/lib/analyticsUtils'
import { exportAnalyticsToPDF } from '@/lib/pdfUtils'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type SubTab = 'overview' | 'individual' | 'leaderboards' | 'achievements' | 'insights'
type ViewMode = 'monthly' | 'q1' | 'q2' | 'q3' | 'q4' | 'h1' | 'h2' | 'yearly' | 'alltime'

const COLORS = ['#35507a', '#9c6b3e', '#1f7a5c', '#b23a3a', '#6b7280', '#5c7ab0']

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

  // Real cross-month history, persisted by Bulk Results "Calculate" in Monthly view
  // (lib/analyticsUtils — independent of the currently uploaded file/view selection)
  const teamHistory = useMemo(() => getTeamHistory(), [personData])
  const personalHistory = useMemo(() => getPersonalHistory(selectedPerson), [selectedPerson, personData])
  const lifetimeStats = useMemo(() => getLifetimeStats(selectedPerson), [selectedPerson, personData])
  const rankHistory = useMemo(() => getRankHistory(selectedPerson), [selectedPerson, personData])
  const personBadges = useMemo(() => getPersonBadges(selectedPerson), [selectedPerson, personData])
  const streakLeaders = useMemo(() => {
    return getAvailableNames()
      .map(name => ({ name, streak: getLifetimeStats(name)?.longestStreak || 0 }))
      .filter(p => p.streak > 0)
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 3)
  }, [personData])

  const monthLabel = (monthKey: string) => {
    const [y, m] = monthKey.split('-')
    const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${names[parseInt(m, 10) - 1]} '${y.slice(2)}`
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { label: `#${rank}`, color: 'var(--tier-3)' }
    if (rank === 2) return { label: `#${rank}`, color: 'var(--tier-2)' }
    if (rank === 3) return { label: `#${rank}`, color: 'var(--tier-1)' }
    return { label: `#${rank}`, color: 'var(--text-muted)' }
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


  const TAB_ICONS: Record<string, React.ReactNode> = {
    overview:     <HomeIcon />,
    individual:   <UserIcon />,
    leaderboards: <TrophyIcon />,
    achievements: <AwardIcon />,
    insights:     <InsightIcon />,
  }
  return (
    <>
      {personData.length > 0 ? (
        <div>
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '24px',
            overflowX: 'auto',
            borderBottom: '1px solid var(--border-color)'
          }}>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'individual', label: 'Individual' },
              { id: 'leaderboards', label: 'Leaderboards' },
              { id: 'achievements', label: 'Achievements' },
              { id: 'insights', label: 'Insights' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as SubTab)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  borderBottom: activeSubTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  marginBottom: '-1px',
                  background: 'transparent',
                  color: activeSubTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'var(--transition-base)'
                }}
              >
                <TabIcon id={tab.id} />{tab.label}
              </button>
            ))}
          </div>

          {activeSubTab === 'overview' ? (
            <div>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px'}}>
                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                  <div style={{fontSize: '12px', opacity: 0.9, marginBottom: '8px'}}>TOTAL SALES</div>
                  <div style={{fontSize: '28px', fontWeight: '700'}}>{formatCurrency(teamTotal)}</div>
                  <div style={{fontSize: '13px', opacity: 0.9}}>{getViewModeLabel(viewMode)}</div>
                </div>
                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                  <div style={{fontSize: '12px', opacity: 0.9, marginBottom: '8px'}}>TOTAL PACKAGES</div>
                  <div style={{fontSize: '28px', fontWeight: '700'}}>{teamPackages}</div>
                  <div style={{fontSize: '13px', opacity: 0.9}}>{getViewModeLabel(viewMode)}</div>
                </div>
                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                  <div style={{fontSize: '12px', opacity: 0.9, marginBottom: '8px'}}>DAILY AVERAGE</div>
                  <div style={{fontSize: '28px', fontWeight: '700'}}>{formatCurrency(avgDaily)}</div>
                  <div style={{fontSize: '13px', opacity: 0.9}}>Per working day</div>
                </div>
                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                  <div style={{fontSize: '12px', opacity: 0.9, marginBottom: '8px'}}>TEAM SIZE</div>
                  <div style={{fontSize: '28px', fontWeight: '700'}}>{personData.length}</div>
                  <div style={{fontSize: '13px', opacity: 0.9}}>Active members</div>
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px'}}>
                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                  <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '16px'}}><TrendIcon />Top 10 Performers</h3>
                  <div style={{height: '280px'}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topPerformers}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sales" fill="var(--accent-primary)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                  <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '16px'}}>Team Contribution</h3>
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
                <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '16px'}}><BarChartIcon />Team Performance Comparison</h3>
                <div style={{height: '320px'}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={personData.slice(0, 10).map(p => ({name: p.name.split(' ')[0], sales: p.sales, packages: p.packages}))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sales" fill="var(--accent-primary)" name="Sales" />
                      <Bar dataKey="packages" fill="var(--success)" name="Packages" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '24px'}}>
                <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '4px'}}><TrendIcon />Team Achievement — History</h3>
                {teamHistory.length >= 2 ? (
                  <div style={{height: '240px', marginTop: '12px'}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={teamHistory.map(m => ({ month: monthLabel(m.monthKey), achievement: Number(m.teamAchievement.toFixed(1)) }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis unit="%" />
                        <Tooltip />
                        <Line type="monotone" dataKey="achievement" name="Achievement %" stroke="var(--accent-primary)" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p style={{fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px'}}>
                    Calculate Bulk Results in Monthly view for at least two months to see the team's achievement trend here.
                  </p>
                )}
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
                background: 'var(--accent-primary)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '24px'
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
                </div>
              </div>

              {/* Score Breakdown - 4 Weighted Components */}
              <div style={{
                padding: '20px',
                background: 'var(--bg-card)',
                
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '24px'
              }}>
                <h3 style={{fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: 'var(--text-primary)'}}>
                  Performance Breakdown
                </h3>
                
                <div style={{display: 'grid', gap: '16px'}}>
                  {/* Sales Performance - 50% (Hybrid: Rank 60% + Volume 40%) */}
                  <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                      <div style={{fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)'}}>
                        Sales Performance
                        <span 
                          title="Hybrid formula: 60% based on your sales rank position + 40% based on your sales volume vs top seller. Rewards both position and actual performance gap."
                          style={{
                            marginLeft: '6px',
                            fontSize: '12px',
                            color: 'var(--accent-primary)',
                            cursor: 'help',
                            border: '1px solid var(--accent-primary)',
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
                      <div style={{fontSize: '14px', fontWeight: '700', color: 'var(--accent-primary)'}}>
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
                        background: 'var(--accent-primary)',
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
                        Productivity
                        <span 
                          title="Percentile-based ranking by daily sales output. Shows where you rank among the team in daily sales (Total Sales ÷ Working Days). Top performer = 100."
                          style={{
                            marginLeft: '6px',
                            fontSize: '12px',
                            color: 'var(--warning)',
                            cursor: 'help',
                            border: '1px solid var(--warning)',
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
                      <div style={{fontSize: '14px', fontWeight: '700', color: 'var(--warning)'}}>
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
                        background: 'var(--warning)',
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
                        Efficiency
                        <span 
                          title="Percentile-based ranking by sales per client. Shows where you rank in average sale value (Total Sales ÷ Clients Served). Top performer = 100."
                          style={{
                            marginLeft: '6px',
                            fontSize: '12px',
                            color: 'var(--success)',
                            cursor: 'help',
                            border: '1px solid var(--success)',
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
                      <div style={{fontSize: '14px', fontWeight: '700', color: 'var(--success)'}}>
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
                        background: 'var(--success)',
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
                    <div style={{fontSize: '32px', fontWeight: '700', color: 'var(--accent-secondary)'}}>{selected.clients}</div>
                    <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>Unique clients</div>
                  </div>
                ) : null}

                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)'}}>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px'}}>Working Days</div>
                  <div style={{fontSize: '32px', fontWeight: '700', color: 'var(--warning)'}}>{selected.workingDays}</div>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>{getViewModeLabel(viewMode)}</div>
                </div>
              </div>

              {/* Real cross-month history for this person */}
              <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '24px'}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px'}}>
                  <h3 style={{fontSize: '14px', fontWeight: '600'}}><TrendIcon />{selected.name} — History</h3>
                  {lifetimeStats && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => exportAnalyticsToPDF(personalHistory, lifetimeStats, rankHistory)}
                    >
                      <DownloadIcon />Download PDF
                    </button>
                  )}
                </div>

                {lifetimeStats ? (
                  <>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', margin: '16px 0'}}>
                      <div className="stat-card"><div className="stat-label">Months Tracked</div><div className="stat-value" style={{fontSize:'18px'}}>{lifetimeStats.monthsTracked}</div></div>
                      <div className="stat-card"><div className="stat-label">Total Earned</div><div className="stat-value" style={{fontSize:'18px'}}>AED {formatCurrency(lifetimeStats.totalEarnings)}</div></div>
                      <div className="stat-card"><div className="stat-label">Avg / Month</div><div className="stat-value" style={{fontSize:'18px'}}>AED {formatCurrency(lifetimeStats.avgEarnings)}</div></div>
                      <div className="stat-card"><div className="stat-label">Best Month</div><div className="stat-value" style={{fontSize:'18px'}}>{monthLabel(lifetimeStats.bestMonth.monthKey)}</div></div>
                      <div className="stat-card"><div className="stat-label">Current Streak</div><div className="stat-value" style={{fontSize:'18px'}}>{lifetimeStats.currentStreak} mo</div></div>
                      <div className="stat-card"><div className="stat-label">Longest Streak</div><div className="stat-value" style={{fontSize:'18px'}}>{lifetimeStats.longestStreak} mo</div></div>
                    </div>

                    {personalHistory.length >= 2 && (
                      <div style={{height: '220px'}}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={personalHistory.map(m => ({ month: monthLabel(m.monthKey), achievement: Number(m.achievement.toFixed(1)), earnings: Math.round(m.totalEarnings) }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis unit="%" />
                            <Tooltip />
                            <Line type="monotone" dataKey="achievement" name="Team Achievement %" stroke="var(--accent-primary)" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px'}}>
                    No saved history yet for {selected.name}. Calculate Bulk Results in Monthly view to start tracking month over month.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {activeSubTab === 'leaderboards' ? (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px'}}>
              {[
                { title: `Top Sales — ${getViewModeLabel(viewMode)}`, entries: personData.slice(0, 3).map(p => ({ name: p.name, metric: `AED ${formatCurrency(p.sales)}` })) },
                { title: `Top Packages — ${getViewModeLabel(viewMode)}`, entries: [...personData].sort((a, b) => b.packages - a.packages).slice(0, 3).map(p => ({ name: p.name, metric: `${p.packages} pkgs` })) },
                ...(personData.some(p => p.clients && p.clients > 0) ? [{
                  title: `Most Clients — ${getViewModeLabel(viewMode)}`,
                  entries: [...personData].filter(p => p.clients && p.clients > 0).sort((a, b) => (b.clients || 0) - (a.clients || 0)).slice(0, 3).map(p => ({ name: p.name, metric: `${p.clients} clients` })),
                }] : []),
                ...(streakLeaders.length > 0 ? [{
                  title: 'Longest Streak — all-time',
                  entries: streakLeaders.map(p => ({ name: p.name, metric: `${p.streak} mo ≥75%` })),
                }] : []),
              ].map(board => (
                <div key={board.title} style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                  <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '16px'}}>{board.title}</h3>
                  {board.entries.map((entry, idx) => {
                    const badge = getRankBadge(idx + 1)
                    return (
                      <div key={entry.name} style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--surface)', borderRadius: '8px', marginBottom: '8px', border: '1px solid var(--border-color)'}}>
                        <div style={{width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${badge.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: badge.color, fontFamily: "'JetBrains Mono', monospace"}}>{badge.label}</div>
                        <div style={{flex: 1}}>
                          <div style={{fontWeight: '600'}}>{entry.name}</div>
                          <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>{entry.metric}</div>
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
              <div style={{marginBottom: '12px'}}>
                <label style={{fontWeight: '600', marginRight: '12px'}}>View achievements for:</label>
                <select value={selectedPerson} onChange={(e) => setSelectedPerson(e.target.value)} style={{padding: '10px', borderRadius: '8px', border: '2px solid var(--border-color)'}}>
                  {sortedPersonData.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <p style={{fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px'}}>
                Badges are earned automatically and saved permanently when you calculate Bulk Results in Monthly view.
                {personBadges.length > 0 && ` ${personBadges.length}/${ALL_BADGE_IDS.length} unlocked.`}
              </p>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px'}}>
                {ALL_BADGE_IDS.map(id => {
                  const info = getBadgeInfo(id)
                  const unlocked = personBadges.includes(id)
                  return (
                    <div key={id} style={{padding: '24px', background: unlocked ? 'var(--accent-soft)' : 'var(--bg-tertiary)', border: unlocked ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', opacity: unlocked ? 1 : 0.5}}>
                      <div style={{fontSize: '36px', marginBottom: '12px'}}>{info.icon}</div>
                      <div style={{fontWeight: '700', marginBottom: '8px'}}>{info.name}</div>
                      <div style={{fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px'}}>{info.description}</div>
                      <div style={{fontSize: '13px', fontWeight: '700', color: unlocked ? 'var(--success)' : 'var(--text-muted)'}}>{unlocked ? 'Unlocked' : 'Locked'}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          {activeSubTab === 'insights' ? (() => {
            const latestTwo = teamHistory.slice(-2)
            const trendDelta = latestTwo.length === 2 ? latestTwo[1].teamAchievement - latestTwo[0].teamAchievement : null
            const bestMonthRecord = teamHistory.length > 0
              ? teamHistory.reduce((best, m) => m.teamAchievement > best.teamAchievement ? m : best)
              : null
            return (
              <div style={{display: 'grid', gap: '16px'}}>
                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderLeft: '3px solid var(--accent-primary)', borderRadius: '8px'}}>
                  <div style={{fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px'}}>Top Performer — {getViewModeLabel(viewMode)}</div>
                  <div style={{color: 'var(--text-secondary)', fontSize: '14px'}}>{personData[0]?.name} leads with AED {formatCurrency(personData[0]?.sales)} in sales.</div>
                </div>

                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderLeft: '3px solid var(--success)', borderRadius: '8px'}}>
                  <div style={{fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px'}}>Team Strength — {getViewModeLabel(viewMode)}</div>
                  <div style={{color: 'var(--text-secondary)', fontSize: '14px'}}>Team average of AED {formatCurrency(avgDaily)} per day. {personData.filter(p => p.sales / Math.max(p.workingDays, 1) > avgDaily).length}/{personData.length} above average</div>
                </div>

                <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderLeft: '3px solid var(--warning)', borderRadius: '8px'}}>
                  <div style={{fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px'}}>Team Trend — Month over Month</div>
                  {trendDelta !== null ? (
                    <div style={{color: 'var(--text-secondary)', fontSize: '14px'}}>
                      Achievement {trendDelta >= 0 ? 'up' : 'down'} <strong style={{color: trendDelta >= 0 ? 'var(--success)' : 'var(--error)'}}>{Math.abs(trendDelta).toFixed(1)}pp</strong> vs {monthLabel(latestTwo[0].monthKey)} ({latestTwo[0].teamAchievement.toFixed(1)}% → {latestTwo[1].teamAchievement.toFixed(1)}%)
                    </div>
                  ) : (
                    <div style={{color: 'var(--text-muted)', fontSize: '14px'}}>Calculate Bulk Results in Monthly view for at least two months to see a real trend.</div>
                  )}
                </div>

                <div style={{padding: '20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px'}}>
                  <div style={{fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px'}}>Best Month on Record</div>
                  {bestMonthRecord ? (
                    <div style={{color: 'var(--text-secondary)', fontSize: '14px'}}>
                      {monthLabel(bestMonthRecord.monthKey)} — <strong>{bestMonthRecord.teamAchievement.toFixed(1)}%</strong> achievement, AED {formatCurrency(bestMonthRecord.teamSales)} in sales ({bestMonthRecord.tier})
                    </div>
                  ) : (
                    <div style={{color: 'var(--text-muted)', fontSize: '14px'}}>No saved history yet. Calculate Bulk Results in Monthly view to start tracking.</div>
                  )}
                </div>
              </div>
            )
          })() : null}
        </div>
      ) : null}
    </>
  )
}

function TabIcon({ id }: { id: string }) {
  if (id === 'overview')     return <HomeIcon />
  if (id === 'individual')   return <UserIcon />
  if (id === 'leaderboards') return <TrophyIcon />
  if (id === 'achievements') return <AwardIcon />
  if (id === 'insights')     return <InsightIcon />
  return null
}
