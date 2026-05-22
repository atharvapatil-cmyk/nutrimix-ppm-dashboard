import { readLJSheet, readSalesSheet } from './sheets'
import { classifyByKeywords, extractProductInfo, isValidImageLink, isValidBatchNumber } from './classifier'
import { weekLabel, monthLabel, getAllWeeks, getAllMonths, getUniqueProductCats, buildKPI } from './ppm'
import { EXCLUDE_FROM_PPM, CRITICAL_ISSUES, IMAGE_COL_NAMES } from './constants'
import type { PeriodMetrics, DashboardData } from './types'

// ─── helpers ─────────────────────────────────────────────────────────────────

function findCol(headers: string[], terms: string[]): number {
  for (const t of terms) {
    const i = headers.findIndex(h => String(h).toLowerCase().trim() === t.toLowerCase())
    if (i !== -1) return i
  }
  for (const t of terms) {
    const i = headers.findIndex(h => String(h).toLowerCase().includes(t.toLowerCase()))
    if (i !== -1) return i
  }
  return -1
}

function inc(obj: Record<string, number>, key: string, by = 1) {
  obj[key] = (obj[key] ?? 0) + by
}

function emptyMetrics(periodKey: string, periodType: 'W' | 'M'): PeriodMetrics {
  return {
    periodKey, periodType, salesTotal: 0,
    salesByPkg: {}, salesByProdCat: {},
    compByPkgExcl: {}, compByPkgIncl: {}, compByIssue: {},
    compByProdCatExcl: {}, compByProdCatIncl: {},
    compByProdCatCritExcl: {}, compByProdCatCritIncl: {},
    compByPkgPrimExcl: {}, compByPkgPrimIncl: {},
    compByPkgSecExcl: {}, compByPkgSecIncl: {},
    compByPkgInfExcl: {}, compByPkgInfIncl: {},
  }
}

/** Clamp date range — reject dates before 2024 or more than 1 day in the future */
function isDateReasonable(dt: Date): boolean {
  const now = Date.now()
  const tomorrow = now + 86_400_000
  const minDate = new Date(2024, 0, 1).getTime()
  return dt.getTime() >= minDate && dt.getTime() <= tomorrow
}

// ─── main export ─────────────────────────────────────────────────────────────

