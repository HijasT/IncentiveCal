'use client'
import { useState } from 'react'

interface DailyEntry {
  day: number
  sales: number | null
}

interface StaffEntry {
  id: string
  name: string
  packages: number
  dailySales: DailyEntry[]
}

export function DataEntryTab() {
  const [month, setMonth] = useState('Jun')
  const [year, setYear] = useState('25')
  const [target, setTarget] = useState('500000')
  const [staffList, setStaffList] = useState<StaffEntry[]>([
    {
      id: '1',
      name: 'Munna Hassan',
      packages: 8,
      dailySales: Array.from({ length: 31 }, (_, i) => ({ day: i + 1, sales: null }))
    },
    {
      id: '2',
      name: 'Marah Bassam',
      packages: 6,
      dailySales: Array.from({ length: 31 }, (_, i) => ({ day: i + 1, sales: null }))
    }
  ])
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'daily'>('list')

  const addStaff = () => {
    const newStaff: StaffEntry = {
      id: Date.now().toString(),
      name: 'New Staff Member',
      packages: 0,
      dailySales: Array.from({ length: 31 }, (_, i) => ({ day: i + 1, sales: null }))
    }
    setStaffList([...staffList, newStaff])
  }

  const removeStaff = (id: string) => {
    if (confirm('Remove this staff member?')) {
      setStaffList(staffList.filter(s => s.id !== id))
    }
  }

  const updateStaffName = (id: string, name: string) => {
    setStaffList(staffList.map(s => s.id === id ? { ...s, name } : s))
  }

  const updateStaffPackages = (id: string, packages: number) => {
    setStaffList(staffList.map(s => s.id === id ? { ...s, packages } : s))
  }

  const updateDailySales = (staffId: string, day: number, sales: number | null) => {
    setStaffList(staffList.map(s => {
      if (s.id === staffId) {
        const newDailySales = s.dailySales.map(d => 
          d.day === day ? { ...d, sales } : d
        )
        return { ...s, dailySales: newDailySales }
      }
      return s
    }))
  }

  const calculateStaffTotal = (staff: StaffEntry) => {
    return staff.dailySales.reduce((sum, day) => sum + (day.sales || 0), 0)
  }

  const calculateTeamTotal = () => {
    return staffList.reduce((sum, staff) => sum + calculateStaffTotal(staff), 0)
  }

  const getDaysInMonth = () => {
    const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month)
    const yearFull = 2000 + parseInt(year)
    return new Date(yearFull, monthIndex + 1, 0).getDate()
  }

  const daysInMonth = getDaysInMonth()

  const handleSaveToSupabase = () => {
    // MOCKUP - Would actually save to Supabase here
    alert('🚀 MOCKUP: Data would be saved to Supabase!\n\nThis would:\n1. Save monthly target\n2. Save all staff members\n3. Save daily sales data\n4. Generate working days automatically\n\nSupabase Tables:\n- monthly_targets\n- staff_performance\n- daily_sales')
  }

  const handleLoadFromSupabase = () => {
    // MOCKUP - Would actually load from Supabase here
    alert('📥 MOCKUP: Data would be loaded from Supabase!\n\nThis would:\n1. Fetch existing data for selected month\n2. Populate all fields\n3. Allow editing and re-saving')
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">📝 Data Entry (Monthly)</h2>
        <div className="card-description">
          Enter monthly performance data - Replaces Excel workflow with web-based entry
        </div>
      </div>

      {/* Month & Target Section */}
      <div style={{marginBottom: '24px', padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
        <h3 style={{fontSize: '14px', fontWeight: '600', marginBottom: '16px'}}>
          📅 Month & Target
        </h3>
        
        <div className="form-grid" style={{marginBottom: '16px'}}>
          <div className="form-group">
            <label>Month</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
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

          <div className="form-group">
            <label>Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="24">2024</option>
              <option value="25">2025</option>
              <option value="26">2026</option>
            </select>
          </div>

          <div className="form-group">
            <label>Monthly Target (AED)</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="500000"
            />
          </div>
        </div>

        <div style={{display: 'flex', gap: '8px'}}>
          <button className="btn btn-primary" onClick={handleLoadFromSupabase}>
            📥 Load Existing Data
          </button>
          <div style={{fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center'}}>
            Fetch data from Supabase if already entered
          </div>
        </div>
      </div>

      {/* Team Summary */}
      <div style={{marginBottom: '24px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px'}}>
          <div>
            <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>Team Size</div>
            <div style={{fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)'}}>
              {staffList.length}
            </div>
          </div>
          <div>
            <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>Team Total</div>
            <div style={{fontSize: '24px', fontWeight: '700', color: 'var(--success)'}}>
              AED {calculateTeamTotal().toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>Target</div>
            <div style={{fontSize: '24px', fontWeight: '700', color: 'var(--accent-primary)'}}>
              AED {parseInt(target).toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>Achievement</div>
            <div style={{fontSize: '24px', fontWeight: '700', color: calculateTeamTotal() >= parseInt(target) ? 'var(--success)' : 'var(--warning)'}}>
              {((calculateTeamTotal() / parseInt(target)) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div style={{marginBottom: '16px', display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', gap: '8px'}}>
          <button 
            onClick={() => setViewMode('list')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              background: viewMode === 'list' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: viewMode === 'list' ? 'white' : 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            📋 Staff List View
          </button>
          <button 
            onClick={() => setViewMode('daily')}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              background: viewMode === 'daily' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: viewMode === 'daily' ? 'white' : 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            📅 Daily Sales View
          </button>
        </div>

        <button className="btn btn-primary" onClick={addStaff} style={{padding: '8px 16px'}}>
          + Add Staff Member
        </button>
      </div>

      {/* Staff List View */}
      {viewMode === 'list' && (
        <div style={{marginBottom: '24px'}}>
          <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '12px'}}>
            👥 Staff Members ({staffList.length})
          </h3>
          
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{background: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border-color)'}}>
                  <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px'}}>#</th>
                  <th style={{padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px'}}>Name</th>
                  <th style={{padding: '12px', textAlign: 'center', fontWeight: '600', fontSize: '14px'}}>Packages</th>
                  <th style={{padding: '12px', textAlign: 'right', fontWeight: '600', fontSize: '14px'}}>Total Sales</th>
                  <th style={{padding: '12px', textAlign: 'center', fontWeight: '600', fontSize: '14px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff, index) => (
                  <tr key={staff.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                    <td style={{padding: '12px', fontSize: '14px', color: 'var(--text-muted)'}}>
                      {index + 1}
                    </td>
                    <td style={{padding: '12px'}}>
                      <input
                        type="text"
                        value={staff.name}
                        onChange={(e) => updateStaffName(staff.id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{padding: '12px', textAlign: 'center'}}>
                      <input
                        type="number"
                        value={staff.packages}
                        onChange={(e) => updateStaffPackages(staff.id, parseInt(e.target.value) || 0)}
                        style={{
                          width: '80px',
                          padding: '8px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                          textAlign: 'center'
                        }}
                      />
                    </td>
                    <td style={{padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: 'var(--success)'}}>
                      AED {calculateStaffTotal(staff).toLocaleString()}
                    </td>
                    <td style={{padding: '12px', textAlign: 'center'}}>
                      <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
                        <button
                          onClick={() => setSelectedStaff(staff.id)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            background: 'var(--accent-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer'
                          }}
                        >
                          📅 Daily Entry
                        </button>
                        <button
                          onClick={() => removeStaff(staff.id)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            background: 'var(--error)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer'
                          }}
                        >
                          × Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily Sales View */}
      {viewMode === 'daily' && selectedStaff && (
        <div style={{marginBottom: '24px'}}>
          {(() => {
            const staff = staffList.find(s => s.id === selectedStaff)
            if (!staff) return null

            return (
              <div>
                <div style={{marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h3 style={{fontSize: '16px', fontWeight: '600'}}>
                    📅 Daily Sales - {staff.name}
                  </h3>
                  <button
                    onClick={() => setSelectedStaff(null)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                  >
                    ← Back to List
                  </button>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: '12px'
                  }}>
                    {staff.dailySales.slice(0, daysInMonth).map((day) => (
                      <div key={day.day} style={{
                        padding: '12px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          marginBottom: '6px',
                          textAlign: 'center',
                          fontWeight: '600'
                        }}>
                          Day {day.day}
                        </div>
                        <input
                          type="number"
                          value={day.sales === null ? '' : day.sales}
                          onChange={(e) => updateDailySales(staff.id, day.day, e.target.value === '' ? null : parseFloat(e.target.value))}
                          placeholder="0"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-primary)',
                            color: 'var(--text-primary)',
                            fontSize: '13px',
                            textAlign: 'center'
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(33, 150, 243, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    textAlign: 'center'
                  }}>
                    💡 Enter daily sales for each day. Leave blank for days not worked (will be counted as NA).
                    Working days will be calculated automatically.
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {viewMode === 'daily' && !selectedStaff && (
        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          border: '2px dashed var(--border-color)'
        }}>
          <div style={{fontSize: '48px', marginBottom: '16px'}}>📅</div>
          <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px'}}>
            Select a Staff Member
          </h3>
          <p style={{color: 'var(--text-muted)'}}>
            Click "Daily Entry" button on any staff member to enter their daily sales data
          </p>
        </div>
      )}

      {/* Save Button */}
      <div style={{
        marginTop: '24px',
        padding: '20px',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-md)',
        border: '2px solid var(--accent-primary)'
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
          <div>
            <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '4px'}}>
              💾 Save to Database
            </h3>
            <p style={{fontSize: '13px', color: 'var(--text-muted)'}}>
              Save {month} 20{year} data to Supabase (replaces Excel file)
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={handleSaveToSupabase}
            style={{padding: '12px 24px', fontSize: '16px'}}
          >
            🚀 Save to Supabase
          </button>
        </div>

        <div style={{
          padding: '12px',
          background: 'rgba(76, 175, 80, 0.08)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          ✅ <strong>What will be saved:</strong> Monthly target, {staffList.length} staff members, daily sales data, auto-calculated working days
        </div>
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: 'rgba(33, 150, 243, 0.08)',
        border: '1px solid rgba(33, 150, 243, 0.3)',
        borderRadius: 'var(--radius-md)',
        fontSize: '13px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)'}}>
          📋 MOCKUP - How This Will Work:
        </div>
        <ul style={{margin: 0, paddingLeft: '20px'}}>
          <li>Replace Excel upload with web-based data entry</li>
          <li>Data stored in Supabase database (persistent, multi-user)</li>
          <li>Load existing months for editing</li>
          <li>Working days calculated automatically from daily entries</li>
          <li>Bulk/Analytics tabs fetch directly from Supabase</li>
          <li>No more manual Excel files!</li>
        </ul>
      </div>
    </section>
  )
}
