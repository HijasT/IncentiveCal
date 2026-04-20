'use client'
import { useState, useEffect } from 'react'
import { parseExcelFile, getAvailableMonths, aggregateSheets, type ExcelData, type StaffData } from '@/lib/excelUtils'
import { calculateIncentive, formatCurrency, type CalculationResult } from '@/lib/utils'

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
  const [sortColumn, setSortColumn] = useState<keyof BulkResult>('sales')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [isProcessing, setIsProcessing] = useState(false)
  const [xlsxLoaded, setXlsxLoaded] = useState(false)

  // Check if XLSX library is loaded
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
      
      // Extract years from sheet names
      const years = [...new Set(data.map(d => d.sheetName.split(' ')[1] || d.sheetName.slice(-2)))].sort()
      setAvailableYears(years)
      
      // Auto-select current month and year
      const now = new Date()
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const currentMonth = monthNames[now.getMonth()]
      const currentYear = now.getFullYear().toString().slice(-2)
      
      setSelectedMonth(currentMonth)
      if (years.includes(currentYear)) {
        setSelectedYear(currentYear)
      } else {
        setSelectedYear(years[years.length - 1]) // Most recent year
      }
    } catch (error) {
      console.error('Error parsing Excel:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      alert(`Error parsing Excel file: ${errorMsg}\n\nPlease make sure:\n1. File is a valid .xlsx file\n2. File has month sheets (e.g., "Jun25", "Jul25")\n3. File follows the expected format`)
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

    // Set auto-detected target and staff count
    setAutoTarget(aggregated.target)
    setStaffCount(aggregated.staff.length)

    const finalTarget = target ? parseFloat(target) : aggregated.target
    
    if (!finalTarget || finalTarget <= 0) {
      alert('Invalid target. Enter manually or check Excel')
      return
    }

    const teamSales = aggregated.teamTotal.sales
    const calc = calculateIncentive(finalTarget, teamSales, 0, aggregated.staff.length, p1Split)

    // Calculate for each staff member
    const bulkResults: BulkResult[] = aggregated.staff.map(person => {
      const personCalc = calculateIncentive(finalTarget, teamSales, person.sales, aggregated.staff.length, p1Split)
      
      return {
        name: person.name,
        packages: person.packages,
        sales: person.sales,
        achievement: calc.teamAchievement,
        tierName: calc.tier.name,
        tierRate: calc.tier.rate,
        totalIncentive: personCalc.myTotal,
        p1: personCalc.myP1,
        p2: personCalc.myP2,
        contribution: personCalc.myContribution
      }
    })

    setResults(bulkResults)
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
    sortedResults.forEach((person, idx) => {
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

  const topPerformers = sortedResults.slice(0, 3)
  const teamTotal = results.reduce((sum, r) => sum + r.totalIncentive, 0)

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

      {/* File Upload */}
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

      {/* Controls (shown after upload) */}
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

      {/* Results */}
      {results.length > 0 && (
        <div style={{marginTop: '24px'}}>
          {/* Top Performers */}
          <div style={{marginBottom: '24px'}}>
            <h3 style={{color: 'var(--text-primary)', fontSize: '16px', marginBottom: '12px'}}>🏆 Top Performers</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px'}}>
              {topPerformers.map((person, idx) => (
                <div key={person.name} style={{
                  padding: '16px',
                  background: idx === 0 ? 'rgba(255, 215, 0, 0.1)' : idx === 1 ? 'rgba(192, 192, 192, 0.1)' : 'rgba(205, 127, 50, 0.1)',
                  border: `2px solid ${idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32'}`,
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{fontSize: '32px', marginBottom: '8px'}}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </div>
                  <div style={{fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px'}}>
                    {person.name}
                  </div>
                  <div style={{fontSize: '20px', fontWeight: '700', color: 'var(--success)', fontFamily: "'JetBrains Mono', monospace"}}>
                    AED {formatCurrency(person.totalIncentive)}
                  </div>
                  <div style={{fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px'}}>
                    Sales: AED {formatCurrency(person.sales)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="results-grid" style={{marginBottom: '24px'}}>
            <div className="result-card">
              <div className="result-label">Team Total</div>
              <div className="result-value" style={{fontSize: '20px'}}>AED {formatCurrency(teamTotal)}</div>
            </div>
            <div className="result-card">
              <div className="result-label">Staff Count</div>
              <div className="result-value">{results.length}</div>
            </div>
            <div className="result-card">
              <div className="result-label">Avg per Person</div>
              <div className="result-value" style={{fontSize: '20px'}}>AED {formatCurrency(teamTotal / results.length)}</div>
            </div>
          </div>

          {/* Export Button */}
          <div style={{marginBottom: '16px'}}>
            <button className="btn btn-secondary" onClick={handleExportCSV}>
              <span>📥 Export to CSV</span>
            </button>
          </div>

          {/* Results Table */}
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{borderBottom: '2px solid var(--border-color)'}}>
                  <th style={tableHeaderStyle} onClick={() => handleSort('name')}>
                    Name {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={tableHeaderStyle} onClick={() => handleSort('packages')}>
                    Packages {sortColumn === 'packages' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={tableHeaderStyle} onClick={() => handleSort('sales')}>
                    Sales {sortColumn === 'sales' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={tableHeaderStyle} onClick={() => handleSort('contribution')}>
                    Contribution % {sortColumn === 'contribution' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={tableHeaderStyle} onClick={() => handleSort('tierName')}>
                    Tier {sortColumn === 'tierName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={tableHeaderStyle} onClick={() => handleSort('p1')}>
                    P1 {sortColumn === 'p1' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={tableHeaderStyle} onClick={() => handleSort('p2')}>
                    P2 {sortColumn === 'p2' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={tableHeaderStyle} onClick={() => handleSort('totalIncentive')}>
                    Total {sortColumn === 'totalIncentive' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((person, idx) => (
                  <tr key={person.name} style={{
                    borderBottom: '1px solid var(--border-color)',
                    background: idx < 3 ? 'rgba(0, 206, 209, 0.05)' : 'transparent'
                  }}>
                    <td style={tableCellStyle}>
                      {idx < 3 && <span style={{marginRight: '8px'}}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>}
                      {person.name}
                    </td>
                    <td style={tableCellStyle}>{person.packages}</td>
                    <td style={tableCellStyle}>{formatCurrency(person.sales)}</td>
                    <td style={tableCellStyle}>{person.contribution.toFixed(2)}%</td>
                    <td style={tableCellStyle}>{person.tierName}</td>
                    <td style={tableCellStyle}>{formatCurrency(person.p1)}</td>
                    <td style={tableCellStyle}>{formatCurrency(person.p2)}</td>
                    <td style={{...tableCellStyle, fontWeight: '600', color: 'var(--success)'}}>
                      {formatCurrency(person.totalIncentive)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
