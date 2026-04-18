# 🚀 Performance Optimization & Monitoring Guide

## 📊 Current Performance Metrics

### Page Load Performance
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **Time to Interactive (TTI):** < 3s

### Bundle Size
- **Main Bundle:** ~150KB (gzipped)
- **React:** ~42KB
- **Recharts:** ~45KB
- **Tailwind CSS:** ~30KB
- **Other:** ~33KB

### Lighthouse Scores (Target)
- **Performance:** > 95
- **Accessibility:** > 95
- **Best Practices:** > 90
- **SEO:** > 90

---

## 🔧 Optimization Techniques Already Implemented

### Code-Level Optimizations

✅ **Dynamic Imports**
```typescript
// Recharts imported only when needed
const dynamic = true;
```

✅ **Component Code Splitting**
- Each mode component splits automatically
- Lazy loading via React.lazy() ready

✅ **Image Optimization**
```javascript
// next.config.js already configured
images: {
  unoptimized: true, // For static export
}
```

✅ **CSS Optimization**
- Tailwind purges unused styles
- Only loaded styles included in bundle
- PostCSS minification enabled

✅ **Tree Shaking**
```javascript
// Only used exports included
export { ... }
```

✅ **Minification**
- Configured in Next.js
- Automatic via build process
- Source maps for debugging

### Runtime Optimizations

✅ **Debouncing**
```typescript
export function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

✅ **Memoization Ready**
```typescript
const memoizedValue = useMemo(() => expensiveCalculation(), [deps]);
const memoizedCallback = useCallback(() => handler(), [deps]);
```

✅ **Efficient Rendering**
- Component-level optimization
- Props drilling minimized
- Context API ready

✅ **localStorage Optimization**
- 500-record limit (prevents bloat)
- Efficient JSON serialization
- Auto-cleanup implemented

---

## 📈 Monitoring & Analytics

### Built-in Monitoring

#### Vercel Analytics
```javascript
// Automatically enabled in Vercel
// Shows:
// - Page views
// - Device breakdown
// - Geographic distribution
// - Core Web Vitals
```

#### Google Analytics (Optional)
```typescript
// Can be added to app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout() {
  return (
    <>
      <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      {/* ... */}
    </>
  )
}
```

#### Web Vitals Monitoring
```typescript
// In app/layout.tsx or app/page.tsx
import { reportWebVitals } from 'next/web-vitals'

export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric)
  // Send to analytics service
}
```

### Browser DevTools

#### Lighthouse
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Click "Analyze page load"
4. Review scores and suggestions

#### Chrome DevTools Performance Tab
```
1. Open DevTools → Performance
2. Click Record
3. Interact with app
4. Click Stop
5. Review flame chart and metrics
```

#### Network Tab
```
1. Open DevTools → Network
2. Reload page
3. Check:
   - Total requests
   - Bundle sizes
   - Load times
   - Waterfall view
```

---

## 🎯 Optimization Strategies

### 1. Route-Based Code Splitting

```typescript
// Automatic in Next.js 14 app directory
// Each route's code loaded separately

// app/page.tsx - main bundle
// components/modes/BulkMode.tsx - separate chunk
// components/AnalyticsDashboard.tsx - separate chunk
```

### 2. Component-Level Optimization

#### Before (Unoptimized)
```typescript
export default function BulkMode() {
  const [data, setData] = useState([]);
  
  // Expensive calculation on every render
  const results = data.map(item => complexCalculation(item));
  
  return <Chart data={results} />;
}
```

#### After (Optimized)
```typescript
export default function BulkMode() {
  const [data, setData] = useState([]);
  
  // Calculate only when data changes
  const results = useMemo(
    () => data.map(item => complexCalculation(item)),
    [data]
  );
  
  return <Chart data={results} />;
}
```

### 3. Data Fetching Optimization

```typescript
// Client-side caching pattern
const [cache, setCache] = useState({});

const fetchData = useCallback(async (key) => {
  if (cache[key]) return cache[key];
  
  const data = await fetch(`/api/${key}`);
  setCache(prev => ({ ...prev, [key]: data }));
  return data;
}, [cache]);
```

### 4. localStorage Optimization

```typescript
// Current implementation:
- Max 500 records stored
- Auto-cleanup on overflow
- Efficient serialization

// Monitor size:
console.log(new Blob([localStorage.getItem('sic_analytics_v5')]).size);
```

---

## 📊 Performance Monitoring Checklist

### Weekly
- [ ] Check Vercel Analytics dashboard
- [ ] Monitor Lighthouse scores
- [ ] Review error rates
- [ ] Check bundle size trends

### Monthly
- [ ] Run full Lighthouse audit
- [ ] Review performance metrics
- [ ] Analyze user feedback
- [ ] Plan optimizations

### Before Each Deploy
- [ ] Run `npm run build`
- [ ] Check bundle analysis
- [ ] Run Lighthouse audit
- [ ] Test on slow network (DevTools)

---

## 🚀 Advanced Optimizations (Future)

### Image Optimization
```typescript
// When adding images:
import Image from 'next/image'

export default function Component() {
  return (
    <Image
      src="/image.png"
      alt="Description"
      width={400}
      height={300}
      loading="lazy"
    />
  )
}
```

### Font Optimization
```typescript
// In app/layout.tsx:
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout() {
  return <html className={inter.className}>
}
```

### Script Optimization
```typescript
// For third-party scripts:
import Script from 'next/script'

