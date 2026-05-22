'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { SectionData } from '@/lib/types'

interface ChartDataPoint {
  period: string
  [key: string]: number | string
}

export default function TrendChart({ section }: { section: SectionData }) {
  // Build chart data
  const chartData: ChartDataPoint[] = section.periods.map((period) => {
    const dataPoint: ChartDataPoint = { period }

    for (const row of section.rows) {
      const p = row.periods.find((x) => x.periodKey === period)
      if (p) {
        dataPoint[row.label] = isNaN(p.ppm) ? 0 : p.ppm
      }
    }

    return dataPoint
  })

  // Generate colors for lines
  const colors = [
    '#4472c4',
    '#ed7d31',
    '#a5a5a5',
    '#ffc000',
    '#5b9bd5',
    '#70ad47',
    '#ff6b6b',
    '#4ecdc4',
    '#95a5a6',
    '#3498db'
  ]

  const rowLabels = section.rows.slice(0, 10).map((r) => r.label)

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{section.title} — Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
          <YAxis label={{ value: 'PPM', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value) => (typeof value === 'number' ? value.toFixed(1) : value)} />
          <Legend />
          {rowLabels.map((label, idx) => (
            <Line
              key={label}
              type="monotone"
              dataKey={label}
              stroke={colors[idx % colors.length]}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
