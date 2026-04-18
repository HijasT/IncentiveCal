# Smart Incentive Calculator v5.0 - Vercel Implementation Guide

## ✅ Completed Modules

```
lib/
├── configManager.ts        ✅ Configuration management with import/export
├── validation.ts           ✅ Input sanitization & validation utilities
├── tierManager.ts          ✅ Tier calculations & comparison
├── analyticsTracker.ts     ✅ Calculate tracking & insights
├── excelParser.ts          ✅ Excel file parsing (Staff Sales Tracker format)
├── teamComparison.ts       ✅ Team & period comparison tool
└── index.ts               ✅ Module exports

package.json               ✅ Dependencies
tsconfig.json             ✅ TypeScript config
next.config.js            ✅ Next.js config
app/layout.tsx            ✅ Root layout
app/globals.css           ✅ Global styles
```

---

## 📋 Remaining Files to Create

### 1. **Main Page Component** (`app/page.tsx`)
```typescript
'use client';

import { useState } from 'react';
import TabNavigation from '@/components/TabNavigation';
import IndividualMode from '@/components/IndividualMode';
import BulkMode from '@/components/BulkMode';
import SettingsPage from '@/components/SettingsPage';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'individual' | 'bulk' | 'settings' | 'analytics'>('individual');

  const tabs = [
    { id: 'individual', label: 'Individual', icon: '👤' },
    { id: 'bulk', label: 'Bulk Upload', icon: '📤' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-600 dark:text-teal-400 mb-2">
            💼 Smart Incentive Calculator
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            v5.0 • Modular • Analytics • Team Comparison
          </p>
        </div>

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} tabs={tabs} setActiveTab={setActiveTab} />

        {/* Content */}
        <div className="mt-6">
          {activeTab === 'individual' && <IndividualMode />}
          {activeTab === 'bulk' && <BulkMode />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'settings' && <SettingsPage />}
        </div>
      </div>
    </div>
  );
}
```

---

### 2. **Components Needed**

#### `components/TabNavigation.tsx`
- Render navigation tabs
- Handle tab switching
- Responsive design

#### `components/IndividualMode.tsx`
- Input fields: Sales, Target, Staff Count, Split
- Calculate incentive on input change
- Display P1/P2 breakdown
- Show visual breakdown chart
- Copy result to clipboard
- Track in analytics

#### `components/BulkMode.tsx`
- File upload (xlsx, xls)
- Parse Excel using excelParser
- Display table with results
- Tier distribution chart
- Achievement histogram
- Performance insights
- Team comparison
- Export results to Excel
- Track in analytics

#### `components/SettingsPage.tsx`
- Tier management interface
  - Add/edit/delete tiers
  - Real-time validation
  - Visual tier diagram
- Default split settings
- Tier simulator
- Import/Export config
- Reset to defaults
- Analytics viewer

#### `components/AnalyticsDashboard.tsx`
- Summary metrics
- Tier distribution (pie chart)
- Achievement histogram
- Performance insights
- Top/Bottom performers
- Recommendations
- Export analytics

#### `components/Common/`
- `Card.tsx` - Reusable card component
- `Button.tsx` - Button variants
- `Input.tsx` - Input field wrapper
- `Modal.tsx` - Modal dialog
- `Spinner.tsx` - Loading indicator
- `Alert.tsx` - Alert messages

---

### 3. **API Routes** (Next.js 14+ App Router)

#### `app/api/parse-excel/route.ts`
```typescript
// POST endpoint to parse Excel file
// Accepts: FormData with xlsx file
// Returns: Parsed sheet data with staff records
// Uses: excelParser, tierManager
```

#### `app/api/calculate-bulk/route.ts`
```typescript
// POST endpoint for bulk calculations
// Accepts: staffData, tiers config, split ratio
// Returns: IncentiveCalculation array + analytics
```

#### `app/api/export-excel/route.ts`
```typescript
// POST endpoint to export results as Excel
// Accepts: calculation results
// Returns: Excel file download
```

#### `app/api/compare-teams/route.ts`
```typescript
// POST endpoint for team comparison
// Accepts: Two arrays of calculations
// Returns: Comparison metrics and insights
```

---

### 4. **Types** (`types/`)

```typescript
// types/index.ts
export type TabId = 'individual' | 'bulk' | 'analytics' | 'settings';
export type CalculationType = 'individual' | 'bulk';
export type SortColumn = 'name' | 'sales' | 'achievement' | 'incentive';
```

---

## 🏗️ Architecture Flow

```
User Input
    ↓
Validation (validation.ts)
    ↓
Business Logic (tierManager.ts)
    ↓
Analytics Tracking (analyticsTracker.ts)
    ↓
UI Update
    ↓
Storage (localStorage via configManager.ts)
```

---

## 📊 Data Flow for Bulk Mode

```
Excel File Upload
        ↓
excelParser.parseFile()
        ↓
Validate Structure
        ↓
Extract Staff Records
        ↓
tierManager.calculateBulkIncentives()
        ↓
Generate Analytics
        ↓
analyticsTracker.trackCalculation()
        ↓
Display Results
        ↓
Optional: teamComparison.compareTeams()
        ↓
Export to Excel or Save
```

---

## 🎯 Key Features Implementation

### **1. Dynamic Tier Configuration**
- Edit tiers in Settings
- Real-time validation
- Visual tier diagram
- Compare two configs
- Tier simulator

