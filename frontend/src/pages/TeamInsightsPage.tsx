import { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { BoxWhiskerChart } from '@/components/BoxWhiskerChart'
import { RoleHeatmap } from '@/components/RoleHeatmap'
import { TrendChart } from '@/components/TrendChart'
import { DiscussionStarters } from '@/components/DiscussionStarters'
import { projectApi, insightsApi } from '@/services/api'
import type {
  Project,
  InsightsResponse,
  RoleHeatmapResponse,
  TrendComparisonResponse,
} from '@/types'

type TabKey = 'overview' | 'gaps' | 'heatmap' | 'trends'

export function TeamInsightsPage() {
  console.log('[TeamInsightsPage] Rendering')

  // State
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Data
  const [insights, setInsights] = useState<InsightsResponse | null>(null)
  const [heatmap, setHeatmap] = useState<RoleHeatmapResponse | null>(null)
  const [campaigns, setCampaigns] = useState<string[]>([])
  const [baselineCampaign, setBaselineCampaign] = useState('')
  const [currentCampaign, setCurrentCampaign] = useState('')
  const [trends, setTrends] = useState<TrendComparisonResponse | null>(null)
  const [trendMode, setTrendMode] = useState<'mean' | 'variance'>('mean')

  // Project creation
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')

  // Load projects on mount
  useEffect(() => {
    console.log('[TeamInsightsPage] Loading projects')
    projectApi.list().then(setProjects).catch(err => {
      console.error('[TeamInsightsPage] Failed to load projects:', err)
      setError('Failed to load projects')
    })
  }, [])

  // Load insights when project changes
  useEffect(() => {
    if (!selectedProjectId) {
      setInsights(null)
      setHeatmap(null)
      setCampaigns([])
      setTrends(null)
      return
    }

    setLoading(true)
    setError(null)
    console.log('[TeamInsightsPage] Loading insights for project:', selectedProjectId)

    Promise.all([
      insightsApi.getInsights(selectedProjectId),
      insightsApi.getRoleHeatmap(selectedProjectId),
      insightsApi.listCampaigns(selectedProjectId),
    ])
      .then(([insightsData, heatmapData, campaignData]) => {
        console.log('[TeamInsightsPage] Insights loaded:', insightsData.total_assessments, 'assessments')
        console.log('[TeamInsightsPage] Heatmap loaded:', heatmapData.entries.length, 'entries')
        console.log('[TeamInsightsPage] Campaigns:', campaignData)
        setInsights(insightsData)
        setHeatmap(heatmapData)
        setCampaigns(campaignData)
        setBaselineCampaign('')
        setCurrentCampaign('')
        setTrends(null)
      })
      .catch(err => {
        console.error('[TeamInsightsPage] Failed to load insights:', err)
        setError('Failed to load insights data')
      })
      .finally(() => setLoading(false))
  }, [selectedProjectId])

  // Load trends when both campaigns are selected
  useEffect(() => {
    if (!selectedProjectId || !baselineCampaign || !currentCampaign || baselineCampaign === currentCampaign) {
      setTrends(null)
      return
    }

    console.log('[TeamInsightsPage] Loading trends:', baselineCampaign, '->', currentCampaign)
    insightsApi.getTrends(selectedProjectId, baselineCampaign, currentCampaign)
      .then(setTrends)
      .catch(err => {
        console.error('[TeamInsightsPage] Failed to load trends:', err)
      })
  }, [selectedProjectId, baselineCampaign, currentCampaign])

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    try {
      console.log('[TeamInsightsPage] Creating project:', newProjectName)
      const project = await projectApi.create({ name: newProjectName.trim(), description: newProjectDesc.trim() || undefined })
      setProjects(prev => [project, ...prev])
      setSelectedProjectId(project.id)
      setNewProjectName('')
      setNewProjectDesc('')
      setShowCreateProject(false)
    } catch (err) {
      console.error('[TeamInsightsPage] Failed to create project:', err)
      setError('Failed to create project')
    }
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'gaps', label: 'Perception Gaps' },
    { key: 'heatmap', label: 'Role Heatmap' },
    { key: 'trends', label: 'Trends' },
  ]

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Insights</h1>
            <p className="text-sm text-gray-500 mt-1">
              Analyze perception gaps and alignment across team assessments
            </p>
          </div>
          {insights && insights.total_assessments > 0 && (
            <button
              onClick={() => insightsApi.downloadPdf(selectedProjectId, insights.project_name).catch(console.error)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Download PDF
            </button>
          )}
        </div>

        {/* Project Selector */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.assessment_count} assessments)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowCreateProject(!showCreateProject)}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                {showCreateProject ? 'Cancel' : '+ New Project'}
              </button>
            </div>
          </div>

          {/* Create Project Form */}
          {showCreateProject && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g., Core Banking API Team"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Description (optional)</label>
                <input
                  type="text"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Brief description"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Create
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-500">Loading insights...</span>
          </div>
        )}

        {/* No Project Selected */}
        {!selectedProjectId && !loading && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Select or Create a Project</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Projects group multiple assessments together for team analysis. Select an existing project
              or create a new one, then assign assessments to it from the Dashboard.
            </p>
          </div>
        )}

        {/* Insights Content */}
        {insights && !loading && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <p className="text-xs font-medium text-gray-500 uppercase">Assessments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{insights.total_assessments}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <p className="text-xs font-medium text-gray-500 uppercase">Respondents</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{insights.total_respondents}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <p className="text-xs font-medium text-red-500 uppercase">Perception Gaps</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{insights.perception_gaps.length}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <p className="text-xs font-medium text-green-500 uppercase">Areas of Praise</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{insights.areas_of_praise.length}</p>
              </div>
            </div>

            {insights.total_assessments === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Completed Assessments</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Assign assessments to this project and complete them to see team insights. Go to the
                  Dashboard to create assessments and assign them to this project.
                </p>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex gap-0">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === tab.key
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <DiscussionStarters starters={insights.discussion_starters} />

                      {/* Quick stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Perception Gaps */}
                        <div className="border border-red-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-red-700 mb-2">
                            Perception Gaps ({insights.perception_gaps.length})
                          </h4>
                          <p className="text-xs text-gray-500 mb-2">High variance (std dev &gt; 1.5)</p>
                          {insights.perception_gaps.slice(0, 3).map((q) => (
                            <p key={q.question_id} className="text-xs text-gray-600 truncate mb-1">
                              {q.question_text} (SD: {q.stddev.toFixed(2)})
                            </p>
                          ))}
                          {insights.perception_gaps.length > 3 && (
                            <button onClick={() => setActiveTab('gaps')} className="text-xs text-red-600 hover:underline mt-1">
                              View all {insights.perception_gaps.length} gaps
                            </button>
                          )}
                        </div>

                        {/* Areas of Praise */}
                        <div className="border border-green-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-green-700 mb-2">
                            Areas of Praise ({insights.areas_of_praise.length})
                          </h4>
                          <p className="text-xs text-gray-500 mb-2">High mean (&gt; 4.0), low variance</p>
                          {insights.areas_of_praise.slice(0, 3).map((q) => (
                            <p key={q.question_id} className="text-xs text-gray-600 truncate mb-1">
                              {q.question_text} (Mean: {q.mean.toFixed(1)})
                            </p>
                          ))}
                        </div>

                        {/* Universal Needs */}
                        <div className="border border-yellow-200 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-yellow-700 mb-2">
                            Universal Needs ({insights.universal_needs.length})
                          </h4>
                          <p className="text-xs text-gray-500 mb-2">Low mean (&lt; 2.0), low variance</p>
                          {insights.universal_needs.slice(0, 3).map((q) => (
                            <p key={q.question_id} className="text-xs text-gray-600 truncate mb-1">
                              {q.question_text} (Mean: {q.mean.toFixed(1)})
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Perception Gaps Tab */}
                  {activeTab === 'gaps' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Score Distribution by Question</h3>
                        <p className="text-sm text-gray-500">
                          Red bars indicate questions with high variance (perception gaps). Green bars show strong consensus.
                        </p>
                      </div>
                      <BoxWhiskerChart data={insights.all_questions} height={400} />

                      {/* Detailed Table */}
                      {insights.perception_gaps.length > 0 && (
                        <div>
                          <h4 className="text-md font-semibold text-gray-900 mb-3">Perception Gap Details</h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                              <thead>
                                <tr className="bg-gray-50 text-left">
                                  <th className="px-3 py-2 font-medium text-gray-600">Question</th>
                                  <th className="px-3 py-2 font-medium text-gray-600 text-center">Mean</th>
                                  <th className="px-3 py-2 font-medium text-gray-600 text-center">Std Dev</th>
                                  <th className="px-3 py-2 font-medium text-gray-600 text-center">Range</th>
                                  <th className="px-3 py-2 font-medium text-gray-600 text-center">Responses</th>
                                </tr>
                              </thead>
                              <tbody>
                                {insights.perception_gaps.map((q) => (
                                  <tr key={q.question_id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="px-3 py-2">
                                      <span className="text-xs text-gray-400">{q.domain_name} / {q.gate_name}</span>
                                      <br />
                                      {q.question_text}
                                    </td>
                                    <td className="px-3 py-2 text-center font-medium">{q.mean.toFixed(1)}</td>
                                    <td className="px-3 py-2 text-center font-medium text-red-600">{q.stddev.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-center">{q.min_score} - {q.max_score}</td>
                                    <td className="px-3 py-2 text-center">{q.response_count}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Role Heatmap Tab */}
                  {activeTab === 'heatmap' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Role-Based Heatmap</h3>
                        <p className="text-sm text-gray-500">
                          Average scores by functional role. Color intensity shows perceived maturity level.
                          Look for columns that are starkly different from others.
                        </p>
                      </div>
                      {heatmap ? (
                        <RoleHeatmap entries={heatmap.entries} roles={heatmap.roles} />
                      ) : (
                        <div className="text-center py-8 text-gray-500 text-sm">Loading heatmap data...</div>
                      )}
                    </div>
                  )}

                  {/* Trends Tab */}
                  {activeTab === 'trends' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Longitudinal Trend Comparison</h3>
                        <p className="text-sm text-gray-500">
                          Compare two assessment campaigns to track alignment improvement over time.
                        </p>
                      </div>

                      {/* Campaign Selectors */}
                      {campaigns.length >= 2 ? (
                        <div className="flex gap-4 flex-wrap">
                          <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Baseline Campaign</label>
                            <select
                              value={baselineCampaign}
                              onChange={(e) => setBaselineCampaign(e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                              <option value="">Select baseline...</option>
                              {campaigns.map((c) => (
                                <option key={c} value={c} disabled={c === currentCampaign}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Current Campaign</label>
                            <select
                              value={currentCampaign}
                              onChange={(e) => setCurrentCampaign(e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            >
                              <option value="">Select current...</option>
                              {campaigns.map((c) => (
                                <option key={c} value={c} disabled={c === baselineCampaign}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-end">
                            <div className="flex rounded-md border border-gray-300 overflow-hidden">
                              <button
                                onClick={() => setTrendMode('mean')}
                                className={`px-3 py-2 text-sm ${trendMode === 'mean' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                              >
                                Mean
                              </button>
                              <button
                                onClick={() => setTrendMode('variance')}
                                className={`px-3 py-2 text-sm ${trendMode === 'variance' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                              >
                                Variance
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-sm text-gray-500">
                          {campaigns.length === 0 ? (
                            <p>No campaigns found. Assign campaign IDs to assessments when creating them to enable trend tracking.</p>
                          ) : (
                            <p>Need at least 2 campaigns for comparison. Currently found: {campaigns.join(', ')}</p>
                          )}
                        </div>
                      )}

                      {/* Trend Chart */}
                      {trends && (
                        <>
                          <TrendChart comparisons={trends.comparisons} mode={trendMode} />

                          {/* Improvements/Regressions Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-green-200 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-green-700 mb-2">Improvements</h4>
                              {trends.comparisons
                                .filter((c) => c.delta_mean > 0)
                                .slice(0, 5)
                                .map((c) => (
                                  <p key={c.question_id} className="text-xs text-gray-600 mb-1 truncate">
                                    +{c.delta_mean.toFixed(2)} {c.question_text}
                                  </p>
                                ))}
                            </div>
                            <div className="border border-red-200 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-red-700 mb-2">Regressions</h4>
                              {trends.comparisons
                                .filter((c) => c.delta_mean < 0)
                                .slice(0, 5)
                                .map((c) => (
                                  <p key={c.question_id} className="text-xs text-gray-600 mb-1 truncate">
                                    {c.delta_mean.toFixed(2)} {c.question_text}
                                  </p>
                                ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </Layout>
  )
}
