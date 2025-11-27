import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assessmentApi, frameworkApi } from '@/services/api'
import { GateResponseCreate, FrameworkDomain } from '@/types'

export function AssessmentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [currentDomainId, setCurrentDomainId] = useState<string>('')
  const [responses, setResponses] = useState<Record<string, GateResponseCreate>>({})
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Fetch assessment
  const { data: assessment, isLoading: assessmentLoading } = useQuery({
    queryKey: ['assessment', id],
    queryFn: () => assessmentApi.get(id!),
  })

  // Fetch framework structure
  const { data: frameworkStructure, isLoading: frameworkLoading } = useQuery({
    queryKey: ['framework', assessment?.framework_id],
    queryFn: () => frameworkApi.getStructure(assessment!.framework_id),
    enabled: !!assessment?.framework_id,
  })

  // Fetch existing responses
  const { data: existingResponses } = useQuery({
    queryKey: ['responses', id],
    queryFn: () => assessmentApi.getResponses(id!),
  })

  // Initialize current domain
  useEffect(() => {
    if (frameworkStructure?.domains.length && !currentDomainId) {
      setCurrentDomainId(frameworkStructure.domains[0].id)
    }
  }, [frameworkStructure, currentDomainId])

  // Load existing responses into state
  useEffect(() => {
    if (existingResponses) {
      const responseMap: Record<string, GateResponseCreate> = {}
      existingResponses.forEach(r => {
        // Use question_id as key since it's unique
        responseMap[r.question_id] = {
          question_id: r.question_id,
          score: r.score,
          notes: r.notes,
          evidence: r.evidence,
        }
      })
      setResponses(responseMap)
    }
  }, [existingResponses])

  // Save responses mutation
  const saveMutation = useMutation({
    mutationFn: (responsesToSave: GateResponseCreate[]) =>
      assessmentApi.saveResponses(id!, responsesToSave),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['responses', id] })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    },
  })

  // Submit assessment mutation
  const submitMutation = useMutation({
    mutationFn: () => assessmentApi.submit(id!),
    onSuccess: () => {
      navigate(`/results/${id}`)
    },
  })

  const handleScoreChange = (questionId: string, score: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        score,
        notes: prev[questionId]?.notes,
        evidence: prev[questionId]?.evidence,
      },
    }))
  }

  const handleNotesChange = (questionId: string, notes: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        question_id: questionId,
        score: prev[questionId]?.score ?? 0,
        notes,
      },
    }))
  }

  const handleSave = () => {
    setSaveStatus('saving')
    const responsesToSave = Object.values(responses).filter(r => r.score !== undefined)
    saveMutation.mutate(responsesToSave)
  }

  const handleSubmit = () => {
    if (window.confirm('Are you sure you want to submit this assessment? This will finalize your responses and calculate scores.')) {
      submitMutation.mutate()
    }
  }

  const getCurrentDomain = (): FrameworkDomain | undefined => {
    return frameworkStructure?.domains.find(d => d.id === currentDomainId)
  }

  const getTotalResponses = () => Object.keys(responses).length

  const getTotalQuestions = () => {
    if (!frameworkStructure) return 0
    let count = 0
    frameworkStructure.domains.forEach(d => {
      d.gates.forEach(g => {
        count += g.questions.length
      })
    })
    return count
  }

  const getProgress = () => {
    const total = getTotalQuestions()
    return total > 0 ? (getTotalResponses() / total) * 100 : 0
  }

  const canSubmit = () => {
    return getTotalResponses() > 0
  }

  if (assessmentLoading || frameworkLoading || !frameworkStructure) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment...</p>
        </div>
      </div>
    )
  }

  const currentDomain = getCurrentDomain()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Assessment: {assessment?.team_name}
              </h1>
              <div className="text-sm text-gray-500">{frameworkStructure.framework.name}</div>
              <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                <span>
                  Progress: {getTotalResponses()} / {getTotalQuestions()} questions
                </span>
                <span className="text-blue-600 font-medium">{getProgress().toFixed(0)}%</span>
              </div>
            </div>
            <div className="flex gap-2">
              {saveStatus === 'saved' && (
                <span className="text-green-600 text-sm font-medium self-center">✓ Saved</span>
              )}
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending || saveStatus === 'saving'}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm font-medium"
              >
                {saveStatus === 'saving' ? 'Saving...' : 'Save Progress'}
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Domain Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-4 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Domains</h2>
              <nav className="space-y-2">
                {frameworkStructure.domains.map(domain => {
                  const domainQuestions = domain.gates.reduce((sum, gate) => sum + gate.questions.length, 0)

                  // Calculate responses for this domain
                  // We need to check if response's question_id belongs to any gate in this domain
                  // Optimization: Create a Set of question IDs for this domain
                  const domainQuestionIds = new Set<string>()
                  domain.gates.forEach(g => g.questions.forEach(q => domainQuestionIds.add(q.id)))

                  const domainResponseCount = Object.keys(responses).filter(qId => domainQuestionIds.has(qId)).length
                  const completed = domainQuestions > 0 ? domainResponseCount === domainQuestions : false

                  return (
                    <button
                      key={domain.id}
                      onClick={() => setCurrentDomainId(domain.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        currentDomainId === domain.id
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{domain.name}</span>
                        {completed && <span className="text-green-600">✓</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {domainResponseCount} / {domainQuestions}
                      </div>
                    </button>
                  )
                })}
              </nav>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit() || submitMutation.isPending}
                className="w-full mt-6 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Assessment'}
              </button>
            </div>
          </div>

          {/* Questions */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentDomain?.name}
                </h2>
                {currentDomain?.description && (
                  <p className="text-gray-500 mt-1">{currentDomain.description}</p>
                )}
              </div>

              <div className="p-6 space-y-8">
                {currentDomain?.gates.map((gate) => (
                  <div key={gate.id} className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{gate.name}</h3>

                    {gate.questions.map(question => {
                      const response = responses[question.id]

                      return (
                        <div key={question.id} className="mb-6 pb-6 border-b border-gray-200 last:border-0">
                          <p className="text-gray-900 font-medium mb-2">{question.text}</p>
                          <p className="text-sm text-gray-600 mb-4">{question.guidance}</p>

                          {/* Score Selector */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Score (0-5)
                            </label>
                            <div className="flex gap-2">
                              {[0, 1, 2, 3, 4, 5].map(score => (
                                <button
                                  key={score}
                                  onClick={() => handleScoreChange(question.id, score)}
                                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    response?.score === score
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {score}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Notes (optional)
                            </label>
                            <textarea
                              value={response?.notes || ''}
                              onChange={e => handleNotesChange(question.id, e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="Add any notes or context..."
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
