import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface RadarChartData {
  domain: string
  score: number
  fullMark: number
}

interface RadarChartProps {
  data: RadarChartData[]
  title?: string
  height?: number
}

// Wrap long domain names onto up to two lines so radar labels don't collide
function RadarTick({ payload, x, y, textAnchor }: any) {
  const words: string[] = String(payload.value).split(' ')
  const lines: string[] = []
  let current = ''
  for (const w of words) {
    if ((current + ' ' + w).trim().length > 16 && current) {
      lines.push(current)
      current = w
    } else {
      current = (current + ' ' + w).trim()
    }
  }
  if (current) lines.push(current)
  return (
    <text x={x} y={y} textAnchor={textAnchor} fill="#4b5563" fontSize={11}>
      {lines.slice(0, 2).map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 13}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

export function RadarChart({ data, title, height = 400 }: RadarChartProps) {
  console.log('[RadarChart] Rendering with data:', data)

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">No data available for radar chart</div>
    )
  }

  return (
    <div>
      {title && <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="domain"
            tick={<RadarTick />}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#9ca3af', fontSize: 10 }}
            tickCount={6}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#2563eb"
            fill="#3b82f6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Score']}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  )
}
