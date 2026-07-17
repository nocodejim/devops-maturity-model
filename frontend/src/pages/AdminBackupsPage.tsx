import { useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminBackupApi } from '@/services/api'
import { Layout } from '@/components/Layout'
import type { BackupInfo } from '@/types'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AdminBackupsPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  console.log('[AdminBackupsPage] Rendering')

  const { data: backups, isLoading } = useQuery({
    queryKey: ['admin-backups'],
    queryFn: adminBackupApi.list,
  })

  const createMutation = useMutation({
    mutationFn: adminBackupApi.create,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-backups'] })
      alert(result.message)
    },
    onError: (err: any) => {
      console.error('[AdminBackupsPage] Create backup error:', err)
      alert(err.response?.data?.detail || 'Failed to create backup')
    },
  })

  const restoreMutation = useMutation({
    mutationFn: adminBackupApi.restore,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-backups'] })
      alert(result.message)
    },
    onError: (err: any) => {
      console.error('[AdminBackupsPage] Restore error:', err)
      alert(err.response?.data?.detail || 'Failed to restore backup')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: adminBackupApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-backups'] })
    },
  })

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.dump')) {
      alert('Please select a .dump file created by the backup system')
      e.target.value = ''
      return
    }
    if (
      confirm(
        'WARNING: Restoring a backup will replace ALL current data with the backup contents.\n\nAre you sure you want to proceed?',
      )
    ) {
      restoreMutation.mutate(file)
    }
    e.target.value = ''
  }

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Database Backups</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create, download, and restore database backups
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium text-sm flex items-center gap-2"
          >
            {createMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating Backup...
              </>
            ) : (
              'Create Backup'
            )}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={restoreMutation.isPending}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors font-medium text-sm flex items-center gap-2"
          >
            {restoreMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Restoring...
              </>
            ) : (
              'Restore from File'
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".dump"
            onChange={handleRestore}
            className="hidden"
          />
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Backups are stored as PostgreSQL custom format (.dump) files. They include all data
            (users, assessments, frameworks, responses). Restoring a backup will replace all
            current data.
          </p>
        </div>

        {/* Backups Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Available Backups</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4">Loading backups...</p>
                    </td>
                  </tr>
                )}
                {backups?.map((backup: BackupInfo) => (
                  <tr key={backup.filename} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-900">{backup.filename}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatBytes(backup.size_bytes)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(backup.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => adminBackupApi.download(backup.filename)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `WARNING: This will replace ALL current data with the contents of ${backup.filename}.\n\nAre you sure?`,
                              )
                            ) {
                              // Convert the backup to a File object for the restore API
                              adminBackupApi
                                .download(backup.filename)
                                .catch(() => alert('Download failed'))
                            }
                          }}
                          className="px-3 py-1 text-sm text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete backup ${backup.filename}?`)) {
                              deleteMutation.mutate(backup.filename)
                            }
                          }}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && backups?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No backups yet. Click "Create Backup" to create your first backup.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </Layout>
  )
}
