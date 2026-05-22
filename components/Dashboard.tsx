'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import KPICards from './KPICards'
import PPMTable from './PPMTable'
import TrendChart from './TrendChart'
import { DashboardData } from '@/lib/types'
import { buildSection, buildIssueSection, weekKeyToLabel, monthKeyToLabel } from '@/lib/ppm'

type TabType = 'packaging' | 'issue' | 'productcat' | 'critical' | 'infestation' | 'primpackaging'
type PeriodType = 'W' | 'M'
type FilterType = 'excl' | 'incl'

export default function Dashboard({ initialData }: { initialData: DashboardData }) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [activeTab, setActiveTab] = useState<TabType>('packaging')
  const [periodType, setPeriodType] = useState<PeriodType>('W')
  const [filterType, setFilterType] = useState<FilterType>('excl')
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/data?refresh=1')
      if (res.ok) {
        const newData = await res.json()
        setData(newData)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const periods = periodType === 'W' ? data.weeks : data.months
  const periodLabels = periodType === 'W' ? weekKeyToLabel : monthKeyToLabel

  let sectionData: any = null

  if (activeTab === 'packaging') {
    const compKey = filterType === 'excl' ? 'compByPkgExcl' : 'compByPkgIncl'
    const salesKey = 'salesByPkg'

    // Get all packaging types
    const allPkgs = new Set<string>()
    for (const m of Object.values(data.metrics)) {
      Object.keys(m[compKey] as Record<string, number>).forEach((pkg) => allPkgs.add(pkg))
      Object.keys(m[salesKey] as Record<string, number>).forEach((pkg) => allPkgs.add(pkg))
    }
    const pkgLabels = Array.from(allPkgs).sort()

    sectionData = buildSection(
      periods,
      pkgLabels,
      data.metrics,
      compKey as any,
      salesKey as any,
      `Packaging Type PPM — ${filterType === 'excl' ? 'Excl Del' : 'Incl Del'}`
    )
  } else if (activeTab === 'issue') {
    sectionData = buildIssueSection(periods, data.metrics, 'Issue Type PPM')
  } else if (activeTab === 'productcat') {
    const compKey = filterType === 'excl' ? 'compByProdCatExcl' : 'compByProdCatIncl'
    const salesKey = 'salesByProdCat'

    sectionData = buildSection(
      periods,
      data.uniqueProductCats,
      data.metrics,
      compKey as any,
      salesKey as any,
      `Product Category PPM — ${filterType === 'excl' ? 'Excl Del' : 'Incl Del'}`
    )
  } else if (activeTab === 'critical') {
    const compKey = filterType === 'excl' ? 'compByProdCatCritExcl' : 'compByProdCatCritIncl'
    const salesKey = 'salesByProdCat'

    sectionData = buildSection(
      periods,
      data.uniqueProductCats,
      data.metrics,
      compKey as any,
      salesKey as any,
      `Critical Issues by Product Category — ${filterType === 'excl' ? 'Excl Del' : 'Incl Del'}`
    )
  } else if (activeTab === 'infestation') {
    const compKey = filterType === 'excl' ? 'compByPkgInfExcl' : 'compByPkgInfIncl'
    const salesKey = 'salesByPkg'

    const allPkgs = new Set<string>()
    for (const m of Object.values(data.metrics)) {
      Object.keys(m[compKey] as Record<string, number>).forEach((pkg) => allPkgs.add(pkg))
      Object.keys(m[salesKey] as Record<string, number>).forEach((pkg) => allPkgs.add(pkg))
    }
    const pkgLabels = Array.from(allPkgs).sort()

    sectionData = buildSection(
      periods,
      pkgLabels,
      data.metrics,
      compKey as any,
      salesKey as any,
      `Infestation by Packaging — ${filterType === 'excl' ? 'Excl Del' : 'Incl Del'}`
    )
  } else if (activeTab === 'primpackaging') {
    const compKey = filterType === 'excl' ? 'compByPkgPrimExcl' : 'compByPkgPrimIncl'
    const salesKey = 'salesByPkg'

    const allPkgs = new Set<string>()
    for (const m of Object.values(data.metrics)) {
      Object.keys(m[compKey] as Record<string, number>).forEach((pkg) => allPkgs.add(pkg))
      Object.keys(m[salesKey] as Record<string, number>).forEach((pkg) => allPkgs.add(pkg))
    }
    const pkgLabels = Array.from(allPkgs).sort()

    sectionData = buildSection(
      periods,
      pkgLabels,
      data.metrics,
      compKey as any,
      salesKey as any,
      `Primary Packaging Issues by Packaging — ${filterType === 'excl' ? 'Excl Del' : 'Incl Del'}`
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                MosaicWellness · Quality Intelligence
              </p>
              <h1 className="text-3xl font-bold text-slate-900">Nutrimix PPM Dashboard</h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded font-medium transition text-sm"
            >
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* KPI Cards */}
        <KPICards kpi={data.kpi} />

        {/* Stats Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Total Nutrimix Complaints:</span>
            <span className="font-bold text-slate-900">{data.stats.totalNutrimix.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Valid (Green):</span>
            <span className="font-bold text-green-700">{data.stats.totalValid.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Invalid (Red):</span>
            <span className="font-bold text-red-700">{data.stats.totalInvalid.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Duplicates (Yellow):</span>
            <span className="font-bold text-yellow-700">{data.stats.totalDuplicates.toLocaleString()}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-lg shadow p-2">
          <button
            onClick={() => setActiveTab('packaging')}
            className={`px-4 py-2 rounded font-medium text-sm transition ${
              activeTab === 'packaging'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            }`}
          >
            Packaging Type PPM
          </button>
          <button
            onClick={() => setActiveTab('issue')}
            className={`px-4 py-2 rounded font-medium text-sm transition ${
              activeTab === 'issue' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            }`}
          >
            Issue Type PPM
          </button>
          <button
            onClick={() => setActiveTab('productcat')}
            className={`px-4 py-2 rounded font-medium text-sm transition ${
              activeTab === 'productcat' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            }`}
          >
            Product Category
          </button>
          <button
            onClick={() => setActiveTab('critical')}
            className={`px-4 py-2 rounded font-medium text-sm transition ${
              activeTab === 'critical' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            }`}
          >
            Critical Issues
          </button>
          <button
            onClick={() => setActiveTab('infestation')}
            className={`px-4 py-2 rounded font-medium text-sm transition ${
              activeTab === 'infestation' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            }`}
          >
            Infestation by Packaging
          </button>
          <button
            onClick={() => setActiveTab('primpackaging')}
            className={`px-4 py-2 rounded font-medium text-sm transition ${
              activeTab === 'primpackaging' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
            }`}
          >
            Pkg Issue Details
          </button>
        </div>

        {/* Toggle Controls */}
        {activeTab !== 'issue' && (
          <div className="flex flex-wrap gap-4 mb-6 bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Period:</span>
              <button
                onClick={() => setPeriodType('W')}
                className={`px-3 py-1 rounded text-sm transition ${
                  periodType === 'W'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setPeriodType('M')}
                className={`px-3 py-1 rounded text-sm transition ${
                  periodType === 'M'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                Monthly
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Filter:</span>
              <button
                onClick={() => setFilterType('excl')}
                className={`px-3 py-1 rounded text-sm transition ${
                  filterType === 'excl'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                Excl Del
              </button>
              <button
                onClick={() => setFilterType('incl')}
                className={`px-3 py-1 rounded text-sm transition ${
                  filterType === 'incl'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                Incl Del
              </button>
            </div>
          </div>
        )}

        {/* Chart and Table */}
        {sectionData && (
          <>
            <TrendChart section={sectionData} />
            <PPMTable section={sectionData} />
          </>
        )}

        {/* Footer */}
        <div className="bg-white rounded-lg shadow p-4 mt-8 text-center">
          <p className="text-xs text-slate-600 mb-2">
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">
            Data sources:{' '}
            <a
              href="https://docs.google.com/spreadsheets/d/1D2cR7PylAvoXB-wex4h9CgvPzt-s7GAVCho95H2hV5A/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              LJ Sheet
            </a>
            {' | '}
            <a
              href="https://docs.google.com/spreadsheets/d/1sNRNAH2Wv22qnAwoaP8CVM9p21TDw382jGcqABjz3z8/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              DRR Sheet
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
