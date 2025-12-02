# Smart Incentive Calculator

**Version:** v1.5

A web-based calculator to calculate sales incentives for your team.  
It considers total sales, personal sales, sales target, and number of salespersons.  
Includes:

- Tier-based incentive calculation (Tier 1, Tier 2, Tier 3)
- 70% equal split across team
- 30% individual contribution based on sales
- Projected incentives for additional packages sold by yourself or others
- Motivational quotes fetched online
- Dark/Light mode toggle
- Three decimal precision for intermediate calculations

---

### **Usage**

You can use the calculator locally by opening `index.html` in a browser, or access it online at: [Smart Incentive Calculator](https://hijast.github.io/IncentiveCal/)

1. Enter the following:
   - Sales Target (AED)
   - Total Sales (AED)
   - Personal Sales (AED)
   - Number of Salespersons (default 25)
2. Click **Calculate**.
3. View:
   - Incentive Tier
   - Equal Split (70%)
   - Personal 30%
   - Total Incentive
   - Projected Incentives
   - Motivational Quote

---

### **Versioning**

- v1.0: Initial release  
- v1.1 - v1.4: Feature updates  
- **v1.5**: Dark mode toggle moved to top-right, version and toggle on second line, minor UI improvements  

---

### **Notes**

- 3-digit decimal precision used for Equal Split, Personal 30%, and Personal Sales %  
- Total Incentive rounded to 2 decimals  
- Dark/Light mode icon: ☀️ (light) / 🌙 (dark)  
- Motivational quotes fetched from [ZenQuotes API](https://zenquotes.io)
