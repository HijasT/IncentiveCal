// Excel processing utilities for Bulk tab

export interface StaffData {
  name: string
  packages: number
  sales: number
}

export interface ExcelData {
  sheetName: string
  staff: StaffData[]
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
          reject(new Error('XLSX library not loaded'))
          return
        }

        const workbook = XLSX.read(data, { type: 'binary' })
        const results: ExcelData[] = []

        // Process each sheet
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
          
          const staffList: StaffData[] = []
          let teamPackages = 0
          let teamSales = 0

          // Parse rows - every 2 rows represent one staff member
          for (let i = 2; i < jsonData.length; i += 2) {
            const packageRow = jsonData[i] as any[]
            const salesRow = jsonData[i + 1] as any[]

            if (!packageRow || !salesRow) continue

            const staffName = packageRow[0]
            const reportType = packageRow[1]

            // Check if this is a staff entry
            if (staffName && reportType === 'Count of Packages') {
              const packages = parseFloat(packageRow[2]) || 0
              const sales = parseFloat(salesRow[2]) || 0

              // Skip if name is "Grand totals" or empty
              if (staffName !== 'Grand totals' && staffName.trim() !== '') {
                staffList.push({
                  name: String(staffName).trim(),
                  packages: Math.round(packages),
                  sales: Math.round(sales)
                })
              }

              // Track team totals (from Grand totals row)
              if (staffName === 'Grand totals') {
                teamPackages = Math.round(packages)
                teamSales = Math.round(sales)
              }
            }
          }

          // If no grand totals found, calculate from sum
          if (teamPackages === 0) {
            teamPackages = staffList.reduce((sum, s) => sum + s.packages, 0)
            teamSales = staffList.reduce((sum, s) => sum + s.sales, 0)
          }

          results.push({
            sheetName,
            staff: staffList,
            teamTotal: {
              packages: teamPackages,
              sales: teamSales
            }
          })
        }

        resolve(results)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsBinaryString(file)
  })
}

export function getAvailableMonths(data: ExcelData[]): string[] {
  return data.map(d => d.sheetName).sort()
}

export function aggregateSheets(sheets: ExcelData[]): ExcelData {
  const aggregated: Record<string, StaffData> = {}
  let totalPackages = 0
  let totalSales = 0

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
  })

  return {
    sheetName: 'Aggregated',
    staff: Object.values(aggregated),
    teamTotal: {
      packages: totalPackages,
      sales: totalSales
    }
  }
}
