import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'
import type { QuestionInsight } from '@/types'

interface BoxWhiskerChartProps {
  data: QuestionInsight[]
  height?: number
  gapThreshold?: number
}

interface ChartDataPoint {
  name: string
  fullName: string
  mean: number
  min: number
  max: number
  stddev: number
  isGap: boolean
  domainName: string
}

function truncate(text: string, maxLen: number): string {
  return text.length > maxLen ? text.slice(0, maxLen - 1) + '\u2026' : text
}

export function BoxWhiskerChart({ data, height = 400, gapThreshold = 1.5 }: BoxWhiskerChartProps) {
  console.log('[BoxWhiskerChart] Rendering with', data.length, 'questions')

  const chartData: ChartDataPoint[] = useMemo(
    () =>
      data.map((q) => ({
        name: truncate(q.question_text, 30),
        fullName: q.question_text,
        mean: q.mean,
        min: q.min_score,
        max: q.max_score,
        stddev: q.stddev,
        isGap: q.stddev > gapThreshold,
        domainName: q.domain_name,
      })),
    [data, gapThreshold]
  )

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No data available
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload as ChartDataPoint
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium text-gray-900 mb-1">{d.fullName}</p>
        <p className="text-gray-600">Domain: {d.domainName}</p>
        <p className="text-gray-600">Mean: <span className="font-semibold">{d.mean}</span></p>
        <p className="text-gray-600">Std Dev: <span className="font-semibold">{d.stddev}</span></p>
        <p className="text-gray-600">Range: {d.min} - {d.max}</p>
        {d.isGap && (
          <p className="text-red-600 font-medium mt-1">Perception Gap Detected</p>
        )}
      </div>
    )
  }

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
        <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: '#6b7280' }} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={gapThreshold} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `Gap Threshold (SD>${gapThreshold})`, position: 'right', fill: '#ef4444', fontSize: 10 }} />
        <Bar dataKey="mean" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isGap ? '#ef4444' : entry.mean >= 4 ? '#10b981' : '#3b82f6'}
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
