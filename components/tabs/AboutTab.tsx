'use client'

export function AboutTab() {
  return (
    <section className="card">
      <div className="card-header">
        <h2 className="card-title">About Smart Incentive Calculator</h2>
      </div>

      <div style={{padding: '20px'}}>
        <h3 style={{color: 'var(--accent-primary)', marginBottom: '12px', fontSize: '20px'}}>
          Smart Incentive Calculator v7.2.5
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
            { title: 'Individual Calculator', desc: 'Calculate personal incentives with P1/P2 splits' },
            { title: 'Bulk Processing', desc: 'Upload Excel and process entire team at once' },
            { title: 'Performance Analytics', desc: 'Track trends, achievements, and milestones' },
            { title: 'Customizable Tiers', desc: 'Configure achievement thresholds and rates' },
            { title: 'Tier Ladder', desc: 'See requirements to reach next tier level' },
            { title: '100% Private', desc: 'All calculations happen in your browser' },
          ].map((feature, i) => (
            <div key={i} style={{
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}>
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
              Your team's achievement percentage determines the incentive tier. The lower value is <strong>inclusive</strong> (≥) and the upper value is <strong>exclusive</strong> (&lt;):
            </p>
            <ul style={{listStyle: 'none', padding: '0', marginLeft: '16px'}}>
              <li style={{marginBottom: '6px'}}>• <strong>Tier 1</strong> (≥75% and &lt;85%): 1.5% incentive rate</li>
              <li style={{marginBottom: '6px'}}>• <strong>Tier 2</strong> (≥85% and &lt;101%): 2.5% incentive rate</li>
              <li style={{marginBottom: '6px'}}>• <strong>Tier 3</strong> (≥101% and &lt;111%): 3.0% incentive rate</li>
              <li style={{marginBottom: '6px'}}>• <strong>Tier 4</strong> (≥111%): 3.5% incentive rate</li>
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
          Calculation Example
        </h4>
        <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--border-color)'}}>
          <div style={{color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.8', fontFamily: "'JetBrains Mono', monospace"}}>
            <p style={{marginBottom: '16px', color: 'var(--text-primary)', fontWeight: '600'}}>Given:</p>
            <div style={{marginLeft: '12px', marginBottom: '16px'}}>
              • Team Target: AED 700,000<br/>
              • Team Sales: AED 735,000<br/>
              • Your Sales: AED 73,500<br/>
              • Staff Count: 29 members<br/>
              • P1/P2 Split: 60% / 40%
            </div>

            <p style={{marginBottom: '12px', color: 'var(--text-primary)', fontWeight: '600'}}>Step 1: Calculate Team Achievement</p>
            <div style={{marginLeft: '12px', marginBottom: '16px'}}>
              Achievement = (Team Sales ÷ Team Target) × 100<br/>
              Achievement = (735,000 ÷ 700,000) × 100<br/>
              Achievement = <strong style={{color: 'var(--accent-primary)'}}>105%</strong>
            </div>

            <p style={{marginBottom: '12px', color: 'var(--text-primary)', fontWeight: '600'}}>Step 2: Determine Tier</p>
            <div style={{marginLeft: '12px', marginBottom: '16px'}}>
              105% falls in range: ≥101% and &lt;111%<br/>
              Tier = <strong style={{color: 'var(--accent-primary)'}}>Tier 3</strong> (3.0% rate)
            </div>

            <p style={{marginBottom: '12px', color: 'var(--text-primary)', fontWeight: '600'}}>Step 3: Calculate Total Incentive Pool</p>
            <div style={{marginLeft: '12px', marginBottom: '16px'}}>
              Total Pool = Team Sales × Tier Rate<br/>
              Total Pool = 735,000 × 3.0%<br/>
              Total Pool = <strong style={{color: 'var(--accent-primary)'}}>AED 22,050</strong>
            </div>

            <p style={{marginBottom: '12px', color: 'var(--text-primary)', fontWeight: '600'}}>Step 4: Split Pool (60/40)</p>
            <div style={{marginLeft: '12px', marginBottom: '16px'}}>
              P1 Pool = 22,050 × 60% = <strong style={{color: '#42a5f5'}}>AED 13,230</strong><br/>
              P2 Pool = 22,050 × 40% = <strong style={{color: '#ffa726'}}>AED 8,820</strong>
            </div>

            <p style={{marginBottom: '12px', color: 'var(--text-primary)', fontWeight: '600'}}>Step 5: Calculate Your Share</p>
            <div style={{marginLeft: '12px', marginBottom: '16px'}}>
              <strong style={{color: '#42a5f5'}}>P1 (Equal Share):</strong><br/>
              Your P1 = P1 Pool ÷ Staff Count<br/>
              Your P1 = 13,230 ÷ 29<br/>
              Your P1 = <strong style={{color: '#42a5f5'}}>AED 456.21</strong><br/>
              <br/>
              <strong style={{color: '#ffa726'}}>P2 (Performance Share):</strong><br/>
              Your Contribution = (Your Sales ÷ Team Sales) × 100<br/>
              Your Contribution = (73,500 ÷ 735,000) × 100 = 10%<br/>
              Your P2 = P2 Pool × Your Contribution<br/>
              Your P2 = 8,820 × 10%<br/>
              Your P2 = <strong style={{color: '#ffa726'}}>AED 882.00</strong>
            </div>

            <p style={{marginBottom: '12px', color: 'var(--text-primary)', fontWeight: '600'}}>Final Result:</p>
            <div style={{marginLeft: '12px', padding: '12px', background: 'rgba(0, 206, 209, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0, 206, 209, 0.3)'}}>
              <strong style={{color: 'var(--success)', fontSize: '16px'}}>Total Incentive = P1 + P2</strong><br/>
              <strong style={{color: 'var(--success)', fontSize: '16px'}}>Total Incentive = 456.21 + 882.00</strong><br/>
              <strong style={{color: 'var(--success)', fontSize: '18px'}}>Total Incentive = AED 1,338.21</strong>
            </div>
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
          Performance Score v7.2.0 (Percentile-Based)
        </h4>
        <div style={{padding: '20px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '24px'}}>
          <div style={{fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8'}}>
            <p style={{marginBottom: '16px', color: 'var(--text-primary)', fontWeight: '600'}}>
              The Analytics Dashboard uses a percentile-based weighted formula to calculate individual performance scores (0-100):
            </p>
            
            <div style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #667eea, #5568d3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              color: 'white',
              fontWeight: '600',
              fontSize: '15px',
              textAlign: 'center'
            }}>
              Performance Score = (Sales × 50%) + (Productivity × 25%) + (Efficiency × 25%)
            </div>

            <p style={{marginBottom: '16px', color: 'var(--text-primary)', fontWeight: '600'}}>Component Breakdown:</p>

            <div style={{marginBottom: '20px'}}>
              <p style={{color: 'var(--text-primary)', fontWeight: '600', marginBottom: '8px'}}>
                1. Sales Performance (50% weight) - Hybrid Formula
              </p>
              <div style={{marginLeft: '12px', marginBottom: '16px'}}>
                <code style={{background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', display: 'block', marginBottom: '6px'}}>
                  Rank Score = ((Total People - Rank + 1) ÷ Total People) × 100
                </code>
                <code style={{background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', display: 'block', marginBottom: '6px'}}>
                  Volume Score = (My Sales ÷ Top Seller) × 100
                </code>
                <code style={{background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', display: 'block'}}>
                  Final = (Rank × 60%) + (Volume × 40%)
                </code>
                <div style={{marginTop: '10px', fontSize: '13px', padding: '10px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '6px'}}>
                  Example: Rank #2/29, 113K sales (vs 130K top)<br/>
                  → Rank: 96.55, Volume: 87.20<br/>
                  → <strong style={{color: '#667eea'}}>Final: 92.81/100</strong>
                </div>
              </div>

              <p style={{color: 'var(--text-primary)', fontWeight: '600', marginBottom: '8px'}}>
                2. Productivity (25% weight) - Percentile-Based
              </p>
              <div style={{marginLeft: '12px', marginBottom: '16px'}}>
                <code style={{background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', display: 'block', marginBottom: '6px'}}>
                  Daily Sales = Total Sales ÷ Working Days
                </code>
                <code style={{background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', display: 'block'}}>
                  Score = ((Total - Daily Rank + 1) ÷ Total) × 100
                </code>
                <div style={{marginTop: '10px', fontSize: '13px', padding: '10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px'}}>
                  Example: 5,967/day, ranked #2/29<br/>
                  → <strong style={{color: '#f59e0b'}}>96.55/100 (Top 3.4%)</strong>
                </div>
              </div>

              <p style={{color: 'var(--text-primary)', fontWeight: '600', marginBottom: '8px'}}>
                3. Efficiency (25% weight) - Percentile-Based
              </p>
              <div style={{marginLeft: '12px', marginBottom: '12px'}}>
                <code style={{background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', display: 'block', marginBottom: '6px'}}>
                  Per Client = Total Sales ÷ Clients Served
                </code>
                <code style={{background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', display: 'block'}}>
                  Score = ((Total - Per Client Rank + 1) ÷ Total) × 100
                </code>
                <div style={{marginTop: '10px', fontSize: '13px', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px'}}>
                  Example: 1,828/client, ranked #3/29<br/>
                  → <strong style={{color: '#10b981'}}>93.10/100 (Top 6.9%)</strong>
                </div>
              </div>
            </div>

            <p style={{marginBottom: '12px', color: 'var(--text-primary)', fontWeight: '600'}}>Complete Example:</p>
            <div style={{
              padding: '16px',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              fontSize: '13px',
              lineHeight: '1.8'
            }}>
              <strong>Ahmed (Example Staff):</strong><br/>
              • Sales: 92.81 × 0.50 = <strong>46.41 pts</strong><br/>
              • Productivity: 96.55 × 0.25 = <strong>24.14 pts</strong><br/>
              • Efficiency: 93.10 × 0.25 = <strong>23.28 pts</strong><br/>
              <br/>
              <strong style={{color: '#667eea', fontSize: '16px'}}>Total: 93.82/100 (Exceptional!)</strong>
            </div>

            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderLeft: '3px solid #10b981',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px'
            }}>
              <strong style={{color: '#10b981'}}>Why Percentile-Based?</strong> Position in team distribution is fair and transparent. 
              Top performer = 100, others proportional to rank. No artificial caps, always 0-100 scale.
            </div>
          </div>
        </div>

        <h4 style={{color: 'var(--text-primary)', marginBottom: '12px', marginTop: '28px', fontSize: '16px'}}>
          Version & Credits
        </h4>
        <div style={{padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6'}}>
          <p><strong style={{color: 'var(--text-primary)'}}>Version:</strong> 7.2.2</p>
          <p><strong style={{color: 'var(--text-primary)'}}>Built by:</strong> HT under the Keep Alive Project</p>
          <p><strong style={{color: 'var(--text-primary)'}}>Built with:</strong> Next.js 15, React 19, TypeScript 5, and Claude (for Analytics)</p>
          <p><strong style={{color: 'var(--text-primary)'}}>Theme:</strong> Glassmorphism • Dark/Light Mode</p>
        </div>

        {/* Legal Disclaimer - Footer */}
        <div style={{
          marginTop: '32px',
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          borderLeft: '3px solid #ef4444',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11px',
          lineHeight: '1.6',
          color: 'var(--text-secondary)'
        }}>
          <p style={{fontWeight: '600', color: '#ef4444', marginBottom: '6px'}}>
            DISCLAIMER
          </p>
          <p style={{marginBottom: '4px'}}>
            This is a demonstration/prototype only. Not authorized for Smart Salem or any organization. 
            Provided "as is" without warranty. Not for production, payroll, or financial decisions. 
            Personal/educational use only.
          </p>
        </div>

        <div style={{marginTop: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px'}}>
          <p>Made with ❤️ for sales teams everywhere</p>
        </div>
      </div>
    </section>
  )
}
