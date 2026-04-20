'use client'
import { useState, useEffect } from 'react'
import { parseExcelFile, getAvailableMonths, aggregateSheets, type ExcelData, type StaffData } from '@/lib/excelUtils'
import { calculateIncentive, formatCurrency, getTier, DEFAULT_TIERS, type Tier } from '@/lib/utils'

interface BulkResult extends StaffData {
  achievement: number
  tierName: string
  tierRate: number
  totalIncentive: number
  p1: number
  p2: number
  contribution: number
}

type ViewMode = 'monthly' | 'q1' | 'q2' | 'q3' | 'q4' | 'yearly' | 'alltime'

export function BulkTab() {
  const [file, setFile] = useState<File | null>(null)
  const [excelData, setExcelData] = useState<ExcelData[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('monthly')
  const [selectedMonth, setSelectedMonth] = useState('Jun')
  const [selectedYear, setSelectedYear] = useState('')
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [target, setTarget] = useState('')
  const [autoTarget, setAutoTarget] = useState(0)
  const [staffCount, setStaffCount] = useState(0)
  const [p1Split, setP1Split] = useState(60)
  const [results, setResults] = useState<BulkResult[]>([])
  const [calculatedData, setCalculatedData] = useState<any>(null)
  const [sortColumn, setSortColumn] = useState<keyof BulkResult>('sales')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [isProcessing, setIsProcessing] = useState(false)
  const [xlsxLoaded, setXlsxLoaded] = useState(false)

  useEffect(() => {
    const checkXLSX = () => {
      if ((window as any).XLSX) {
        setXlsxLoaded(true)
      } else {
        setTimeout(checkXLSX, 100)
      }
    }
    checkXLSX()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return

    if (!(window as any).XLSX) {
      alert('Excel library is still loading. Please wait a moment and try again.')
      return
    }

    setFile(uploadedFile)
    setIsProcessing(true)

    try {
      const data = await parseExcelFile(uploadedFile)
      setExcelData(data)
      
      const years = [...new Set(data.map(d => d.sheetName.split(' ')[1] || d.sheetName.slice(-2)))].sort()
      setAvailableYears(years)
      
      const now = new Date()
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const currentMonth = monthNames[now.getMonth()]
      const currentYear = now.getFullYear().toString().slice(-2)
      
      setSelectedMonth(currentMonth)
      if (years.includes(currentYear)) {
        setSelectedYear(currentYear)
      } else {
        setSelectedYear(years[years.length - 1])
      }
    } catch (error) {
      console.error('Error parsing Excel:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      alert(`Error parsing Excel file: ${errorMsg}`)
    } finally {
      setIsProcessing(false)
    }
  }

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
      q4: ['Oct', 'Nov', 'Dec']
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

    // Calculate for each staff member - SORT BY SALES for rankings
    const bulkResults: BulkResult[] = aggregated.staff.map(person => {
      const personCalc = calculateIncentive(finalTarget, teamSales, person.sales, aggregated.staff.length, p1Split)
      
      return {
        name: person.name,
        packages: person.packages,
        sales: person.sales,
        achievement: teamAchievement,
        tierName: tier.name,
        tierRate: tier.rate,
        totalIncentive: personCalc.myTotal,
        p1: personCalc.myP1,
        p2: personCalc.myP2,
        contribution: personCalc.myContribution
      }
    })

    // Sort by SALES (highest first) for rankings
    bulkResults.sort((a, b) => b.sales - a.sales)

    setResults(bulkResults)
    setCalculatedData({
      teamAchievement,
      tier,
      totalPool,
      target: finalTarget,
      teamSales,
      teamPackages: aggregated.teamTotal.packages,
      staffCount: aggregated.staff.length,
      sheets: sheets.map(s => s.sheetName),
      viewMode
    })
    setSortColumn('sales')
    setSortDirection('desc')
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
      yearly: 'Full Year',
      alltime: 'All-Time'
    }
    
    return titles[viewMode]
  }

  const calculateNextTier = () => {
    if (!calculatedData) return null
    
    const sortedTiers = [...DEFAULT_TIERS].sort((a, b) => a.min - b.min)
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

  return (
    <section className="card">
      <div className="privacy-notice">
        <span className="privacy-icon">🔒</span>
        <span>100% local calculation • No data shared • Browser-only processing • Your data stays private</span>
      </div>

      <div className="card-header">
        <h2 className="card-title">Team Incentive Analysis</h2>
        <div className="card-description">
          Upload your sales tracking Excel file to automatically calculate team incentives with rankings and downloadable reports.
        </div>
      </div>

      <div className="form-group">
        <label>Upload Sales Tracker Excel (.xlsx)</label>
        <input 
          id="bulk-file" 
          type="file" 
          accept=".xlsx,.xls" 
          onChange={handleFileUpload}
          disabled={isProcessing || !xlsxLoaded}
        />
        {!xlsxLoaded && (
          <div style={{marginTop: '8px', fontSize: '13px', color: 'var(--warning)'}}>
            ⏳ Loading Excel library...
          </div>
        )}
        {file && (
          <div style={{marginTop: '8px', fontSize: '13px', color: 'var(--success)'}}>
            ✓ {file.name} loaded ({excelData.length} sheets found)
          </div>
        )}
        {isProcessing && (
          <div style={{marginTop: '8px', fontSize: '13px', color: 'var(--accent-primary)'}}>
            📂 Processing Excel file...
          </div>
        )}
      </div>

      {excelData.length > 0 && (
        <>
          <div className="form-grid" style={{marginTop: '24px'}}>
            <div className="form-group">
              <label>View Mode</label>
              <select value={viewMode} onChange={(e) => setViewMode(e.target.value as ViewMode)}>
                <option value="monthly">Monthly</option>
                <option value="q1">Q1 (Jan-Mar)</option>
                <option value="q2">Q2 (Apr-Jun)</option>
                <option value="q3">Q3 (Jul-Sep)</option>
                <option value="q4">Q4 (Oct-Dec)</option>
                <option value="yearly">Yearly</option>
                <option value="alltime">All-Time</option>
              </select>
            </div>

            {viewMode === 'monthly' && (
              <div className="form-group">
                <label>Month</label>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                  <option value="Jan">January</option>
                  <option value="Feb">February</option>
                  <option value="Mar">March</option>
                  <option value="Apr">April</option>
                  <option value="May">May</option>
                  <option value="Jun">June</option>
                  <option value="Jul">July</option>
                  <option value="Aug">August</option>
                  <option value="Sep">September</option>
                  <option value="Oct">October</option>
                  <option value="Nov">November</option>
                  <option value="Dec">December</option>
                </select>
              </div>
            )}

            {viewMode !== 'alltime' && (
              <div className="form-group">
                <label>Year</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                  {availableYears.map(year => (
                    <option key={year} value={year}>20{year}</option>
                  ))}
                </select>
              </div>
            )}

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
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px'
          }}>
            <span style={{fontSize: '24px'}}>💰</span>
            <span style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)'}}>
              Team Incentives - {getViewTitle()}
            </span>
          </div>

          {/* Sheet Names Debug Info */}
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

          {/* Summary Stats */}
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
          </div>

          {/* Results Table */}
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
                    💰 Total Incentive {sortColumn === 'totalIncentive' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={tableHeaderStyle} onClick={() => handleSort('packages')}>
                    📦 Packages {sortColumn === 'packages' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={tableHeaderStyle} onClick={() => handleSort('sales')}>
                    💵 Sales {sortColumn === 'sales' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                {sortedResults.map((person, idx) => {
                  // Find original rank based on sales
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
                      <td style={{...tableCellStyle, ...{fontWeight: rankStyle ? '700' : 'normal', color: rankStyle ? 'var(--accent-primary)' : 'var(--text-secondary)'}}>
                        #{originalRank}
                      </td>
                      <td style={tableCellStyle}>{badge}</td>
                      <td style={{...tableCellStyle, ...{fontWeight: rankStyle ? '700' : 'normal', color: rankStyle ? 'var(--accent-primary)' : 'var(--text-secondary)'}}>
                        {person.name}
                      </td>
                      <td style={{...tableCellStyle, ...{fontWeight: rankStyle ? '700' : '600', color: rankStyle ? 'var(--accent-primary)' : 'var(--success)'}}>
                        AED {formatCurrency(person.totalIncentive)}
                      </td>
                      <td style={tableCellStyle}>{person.packages}</td>
                      <td style={tableCellStyle}>AED {formatCurrency(person.sales)}</td>
                      <td style={tableCellStyle}>{person.contribution.toFixed(2)}%</td>
                      <td style={tableCellStyle}>AED {formatCurrency(person.p1)}</td>
                      <td style={tableCellStyle}>AED {formatCurrency(person.p2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Tier Ladder */}
          {(() => {
            const nextTierInfo = calculateNextTier()
            if (!nextTierInfo) return null
            
            if (nextTierInfo.isMaxTier) {
              return (
                <div style={{
                  padding: '20px',
                  background: 'rgba(0, 230, 118, 0.08)',
                  border: '2px solid rgba(0, 230, 118, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '24px'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                    <span style={{fontSize: '20px'}}>🎉</span>
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
              )
            } else {
              const message = calculatedData.tier.rate === 0
                ? `Team needs an additional <strong>AED ${formatCurrency(nextTierInfo.deficit)}</strong> in sales to reach <strong>AED ${formatCurrency(nextTierInfo.requiredSales)}</strong> (${nextTierInfo.requiredPercentage}% of target) and qualify for ${nextTierInfo.nextTierName} incentive (${nextTierInfo.nextTierRate}% rate).`
                : `Team needs an additional <strong>AED ${formatCurrency(nextTierInfo.deficit)}</strong> in sales to reach <strong>AED ${formatCurrency(nextTierInfo.requiredSales)}</strong> (${nextTierInfo.requiredPercentage}% of target) and qualify for ${nextTierInfo.nextTierName} incentive (${nextTierInfo.nextTierRate}% rate).`
              
              return (
                <div style={{
                  padding: '20px',
                  background: 'var(--bg-tertiary)',
                  border: '2px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '24px'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
                    <span style={{fontSize: '20px'}}>🎯</span>
                    <span style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)'}}>Tier Ladder</span>
                  </div>
                  <div style={{fontSize: '24px', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '12px', fontFamily: "'JetBrains Mono', monospace"}}>
                    AED {formatCurrency(nextTierInfo.deficit)}
                  </div>
                  <div style={{fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6'}} dangerouslySetInnerHTML={{__html: message}} />
                </div>
              )
            }
          })()}

          {/* Export Buttons */}
          <div style={{display: 'flex', gap: '12px'}}>
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              <span>📄 Download CSV</span>
            </button>
          </div>
        </div>
      )}
    </section>
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
