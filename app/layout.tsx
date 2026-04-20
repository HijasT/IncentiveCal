import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Smart Incentive Calculator',
  description: 'Smart Incentive Calculator - Track sales performance, incentives, and achievements',
  themeColor: '#00CED1',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" async></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" async></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js" async></script>
      </head>
      <body>{children}</body>
    </html>
  )
}
