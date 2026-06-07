'use client'
import { useState, useEffect } from 'react'
import { DEFAULT_TIERS, loadTiers, saveTiers, type Tier } from '@/lib/utils'
import { SlidersIcon, SaveIcon, BarChartIcon } from '@/components/icons'

export function SettingsTab() {
  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS)
  const [showDefaults, setShowDefaults] = useState(false)

  useEffect(() => {
    setTiers(loadTiers())
  }, [])

  const handleTierChange = (index: number, field: keyof Tier, value: any) => {
    const newTiers = [...tiers]
    newTiers[index] = { ...newTiers[index], [field]: value }
    setTiers(newTiers)
  }

  const handleAddTier = () => {
    const newTier: Tier = {
      id: `tier${Date.now()}`,
      name: `Tier ${tiers.length + 1}`,
      min: 70,
      max: 80,
      rate: 1.0,
      color: '#808080'
    }
    setTiers([...tiers, newTier])
  }

  const handleRemoveTier = (index: number) => {
    if (tiers.length <= 1) {
      alert('Must have at least one tier')
      return
    }
    if (confirm(`Remove ${tiers[index].name}?`)) {
      const newTiers = tiers.filter((_, i) => i !== index)
      setTiers(newTiers)
    }
  }

  const handleSave = () => {
    // Sort tiers by min value
    const sortedTiers = [...tiers].sort((a, b) => a.min - b.min)
    
    // Update max values based on next tier's min
    for (let i = 0; i < sortedTiers.length; i++) {
      if (i < sortedTiers.length - 1) {
        sortedTiers[i].max = sortedTiers[i + 1].min
      } else {
        sortedTiers[i].max = Infinity
      }
    }
    
    saveTiers(sortedTiers)
    setTiers(sortedTiers)
    alert('Tier settings saved.')
  }

  const handleReset = () => {
    if (confirm('Reset to default tier settings?')) {
      setTiers(DEFAULT_TIERS)
      saveTiers(DEFAULT_TIERS)
      alert('Tier settings reset to defaults.')
    }
  }

  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title"><SlidersIcon className="icon-lg" />Tier Configuration</h2>
        <div className="card-description">
          Customize achievement tiers, rates, and colors
        </div>
      </div>

      {/* Default Tiers Bar */}
      <div style={{marginBottom: '24px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
        <button 
          onClick={() => setShowDefaults(!showDefaults)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            fontSize: '14px',
            fontWeight: '600',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            width: '100%',
            justifyContent: 'space-between'
          }}
        >
          <span><BarChartIcon />Current Tier System</span>
          <span style={{fontSize: '12px', opacity: 0.7}}>{showDefaults ? '▼ Hide' : '▶ Show'}</span>
        </button>

        {showDefaults && (
          <div style={{marginTop: '16px'}}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px'}}>
              {tiers.map(tier => (
                <div key={tier.id} style={{
                  padding: '16px',
                  background: `linear-gradient(135deg, ${tier.color}22, ${tier.color}44)`,
                  border: `2px solid ${tier.color}`,
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center'
                }}>
                  <div style={{fontSize: '16px', fontWeight: '700', color: tier.color, marginBottom: '8px'}}>
                    {tier.name}
                  </div>
                  <div style={{fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px'}}>
                    {tier.max === Infinity ? `above ${tier.min}%` : `${tier.min}% - ${tier.max}%`}
                  </div>
                  <div style={{fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)'}}>
                    Rate: {tier.rate}%
                  </div>
                  <div style={{fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontFamily: 'monospace'}}>
                    {tier.color}
                  </div>
                </div>
              ))}
            </div>
            <div style={{padding: '12px', background: 'rgba(33, 150, 243, 0.08)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-secondary)'}}>
              Your current tier configuration. Click "Reset to Defaults" to restore original colors (Orange · Blue · Purple · Green).
            </div>
          </div>
        )}
      </div>

      {/* Current Tiers */}
      <div style={{marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h3 style={{fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)'}}>
          Custom Tiers ({tiers.length})
        </h3>
        <button className="btn btn-primary" onClick={handleAddTier} style={{padding: '8px 16px', fontSize: '14px'}}>
          <span>+ Add Tier</span>
        </button>
      </div>

      <div style={{marginTop: '16px'}}>
        {tiers.map((tier, index) => (
          <div key={tier.id} style={{
            marginBottom: '16px',
            padding: '20px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--border-color)',
            position: 'relative'
          }}>
            {/* Remove Button */}
            <button
              onClick={() => handleRemoveTier(index)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                background: 'var(--error)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              × Remove
            </button>

            <div className="form-grid" style={{marginBottom: '16px'}}>
              <div className="form-group">
                <label>Tier Name</label>
                <input
                  type="text"
                  value={tier.name}
                  onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                  placeholder="e.g., Tier 1"
                />
              </div>
              
              <div className="form-group">
                <label>Min Achievement (%)</label>
                <input
                  type="number"
                  value={tier.min}
                  onChange={(e) => handleTierChange(index, 'min', parseFloat(e.target.value))}
                  step="0.1"
                  placeholder="75"
                />
              </div>
              
              <div className="form-group">
                <label>Incentive Rate (%)</label>
                <input
                  type="number"
                  value={tier.rate}
                  onChange={(e) => handleTierChange(index, 'rate', parseFloat(e.target.value))}
                  step="0.1"
                  min="0"
                  max="20"
                  placeholder="1.5"
                />
              </div>
            </div>

            {/* Color Picker */}
            <div style={{marginTop: '12px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)'}}>
                Tier Color
              </label>
              <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                <input
                  type="color"
                  value={tier.color}
                  onChange={(e) => handleTierChange(index, 'color', e.target.value)}
                  style={{width: '60px', height: '40px', cursor: 'pointer', border: '2px solid var(--border-color)', borderRadius: 'var(--radius-sm)'}}
                />
                <input
                  type="text"
                  value={tier.color}
                  onChange={(e) => handleTierChange(index, 'color', e.target.value)}
                  placeholder="#ff9800"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)'
                  }}
                />
                <div style={{
                  width: '100px',
                  height: '40px',
                  background: tier.color,
                  borderRadius: 'var(--radius-sm)',
                  border: '2px solid var(--border-color)'
                }} />
              </div>
            </div>

            {/* Preview Card */}
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: `linear-gradient(135deg, ${tier.color}33, ${tier.color}55)`,
              border: `2px solid ${tier.color}`,
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{fontSize: '14px', fontWeight: '700', color: tier.color}}>{tier.name}</span>
                <span style={{fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '12px'}}>
                  {tier.min}%+ → {tier.rate}% rate
                </span>
              </div>
              <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>Preview</div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{display: 'flex', gap: '12px', marginTop: '24px'}}>
        <button className="btn btn-secondary" onClick={handleReset} style={{flex: '1'}}>
          <span>↺ Reset to Defaults</span>
        </button>
        <button className="btn btn-primary" onClick={handleSave} style={{flex: '1'}}>
<><SaveIcon />Save Settings</>
        </button>
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: 'rgba(33, 150, 243, 0.08)',
        border: '1px solid rgba(33, 150, 243, 0.3)',
        borderRadius: 'var(--radius-md)',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: '1.6'
      }}>
        <strong style={{color: 'var(--text-primary)'}}>ℹ️ How it works:</strong>
        <ul style={{marginTop: '8px', marginLeft: '20px'}}>
          <li>Tiers are automatically sorted by minimum achievement %</li>
          <li>Max values are calculated from the next tier's min (highest tier = ∞)</li>
          <li>Changes apply immediately to all new calculations</li>
          <li>Historical analytics data remains unchanged</li>
          <li>At least one tier is required</li>
        </ul>
      </div>
    </section>
  )
}
