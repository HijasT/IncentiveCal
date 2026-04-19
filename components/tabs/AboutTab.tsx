'use client'

import { Card } from '@/components/ui/Card';

export function AboutTab() {
  return (
    <div className="space-y-6">
      <Card title="About Smart Incentive Calculator">
        <div className="prose prose-invert max-w-none">
          <p className="text-text-secondary">
            A comprehensive tool for calculating sales incentives, tracking performance,
            and managing team metrics with advanced analytics.
          </p>
        </div>
      </Card>

      <Card title="Features">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: '💰', title: 'Individual Calculator', desc: 'Calculate personal incentives with P1/P2 splits' },
            { icon: '📊', title: 'Bulk Processing', desc: 'Upload Excel and process entire team at once' },
            { icon: '📈', title: 'Performance Analytics', desc: 'Track trends, achievements, and milestones' },
            { icon: '🔥', title: 'Streak Tracking', desc: 'Monitor consecutive months above target' },
            { icon: '🏆', title: 'Achievement System', desc: '9 unlockable badges for performance' },
            { icon: '📅', title: 'Performance Heatmap', desc: 'Visual 12-month calendar view' },
            { icon: '👥', title: 'Peer Comparison', desc: 'Anonymous team benchmarking' },
            { icon: '📱', title: 'PWA Support', desc: 'Install as app, works offline' },
          ].map((feature, i) => (
            <div key={i} className="flex gap-3 p-4 bg-background-tertiary rounded-lg">
              <div className="text-3xl">{feature.icon}</div>
              <div>
                <h4 className="font-semibold text-text-primary">{feature.title}</h4>
                <p className="text-sm text-text-secondary">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="How It Works">
        <div className="space-y-4 text-text-secondary">
          <div>
            <h4 className="font-semibold text-text-primary mb-2">Tier System</h4>
            <p>Your team's achievement percentage determines the tier:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Tier 1 (75-84.99%): 4% incentive rate</li>
              <li>Tier 2 (85-100.99%): 5% incentive rate</li>
              <li>Tier 3 (101-110.99%): 6% incentive rate</li>
              <li>Tier 4 (111%+): 7% incentive rate</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-2">Pool Distribution</h4>
            <p>The incentive pool is split between:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li><strong>P1 (Equal Share)</strong>: Divided equally among all staff</li>
              <li><strong>P2 (Performance Share)</strong>: Distributed based on individual contribution</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-2">Data Storage</h4>
            <p>All data is stored locally in your browser. No server or database required.</p>
          </div>
        </div>
      </Card>

      <Card title="Version & License">
        <div className="space-y-2 text-sm text-text-secondary">
          <p><strong className="text-text-primary">Version:</strong> 5.2.0</p>
          <p><strong className="text-text-primary">Built with:</strong> Next.js 14, TypeScript, Tailwind CSS</p>
          <p><strong className="text-text-primary">License:</strong> © 2026 HT - Licensed for general use, Smart Salem prohibited from deployment</p>
        </div>
      </Card>

      <div className="text-center text-text-muted text-sm">
        <p>Made with ❤️ using Next.js and TypeScript</p>
        <p className="mt-2">
          <a
            href="https://github.com/yourusername/smart-incentive-calculator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View on GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
