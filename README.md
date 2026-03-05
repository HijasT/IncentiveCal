# Smart Incentive Calculator

<p align="center">
  <img src="https://hijast.github.io/IncentiveCal/assets/brand/banner.png" width="900" alt="Smart Incentive Calculator Banner">
</p>

<p align="center">
  <b>A privacy-first browser tool for calculating sales incentives.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-4.2-blue">
  <img src="https://img.shields.io/badge/platform-browser-orange">
  <img src="https://img.shields.io/badge/privacy-100%25%20local-success">
  <img src="https://img.shields.io/badge/license-MIT-green">
</p>

---

## Live

https://hijast.github.io/IncentiveCal/

Runs entirely in your browser.  
No installation required.

---

## About

Smart Incentive Calculator is a **fully client-side incentive computation tool** designed for sales teams.

It supports both **individual calculations** and **bulk Excel processing**, automatically extracting staff data and computing incentives.

> Your Excel files **never leave your device**.  
> Everything runs locally in the browser.

---

# Features

<details>
<summary><b>Individual Mode</b></summary>

Quick single-staff incentive calculation.

Features:

- Tier-based incentive calculation
- Adjustable **Equal / Personal split**
- Projection for an additional **AED 1,695 sale**
- Animated performance bar
- Copy result to clipboard
- Light / Dark mode interface
- Instant recalculation

</details>

---

<details>
<summary><b>Bulk Excel Mode</b></summary>

Upload an Excel report and calculate incentives for the entire team.

Capabilities:

- Automatic **sheet detection**
- Extracts **staff names**
- Extracts **package counts**
- Extracts **sales values**
- Calculates:
  - Achievement %
  - Tier
  - Incentive pool
  - Equal share
  - Personal share
- Ranked results with medals for top performers
- Search staff
- Remove staff and recalculate instantly
- Download results as Excel

</details>

---

<details>
<summary><b>Smart Excel Parsing</b></summary>

Supports multiple sheet naming styles such as:

```
Feb26
Feb 26
February 2026
Feb-2026
Oct25
```

The system uses **score-based sheet detection** to automatically choose the correct sheet.

Supported staff layout:

| Row | Column A | Other Columns |
|-----|----------|---------------|
| Row 1 | Staff name | Package counts |
| Row 2 | *(blank)* | Sales values |

The parser automatically ignores:

- Grand totals
- Summary rows
- Empty staff entries

</details>

---

<details>
<summary><b>Ranking & Analytics</b></summary>

Supports multiple ranking modes:

- Monthly
- Quarterly
- Annual
- Overall

Sorting priority:

1. Sales  
2. Packages  
3. Total incentive  

New joiners are automatically included with **zero values for earlier months**.

</details>

---

# Incentive Tier Structure

| Achievement | Tier | Rate |
|-------------|------|------|
| Below 85% | No Incentive | 0% |
| 85% – 100% | Tier 1 | 2.5% |
| 100.01% – 110% | Tier 2 | 3.0% |
| Above 110% | Tier 3 | 3.5% |

Tier detection is **gap-free** and handles decimals correctly.

---

# Incentive Split

The incentive pool can be divided between team equality and personal performance.

| Portion | Meaning |
|--------|--------|
| Equal Share | Distributed evenly across staff |
| Personal Share | Based on individual sales contribution |

Slider range:

**10% → 90%**

All calculations update instantly when the slider moves.

---

# Usage

<details>
<summary><b>Individual Mode</b></summary>

1. Enter sales value  
2. Enter target  
3. Adjust split slider  
4. View calculated incentive  

</details>

---

<details>
<summary><b>Bulk Mode</b></summary>

1. Select **Month**  
2. Select **Year**  
3. Upload Excel file  
4. Click **Process**

The tool will automatically:

- Detect the correct sheet
- Extract staff
- Parse packages and sales
- Calculate incentives
- Rank staff

You can then remove staff and download the updated results.

</details>

---

# Privacy

✔ No uploads  
✔ No server processing  
✔ No analytics  
✔ No tracking  

Everything runs **locally inside your browser**.

---

# Version History

<details>
<summary><b>Click to expand</b></summary>

### v1.0
Initial release with a basic incentive calculator.

---

### v1.1
Calculation improvements.

- Fixed rounding inconsistencies  
- Improved tier boundary detection

---

### v1.2
User interface improvements.

- Added performance bar
- Improved layout and responsiveness

---

### v1.3
Major usability update.

- Added **Equal / Personal split slider**
- Live recalculation
- Copy-to-clipboard functionality

---

### v2.0
Major release introducing **Bulk Excel Mode**.

- Excel upload
- Staff extraction
- Package and sales parsing
- Incentive calculation for teams
- Ranked results table

---

### v2.1
Bulk mode reliability improvements.

- Improved Excel parsing
- Better error handling
- Ignored invalid rows

---

### v2.3
Performance improvements.

- Faster Excel processing
- Improved ranking display

---

### v3.0
Bulk parser redesign.

- Added support for **two-row staff format**
- Improved extraction reliability
- Added Excel export

---

### v3.1
Major usability improvements.

- Automatic **month/year sheet detection**
- Removed manual target and staff inputs
- Removable staff with live recalculation
- Staff count display
- Improved ranking table layout

---

### v4.0
Bulk processing engine upgrade.

- Introduced **score-based sheet detection**
- Improved month parsing
- Sheet candidate warnings

---

### v4.1
Ranking and aggregation features.

- Monthly / Quarterly / Annual / Overall ranking
- Year range filtering
- Automatic inclusion of new joiners

Sorting priority:

1. Sales  
2. Packages  
3. Total incentive

---

### v4.2
Reliability and validation improvements.

- Missing month warnings
- Missing target warnings
- Duplicate month detection
- Staff name deduplication
- Improved month column detection (e.g. **Oct Total** fallback)

</details>

---

# License

MIT License  

Free for personal, professional, and commercial use.