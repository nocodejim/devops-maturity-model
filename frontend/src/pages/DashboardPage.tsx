import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { assessmentApi, analyticsApi, frameworkApi } from '@/services/api'
import type { Assessment, Framework } from '@/types'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const [showNewAssessment, setShowNewAssessment] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>('')

  // Fetch assessments
  const { data: assessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ['assessments'],
    queryFn: assessmentApi.list,
  })

  // Fetch frameworks
  const { data: frameworks, isLoading: frameworksLoading } = useQuery({
    queryKey: ['frameworks'],
    queryFn: frameworkApi.list,
  })

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsApi.getSummary,
  })

  // Create assessment mutation
  const createMutation = useMutation({
    mutationFn: (data: { teamName: string; frameworkId: string }) =>
      assessmentApi.create(data.teamName, data.frameworkId, user?.organization_id),
    onSuccess: assessment => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      setShowNewAssessment(false)
      setNewTeamName('')
      setSelectedFrameworkId('')
      navigate(`/assessment/${assessment.id}`)
    },
  })

  // Delete assessment mutation
  const deleteMutation = useMutation({
    mutationFn: assessmentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTeamName.trim() && selectedFrameworkId) {
      createMutation.mutate({ teamName: newTeamName.trim(), frameworkId: selectedFrameworkId })
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    }
    return styles[status as keyof typeof styles] || styles.draft
  }

  const getMaturityBadge = (level?: number) => {
    if (!level) return null
    const colors = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-yellow-100 text-yellow-800',
      4: 'bg-blue-100 text-blue-800',
      5: 'bg-green-100 text-green-800',
    }
    const names = {
      1: 'Initial',
      2: 'Developing',
      3: 'Defined',
      4: 'Managed',
      5: 'Optimizing',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[level as keyof typeof colors]}`}>
        Level {level} - {names[level as keyof typeof names]}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DevOps Maturity Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back, {user?.full_name}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600">Total Assessments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.total_assessments}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{analytics.completed_assessments}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {analytics.average_score > 0 ? analytics.average_score.toFixed(1) : '—'}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-600">Avg Maturity Level</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {analytics.average_maturity_level > 0 ? analytics.average_maturity_level.toFixed(1) : '—'}
              </p>
            </div>
          </div>
        )}

        {/* Assessments List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Assessments</h2>
            <button
              onClick={() => {
                setShowNewAssessment(true)
                if (frameworks && frameworks.length > 0) {
                    setSelectedFrameworkId(frameworks[0].id)
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              + New Assessment
            </button>
          </div>

          {showNewAssessment && (
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
              <form onSubmit={handleCreateAssessment} className="space-y-4">
                <div>
                  <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                  <input
                    id="teamName"
                    type="text"
                    value={newTeamName}
                    onChange={e => setNewTeamName(e.target.value)}
                    placeholder="Enter team name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="framework" className="block text-sm font-medium text-gray-700 mb-1">Assessment Framework</label>
                  {frameworksLoading ? (
                    <div className="text-sm text-gray-500">Loading frameworks...</div>
                  ) : (
                    <select
                        id="framework"
                        value={selectedFrameworkId}
                        onChange={e => setSelectedFrameworkId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="" disabled>Select a framework</option>
                        {frameworks?.map(f => (
                            <option key={f.id} value={f.id}>{f.name} (v{f.version})</option>
                        ))}
                    </select>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                    <button
                    type="submit"
                    disabled={createMutation.isPending || !newTeamName.trim() || !selectedFrameworkId}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                    </button>
                    <button
                    type="button"
                    onClick={() => {
                        setShowNewAssessment(false)
                        setNewTeamName('')
                        setSelectedFrameworkId('')
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                    Cancel
                    </button>
                </div>
              </form>
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {assessmentsLoading && (
              <div className="px-6 py-12 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4">Loading assessments...</p>
              </div>
            )}

            {!assessmentsLoading && assessments && assessments.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-500">
                <p>No assessments yet. Create your first assessment to get started.</p>
              </div>
            )}

            {assessments?.map((assessment: Assessment) => (
              <div key={assessment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-gray-900">{assessment.team_name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(assessment.status)}`}>
                        {assessment.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-6 text-sm text-gray-600">
                      <span>Created: {new Date(assessment.created_at).toLocaleDateString()}</span>
                      {assessment.overall_score !== null && assessment.overall_score !== undefined && (
                        <span className="font-medium">Score: {assessment.overall_score.toFixed(1)}</span>
                      )}
                      {assessment.maturity_level && getMaturityBadge(assessment.maturity_level)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {assessment.status === 'completed' ? (
                      <button
                        onClick={() => navigate(`/results/${assessment.id}`)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        View Results
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/assessment/${assessment.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        {assessment.status === 'draft' ? 'Start' : 'Continue'}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this assessment?')) {
                          deleteMutation.mutate(assessment.id)
                        }
                      }}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
