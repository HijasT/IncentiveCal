// Excel processing utilities for Bulk tab

export interface StaffData {
  name: string
  packages: number
  sales: number
  workingDays: number
  clients?: number // Added for May 26 onwards
}

export interface ExcelData {
  sheetName: string
  staff: StaffData[]
  target: number
  teamTotal: {
    packages: number
    sales: number
  }
}

export async function parseExcelFile(file: File): Promise<ExcelData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          reject(new Error('No data read from file'))
          return
        }

        // Use xlsx library loaded from CDN
        const XLSX = (window as any).XLSX
        if (!XLSX) {
          reject(new Error('XLSX library not loaded. Please refresh the page.'))
          return
        }

        // Convert to Uint8Array like in original HTML
        const uint8Data = new Uint8Array(data as ArrayBuffer)
        const workbook = XLSX.read(uint8Data, { type: 'array' })
        const results: ExcelData[] = []

        // Get valid month sheets only
        const monthSheets = getAvailableMonthsFromWorkbook(workbook)

        // Process each valid month sheet
        for (const sheetName of monthSheets) {
          const worksheet = workbook.Sheets[sheetName]
          const extracted = extractStaffFromSheet(worksheet, sheetName, XLSX)
          
          results.push({
            sheetName,
            staff: extracted.staff,
            target: extracted.target,
            teamTotal: {
              packages: extracted.staff.reduce((sum, s) => sum + s.packages, 0),
              sales: extracted.staff.reduce((sum, s) => sum + s.sales, 0)
            }
          })
        }

        if (results.length === 0) {
          reject(new Error('No valid month sheets found in Excel file'))
          return
        }

        resolve(results)
      } catch (error) {
        console.error('Excel parsing error:', error)
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file) // Use ArrayBuffer like original HTML
  })
}

// Get available month sheets - accepts both abbreviated and full month names,
// normalises everything to short form so downstream code stays consistent.
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const FULL_TO_SHORT: Record<string, string> = {
  January: 'Jan', February: 'Feb', March: 'Mar', April: 'Apr',
  June: 'Jun', July: 'Jul', August: 'Aug', September: 'Sep',
  October: 'Oct', November: 'Nov', December: 'Dec',
  // May is already short, no entry needed
}

function normaliseSheetName(name: string): string {
  for (const [full, abbr] of Object.entries(FULL_TO_SHORT)) {
    if (name.includes(full)) return name.replace(full, abbr)
  }
  return name
}

function getAvailableMonthsFromWorkbook(workbook: any): string[] {
  const allNames = [...SHORT_MONTHS, ...Object.keys(FULL_TO_SHORT), 'May']
  const months: string[] = []

  workbook.SheetNames.forEach((sheetName: string) => {
    const hasMonth = allNames.some(m => sheetName.includes(m))
    const hasYear  = /\d{2}/.test(sheetName)

    // Accept up to 15 chars to cover "September 26" (12) etc.
    if (hasMonth && hasYear && sheetName.length <= 15) {
      months.push(normaliseSheetName(sheetName))
    }
  })

  return months.sort()
}

