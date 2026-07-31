'use client'
import { HomeIcon, UserIcon, TrophyIcon, AwardIcon, InsightIcon, TrendIcon, BarChartIcon, DownloadIcon } from '@/components/icons'
import { useState, useEffect, useMemo } from 'react'
import { getPersonId, type ExcelData } from '@/lib/excelUtils'
import { formatCurrency, getStaffCenterTag } from '@/lib/utils'
import {
  getAvailableIds, getDisplayName, getPersonalHistory, getTeamHistory, getLifetimeStats,
  getRankHistory, getPersonBadges, getBadgeInfo, ALL_BADGE_IDS,
} from '@/lib/analyticsUtils'
import { exportAnalyticsToPDF } from '@/lib/pdfUtils'
import { BENCHMARK_CLIENTS_PER_DAY, BENCHMARK_PACKAGES_PER_DAY, BENCHMARK_WORKING_DAYS, SCORE_WEIGHTS } from '@/lib/config'
import { CenterBadge } from '@/components/CenterBadge'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type SubTab = 'overview' | 'individual' | 'leaderboards' | 'achievements' | 'insights'
type ViewMode = 'monthly' | 'q1' | 'q2' | 'q3' | 'q4' | 'h1' | 'h2' | 'yearly' | 'alltime'

const COLORS = ['#35507a', '#9c6b3e', '#1f7a5c', '#b23a3a', '#6b7280', '#5c7ab0']
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

interface PersonData {
  id: string // employee code (or raw name fallback) — see getPersonId in excelUtils.ts
  name: string
  sales: number
  packages: number
  workingDays: number
  clients?: number
  rank?: number
  // Performance score components (standards-based absolute scoring).
  // 0-200: 100 = met the benchmark exactly, up to 200 = double it. Not
  // capped at 100 — see computePersonData for why.
  performanceScore?: number      // Overall
  salesScore?: number            // 50% weight: mySales vs personalTarget
  clientScore?: number           // 20% weight: avg clients/day vs benchmark
  packageScore?: number          // 20% weight: avg packages/day vs benchmark
  paceScore?: number             // 10% weight: actual daily sales rate vs expected
  personalTarget?: number        // AED — teamTarget / activeStaff
  avgClientsPerDay?: number
  avgPackagesPerDay?: number
  actualDailyRate?: number       // AED/day
  noTargetData?: boolean         // true if teamTarget is missing/zero
}

interface AnalyticsDashboardViewProps {
  excelData: ExcelData[]
  viewMode: ViewMode
  selectedMonth: string
  selectedYear: string
}

