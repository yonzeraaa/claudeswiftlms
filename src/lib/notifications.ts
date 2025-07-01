import { supabase } from './supabase';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'assignment' | 'message' | 'system';
  read: boolean;
  action_url?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  expires_at?: string;
}

export interface NotificationSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  created_at: string;
}

export const notificationService = {
  async getNotifications(userId: string, unreadOnly = false) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Notification[];
  },

  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  },

  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async sendNotificationToUser(
    userId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info',
    actionUrl?: string,
    metadata?: Record<string, unknown>
  ) {
    return this.createNotification({
      user_id: userId,
      title,
      message,
      type,
      read: false,
      action_url: actionUrl,
      metadata,
    });
  },

  async sendBulkNotifications(
    userIds: string[],
    title: string,
    message: string,
    type: Notification['type'] = 'info'
  ) {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type,
      read: false,
    }));

    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (error) throw error;
    return data as Notification[];
  },

  async registerPushSubscription(userId: string, subscription: PushSubscription) {
    const keys = subscription.getKey ? {
      p256dh: subscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : '',
      auth: subscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : '',
    } : { p256dh: '', auth: '' };

    const { data, error } = await supabase
      .from('notification_subscriptions')
      .insert({
        user_id: userId,
        endpoint: subscription.endpoint,
        keys,
      })
      .select()
      .single();

    if (error) throw error;
    return data as NotificationSubscription;
  },

  async sendPushNotification(userId: string, title: string, body: string, actionUrl?: string) {
    try {
      const { data: subscriptions } = await supabase
        .from('notification_subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (!subscriptions?.length) return;

      for (const subscription of subscriptions) {
        try {
          await fetch('/api/push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription: {
                endpoint: subscription.endpoint,
                keys: subscription.keys,
              },
              payload: {
                title,
                body,
                url: actionUrl,
                icon: '/icon-192x192.png',
                badge: '/badge-72x72.png',
              },
            }),
          });
        } catch (error) {
          console.error('Failed to send push notification:', error);
        }
      }
    } catch (error) {
      console.error('Error sending push notifications:', error);
    }
  },
};

export const notificationTemplates = {
  courseAssigned: (courseName: string) => ({
    title: 'Novo Curso Atribuído',
    message: `Você foi inscrito no curso: ${courseName}`,
    type: 'info' as const,
  }),

  assignmentDue: (assignmentName: string, dueDate: string) => ({
    title: 'Prazo de Atividade',
    message: `A atividade "${assignmentName}" vence em ${dueDate}`,
    type: 'warning' as const,
  }),

  gradePosted: (courseName: string, grade: string) => ({
    title: 'Nova Nota Disponível',
    message: `Sua nota em ${courseName}: ${grade}`,
    type: 'success' as const,
  }),

  messageReceived: (senderName: string) => ({
    title: 'Nova Mensagem',
    message: `Você recebeu uma mensagem de ${senderName}`,
    type: 'message' as const,
  }),

  systemMaintenance: (maintenanceDate: string) => ({
    title: 'Manutenção Programada',
    message: `Sistema em manutenção em ${maintenanceDate}`,
    type: 'system' as const,
  }),
};