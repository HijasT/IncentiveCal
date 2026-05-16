'use client'
import { useState, useEffect } from 'react'
import { parseExcelFile, type ExcelData } from '@/lib/excelUtils'
import { BulkResultsView } from './BulkResultsView'
import { AnalyticsDashboardView } from './AnalyticsDashboardView'

type SubView = 'bulk' | 'analytics'
type ViewMode = 'monthly' | 'q1' | 'q2' | 'q3' | 'q4' | 'h1' | 'h2' | 'yearly' | 'alltime'

export function BulkAnalyticsTab() {
  const [subView, setSubView] = useState<SubView>('bulk')
  const [viewMode, setViewMode] = useState<ViewMode>('monthly')
  const [selectedMonth, setSelectedMonth] = useState('May')
  const [selectedYear, setSelectedYear] = useState('26')
  const [excelData, setExcelData] = useState<ExcelData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [xlsxLoaded, setXlsxLoaded] = useState(false)
  const [availableYears, setAvailableYears] = useState<string[]>([])

  // Extract available years from excelData
  useEffect(() => {
    if (excelData.length > 0) {
      const years = new Set<string>()
      excelData.forEach(sheet => {
        const match = sheet.sheetName.match(/\d{2}$/)
        if (match) years.add(match[0])
      })
      const yearList = Array.from(years).sort()
      setAvailableYears(yearList)
      if (yearList.length > 0 && !selectedYear) {
        setSelectedYear(yearList[yearList.length - 1])
      }
    }
  }, [excelData])

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

    setIsProcessing(true)

    try {
      const data = await parseExcelFile(uploadedFile)
      setExcelData(data)
    } catch (error) {
      console.error('Error parsing Excel:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      alert(`Error parsing Excel file: ${errorMsg}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <section className="card">
      <div className="privacy-notice">
        <span className="privacy-icon">🔒</span>
        <span>100% local calculation • No data shared • Browser-only processing • Your data stays private</span>
      </div>

      <div className="card-header">
        <h2 className="card-title">📊 Bulk Calculations & Advanced Analytics</h2>
        <div className="card-description">Upload your Excel file to calculate bulk incentives and view comprehensive performance analytics</div>
      </div>

      {/* Shared Upload Section */}
      <div style={{
        marginBottom: '24px',
        padding: '20px',
        background: 'rgba(0, 206, 209, 0.05)',
        border: '2px dashed rgba(0, 206, 209, 0.3)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center'
      }}>
        <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--accent-primary)'}}>
          📂 Upload Excel File (Shared)
        </h3>
        <input 
          type="file" 
          accept=".xlsx,.xls" 
          onChange={handleFileUpload}
          disabled={!xlsxLoaded || isProcessing}
          style={{
            padding: '10px 20px',
            background: 'rgba(0, 206, 209, 0.1)',
            border: '1px solid rgba(0, 206, 209, 0.3)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            cursor: xlsxLoaded && !isProcessing ? 'pointer' : 'not-allowed'
          }}
        />
        <p style={{fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px'}}>
          {!xlsxLoaded ? 'Loading Excel library...' : 
           isProcessing ? 'Processing...' : 
           'Upload once - use for both Bulk Results and Analytics'}
        </p>
      </div>

      {/* View Controls - Modern Dropdowns */}
      {excelData.length > 0 && (
        <>
          {/* View Selectors - Above Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'monthly' ? '1fr 1fr 1fr' : viewMode === 'alltime' ? '1fr' : '1fr 1fr',
            gap: '12px',
            marginBottom: '16px',
            padding: '16px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)'
          }}>
            {/* VIEW MODE */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <label style={{
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--text-muted)'
              }}>
                VIEW MODE
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as ViewMode)}
                style={{
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  background: 'var(--bg-secondary)',
                  border: '2px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  outline: 'none',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--turquoise-primary)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-md), var(--glow-turquoise)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--glass-border)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                }}
              >
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

            {/* MONTH (only for monthly view) */}
            {viewMode === 'monthly' && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <label style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--text-muted)'
                }}>
                  MONTH
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-secondary)',
                    border: '2px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    outline: 'none',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--turquoise-primary)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-md), var(--glow-turquoise)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--glass-border)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                  }}
                >
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

            {/* YEAR (all modes except alltime) */}
            {viewMode !== 'alltime' && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <label style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--text-muted)'
                }}>
                  YEAR
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-secondary)',
                    border: '2px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    outline: 'none',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--turquoise-primary)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-md), var(--glow-turquoise)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--glass-border)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                  }}
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>20{year}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            padding: '6px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <button
              onClick={() => setSubView('bulk')}
              style={{
                flex: 1,
                padding: '14px 20px',
                border: 'none',
                background: subView === 'bulk' ? 'var(--gradient-primary)' : 'transparent',
                color: subView === 'bulk' ? 'white' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-md)',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: subView === 'bulk' ? 'var(--shadow-md), var(--glow-turquoise)' : 'none'
              }}
            >
              📊 Bulk Results
            </button>
            <button
              onClick={() => setSubView('analytics')}
              style={{
                flex: 1,
                padding: '14px 20px',
                border: 'none',
                background: subView === 'analytics' ? 'var(--gradient-primary)' : 'transparent',
                color: subView === 'analytics' ? 'white' : 'var(--text-secondary)',
                borderRadius: 'var(--radius-md)',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: subView === 'analytics' ? 'var(--shadow-md), var(--glow-turquoise)' : 'none'
              }}
            >
              📈 Analytics Dashboard (beta)
            </button>
          </div>

          {/* Conditional View Rendering */}
          {subView === 'bulk' ? (
            <BulkResultsView 
              excelData={excelData} 
              viewMode={viewMode}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          ) : (
            <AnalyticsDashboardView 
              excelData={excelData} 
              viewMode={viewMode}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          )}
        </>
      )}

      {/* Empty State */}
      {excelData.length === 0 && !isProcessing && (
        <div style={{
          padding: '64px',
          textAlign: 'center',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          border: '2px dashed var(--border-color)'
        }}>
          <div style={{fontSize: '64px', marginBottom: '20px'}}>📊</div>
          <h3 style={{fontSize: '20px', fontWeight: '700', marginBottom: '12px'}}>
            Upload Excel to Get Started
          </h3>
          <p style={{color: 'var(--text-muted)', fontSize: '15px'}}>
            Upload once to unlock both Bulk Results and Analytics Dashboard
          </p>
        </div>
      )}
    </section>
  )
}
