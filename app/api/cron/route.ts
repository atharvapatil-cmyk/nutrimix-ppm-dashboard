import { computeDashboardData } from '@/lib/engine'
import { buildKPI, getAllWeeks, getAllMonths } from '@/lib/ppm'
import type { DashboardData } from '@/lib/types'

let cachedData: DashboardData | null = null
let cacheTime: number = 0
const CACHE_TTL = 15 * 60 * 1000

export async function POST(request: Request) {
  try {
    // Verify CRON_SECRET
    const secret = request.headers.get('x-cron-secret')
    if (secret !== process.env.CRON_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Compute fresh data
    const rawData = await computeDashboardData()

    // Build KPI
    const kpi = buildKPI(rawData.metrics)

    // Rebuild weeks and months
    const weeks = getAllWeeks()
    const months = getAllMonths()

    const data: DashboardData = {
      ...rawData,
      weeks,
      months,
      kpi
    }

    cachedData = data
    cacheTime = Date.now()

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('Error in cron job:', error)
    return Response.json(
      {
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const secret = request.headers.get('x-cron-secret')
    if (secret !== process.env.CRON_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Compute fresh data
    const rawData = await computeDashboardData()
    const kpi = buildKPI(rawData.metrics)
    const weeks = getAllWeeks()
    const months = getAllMonths()

    const data: DashboardData = {
      ...rawData,
      weeks,
      months,
      kpi
    }

    cachedData = data
    cacheTime = Date.now()

    return Response.json({ success: true, data })
  } catch (error) {
    console.error('Error in cron job:', error)
    return Response.json(
      {
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
