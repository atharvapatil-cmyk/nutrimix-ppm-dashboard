export interface ProcessedComplaint {
  timestamp: Date
  weekLabel: string
  monthLabel: string
  product: string
  packaging: string
  flavour: string
  productCat: string
  issueType: string
  valid: boolean
}

export interface PeriodMetrics {
  periodKey: string
  periodType: 'W' | 'M'
  salesTotal: number
  salesByPkg: Record<string, number>
  salesByProdCat: Record<string, number>
  compByPkgExcl: Record<string, number>
  compByPkgIncl: Record<string, number>
  compByIssue: Record<string, number>
  compByProdCatExcl: Record<string, number>
  compByProdCatIncl: Record<string, number>
  compByProdCatCritExcl: Record<string, number>
  compByProdCatCritIncl: Record<string, number>
  compByPkgPrimExcl: Record<string, number>
  compByPkgPrimIncl: Record<string, number>
  compByPkgSecExcl: Record<string, number>
  compByPkgSecIncl: Record<string, number>
  compByPkgInfExcl: Record<string, number>
  compByPkgInfIncl: Record<string, number>
}

export interface KPIData {
  lastWeek: string
  lastWeekLabel: string
  sales: number
  salesPrev: number
  complaintsExcl: number
  complaintsExclPrev: number
  ppmExcl: number
  ppmExclPrev: number
  ppmDelta: number
  ppmDeltaPct: number
}

export interface PPMRow {
  label: string
  totalSales: number
  totalComplaints: number
  totalPPM: number
  periods: Array<{ periodKey: string; sales: number; complaints: number; ppm: number }>
}

export interface SectionData {
  title: string
  periods: string[]
  rows: PPMRow[]
  grandTotal: {
    totalSales: number
    totalComplaints: number
    totalPPM: number
    periods: Array<{ sales: number; complaints: number; ppm: number }>
  }
}

export interface DashboardData {
  metrics: Record<string, PeriodMetrics>
  weeks: string[]
  months: string[]
  lastUpdated: string
  uniqueProductCats: string[]
  kpi: KPIData
  stats: {
    totalRaw: number
    totalNutrimix: number
    totalValid: number
    totalInvalid: number
    totalDuplicates: number
    salesRowsProcessed?: number
    salesRowsFiltered?: number
    salesHeaders?: string[]
    ljHeaders?: string[]
  }
}
