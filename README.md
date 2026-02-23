# Smart Incentive Calculator

### Version 2.3

A fast, browser-based incentive calculator with two modes:
**Individual Incentive Calculation** and **Bulk Excel-Based Incentive Calculation**.

> 🔒 All processing is fully client-side — no data is stored or transmitted anywhere.

-----

## Features

- Tier-based incentive logic (2.5%, 3.0%, 3.5%)
- **Adjustable split slider** — choose any Equal/Personal split from 10/90 to 90/10 (default: 70/30)
- Accurate tier detection with no gaps between tiers
- Bulk mode supports alternating-row Excel sheets (SS format)
- Ranked incentive output table
- Download bulk results as a spreadsheet (.xlsx)
- Dark mode support
- Default salesperson count: **28**

-----

## Incentive Tiers

|Achievement        |Tier        |Rate|
|-------------------|------------|----|
|Below 85% of target|No Incentive|0%  |
|85% – 100%         |Tier 1      |2.5%|
|100.01% – 110%     |Tier 2      |3.0%|
|Above 110%         |Tier 3      |3.5%|

-----

## Incentive Split Slider

Both Individual and Bulk modes include a **split slider** to control how the incentive pool is divided:

- **Equal share** — distributed equally across all salespersons
- **Personal share** — distributed proportionally based on each person’s individual sales

The default is **70% Equal / 30% Personal**. You can drag the slider to any 5% increment between 10/90 and 90/10. The results table and column headers update to reflect the chosen split.

-----

## Excel Upload Requirements

Your Excel sheet must follow the **alternating-row (SS) format**:

|Row|Column A (Staff)       |Column B (Sales)|
|---|-----------------------|----------------|
|1  |Header                 |Header          |
|2  |Staff Name             |                |
|3  |                       |Total Sales     |
|4  |Staff Name             |                |
|5  |                       |Total Sales     |
|…  |Repeats in same pattern|                |

**Notes:**

- Only the total sales value (second row of each pair, column B) is used
- Daily sales, package counts, averages, and extra columns are all ignored
- Empty or invalid rows are skipped automatically
- Accepted formats: `.xlsx`, `.xls`

-----

## Using the Calculator

### Online Version

**https://hijast.github.io/IncentiveCal/**

### Local Version

1. Download `index.html`
1. Open it directly in any modern browser
1. No installation or internet connection required

-----

## Bulk Mode Instructions

1. Click the **Bulk Upload** tab
1. Set the **Sales Target (AED)**
1. Adjust the **split slider** if needed (default 70/30)
1. Upload your Excel file
1. Click **Process Upload** — the tool will:
- Detect all staff and their totals
- Calculate team achievement and apply the correct tier
- Compute each person’s equal share and personal share
- Rank staff by total incentive (highest first)
1. Click **Download Results** to export an `.xlsx` file

-----

## Version History

### v2.3

- Fixed tier detection gap — values between 100% and 101% now correctly resolve to Tier 2
- Unified tier logic into a single `getTier()` function used by all calculation paths
- Added **incentive split slider** to both Individual and Bulk modes (default 70/30, range 10/90–90/10)
- Default salesperson count changed to **28**
- Bulk upload description now accurately reflects the alternating-row format
- Projection box now flags when an extra sale would trigger a tier upgrade
- Download filename updated to v2.3
- UI and typography refresh

### v2.2

- Corrected alternating-row staff & total sales detection
- Polished UI tabs to pill-style navigation
- Improved input validation in bulk mode
- Cleaned internal code structure

### v2.1

- Added Bulk Incentive Calculator
- Added Excel parsing and ranked output
- Added download feature

### v1.x

- Base Individual Incentive Calculator
- Added projections for additional sales
- Formatting and UI improvements

-----

## License

MIT License. Free for personal and workplace use.