'use client'

import { SectionData } from '@/lib/types'

function getPPMColor(ppm: number): string {
  if (ppm === 0 || isNaN(ppm)) return 'bg-gray-50'
  if (ppm < 500) return 'bg-green-50'
  if (ppm < 2000) return 'bg-yellow-50'
  return 'bg-red-50'
}

function getPPMTextColor(ppm: number): string {
  if (ppm === 0 || isNaN(ppm)) return 'text-gray-900'
  if (ppm < 500) return 'text-green-900 font-semibold'
  if (ppm < 2000) return 'text-yellow-900 font-semibold'
  return 'text-red-900 font-semibold'
}

export default function PPMTable({ section }: { section: SectionData }) {
  const displayPeriods = section.periods.slice(0, 8)

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto table-wrap">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 border-b">
              <th className="px-4 py-3 text-left font-semibold text-slate-900 sticky left-0 bg-slate-100 z-10">
                Category
              </th>
              <th className="px-3 py-3 text-right font-semibold text-slate-900">Sales</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-900">Comp</th>
              <th className="px-3 py-3 text-right font-semibold text-slate-900">PPM</th>
              {displayPeriods.map((period) => (
                <th key={period} className="px-3 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                  {period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, idx) => (
              <tr key={`${row.label}-${idx}`} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-slate-900 sticky left-0 bg-white z-10">
                  {row.label}
                </td>
                <td className="px-3 py-3 text-right text-slate-600">{row.totalSales.toLocaleString()}</td>
                <td className="px-3 py-3 text-right text-slate-600">{row.totalComplaints.toLocaleString()}</td>
                <td className={`px-3 py-3 text-right ${getPPMTextColor(row.totalPPM)}`}>
                  {row.totalPPM.toFixed(1)}
                </td>
                {row.periods.map((p, pIdx) => (
                  <td
                    key={pIdx}
                    className={`px-3 py-3 text-right font-medium ${getPPMColor(p.ppm)} ${getPPMTextColor(
                      p.ppm
                    )}`}
                  >
                    {isNaN(p.ppm) ? '—' : p.ppm.toFixed(1)}
                  </td>
                ))}
              </tr>
            ))}
            {/* Grand Total Row */}
            <tr className="bg-slate-100 font-bold border-b-2">
              <td className="px-4 py-3 text-slate-900 sticky left-0 bg-slate-100 z-10">TOTAL</td>
              <td className="px-3 py-3 text-right text-slate-900">
                {section.grandTotal.totalSales.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-right text-slate-900">
                {section.grandTotal.totalComplaints.toLocaleString()}
              </td>
              <td className={`px-3 py-3 text-right ${getPPMTextColor(section.grandTotal.totalPPM)}`}>
                {section.grandTotal.totalPPM.toFixed(1)}
              </td>
              {section.grandTotal.periods.map((p, pIdx) => (
                <td
                  key={pIdx}
                  className={`px-3 py-3 text-right font-bold ${getPPMColor(p.ppm)} ${getPPMTextColor(
                    p.ppm
                  )}`}
                >
                  {isNaN(p.ppm) ? '—' : p.ppm.toFixed(1)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
