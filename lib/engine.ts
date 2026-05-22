import { readLJSheet, readDRRSales } from './sheets'
import { classifyByKeywords, extractProductInfo, isValidImageLink, isValidBatchNumber } from './classifier'
import { weekLabel, monthLabel, getAllWeeks, getAllMonths, getUniqueProductCats } from './ppm'
import { EXCLUDE_FROM_PPM, CRITICAL_ISSUES } from './constants'
import type { PeriodMetrics, DashboardData } from './types'

function findCol(headers: string[], terms: string[]): number {
  // Exact match first (case-insensitive)
  for (const t of terms) {
    const i = headers.findIndex((h) => String(h).toLowerCase().trim() === t.toLowerCase())
    if (i !== -1) return i
  }

  // Contains match
  for (const t of terms) {
    const i = headers.findIndex((h) => String(h).toLowerCase().includes(t.toLowerCase()))
    if (i !== -1) return i
  }

  return -1
}

function inc(obj: Record<string, number>, key: string, by = 1) {
  obj[key] = (obj[key] ?? 0) + by
}

function emptyMetrics(periodKey: string, periodType: 'W' | 'M'): PeriodMetrics {
  return {
    periodKey,
    periodType,
    salesTotal: 0,
    salesByPkg: {},
    salesByProdCat: {},
    compByPkgExcl: {},
    compByPkgIncl: {},
    compByIssue: {},
    compByProdCatExcl: {},
    compByProdCatIncl: {},
    compByProdCatCritExcl: {},
    compByProdCatCritIncl: {},
    compByPkgPrimExcl: {},
    compByPkgPrimIncl: {},
    compByPkgSecExcl: {},
    compByPkgSecIncl: {},
    compByPkgInfExcl: {},
    compByPkgInfIncl: {}
  }
}