export async function computeDashboardData(): Promise<DashboardData> {
  const [ljRows, salesRows] = await Promise.all([readLJSheet(), readSalesSheet()])

  const metrics: Record<string, PeriodMetrics> = {}
  const getM = (key: string, type: 'W' | 'M') => {
    if (!metrics[key]) metrics[key] = emptyMetrics(key, type)
    return metrics[key]
  }

  // ── 1. COMPLAINTS: Read LJ sheet ──────────────────────────────────────────
  const ljHeaders = (ljRows[0] ?? []).map(h => String(h))

  const tsIdx    = findCol(ljHeaders, ['timestamp','time stamp','submitted at','created at'])
  const prodIdx  = findCol(ljHeaders, ['select product','product'])
  const oidIdx   = findCol(ljHeaders, ['enter original order id','original order id','order id','orderid'])
  const vocIdx   = findCol(ljHeaders, ['detailed voc','voc','voice of customer','complaint','issue description'])
  const batchIdx = findCol(ljHeaders, ['enter batch number','batch number','batch no','batch_number','batch'])

  // Find ALL image-related columns (App Script checks upload images/videos + Image 1-5)
  const imgColIdxs: number[] = []
  IMAGE_COL_NAMES.forEach(name => {
    ljHeaders.forEach((h, i) => {
      const hl = h.toLowerCase().trim()
      if ((hl === name || hl.includes(name)) && !imgColIdxs.includes(i)) imgColIdxs.push(i)
    })
  })

  let totalRaw = 0, totalNutrimix = 0, totalValid = 0, totalInvalid = 0, totalDuplicates = 0
  const seenOIDs = new Set<string>()

  for (let i = 1; i < ljRows.length; i++) {
    const row = ljRows[i]
    if (!row || row.length === 0) continue
    totalRaw++

    // Filter Nutrimix only
    const prodRaw = String(row[prodIdx] ?? '')
    if (!prodRaw.toLowerCase().includes('nutrimix')) continue
    totalNutrimix++

    // ── HYGIENE: Red row check (missing image AND missing batch) ──
    // App Script checks ALL image columns (upload images/videos, Image 1, Image 2...)
    const batchVal = batchIdx !== -1 ? String(row[batchIdx] ?? '') : ''
    const hasImg   = imgColIdxs.some(idx => {
      const v = String(row[idx] ?? '').trim()
      return v.length > 5 && isValidImageLink(v)
    })
    const hasBatch = isValidBatchNumber(batchVal)

    if (!hasImg && !hasBatch) {
      totalInvalid++
      continue // red row excluded
    }

    // ── HYGIENE: Yellow row check (duplicate order ID) ──
    const oid = oidIdx !== -1 ? String(row[oidIdx] ?? '').trim().toLowerCase() : ''
    if (oid && oid !== 'na' && oid !== 'n/a' && oid !== '-' && oid.length > 2) {
      if (seenOIDs.has(oid)) {
        totalDuplicates++
        continue // yellow row excluded
      }
      seenOIDs.add(oid)
    }

    totalValid++

    // ── Parse timestamp ──
    const tsRaw = tsIdx !== -1 ? String(row[tsIdx] ?? '') : ''
    if (!tsRaw) continue
    const ts = new Date(tsRaw)
    if (isNaN(ts.getTime()) || !isDateReasonable(ts)) continue

    // ── Classify + extract ──
    const voc       = vocIdx !== -1 ? String(row[vocIdx] ?? '') : ''
    const issueType = classifyByKeywords(voc)
    const info      = extractProductInfo(prodRaw)
    const productCat = `${info.product} ${info.flavour}`
    const wk = weekLabel(ts)
    const mo = monthLabel(ts)

    const isBaseExcl = EXCLUDE_FROM_PPM.includes(issueType)
    const isDel      = issueType === 'Delivery Issue'
    const exclDel    = !isBaseExcl && !isDel
    const inclDel    = !isBaseExcl
    const isCrit     = CRITICAL_ISSUES.includes(issueType)

    for (const m of [getM(wk, 'W'), getM(mo, 'M')]) {
      inc(m.compByIssue, issueType)
      if (exclDel) {
        inc(m.compByPkgExcl, info.packaging)
        inc(m.compByProdCatExcl, productCat)
        if (isCrit)                                     inc(m.compByProdCatCritExcl, productCat)
        if (issueType === 'Primary Packaging Issue')    inc(m.compByPkgPrimExcl, info.packaging)
        if (issueType === 'Secondary Packaging Issue')  inc(m.compByPkgSecExcl, info.packaging)
        if (issueType === 'Infestation')                inc(m.compByPkgInfExcl, info.packaging)
      }
      if (inclDel) {
        inc(m.compByPkgIncl, info.packaging)
        inc(m.compByProdCatIncl, productCat)
        if (isCrit)                                     inc(m.compByProdCatCritIncl, productCat)
        if (issueType === 'Primary Packaging Issue')    inc(m.compByPkgPrimIncl, info.packaging)
        if (issueType === 'Secondary Packaging Issue')  inc(m.compByPkgSecIncl, info.packaging)
        if (issueType === 'Infestation')                inc(m.compByPkgInfIncl, info.packaging)
      }
    }
  }

  // ── 2. SALES: Read Live Sales Data sheet ──────────────────────────────────
  const salesHeaders = (salesRows[0] ?? []).map(h => String(h))

  const sProdIdx = findCol(salesHeaders, ['product_name','product name','product'])
  const sChanIdx = findCol(salesHeaders, ['channel_name','channel name','channel'])
  const sDateIdx = findCol(salesHeaders, ['order_date','date','order date','created_at','delivered_date'])
  const sQtyIdx  = findCol(salesHeaders, ['units_sold','quantity','qty','units','final_quantity','net_quantity'])

  let salesRowsProcessed = 0, salesRowsFiltered = 0

  for (let i = 1; i < salesRows.length; i++) {
    const row = salesRows[i]
    if (!row || row.length === 0) continue
    salesRowsProcessed++

    // Filter: must be Nutrimix product
    const prod = sProdIdx !== -1 ? String(row[sProdIdx] ?? '') : ''
    if (!prod.toLowerCase().includes('nutrimix')) continue

    // Filter: must be webapp channel
    const chan = sChanIdx !== -1 ? String(row[sChanIdx] ?? '').trim().toLowerCase() : 'webapp'
    if (sChanIdx !== -1 && chan !== 'webapp' && chan !== 'web app' && chan !== 'web_app') continue

    // Parse date — reject bad/future dates
    const dateRaw = sDateIdx !== -1 ? String(row[sDateIdx] ?? '') : ''
    if (!dateRaw) continue
    const dt = new Date(dateRaw)
    if (isNaN(dt.getTime()) || !isDateReasonable(dt)) continue

    const qty = Math.max(1, Number(row[sQtyIdx] ?? 1) || 1)
    const info = extractProductInfo(prod)
    const productCat = `${info.product} ${info.flavour}`
    const wk = weekLabel(dt)
    const mo = monthLabel(dt)
    salesRowsFiltered++

    for (const m of [getM(wk, 'W'), getM(mo, 'M')]) {
      m.salesTotal += qty
      inc(m.salesByPkg, info.packaging, qty)
      inc(m.salesByProdCat, productCat, qty)
    }
  }

  // ── 3. Build output ───────────────────────────────────────────────────────
  const weeks            = getAllWeeks()
  const months           = getAllMonths()
  const uniqueProductCats = getUniqueProductCats(metrics)
  const kpi              = buildKPI(metrics)

  return {
    metrics,
    weeks,
    months,
    lastUpdated: new Date().toISOString(),
    uniqueProductCats,
    kpi,
    stats: {
      totalRaw,
      totalNutrimix,
      totalValid,
      totalInvalid,
      totalDuplicates,
      salesRowsProcessed,
      salesRowsFiltered,
      salesHeaders: salesHeaders.slice(0, 8), // debug: show what columns were found
      ljHeaders: ljHeaders.slice(0, 10),       // debug: show LJ columns
    } as DashboardData['stats'],
  }
}
