'use client'

import { useState } from 'react'

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    siteName: 'SwiftEDU',
    siteDescription: 'Plataforma de ensino online premium',
    allowRegistration: false,
    emailNotifications: true,
    maintenanceMode: false,
    backupFrequency: 'daily',
    maxStudentsPerCourse: 100,
    certificateTemplate: 'modern',
    primaryColor: '#654321',
    secondaryColor: '#FFD700',
  })

  const handleSettingChange = (key: string, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#2C1A0E] font-semibold font-montserrat">Configurações do Sistema</h1>
        <button className="bg-gradient-to-r from-[#8B4513] to-[#654321] hover:from-[#654321] hover:to-[#8B4513] text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium">
          💾 Salvar Alterações
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
              className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-[#2C1A0E] font-semibold' 
                  : 'text-[#2C1A0E] font-semibold font-medium hover:bg-[#FFD700]/20'
              }`}
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
          <h3 className="text-lg font-bold text-[#2C1A0E] font-semibold mb-4">Configurações Gerais</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#2C1A0E] font-semibold font-medium mb-2">Nome da Plataforma</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                />
              </div>
              <div>
                <label className="block text-[#2C1A0E] font-semibold font-medium mb-2">Máximo de Alunos por Curso</label>
                <input
                  type="number"
                  value={settings.maxStudentsPerCourse}
                  onChange={(e) => handleSettingChange('maxStudentsPerCourse', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[#2C1A0E] font-semibold font-medium mb-2">Descrição da Plataforma</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                <div>
                  <h4 className="text-[#2C1A0E] font-semibold font-medium">Permitir Auto-registro</h4>
                  <p className="text-[#2C1A0E] font-semibold font-medium text-sm">Permitir que novos usuários se cadastrem automaticamente</p>
                </div>
                <button
                  onClick={() => handleSettingChange('allowRegistration', !settings.allowRegistration)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.allowRegistration ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.allowRegistration ? 'translate-x-6' : 'translate-x-1'
                  }`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                <div>
                  <h4 className="text-[#2C1A0E] font-semibold font-medium">Modo de Manutenção</h4>
                  <p className="text-[#2C1A0E] font-semibold font-medium text-sm">Desabilitar acesso temporariamente</p>
                </div>
                <button
                  onClick={() => handleSettingChange('maintenanceMode', !settings.maintenanceMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
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
          <h3 className="text-lg font-bold text-[#2C1A0E] font-semibold mb-4">Personalização Visual</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#2C1A0E] font-semibold font-medium mb-2">Cor Primária</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                    className="w-12 h-10 border-2 border-[#D2B48C] rounded-lg"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#2C1A0E] font-semibold font-medium mb-2">Cor Secundária</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 border-2 border-[#D2B48C] rounded-lg"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[#2C1A0E] font-semibold font-medium mb-2">Upload de Logo</label>
              <div className="border-2 border-dashed border-[#D2B48C] rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <span className="text-[#2C1A0E] font-semibold font-bold text-xl">S</span>
                </div>
                <p className="text-[#2C1A0E] font-semibold font-medium mb-2">Clique para fazer upload ou arraste aqui</p>
                <p className="text-[#2C1A0E] font-semibold font-medium text-sm">PNG, JPG até 2MB</p>
              </div>
            </div>

            <div>
              <label className="block text-[#2C1A0E] font-semibold font-medium mb-2">Fonte Principal</label>
              <select className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90">
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
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-lg font-bold text-[#2C1A0E] font-semibold mb-4">Configurações de Notificações</h3>
          <div className="space-y-4">
            {[
              { key: 'newStudent', label: 'Novo aluno cadastrado', description: 'Notificar quando um novo aluno se cadastrar' },
              { key: 'courseCompletion', label: 'Conclusão de curso', description: 'Notificar quando um aluno concluir um curso' },
              { key: 'assessmentSubmission', label: 'Nova avaliação', description: 'Notificar sobre novas submissões de avaliação' },
              { key: 'systemUpdates', label: 'Atualizações do sistema', description: 'Notificar sobre atualizações e manutenções' },
              { key: 'weeklyReports', label: 'Relatórios semanais', description: 'Enviar relatórios de desempenho semanalmente' },
            ].map((notification) => (
              <div key={notification.key} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                <div>
                  <h4 className="text-[#2C1A0E] font-semibold font-medium">{notification.label}</h4>
                  <p className="text-[#2C1A0E] font-semibold font-medium text-sm">{notification.description}</p>
                </div>
                <button className="w-12 h-6 bg-green-500 rounded-full">
                  <div className="w-5 h-5 bg-white rounded-full translate-x-6"></div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certificates Settings */}
      {activeTab === 'certificates' && (
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-lg font-bold text-[#2C1A0E] font-semibold mb-4">Configurações de Certificados</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-[#2C1A0E] font-semibold font-medium mb-2">Template de Certificado</label>
              <select 
                value={settings.certificateTemplate}
                onChange={(e) => handleSettingChange('certificateTemplate', e.target.value)}
                className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
              >
                <option value="modern">Moderno</option>
                <option value="classic">Clássico</option>
                <option value="elegant">Elegante</option>
                <option value="minimal">Minimalista</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#2C1A0E] font-semibold font-medium mb-2">Assinatura Digital (Diretor)</label>
                <input
                  type="text"
                  placeholder="Nome do diretor"
                  className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                />
              </div>
              <div>
                <label className="block text-[#2C1A0E] font-semibold font-medium mb-2">Cargo do Signatário</label>
                <input
                  type="text"
                  placeholder="Ex: Diretor Acadêmico"
                  className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#2C1A0E] font-semibold font-medium mb-2">Texto do Certificado</label>
              <textarea
                placeholder="Certificamos que [NOME] concluiu com sucesso o curso [CURSO]..."
                rows={4}
                className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
              />
            </div>

            <div className="p-4 bg-white/50 rounded-lg">
              <h4 className="text-[#2C1A0E] font-semibold font-medium mb-2">Preview do Certificado</h4>
              <div className="border-2 border-[#FFD700] rounded-lg p-6 bg-gradient-to-br from-white to-[#FFD700]/10">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-[#2C1A0E] font-semibold mb-2">CERTIFICADO DE CONCLUSÃO</h3>
                  <p className="text-[#2C1A0E] font-semibold font-medium mb-4">Certificamos que <strong>João Silva</strong> concluiu com sucesso</p>
                  <p className="text-lg font-bold text-[#2C1A0E] font-semibold mb-4">JavaScript Fundamentals</p>
                  <p className="text-[#2C1A0E] font-semibold font-medium text-sm">Data: 15/01/2024 | Carga Horária: 40h</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Settings */}
      {activeTab === 'backup' && (
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-lg font-bold text-[#2C1A0E] font-semibold mb-4">Backup e Manutenção</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-[#2C1A0E] font-semibold font-medium mb-2">Frequência de Backup</label>
              <select 
                value={settings.backupFrequency}
                onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                className="w-full px-4 py-2 border-2 border-[#D2B48C] rounded-lg focus:border-[#FFD700] focus:outline-none bg-white/90"
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/50 rounded-lg">
                <h4 className="text-[#2C1A0E] font-semibold font-medium mb-2">Último Backup</h4>
                <p className="text-[#2C1A0E] font-semibold font-medium text-sm">15/01/2024 às 03:00</p>
                <p className="text-green-600 text-xs">✓ Sucesso</p>
              </div>
              <div className="p-4 bg-white/50 rounded-lg">
                <h4 className="text-[#2C1A0E] font-semibold font-medium mb-2">Tamanho do Backup</h4>
                <p className="text-[#2C1A0E] font-semibold font-medium text-sm">2.3 GB</p>
                <p className="text-blue-600 text-xs">📁 Armazenado na nuvem</p>
              </div>
              <div className="p-4 bg-white/50 rounded-lg">
                <h4 className="text-[#2C1A0E] font-semibold font-medium mb-2">Próximo Backup</h4>
                <p className="text-[#2C1A0E] font-semibold font-medium text-sm">16/01/2024 às 03:00</p>
                <p className="text-orange-600 text-xs">⏰ Agendado</p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button className="bg-gradient-to-r from-[#8B4513] to-[#654321] text-white px-6 py-2 rounded-lg hover:from-[#654321] hover:to-[#8B4513] transition-all">
                🔄 Backup Manual
              </button>
              <button className="border-2 border-[#D2B48C] text-[#2C1A0E] font-semibold font-medium px-6 py-2 rounded-lg hover:bg-[#FFD700]/20 transition-colors">
                📥 Restaurar Backup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Settings */}
      {activeTab === 'integrations' && (
        <div className="glass-card p-6 rounded-xl border-2 border-[#FFD700]/30">
          <h3 className="text-lg font-bold text-[#2C1A0E] font-semibold mb-4">Integrações</h3>
          <div className="space-y-4">
            {[
              { name: 'Google Analytics', status: 'connected', description: 'Análise de tráfego e comportamento' },
              { name: 'SendGrid', status: 'connected', description: 'Envio de emails transacionais' },
              { name: 'Stripe', status: 'disconnected', description: 'Processamento de pagamentos' },
              { name: 'Zoom', status: 'disconnected', description: 'Aulas ao vivo e webinars' },
              { name: 'Slack', status: 'connected', description: 'Notificações em tempo real' },
            ].map((integration, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 ${
                    integration.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <h4 className="text-[#2C1A0E] font-semibold font-medium">{integration.name}</h4>
                    <p className="text-[#2C1A0E] font-semibold font-medium text-sm">{integration.description}</p>
                  </div>
                </div>
                <button className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  integration.status === 'connected' 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}>
                  {integration.status === 'connected' ? 'Desconectar' : 'Conectar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}