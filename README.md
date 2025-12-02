# Smart Incentive Calculator  
### Version 2.2

A fast and clean incentive calculator with two modes:  
**Individual Incentive Calculation** and **Bulk Excel-Based Incentive Calculation**.

---

## Features

• Tier-based incentive logic (2.5%, 3.0%, 3.5%)  
• Automatic distribution: 70% Equal Split + 30% Personal Contribution  
• Modern UI with horizontal pill tabs  
• Bulk mode supports Smart-Salem-style Excel sheets:  
  - Column A: Staff names (every second row)  
  - Column B: Total sales (every second row, offset by one row)  
  - All other columns ignored  
• Ranked incentive output  
• Download results as spreadsheet  
• All processing is fully client-side (no data stored)

---

## Excel Upload Requirements

Your Excel sheet **must follow the SS format**:

| Row | Column A (Staff) | Column B (Sales) |
|-----|------------------|------------------|
| 1  | Header           | Header           |
| 2  | Staff Name       |                  |
| 3  |                  | Total Sales      |
| 4  | Staff Name       |                  |
| 5  |                  | Total Sales      |
| ... | Repeats in same pattern |

**Notes:**  
✓ Packages sold in the first cell are ignored  
✓ Only the total sales (the *second* cell of each pair) are used  
✓ Daily sales, averages, extra columns… all ignored  
✓ Empty rows skipped automatically  
✓ Up to 50 staff supported

---

## Using the Calculator

### Online Version  
Use it instantly here:  
**https://hijast.github.io/IncentiveCal/**

### Local Version  
1. Download the `index.html` file  
2. Open it directly in any browser  
3. No installation required

---

## Bulk Mode Instructions

1. Click the **Bulk Calculator** tab  
2. Upload your Excel sheet  
3. Enter the monthly target  
4. The tool will:  
   - Detect all staff  
   - Calculate total sales  
   - Apply Tier logic automatically  
   - Generate Equal Split and Personal 30%  
   - Rank staff by total incentive  
5. Download the generated output file

---

## Version History

### **v2.2**  
• Corrected alternating-row staff & total sales detection  
• Polished UI tabs to pill-style navigation  
• Improved input validation in bulk mode  
• Cleaned internal code structure

### **v2.1**  
• Added Bulk Incentive Calculator  
• Added Excel parsing + ranking  
• Added download feature

### **v1.x**  
• Base Individual Incentive Calculator  
• Added projections  
• Added formatting improvements

---

## License  
MIT License. Free for personal and workplace use.

---

If you want badges, screenshots, or a version changelog table, tell me.
