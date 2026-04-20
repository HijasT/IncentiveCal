// Excel processing utilities for Bulk tab

export interface StaffData {
  name: string
  packages: number
  sales: number
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

// Get available month sheets - matches original HTML logic
function getAvailableMonthsFromWorkbook(workbook: any): string[] {
  const months: string[] = []
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  workbook.SheetNames.forEach((sheetName: string) => {
    const hasMonth = monthNames.some(month => sheetName.includes(month))
    const hasYear = /\d{2}/.test(sheetName)
    
    if (hasMonth && hasYear && sheetName.length <= 10) {
      months.push(sheetName)
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
      
      if (name && !['STAFF', 'p25', '`', 'Grand totals'].includes(name)) {
        // Get packages and sales from the month's total column
        const pkgAddress = XLSX.utils.encode_cell({ r: row - 1, c: monthTotalCol })
        const salesAddress = XLSX.utils.encode_cell({ r: row, c: monthTotalCol })
        
        const pkgCell = worksheet[pkgAddress]
        const salesCell = worksheet[salesAddress]
        
        let packages = 0
        let sales = 0
        
        // Handle packages (could be formula or number)
        if (pkgCell && pkgCell.v !== 'NA') {
          if (typeof pkgCell.v === 'number') {
            packages = pkgCell.v
          } else if (typeof pkgCell.w === 'string') {
            packages = parseFloat(pkgCell.w) || 0
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
        
        staff.push({
          name,
          packages: Math.round(packages),
          sales: Math.round(sales * 100) / 100
        })
      }
      
      row += 2
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
        aggregated[person.name] = { name: person.name, packages: 0, sales: 0 }
      }
      aggregated[person.name].packages += person.packages
      aggregated[person.name].sales += person.sales
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
