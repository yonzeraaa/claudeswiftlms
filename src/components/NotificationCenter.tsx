'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Settings } from 'lucide-react';
import { notificationService, type Notification } from '@/lib/notifications';
import { useAuth } from '@/hooks/useAuth';

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    loadNotifications();
    loadUnreadCount();

    const unsubscribe = notificationService.subscribeToNotifications(
      user.id,
      (newNotification) => {
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(newNotification.title, {
            body: newNotification.message,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
          });
        }
      }
    );

    return unsubscribe;
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      const data = await notificationService.getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    if (!user?.id) return;
    
    try {
      const count = await notificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'success': return <Check className={`${iconClass} text-green-600`} />;
      case 'warning': return <Bell className={`${iconClass} text-yellow-600`} />;
      case 'error': return <X className={`${iconClass} text-red-600`} />;
      case 'assignment': return <Bell className={`${iconClass} text-blue-600`} />;
      case 'message': return <Bell className={`${iconClass} text-purple-600`} />;
      case 'system': return <Settings className={`${iconClass} text-gray-600`} />;
      default: return <Bell className={`${iconClass} text-blue-600`} />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-blue-500';
    }
  };

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || (filter === 'unread' && !n.read)
  );

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200"
        style={{ pointerEvents: 'auto' }}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 w-96 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl z-[9999]">
            <div className="p-4 border-b border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-slate-700">
                  Notificações
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={requestNotificationPermission}
                    className="p-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                    title="Permitir notificações"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filter === 'all'
                      ? 'bg-amber-200 text-amber-900'
                      : 'text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  Todas ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filter === 'unread'
                      ? 'bg-amber-200 text-amber-900'
                      : 'text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  Não lidas ({unreadCount})
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="flex items-center gap-2 text-sm text-amber-700 hover:text-amber-900 hover:bg-amber-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4" />
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-6 text-center text-amber-600">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>
                    {filter === 'unread'
                      ? 'Nenhuma notificação não lida'
                      : 'Nenhuma notificação'}
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`relative p-3 mb-2 rounded-lg border-l-4 ${getPriorityColor(
                        notification.priority
                      )} ${
                        notification.read
                          ? 'bg-gray-50/50'
                          : 'bg-amber-50/50 border border-amber-200'
                      } hover:bg-amber-100/50 transition-colors group`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`text-sm font-medium ${
                              notification.read ? 'text-gray-700' : 'text-amber-900'
                            }`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                          </div>
                          
                          <p className={`text-sm mt-1 ${
                            notification.read ? 'text-gray-600' : 'text-amber-800'
                          }`}>
                            {notification.message}
                          </p>

                          {notification.action_url && (
                            <a
                              href={notification.action_url}
                              className="inline-block text-xs text-amber-700 hover:text-amber-900 mt-2 underline"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Ver detalhes →
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                            title="Marcar como lida"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}