import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import { TabNavigation } from '@/components';

export const metadata: Metadata = {
  title: 'Smart Incentive Calculator v5.0',
  description: 'Modular incentive calculator with analytics and team comparison',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  charset: 'utf-8',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>
        <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors">
          <nav className="border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 bg-white dark:bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    SIC
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                      Smart Incentive Calculator
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">v5.0</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      const html = document.documentElement;
                      html.classList.toggle('dark');
                      localStorage.setItem('sic_dark_mode', html.classList.contains('dark') ? 'true' : 'false');
                    }}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Toggle dark mode"
                  >
                    <span className="text-xl">🌙</span>
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <TabNavigation />
            {children}
          </main>

          <footer className="border-t border-slate-200 dark:border-slate-800 mt-16 py-8 text-center text-sm text-slate-600 dark:text-slate-400">
            <p>
              Smart Incentive Calculator v5.0 • Built with Next.js, React & Tailwind CSS
            </p>
            <p className="mt-2">
              © 2026 Smart Salem • All rights reserved
            </p>
          </footer>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (localStorage.getItem('sic_dark_mode') === 'true' || (!localStorage.getItem('sic_dark_mode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
