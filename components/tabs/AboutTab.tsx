'use client'

export function AboutTab() {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">About Smart Incentive Calculator</h2>
      </div>

      <div style={{padding: '20px'}}>
        <h3 style={{color: 'var(--accent-primary)', marginBottom: '12px', fontSize: '20px'}}>
          Smart Incentive Calculator v5.1
        </h3>
        <p style={{color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.8'}}>
          A comprehensive tool for calculating sales incentives based on team performance and achievement tiers. 
          Built with Next.js, React, and TypeScript for optimal performance and reliability.
        </p>
        
        <h4 style={{color: 'var(--text-primary)', marginBottom: '12px', marginTop: '28px', fontSize: '16px'}}>
          Core Features
        </h4>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', marginBottom: '24px'}}>
          {[
            { icon: '💰', title: 'Individual Calculator', desc: 'Calculate personal incentives with P1/P2 splits' },
            { icon: '📊', title: 'Bulk Processing', desc: 'Upload Excel and process entire team at once' },
            { icon: '📈', title: 'Performance Analytics', desc: 'Track trends, achievements, and milestones' },
            { icon: '⚙️', title: 'Customizable Tiers', desc: 'Configure achievement thresholds and rates' },
            { icon: '🎯', title: 'Tier Ladder', desc: 'See requirements to reach next tier level' },
            { icon: '🔒', title: '100% Private', desc: 'All calculations happen in your browser' },
          ].map((feature, i) => (
            <div key={i} style={{
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{fontSize: '28px', marginBottom: '8px'}}>{feature.icon}</div>
              <div style={{fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px', fontSize: '14px'}}>
                {feature.title}
              </div>
              <div style={{fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5'}}>
                {feature.desc}
              </div>
            </div>
          ))}
        </div>

        <h4 style={{color: 'var(--text-primary)', marginBottom: '12px', marginTop: '28px', fontSize: '16px'}}>
          How It Works
        </h4>
        <div style={{padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '24px'}}>
          <div style={{color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.8'}}>
            <p style={{marginBottom: '12px'}}>
              <strong style={{color: 'var(--text-primary)'}}>Tier System:</strong><br/>
              Your team's achievement percentage determines the incentive tier:
            </p>
            <ul style={{listStyle: 'none', padding: '0', marginLeft: '16px'}}>
              <li style={{marginBottom: '6px'}}>• Tier 1 (75-84.99%): 4% incentive rate</li>
              <li style={{marginBottom: '6px'}}>• Tier 2 (85-100.99%): 5% incentive rate</li>
              <li style={{marginBottom: '6px'}}>• Tier 3 (101-110.99%): 6% incentive rate</li>
              <li style={{marginBottom: '6px'}}>• Tier 4 (111%+): 7% incentive rate</li>
            </ul>
            
            <p style={{marginTop: '16px', marginBottom: '12px'}}>
              <strong style={{color: 'var(--text-primary)'}}>Pool Distribution:</strong><br/>
              The incentive pool is split between:
            </p>
            <ul style={{listStyle: 'none', padding: '0', marginLeft: '16px'}}>
              <li style={{marginBottom: '6px'}}>• <strong>P1 (Equal Share)</strong>: Divided equally among all staff</li>
              <li style={{marginBottom: '6px'}}>• <strong>P2 (Performance Share)</strong>: Distributed based on individual contribution</li>
            </ul>
          </div>
        </div>

        <h4 style={{color: 'var(--text-primary)', marginBottom: '12px', marginTop: '28px', fontSize: '16px'}}>
          Privacy & Data
        </h4>
        <div style={{padding: '16px', background: 'rgba(0, 206, 209, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 206, 209, 0.2)', marginBottom: '24px'}}>
          <div style={{fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8'}}>
            All data is stored locally in your browser. No server or database required. 
            Your calculations, settings, and analytics never leave your device.
          </div>
        </div>

        <h4 style={{color: 'var(--text-primary)', marginBottom: '12px', marginTop: '28px', fontSize: '16px'}}>
          Version & License
        </h4>
        <div style={{padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6'}}>
          <p><strong style={{color: 'var(--text-primary)'}}>Version:</strong> 5.1.0</p>
          <p><strong style={{color: 'var(--text-primary)'}}>Built with:</strong> Next.js 14, React 18, TypeScript 5</p>
          <p><strong style={{color: 'var(--text-primary)'}}>License:</strong> © 2026 HT - Licensed for general use, Smart Salem prohibited from deployment</p>
        </div>

        <div style={{marginTop: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px'}}>
          <p>Made with ❤️ for sales teams everywhere</p>
        </div>
      </div>
    </section>
  )
}
