import * as XLSX from 'xlsx';

interface StaffRecord {
  name: string;
  sales: number;
}

interface SheetData {
  month: number;
  year: number;
  target: number;
  staffRecords: StaffRecord[];
}

interface ExcelParseResult {
  success: boolean;
  sheets?: SheetData[];
  error?: string;
}

class ExcelParser {
  parseFile(arrayBuffer: ArrayBuffer): ExcelParseResult {
    try {
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheets: SheetData[] = [];

      for (const sheetName of workbook.SheetNames) {
        // Skip utility sheets
        if (['Template', 'Config', 'Notes', 'Tiers'].includes(sheetName)) {
          continue;
        }

        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) continue;

        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];

        if (data.length < 4) {
          continue;
        }

        // Parse sheet name as month/year
        const matches = sheetName.match(/(\w+)(\d{2,4})?/);
        if (!matches) continue;

        const monthNames: Record<string, number> = {
          jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
          jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
          january: 1, february: 2, march: 3, april: 4, june: 6,
          july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
        };

        const month = monthNames[matches[1].toLowerCase()] || new Date().getMonth() + 1;
        const year = matches[2] ? parseInt(matches[2]) : new Date().getFullYear();

        // Extract target and staff records
        const target = parseFloat(data[0]?.[2] || '10000') || 10000;
        const staffRecords: StaffRecord[] = [];

        // Row 2 is headers, then 2-row pattern for each staff
        for (let i = 3; i < data.length; i += 2) {
          const name = data[i]?.[0];
          const sales = parseFloat(data[i]?.[2] || '0') || 0;

          if (name && sales > 0) {
            staffRecords.push({ name: String(name), sales });
          }
        }

        if (staffRecords.length > 0) {
          sheets.push({ month, year, target, staffRecords });
        }
      }

      if (sheets.length === 0) {
        return {
          success: false,
          sheets: [],
          error: 'No valid data sheets found in Excel file',
        };
      }

      return {
        success: true,
        sheets: sheets.sort((a, b) => {
          const dateA = new Date(a.year, a.month - 1);
          const dateB = new Date(b.year, b.month - 1);
          return dateB.getTime() - dateA.getTime();
        }),
      };
    } catch (error) {
      return {
        success: false,
        sheets: [],
        error: `Failed to parse Excel file: ${error}`,
      };
    }
  }
}

export default new ExcelParser();
export type { StaffRecord, SheetData, ExcelParseResult };
