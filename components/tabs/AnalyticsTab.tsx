'use client'

export function AnalyticsTab() {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">Performance Analytics</h2>
        <div className="card-description">
          Track your progress, achievements, and performance trends over time
        </div>
      </div>

      <div style={{marginTop: '24px'}}>
        <div className="stats-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px'}}>
          <div className="stat-card" style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
            <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px'}}>Total Earned</div>
            <div style={{fontSize: '28px', fontWeight: '800', color: 'var(--accent-primary)'}}>---</div>
          </div>
          
          <div className="stat-card" style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
            <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px'}}>Months Tracked</div>
            <div style={{fontSize: '28px', fontWeight: '800', color: 'var(--accent-primary)'}}>0</div>
          </div>
          
          <div className="stat-card" style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
            <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px'}}>Current Streak</div>
            <div style={{fontSize: '28px', fontWeight: '800', color: 'var(--success)'}}>0</div>
          </div>
          
          <div className="stat-card" style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'}}>
            <div style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px'}}>Personal Best</div>
            <div style={{fontSize: '28px', fontWeight: '800', color: 'var(--warning)'}}>---</div>
          </div>
        </div>

        <div style={{padding: '40px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center'}}>
          <div style={{fontSize: '64px', marginBottom: '16px'}}>📈</div>
          <div style={{color: 'var(--text-primary)', fontSize: '18px', fontWeight: '600', marginBottom: '8px'}}>
            No data yet
          </div>
          <div style={{color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px'}}>
            Use the Individual Calculator to start tracking your performance
          </div>
          <div style={{color: 'var(--text-muted)', fontSize: '12px', lineHeight: '1.6'}}>
            Analytics features:
            <br/>• Performance trends and charts
            <br/>• Achievement tracking and badges
            <br/>• Monthly heatmaps
            <br/>• Peer comparison
            <br/>• Historical data analysis
          </div>
        </div>
      </div>
    </section>
  )
}
