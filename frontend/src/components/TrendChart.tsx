import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts'
import type { TrendComparison } from '@/types'

interface TrendChartProps {
  comparisons: TrendComparison[]
  height?: number
  mode?: 'mean' | 'variance'
}

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen - 1) + '\u2026' : text
}

export function TrendChart({ comparisons, height = 400, mode = 'mean' }: TrendChartProps) {
  console.log('[TrendChart] Rendering', comparisons.length, 'comparisons, mode:', mode)

  const chartData = useMemo(() => {
    return comparisons.slice(0, 20).map((c) => ({
      name: truncate(c.question_text, 25),
      fullName: c.question_text,
      domainName: c.domain_name,
      baseline: mode === 'mean' ? c.baseline_mean : c.baseline_stddev,
      current: mode === 'mean' ? c.current_mean : c.current_stddev,
      delta: mode === 'mean' ? c.delta_mean : c.delta_variance,
      improved: mode === 'mean' ? c.delta_mean > 0 : c.delta_variance < 0,
    }))
  }, [comparisons, mode])

  if (!comparisons.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No trend data available. Select two campaigns to compare.
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload
    if (!d) return null
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium text-gray-900 mb-1">{d.fullName}</p>
        <p className="text-gray-600">Domain: {d.domainName}</p>
        <p className="text-blue-600">Baseline: {d.baseline.toFixed(2)}</p>
        <p className="text-green-600">Current: {d.current.toFixed(2)}</p>
        <p className={d.improved ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          Delta: {d.delta > 0 ? '+' : ''}{d.delta.toFixed(2)} {d.improved ? '(Improved)' : '(Regressed)'}
        </p>
      </div>
    )
  }

  const yLabel = mode === 'mean' ? 'Mean Score' : 'Std Deviation'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={80}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          interval={0}
        />
        <YAxis
          domain={mode === 'mean' ? [0, 5] : ['auto', 'auto']}
          tick={{ fontSize: 12, fill: '#6b7280' }}
          label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: '#6b7280' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <ReferenceLine y={0} stroke="#9ca3af" />
        <Bar dataKey="baseline" name="Baseline" fill="#93c5fd" radius={[4, 4, 0, 0]} />
        <Bar dataKey="current" name="Current" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
