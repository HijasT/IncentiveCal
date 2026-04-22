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
  getBadgeInfo,
  saveTeamData,
  getAvailableYearsFromHistory,
  type MonthlyTeamData,
  type StaffResult
} from '@/lib/analyticsUtils'
import { parseExcelFile, aggregateSheets, type ExcelData } from '@/lib/excelUtils'
import { calculateIncentive, formatCurrency, getTier } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { exportAnalyticsToPDF } from '@/lib/pdfUtils'

type ViewMode = 'monthly' | 'q1' | 'q2' | 'q3' | 'q4' | 'h1' | 'h2' | 'yearly' | 'alltime'

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
  
  // Excel upload state
  const [file, setFile] = useState<File | null>(null)
  const [excelData, setExcelData] = useState<ExcelData[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('monthly')
  const [selectedMonth, setSelectedMonth] = useState('Jun')
  const [selectedYear, setSelectedYear] = useState('')
  const [availableYears, setAvailableYears] = useState<string[]>([])
  const [target, setTarget] = useState('')
  const [p1Split, setP1Split] = useState(60)
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
    const history = getTeamHistory()
    setTeamHistory(history)
    
    // Get available years from history
    if (history.length > 0 && availableYears.length === 0) {
      const years = getAvailableYearsFromHistory()
      setAvailableYears(years)
      if (years.length > 0 && !selectedYear) {
        setSelectedYear(years[years.length - 1])
      }
    }
    
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
      alert(`Error parsing Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

  const handleCalculateFromExcel = () => {
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

    const finalTarget = target ? parseFloat(target) : aggregated.target
    
    if (!finalTarget || finalTarget <= 0) {
      alert('Invalid target. Enter manually or check Excel')
      return
    }

    const teamSales = aggregated.teamTotal.sales
    const teamAchievement = (teamSales / finalTarget) * 100
    const tier = getTier(teamAchievement)
    const totalPool = (tier.rate / 100) * teamSales

    const bulkResults = aggregated.staff.map((person, index) => {
      const personCalc = calculateIncentive(finalTarget, teamSales, person.sales, aggregated.staff.length, p1Split)
      return {
        name: person.name,
        packages: person.packages,
        sales: person.sales,
        totalIncentive: personCalc.myTotal,
        rank: index + 1,
        contribution: personCalc.myContribution,
        p1: personCalc.myP1,
        p2: personCalc.myP2
      }
    })

    bulkResults.sort((a, b) => b.sales - a.sales)

    // Save only for monthly view
    if (viewMode === 'monthly') {
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
        teamAchievement,
        tier: tier.name,
        tierRate: tier.rate,
        tierColor: tier.color,
        teamSales,
        teamTarget: finalTarget,
        totalPool,
        totalStaff: aggregated.staff.length,
        staff
      }

      saveTeamData(teamDataToSave)
      loadData() // Reload to show new data
      alert('✓ Data saved to analytics!')
    } else {
      alert('✓ Calculated! Note: Only Monthly view saves to analytics history.')
    }
  }

  const getAggregatedPersonalData = () => {
    if (!selectedPersonName || personalHistory.length === 0) return null

    // Filter history based on view mode
    let filteredHistory = [...personalHistory]
    
    if (viewMode === 'monthly') {
      const monthKey = `${selectedYear && selectedYear.length === 2 ? '20' + selectedYear : selectedYear}-${String(
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(selectedMonth) + 1
      ).padStart(2, '0')}`
      filteredHistory = personalHistory.filter(h => h.monthKey === monthKey)
    } else if (viewMode !== 'alltime') {
      const year = selectedYear && selectedYear.length === 2 ? '20' + selectedYear : selectedYear
      const quarters: Record<string, number[]> = {
        q1: [1, 2, 3],
        q2: [4, 5, 6],
        q3: [7, 8, 9],
        q4: [10, 11, 12],
        h1: [1, 2, 3, 4, 5, 6],
        h2: [7, 8, 9, 10, 11, 12],
        yearly: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      }
      
      const months = quarters[viewMode] || []
      filteredHistory = personalHistory.filter(h => {
        const [y, m] = h.monthKey.split('-')
        return y === year && months.includes(parseInt(m))
      })
    }

    if (filteredHistory.length === 0) return null

    // Aggregate data
    const totalEarnings = filteredHistory.reduce((sum, h) => sum + h.totalEarnings, 0)
    const totalSales = filteredHistory.reduce((sum, h) => sum + h.sales, 0)
    const totalPackages = filteredHistory.reduce((sum, h) => sum + h.packages, 0)
    const avgAchievement = filteredHistory.reduce((sum, h) => sum + h.achievement, 0) / filteredHistory.length
    const avgRank = Math.round(filteredHistory.reduce((sum, h) => sum + h.rank, 0) / filteredHistory.length)
    
    return {
      totalEarnings,
      totalSales,
      totalPackages,
      avgAchievement,
      avgRank,
      monthCount: filteredHistory.length,
      bestMonth: filteredHistory.reduce((best, h) => h.achievement > best.achievement ? h : best),
      history: filteredHistory
    }
  }

  const aggregatedData = getAggregatedPersonalData()
  const chartData = personalHistory.slice(-6).map(m => ({
    month: m.monthKey.substring(5),
    achievement: m.achievement,
    earnings: m.totalEarnings / 1000
  }))

  if (teamHistory.length === 0 && excelData.length === 0) {
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
            Calculate team incentives in Bulk mode (Monthly view) or upload Excel here to start tracking.
          </p>
        </div>

        <div style={{marginTop: '24px'}}>
          <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '12px'}}>Or Upload Excel Directly</h3>
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            onChange={handleFileUpload}
            disabled={!xlsxLoaded}
          />
          {!xlsxLoaded && <p style={{fontSize: '12px', color: 'var(--warning)', marginTop: '8px'}}>⏳ Loading Excel library...</p>}
        </div>
      </section>
    )
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Performance Analytics</h2>
        <div className="card-description">
          Track your progress, spot trends, and unlock achievements.
        </div>
      </div>

      {/* Excel Upload Section */}
      <div style={{marginBottom: '24px', padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
        <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)'}}>
          📂 Upload Excel for Analysis
        </h3>
        <input 
          type="file" 
          accept=".xlsx,.xls" 
          onChange={handleFileUpload}
          disabled={!xlsxLoaded || isProcessing}
          style={{marginBottom: '12px'}}
        />
        {file && (
          <div style={{fontSize: '13px', color: 'var(--success)', marginBottom: '12px'}}>
            ✓ {file.name} ({excelData.length} sheets)
          </div>
        )}

        {excelData.length > 0 && (
          <div>
            <div className="form-grid" style={{marginBottom: '12px'}}>
              <div className="form-group">
                <label>View Mode</label>
                <select value={viewMode} onChange={(e) => setViewMode(e.target.value as ViewMode)}>
                  <option value="monthly">Monthly</option>
                  <option value="q1">Q1 (Jan-Mar)</option>
                  <option value="q2">Q2 (Apr-Jun)</option>
                  <option value="q3">Q3 (Jul-Sep)</option>
                  <option value="q4">Q4 (Oct-Dec)</option>
                  <option value="h1">H1 (Jan-Jun)</option>
                  <option value="h2">H2 (Jul-Dec)</option>
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
            </div>
            <button className="btn btn-primary" onClick={handleCalculateFromExcel}>
              Calculate & Save
            </button>
          </div>
        )}
      </div>

      {/* Name Selector */}
      {teamHistory.length > 0 && (
        <>
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

          {/* View Mode for Analytics Display */}
          <div style={{marginBottom: '24px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px'}}>Analytics View Period</label>
            <select 
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '10px',
                fontSize: '14px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="monthly">Monthly View</option>
              <option value="q1">Q1 View (Jan-Mar)</option>
              <option value="q2">Q2 View (Apr-Jun)</option>
              <option value="q3">Q3 View (Jul-Sep)</option>
              <option value="q4">Q4 View (Oct-Dec)</option>
              <option value="h1">H1 View (Jan-Jun)</option>
              <option value="h2">H2 View (Jul-Dec)</option>
              <option value="yearly">Yearly View</option>
              <option value="alltime">All-Time View</option>
            </select>

            {viewMode === 'monthly' && (
              <div style={{display: 'flex', gap: '12px', marginTop: '12px'}}>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{padding: '8px', fontSize: '13px'}}>
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
                {availableYears.length > 0 && (
                  <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{padding: '8px', fontSize: '13px'}}>
                    {availableYears.map(year => (
                      <option key={year} value={year}>20{year}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {viewMode !== 'alltime' && viewMode !== 'monthly' && availableYears.length > 0 && (
              <div style={{marginTop: '12px'}}>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{padding: '8px', fontSize: '13px'}}>
                  {availableYears.map(year => (
                    <option key={year} value={year}>20{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Team Overview or Personal Analytics */}
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

          {selectedPersonName && aggregatedData && (
            <div>
              <div style={{padding: '24px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '32px', border: '2px solid var(--border-color)'}}>
                <h3 style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px'}}>
                  {viewMode === 'monthly' ? '⏱️ Monthly' : viewMode === 'alltime' ? '📊 All-Time' : `📈 ${viewMode.toUpperCase()}`} Performance
                </h3>

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px'}}>
                  <div style={{padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)'}}>
                    <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Total Earnings</div>
                    <div style={{fontSize: '20px', fontWeight: '700', color: 'var(--success)'}}>AED {formatCurrency(aggregatedData.totalEarnings)}</div>
                  </div>
                  
                  <div style={{padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)'}}>
                    <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Total Sales</div>
                    <div style={{fontSize: '20px', fontWeight: '700', color: 'var(--accent-primary)'}}>AED {formatCurrency(aggregatedData.totalSales)}</div>
                  </div>

                  <div style={{padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)'}}>
                    <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Avg Achievement</div>
                    <div style={{fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)'}}>{aggregatedData.avgAchievement.toFixed(1)}%</div>
                  </div>

                  <div style={{padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)'}}>
                    <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Avg Rank</div>
                    <div style={{fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)'}}>#{aggregatedData.avgRank}</div>
                  </div>

                  <div style={{padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)'}}>
                    <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Months Included</div>
                    <div style={{fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)'}}>{aggregatedData.monthCount}</div>
                  </div>
                </div>
              </div>

              {personalHistory.length > 0 && (
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
              )}

              {lifetimeStats && (
                <div style={{marginBottom: '32px'}}>
                  <h3 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px'}}>
                    🏆 Career Highlights (All-Time)
                  </h3>
                  <div style={{padding: '24px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
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
                        <span style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Best Month</span>
                        <span style={{fontSize: '13px', fontWeight: '600', color: 'var(--success)'}}>
                          {lifetimeStats.bestMonth.achievement.toFixed(1)}% • {lifetimeStats.bestMonth.monthKey}
                        </span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0'}}>
                        <span style={{fontSize: '13px', color: 'var(--text-secondary)'}}>Current Streak</span>
                        <span style={{fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)'}}>
                          {lifetimeStats.currentStreak > 0 ? `🔥 ${lifetimeStats.currentStreak} months` : 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
        </>
      )}
    </section>
  )
}
