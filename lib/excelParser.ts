/**
 * Excel Parser
 * Parse Staff Sales Tracker workbook structure
 * Handles the specific format: Staff Name, then "Count of Packages" row, then "Sales Ttl" row
 */

import * as XLSX from 'xlsx';

export interface StaffRecord {
  name: string;
  packages: number;
  sales: number;
}

export interface SheetData {
  month: string;
  year: number;
  staffRecords: StaffRecord[];
  target: number | null;
}

export interface ExcelParseResult {
  success: boolean;
  error?: string;
  sheets: SheetData[];
}

class ExcelParser {
  /**
   * Parse Excel file
   */
  parseFile(arrayBuffer: ArrayBuffer): ExcelParseResult {
    try {
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheets: SheetData[] = [];

      for (const sheetName of workbook.SheetNames) {
        // Skip non-data sheets
        if (
          sheetName.toLowerCase().includes('calculator') ||
          sheetName.toLowerCase().includes('catalogue') ||
          sheetName.toLowerCase().includes('test')
        ) {
          continue;
        }

        const sheet = workbook.Sheets[sheetName];
        const sheetData = this.parseSheet(sheet, sheetName);
        if (sheetData) {
          sheets.push(sheetData);
        }
      }

      if (sheets.length === 0) {
        return {
          success: false,
          error: 'No valid data sheets found in Excel file',
        };
      }

      return { success: true, sheets };
    } catch (error) {
      return {
        success: false,
        error: `Excel parsing error: ${error}`,
      };
    }
  }

  /**
   * Parse single sheet
   */
  private parseSheet(sheet: XLSX.WorkSheet, sheetName: string): SheetData | null {
    try {
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });

      if (rows.length < 4) return null;

      // Find header row (usually row with "STAFF" in column A)
      let headerRowIdx = -1;
      for (let i = 0; i < Math.min(rows.length, 10); i++) {
        const row = rows[i] as any[];
        if (row[0] && String(row[0]).toUpperCase().trim() === 'STAFF') {
          headerRowIdx = i;
          break;
        }
      }

      if (headerRowIdx === -1) return null;

      const { month, year } = this.parseMonthYear(sheetName);
      if (!month || !year) return null;

      const staffRecords = this.extractStaffData(rows, headerRowIdx);
      const target = this.detectTarget(rows);

      return {
        month,
        year,
        staffRecords,
        target,
      };
    } catch (error) {
      console.error(`Error parsing sheet ${sheetName}:`, error);
      return null;
    }
  }

  /**
   * Extract staff data (2-row pattern: packages, then sales)
   */
  private extractStaffData(rows: any[], headerRowIdx: number): StaffRecord[] {
    const staffRecords: StaffRecord[] = [];
    const staffMap = new Map<string, StaffRecord>();

    // Column C typically contains monthly totals
    const totalColIdx = 2; // Column C

    for (let i = headerRowIdx + 1; i < rows.length; i += 2) {
      const packageRow = rows[i] as any[];
      const salesRow = rows[i + 1] as any[];

      if (!packageRow || !packageRow[0]) continue;

      const staffName = String(packageRow[0]).trim();

      // Skip totals/summary rows
      if (
        staffName.toLowerCase().includes('total') ||
        staffName.toLowerCase().includes('grand') ||
        staffName === ''
      ) {
        continue;
      }

      const packages = this.parseNumber(packageRow[totalColIdx]) || 0;
      const sales = this.parseNumber(salesRow?.[totalColIdx]) || 0;

      if (packages === 0 && sales === 0) continue;

      const key = staffName.toLowerCase();

      if (staffMap.has(key)) {
        // Merge duplicates
        const existing = staffMap.get(key)!;
        existing.packages += packages;
        existing.sales += sales;
      } else {
        staffMap.set(key, { name: staffName, packages, sales });
      }
    }

    return Array.from(staffMap.values());
  }

  /**
   * Parse month and year from sheet name
   */
  private parseMonthYear(sheetName: string): { month: string; year: number } | null {
    const cleaned = sheetName.toLowerCase().trim();

    // Patterns: "Jun25", "Oct 25", "Oct-25", "Jun2025", etc.
    const patterns = [
      /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s*[\-\s]?(2[0-9]|[0-9]{4})$/i,
    ];

    const monthMap: { [key: string]: string } = {
      jan: 'January',
      feb: 'February',
      mar: 'March',
      apr: 'April',
      may: 'May',
      jun: 'June',
      jul: 'July',
      aug: 'August',
      sep: 'September',
      oct: 'October',
      nov: 'November',
      dec: 'December',
    };

    for (const pattern of patterns) {
      const match = cleaned.match(pattern);
      if (match) {
        const monthStr = match[1].toLowerCase();
        const yearStr = match[2];
        let year = parseInt(yearStr);

        // Handle 2-digit years
        if (yearStr.length === 2) {
          year = year >= 80 ? 1900 + year : 2000 + year;
        }

        return {
          month: monthMap[monthStr],
          year,
        };
      }
    }

    return null;
  }

  /**
   * Detect target from sheet (look for "Target" or "target" rows)
   */
  private detectTarget(rows: any[]): number | null {
    for (const row of rows) {
      if (!Array.isArray(row)) continue;

      for (let i = 0; i < row.length; i++) {
        const cell = row[i];
        if (cell && String(cell).toLowerCase().includes('target')) {
          // Try to find a number nearby
          for (let j = i + 1; j < Math.min(i + 5, row.length); j++) {
            const num = this.parseNumber(row[j]);
            if (num && num > 0) return num;
          }
          for (let j = i - 1; j >= Math.max(i - 5, 0); j--) {
            const num = this.parseNumber(row[j]);
            if (num && num > 0) return num;
          }
        }
      }
    }

    return null;
  }

  /**
   * Parse cell value to number
   */
  private parseNumber(value: any): number | null {
    if (value === null || value === undefined) return null;

    const num = Number(String(value).replace(/,/g, '').trim());
    return isNaN(num) || !isFinite(num) ? null : num;
  }

  /**
   * Validate parsed data
   */
  validateData(sheetData: SheetData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!sheetData.month || !sheetData.year) {
      errors.push('Invalid month/year');
    }

    if (sheetData.staffRecords.length === 0) {
      errors.push('No staff records found');
    }

    for (const staff of sheetData.staffRecords) {
      if (!staff.name) {
        errors.push('Staff record missing name');
      }
      if (staff.sales < 0 || staff.packages < 0) {
        errors.push(`${staff.name}: Negative values detected`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default new ExcelParser();
