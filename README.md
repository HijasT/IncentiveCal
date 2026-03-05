Smart Incentive Calculator
<p align="center"> <img src="https://hijast.github.io/IncentiveCal/assets/brand/banner.png" alt="Smart Incentive Calculator Banner" width="900"> </p> <p align="center"> <b>A privacy-first browser tool for calculating sales incentives.</b> </p> <p align="center"> <img src="https://img.shields.io/badge/version-4.2-blue"> <img src="https://img.shields.io/badge/license-MIT-green"> <img src="https://img.shields.io/badge/platform-Browser-orange"> <img src="https://img.shields.io/badge/privacy-100%25%20local-success"> </p>
Live Demo

GitHub Pages

https://hijast.github.io/IncentiveCal/

No installation required.

Runs fully in your browser.

About

Smart Incentive Calculator is a fully client-side incentive computation tool designed for sales teams.

It supports both individual calculations and bulk Excel processing, automatically extracting sales data and computing incentives with configurable splits.

Your Excel files never leave your device.
Everything runs locally in your browser.

Features
<details> <summary><b>Individual Mode</b></summary>

Quick single-staff incentive calculation.

Features:

Tier-based incentive calculation

Adjustable Equal / Personal split

Projection for additional AED 1,695 sale

Animated performance bar

Copy result to clipboard

Light / Dark mode UI

Instant recalculation

</details>
<details> <summary><b>Bulk Excel Mode</b></summary>

Upload an Excel report and compute incentives for the entire team.

Capabilities:

Automatic sheet detection

Extracts staff names

Extracts package counts

Extracts sales values

Calculates:

Achievement %

Tier

Incentive pool

Equal share

Personal share

Staff ranking with medals

Remove staff and recalculate instantly

Search staff

Download results as Excel

</details>
<details> <summary><b>Smart Excel Parsing</b></summary>

Supports multiple sheet naming formats:

Feb26
Feb 26
February 2026
Feb-2026
Oct25

Uses score-based sheet detection to automatically select the correct sheet.

Staff format supported:

Row	Column A	Other Columns
Row 1	Staff name	Package counts
Row 2	(blank)	Sales values

Automatically ignores:

Grand totals

Summary rows

Empty rows

</details>
<details> <summary><b>Ranking & Analytics</b></summary>

Supports multiple ranking modes:

Monthly

Quarterly

Annual

Overall

Sorting priority:

Sales

Packages

Total incentive

New joiners are automatically included with zero values for previous months.

</details>
Incentive Tier Structure
Achievement	Tier	Rate
Below 85%	No Incentive	0%
85% – 100%	Tier 1	2.5%
100.01% – 110%	Tier 2	3.0%
Above 110%	Tier 3	3.5%

Tier boundaries are gap-free and handle decimals correctly.

Incentive Split

Adjust the incentive distribution between team and personal contributions.

Component	Description
Equal Share	Distributed evenly across staff
Personal Share	Based on individual sales contribution

Slider range:

10% → 90%

All calculations update instantly.

How to Use
<details> <summary><b>Individual Mode</b></summary>

Enter total sales

Enter target

Adjust split slider

View calculated incentive

</details>
<details> <summary><b>Bulk Mode</b></summary>

Select Month

Select Year

Upload Excel file

Click Process

Review ranked results

Remove staff if required

Download updated results

</details>
Privacy

Smart Incentive Calculator is designed with privacy as the default.

✔ No file uploads
✔ No server processing
✔ No analytics
✔ No tracking

All processing happens inside your browser.

Version History
<details> <summary><b>Click to expand</b></summary>
v1.0

Initial release.

Basic incentive calculator with manual inputs.

v1.1

Improved calculation accuracy.

Fixed rounding issues

Improved tier boundary handling

v1.2

User interface improvements.

Added performance bar

Improved responsive layout

v1.3

Major usability update.

Added Equal / Personal split slider

Live recalculation

Copy-to-clipboard functionality

v2.0

Introduced Bulk Excel Mode.

Excel upload

Staff extraction

Package and sales parsing

Incentive calculations for teams

Ranked results table

v2.1

Bulk mode reliability improvements.

Improved Excel parsing

Better error handling

Ignored invalid rows

v2.3

Performance improvements.

Faster Excel processing

UI refinements

v3.0

Bulk parser redesign.

Added support for two-row staff format

Improved data extraction

Added Excel download

v3.1

Major usability improvements.

Automatic month/year sheet detection

Removed manual target and staff inputs

Removable staff with live recalculation

Staff count display

Improved ranking table

v4.0

Bulk processing engine upgrade.

Score-based sheet detection

Improved month parsing

Sheet candidate warnings

v4.1

Advanced ranking features.

Monthly / Quarterly / Annual / Overall modes

Year range filtering

New joiner support

v4.2

Reliability and validation improvements.

Missing month warnings

Missing target warnings

Duplicate month detection

Staff name deduplication

Improved column detection (e.g. Oct Total fallback)

</details>
License

MIT License

Free for personal, professional, and commercial use.
