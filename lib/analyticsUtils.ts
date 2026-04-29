// Enhanced analytics utilities for extracting daily data from Excel

export interface DailyEntry {
  date: string  // e.g., "Day 1", "Day 2" or actual date
  packages: number
  sales: number
}

export interface PersonDailyData {
  name: string
  dailyEntries: DailyEntry[]
  totalSales: number
  totalPackages: number
  workingDays: number
  avgSalesPerDay: number
  avgPackagesPerDay: number
}

export function extractDailyDataFromSheet(worksheet: any, sheetName: string, XLSX: any): PersonDailyData[] {
  if (!worksheet) return []
  
  const range = XLSX.utils.decode_range(worksheet['!ref'])
  const personDataMap = new Map<string, PersonDailyData>()
  
  // Find daily column headers (starting from column 3)
  const dailyColumns: { col: number, date: string }[] = []
  for (let col = 3; col < range.e.c; col++) {
    const headerAddress = XLSX.utils.encode_cell({ r: 2, c: col })
    const headerCell = worksheet[headerAddress]
    
    if (headerCell && headerCell.v) {
      const headerValue = String(headerCell.v).trim()
      // Skip if it's the total column
      if (headerValue.toLowerCase().includes('ttl') || headerValue.toLowerCase().includes('total')) {
        continue
      }
      // It's a daily column
      dailyColumns.push({ col, date: headerValue })
    }
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
        const dailyEntries: DailyEntry[] = []
        
        // Extract daily data for each column
        dailyColumns.forEach(({ col, date }) => {
          const pkgAddress = XLSX.utils.encode_cell({ r: row - 1, c: col })
          const salesAddress = XLSX.utils.encode_cell({ r: row, c: col })
          
          const pkgCell = worksheet[pkgAddress]
          const salesCell = worksheet[salesAddress]
          
          let packages = 0
          let sales = 0
          
          // Parse packages
          if (pkgCell && pkgCell.v !== 'NA' && pkgCell.v !== null && pkgCell.v !== undefined && pkgCell.v !== '') {
            if (typeof pkgCell.v === 'number') {
              packages = pkgCell.v
            } else if (pkgCell.w) {
              packages = parseFloat(pkgCell.w) || 0
            }
          }
          
          // Parse sales
          if (salesCell && salesCell.v !== 'NA' && salesCell.v !== null && salesCell.v !== undefined && salesCell.v !== '') {
            if (typeof salesCell.v === 'number') {
              sales = salesCell.v
            } else if (salesCell.w) {
              sales = parseFloat(salesCell.w) || 0
            }
          }
          
          // Only add if there's actual data
          if (packages > 0 || sales > 0) {
            dailyEntries.push({
              date: `${sheetName}-${date}`,
              packages: Math.round(packages),
              sales: Math.round(sales * 100) / 100
            })
          }
        })
        
        const totalSales = dailyEntries.reduce((sum, e) => sum + e.sales, 0)
        const totalPackages = dailyEntries.reduce((sum, e) => sum + e.packages, 0)
        const workingDays = dailyEntries.filter(e => e.sales > 0).length
        
        personDataMap.set(name, {
          name,
          dailyEntries,
          totalSales,
          totalPackages,
          workingDays,
          avgSalesPerDay: workingDays > 0 ? totalSales / workingDays : 0,
          avgPackagesPerDay: workingDays > 0 ? totalPackages / workingDays : 0
        })
      }
      
      row += 2
    } else if (nameCell && String(nameCell.v).trim() === 'Grand totals') {
      break
    } else {
      row++
    }
  }
  
  return Array.from(personDataMap.values())
}

export function aggregatePersonData(allSheetsData: PersonDailyData[][]): PersonDailyData[] {
  const personMap = new Map<string, PersonDailyData>()
  
  // Aggregate all daily entries for each person across sheets
  allSheetsData.forEach(sheetData => {
    sheetData.forEach(person => {
      if (!personMap.has(person.name)) {
        personMap.set(person.name, {
          name: person.name,
          dailyEntries: [],
          totalSales: 0,
          totalPackages: 0,
          workingDays: 0,
          avgSalesPerDay: 0,
          avgPackagesPerDay: 0
        })
      }
      
      const existing = personMap.get(person.name)!
      existing.dailyEntries.push(...person.dailyEntries)
      existing.totalSales += person.totalSales
      existing.totalPackages += person.totalPackages
      existing.workingDays += person.workingDays
    })
  })
  
  // Recalculate averages
  personMap.forEach(person => {
    person.avgSalesPerDay = person.workingDays > 0 ? person.totalSales / person.workingDays : 0
    person.avgPackagesPerDay = person.workingDays > 0 ? person.totalPackages / person.workingDays : 0
  })
  
  return Array.from(personMap.values())
}
