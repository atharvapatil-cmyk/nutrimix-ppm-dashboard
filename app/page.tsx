import { computeDashboardData } from '@/lib/engine'
import { buildKPI, getAllWeeks, getAllMonths } from '@/lib/ppm'
import Dashboard from '@/components/Dashboard'
import type { DashboardData } from '@/lib/types'

export const revalidate = 900 // ISR: revalidate every 15 minutes

async function getData(): Promise<DashboardData> {
  try {
    const rawData = await computeDashboardData()
    const kpi = buildKPI(rawData.metrics)
    const weeks = getAllWeeks()
    const months = getAllMonths()

    return {
      ...rawData,
      weeks,
      months,
      kpi
    }
  } catch (error) {
    console.error('Failed to compute dashboard data:', error)
    throw error
  }
}

export default async function Home() {
  let data: DashboardData | null = null
  let error: string | null = null

  try {
    data = await getData()
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load dashboard data'
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-red-900 mb-4">Error Loading Dashboard</h1>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="bg-red-100 p-4 rounded border border-red-300">
            <p className="text-sm font-mono text-red-900">
              Make sure GOOGLE_SERVICE_ACCOUNT_JSON is set in your environment variables and contains valid credentials.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <p className="text-center text-gray-600">Loading dashboard data...</p>
      </div>
    )
  }

  return <Dashboard initialData={data} />
}