// Aggregates staff across the given sheets and computes a standards-based
// absolute performance score for each person against fixed benchmarks
// (lib/config.ts: BENCHMARK_CLIENTS_PER_DAY, BENCHMARK_PACKAGES_PER_DAY) —
// a score of 100 means the benchmark was met exactly. Scores are NOT capped
// at 100: clearing the benchmark is common for a healthy team (the app's own
// tier system expects teams to regularly hit 100-111%+ of target), so a hard
// cap at 100 collapses everyone who clears it into an indistinguishable
// ceiling. Letting scores run up to 200 (double the standard) keeps real
// over-achievers visibly ahead of people who just cleared the bar. Pulled
// out as a standalone function (rather than inline in the effect below) so
// the same scoring can be run a second time against a prior month's sheet
// for the leaderboard's month-on-month movement indicator.
function computePersonData(sheets: ExcelData[]): PersonData[] {
  const allPeople = new Map<string, PersonData>()

  sheets.forEach(sheet => {
    sheet.staff.forEach(person => {
      const id = getPersonId(person.name)
      if (allPeople.has(id)) {
        const existing = allPeople.get(id)!
        existing.sales += person.sales
        existing.packages += person.packages
        existing.workingDays += person.workingDays
        existing.name = person.name // keep the latest-seen name for display
        if (person.clients) {
          existing.clients = (existing.clients || 0) + person.clients
        }
      } else {
        allPeople.set(id, {
          id,
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
  const totalPeople = people.length
  if (totalPeople === 0) return people

  const teamTarget = sheets.reduce((sum, sh) => sum + sh.target, 0)
  const activeStaff = allPeople.size
  const personalTarget = activeStaff > 0 ? teamTarget / activeStaff : 0

  people.forEach((person, index) => {
    person.rank = index + 1
    person.personalTarget = personalTarget

    if (!teamTarget || !personalTarget) {
      person.salesScore = 0
      person.clientScore = 0
      person.packageScore = 0
      person.paceScore = 0
      person.performanceScore = 0
      person.noTargetData = true
      return
    }

    const effectiveWorkingDays = Math.max(person.workingDays, 1)

    const salesScore = clampScore((person.sales / personalTarget) * 100)

    let clientScore: number
    let avgClientsPerDay = 0
    if (person.clients && person.clients > 0 && person.workingDays > 0) {
      avgClientsPerDay = person.clients / person.workingDays
      clientScore = clampScore((avgClientsPerDay / BENCHMARK_CLIENTS_PER_DAY) * 100)
    } else {
      clientScore = 50 // Neutral — client data absent, neither reward nor penalise
    }

    let packageScore: number
    let avgPackagesPerDay = 0
    if (person.packages > 0 && person.workingDays > 0) {
      avgPackagesPerDay = person.packages / person.workingDays
      packageScore = clampScore((avgPackagesPerDay / BENCHMARK_PACKAGES_PER_DAY) * 100)
    } else {
      packageScore = 0
    }

    const expectedDailyRate = personalTarget / BENCHMARK_WORKING_DAYS
    const actualDailyRate = person.sales / effectiveWorkingDays
    const paceScore = clampScore((actualDailyRate / expectedDailyRate) * 100)

    const performanceScore = Math.round(
      salesScore   * SCORE_WEIGHTS.sales +
      clientScore  * SCORE_WEIGHTS.clients +
      packageScore * SCORE_WEIGHTS.packages +
      paceScore    * SCORE_WEIGHTS.pace
    )

    person.salesScore = Math.round(salesScore)
    person.clientScore = Math.round(clientScore)
    person.packageScore = Math.round(packageScore)
    person.paceScore = Math.round(paceScore)
    person.performanceScore = performanceScore
    person.avgClientsPerDay = avgClientsPerDay
    person.avgPackagesPerDay = avgPackagesPerDay
    person.actualDailyRate = actualDailyRate
    person.noTargetData = false
  })

  return people
}

// Floors at 0; ceilings at 200 (double the benchmark) rather than 100 so
// genuine over-achievement stays visible instead of bunching everyone who
// clears the standard into the same score. See computePersonData above.
function clampScore(score: number): number {
  return Math.min(200, Math.max(0, score))
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

    const people = computePersonData(sheetsToProcess)

    setPersonData(people)
    if (people.length > 0) setSelectedPerson(people[0].id)
  }, [excelData, viewMode, selectedMonth, selectedYear])

  // Month-on-month score movement: recompute the previous calendar month's
  // performance scores (independent of the currently selected view/period)
  // so the leaderboard can show each person's delta vs last month.
  const [prevMonthScores, setPrevMonthScores] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    if (viewMode !== 'monthly' || excelData.length === 0) {
      setPrevMonthScores(new Map())
      return
    }
    const idx = SHORT_MONTHS.indexOf(selectedMonth)
    if (idx === -1) { setPrevMonthScores(new Map()); return }

    const prevIdx = idx === 0 ? 11 : idx - 1
    const prevYear = idx === 0 ? String(Number(selectedYear) - 1).padStart(2, '0') : selectedYear
    const prevMonth = SHORT_MONTHS[prevIdx]

    const prevSheets = excelData.filter(d => d.sheetName === `${prevMonth} ${prevYear}` || d.sheetName === `${prevMonth}${prevYear}`)
    if (prevSheets.length === 0) { setPrevMonthScores(new Map()); return }

    const prevPeople = computePersonData(prevSheets)
    const scores = new Map<string, number>()
    prevPeople.forEach(p => {
      if (p.performanceScore !== undefined) scores.set(p.id, p.performanceScore)
    })
    setPrevMonthScores(scores)
  }, [excelData, viewMode, selectedMonth, selectedYear])

  // Returns the arrow/delta badge for a person's score vs last month, or
  // null when there's nothing to compare against (non-monthly view, or no
  // prior-month sheet for that person).
  const getMovement = (id: string, currentScore?: number) => {
    if (viewMode !== 'monthly' || currentScore === undefined) return null
    const prevScore = prevMonthScores.get(id)
    if (prevScore === undefined) return null
    const delta = currentScore - prevScore
    if (delta > 0) return { arrow: '↑', delta, color: 'var(--success)' }
    if (delta < 0) return { arrow: '↓', delta, color: 'var(--error)' }
    return { arrow: '→', delta: 0, color: 'var(--text-muted)' }
  }

  const teamTotal = useMemo(() => personData.reduce((sum, p) => sum + p.sales, 0), [personData])
  const teamPackages = useMemo(() => personData.reduce((sum, p) => sum + p.packages, 0), [personData])
  const avgDaily = useMemo(() => teamTotal / Math.max(personData.reduce((sum, p) => sum + p.workingDays, 0), 1), [personData, teamTotal])
  const selected = useMemo(() => personData.find(p => p.id === selectedPerson), [personData, selectedPerson])

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
    return getAvailableIds()
      .map(id => ({ id, name: getDisplayName(id), streak: getLifetimeStats(id)?.longestStreak || 0 }))
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
                  {sortedPersonData.map(p => { const tag = getStaffCenterTag(p.name); return <option key={p.id} value={p.id}>{p.name}{tag ? ` [${tag}]` : ''}</option> })}
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
                      100 = standard met • Rank #{selected.rank}
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

                {selected.noTargetData ? (
                  <div style={{
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    borderLeft: '3px solid var(--warning)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)'
                  }}>
                    No target found for this period. Performance scores unavailable.
                  </div>
                ) : (
                <>
                <div style={{display: 'grid', gap: '16px'}}>
                  {/* Sales Score - 50% (vs personal share of team target) */}
                  <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                      <div style={{fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)'}}>
                        Sales
                        <span
                          title="Your monthly sales vs your personal share of the team target (team target ÷ active staff). 100 = met your target exactly."
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
                      Personal target: AED {formatCurrency(selected.personalTarget || 0)}
                    </div>
                  </div>

                  {/* Client Score - 20% (avg clients/day vs benchmark) */}
                  <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                      <div style={{fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)'}}>
                        Clients
                        <span
                          title="Average converted clients per working day vs the benchmark rate. 100 = met the benchmark exactly."
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
                          (20% weight)
                        </span>
                      </div>
                      <div style={{fontSize: '14px', fontWeight: '700', color: 'var(--warning)'}}>
                        {selected.clientScore ?? 0}/100
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
                        width: `${selected.clientScore ?? 0}%`,
                        height: '100%',
                        background: 'var(--warning)',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px'}}>
                      {selected.clients && selected.clients > 0
                        ? `${(selected.avgClientsPerDay || 0).toFixed(2)}/day vs benchmark ${BENCHMARK_CLIENTS_PER_DAY}/day`
                        : 'No client data — neutral score applied'}
                    </div>
                  </div>

                  {/* Package Score - 20% (avg packages/day vs benchmark) */}
                  <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                      <div style={{fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)'}}>
                        Packages
                        <span
                          title="Average packages sold per working day vs the benchmark rate. 100 = met the benchmark exactly."
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
                          (20% weight)
                        </span>
                      </div>
                      <div style={{fontSize: '14px', fontWeight: '700', color: 'var(--success)'}}>
                        {selected.packageScore ?? 0}/100
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
                        width: `${selected.packageScore ?? 0}%`,
                        height: '100%',
                        background: 'var(--success)',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px'}}>
                      {(selected.avgPackagesPerDay || 0).toFixed(2)}/day vs benchmark {BENCHMARK_PACKAGES_PER_DAY}/day
                    </div>
                  </div>

                  {/* Pace Score - 10% (actual daily sales rate vs expected) */}
                  <div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                      <div style={{fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)'}}>
                        Pace
                        <span
                          title="Actual daily sales rate vs the expected rate (personal target ÷ standard working days). Rewards hitting target in fewer days."
                          style={{
                            marginLeft: '6px',
                            fontSize: '12px',
                            color: 'var(--accent-secondary)',
                            cursor: 'help',
                            border: '1px solid var(--accent-secondary)',
                            borderRadius: '50%',
                            padding: '0 5px',
                            display: 'inline-block',
                            lineHeight: '1.4'
                          }}
                        >
                          ℹ
                        </span>
                        <span style={{marginLeft: '8px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500'}}>
                          (10% weight)
                        </span>
                      </div>
                      <div style={{fontSize: '14px', fontWeight: '700', color: 'var(--accent-secondary)'}}>
                        {selected.paceScore ?? 0}/100
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
                        width: `${selected.paceScore ?? 0}%`,
                        height: '100%',
                        background: 'var(--accent-secondary)',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px'}}>
                      AED {(selected.actualDailyRate || 0).toFixed(0)}/day vs expected AED {((selected.personalTarget || 0) / BENCHMARK_WORKING_DAYS).toFixed(0)}/day
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
                  <strong style={{color: 'var(--text-primary)'}}>Formula:</strong> Performance =
                  (Sales × 50%) + (Clients × 20%) + (Packages × 20%) + (Pace × 10%)
                </div>
                </>
                )}
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
                  <h3 style={{fontSize: '14px', fontWeight: '600'}}><TrendIcon />{selected.name}<CenterBadge name={selected.name} /> — History</h3>
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
                { title: `Top Sales — ${getViewModeLabel(viewMode)}`, entries: personData.slice(0, 3).map(p => ({ id: p.id, name: p.name, metric: `AED ${formatCurrency(p.sales)}` })) },
                { title: `Top Packages — ${getViewModeLabel(viewMode)}`, entries: [...personData].sort((a, b) => b.packages - a.packages).slice(0, 3).map(p => ({ id: p.id, name: p.name, metric: `${p.packages} pkgs` })) },
                ...(personData.some(p => p.clients && p.clients > 0) ? [{
                  title: `Most Clients — ${getViewModeLabel(viewMode)}`,
                  entries: [...personData].filter(p => p.clients && p.clients > 0).sort((a, b) => (b.clients || 0) - (a.clients || 0)).slice(0, 3).map(p => ({ id: p.id, name: p.name, metric: `${p.clients} clients` })),
                }] : []),
                ...(streakLeaders.length > 0 ? [{
                  title: 'Longest Streak — all-time',
                  entries: streakLeaders.map(p => ({ id: p.id, name: p.name, metric: `${p.streak} mo ≥75%` })),
                }] : []),
              ].map(board => (
                <div key={board.title} style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                  <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '16px'}}>{board.title}</h3>
                  {board.entries.map((entry, idx) => {
                    const badge = getRankBadge(idx + 1)
                    const movement = getMovement(entry.id, personData.find(p => p.id === entry.id)?.performanceScore)
                    return (
                      <div key={entry.id} style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--surface)', borderRadius: '8px', marginBottom: '8px', border: '1px solid var(--border-color)'}}>
                        <div style={{width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${badge.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: badge.color, fontFamily: "'JetBrains Mono', monospace"}}>{badge.label}</div>
                        <div style={{flex: 1}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span style={{fontWeight: '600'}}>{entry.name}</span><CenterBadge name={entry.id} />
                            {movement && (
                              <span style={{fontSize: '12px', fontWeight: '700', color: movement.color, fontFamily: "'JetBrains Mono', monospace"}}>
                                {movement.arrow} {movement.delta > 0 ? '+' : ''}{movement.delta} pts
                              </span>
                            )}
                          </div>
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
                  {sortedPersonData.map(p => { const tag = getStaffCenterTag(p.name); return <option key={p.id} value={p.id}>{p.name}{tag ? ` [${tag}]` : ''}</option> })}
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
