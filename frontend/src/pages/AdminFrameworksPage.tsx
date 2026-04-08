import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminFrameworkApi, frameworkApi } from '@/services/api'
import { Layout } from '@/components/Layout'
import type {
  FrameworkAdminResponse,
  FrameworkCreate,
  FrameworkDomain,
  FrameworkGate,
  FrameworkQuestion,
} from '@/types'

export function AdminFrameworksPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [expandedFramework, setExpandedFramework] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState<FrameworkCreate>({
    name: '',
    description: '',
    version: '1.0',
  })

  // Inline editing state
  const [editingItem, setEditingItem] = useState<{
    type: 'domain' | 'gate' | 'question'
    id: string
    frameworkId: string
    domainId?: string
    gateId?: string
    data: Record<string, any>
  } | null>(null)

  // Add new item state
  const [addingItem, setAddingItem] = useState<{
    type: 'domain' | 'gate' | 'question'
    frameworkId: string
    domainId?: string
    gateId?: string
    data: Record<string, any>
  } | null>(null)

  console.log('[AdminFrameworksPage] Rendering')

  // Fetch frameworks list
  const { data: frameworks, isLoading } = useQuery({
    queryKey: ['admin-frameworks'],
    queryFn: adminFrameworkApi.list,
  })

  // Fetch structure for expanded framework
  const { data: expandedStructure } = useQuery({
    queryKey: ['framework-structure', expandedFramework],
    queryFn: () => frameworkApi.getStructure(expandedFramework!),
    enabled: !!expandedFramework,
  })

  // Mutations
  const createFrameworkMutation = useMutation({
    mutationFn: adminFrameworkApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-frameworks'] })
      setShowCreateModal(false)
      setCreateForm({ name: '', description: '', version: '1.0' })
    },
    onError: (err: any) => alert(err.response?.data?.detail || 'Failed to create framework'),
  })

  const deleteFrameworkMutation = useMutation({
    mutationFn: adminFrameworkApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-frameworks'] })
      setExpandedFramework(null)
    },
    onError: (err: any) => alert(err.response?.data?.detail || 'Failed to delete framework'),
  })

  const importMutation = useMutation({
    mutationFn: adminFrameworkApi.importFramework,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-frameworks'] })
      alert('Framework imported successfully')
    },
    onError: (err: any) => alert(err.response?.data?.detail || 'Failed to import framework'),
  })

  // Generic mutation for add/edit/delete of nested items
  const itemMutation = useMutation({
    mutationFn: async (action: { type: string; fn: () => Promise<any> }) => action.fn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['framework-structure', expandedFramework] })
      queryClient.invalidateQueries({ queryKey: ['admin-frameworks'] })
      setEditingItem(null)
      setAddingItem(null)
    },
    onError: (err: any) => alert(err.response?.data?.detail || 'Operation failed'),
  })

  const handleExport = async (fw: FrameworkAdminResponse, format: 'json' | 'yaml') => {
    try {
      const result = await adminFrameworkApi.exportFramework(fw.id, format)
      const content =
        format === 'yaml'
          ? result.content
          : JSON.stringify(result.content, null, 2)
      const blob = new Blob([content], {
        type: format === 'yaml' ? 'text/yaml' : 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed')
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      importMutation.mutate(file)
      e.target.value = ''
    }
  }

  const handleAddItem = () => {
    if (!addingItem) return
    const { type, frameworkId, domainId, gateId, data } = addingItem

    if (type === 'domain') {
      itemMutation.mutate({
        type: 'add-domain',
        fn: () =>
          adminFrameworkApi.createDomain(frameworkId, {
            name: data.name,
            description: data.description,
            weight: parseFloat(data.weight) || 1.0,
            order: parseInt(data.order) || 0,
          }),
      })
    } else if (type === 'gate' && domainId) {
      itemMutation.mutate({
        type: 'add-gate',
        fn: () =>
          adminFrameworkApi.createGate(frameworkId, domainId, {
            name: data.name,
            description: data.description,
            order: parseInt(data.order) || 0,
          }),
      })
    } else if (type === 'question' && domainId && gateId) {
      itemMutation.mutate({
        type: 'add-question',
        fn: () =>
          adminFrameworkApi.createQuestion(frameworkId, domainId, gateId, {
            text: data.text,
            guidance: data.guidance,
            order: parseInt(data.order) || 0,
          }),
      })
    }
  }

  const handleSaveEdit = () => {
    if (!editingItem) return
    const { type, id, frameworkId, domainId, gateId, data } = editingItem

    if (type === 'domain') {
      itemMutation.mutate({
        type: 'edit-domain',
        fn: () => adminFrameworkApi.updateDomain(frameworkId, id, data),
      })
    } else if (type === 'gate' && domainId) {
      itemMutation.mutate({
        type: 'edit-gate',
        fn: () => adminFrameworkApi.updateGate(frameworkId, domainId, id, data),
      })
    } else if (type === 'question' && domainId && gateId) {
      itemMutation.mutate({
        type: 'edit-question',
        fn: () => adminFrameworkApi.updateQuestion(frameworkId, domainId, gateId, id, data),
      })
    }
  }

  const handleDeleteItem = (
    type: 'domain' | 'gate' | 'question',
    frameworkId: string,
    itemId: string,
    domainId?: string,
    gateId?: string,
    name?: string,
  ) => {
    if (!confirm(`Delete ${type} "${name}"? This cannot be undone.`)) return

    if (type === 'domain') {
      itemMutation.mutate({
        type: 'delete-domain',
        fn: () => adminFrameworkApi.deleteDomain(frameworkId, itemId),
      })
    } else if (type === 'gate' && domainId) {
      itemMutation.mutate({
        type: 'delete-gate',
        fn: () => adminFrameworkApi.deleteGate(frameworkId, domainId, itemId),
      })
    } else if (type === 'question' && domainId && gateId) {
      itemMutation.mutate({
        type: 'delete-question',
        fn: () => adminFrameworkApi.deleteQuestion(frameworkId, domainId, gateId, itemId),
      })
    }
  }

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Framework Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create, edit, and manage assessment frameworks
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            + New Framework
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importMutation.isPending}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            {importMutation.isPending ? 'Importing...' : 'Import Framework'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.yaml,.yml"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {/* Frameworks List */}
        <div className="space-y-4">
          {isLoading && (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">Loading frameworks...</p>
            </div>
          )}

          {frameworks?.map((fw: FrameworkAdminResponse) => (
            <div key={fw.id} className="bg-white rounded-lg shadow">
              {/* Framework Header */}
              <div
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  setExpandedFramework(expandedFramework === fw.id ? null : fw.id)
                }
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-gray-900">{fw.name}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      v{fw.version}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1 flex gap-4">
                    <span>{fw.domain_count} domains</span>
                    <span>{fw.question_count} questions</span>
                    <span>{fw.assessment_count} assessments</span>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleExport(fw, 'json')}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => handleExport(fw, 'yaml')}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    YAML
                  </button>
                  <button
                    onClick={() => {
                      if (fw.assessment_count > 0) {
                        alert(
                          `Cannot delete: ${fw.assessment_count} assessment(s) reference this framework`,
                        )
                        return
                      }
                      if (confirm(`Delete framework "${fw.name}"?`))
                        deleteFrameworkMutation.mutate(fw.id)
                    }}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Delete
                  </button>
                  <span className="text-gray-400 ml-2">
                    {expandedFramework === fw.id ? '\u25B2' : '\u25BC'}
                  </span>
                </div>
              </div>

              {/* Expanded Framework Structure */}
              {expandedFramework === fw.id && expandedStructure && (
                <div className="border-t border-gray-200 px-6 py-4">
                  {/* Add Domain Button */}
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setAddingItem({
                          type: 'domain',
                          frameworkId: fw.id,
                          data: {
                            name: '',
                            description: '',
                            weight: '1.0',
                            order: String(expandedStructure.domains.length),
                          },
                        })
                      }
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      + Add Domain
                    </button>
                  </div>

                  {/* Domains */}
                  {expandedStructure.domains.map((domain: FrameworkDomain) => (
                    <div key={domain.id} className="mb-6 border border-gray-200 rounded-lg">
                      {/* Domain Header */}
                      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between rounded-t-lg">
                        {editingItem?.id === domain.id && editingItem?.type === 'domain' ? (
                          <div className="flex-1 flex gap-2 items-center">
                            <input
                              value={editingItem.data.name || ''}
                              onChange={e =>
                                setEditingItem({
                                  ...editingItem,
                                  data: { ...editingItem.data, name: e.target.value },
                                })
                              }
                              className="px-2 py-1 border rounded text-sm flex-1"
                              placeholder="Domain name"
                            />
                            <input
                              value={editingItem.data.weight || ''}
                              onChange={e =>
                                setEditingItem({
                                  ...editingItem,
                                  data: { ...editingItem.data, weight: parseFloat(e.target.value) || 0 },
                                })
                              }
                              className="px-2 py-1 border rounded text-sm w-20"
                              placeholder="Weight"
                              type="number"
                              step="0.1"
                            />
                            <button
                              onClick={handleSaveEdit}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <div>
                              <span className="font-medium text-gray-900">{domain.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                (weight: {domain.weight}, order: {domain.order})
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() =>
                                  setEditingItem({
                                    type: 'domain',
                                    id: domain.id,
                                    frameworkId: fw.id,
                                    data: {
                                      name: domain.name,
                                      description: domain.description,
                                      weight: domain.weight,
                                      order: domain.order,
                                    },
                                  })
                                }
                                className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteItem('domain', fw.id, domain.id, undefined, undefined, domain.name)
                                }
                                className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Gates within Domain */}
                      <div className="px-4 py-2">
                        {domain.gates.map((gate: FrameworkGate) => (
                          <div key={gate.id} className="mb-3 ml-4">
                            {/* Gate Header */}
                            <div className="flex items-center justify-between py-1">
                              {editingItem?.id === gate.id && editingItem?.type === 'gate' ? (
                                <div className="flex-1 flex gap-2 items-center">
                                  <input
                                    value={editingItem.data.name || ''}
                                    onChange={e =>
                                      setEditingItem({
                                        ...editingItem,
                                        data: { ...editingItem.data, name: e.target.value },
                                      })
                                    }
                                    className="px-2 py-1 border rounded text-sm flex-1"
                                  />
                                  <button
                                    onClick={handleSaveEdit}
                                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingItem(null)}
                                    className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-sm font-medium text-gray-700">
                                    {gate.name}
                                  </span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() =>
                                        setEditingItem({
                                          type: 'gate',
                                          id: gate.id,
                                          frameworkId: fw.id,
                                          domainId: domain.id,
                                          data: {
                                            name: gate.name,
                                            description: gate.description,
                                            order: gate.order,
                                          },
                                        })
                                      }
                                      className="px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteItem('gate', fw.id, gate.id, domain.id, undefined, gate.name)
                                      }
                                      className="px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 rounded"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Questions within Gate */}
                            <div className="ml-4 space-y-1">
                              {gate.questions.map((q: FrameworkQuestion) => (
                                <div
                                  key={q.id}
                                  className="flex items-start justify-between py-1 text-sm"
                                >
                                  {editingItem?.id === q.id &&
                                  editingItem?.type === 'question' ? (
                                    <div className="flex-1 space-y-1">
                                      <input
                                        value={editingItem.data.text || ''}
                                        onChange={e =>
                                          setEditingItem({
                                            ...editingItem,
                                            data: {
                                              ...editingItem.data,
                                              text: e.target.value,
                                            },
                                          })
                                        }
                                        className="w-full px-2 py-1 border rounded text-sm"
                                        placeholder="Question text"
                                      />
                                      <textarea
                                        value={editingItem.data.guidance || ''}
                                        onChange={e =>
                                          setEditingItem({
                                            ...editingItem,
                                            data: {
                                              ...editingItem.data,
                                              guidance: e.target.value,
                                            },
                                          })
                                        }
                                        className="w-full px-2 py-1 border rounded text-sm"
                                        placeholder="Guidance"
                                        rows={2}
                                      />
                                      <div className="flex gap-1">
                                        <button
                                          onClick={handleSaveEdit}
                                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => setEditingItem(null)}
                                          className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex-1">
                                        <span className="text-gray-600">{q.text}</span>
                                        {q.guidance && (
                                          <p className="text-xs text-gray-400 mt-0.5">
                                            {q.guidance.substring(0, 80)}
                                            {q.guidance.length > 80 ? '...' : ''}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex gap-1 ml-2 shrink-0">
                                        <button
                                          onClick={() =>
                                            setEditingItem({
                                              type: 'question',
                                              id: q.id,
                                              frameworkId: fw.id,
                                              domainId: domain.id,
                                              gateId: gate.id,
                                              data: {
                                                text: q.text,
                                                guidance: q.guidance,
                                                order: q.order,
                                              },
                                            })
                                          }
                                          className="px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteItem(
                                              'question',
                                              fw.id,
                                              q.id,
                                              domain.id,
                                              gate.id,
                                              q.text.substring(0, 30),
                                            )
                                          }
                                          className="px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 rounded"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                              {/* Add Question Button */}
                              <button
                                onClick={() =>
                                  setAddingItem({
                                    type: 'question',
                                    frameworkId: fw.id,
                                    domainId: domain.id,
                                    gateId: gate.id,
                                    data: {
                                      text: '',
                                      guidance: '',
                                      order: String(gate.questions.length),
                                    },
                                  })
                                }
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                              >
                                + Add Question
                              </button>
                            </div>
                          </div>
                        ))}
                        {/* Add Gate Button */}
                        <button
                          onClick={() =>
                            setAddingItem({
                              type: 'gate',
                              frameworkId: fw.id,
                              domainId: domain.id,
                              data: {
                                name: '',
                                description: '',
                                order: String(domain.gates.length),
                              },
                            })
                          }
                          className="text-xs text-blue-600 hover:text-blue-800 ml-4 mt-1"
                        >
                          + Add Gate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Create Framework Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create Framework</h3>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault()
                createFrameworkMutation.mutate(createForm)
              }}
              className="px-6 py-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={createForm.description}
                  onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <input
                  type="text"
                  required
                  value={createForm.version}
                  onChange={e => setCreateForm(f => ({ ...f, version: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createFrameworkMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {createFrameworkMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {addingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                Add {addingItem.type}
              </h3>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault()
                handleAddItem()
              }}
              className="px-6 py-4 space-y-4"
            >
              {addingItem.type === 'question' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Text
                    </label>
                    <textarea
                      required
                      value={addingItem.data.text || ''}
                      onChange={e =>
                        setAddingItem({
                          ...addingItem,
                          data: { ...addingItem.data, text: e.target.value },
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guidance
                    </label>
                    <textarea
                      value={addingItem.data.guidance || ''}
                      onChange={e =>
                        setAddingItem({
                          ...addingItem,
                          data: { ...addingItem.data, guidance: e.target.value },
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={addingItem.data.name || ''}
                      onChange={e =>
                        setAddingItem({
                          ...addingItem,
                          data: { ...addingItem.data, name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={addingItem.data.description || ''}
                      onChange={e =>
                        setAddingItem({
                          ...addingItem,
                          data: { ...addingItem.data, description: e.target.value },
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {addingItem.type === 'domain' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={addingItem.data.weight || '1.0'}
                        onChange={e =>
                          setAddingItem({
                            ...addingItem,
                            data: { ...addingItem.data, weight: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input
                  type="number"
                  value={addingItem.data.order || '0'}
                  onChange={e =>
                    setAddingItem({
                      ...addingItem,
                      data: { ...addingItem.data, order: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setAddingItem(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={itemMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {itemMutation.isPending ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
