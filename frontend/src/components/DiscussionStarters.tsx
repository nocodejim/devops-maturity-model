import type { QuestionInsight } from '@/types'

interface DiscussionStartersProps {
  starters: QuestionInsight[]
}

export function DiscussionStarters({ starters }: DiscussionStartersProps) {
  console.log('[DiscussionStarters] Rendering with', starters.length, 'items')

  if (!starters.length) {
    return null
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">
            Discussion Starters - Top Perception Gaps
          </h3>
          <p className="text-sm text-amber-700 mb-4">
            These questions have the highest variance in scores across team members, indicating significant
            differences in perception. Consider discussing these in your next retrospective or team meeting.
          </p>
          <div className="space-y-3">
            {starters.map((item, idx) => (
              <div key={item.question_id} className="bg-white rounded-md border border-amber-200 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.question_text}</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>{item.domain_name} / {item.gate_name}</span>
                      <span>Mean: <span className="font-semibold text-gray-700">{item.mean.toFixed(1)}</span></span>
                      <span>Std Dev: <span className="font-semibold text-red-600">{item.stddev.toFixed(2)}</span></span>
                      <span>Range: {item.min_score} - {item.max_score}</span>
                      <span>Responses: {item.response_count}</span>
                    </div>
                    {/* Score distribution dots */}
                    <div className="mt-2 flex items-center gap-1">
                      <span className="text-xs text-gray-400 mr-1">Scores:</span>
                      {item.scores.map((score, i) => (
                        <span
                          key={i}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            score >= 4
                              ? 'bg-green-100 text-green-700'
                              : score >= 3
                              ? 'bg-blue-100 text-blue-700'
                              : score >= 2
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {score}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
