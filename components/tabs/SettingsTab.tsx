'use client'
import { useState, useEffect } from 'react'
import { DEFAULT_TIERS, loadTiers, saveTiers, type Tier } from '@/lib/utils'

export function SettingsTab() {
  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS)

  useEffect(() => {
    setTiers(loadTiers())
  }, [])

  const handleTierChange = (index: number, field: keyof Tier, value: any) => {
    const newTiers = [...tiers]
    newTiers[index] = { ...newTiers[index], [field]: value }
    setTiers(newTiers)
  }

  const handleSave = () => {
    saveTiers(tiers)
    alert('Tier settings saved successfully!')
  }

  const handleReset = () => {
    if (confirm('Reset to default tier settings?')) {
      setTiers(DEFAULT_TIERS)
      saveTiers(DEFAULT_TIERS)
      alert('Tier settings reset to defaults!')
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Tier Configuration</h2>
        <div className="card-description">
          Customize achievement tiers and incentive rates
        </div>
      </div>

      <div style={{marginTop: '24px'}}>
        {tiers.map((tier, index) => (
          <div key={tier.id} style={{
            marginBottom: '16px',
            padding: '16px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <div className="form-grid">
              <div className="form-group">
                <label>Tier Name</label>
                <input
                  type="text"
                  value={tier.name}
                  onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Min Achievement (%)</label>
                <input
                  type="number"
                  value={tier.min}
                  onChange={(e) => handleTierChange(index, 'min', parseFloat(e.target.value))}
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label>Max Achievement (%)</label>
                <input
                  type="number"
                  value={tier.max === Infinity ? 999 : tier.max}
                  onChange={(e) => handleTierChange(index, 'max', parseFloat(e.target.value))}
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label>Incentive Rate (%)</label>
                <input
                  type="number"
                  value={tier.rate}
                  onChange={(e) => handleTierChange(index, 'rate', parseInt(e.target.value))}
                  min="0"
                  max="20"
                />
              </div>
            </div>
            
            <div style={{marginTop: '12px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)'}}>
                Tier Color
              </label>
              <input
                type="color"
                value={tier.color}
                onChange={(e) => handleTierChange(index, 'color', e.target.value)}
                style={{width: '100px', height: '40px', cursor: 'pointer', border: 'none', borderRadius: 'var(--radius-sm)'}}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{display: 'flex', gap: '12px', marginTop: '24px'}}>
        <button className="btn btn-primary" onClick={handleSave} style={{flex: '1'}}>
          <span>Save Settings</span>
        </button>
        <button className="btn btn-secondary" onClick={handleReset} style={{flex: '1'}}>
          <span>Reset to Defaults</span>
        </button>
      </div>

      <div style={{marginTop: '24px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6'}}>
        <strong style={{color: 'var(--text-secondary)'}}>Note:</strong> Tier changes will apply to all future calculations. Historical analytics data will not be affected.
      </div>
    </section>
  )
}
