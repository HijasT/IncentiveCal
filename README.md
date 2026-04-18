# Smart Incentive Calculator v5.0

A modern, full-featured incentive calculation system built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**.

## Features

### 💼 Individual Calculation
- Calculate incentive for a single staff member
- **Pool-based model**: Achievement based on total team sales vs. target
- **Dual splits**: P1 (Equal distribution) + P2 (Personal performance)
- Real-time calculation with live preview
- Copy results to clipboard

### 📊 Bulk Processing
- Upload Excel files with multiple staff records
- Batch process calculations
- Export results

### ⚙️ Settings Management
- Customize tier structure (name, min/max, rate)
- Adjust default P1/P2 split
- Import/export configurations
- Reset to defaults

### 📈 Analytics & Tracking
- Track all calculations
- View tier distribution
- Monitor average achievement
- Identify performance trends

### 🌓 Dark Mode
- Full dark mode support
- Persisted theme preference
- Smooth transitions

## Tech Stack

- **Framework**: Next.js 14.2.35
- **Language**: TypeScript
- **Styling**: CSS with CSS Variables
- **State**: React Hooks
- **Storage**: Browser localStorage
- **Excel**: SheetJS (xlsx)
- **Deployment**: Vercel

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
.
├── app/
│   ├── page.tsx              # Main app component
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── DarkModeToggle.tsx    # Dark mode button
│   ├── Toast.tsx             # Notifications
│   └── tabs/
│       ├── IndividualTab.tsx # Individual calculation
│       ├── BulkTab.tsx       # Bulk upload
│       ├── SettingsTab.tsx   # Configuration
│       └── AnalyticsTab.tsx  # Analytics display
├── lib/
│   ├── types.ts              # TypeScript interfaces
│   ├── ConfigManager.ts      # Settings management
│   ├── TierManager.ts        # Tier & calculations
│   ├── AnalyticsTracker.ts   # Tracking & analytics
│   └── utils.ts              # Utility functions
└── package.json
```

## How It Works

### Pool-Based Calculation

```
Pool Achievement = Total Sales / Target × 100%
Tier = Based on achievement percentage

Pool Incentive = (Tier Rate / 100) × Total Sales

P1 Individual = (P1% of Pool) ÷ Number of Staff
P2 Individual = (P2% of Pool) × (Staff Sales / Total Sales)

Total Individual = P1 Individual + P2 Individual
```

### Example

- **Team Target**: 500,000 AED
- **Total Sales**: 600,000 AED (120% → Tier 3)
- **Staff Sales**: 60,000 AED (10% contribution)
- **Team Size**: 29 staff
- **Split**: 60% P1 / 40% P2

**Result**:
- Tier 3 Rate: 3%
- Pool Incentive: 18,000 AED
- P1 Share: 10,800 AED ÷ 29 = **372 AED/staff**
- P2 Share: 7,200 AED × 10% = **720 AED/staff**
- **Total: 1,092 AED**

## Data Storage

All data is stored in browser **localStorage**:

- `sic_config_v5` - Tier configuration & default split
- `sic_analytics_v5` - Calculation history (max 500 records)
- `sic_dark_v5` - Theme preference

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Manual Deployment

1. Build: `npm run build`
2. Deploy `.next` folder to any Node.js hosting
3. Set runtime to Node.js 18+

## License

Restricted: Smart Salem (and affiliates) prohibited from use.

For personal and general business use only.

Proof-of-origin: SIC-HT-SS-RESTRICT-2026

## Author

Built by HT - 2026
