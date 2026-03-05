# Smart Incentive Calculator  

<p align="center"> <img src="https://hijast.github.io/IncentiveCal/assets/brand/banner.png" alt="Smart Incentive Calculator Banner" width="900"> </p> <p align="center"> <b>A privacy-first browser tool for calculating sales incentives.</b> </p> <p align="center"> <img src="https://img.shields.io/badge/version-4.2-blue"> <img src="https://img.shields.io/badge/license-MIT-green"> <img src="https://img.shields.io/badge/platform-Browser-orange"> <img src="https://img.shields.io/badge/privacy-100%25%20local-success"> </p>

### Version 3.1

A fully client-side incentive calculator with **Individual** and **Bulk Excel** modes.  
Supports automatic month/year sheet detection, package + sales extraction, and real-time incentive recalculation.

> 🔒 Runs entirely in the browser — no uploads, no servers, no tracking.  
> Your Excel file never leaves your device.

---

## Features

### Individual Mode
- Tier-based incentive calculation  
- Adjustable **Equal / Personal** split (10/90 → 90/10)  
- Projection for an additional AED 1,695 sale  
- Animated bar chart  
- Copy-to-clipboard result  
- Clean UI with light/dark mode  

### Bulk Mode
- Select **Month + Year** → sheet is auto-detected  
- Reads two-row per-staff format:
  - Row 1: Staff name  
  - Row 2: Package count (top), Sales value (bottom)
- Extracts:
  - Staff name  
  - Packages  
  - Sales (AED)
- Applies:
  - Achievement %  
  - Tier selection  
  - Incentive pool  
  - Equal share  
  - Personal share  
- Ranked results with medals for top 3  
- Search staff  
- Remove staff and recalculate instantly  
- Download results as Excel  

---

## Incentive Tiers

| Achievement | Tier | Rate |
|------------|------|------|
| Below 85%  | No Incentive | 0% |
| 85% – 100% | Tier 1 | 2.5% |
| 100.01% – 110% | Tier 2 | 3.0% |
| Above 110% | Tier 3 | 3.5% |

Tier detection is gap-free and handles decimals cleanly.

---

## Incentive Split

Both modes include a simple slider:

- **Equal Share** → every staff receives the same amount  
- **Personal Share** → based on individual sales contribution  

Range: **10% to 90%**, in 5% increments.

All calculations and table headers update instantly.

---

## Excel Format (Bulk Mode)

The tool supports the commonly used 2-row merged-cell format:

| Row | Column A | Other Columns |
|-----|----------|----------------|
| Staff Row | Staff Name (merged) | Package counts |
| Sales Row | *(blank)* | Total sales values (AED) |

Additionally:

- Month columns may appear under different sheet names:  
  `Feb 26`, `Feb26`, `February 2026`, etc.  
- The tool automatically finds the correct sheet.
- Special rows like `Grand Total`, `Total`, etc. are ignored.
- Empty/invalid staff rows are skipped.

---

## How to Use

### Online Version  
https://hijast.github.io/IncentiveCal/

### Local Usage  
Download `index.html` → open it directly in your browser.  
No installation or internet required.

---

## Bulk Mode Steps

1. Open **Bulk Upload**  
2. Select **Month** and **Year**  
3. Adjust split slider (default: 60/40)  
4. Upload the Excel file  
5. Click **Process**  
   - Sheet auto-detected  
   - Staff extracted  
   - Packages + sales parsed  
   - Incentives calculated  
6. Remove staff if necessary  
7. Download the updated results  

---

## Version History

### v3.1
- Added month/year sheet auto-detection  
- Added package + sales extraction from 2-row staff format  
- Removed manual target and staff count inputs  
- Added removable staff functionality with live recalculation  
- Improved ranking table layout  
- Enlarged and emphasized total incentive column  
- Display staff count at top  
- Removed redundant top-10 ranking section  
- Removed CSV download option  
- UI polish and performance improvements  

---

## License

MIT License — free for personal, professional, and commercial use.
