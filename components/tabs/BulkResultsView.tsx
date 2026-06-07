'use client'
import { useState, useEffect } from 'react'
import { getAvailableMonths, aggregateSheets, type ExcelData, type StaffData } from '@/lib/excelUtils'
import { calculateIncentive, formatCurrency, getTier, loadTiers, DEFAULT_TIERS, type Tier } from '@/lib/utils'
import { saveTeamData, type MonthlyTeamData, type StaffResult } from '@/lib/analyticsUtils'
import { exportBulkToPDF } from '@/lib/pdfUtils'
import { DownloadIcon } from '@/components/icons'

interface BulkResult extends StaffData {
  achievement: number
  tierName: string
  tierRate: number
  totalIncentive: number
  p1: number
  p2: number
  contribution: number
  avgPackagesPerDay: number
  avgSalesPerDay: number
  clients?: number
}

type ViewMode = 'monthly' | 'q1' | 'q2' | 'q3' | 'q4' | 'h1' | 'h2' | 'yearly' | 'alltime'

interface BulkResultsViewProps {
  excelData: ExcelData[]
  viewMode: ViewMode
  selectedMonth: string
  selectedYear: string
}

export function BulkResultsView({ excelData, viewMode, selectedMonth, selectedYear }: BulkResultsViewProps) {
  const [target, setTarget] = useState('')
  const [autoTarget, setAutoTarget] = useState(0)
  const [staffCount, setStaffCount] = useState(0)
  const [p1Split, setP1Split] = useState(60)
  const [results, setResults] = useState<BulkResult[]>([])
  const [calculatedData, setCalculatedData] = useState<any>(null)
  const [sortColumn, setSortColumn] = useState<keyof BulkResult>('sales')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const getSheetsForView = (): ExcelData[] => {
    if (viewMode === 'monthly') {
      const sheetName = `${selectedMonth} ${selectedYear}`.replace('  ', '')
      return excelData.filter(d => d.sheetName === sheetName || d.sheetName === `${selectedMonth}${selectedYear}`)
    }
    
    if (viewMode === 'alltime') {
      return excelData
    }
    
    if (viewMode === 'yearly') {
      return excelData.filter(d => d.sheetName.includes(selectedYear))
    }
    
    const quarters: Record<string, string[]> = {
      q1: ['Jan', 'Feb', 'Mar'],
      q2: ['Apr', 'May', 'Jun'],
      q3: ['Jul', 'Aug', 'Sep'],
      q4: ['Oct', 'Nov', 'Dec'],
      h1: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      h2: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }
    
    const quarterMonths = quarters[viewMode]
    return excelData.filter(d => {
      const [monthName, year] = d.sheetName.split(' ')
      return quarterMonths.includes(monthName) && year === selectedYear
    })
  }

  const handleCalculate = () => {
    const sheets = getSheetsForView()
    
    if (sheets.length === 0) {
      alert('No sheets found for selected view')
      return
    }

    let aggregated: ExcelData
    if (sheets.length === 1) {
      aggregated = sheets[0]
    } else {
      aggregated = aggregateSheets(sheets)
    }

    if (aggregated.staff.length === 0) {
      alert('No staff data found')
      return
    }

    setAutoTarget(aggregated.target)
    setStaffCount(aggregated.staff.length)

    const finalTarget = target ? parseFloat(target) : aggregated.target
    
    if (!finalTarget || finalTarget <= 0) {
      alert('Invalid target. Enter manually or check Excel')
      return
    }

    const teamSales = aggregated.teamTotal.sales
    const teamAchievement = (teamSales / finalTarget) * 100
    const tier = getTier(teamAchievement)
    const totalPool = (tier.rate / 100) * teamSales

    const bulkResults: BulkResult[] = aggregated.staff.map(person => {
      const personCalc = calculateIncentive(finalTarget, teamSales, person.sales, aggregated.staff.length, p1Split)
      const workDays = person.workingDays || 1
      
      return {
        name: person.name,
        packages: person.packages,
        sales: person.sales,
        workingDays: person.workingDays,
        clients: person.clients,
        achievement: teamAchievement,
        tierName: tier.name,
        tierRate: tier.rate,
        totalIncentive: personCalc.myTotal,
        p1: personCalc.myP1,
        p2: personCalc.myP2,
        contribution: personCalc.myContribution,
        avgPackagesPerDay: person.packages / workDays,
        avgSalesPerDay: person.sales / workDays
      }
    })

    bulkResults.sort((a, b) => b.sales - a.sales)

    // Calculate total clients
    const totalClients = aggregated.staff.reduce((sum, p) => sum + (p.clients || 0), 0)

    setResults(bulkResults)
    setCalculatedData({
      teamAchievement,
      tier,
      totalPool,
      target: finalTarget,
      teamSales,
      teamPackages: aggregated.teamTotal.packages,
      totalClients,
      staffCount: aggregated.staff.length,
      sheets: sheets.map(s => s.sheetName),
      viewMode
    })
    setSortColumn('sales')
    setSortDirection('desc')

    // Save team analytics data (only for monthly view)
    if (viewMode === 'monthly') {
      saveTeamAnalytics(bulkResults, {
        teamAchievement,
        tier,
        totalPool,
        target: finalTarget,
        teamSales,
        staffCount: aggregated.staff.length
      })
    }
  }

  const saveTeamAnalytics = (bulkResults: BulkResult[], teamData: any) => {
    const monthKey = `${selectedYear && selectedYear.length === 2 ? '20' + selectedYear : selectedYear}-${String(
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(selectedMonth) + 1
    ).padStart(2, '0')}`

    const staff: StaffResult[] = bulkResults.map((person, index) => ({
      name: person.name,
      sales: person.sales,
      packages: person.packages,
      totalEarnings: person.totalIncentive,
      rank: index + 1,
      contribution: person.contribution,
      p1: person.p1,
      p2: person.p2
    }))

    const teamDataToSave: MonthlyTeamData = {
      monthKey,
      date: new Date().toISOString(),
      teamAchievement: teamData.teamAchievement,
      tier: teamData.tier.name,
      tierRate: teamData.tier.rate,
      tierColor: teamData.tier.color,
      teamSales: teamData.teamSales,
      teamTarget: teamData.target,
      totalPool: teamData.totalPool,
      totalStaff: teamData.staffCount,
      staff
    }

    saveTeamData(teamDataToSave)
  }

  const sortedResults = [...results].sort((a, b) => {
    const aVal = a[sortColumn]
    const bVal = b[sortColumn]
    const modifier = sortDirection === 'asc' ? 1 : -1
    return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * modifier
  })

  const handleSort = (column: keyof BulkResult) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const handleExportCSV = () => {
    if (results.length === 0) return

    let csv = 'Rank,Name,Packages,Sales (AED),Contribution %,Tier,P1 (AED),P2 (AED),Total Incentive (AED)\n'
    results.forEach((person, idx) => {
      csv += `${idx + 1},"${person.name}",${person.packages},${person.sales.toFixed(2)},${person.contribution.toFixed(2)},${person.tierName},${person.p1.toFixed(2)},${person.p2.toFixed(2)},${person.totalIncentive.toFixed(2)}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `incentive-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getViewTitle = () => {
    const monthNames: Record<string, string> = {
      'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
      'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
      'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
    }
    
    if (viewMode === 'monthly') {
      return `${monthNames[selectedMonth]} 20${selectedYear}`
    }
    
    const titles: Record<string, string> = {
      q1: 'Q1 (Jan-Mar)',
      q2: 'Q2 (Apr-Jun)',
      q3: 'Q3 (Jul-Sep)',
      q4: 'Q4 (Oct-Dec)',
      h1: 'H1 (Jan-Jun)',
      h2: 'H2 (Jul-Dec)',
      yearly: 'Full Year',
      alltime: 'All-Time'
    }
    
    return titles[viewMode]
  }

  const calculateNextTier = () => {
    if (!calculatedData) return null
    
    const sortedTiers = [...loadTiers()].sort((a, b) => a.min - b.min)
    const currentTierIndex = sortedTiers.findIndex(t => t.id === calculatedData.tier.id)
    
    if (calculatedData.tier.rate === 0) {
      const requiredSales = (75 / 100) * calculatedData.target
      const deficit = requiredSales - calculatedData.teamSales
      return {
        nextTierName: 'Tier 1',
        nextTierRate: sortedTiers[0].rate,
        requiredPercentage: 75,
        requiredSales,
        deficit,
        isMaxTier: false
      }
    } else if (currentTierIndex >= 0 && currentTierIndex < sortedTiers.length - 1) {
      const nextTier = sortedTiers[currentTierIndex + 1]
      const requiredPercentage = nextTier.min
      const requiredSales = (requiredPercentage / 100) * calculatedData.target
      const deficit = requiredSales - calculatedData.teamSales
      return {
        nextTierName: nextTier.name,
        nextTierRate: nextTier.rate,
        requiredPercentage,
        requiredSales,
        deficit,
        isMaxTier: false
      }
    } else {
      const highestTier = sortedTiers[currentTierIndex]
      const thresholdSales = (highestTier.min / 100) * calculatedData.target
      const thresholdPool = (highestTier.rate / 100) * thresholdSales
      const actualPool = (highestTier.rate / 100) * calculatedData.teamSales
      const extraIncentive = actualPool - thresholdPool
      
      return {
        isMaxTier: true,
        currentRate: calculatedData.tier.rate,
        thresholdPercentage: highestTier.min,
        thresholdSales,
        thresholdPool,
        extraIncentive
      }
    }
  }

  const nextTierInfo = calculateNextTier()

  return (
    <>
      {excelData.length > 0 && (
        <>
          <div className="form-grid" style={{marginTop: '0'}}>
            <div className="form-group">
              <label>Team Target (AED) <span style={{fontSize: '12px', color: 'var(--text-muted)'}}>Auto or Manual</span></label>
              <input 
                type="number"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={autoTarget > 0 ? `Auto: ${autoTarget}` : 'Auto-detected'}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Staff Count <span style={{fontSize: '12px', color: 'var(--text-muted)'}}>Auto-detected</span></label>
              <input 
                type="number"
                value={staffCount || ''}
                disabled
                style={{background: 'var(--bg-tertiary)'}}
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

          <button className="btn btn-primary btn-block" onClick={handleCalculate}>
            <span>Calculate Team Incentives</span>
            <span>→</span>
          </button>
        </>
      )}

      {results.length > 0 && calculatedData && (
        <div style={{marginTop: '24px'}}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px'
          }}>
            <span style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)'}}>
              Team Incentives - {getViewTitle()}
            </span>
          </div>

          <div style={{
            padding: '12px 16px',
            background: 'rgba(0, 206, 209, 0.08)',
            border: '1px solid rgba(0, 206, 209, 0.2)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '24px',
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            <strong style={{color: 'var(--accent-primary)'}}>Sheets used:</strong> {calculatedData.sheets.join(', ')}
          </div>

          <div className="summary-stats" style={{marginBottom: '32px'}}>
            <div className="stat-card">
              <div className="stat-label">Team Achievement</div>
              <div className="stat-value">{calculatedData.teamAchievement.toFixed(2)}<span className="stat-unit">%</span></div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Current Tier</div>
              <div className="stat-value" style={{fontSize: '18px'}}>{calculatedData.tier.name}</div>
              <div className="tier-badge" style={{
                background: `${calculatedData.tier.color}22`,
                color: calculatedData.tier.color,
                marginTop: '8px'
              }}>
                {calculatedData.tier.rate}% rate
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Pool</div>
              <div className="stat-value" style={{fontSize: '20px'}}>AED {formatCurrency(calculatedData.totalPool)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Staff Count</div>
              <div className="stat-value">{calculatedData.staffCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Team Target</div>
              <div className="stat-value" style={{fontSize: '18px'}}>AED {formatCurrency(calculatedData.target)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Team Sales</div>
              <div className="stat-value" style={{fontSize: '18px'}}>AED {formatCurrency(calculatedData.teamSales)}</div>
            </div>
            {calculatedData.totalClients > 0 && (
              <div className="stat-card">
                <div className="stat-label">Total Clients</div>
                <div className="stat-value" style={{fontSize: '20px', color: '#06b6d4'}}>{calculatedData.totalClients}</div>
              </div>
            )}
          </div>

          <div style={{overflowX: 'auto', marginBottom: '24px'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{borderBottom: '2px solid var(--border-color)'}}>
                  <th style={{...tableHeaderStyle, width: '40px'}}>Rank</th>
                  <th style={{...tableHeaderStyle, width: '40px'}}></th>
                  <th style={tableHeaderStyle} onClick={() => handleSort('name')}>
                    Name {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={tableHeaderStyle} onClick={() => handleSort('totalIncentive')}>
                    Total {sortColumn === 'totalIncentive' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={tableHeaderStyle} onClick={() => handleSort('packages')}>
                    Packages {sortColumn === 'packages' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={tableHeaderStyle} onClick={() => handleSort('clients')}>
                    Clients {sortColumn === 'clients' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={tableHeaderStyle} onClick={() => handleSort('sales')}>
                    Sales {sortColumn === 'sales' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{...tableHeaderStyle, fontSize: '12px', cursor: 'pointer'}} onClick={() => handleSort('workingDays')}>
                    Days {sortColumn === 'workingDays' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{...tableHeaderStyle, fontSize: '12px', cursor: 'pointer'}} onClick={() => handleSort('avgPackagesPerDay')}>
                    Packages/Day {sortColumn === 'avgPackagesPerDay' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{...tableHeaderStyle, fontSize: '12px', cursor: 'pointer'}} onClick={() => handleSort('avgSalesPerDay')}>
                    Sales/Day {sortColumn === 'avgSalesPerDay' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={tableHeaderStyle} onClick={() => handleSort('contribution')}>
                    % Share {sortColumn === 'contribution' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={tableHeaderStyle} onClick={() => handleSort('p1')}>
                    P1 {sortColumn === 'p1' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={tableHeaderStyle} onClick={() => handleSort('p2')}>
                    P2 {sortColumn === 'p2' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((person) => {
                  const originalRank = results.findIndex(r => r.name === person.name) + 1
                  let badge = ''
                  let rankStyle = ''
                  let rowBg = ''
                  
                  if (originalRank <= 3) {
                    if (originalRank === 1) badge = '🥇'
                    else if (originalRank === 2) badge = '🥈'
                    else if (originalRank === 3) badge = '🥉'
                    rankStyle = 'font-weight: 700; color: var(--accent-primary);'
                    rowBg = 'rgba(0, 206, 209, 0.05)'
                  }
                  
                  return (
                    <tr key={person.name} style={{borderBottom: '1px solid var(--border-color)', background: rowBg}}>
                      <td style={{...tableCellStyle, fontWeight: rankStyle ? '700' : 'normal', color: rankStyle ? 'var(--accent-primary)' : 'var(--text-secondary)'}}>
                        #{originalRank}
                      </td>
                      <td style={tableCellStyle}>{badge}</td>
                      <td style={{...tableCellStyle, fontWeight: rankStyle ? '700' : 'normal', color: rankStyle ? 'var(--accent-primary)' : 'var(--text-secondary)'}}>
                        {person.name}
                      </td>
                      <td style={{...tableCellStyle, fontWeight: rankStyle ? '700' : '600', color: rankStyle ? 'var(--accent-primary)' : 'var(--success)'}}>
                        AED {formatCurrency(person.totalIncentive)}
                      </td>
                      <td style={tableCellStyle}>{person.packages}</td>
                      <td style={tableCellStyle}>{person.clients || '-'}</td>
                      <td style={tableCellStyle}>AED {formatCurrency(person.sales)}</td>
                      <td style={{...tableCellStyle, fontSize: '13px', color: 'var(--text-muted)'}}>
                        {person.workingDays || 0}
                      </td>
                      <td style={{...tableCellStyle, fontSize: '13px', color: 'var(--text-secondary)'}}>
                        {person.avgPackagesPerDay.toFixed(2)}
                      </td>
                      <td style={{...tableCellStyle, fontSize: '13px', color: 'var(--text-secondary)'}}>
                        {formatCurrency(person.avgSalesPerDay)}
                      </td>
                      <td style={tableCellStyle}>{person.contribution.toFixed(2)}%</td>
                      <td style={tableCellStyle}>AED {formatCurrency(person.p1)}</td>
                      <td style={tableCellStyle}>AED {formatCurrency(person.p2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {nextTierInfo && (
            nextTierInfo.isMaxTier ? (
              <div style={{
                padding: '20px',
                background: 'rgba(0, 230, 118, 0.08)',
                border: '2px solid rgba(0, 230, 118, 0.3)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '24px'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                      <span style={{fontSize: '16px', fontWeight: '600', color: 'var(--success)'}}>Tier Ladder</span>
                </div>
                <div style={{fontSize: '24px', fontWeight: '700', color: 'var(--success)', marginBottom: '12px', fontFamily: "'JetBrains Mono', monospace"}}>
                  + AED {formatCurrency(nextTierInfo.extraIncentive)}
                </div>
                <div style={{fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6'}}>
                  Maximum tier achieved! Your team is at <strong>{calculatedData.teamAchievement.toFixed(2)}%</strong> achievement, 
                  earning an additional <strong>AED {formatCurrency(nextTierInfo.extraIncentive)}</strong> compared to 
                  the {nextTierInfo.thresholdPercentage}% threshold. Every extra sale continues to increase the incentive pool 
                  at the maximum {nextTierInfo.currentRate}% rate.
                </div>
              </div>
            ) : (
              <div style={{
                padding: '20px',
                background: 'var(--bg-tertiary)',
                border: '2px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '24px'
              }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                      <span style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)'}}>Tier Ladder</span>
                </div>
                <div style={{fontSize: '24px', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '12px', fontFamily: "'JetBrains Mono', monospace"}}>
                  AED {formatCurrency(nextTierInfo.deficit)}
                </div>
                <div style={{fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6'}}>
                  Team needs an additional <strong>AED {formatCurrency(nextTierInfo.deficit)}</strong> in sales to reach{' '}
                  <strong>AED {formatCurrency(nextTierInfo.requiredSales)}</strong> ({nextTierInfo.requiredPercentage}% of target) and qualify for{' '}
                  {nextTierInfo.nextTierName} incentive ({nextTierInfo.nextTierRate}% rate).
                </div>
              </div>
            )
          )}

          <div style={{display: 'flex', gap: '12px'}}>
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              <><DownloadIcon />Download CSV</>
            </button>
            <button className="btn btn-secondary" onClick={() => exportBulkToPDF(calculatedData, results)}>
              <><DownloadIcon />Download PDF</>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

const tableHeaderStyle: React.CSSProperties = {
  padding: '12px',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: '600',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  userSelect: 'none'
}

const tableCellStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: '13px',
  color: 'var(--text-secondary)',
  fontFamily: "'JetBrains Mono', monospace"
}
