import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Incentive Calculator v5.0',
  description: 'Pool-based incentive calculator with analytics',
  creator: 'HT',
  keywords: ['incentive', 'calculator', 'sales', 'commission'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app">{children}</div>
      </body>
    </html>
  );
}
