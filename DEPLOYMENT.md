# 🚀 Deployment Guide - Smart Incentive Calculator

Complete guide to deploy your modular Next.js app to Vercel.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git installed
- GitHub account
- Vercel account (free tier works)

## 🎯 Quick Deploy (Recommended)

### Option 1: GitHub → Vercel (Easiest)

1. **Push to GitHub**
```bash
cd smart-incentive-calculator
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smart-incentive-calculator.git
git push -u origin main
```

2. **Deploy on Vercel**
- Go to https://vercel.com
- Click "Add New Project"
- Import your GitHub repository
- Vercel auto-detects Next.js
- Click "Deploy"
- Done! Your app is live at `https://your-project.vercel.app`

### Option 2: Vercel CLI (Fastest)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to project
cd smart-incentive-calculator

# Install dependencies
npm install

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# Deploy to production
vercel --prod
```

## 🏗️ Project Completion Steps

The project structure is ready. Complete these components:

### 1. Individual Calculator Tab

Create `components/tabs/IndividualTab.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { calculateIndividual } from '@/lib/calculations'
import { getTiersFromStorage } from '@/lib/storage'

export function IndividualTab() {
  const [target, setTarget] = useState(0)
  const [sales, setSales] = useState(0)
  const [packages, setPackages] = useState(0)
  const [teamSales, setTeamSales] = useState(0)
  const [staffCount, setStaffCount] = useState(1)
  const [p1Split, setP1Split] = useState(60)
  
  const handleCalculate = () => {
    const tiers = getTiersFromStorage()
    const result = calculateIndividual(
      target, sales, teamSales, packages, staffCount, p1Split, tiers
    )
    // Display result
  }
  
  return (
    <div className="space-y-6">
      {/* Add form inputs */}
      {/* Add results display */}
    </div>
  )
}
```

### 2. Bulk Mode Tab

Create `components/tabs/BulkTab.tsx` with:
- Excel upload component
- View mode selector (Monthly, Q1-Q4, Yearly, All-Time)
- Results table with sorting
- CSV/PDF export buttons

### 3. Analytics Tab

Create `components/tabs/AnalyticsTab.tsx` with:
- Performance trends chart
- Heatmap component
- Streaks & milestones
- Peer comparison
- Interactive charts

### 4. Complete Component Files

Check the `/components` folder structure and implement:
- `components/ui/Button.tsx`
- `components/ui/Input.tsx`
- `components/ui/Card.tsx`
- `components/bulk/ResultsTable.tsx`
- `components/analytics/PerformanceTrends.tsx`
- etc.

## 🧪 Testing Before Deploy

```bash
# Type check
npm run type-check

# Build test
npm run build

# Run production locally
npm start
```

## ⚙️ Vercel Configuration

The project includes optimal settings:

**vercel.json** (auto-created):
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

## 🌍 Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as shown
5. SSL automatically configured

## 📊 Environment Variables

No env variables needed! All data in localStorage.

But if you add features later:

1. Vercel dashboard → Settings → Environment Variables
2. Add variables
3. Redeploy

## 🔄 Continuous Deployment

Once connected to GitHub:
- Every push to `main` auto-deploys to production
- Pull requests get preview deployments
- Instant rollbacks available

## 🐛 Troubleshooting

### Build fails with type errors
```bash
npm run type-check
# Fix all TypeScript errors
```

### Deployment timeout
```bash
# Optimize build
npm run build -- --profile
```

### Missing dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📱 PWA Testing

After deployment:

**Mobile**:
1. Visit your Vercel URL
2. Safari → Share → Add to Home Screen
3. Open from home screen (fullscreen)

**Desktop**:
1. Chrome → Install icon in address bar
2. Or Settings → Install app

## 🎨 Customization After Deploy

Update colors in `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    DEFAULT: '#00CED1', // Change to your brand
  }
}
```

Redeploy:
```bash
git add .
git commit -m "Update branding"
git push
# Auto-deploys to Vercel
```

## 📈 Performance Optimization

Vercel automatically:
- ✅ Image optimization
- ✅ Code splitting
- ✅ Edge caching
- ✅ Compression
- ✅ Auto-scaling

## 🔒 Security

- No API keys needed
- All data client-side
- HTTPS enforced
- CSP headers configured

## 💰 Costs

**Free Tier Includes**:
- Unlimited personal projects
- 100GB bandwidth/month
- Automatic HTTPS
- Global CDN
- Analytics

**Paid if needed**:
- More bandwidth
- Team features
- Advanced analytics

## 🎯 Post-Deploy Checklist

- [ ] App loads correctly
- [ ] PWA installable
- [ ] All tabs functional
- [ ] Excel upload works
- [ ] Charts rendering
- [ ] localStorage persisting
- [ ] Mobile responsive
- [ ] Lighthouse score 90+

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Next.js Docs: https://nextjs.org/docs
- Vercel Support: https://vercel.com/support

## 📞 Need Help?

1. Check Vercel deployment logs
2. Review Next.js build output
3. Test locally with `npm run build && npm start`
4. Check GitHub Issues

---

**Your app will be live at**: `https://your-project-name.vercel.app`

Ready to deploy? Run: `vercel --prod` 🚀
