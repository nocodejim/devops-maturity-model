import { useMemo } from 'react'
import type { RoleHeatmapEntry } from '@/types'

interface RoleHeatmapProps {
  entries: RoleHeatmapEntry[]
  roles: string[]
}

function getScoreColor(score: number): string {
  if (score >= 4) return 'bg-green-500 text-white'
  if (score >= 3) return 'bg-green-200 text-green-900'
  if (score >= 2) return 'bg-yellow-200 text-yellow-900'
  if (score >= 1) return 'bg-orange-300 text-orange-900'
  return 'bg-red-500 text-white'
}

function formatRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export function RoleHeatmap({ entries, roles }: RoleHeatmapProps) {
  console.log('[RoleHeatmap] Rendering with', entries.length, 'entries,', roles.length, 'roles')

  // Group entries by domain
  const groupedByDomain = useMemo(() => {
    const groups: Record<string, RoleHeatmapEntry[]> = {}
    for (const entry of entries) {
      if (!groups[entry.domain_name]) groups[entry.domain_name] = []
      groups[entry.domain_name].push(entry)
    }
    return groups
  }, [entries])

  if (!entries.length || !roles.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No role-based data available. Ensure users have functional roles assigned.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 min-w-[250px]">
              Question
            </th>
            {roles.map((role) => (
              <th
                key={role}
                className="border border-gray-200 px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[80px]"
              >
                {formatRole(role)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedByDomain).map(([domain, domainEntries]) => (
            <>
              <tr key={`domain-${domain}`}>
                <td
                  colSpan={roles.length + 1}
                  className="border border-gray-200 px-3 py-2 bg-blue-50 text-sm font-semibold text-blue-800"
                >
                  {domain}
                </td>
              </tr>
              {domainEntries.map((entry) => (
                <tr key={entry.question_id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-3 py-2 text-sm text-gray-700 sticky left-0 bg-white z-10">
                    <span className="text-xs text-gray-400 block">{entry.gate_name}</span>
                    {entry.question_text.length > 80
                      ? entry.question_text.slice(0, 80) + '\u2026'
                      : entry.question_text}
                  </td>
                  {roles.map((role) => {
                    const score = entry.role_scores[role]
                    return (
                      <td
                        key={role}
                        className={`border border-gray-200 px-3 py-2 text-center text-sm font-medium ${
                          score !== undefined ? getScoreColor(score) : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {score !== undefined ? score.toFixed(1) : '-'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
        <span className="font-medium">Score Legend:</span>
        <span className="inline-flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-red-500"></span> 0-1
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-orange-300"></span> 1-2
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-yellow-200"></span> 2-3
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-green-200"></span> 3-4
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-4 h-4 rounded bg-green-500"></span> 4-5
        </span>
      </div>
    </div>
  )
}
