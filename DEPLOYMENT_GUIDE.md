# 🚀 Smart Incentive Calculator v5.0 - Complete Setup & Deployment Guide

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Local Development](#local-development)
4. [Deployment to Vercel](#deployment-to-vercel)
5. [Custom Domain Setup](#custom-domain-setup)
6. [Environment Variables](#environment-variables)
7. [Troubleshooting](#troubleshooting)
8. [Performance Optimization](#performance-optimization)
9. [Monitoring](#monitoring)

---

## 🎯 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher
- Git installed
- GitHub account (for Vercel deployment)

### Installation (5 minutes)

```bash
# 1. Clone or download the project
cd sic-vercel-app

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open in browser
# Navigate to http://localhost:3000
```

You should see the Smart Incentive Calculator loaded with all 4 tabs ready to use.

---

## 📁 Project Structure

```
sic-vercel-app/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout component
│   ├── page.tsx                 # Main page with tabs
│   ├── globals.css              # Global styles
│   └── api/                     # API routes (optional)
│
├── components/                  # React components
│   ├── TabNavigation.tsx        # Tab switching
│   ├── SettingsPage.tsx         # Settings & tier config
│   ├── AnalyticsDashboard.tsx   # Analytics & insights
│   ├── modes/
│   │   ├── IndividualMode.tsx   # Single calculation
│   │   └── BulkMode.tsx         # Excel upload & processing
│   └── common/                  # Shared components
│       ├── Card.tsx             # Card wrapper
│       ├── Button.tsx           # Button variants
│       ├── Input.tsx            # Input field
│       ├── Alert.tsx            # Alert messages
│       ├── Modal.tsx            # Modal dialogs
│       ├── Spinner.tsx          # Loading spinner
│       └── index.ts             # Exports
│
├── lib/                         # Business logic modules
│   ├── configManager.ts         # Tier configuration
│   ├── validation.ts            # Input validation
│   ├── tierManager.ts           # Tier calculations
│   ├── analyticsTracker.ts      # Analytics tracking
│   ├── excelParser.ts           # Excel file parsing
│   ├── teamComparison.ts        # Team comparison
│   └── index.ts                 # Module exports
│
├── types/                       # TypeScript definitions
│   └── index.ts                 # Type exports
│
├── public/                      # Static files
│   └── favicon.ico
│
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.js           # Tailwind CSS config
├── postcss.config.js            # PostCSS config
├── next.config.js               # Next.js config
├── vercel.json                  # Vercel config
├── .eslintrc.json               # ESLint config
├── .gitignore                   # Git ignore rules
├── .env.example                 # Environment template
├── README.md                    # Project documentation
└── DEPLOYMENT_GUIDE.md          # This file
```

---

## 🛠️ Local Development

### Development Server

```bash
# Start development server with hot reload
npm run dev

# Server runs on http://localhost:3000
# Changes auto-refresh in browser
```

### Building for Production

```bash
# Create optimized production build
npm run build

# Run production build locally
npm start

# Runs on http://localhost:3000
```

### Code Linting

```bash
# Check for linting errors
npm run lint

# Fix auto-fixable errors
npm run lint -- --fix
```

---

## 🚀 Deployment to Vercel

### Step 1: Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial SIC v5.0 commit"

# Add remote (replace with your username)
git remote add origin https://github.com/YOUR_USERNAME/sic-vercel.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Confirm project settings
# - Deploy

# Get your live URL immediately
```

#### Option B: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Select your GitHub repository
5. Configure project settings:
   - Framework: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Click "Deploy"
7. Wait for build to complete
8. Get your live URL

### Step 3: Continuous Deployment

Once deployed:
- Every git push to `main` automatically deploys
- Vercel creates preview URLs for pull requests
- Automatic rollback on failed builds

---

## 🌐 Custom Domain Setup

### Using Custom Domain with Vercel

#### Add Domain to Vercel Project

1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Domains"
3. Enter your domain (e.g., `sic.hijas.dev`)
4. Click "Add Domain"

#### Configure DNS

**For Cloudflare (Recommended):**

```
Type: CNAME
Name: sic
Content: cname.vercel.com
TTL: Auto
Proxy status: Proxied (orange cloud)
```

**For GoDaddy:**

```
Type: CNAME
Host: sic
Points to: cname.vercel.com
TTL: 600
```

**For Route 53:**

```
Type: CNAME
Name: sic
Value: cname.vercel.com
TTL: 300
```

**For Other Providers:**
- Use CNAME record
- Name/Host: `sic` or full subdomain
- Target: `cname.vercel.com`
- TTL: 300-3600

### DNS Propagation

- Takes 5-48 hours typically
- Check status: `nslookup sic.hijas.dev`
- Vercel dashboard shows when ready
- HTTPS auto-enabled via Let's Encrypt

---

## 🔐 Environment Variables

### Create .env.local

```bash
# Create file
touch .env.local

# Add variables (all optional for basic functionality)
NEXT_PUBLIC_APP_VERSION=5.0.0
```

### In Vercel Dashboard

1. Go to Project Settings
2. Click "Environment Variables"
3. Add variables for:
   - Production
   - Preview
   - Development

**Note:** NEXT_PUBLIC_* variables are exposed to browser (don't store secrets!)

---

## 🐛 Troubleshooting

### Issue: Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process (macOS/Linux)
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

### Issue: Build Fails on Vercel

```bash
# Check build logs in Vercel dashboard
# Common issues:
# 1. TypeScript errors - run locally: npm run build
# 2. Missing dependencies - npm install
# 3. Node version mismatch - check vercel.json nodeVersion

# Rebuild on Vercel:
# Deployments → Select failed build → Redeploy
```

### Issue: Excel Upload Not Working

```javascript
// Check browser console (F12) for errors
// Excel file must be:
// - .xlsx or .xls format
// - Less than 5MB
// - Follow Staff_Sales_Tracker format

// If parsing fails, check:
// - Sheet names contain month-year (e.g., "Jun25")
// - Staff names in column A
// - "Count of Packages" and "Sales Ttl" rows present
```

### Issue: localStorage Not Persisting

```javascript
// Check browser settings:
// 1. Storage not disabled
// 2. Private/Incognito mode (use normal mode)
// 3. Site not added to restrictions

// Clear and retry:
// Dev Tools → Application → Clear storage → Reload
```

### Issue: Charts Not Displaying

```bash
# Recharts requires data
# Ensure:
# 1. At least one calculation made
# 2. Data types are correct
# 3. Browser supports SVG

# Test in different browser if issues persist
```

---

## ⚡ Performance Optimization

### Already Configured

✅ Code splitting (Next.js automatic)
✅ Image optimization
✅ CSS minification
✅ Tree shaking
✅ Gzip compression
✅ Caching headers
✅ Font optimization

### Monitoring Performance

```bash
# Generate build analysis
npm run build

# Check bundle size:
# Output shown in terminal after build
# Vercel dashboard shows deployment size

# Lighthouse audit:
# 1. Open app in Chrome
# 2. DevTools → Lighthouse
# 3. Run audit
# Target: >90 score
```

### Web Vitals

Monitor in Vercel Analytics:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

---

## 📊 Monitoring & Analytics

### Vercel Dashboard

Monitor:
- Build times
- Deployment status
- Response times
- Error rates

### Browser Console

Check for errors:
```bash
# Open DevTools (F12)
# Console tab shows runtime errors
# Network tab shows failed requests
```

### Application Insights

```bash
# In Vercel project settings:
# - Enable Web Analytics (free)
# - View visitor data
# - Track performance
# - See geographic distribution
```

---

## 🔄 Updates & Maintenance

### Keep Dependencies Updated

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Update all major versions (test after!)
npm install -g npm-check-updates
ncu -u
npm install
```

### Testing Updates

```bash
# After updating dependencies:
npm run build      # Build test
npm run dev        # Manual testing
npm run lint       # Code quality check

# Deploy to preview first:
git checkout -b feature/dependency-update
git push
# Vercel creates preview URL automatically
```

---

## 📚 Useful Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Check code quality

# Vercel
vercel                  # Deploy using CLI
vercel --prod          # Deploy to production
vercel env ls          # List environment variables
vercel logs            # View deployment logs

# Git
git status             # Check file status
git add .              # Stage all changes
git commit -m "msg"    # Create commit
git push               # Push to GitHub
git pull               # Pull latest changes

# Node
npm install            # Install dependencies
npm update             # Update packages
npm cache clean        # Clear npm cache
npm audit              # Check security
```

---

## 🎓 Best Practices

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create Pull Request on GitHub
# Get review, merge to main

# Vercel auto-deploys production
```

### Code Quality

- Use TypeScript (✅ configured)
- Run linter before committing
- Write meaningful commit messages
- Keep components small and focused
- Reuse common components

### Security

- ✅ No secrets in environment variables (use Vercel dashboard)
- ✅ Input sanitization (validation.ts)
- ✅ HTML escaping
- ✅ Client-side only processing
- ❌ Never commit .env.local

---

## 🎯 Next Steps After Deployment

1. **Test in Production**
   - Upload real Excel file
   - Test all calculations
   - Check dark mode
   - Test on mobile

2. **Get Custom Domain**
   - Register domain (Vercel Domains or external)
   - Configure DNS
   - Enable HTTPS

3. **Share with Team**
   - Get live URL from Vercel
   - Add to bookmarks
   - Brief team on usage

4. **Monitor Performance**
   - Check Vercel Analytics
   - Monitor build times
   - Track error rates

5. **Plan Improvements**
   - Gather user feedback
   - Plan new features
   - Schedule updates

---

## 📞 Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **GitHub Issues:** https://github.com/YOUR_USERNAME/sic-vercel/issues
- **Recharts:** https://recharts.org/

---

## 🎉 You're All Set!

Your Smart Incentive Calculator is now deployed and live.

**Key Points:**
- ✅ All calculations happen in the browser
- ✅ Data stored in browser localStorage (100KB limit)
- ✅ No server-side processing needed
- ✅ Works offline after first load
- ✅ Instant deployments with Vercel
- ✅ Auto HTTPS and custom domains

**Share the live URL with your team and start using it!**

---

**Last Updated:** April 18, 2026
**Version:** 5.0.0
**Maintainer:** Hijas (HijasT)