### **2. Excel Parsing**
- Supports Staff_Sales_Tracker format
- Detects month/year from sheet names
- Extracts 2-row pattern (packages, sales)
- Handles multiple sheets
- Validates data integrity

### **3. Analytics Dashboard**
- Total calculations count
- Tier distribution
- Achievement stats (min, max, avg, median, std dev)
- Top/Bottom performers
- Actionable recommendations
- Charts using recharts

### **4. Team Comparison**
- Compare two teams side-by-side
- Period-over-period analysis
- Trend detection
- Comparative insights
- Growth rate calculation

### **5. Bulk Mode**
- Upload multiple staff
- Calculate all at once
- Display ranked table
- Export results
- Track metrics

---

## 🚀 Deployment on Vercel

```bash
# 1. Initialize git
git init
git add .
git commit -m "Initial commit"

# 2. Push to GitHub
git remote add origin https://github.com/HijasT/sic-vercel.git
git push -u origin main

# 3. Import to Vercel
# Go to vercel.com/dashboard
# Connect GitHub repo
# Deploy

# 4. Environment Variables (if needed)
# .env.local (add to Vercel dashboard)
# NEXT_PUBLIC_API_BASE_URL=https://sic-vercel.vercel.app
```

---

## 📦 Bundle Optimization

Already configured:
- ✅ Code splitting (Next.js automatic)
- ✅ Image optimization
- ✅ CSS minification
- ✅ Tree shaking
- ✅ Minified XLSX and recharts imports

---

## 🔒 Security Considerations

Implemented:
- ✅ Input sanitization (validation.ts)
- ✅ HTML escaping
- ✅ Number validation
- ✅ File type validation (xlsx only)
- ✅ Client-side processing (no server upload)
- ✅ localStorage limits (500 records max)

---

## 📱 Responsive Design

Using Tailwind CSS:
- Mobile-first approach
- Responsive grids
- Mobile charts
- Touch-friendly buttons
- Collapsible sections on mobile

---

## 🎨 Dark Mode Support

Tailwind dark mode configured:
- Toggle in header
- Persisted preference
- All components support dark mode
- Charts adapt to theme

---

## Next Steps

1. **Create remaining component files** (use provided templates above)
2. **Implement API routes** for Excel parsing and bulk calculations
3. **Add Chart Components** (using recharts)
4. **Test with your Excel file** from /uploads
5. **Set up GitHub repo** and push code
6. **Deploy to Vercel** - automatic on git push
7. **Configure custom domain** (optional)

---

## 📚 Component Implementation Priority

1. ✅ TabNavigation (simple, unblocks others)
2. ✅ IndividualMode (core feature)
3. ✅ SettingsPage (tier configuration)
4. ✅ BulkMode (Excel parsing)
5. ✅ AnalyticsDashboard (charts, insights)
6. Common components (Card, Button, Input, etc.)
7. API routes (processing endpoints)

---

## 💾 localStorage Structure

```javascript
{
  // Config (30KB typical)
  'sic_config_v5': { tiers, defaultSplit, lastUpdated },
  
  // Analytics (50KB for 500 records)
  'sic_analytics_v5': [ { calculations records } ],
  
  // Total: ~100KB max per user
  // Safe within 5MB browser limit
}
```

---

## 🔗 File Structure

```
sic-vercel-app/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main page (TODO)
│   ├── globals.css             # Global styles
│   ├── api/
│   │   ├── parse-excel/        # Excel parsing (TODO)
│   │   ├── calculate-bulk/     # Bulk calc (TODO)
│   │   ├── export-excel/       # Export (TODO)
│   │   └── compare-teams/      # Team compare (TODO)
│   └── favicon.ico
├── components/
│   ├── TabNavigation.tsx       # Tab switching (TODO)
│   ├── IndividualMode.tsx      # Individual calc (TODO)
│   ├── BulkMode.tsx            # Bulk upload (TODO)
│   ├── SettingsPage.tsx        # Settings UI (TODO)
│   ├── AnalyticsDashboard.tsx  # Analytics (TODO)
│   └── Common/                 # Shared components (TODO)
├── lib/
│   ├── configManager.ts        # ✅ Config management
│   ├── validation.ts           # ✅ Input validation
│   ├── tierManager.ts          # ✅ Tier logic
│   ├── analyticsTracker.ts     # ✅ Analytics
│   ├── excelParser.ts          # ✅ Excel parsing
│   ├── teamComparison.ts       # ✅ Team comparison
│   └── index.ts                # ✅ Exports
├── types/
│   └── index.ts                # Type definitions (TODO)
├── public/
│   └── favicon.ico
├── package.json                # ✅ Dependencies
├── next.config.js              # ✅ Next.js config
├── tsconfig.json               # ✅ TS config
├── .gitignore                  # ✅ Git ignore
├── .env.example                # Environment template (TODO)
└── README.md                   # Documentation (TODO)
```

---

## 🎓 Key Learning Points for Implementation

### Hooks Usage
- `useState`: Tab state, form inputs, modal states
- `useCallback`: Memoize event handlers
- `useMemo`: Expensive calculations
- `useEffect`: Initialize data, save to localStorage
- `useRef`: File upload handling

### Data Patterns
- Keep state at highest needed level
- Pass down via props or context
- Use callback functions for child→parent communication
- Lift state up for sibling communication

### Performance
- Split components by feature
- Lazy load charts/heavy components
- Debounce file uploads
- Memoize calculation functions

---

Would you like me to proceed with implementing any of these components?