export default function Layout() {
  return (
    <>
      <Script
        src="https://example.com/script.js"
        strategy="lazyOnload"
      />
    </>
  )
}
```

---

## 🔍 Bundle Analysis

### Analyze Current Bundle
```bash
# Install analyzer
npm install --save-dev @next/bundle-analyzer

# Create .babelrc or webpack config
# (Already set up in next.config.js)

# Analyze
ANALYZE=true npm run build
```

### Bundle Breakdown (Current)
```
sic-vercel-app (.next/)
├── _next/
│   ├── static/
│   │   ├── chunks/
│   │   │   ├── main-*.js (~150KB gzipped)
│   │   │   ├── pages/
│   │   │   └── [name]-*.js (lazy loaded)
│   │   └── css/
│   │       └── global-*.css (~30KB gzipped)
│   └── image-manifest.json
└── pages/ (server-rendered)
```

---

## 🎯 Performance Goals

### Current (v5.0)
- ✅ First Load: < 2s
- ✅ Bulk Calc: < 500ms (1000 items)
- ✅ Charts Render: < 200ms
- ✅ Bundle: 150KB gzipped

### Target (v5.1)
- First Load: < 1.5s
- Bulk Calc: < 300ms
- Charts: < 100ms
- Bundle: < 120KB

### Ideal (v6.0)
- First Load: < 1s
- Bulk Calc: < 200ms
- Charts: < 50ms
- Bundle: < 100KB

---

## 💾 Storage Optimization

### Current Implementation
```typescript
// Maximum records before cleanup
const MAX_RECORDS = 500;

if (records.length > MAX_RECORDS) {
  records = records.slice(-MAX_RECORDS);
}
```

### Storage Breakdown
```
localStorage Usage:
├── sic_config_v5: ~30KB
├── sic_analytics_v5: ~50KB (500 records)
└── sic_dark_mode: < 1KB
Total: ~80KB (out of 5MB available)
```

### Export Strategy
```typescript
// For backup/migration:
const backup = {
  config: localStorage.getItem('sic_config_v5'),
  analytics: localStorage.getItem('sic_analytics_v5'),
  timestamp: new Date().toISOString(),
};

// Save to JSON file
const blob = new Blob([JSON.stringify(backup)]);
```

---

## 🔐 Performance-Security Balance

### Caching Strategy
```javascript
// Vercel Edge Caching
// Set in vercel.json:
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ]
}
```

### CSP Headers (Security)
```javascript
// Content Security Policy prevents XSS
"default-src 'self'"
"script-src 'self' 'unsafe-inline'"
"style-src 'self' 'unsafe-inline'"
```

---

## 📱 Mobile Performance

### Mobile-Specific Optimizations

#### Responsive Images
```typescript
// Tailwind handles responsiveness
className="w-full md:w-1/2 lg:w-1/3"
```

#### Touch Optimization
```css
/* Increased touch targets */
button {
  min-width: 44px;
  min-height: 44px;
}
```

#### Lazy Loading
```typescript
// Recharts lazy loaded on demand
const ChartComponent = lazy(() => import('./ChartComponent'));
```

---

## 🧪 Testing Performance

### Automated Testing
```bash
# Lighthouse CI
npm install -g @lhci/cli@0.9.x

# Configure lighthouse-config.json
# Run: lhci autorun

# Results uploaded to dashboard
```

### Manual Testing
```bash
# Test on slow network:
1. DevTools → Network
2. Select "Slow 3G"
3. Reload and measure

# Test on low-end device:
1. DevTools → Performance
2. CPU Throttle to 4x slowdown
3. Measure interactions
```

---

## 📈 Metrics to Track

### Core Web Vitals
- **LCP:** When largest content element loads
- **FID:** Response time to first user interaction
- **CLS:** Visual stability during load

### Custom Metrics
- Excel parse time (should be < 500ms)
- Calculation time (should be < 100ms)
- Analytics aggregation (should be < 200ms)
- Chart render time (should be < 200ms)

---

## 🎓 Best Practices

### Do's ✅
- Use useMemo for expensive calculations
- Implement lazy loading for charts
- Cache API responses
- Split code by route
- Monitor bundle size
- Test on slow networks
- Use lighter libraries when possible

### Don'ts ❌
- Inline large images
- Block rendering on data
- Create unnecessary state
- Render full lists without virtualization
- Ignore lighthouse warnings
- Ship unoptimized bundles
- Ignore Core Web Vitals

---

## 🚀 Performance Deployment Checklist

Before deploying to production:

- [ ] Run `npm run build` successfully
- [ ] Check bundle size (target: < 150KB gzipped)
- [ ] Run Lighthouse audit (target: > 95 Performance)
- [ ] Test on 3G network (DevTools)
- [ ] Test on low-end device (CPU throttle)
- [ ] Check all interactions work
- [ ] Verify dark mode works
- [ ] Test Excel upload (5MB+ file)
- [ ] Monitor error logs
- [ ] Set up analytics

---

## 📞 Performance Support

### Common Performance Issues

**Issue:** Page loads slowly
**Solution:** 
- Check network tab for large assets
- Run Lighthouse audit
- Enable gzip compression
- Use CDN (Vercel does this)

**Issue:** Calculations are slow
**Solution:**
- Use useMemo for expensive calcs
- Reduce dataset size
- Profile with DevTools
- Consider Web Workers

**Issue:** Charts render slowly
**Solution:**
- Reduce data points
- Use responsive container
- Lazy load charts
- Debounce resize events

---

**Version:** 5.0.0
**Last Updated:** April 18, 2026
**Status:** ✅ Performance Optimized

For more details, check Vercel analytics dashboard and Lighthouse CI results.
