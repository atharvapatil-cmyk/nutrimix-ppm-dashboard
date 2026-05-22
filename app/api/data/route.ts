import { computeDashboardData } from '@/lib/engine'
import { buildKPI, getAllWeeks, getAllMonths } from '@/lib/ppm'
import type { DashboardData } from '@/lib/types'

let cachedData: DashboardData | null = null
let cacheTime: number = 0
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('refresh') === '1'

    const now = Date.now()

    if (!forceRefresh && cachedData && now - cacheTime < CACHE_TTL) {
      return Response.json(cachedData)
    }

    // Compute fresh data
    const rawData = await computeDashboardData()

    // Build KPI with actual metrics
    const kpi = buildKPI(rawData.metrics)

    // Rebuild weeks and months to ensure they're current
    const weeks = getAllWeeks()
    const months = getAllMonths()

    const data: DashboardData = {
      ...rawData,
      weeks,
      months,
      kpi
    }

    cachedData = data
    cacheTime = now

    return Response.json(data)
  } catch (error) {
    console.error('Error computing dashboard data:', error)
    return Response.json(
      {
        error: 'Failed to compute dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