// Extract staff from sheet - matches original HTML extractStaffFromSheet
function extractStaffFromSheet(worksheet: any, sheetName: string, XLSX: any): { staff: StaffData[], target: number } {
  if (!worksheet) return { staff: [], target: 0 }
  
  const staff: StaffData[] = []
  let target = 0
  
  // Find target - search for "TARGET" label (same as HTML)
  for (let row = 1; row <= 100; row++) {
    for (let col = 1; col <= 20; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row - 1, c: col - 1 })
      const cell = worksheet[cellAddress]
      
      if (cell && cell.v && String(cell.v).trim().toUpperCase() === 'TARGET') {
        const targetAddress = XLSX.utils.encode_cell({ r: row - 1, c: col })
        const targetCell = worksheet[targetAddress]
        if (targetCell && targetCell.v) {
          target = parseFloat(targetCell.v)
          break
        }
      }
    }
    if (target > 0) break
  }
  
  // Find the column for this month's total
  const range = XLSX.utils.decode_range(worksheet['!ref'])
  let monthTotalCol = -1
  
  // Search header row (row 3, index 2) for month total column
  for (let col = 0; col <= range.e.c; col++) {
    const headerAddress = XLSX.utils.encode_cell({ r: 2, c: col })
    const headerCell = worksheet[headerAddress]
    
    if (headerCell && headerCell.v) {
      const headerValue = String(headerCell.v).toLowerCase()
      const sheetNameLower = sheetName.toLowerCase()
      
      // Check if header contains the month name and "ttl" or "total"
      if (headerValue.includes(sheetNameLower.split(' ')[0]) && // Month name
          headerValue.includes(sheetNameLower.split(' ')[1]) && // Year
          (headerValue.includes('ttl') || headerValue.includes('total'))) {
        monthTotalCol = col
        break
      }
    }
  }
  
  // Fallback: use column 2 if month total column not found
  if (monthTotalCol === -1) {
    console.warn(`Could not find total column for ${sheetName}, using column 2`)
    monthTotalCol = 2
  }
  
  // Extract staff data starting from row 4
  let row = 4
  
  while (row <= range.e.r) {
    const nameAddress = XLSX.utils.encode_cell({ r: row - 1, c: 0 })
    const typeAddress = XLSX.utils.encode_cell({ r: row - 1, c: 1 })
    
    const nameCell = worksheet[nameAddress]
    const typeCell = worksheet[typeAddress]
    
    if (nameCell && typeCell && typeCell.v === 'Count of Packages') {
      const name = String(nameCell.v).trim()
      
      // Check if the next row has "Count of Clients" (new format from May 26 onwards)
      const nextRowTypeAddress = XLSX.utils.encode_cell({ r: row, c: 1 })
      const nextRowTypeCell = worksheet[nextRowTypeAddress]
      const hasClientsRow = nextRowTypeCell && String(nextRowTypeCell.v).includes('Count of Clients')
      
      if (name && !['STAFF', 'p25', '`', 'Grand totals'].includes(name)) {
        // Determine row offsets based on format
        let salesRowOffset = hasClientsRow ? 2 : 1  // Sales is either +1 or +2 rows down
        
        // Get packages and sales from the month's total column
        const pkgAddress = XLSX.utils.encode_cell({ r: row - 1, c: monthTotalCol })
        const salesAddress = XLSX.utils.encode_cell({ r: row - 1 + salesRowOffset, c: monthTotalCol })
        
        const pkgCell = worksheet[pkgAddress]
        const salesCell = worksheet[salesAddress]
        
        let packages = 0
        let sales = 0
        let clients = 0
        let workingDays = 0
        
        // Handle packages (could be formula or number)
        if (pkgCell && pkgCell.v !== 'NA') {
          if (typeof pkgCell.v === 'number') {
            packages = pkgCell.v
          } else if (typeof pkgCell.w === 'string') {
            packages = parseFloat(pkgCell.w) || 0
          }
        }
        
        // Handle clients if present (new format)
        if (hasClientsRow) {
          const clientsAddress = XLSX.utils.encode_cell({ r: row, c: monthTotalCol })
          const clientsCell = worksheet[clientsAddress]
          
          if (clientsCell && clientsCell.v !== 'NA') {
            if (typeof clientsCell.v === 'number') {
              clients = clientsCell.v
            } else if (typeof clientsCell.w === 'string') {
              clients = parseFloat(clientsCell.w) || 0
            }
          }
        }
        
        // Handle sales (could be formula or number)
        if (salesCell && salesCell.v !== 'NA') {
          if (typeof salesCell.v === 'number') {
            sales = salesCell.v
          } else if (typeof salesCell.w === 'string') {
            sales = parseFloat(salesCell.w) || 0
          }
        }
        
        // Identify genuine daily columns: headers whose value is an integer 1–31.
        // This excludes summary columns (weekly totals, averages, percentiles etc.)
        // which hold text or large date-serial values, preventing over-counting.
        const dayColumns: number[] = []
        for (let col = 3; col <= range.e.c; col++) {
          if (col === monthTotalCol) continue
          const hAddr = XLSX.utils.encode_cell({ r: 2, c: col })
          const hCell = worksheet[hAddr]
          if (!hCell) continue
          // Raw value: plain integer 1-31
          if (typeof hCell.v === 'number' && Number.isInteger(hCell.v) && hCell.v >= 1 && hCell.v <= 31) {
            dayColumns.push(col)
            continue
          }
          // Formatted value: string that is purely a number 1-31 (handles some date formats)
          if (hCell.w) {
            const w = String(hCell.w).trim()
            const n = parseInt(w, 10)
            if (!isNaN(n) && n >= 1 && n <= 31 && String(n) === w) {
              dayColumns.push(col)
            }
          }
        }

        // Count working days only across genuine day columns
        for (const col of dayColumns) {
          const dailySalesAddress = XLSX.utils.encode_cell({ r: row - 1 + salesRowOffset, c: col })
          const dailyCell = worksheet[dailySalesAddress]

          if (dailyCell && dailyCell.v !== 'NA' && dailyCell.v !== null &&
              dailyCell.v !== undefined && dailyCell.v !== '') {
            const value = typeof dailyCell.v === 'number'
              ? dailyCell.v
              : parseFloat(String(dailyCell.w || dailyCell.v || '0'))
            if (!isNaN(value) && value > 0) {
              workingDays++
            }
          }
        }
        
        // Fallback: if no working days counted but has sales, estimate as 1 day minimum
        if (workingDays === 0 && sales > 0) {
          workingDays = 1
        }
        
        const staffEntry: StaffData = {
          name,
          packages: Math.round(packages),
          sales: Math.round(sales * 100) / 100,
          workingDays
        }
        
        // Add clients if available (new format)
        if (hasClientsRow && clients > 0) {
          staffEntry.clients = Math.round(clients)
        }
        
        staff.push(staffEntry)
      }
      
      row += hasClientsRow ? 3 : 2
    } else if (nameCell && String(nameCell.v).trim() === 'Grand totals') {
      break
    } else {
      row++
    }
  }
  
  return { staff, target }
}

export function getAvailableMonths(data: ExcelData[]): string[] {
  return data.map(d => d.sheetName).sort()
}

export function aggregateSheets(sheets: ExcelData[]): ExcelData {
  const aggregated: Record<string, StaffData> = {}
  let totalPackages = 0
  let totalSales = 0
  let totalTarget = 0

  sheets.forEach(sheet => {
    sheet.staff.forEach(person => {
      if (!aggregated[person.name]) {
        aggregated[person.name] = { name: person.name, packages: 0, sales: 0, workingDays: 0, clients: 0 }
      }
      aggregated[person.name].packages += person.packages
      aggregated[person.name].sales += person.sales
      aggregated[person.name].workingDays += person.workingDays
      if (person.clients) {
        aggregated[person.name].clients = (aggregated[person.name].clients || 0) + person.clients
      }
    })
    totalPackages += sheet.teamTotal.packages
    totalSales += sheet.teamTotal.sales
    totalTarget += sheet.target
  })

  return {
    sheetName: 'Aggregated',
    staff: Object.values(aggregated),
    target: totalTarget,
    teamTotal: {
      packages: totalPackages,
      sales: totalSales
    }
  }
}
