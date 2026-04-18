import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Incentive Calculator v5.0',
  description: 'Modular incentive calculator with analytics and team comparison',
  viewport: 'width=device-width, initial-scale=1',
  charset: 'utf-8',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0A7E8C" />
      </head>
      <body>
        <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900">
          {children}
        </main>
      </body>
    </html>
  );
}
