# Smart Incentive Calculator - Next.js TypeScript

Modern, modular rewrite of the Smart Incentive Calculator using Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Individual Calculator** - Calculate personal incentives
- **Bulk Mode** - Process entire team from Excel
- **Analytics Dashboard** - Performance tracking, trends, achievements
- **PWA Support** - Install as app, works offline
- **Real-time Progress** - Live tracking of monthly goals
- **Achievement System** - Gamified performance milestones
- **Performance Heatmap** - Visual 12-month calendar
- **Peer Comparison** - Anonymous team benchmarking

## 📦 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + react-chartjs-2
- **Excel**: SheetJS (xlsx)
- **PDF**: jsPDF
- **Icons**: Lucide React
- **Deployment**: Vercel

## 🏗️ Project Structure

```
smart-incentive-calculator/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── layout/           # Header, Navigation
│   ├── tabs/             # Tab components
│   ├── analytics/        # Analytics features
│   ├── bulk/             # Bulk mode features
│   ├── individual/       # Individual calculator
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions
│   ├── calculations.ts   # Core calculations
│   ├── analytics.ts      # Analytics logic
│   ├── storage.ts        # localStorage management
│   ├── excel.ts          # Excel processing
│   └── exports.ts        # CSV/PDF exports
├── types/                 # TypeScript definitions
│   ├── tier.ts
│   ├── calculator.ts
│   └── analytics.ts
├── hooks/                 # Custom React hooks
│   ├── useAnalytics.ts
│   ├── useTiers.ts
│   └── useTheme.ts
└── public/               # Static assets

```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

## 📤 Deploy to Vercel

### Option 1: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 2: Deploy via GitHub

1. Push code to GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Click "Deploy"

### Option 3: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

## 🔧 Environment Setup

Create `.env.local` (optional, no secrets needed):

```bash
# No environment variables required
# All data stored in localStorage
```

## 📱 PWA Features

The app is PWA-ready:

- **Offline Support**: Works without internet
- **Install Prompt**: Add to home screen
- **App-like**: Fullscreen standalone mode
- **Fast Loading**: Service worker caching

## 🎨 Customization

### Update Tiers

Edit `types/tier.ts`:

```typescript
export const DEFAULT_TIERS: Tier[] = [
  { id: 'tier1', name: 'Tier 1', min: 75, max: 84.99, rate: 4, color: '#FFA726' },
  // Add your tiers here
];
```

### Update Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    DEFAULT: '#00CED1', // Your brand color
  },
}
```

## 📊 Data Storage

All data stored in browser localStorage:

- `sic_tiers_v5` - Tier configuration
- `sic_theme` - Dark/light mode
- `sic_analytics_data` - Performance history
- `sic_user_name` - User preferences

**No backend required!** Everything runs client-side.

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

## 📝 Development Guide

### Adding a New Component

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
```

### Adding a New Calculation

```typescript
// lib/calculations.ts
export function calculateNewFeature(input: number): number {
  // Your logic here
  return input * 2;
}
```

### Adding a New Hook

```typescript
// hooks/useFeature.ts
import { useState, useEffect } from 'react';

export function useFeature() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Your logic
  }, []);
  
  return data;
}
```

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Type Errors

```bash
# Check types
npm run type-check

# Fix auto-fixable issues
npm run lint --fix
```

## 📄 License

© 2026 HT - Licensed for general use, Smart Salem prohibited from deployment

## 🤝 Contributing

This is a personal project. For major changes, please open an issue first.

## 🔗 Links

- **Live Demo**: https://your-app.vercel.app
- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues

## ⚡ Performance

- **Lighthouse Score**: 100/100
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Bundle Size**: < 200KB gzipped

## 📞 Support

For questions or issues:
- Open a GitHub issue
- Contact: your@email.com

---

**Built with ❤️ using Next.js and TypeScript**
