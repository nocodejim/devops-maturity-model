import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assessmentApi, gatesApi } from '@/services/api'
import { DomainType, Gate, GateResponseCreate } from '@/types'

const DOMAIN_NAMES = {
  domain1: 'Source Control & Development',
  domain2: 'Security & Compliance',
  domain3: 'CI/CD & Deployment',
  domain4: 'Infrastructure & Platform',
  domain5: 'Observability & Improvement',
}

export function AssessmentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [currentDomain, setCurrentDomain] = useState<DomainType>(DomainType.DOMAIN1)
  const [responses, setResponses] = useState<Record<string, GateResponseCreate>>({})
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Fetch assessment
  const { data: assessment } = useQuery({
    queryKey: ['assessment', id],
    queryFn: () => assessmentApi.get(id!),
  })

  // Fetch gates definitions
  const { data: gatesData, isLoading: gatesLoading } = useQuery({
    queryKey: ['gates'],
    queryFn: gatesApi.getAll,
  })

  // Fetch existing responses
  const { data: existingResponses } = useQuery({
    queryKey: ['responses', id],
    queryFn: () => assessmentApi.getResponses(id!),
  })

  // Load existing responses into state
  useEffect(() => {
    if (existingResponses) {
      const responseMap: Record<string, GateResponseCreate> = {}
      existingResponses.forEach(r => {
        const key = `${r.gate_id}_${r.question_id}`
        responseMap[key] = {
          domain: r.domain,
          gate_id: r.gate_id,
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

  const handleScoreChange = (gateId: string, questionId: string, domain: DomainType, score: number) => {
    const key = `${gateId}_${questionId}`
    setResponses(prev => ({
      ...prev,
      [key]: {
        domain,
        gate_id: gateId,
        question_id: questionId,
        score,
        notes: prev[key]?.notes,
        evidence: prev[key]?.evidence,
      },
    }))
  }

  const handleNotesChange = (gateId: string, questionId: string, domain: DomainType, notes: string) => {
    const key = `${gateId}_${questionId}`
    setResponses(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        domain,
        gate_id: gateId,
        question_id: questionId,
        score: prev[key]?.score ?? 0,
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

  const getDomainGates = (domain: DomainType): Array<[string, Gate]> => {
    if (!gatesData?.gates) return []
    return Object.entries(gatesData.gates)
      .filter(([_, gate]) => gate.domain === domain)
      .sort(([a], [b]) => a.localeCompare(b))
  }

  const getTotalResponses = () => Object.keys(responses).length
  const getTotalQuestions = () => gatesData?.total_questions ?? 0
  const getProgress = () => {
    const total = getTotalQuestions()
    return total > 0 ? (getTotalResponses() / total) * 100 : 0
  }

  const canSubmit = () => {
    // At least some responses required
    return getTotalResponses() > 0
  }

  if (gatesLoading || !gatesData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment...</p>
        </div>
      </div>
    )
  }

  const domains = [
    DomainType.DOMAIN1,
    DomainType.DOMAIN2,
    DomainType.DOMAIN3,
    DomainType.DOMAIN4,
    DomainType.DOMAIN5,
  ]

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
                {domains.map(domain => {
                  const gates = getDomainGates(domain)
                  const domainQuestions = gates.reduce((sum, [_, gate]) => sum + gate.questions.length, 0)
                  const domainResponses = Object.values(responses).filter(r => r.domain === domain).length
                  const completed = domainQuestions > 0 ? domainResponses === domainQuestions : false

                  return (
                    <button
                      key={domain}
                      onClick={() => setCurrentDomain(domain)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        currentDomain === domain
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{DOMAIN_NAMES[domain]}</span>
                        {completed && <span className="text-green-600">✓</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {domainResponses} / {domainQuestions}
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
                  {DOMAIN_NAMES[currentDomain]}
                </h2>
              </div>

              <div className="p-6 space-y-8">
                {getDomainGates(currentDomain).map(([gateId, gate]) => (
                  <div key={gateId} className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{gate.name}</h3>

                    {gate.questions.map(question => {
                      const key = `${gateId}_${question.id}`
                      const response = responses[key]

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
                                  onClick={() => handleScoreChange(gateId, question.id, currentDomain, score)}
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
                              onChange={e => handleNotesChange(gateId, question.id, currentDomain, e.target.value)}
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
