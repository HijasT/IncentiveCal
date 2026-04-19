import * as XLSX from 'xlsx';
import { StaffMember, ExcelSheetData, ViewMode } from '@/types/calculator';

export function getAvailableMonths(workbook: XLSX.WorkBook): string[] {
  const months: string[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  workbook.SheetNames.forEach((sheetName) => {
    const hasMonth = monthNames.some((month) => sheetName.includes(month));
    const hasYear = /\d{2}/.test(sheetName);

    if (hasMonth && hasYear && sheetName.length <= 10) {
      months.push(sheetName);
    }
  });

  return months.sort();
}

export function extractStaffFromSheet(
  worksheet: XLSX.WorkSheet,
  sheetName: string
): ExcelSheetData {
  if (!worksheet) return { staff: [], target: 0 };

  const staff: StaffMember[] = [];
  let target = 0;

  // Find target - search for "TARGET" label
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
  for (let row = 0; row < Math.min(100, range.e.r); row++) {
    for (let col = 0; col < Math.min(20, range.e.c); col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];

      if (cell && cell.v && String(cell.v).trim().toUpperCase() === 'TARGET') {
        const targetAddress = XLSX.utils.encode_cell({ r: row, c: col + 1 });
        const targetCell = worksheet[targetAddress];
        if (targetCell && targetCell.v) {
          target = parseFloat(String(targetCell.v));
          break;
        }
      }
    }
    if (target > 0) break;
  }

  // Find the column for this month's total
  let monthTotalCol = -1;
  const monthPattern = sheetName.toLowerCase();

  for (let col = 0; col <= range.e.c; col++) {
    const headerAddress = XLSX.utils.encode_cell({ r: 2, c: col });
    const headerCell = worksheet[headerAddress];

    if (headerCell && headerCell.v) {
      const headerValue = String(headerCell.v).toLowerCase();
      const [monthPart, yearPart] = monthPattern.split(' ');

      if (
        headerValue.includes(monthPart) &&
        headerValue.includes(yearPart) &&
        (headerValue.includes('ttl') || headerValue.includes('total'))
      ) {
        monthTotalCol = col;
        break;
      }
    }
  }

  if (monthTotalCol === -1) {
    console.warn(`Could not find total column for ${sheetName}`);
    return { staff: [], target };
  }

  // Extract staff data starting from row 4
  let row = 3; // Row 4 in Excel (0-indexed)

  while (row <= range.e.r) {
    const nameAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
    const typeAddress = XLSX.utils.encode_cell({ r: row, c: 1 });

    const nameCell = worksheet[nameAddress];
    const typeCell = worksheet[typeAddress];

    if (nameCell && typeCell && typeCell.v === 'Count of Packages') {
      const name = String(nameCell.v).trim();

      if (name && !['STAFF', 'p25', '`', 'Grand totals'].includes(name)) {
        const pkgAddress = XLSX.utils.encode_cell({ r: row, c: monthTotalCol });
        const salesAddress = XLSX.utils.encode_cell({ r: row + 1, c: monthTotalCol });

        const pkgCell = worksheet[pkgAddress];
        const salesCell = worksheet[salesAddress];

        let packages = 0;
        let sales = 0;

        if (pkgCell && pkgCell.v !== 'NA') {
          packages = typeof pkgCell.v === 'number' ? pkgCell.v : parseFloat(String(pkgCell.w || 0));
        }

        if (salesCell && salesCell.v !== 'NA') {
          sales = typeof salesCell.v === 'number' ? salesCell.v : parseFloat(String(salesCell.w || 0));
        }

        staff.push({
          name,
          packages: Math.round(packages),
          sales: Math.round(sales * 100) / 100,
        });
      }

      row += 2;
    } else if (nameCell && String(nameCell.v).trim() === 'Grand totals') {
      break;
    } else {
      row++;
    }
  }

  return { staff, target };
}

export function aggregateMultipleSheets(
  workbook: XLSX.WorkBook,
  sheetNames: string[]
): ExcelSheetData {
  const aggregated: Record<string, StaffMember> = {};
  let totalTarget = 0;

  sheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const { staff, target } = extractStaffFromSheet(worksheet, sheetName);

    totalTarget += target;

    staff.forEach((person) => {
      if (!aggregated[person.name]) {
        aggregated[person.name] = { name: person.name, packages: 0, sales: 0 };
      }
      aggregated[person.name].packages += person.packages;
      aggregated[person.name].sales += person.sales;
    });
  });

  return {
    staff: Object.values(aggregated),
    target: totalTarget,
  };
}

export function getSheetsForView(
  workbook: XLSX.WorkBook,
  viewMode: ViewMode,
  month: string,
  year: string
): string[] {
  const allMonths = getAvailableMonths(workbook);
  const currentSheetName = `${month} ${year}`;

  if (viewMode === 'monthly') {
    return [currentSheetName];
  }

  if (viewMode === 'alltime') {
    return allMonths;
  }

  if (viewMode === 'yearly') {
    return allMonths.filter((m) => m.includes(year));
  }

  const quarters: Record<string, string[]> = {
    q1: ['Jan', 'Feb', 'Mar'],
    q2: ['Apr', 'May', 'Jun'],
    q3: ['Jul', 'Aug', 'Sep'],
    q4: ['Oct', 'Nov', 'Dec'],
  };

  const quarterMonths = quarters[viewMode] || [];

  return allMonths.filter((m) => {
    const [monthName, monthYear] = m.split(' ');
    return quarterMonths.includes(monthName) && monthYear === year;
  });
}

export function getAvailableYears(workbook: XLSX.WorkBook): string[] {
  const months = getAvailableMonths(workbook);
  const years = [...new Set(months.map((sheet) => sheet.split(' ')[1]))];
  return years.sort();
}

export function detectCurrentMonth(months: string[]): string | null {
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear().toString().slice(-2);
  const target = `${month} ${year}`;

  return months.find((sheet) => sheet === target) || null;
}

export async function readExcelFile(file: File): Promise<XLSX.WorkBook> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(workbook);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