export async function computeDashboardData(): Promise<DashboardData> {
  // 1. Read both sheets in parallel
  const [ljRows, drrRows] = await Promise.all([readLJSheet(), readDRRSales()])

  // 2. Process LJ complaints
  const ljHeaders = (ljRows[0] ?? []).map((h) => String(h))

  const tsIdx = findCol(ljHeaders, ['timestamp', 'time stamp', 'submitted at', 'created at', 'date'])
  const prodIdx = findCol(ljHeaders, ['select product', 'product'])
  const oidIdx = findCol(ljHeaders, ['enter original order id', 'original order id', 'order id', 'orderid'])
  const vocIdx = findCol(ljHeaders, ['detailed voc', 'voc', 'voice of customer', 'complaint', 'complaint text', 'issue description'])
  const imgIdx = findCol(ljHeaders, ['upload images', 'image', 'upload images/videos'])
  const batchIdx = findCol(ljHeaders, ['enter batch number', 'batch number', 'batch no', 'batch'])

  const metrics: Record<string, PeriodMetrics> = {}

  const getM = (key: string, type: 'W' | 'M'): PeriodMetrics => {
    if (!metrics[key]) metrics[key] = emptyMetrics(key, type)
    return metrics[key]
  }

  let totalRaw = 0
  let totalNutrimix = 0
  let totalValid = 0
  let totalInvalid = 0
  let totalDuplicates = 0
  const seenOIDs = new Set<string>()

  for (let i = 1; i < ljRows.length; i++) {
    const row = ljRows[i]
    totalRaw++

    const prodRaw = String(row[prodIdx] ?? '')
    if (!prodRaw.toLowerCase().includes('nutrimix')) continue
    totalNutrimix++

    // Hygiene checks
    const imgVal = imgIdx !== -1 ? String(row[imgIdx] ?? '') : ''
    const batchVal = batchIdx !== -1 ? String(row[batchIdx] ?? '') : ''
    const hasImg = isValidImageLink(imgVal)
    const hasBatch = isValidBatchNumber(batchVal)

    if (!hasImg && !hasBatch) {
      totalInvalid++
      continue // red row - skip
    }

    const oid = oidIdx !== -1 ? String(row[oidIdx] ?? '').trim().toLowerCase() : ''
    if (oid && oid !== 'na' && oid !== 'n/a' && oid !== '-') {
      if (seenOIDs.has(oid)) {
        totalDuplicates++
        continue // yellow row - skip
      }
      seenOIDs.add(oid)
    }

    totalValid++

    const tsRaw = tsIdx !== -1 ? String(row[tsIdx] ?? '') : ''
    const ts = tsRaw ? new Date(tsRaw) : null
    if (!ts || isNaN(ts.getTime())) continue

    const wk = weekLabel(ts)
    const mo = monthLabel(ts)
    const voc = vocIdx !== -1 ? String(row[vocIdx] ?? '') : ''
    const issueType = classifyByKeywords(voc)
    const info = extractProductInfo(prodRaw)
    const productCat = `${info.product} ${info.flavour}`

    // Aggregate into week and month metrics
    const wm = getM(wk, 'W')
    const mm = getM(mo, 'M')

    const isBaseExcl = EXCLUDE_FROM_PPM.includes(issueType)
    const isDel = issueType === 'Delivery Issue'
    const exclDel = !isBaseExcl && !isDel
    const inclDel = !isBaseExcl
    const isCrit = CRITICAL_ISSUES.includes(issueType)

    for (const m of [wm, mm]) {
      inc(m.compByIssue, issueType)

      if (exclDel) {
        inc(m.compByPkgExcl, info.packaging)
        inc(m.compByProdCatExcl, productCat)
        if (isCrit) inc(m.compByProdCatCritExcl, productCat)
        if (issueType === 'Primary Packaging Issue') inc(m.compByPkgPrimExcl, info.packaging)
        if (issueType === 'Secondary Packaging Issue') inc(m.compByPkgSecExcl, info.packaging)
        if (issueType === 'Infestation') inc(m.compByPkgInfExcl, info.packaging)
      }

      if (inclDel) {
        inc(m.compByPkgIncl, info.packaging)
        inc(m.compByProdCatIncl, productCat)
        if (isCrit) inc(m.compByProdCatCritIncl, productCat)
        if (issueType === 'Primary Packaging Issue') inc(m.compByPkgPrimIncl, info.packaging)
        if (issueType === 'Secondary Packaging Issue') inc(m.compByPkgSecIncl, info.packaging)
        if (issueType === 'Infestation') inc(m.compByPkgInfIncl, info.packaging)
      }
    }
  }

  // 3. Process DRR sales
  const drrHeaders = (drrRows[0] ?? []).map((h) => String(h))
  const dProdIdx = findCol(drrHeaders, ['product_name', 'product name', 'product'])
  const dChanIdx = findCol(drrHeaders, ['channel_name', 'channel name', 'channel'])
  const dDateIdx = findCol(drrHeaders, ['order_date', 'date', 'order date', 'created_at'])
  const dQtyIdx = findCol(drrHeaders, ['units_sold', 'quantity', 'qty', 'units'])

  for (let i = 1; i < drrRows.length; i++) {
    const row = drrRows[i]
    const prod = dProdIdx !== -1 ? String(row[dProdIdx] ?? '') : ''
    if (!prod.toLowerCase().includes('nutrimix')) continue

    const chan = dChanIdx !== -1 ? String(row[dChanIdx] ?? '').trim().toLowerCase() : ''
    if (chan !== 'webapp' && chan !== 'web app' && chan !== 'web_app') continue

    const dateRaw = dDateIdx !== -1 ? String(row[dDateIdx] ?? '') : ''
    const dt = dateRaw ? new Date(dateRaw) : null
    if (!dt || isNaN(dt.getTime())) continue

    const qty = dQtyIdx !== -1 ? Number(row[dQtyIdx]) || 1 : 1
    const info = extractProductInfo(prod)
    const productCat = `${info.product} ${info.flavour}`
    const wk = weekLabel(dt)
    const mo = monthLabel(dt)

    const wm = getM(wk, 'W')
    const mm = getM(mo, 'M')

    for (const m of [wm, mm]) {
      m.salesTotal += qty
      inc(m.salesByPkg, info.packaging, qty)
      inc(m.salesByProdCat, productCat, qty)
    }
  }

  const weeks = getAllWeeks()
  const months = getAllMonths()
  const uniqueProductCats = getUniqueProductCats(metrics)

  return {
    metrics,
    weeks,
    months,
    lastUpdated: new Date().toISOString(),
    uniqueProductCats,
    kpi: {
      lastWeek: '',
      lastWeekLabel: '',
      sales: 0,
      salesPrev: 0,
      complaintsExcl: 0,
      complaintsExclPrev: 0,
      ppmExcl: 0,
      ppmExclPrev: 0,
      ppmDelta: 0,
      ppmDeltaPct: 0
    },
    stats: { totalRaw, totalNutrimix, totalValid, totalInvalid, totalDuplicates }
  }
}
