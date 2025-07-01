'use client'

import { useState, useEffect } from 'react'
import { getSystemSettings, updateSystemSettings, getNotificationSettings, updateNotificationSettings, getAllIntegrations, updateIntegration, triggerBackup, uploadLogo, SystemSettings, NotificationSettings as NotificationSettingsType, Integration } from '@/lib/settings'
import NotificationSettings from './NotificationSettings'

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState('general')
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsType | null>(null)
  const [integrations, setIntegrations] = useState<Integration[]>([])  // Used in integrations tab
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const [systemData, notificationData, integrationsData] = await Promise.all([
        getSystemSettings(),
        getNotificationSettings(),
        getAllIntegrations()
      ])
      
      setSystemSettings(systemData)
      setNotificationSettings(notificationData)
      setIntegrations(integrationsData)
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveSettings() {
    if (!systemSettings) return
    
    setSaving(true)
    try {
      await updateSystemSettings(systemSettings)
      if (notificationSettings) {
        await updateNotificationSettings(notificationSettings)
      }
      alert('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Erro ao salvar configurações.')
    } finally {
      setSaving(false)
    }
  }

  async function handleBackup() {
    try {
      const result = await triggerBackup()
      if (result.success) {
        alert('Backup iniciado com sucesso!')
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Error triggering backup:', error)
      alert('Erro ao iniciar backup.')
    }
  }

  async function handleLogoUpload(file: File) {
    setUploadingLogo(true)
    try {
      const logoUrl = await uploadLogo(file)
      if (systemSettings) {
        setSystemSettings({...systemSettings, logo_url: logoUrl})
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Erro ao fazer upload do logo.')
    } finally {
      setUploadingLogo(false)
    }
  }

  async function handleToggleIntegration(integration: Integration) {
    try {
      const newStatus = integration.status === 'connected' ? 'disconnected' : 'connected'
      await updateIntegration(integration.id, { status: newStatus })
      setIntegrations(prev => 
        prev.map(int => 
          int.id === integration.id 
            ? { ...int, status: newStatus }
            : int
        )
      )
    } catch (error) {
      console.error('Error toggling integration:', error)
      alert('Erro ao alterar status da integração.')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#1e293b] font-semibold font-montserrat">Configurações do Sistema</h1>
        <button 
          onClick={handleSaveSettings}
          disabled={saving}
          className="relative z-50 cursor-pointer bg-gradient-to-r from-[#334155] to-[#475569] hover:from-[#475569] hover:to-[#334155] text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium disabled:opacity-50"
          style={{ pointerEvents: 'auto' }}
        >
          {saving ? '💾 Salvando...' : '💾 Salvar Alterações'}
        </button>
      </div>

      {/* Tabs */}
      <div className="glass-card p-4 rounded-xl border-2 border-[#FFD700]/30 mb-6">
        <div className="flex flex-wrap space-x-4">
          {[
            { id: 'general', label: 'Geral', icon: '⚙️' },
            { id: 'appearance', label: 'Aparência', icon: '🎨' },
            { id: 'notifications', label: 'Notificações', icon: '🔔' },
            { id: 'certificates', label: 'Certificados', icon: '📜' },
            { id: 'backup', label: 'Backup', icon: '💾' },
            { id: 'integrations', label: 'Integrações', icon: '🔗' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative z-50 cursor-pointer px-4 py-2 rounded-lg transition-colors flex items-center ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-[#1e293b] font-semibold' 
                  : 'text-[#1e293b] font-semibold font-medium hover:bg-[#FFD700]/20'
              }`}
              style={{ pointerEvents: 'auto' }}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-lg font-bold text-[#1e293b] font-semibold mb-4">Configurações Gerais</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#1e293b] font-semibold font-medium mb-2">Nome da Plataforma</label>
                <input
                  type="text"
                  value={systemSettings?.site_name || ''}
                  onChange={(e) => setSystemSettings(prev => prev ? {...prev, site_name: e.target.value} : null)}
                  className="w-full px-4 py-2 border-2 border-[#94a3b8] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                />
              </div>
              <div>
                <label className="block text-[#1e293b] font-semibold font-medium mb-2">Máximo de Alunos por Curso</label>
                <input
                  type="number"
                  value={systemSettings?.max_students_per_course || ''}
                  onChange={(e) => setSystemSettings(prev => prev ? {...prev, max_students_per_course: parseInt(e.target.value)} : null)}
                  className="w-full px-4 py-2 border-2 border-[#94a3b8] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[#1e293b] font-semibold font-medium mb-2">Descrição da Plataforma</label>
              <textarea
                value={systemSettings?.site_description || ''}
                onChange={(e) => setSystemSettings(prev => prev ? {...prev, site_description: e.target.value} : null)}
                rows={3}
                className="w-full px-4 py-2 border-2 border-[#94a3b8] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                <div>
                  <h4 className="text-[#1e293b] font-semibold font-medium">Permitir Auto-registro</h4>
                  <p className="text-[#1e293b] font-semibold font-medium text-sm">Permitir que novos usuários se cadastrem automaticamente</p>
                </div>
                <button
                  onClick={() => setSystemSettings(prev => prev ? {...prev, allow_registration: !prev.allow_registration} : null)}
                  className={`relative z-50 cursor-pointer w-12 h-6 rounded-full transition-colors ${
                    systemSettings?.allow_registration ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    systemSettings?.allow_registration ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                <div>
                  <h4 className="text-[#1e293b] font-semibold font-medium">Modo de Manutenção</h4>
                  <p className="text-[#1e293b] font-semibold font-medium text-sm">Desabilitar acesso temporariamente</p>
                </div>
                <button
                  onClick={() => setSystemSettings(prev => prev ? {...prev, maintenance_mode: !prev.maintenance_mode} : null)}
                  className={`relative z-50 cursor-pointer w-12 h-6 rounded-full transition-colors ${
                    systemSettings?.maintenance_mode ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    systemSettings?.maintenance_mode ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appearance Settings */}
      {activeTab === 'appearance' && (
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-lg font-bold text-[#1e293b] font-semibold mb-4">Personalização Visual</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#1e293b] font-semibold font-medium mb-2">Cor Primária</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={systemSettings?.primary_color || '#654321'}
                    onChange={(e) => setSystemSettings(prev => prev ? {...prev, primary_color: e.target.value} : null)}
                    className="w-12 h-10 border-2 border-[#94a3b8] rounded-lg"
                  />
                  <input
                    type="text"
                    value={systemSettings?.primary_color || '#654321'}
                    onChange={(e) => setSystemSettings(prev => prev ? {...prev, primary_color: e.target.value} : null)}
                    className="flex-1 px-4 py-2 border-2 border-[#94a3b8] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#1e293b] font-semibold font-medium mb-2">Cor Secundária</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={systemSettings?.secondary_color || '#FFD700'}
                    onChange={(e) => setSystemSettings(prev => prev ? {...prev, secondary_color: e.target.value} : null)}
                    className="w-12 h-10 border-2 border-[#94a3b8] rounded-lg"
                  />
                  <input
                    type="text"
                    value={systemSettings?.secondary_color || '#FFD700'}
                    onChange={(e) => setSystemSettings(prev => prev ? {...prev, secondary_color: e.target.value} : null)}
                    className="flex-1 px-4 py-2 border-2 border-[#94a3b8] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[#1e293b] font-semibold font-medium mb-2">Upload de Logo</label>
              <div className="border-2 border-dashed border-[#94a3b8] rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleLogoUpload(file)
                  }}
                />
                <label htmlFor="logo-upload" className="cursor-pointer block">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg mx-auto mb-3 flex items-center justify-center">
                    {uploadingLogo ? (
                      <span className="text-[#1e293b] animate-spin">⏳</span>
                    ) : (
                      <span className="text-[#1e293b] font-semibold font-bold text-xl">S</span>
                    )}
                  </div>
                  <p className="text-[#1e293b] font-semibold font-medium mb-2">
                    {uploadingLogo ? 'Fazendo upload...' : 'Clique para fazer upload ou arraste aqui'}
                  </p>
                  <p className="text-[#1e293b] font-semibold font-medium text-sm">PNG, JPG até 2MB</p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[#1e293b] font-semibold font-medium mb-2">Fonte Principal</label>
              <select className="w-full px-4 py-2 border-2 border-[#94a3b8] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90">
                <option>Poppins (Atual)</option>
                <option>Montserrat</option>
                <option>Roboto</option>
                <option>Open Sans</option>
                <option>Lato</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <NotificationSettings />
      )}

      {/* Certificates Settings */}
      {activeTab === 'certificates' && (
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-lg font-bold text-[#1e293b] font-semibold mb-4">Configurações de Certificados</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-[#1e293b] font-semibold font-medium mb-2">Template de Certificado</label>
              <select 
                value={systemSettings?.certificate_template || 'modern'}
                onChange={(e) => setSystemSettings(prev => prev ? {...prev, certificate_template: e.target.value as 'modern' | 'classic' | 'elegant' | 'minimal'} : null)}
                className="w-full px-4 py-2 border-2 border-[#94a3b8] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
              >
                <option value="modern">Moderno</option>
                <option value="classic">Clássico</option>
                <option value="elegant">Elegante</option>
                <option value="minimal">Minimalista</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#1e293b] font-semibold font-medium mb-2">Assinatura Digital (Diretor)</label>
                <input
                  type="text"
                  placeholder="Nome do diretor"
                  value={systemSettings?.director_name || ''}
                  onChange={(e) => setSystemSettings(prev => prev ? {...prev, director_name: e.target.value} : null)}
                  className="w-full px-4 py-2 border-2 border-[#94a3b8] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                />
              </div>
              <div>
                <label className="block text-[#1e293b] font-semibold font-medium mb-2">Cargo do Signatário</label>
                <input
                  type="text"
                  placeholder="Ex: Diretor Acadêmico"
                  className="w-full px-4 py-2 border-2 border-[#94a3b8] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#1e293b] font-semibold font-medium mb-2">Texto do Certificado</label>
              <textarea
                placeholder="Certificamos que [NOME] concluiu com sucesso o curso [CURSO]..."
                rows={4}
                className="w-full px-4 py-2 border-2 border-[#94a3b8] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
              />
            </div>

            <div className="p-4 bg-white/50 rounded-lg">
              <h4 className="text-[#1e293b] font-semibold font-medium mb-2">Preview do Certificado</h4>
              <div className="border-2 border-[#FFD700] rounded-lg p-6 bg-gradient-to-br from-white to-[#FFD700]/10">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-[#1e293b] font-semibold mb-2">CERTIFICADO DE CONCLUSÃO</h3>
                  <p className="text-[#1e293b] font-semibold font-medium mb-4">Certificamos que <strong>João Silva</strong> concluiu com sucesso</p>
                  <p className="text-lg font-bold text-[#1e293b] font-semibold mb-4">JavaScript Fundamentals</p>
                  <p className="text-[#1e293b] font-semibold font-medium text-sm">Data: 15/01/2024 | Carga Horária: 40h</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Settings */}
      {activeTab === 'backup' && (
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-lg font-bold text-[#1e293b] font-semibold mb-4">Backup e Manutenção</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-[#1e293b] font-semibold font-medium mb-2">Frequência de Backup</label>
              <select 
                value={systemSettings?.backup_frequency || 'daily'}
                onChange={(e) => setSystemSettings(prev => prev ? {...prev, backup_frequency: e.target.value as 'daily' | 'weekly' | 'monthly'} : null)}
                className="w-full px-4 py-2 border-2 border-[#94a3b8] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/50 rounded-lg">
                <h4 className="text-[#1e293b] font-semibold font-medium mb-2">Último Backup</h4>
                <p className="text-[#1e293b] font-semibold font-medium text-sm">15/01/2024 às 03:00</p>
                <p className="text-green-600 text-xs">✓ Sucesso</p>
              </div>
              <div className="p-4 bg-white/50 rounded-lg">
                <h4 className="text-[#1e293b] font-semibold font-medium mb-2">Tamanho do Backup</h4>
                <p className="text-[#1e293b] font-semibold font-medium text-sm">2.3 GB</p>
                <p className="text-blue-600 text-xs">📁 Armazenado na nuvem</p>
              </div>
              <div className="p-4 bg-white/50 rounded-lg">
                <h4 className="text-[#1e293b] font-semibold font-medium mb-2">Próximo Backup</h4>
                <p className="text-[#1e293b] font-semibold font-medium text-sm">16/01/2024 às 03:00</p>
                <p className="text-orange-600 text-xs">⏰ Agendado</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button 
                onClick={handleBackup}
                className="relative z-50 cursor-pointer bg-gradient-to-r from-[#8B4513] to-[#654321] text-white px-6 py-2 rounded-lg hover:from-[#654321] hover:to-[#8B4513] transition-all"
                style={{ pointerEvents: 'auto' }}
              >
                🔄 Backup Manual
              </button>
              <button className="relative z-50 cursor-pointer border-2 border-[#94a3b8] text-[#1e293b] font-semibold font-medium px-6 py-2 rounded-lg hover:bg-[#FFD700]/20 transition-colors" style={{ pointerEvents: 'auto' }}>
                📥 Restaurar Backup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Settings */}
      {activeTab === 'integrations' && (
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-lg font-bold text-[#1e293b] font-semibold mb-4">Integrações</h3>
          <div className="space-y-4">
            {integrations.length > 0 ? integrations.map((integration, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 ${
                    integration.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <h4 className="text-[#1e293b] font-semibold font-medium">{integration.name}</h4>
                    <p className="text-[#1e293b] font-semibold font-medium text-sm">{integration.description}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggleIntegration(integration)}
                  className={`relative z-50 cursor-pointer px-4 py-2 rounded-lg text-sm transition-colors ${
                    integration.status === 'connected' 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  {integration.status === 'connected' ? 'Desconectar' : 'Conectar'}
                </button>
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-[#1e293b] font-medium">Nenhuma integração configurada</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}