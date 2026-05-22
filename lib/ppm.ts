import { START_YEAR, START_WEEK, PACKAGING_ORDER, ALL_ISSUE_TYPES, EXCLUDE_FROM_PPM, CRITICAL_ISSUES } from './constants'
import type { PeriodMetrics, KPIData, PPMRow, SectionData, DashboardData } from './types'

export function getWeekNumber(date: Date): number {
  const yearStart = new Date(date.getFullYear(), 0, 1)
  const dayOfYear = Math.floor((date.getTime() - yearStart.getTime()) / 86400000) + 1
  return Math.min(Math.ceil(dayOfYear / 7), 52)
}

export function weekLabel(date: Date): string {
  return `W${getWeekNumber(date)}-${date.getFullYear()}`
}

export function monthLabel(date: Date): string {
  return `M${date.getMonth() + 1}-${date.getFullYear()}`
}

export function weekKeyToLabel(wk: string): string {
  const parts = wk.slice(1).split('-')
  const wn = parseInt(parts[0])
  const yr = parseInt(parts[1])

  const sd = (wn - 1) * 7 + 1
  const s = new Date(yr, 0, sd)
  const e = wn === 52 ? new Date(yr, 11, 31) : new Date(yr, 0, sd + 6)

  const mn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `W${wn} (${s.getDate()} ${mn[s.getMonth()]}–${e.getDate()} ${mn[e.getMonth()]})`
}

