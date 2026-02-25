import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { assessmentApi } from '@/services/api'

const MATURITY_LEVELS = {
  1: { name: 'Initial', description: 'Ad-hoc, manual processes', color: 'red' },
  2: { name: 'Developing', description: 'Some automation, inconsistent', color: 'orange' },
  3: { name: 'Defined', description: 'Standardized, documented', color: 'yellow' },
  4: { name: 'Managed', description: 'Metrics-driven, comprehensive automation', color: 'blue' },
  5: { name: 'Optimizing', description: 'Industry-leading, continuous improvement', color: 'green' },
}

// Function to safely get maturity info with fallback
const getMaturityInfo = (level: number) => {
  return MATURITY_LEVELS[level as keyof typeof MATURITY_LEVELS] || MATURITY_LEVELS[1]
}

export function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: () => assessmentApi.getReport(id!),
  })

  const handleDownloadPdf = async () => {
    if (!report || !id) return

    console.log('[ResultsPage] Starting PDF download for:', id)
    setIsDownloading(true)
    setDownloadError(null)

    try {
      await assessmentApi.downloadPdfReport(id, report.assessment.team_name)
      console.log('[ResultsPage] PDF download completed successfully')
    } catch (error) {
      console.error('[ResultsPage] PDF download failed:', error)
      setDownloadError('Failed to download PDF report. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  const maturityInfo = getMaturityInfo(report.maturity_level.level)
  const overallScore = report.assessment.overall_score ?? 0
  const scoreColor = overallScore >= 80 ? 'green' :
                     overallScore >= 60 ? 'blue' :
                     overallScore >= 40 ? 'yellow' : 'orange'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Assessment Results: {report.assessment.team_name}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Completed: {report.assessment.completed_at ? new Date(report.assessment.completed_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Download Error Alert */}
        {downloadError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">{downloadError}</span>
            </div>
            <button
              onClick={() => setDownloadError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Overall Score */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Maturity Score</h2>
            <div className={`text-6xl font-bold text-${scoreColor}-600 mb-2`}>
              {overallScore.toFixed(1)}
            </div>
            <div className="text-2xl text-gray-600 mb-6">out of 100</div>

            <div className={`inline-flex items-center px-6 py-3 rounded-full bg-${maturityInfo.color}-100 text-${maturityInfo.color}-800`}>
              <div className="text-center">
                <div className="text-2xl font-bold">Level {report.maturity_level.level}</div>
                <div className="text-lg">{maturityInfo.name}</div>
                <div className="text-sm mt-1">{maturityInfo.description}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Domain Breakdown */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Domain Breakdown</h2>
          </div>
          <div className="p-6 space-y-6">
            {report.domain_breakdown.map((domain, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{domain.domain}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Maturity Level {domain.maturity_level}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{domain.score.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">/ 100</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${domain.score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Strengths */}
                {domain.strengths && domain.strengths.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-green-700 mb-2">✓ Strengths</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {domain.strengths.map((strength, i) => (
                        <li key={i}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Gaps */}
                {domain.gaps && domain.gaps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-orange-700 mb-2">⚠ Areas for Improvement</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {domain.gaps.map((gap, i) => (
                        <li key={i}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Gate Scores */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Gate Performance</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.gate_scores.map((gate, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-semibold text-gray-900">{gate.gate_name}</h3>
                    <span className="text-sm font-medium text-blue-600">{gate.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${gate.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {gate.score} / {gate.max_score} points
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Strengths */}
        {report.top_strengths && report.top_strengths.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Top Strengths</h2>
            </div>
            <div className="p-6">
              <ul className="space-y-2">
                {report.top_strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Top Gaps */}
        {report.top_gaps && report.top_gaps.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Areas for Improvement</h2>
            </div>
            <div className="p-6">
              <ul className="space-y-2">
                {report.top_gaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-orange-600 mr-2">⚠</span>
                    <span className="text-gray-700">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {report.recommendations && report.recommendations.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-blue-200 bg-blue-100">
              <h2 className="text-xl font-semibold text-blue-900">Recommendations</h2>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {report.recommendations.map((recommendation, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-600 mr-2 font-bold">{idx + 1}.</span>
                    <span className="text-gray-800">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
