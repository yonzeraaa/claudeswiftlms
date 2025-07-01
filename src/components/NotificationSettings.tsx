'use client';

import { useState, useEffect } from 'react';
import { Settings, Bell, Mail, BookOpen, AlertTriangle, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface NotificationPreferences {
  id?: string;
  user_id: string;
  email_assignments: boolean;
  email_grades: boolean;
  email_messages: boolean;
  email_system: boolean;
  push_assignments: boolean;
  push_grades: boolean;
  push_messages: boolean;
  push_system: boolean;
  daily_digest: boolean;
  weekly_summary: boolean;
  marketing_emails: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  timezone: string;
  created_at?: string;
  updated_at?: string;
}

export default function NotificationSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    user_id: user?.id || '',
    email_assignments: true,
    email_grades: true,
    email_messages: true,
    email_system: true,
    push_assignments: true,
    push_grades: true,
    push_messages: true,
    push_system: false,
    daily_digest: false,
    weekly_summary: true,
    marketing_emails: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    timezone: 'America/Sao_Paulo',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadPreferences();
    }
  }, [user?.id]);

  const loadPreferences = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences(data);
      } else {
        setPreferences(prev => ({ ...prev, user_id: user.id }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          ...preferences,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      setMessage('Preferências salvas com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage('Erro ao salvar preferências');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setMessage('Permissão concedida! Você receberá notificações push.');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white/95 backdrop-blur-xl rounded-xl border border-amber-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-amber-600" />
        <h2 className="text-2xl font-bold text-amber-900">Configurações de Notificação</h2>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.includes('sucesso') 
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-8">
        {/* Email Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-900">Notificações por Email</h3>
          </div>
          
          <div className="space-y-4 ml-7">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.email_assignments}
                onChange={(e) => handleChange('email_assignments', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <div>
                <span className="text-amber-900 font-medium">Atividades e Prazos</span>
                <p className="text-sm text-amber-700">Receber lembretes de atividades pendentes</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.email_grades}
                onChange={(e) => handleChange('email_grades', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <div>
                <span className="text-amber-900 font-medium">Notas e Feedback</span>
                <p className="text-sm text-amber-700">Ser notificado quando novas notas forem publicadas</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.email_messages}
                onChange={(e) => handleChange('email_messages', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <div>
                <span className="text-amber-900 font-medium">Mensagens</span>
                <p className="text-sm text-amber-700">Receber notificações de novas mensagens</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.email_system}
                onChange={(e) => handleChange('email_system', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <div>
                <span className="text-amber-900 font-medium">Avisos do Sistema</span>
                <p className="text-sm text-amber-700">Receber comunicados importantes da plataforma</p>
              </div>
            </label>
          </div>
        </div>

        {/* Push Notifications */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-900">Notificações Push</h3>
            {'Notification' in window && Notification.permission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                className="ml-auto text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full hover:bg-amber-200 transition-colors"
              >
                Permitir
              </button>
            )}
          </div>
          
          <div className="space-y-4 ml-7">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.push_assignments}
                onChange={(e) => handleChange('push_assignments', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <div>
                <span className="text-amber-900 font-medium">Atividades e Prazos</span>
                <p className="text-sm text-amber-700">Notificações instantâneas no navegador</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.push_grades}
                onChange={(e) => handleChange('push_grades', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <div>
                <span className="text-amber-900 font-medium">Notas e Feedback</span>
                <p className="text-sm text-amber-700">Ser notificado imediatamente sobre novas notas</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.push_messages}
                onChange={(e) => handleChange('push_messages', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <div>
                <span className="text-amber-900 font-medium">Mensagens</span>
                <p className="text-sm text-amber-700">Notificações instantâneas de mensagens</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.push_system}
                onChange={(e) => handleChange('push_system', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <div>
                <span className="text-amber-900 font-medium">Avisos do Sistema</span>
                <p className="text-sm text-amber-700">Comunicados importantes da plataforma</p>
              </div>
            </label>
          </div>
        </div>

        {/* Digest Settings */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-900">Resumos Periódicos</h3>
          </div>
          
          <div className="space-y-4 ml-7">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.daily_digest}
                onChange={(e) => handleChange('daily_digest', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <div>
                <span className="text-amber-900 font-medium">Resumo Diário</span>
                <p className="text-sm text-amber-700">Receber um resumo das atividades do dia</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.weekly_summary}
                onChange={(e) => handleChange('weekly_summary', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <div>
                <span className="text-amber-900 font-medium">Resumo Semanal</span>
                <p className="text-sm text-amber-700">Receber um resumo semanal do seu progresso</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={preferences.marketing_emails}
                onChange={(e) => handleChange('marketing_emails', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <div>
                <span className="text-amber-900 font-medium">Emails Promocionais</span>
                <p className="text-sm text-amber-700">Receber novidades e ofertas especiais</p>
              </div>
            </label>
          </div>
        </div>

        {/* Quiet Hours */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-amber-900">Horário Silencioso</h3>
          </div>
          
          <div className="ml-7">
            <p className="text-sm text-amber-700 mb-4">
              Durante este período, você não receberá notificações push (apenas emergências)
            </p>
            
            <div className="flex gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">Início</label>
                <input
                  type="time"
                  value={preferences.quiet_hours_start || '22:00'}
                  onChange={(e) => handleChange('quiet_hours_start', e.target.value)}
                  className="border border-amber-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">Fim</label>
                <input
                  type="time"
                  value={preferences.quiet_hours_end || '08:00'}
                  onChange={(e) => handleChange('quiet_hours_end', e.target.value)}
                  className="border border-amber-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8 pt-6 border-t border-amber-200">
        <button
          onClick={savePreferences}
          disabled={saving}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ pointerEvents: 'auto' }}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar Preferências'}
        </button>
      </div>
    </div>
  );
}