export function monthKeyToLabel(mk: string): string {
  const parts = mk.slice(1).split('-')
  const mo = parseInt(parts[0])
  const yr = parseInt(parts[1])

  const mn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${mn[mo - 1]} ${yr}`
}

export function weekSortKey(wk: string): number {
  const parts = wk.slice(1).split('-')
  const wn = parseInt(parts[0])
  const yr = parseInt(parts[1])
  return yr * 100 + wn
}

export function getAllWeeks(): string[] {
  const weeks: string[] = []
  const now = new Date()
  const startDate = new Date(START_YEAR, 0, 1)

  let current = new Date(startDate)
  while (current <= now) {
    weeks.push(weekLabel(current))
    current.setDate(current.getDate() + 7)
  }

  // Add unique weeks only
  return Array.from(new Set(weeks)).sort((a, b) => weekSortKey(a) - weekSortKey(b))
}

export function getAllMonths(): string[] {
  const months: string[] = []
  const now = new Date()

  for (let y = START_YEAR; y <= now.getFullYear(); y++) {
    const startMonth = y === START_YEAR ? START_WEEK - 1 : 0
    const endMonth = y === now.getFullYear() ? now.getMonth() : 11

    for (let m = startMonth; m <= endMonth; m++) {
      months.push(`M${m + 1}-${y}`)
    }
  }

  return months
}

export function getLastCompletedWeek(): string {
  const now = new Date()
  const currentWeek = getWeekNumber(now)
  const lastWeek = currentWeek === 1 ? 52 : currentWeek - 1
  const year = currentWeek === 1 ? now.getFullYear() - 1 : now.getFullYear()
  return `W${lastWeek}-${year}`
}

export function getLastCompletedMonth(): string {
  const now = new Date()
  const lastMonth = now.getMonth() === 0 ? 12 : now.getMonth()
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  return `M${lastMonth}-${year}`
}

export function calcPPM(complaints: number, sales: number): number {
  if (sales <= 0) return 0
  return Math.round((complaints / sales) * 1000000 * 10) / 10
}

export function getPrevWeek(wk: string): string {
  const parts = wk.slice(1).split('-')
  const wn = parseInt(parts[0])
  const yr = parseInt(parts[1])

  if (wn === 1) {
    return `W52-${yr - 1}`
  }
  return `W${wn - 1}-${yr}`
}

export function getPrevMonth(mk: string): string {
  const parts = mk.slice(1).split('-')
  const mo = parseInt(parts[0])
  const yr = parseInt(parts[1])

  if (mo === 1) {
    return `M12-${yr - 1}`
  }
  return `M${mo - 1}-${yr}`
}

export function buildKPI(metrics: Record<string, PeriodMetrics>): KPIData {
  const lastWeek = getLastCompletedWeek()
  const prevWeek = getPrevWeek(lastWeek)

  const lastWeekMetric = metrics[lastWeek]
  const prevWeekMetric = metrics[prevWeek]

  const sales = lastWeekMetric?.salesTotal ?? 0
  const salesPrev = prevWeekMetric?.salesTotal ?? 0

  // Count complaints excluding Wrong/Missing Product and Technical Issue
  let complaintsExcl = 0
  let complaintsExclPrev = 0

  if (lastWeekMetric) {
    for (const [issueType, count] of Object.entries(lastWeekMetric.compByIssue)) {
      if (!EXCLUDE_FROM_PPM.includes(issueType)) {
        complaintsExcl += count
      }
    }
  }

  if (prevWeekMetric) {
    for (const [issueType, count] of Object.entries(prevWeekMetric.compByIssue)) {
      if (!EXCLUDE_FROM_PPM.includes(issueType)) {
        complaintsExclPrev += count
      }
    }
  }

  const ppmExcl = calcPPM(complaintsExcl, sales)
  const ppmExclPrev = calcPPM(complaintsExclPrev, salesPrev)

  const ppmDelta = ppmExcl - ppmExclPrev
  const ppmDeltaPct = ppmExclPrev > 0 ? ((ppmDelta / ppmExclPrev) * 100) : 0

  return {
    lastWeek,
    lastWeekLabel: weekKeyToLabel(lastWeek),
    sales,
    salesPrev,
    complaintsExcl,
    complaintsExclPrev,
    ppmExcl,
    ppmExclPrev,
    ppmDelta: Math.round(ppmDelta * 10) / 10,
    ppmDeltaPct: Math.round(ppmDeltaPct * 100) / 100
  }
}

export function buildSection(
  periods: string[],
  rowLabels: string[],
  metrics: Record<string, PeriodMetrics>,
  compKey: keyof PeriodMetrics,
  salesKey: keyof PeriodMetrics,
  title: string
): SectionData {
  // Get last 12 periods in newest-first order
  const last12 = periods.slice(-12).reverse()

  const rows: PPMRow[] = []

  for (const label of rowLabels) {
    const periodData: Array<{ periodKey: string; sales: number; complaints: number; ppm: number }> = []
    let totalSales = 0
    let totalComplaints = 0

    for (const periodKey of last12) {
      const metric = metrics[periodKey]
      if (!metric) continue

      const salesVal = (metric[salesKey] as Record<string, number>)?.[label] ?? 0
      const compVal = (metric[compKey] as Record<string, number>)?.[label] ?? 0

      totalSales += salesVal
      totalComplaints += compVal

      periodData.push({
        periodKey,
        sales: salesVal,
        complaints: compVal,
        ppm: calcPPM(compVal, salesVal)
      })
    }

    const totalPPM = calcPPM(totalComplaints, totalSales)

    rows.push({
      label,
      totalSales,
      totalComplaints,
      totalPPM,
      periods: periodData
    })
  }

  // Calculate grand total
  let grandTotalSales = 0
  let grandTotalComplaints = 0
  const grandTotalPeriods: Array<{ sales: number; complaints: number; ppm: number }> = []

  for (const periodKey of last12) {
    let periodSales = 0
    let periodComplaints = 0

    for (const row of rows) {
      const p = row.periods.find((x) => x.periodKey === periodKey)
      if (p) {
        periodSales += p.sales
        periodComplaints += p.complaints
      }
    }

    grandTotalSales += periodSales
    grandTotalComplaints += periodComplaints
    grandTotalPeriods.push({
      sales: periodSales,
      complaints: periodComplaints,
      ppm: calcPPM(periodComplaints, periodSales)
    })
  }

  const grandTotalPPM = calcPPM(grandTotalComplaints, grandTotalSales)

  return {
    title,
    periods: last12,
    rows,
    grandTotal: {
      totalSales: grandTotalSales,
      totalComplaints: grandTotalComplaints,
      totalPPM: grandTotalPPM,
      periods: grandTotalPeriods
    }
  }
}

export function buildIssueSection(
  periods: string[],
  metrics: Record<string, PeriodMetrics>,
  title: string
): SectionData {
  const last12 = periods.slice(-12).reverse()

  const rows: PPMRow[] = []

  for (const issueType of ALL_ISSUE_TYPES) {
    const periodData: Array<{ periodKey: string; sales: number; complaints: number; ppm: number }> = []
    let totalSales = 0
    let totalComplaints = 0

    for (const periodKey of last12) {
      const metric = metrics[periodKey]
      if (!metric) continue

      const salesVal = metric.salesTotal ?? 0
      const compVal = (metric.compByIssue ?? {})[issueType] ?? 0

      totalSales += salesVal
      totalComplaints += compVal

      periodData.push({
        periodKey,
        sales: salesVal,
        complaints: compVal,
        ppm: calcPPM(compVal, salesVal)
      })
    }

    const totalPPM = calcPPM(totalComplaints, totalSales)

    rows.push({
      label: issueType,
      totalSales,
      totalComplaints,
      totalPPM,
      periods: periodData
    })
  }

  // Calculate grand total
  let grandTotalSales = 0
  let grandTotalComplaints = 0
  const grandTotalPeriods: Array<{ sales: number; complaints: number; ppm: number }> = []

  for (const periodKey of last12) {
    let periodSales = 0
    let periodComplaints = 0

    for (const row of rows) {
      const p = row.periods.find((x) => x.periodKey === periodKey)
      if (p) {
        periodSales += p.sales
        periodComplaints += p.complaints
      }
    }

    grandTotalSales += periodSales
    grandTotalComplaints += periodComplaints
    grandTotalPeriods.push({
      sales: periodSales,
      complaints: periodComplaints,
      ppm: calcPPM(periodComplaints, periodSales)
    })
  }

  const grandTotalPPM = calcPPM(grandTotalComplaints, grandTotalSales)

  return {
    title,
    periods: last12,
    rows,
    grandTotal: {
      totalSales: grandTotalSales,
      totalComplaints: grandTotalComplaints,
      totalPPM: grandTotalPPM,
      periods: grandTotalPeriods
    }
  }
}

export function getUniqueProductCats(metrics: Record<string, PeriodMetrics>): string[] {
  const cats = new Set<string>()

  for (const metric of Object.values(metrics)) {
    Object.keys(metric.salesByProdCat ?? {}).forEach((cat) => cats.add(cat))
    Object.keys(metric.compByProdCatExcl ?? {}).forEach((cat) => cats.add(cat))
  }

  return Array.from(cats).sort()
}
