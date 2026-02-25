import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi, organizationApi } from '@/services/api'
import { Layout } from '@/components/Layout'
import { UserRole } from '@/types'
import type { User, UserCreate, UserAdminUpdate, Organization } from '@/types'

export function AdminPage() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')

  // Form state for create/edit
  const [formData, setFormData] = useState<{
    email: string
    full_name: string
    password: string
    role: UserRole
    organization_id: string
    is_active: boolean
  }>({
    email: '',
    full_name: '',
    password: '',
    role: UserRole.ASSESSOR,
    organization_id: '',
    is_active: true,
  })

  console.log('[AdminPage] Rendering, search:', search)

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => adminApi.listUsers(0, 100, search || undefined),
  })

  // Fetch organizations for the dropdown
  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationApi.list,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: UserCreate) => adminApi.createUser(data),
    onSuccess: () => {
      console.log('[AdminPage] User created successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      closeCreateModal()
    },
    onError: (err: any) => {
      console.error('[AdminPage] Create user error:', err.response?.data)
      alert(err.response?.data?.detail || 'Failed to create user')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserAdminUpdate }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      console.log('[AdminPage] User updated successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setEditingUser(null)
    },
    onError: (err: any) => {
      console.error('[AdminPage] Update user error:', err.response?.data)
      alert(err.response?.data?.detail || 'Failed to update user')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      console.log('[AdminPage] User deactivated successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      adminApi.resetPassword(id, password),
    onSuccess: () => {
      console.log('[AdminPage] Password reset successfully')
      setResetPasswordUser(null)
      setNewPassword('')
      alert('Password reset successfully')
    },
    onError: (err: any) => {
      console.error('[AdminPage] Reset password error:', err.response?.data)
      alert(err.response?.data?.detail || 'Failed to reset password')
    },
  })

  const closeCreateModal = () => {
    setShowCreateModal(false)
    setFormData({
      email: '',
      full_name: '',
      password: '',
      role: UserRole.ASSESSOR,
      organization_id: '',
      is_active: true,
    })
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      full_name: user.full_name,
      password: '',
      role: user.role,
      organization_id: user.organization_id || '',
      is_active: user.is_active,
    })
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[AdminPage] Creating user with data:', formData)
    createMutation.mutate({
      email: formData.email,
      full_name: formData.full_name,
      password: formData.password,
      role: formData.role,
      organization_id: formData.organization_id || undefined,
    })
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    console.log('[AdminPage] Updating user:', editingUser.id)
    const data: UserAdminUpdate = {
      full_name: formData.full_name,
      email: formData.email,
      role: formData.role,
      is_active: formData.is_active,
      organization_id: formData.organization_id || undefined,
    }
    updateMutation.mutate({ id: editingUser.id, data })
  }

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
      [UserRole.ASSESSOR]: 'bg-blue-100 text-blue-800',
      [UserRole.VIEWER]: 'bg-gray-100 text-gray-800',
    }
    return styles[role] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage users, roles, and system configuration
          </p>
        </div>
        {/* User Management Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                + Add User
              </button>
            </div>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
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
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4">Loading users...</p>
                    </td>
                  </tr>
                )}
                {usersData?.users.map((u: User) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{u.full_name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadge(u.role)}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          u.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setResetPasswordUser(u)}
                          className="px-3 py-1 text-sm text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                        >
                          Reset PW
                        </button>
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => {
                              if (confirm(`Deactivate user ${u.email}?`)) {
                                deleteMutation.mutate(u.id)
                              }
                            }}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && usersData?.users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {usersData && (
            <div className="px-6 py-3 border-t border-gray-200 text-sm text-gray-500">
              Showing {usersData.users.length} of {usersData.total} users
            </div>
          )}
        </div>
      </main>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create User</h3>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={e => setFormData(d => ({ ...d, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={e => setFormData(d => ({ ...d, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData(d => ({ ...d, role: e.target.value as UserRole }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={UserRole.ASSESSOR}>Assessor</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                  <option value={UserRole.VIEWER}>Viewer</option>
                </select>
              </div>
              {organizations && organizations.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization
                  </label>
                  <select
                    value={formData.organization_id}
                    onChange={e =>
                      setFormData(d => ({ ...d, organization_id: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">None</option>
                    {organizations.map((org: Organization) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
            </div>
            <form onSubmit={handleUpdate} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={e => setFormData(d => ({ ...d, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData(d => ({ ...d, role: e.target.value as UserRole }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={UserRole.ASSESSOR}>Assessor</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                  <option value={UserRole.VIEWER}>Viewer</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={e => setFormData(d => ({ ...d, is_active: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Reset Password for {resetPasswordUser.full_name}
              </h3>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault()
                resetPasswordMutation.mutate({
                  id: resetPasswordUser.id,
                  password: newPassword,
                })
              }}
              className="px-6 py-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setResetPasswordUser(null)
                    setNewPassword('')
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
