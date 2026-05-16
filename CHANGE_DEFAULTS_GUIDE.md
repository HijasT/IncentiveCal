# 🔧 QUICK REFERENCE: Change Default Values

## 📍 LOCATIONS TO EDIT:

### **1. Individual Calculator (Manual Entry)**
**File:** `components/tabs/IndividualTab.tsx`
**Lines:** 9-10

```tsx
// CURRENT DEFAULTS:
const [staffCount, setStaffCount] = useState('29')  // Line 9
const [p1Split, setP1Split] = useState(60)          // Line 10

// EXAMPLE CHANGE (30 staff, 50/50 split):
const [staffCount, setStaffCount] = useState('30')  // Line 9
const [p1Split, setP1Split] = useState(50)          // Line 10

// EXAMPLE CHANGE (25 staff, 70/30 split):
const [staffCount, setStaffCount] = useState('25')  // Line 9
const [p1Split, setP1Split] = useState(70)          // Line 10
```

---

### **2. Bulk Calculator (Excel Upload)**
**File:** `components/tabs/BulkResultsView.tsx`
**Line:** 34

```tsx
// CURRENT DEFAULT:
const [p1Split, setP1Split] = useState(60)  // Line 34

// EXAMPLE CHANGE (50/50 split):
const [p1Split, setP1Split] = useState(50)  // Line 34

// EXAMPLE CHANGE (70/30 split):
const [p1Split, setP1Split] = useState(70)  // Line 34
```

**Note:** Staff count in Bulk mode is auto-detected from Excel, no need to change.

---

## 💡 COMMON CONFIGURATIONS:

### **Equal Split (50/50):**
```tsx
// IndividualTab.tsx (Line 10)
const [p1Split, setP1Split] = useState(50)

// BulkResultsView.tsx (Line 34)
const [p1Split, setP1Split] = useState(50)
```

### **Favor Performance (40/60):**
```tsx
// IndividualTab.tsx (Line 10)
const [p1Split, setP1Split] = useState(40)

// BulkResultsView.tsx (Line 34)
const [p1Split, setP1Split] = useState(40)
```

### **Favor Equal Share (70/30):**
```tsx
// IndividualTab.tsx (Line 10)
const [p1Split, setP1Split] = useState(70)

// BulkResultsView.tsx (Line 34)
const [p1Split, setP1Split] = useState(70)
```

### **Extreme Equal Share (80/20):**
```tsx
// IndividualTab.tsx (Line 10)
const [p1Split, setP1Split] = useState(80)

// BulkResultsView.tsx (Line 34)
const [p1Split, setP1Split] = useState(80)
```

---

## 🚀 AFTER EDITING:

1. **Save both files**
2. **Restart the dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

3. **Or rebuild for production:**
   ```bash
   npm run build
   npm start
   ```

---

## ✅ WHAT THE USER SEES:

When they open the calculator:
- Individual tab: Pre-filled with your new defaults
- Bulk tab: Pre-filled P1/P2 slider at your new value
- Users can still change it manually - these are just starting values

---

## 📝 REMEMBER:

- **Staff Count:** Only change in IndividualTab.tsx (Bulk gets from Excel)
- **P1 Split:** Change in BOTH files for consistency
- **Format:** Staff count = string ('29'), P1 split = number (60)
- **Range:** P1 can be 0-100 (P2 is automatically 100-P1)

---

## ⚠️ VALIDATION:

The app will prevent invalid values:
- Staff count must be > 0
- P1 percentage must be 0-100
- Users can override at runtime

