'use client'

import { KPIData } from '@/lib/types'

export default function KPICards({ kpi }: { kpi: KPIData }) {
  const getDeltaColor = (ppmDelta: number) => {
    if (ppmDelta < 0) return 'text-green-600'
    if (ppmDelta > 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total Sales */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-2">Total Sales</p>
        <p className="text-3xl font-bold mb-2">{kpi.sales.toLocaleString()}</p>
        <p className="text-xs text-slate-400">
          Prev: {kpi.salesPrev.toLocaleString()}
        </p>
      </div>

      {/* Complaints (Excl Del) */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-2">
          Complaints (Excl Del)
        </p>
        <p className="text-3xl font-bold mb-2">{kpi.complaintsExcl.toLocaleString()}</p>
        <p className="text-xs text-slate-400">
          Prev: {kpi.complaintsExclPrev.toLocaleString()}
        </p>
      </div>

      {/* PPM (Excl Del) */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-2">PPM (Excl Del)</p>
        <p className="text-3xl font-bold mb-2">{kpi.ppmExcl.toFixed(1)}</p>
        <p className="text-xs text-slate-400">
          Prev: {kpi.ppmExclPrev.toFixed(1)}
        </p>
      </div>

      {/* WoW Change */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-2">WoW Change</p>
        <p className={`text-3xl font-bold mb-2 ${getDeltaColor(kpi.ppmDelta)}`}>
          {kpi.ppmDelta >= 0 ? '+' : ''}
          {kpi.ppmDelta.toFixed(1)}
        </p>
        <p className={`text-xs ${getDeltaColor(kpi.ppmDelta)}`}>
          {kpi.ppmDeltaPct >= 0 ? '+' : ''}
          {kpi.ppmDeltaPct.toFixed(1)}%
        </p>
      </div>
    </div>
  )
}
