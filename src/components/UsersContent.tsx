'use client'

import { useState, useEffect } from 'react'
import { getUsersWithEnrollmentCount, deactivateUser, activateUser, createUser, updateUserProfile, UserProfile } from '@/lib/users'

export default function UsersContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [users, setUsers] = useState<Array<UserProfile & { course_count: number }>>([])
  const [filteredUsers, setFilteredUsers] = useState<Array<UserProfile & { course_count: number }>>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'student' as 'admin' | 'student',
    password: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    let filtered = users.filter(user => 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Removendo filtro de status por enquanto - não temos campo status na tabela
    // if (statusFilter) {
    //   filtered = filtered.filter(user => user.status === statusFilter)
    // }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  async function loadUsers() {
    try {
      const usersData = await getUsersWithEnrollmentCount()
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleUserStatus(userId: string, currentStatus: string) {
    try {
      if (currentStatus === 'active') {
        await deactivateUser(userId)
      } else {
        await activateUser(userId)
      }
      await loadUsers()
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      await createUser(formData)
      await loadUsers()
      setShowModal(false)
      setFormData({
        full_name: '',
        email: '',
        role: 'student',
        password: ''
      })
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Erro ao criar usuário. Verifique se o email não está em uso.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleInputChange(field: string, value: string) {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  function handleEditUser(user: UserProfile) {
    setEditingUser(user)
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      password: ''
    })
    setShowEditModal(true)
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return
    
    setSubmitting(true)
    try {
      await updateUserProfile(editingUser.id, {
        full_name: formData.full_name,
        role: formData.role
      })
      await loadUsers()
      setShowEditModal(false)
      setEditingUser(null)
      setFormData({
        full_name: '',
        email: '',
        role: 'student',
        password: ''
      })
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Erro ao atualizar usuário.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
          <div className="h-32 bg-slate-700 rounded-xl mb-6"></div>
          <div className="h-96 bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white font-semibold font-montserrat">Gestão de Usuários</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium relative z-50 cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        >
          + Novo Usuário
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-xl border-2 border-sky-400/30 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
            />
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white"
          >
            <option value="">Todos os papéis</option>
            <option value="student">Estudante</option>
            <option value="instructor">Instrutor</option>
            <option value="admin">Admin</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-600">
                <th className="text-left p-3 text-white font-semibold">Nome</th>
                <th className="text-left p-3 text-white font-semibold">Email</th>
                <th className="text-left p-3 text-white font-semibold">Papel</th>
                <th className="text-left p-3 text-white font-semibold">Status</th>
                <th className="text-left p-3 text-white font-semibold">Cursos</th>
                <th className="text-left p-3 text-white font-semibold">Último Login</th>
                <th className="text-left p-3 text-white font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-600/30 hover:bg-slate-800/50">
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-slate-900 font-bold text-sm">{user.full_name[0]}</span>
                      </div>
                      <span className="text-white font-medium">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-300 font-medium">{user.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Estudante'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Ativo
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-medium">{user.course_count}</td>
                  <td className="p-3 text-slate-300 font-medium">{new Date(user.updated_at).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-sky-400 hover:text-sky-300 text-sm"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleToggleUserStatus(user.id, 'active')}
                        className="text-amber-400 hover:text-amber-300 text-sm"
                      >
                        Desativar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Novo Usuário</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <input
                type="text"
                placeholder="Nome completo"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
              />
              <input
                type="password"
                placeholder="Senha temporária"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
              />
              <select 
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white"
              >
                <option value="student">Estudante</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="flex-1 bg-slate-600 text-slate-200 py-2 rounded-lg hover:bg-slate-500 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-sky-600 to-sky-700 text-white py-2 rounded-lg hover:from-sky-700 hover:to-sky-800 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Criando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-xl border-2 border-sky-400/30 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Editar Usuário</h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <input
                type="text"
                placeholder="Nome completo"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white placeholder-slate-400"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-700 opacity-60 text-slate-300"
              />
              <select 
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-600 rounded-lg focus:border-sky-400 focus:outline-none bg-slate-800/90 text-white"
              >
                <option value="student">Estudante</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={submitting}
                  className="flex-1 bg-slate-600 text-slate-200 py-2 rounded-lg hover:bg-slate-500 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-sky-600 to-sky-700 text-white py-2 rounded-lg hover:from-sky-700 hover:to-sky-800 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}