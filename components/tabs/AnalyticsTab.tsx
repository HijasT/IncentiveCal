'use client'
import { useState, useEffect } from 'react'
import { parseExcelFile, aggregateSheets, type ExcelData } from '@/lib/excelUtils'
import { calculateIncentive, formatCurrency, getTier } from '@/lib/utils'
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface CalculatedResult {
  name: string
  sales: number
  packages: number
  workingDays: number
  totalIncentive: number
  rank: number
  contribution: number
  p1: number
  p2: number
  avgSalesPerDay: number
  avgPackagesPerDay: number
}

type ViewMode = 'monthly' | 'q1' | 'q2' | 'q3' | 'q4' | 'h1' | 'h2' | 'yearly' | 'overall'

const COLORS = ['#ff9800', '#2196f3', '#9c27b0', '#4caf50', '#f44336', '#00bcd4', '#ff5722', '#795548']

export function AnalyticsTab() {
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
  
  const [results, setResults] = useState<CalculatedResult[]>([])
  const [calculatedData, setCalculatedData] = useState<any>(null)
  const [selectedName, setSelectedName] = useState<string>('')
  const [activeChart, setActiveChart] = useState<'sales' | 'packages'>('sales')

  useEffect(() => {
    const checkXLSX = () => {
      if ((window as any).XLSX) {
        setXlsxLoaded(true)
      } else {
        setTimeout(checkXLSX, 100)
      }
    }
    checkXLSX()
    
    const now = new Date()
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    setSelectedMonth(monthNames[now.getMonth()])
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
    setResults([])
    setCalculatedData(null)
    setSelectedName('')

    try {
      const data = await parseExcelFile(uploadedFile)
      setExcelData(data)
      
      const years = [...new Set(data.map(d => d.sheetName.split(' ')[1] || d.sheetName.slice(-2)))].sort()
      setAvailableYears(years)
      
      const currentYear = new Date().getFullYear().toString().slice(-2)
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
    
    if (viewMode === 'overall') {
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

  const getViewTitle = () => {
    if (viewMode === 'monthly') return `${selectedMonth} 20${selectedYear}`
    
    const titles: Record<string, string> = {
      q1: 'Q1 (Jan-Mar)',
      q2: 'Q2 (Apr-Jun)',
      q3: 'Q3 (Jul-Sep)',
      q4: 'Q4 (Oct-Dec)',
      h1: 'H1 (Jan-Jun)',
      h2: 'H2 (Jul-Dec)',
      yearly: `Full Year 20${selectedYear}`,
      overall: 'All-Time'
    }
    
    return titles[viewMode] || viewMode
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

    const finalTarget = target ? parseFloat(target) : aggregated.target
    
    if (!finalTarget || finalTarget <= 0) {
      alert('Invalid target. Enter manually or check Excel')
      return
    }

    const teamSales = aggregated.teamTotal.sales
    const teamAchievement = (teamSales / finalTarget) * 100
    const tier = getTier(teamAchievement)
    const totalPool = (tier.rate / 100) * teamSales

    const calculatedResults = aggregated.staff.map((person, index) => {
      const personCalc = calculateIncentive(finalTarget, teamSales, person.sales, aggregated.staff.length, p1Split)
      const workDays = person.workingDays || 1
      
      return {
        name: person.name,
        packages: person.packages,
        sales: person.sales,
        workingDays: person.workingDays || 1,
        totalIncentive: personCalc.myTotal,
        rank: index + 1,
        contribution: personCalc.myContribution,
        p1: personCalc.myP1,
        p2: personCalc.myP2,
        avgSalesPerDay: person.sales / workDays,
        avgPackagesPerDay: person.packages / workDays
      }
    })

    calculatedResults.sort((a, b) => b.sales - a.sales)
    calculatedResults.forEach((r, i) => r.rank = i + 1)

    setResults(calculatedResults)
    setCalculatedData({
      teamAchievement,
      tier,
      totalPool,
      target: finalTarget,
      teamSales,
      staffCount: aggregated.staff.length,
      viewTitle: getViewTitle(),
      sheetCount: sheets.length
    })
  }

  const getPersonalData = () => {
    if (!selectedName || !results.length) return null
    
    const person = results.find(r => r.name.toLowerCase().includes(selectedName.toLowerCase()))
    if (!person) return null

    return {
      ...person,
      achievement: calculatedData.teamAchievement,
      tier: calculatedData.tier,
      totalStaff: calculatedData.staffCount
    }
  }

  const personalData = getPersonalData()

  // Prepare chart data
  const salesChartData = results.slice(0, 10).map(r => ({
    name: r.name.split(' ')[0],
    sales: r.sales,
    packages: r.packages
  }))

  const packagesChartData = results.slice(0, 10).map(r => ({
    name: r.name.split(' ')[0],
    packages: r.packages,
    sales: r.sales
  }))

  const scatterData = results.map(r => ({
    name: r.name,
    packages: r.packages,
    sales: r.sales
  }))

  const avgSalesData = results.slice(0, 10).map(r => ({
    name: r.name.split(' ')[0],
    avgSales: r.avgSalesPerDay,
    avgPackages: r.avgPackagesPerDay
  }))

  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">📊 Analytics Dashboard</h2>
        <div className="card-description">
          Upload Excel, calculate, and visualize performance with interactive charts across multiple periods.
        </div>
      </div>

      {/* Upload Section */}
      <div style={{marginBottom: '24px', padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
        <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-primary)'}}>
          📂 Upload Excel
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
                <label>View Period</label>
                <select value={viewMode} onChange={(e) => setViewMode(e.target.value as ViewMode)}>
                  <option value="monthly">Monthly</option>
                  <option value="q1">Q1 (Jan-Mar)</option>
                  <option value="q2">Q2 (Apr-Jun)</option>
                  <option value="q3">Q3 (Jul-Sep)</option>
                  <option value="q4">Q4 (Oct-Dec)</option>
                  <option value="h1">H1 (Jan-Jun)</option>
                  <option value="h2">H2 (Jul-Dec)</option>
                  <option value="yearly">Annual</option>
                  <option value="overall">Overall (All-Time)</option>
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

              {viewMode !== 'overall' && (
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
                <label>Target (Optional)</label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="Auto-detect"
                />
              </div>

              <div className="form-group">
                <label>P1 Split: {p1Split}%</label>
                <input
                  type="range"
                  min="50"
                  max="70"
                  value={p1Split}
                  onChange={(e) => setP1Split(Number(e.target.value))}
                />
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleCalculate}>
              Calculate & Analyze
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {calculatedData && results.length > 0 && (
        <div>
          {/* Summary Cards */}
          <div style={{marginBottom: '24px'}}>
            <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '12px'}}>
              {calculatedData.viewTitle} Summary
              {calculatedData.sheetCount > 1 && (
                <span style={{fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px'}}>
                  ({calculatedData.sheetCount} months aggregated)
                </span>
              )}
            </h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px'}}>
              <div style={{padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Achievement</div>
                <div style={{fontSize: '24px', fontWeight: '700', color: calculatedData.teamAchievement >= 100 ? 'var(--success)' : 'var(--warning)'}}>
                  {calculatedData.teamAchievement.toFixed(1)}%
                </div>
              </div>

              <div style={{padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Tier</div>
                <div style={{fontSize: '20px', fontWeight: '700', color: calculatedData.tier.color}}>
                  {calculatedData.tier.name}
                </div>
              </div>

              <div style={{padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Total Pool</div>
                <div style={{fontSize: '20px', fontWeight: '700', color: 'var(--success)'}}>
                  {formatCurrency(calculatedData.totalPool)}
                </div>
              </div>

              <div style={{padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Team Size</div>
                <div style={{fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)'}}>
                  {calculatedData.staffCount}
                </div>
              </div>

              <div style={{padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Avg per Person</div>
                <div style={{fontSize: '20px', fontWeight: '700', color: 'var(--accent-primary)'}}>
                  {formatCurrency(calculatedData.totalPool / calculatedData.staffCount)}
                </div>
              </div>
            </div>
          </div>

          {/* Chart Toggle */}
          <div style={{marginBottom: '12px', display: 'flex', gap: '8px'}}>
            <button 
              onClick={() => setActiveChart('sales')}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                background: activeChart === 'sales' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: activeChart === 'sales' ? 'white' : 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              💵 Sales Charts
            </button>
            <button 
              onClick={() => setActiveChart('packages')}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                background: activeChart === 'packages' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: activeChart === 'packages' ? 'white' : 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              📦 Packages Charts
            </button>
          </div>

          {/* Charts Grid */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px'}}>
            
            {/* Sales Bar Chart */}
            {activeChart === 'sales' && (
              <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '16px'}}>Top 10 - Sales Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" style={{fontSize: '12px'}} />
                    <YAxis stroke="var(--text-muted)" style={{fontSize: '12px'}} />
                    <Tooltip 
                      contentStyle={{background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px'}}
                      formatter={(value: any) => [`AED ${formatCurrency(value)}`, 'Sales']}
                    />
                    <Bar dataKey="sales" fill="#2196f3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Packages Bar Chart */}
            {activeChart === 'packages' && (
              <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
                <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '16px'}}>Top 10 - Package Count</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={packagesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" style={{fontSize: '12px'}} />
                    <YAxis stroke="var(--text-muted)" style={{fontSize: '12px'}} />
                    <Tooltip 
                      contentStyle={{background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px'}}
                      formatter={(value: any) => [value, 'Packages']}
                    />
                    <Bar dataKey="packages" fill="#9c27b0" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Sales vs Packages Scatter */}
            <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
              <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '16px'}}>Sales vs Packages Correlation</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="packages" stroke="var(--text-muted)" style={{fontSize: '12px'}} name="Packages" />
                  <YAxis dataKey="sales" stroke="var(--text-muted)" style={{fontSize: '12px'}} name="Sales" />
                  <Tooltip 
                    contentStyle={{background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px'}}
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: any, name: string) => [
                      name === 'sales' ? `AED ${formatCurrency(value)}` : value,
                      name === 'sales' ? 'Sales' : 'Packages'
                    ]}
                  />
                  <Scatter data={scatterData} fill="#4caf50" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Average Performance */}
            <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
              <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '16px'}}>Top 10 - Daily Averages</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={avgSalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" style={{fontSize: '12px'}} />
                  <YAxis stroke="var(--text-muted)" style={{fontSize: '12px'}} />
                  <Tooltip 
                    contentStyle={{background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px'}}
                  />
                  <Legend />
                  <Bar dataKey="avgSales" fill="#ff9800" name="Avg Sales/Day" />
                  <Bar dataKey="avgPackages" fill="#00bcd4" name="Avg Pkgs/Day" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Distribution Line Chart */}
            <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
              <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '16px'}}>Performance Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" style={{fontSize: '12px'}} />
                  <YAxis stroke="var(--text-muted)" style={{fontSize: '12px'}} />
                  <Tooltip 
                    contentStyle={{background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px'}}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#2196f3" strokeWidth={2} name="Sales" />
                  <Line type="monotone" dataKey="packages" stroke="#9c27b0" strokeWidth={2} name="Packages" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Name Selector for Personal Stats */}
          <div style={{marginBottom: '24px'}}>
            <label style={{display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px'}}>
              View Individual Performance (Optional)
            </label>
            <select
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '12px',
                fontSize: '14px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="">-- Select a person --</option>
              {results.map(r => (
                <option key={r.name} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Personal Stats */}
          {personalData && (
            <div style={{marginBottom: '24px', padding: '24px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '2px solid var(--accent-primary)'}}>
              <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)'}}>
                👤 {personalData.name}'s Performance
              </h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px'}}>
                <div>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Rank</div>
                  <div style={{fontSize: '28px', fontWeight: '700', color: 'var(--accent-primary)'}}>
                    #{personalData.rank}
                  </div>
                  <div style={{fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px'}}>
                    of {personalData.totalStaff}
                  </div>
                </div>

                <div>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Total Incentive</div>
                  <div style={{fontSize: '28px', fontWeight: '700', color: 'var(--success)'}}>
                    {formatCurrency(personalData.totalIncentive)}
                  </div>
                </div>

                <div>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Sales</div>
                  <div style={{fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)'}}>
                    {formatCurrency(personalData.sales)}
                  </div>
                  <div style={{fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px'}}>
                    {personalData.packages} packages
                  </div>
                </div>

                <div>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Working Days</div>
                  <div style={{fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)'}}>
                    {personalData.workingDays}
                  </div>
                </div>

                <div>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Avg Sales/Day</div>
                  <div style={{fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)'}}>
                    {formatCurrency(personalData.avgSalesPerDay)}
                  </div>
                </div>

                <div>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Avg Pkgs/Day</div>
                  <div style={{fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)'}}>
                    {personalData.avgPackagesPerDay.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>Contribution</div>
                  <div style={{fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)'}}>
                    {personalData.contribution.toFixed(2)}%
                  </div>
                </div>

                <div>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px'}}>P1 + P2</div>
                  <div style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)'}}>
                    {formatCurrency(personalData.p1)} + {formatCurrency(personalData.p2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: 'rgba(255, 193, 7, 0.08)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            ⚠️ <strong>Note:</strong> These results are temporary and will be lost when you close or refresh the page. 
            To save data permanently, use the <strong>Bulk</strong> tab with Monthly view.
          </div>
        </div>
      )}

      {/* Empty State */}
      {!file && (
        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          border: '2px dashed var(--border-color)'
        }}>
          <div style={{fontSize: '48px', marginBottom: '16px'}}>📊</div>
          <h3 style={{fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px'}}>
            Analytics Dashboard
          </h3>
          <p style={{color: 'var(--text-muted)', marginBottom: '24px'}}>
            Upload Excel to calculate and visualize performance across multiple periods.
            <br />
            <strong>Supports:</strong> Monthly, Q1-Q4, H1-H2, Annual, and Overall analysis.
          </p>
        </div>
      )}
    </section>
  )
}
