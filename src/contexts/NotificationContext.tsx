import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
  target?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (title: string, message: string, type?: NotificationType, target?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((title: string, message: string, type: NotificationType = 'info', target?: string) => {
    const newNotification: Notification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
      target,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Simulate some initial notifications for demonstration
  useEffect(() => {
    // Only add if empty to prevent duplicates on strict mode re-renders
    if (notifications.length === 0) {
        setTimeout(() => {
            addNotification('Low Stock Alert', 'Item "Wireless Mouse M305" is running low (5 remaining).', 'warning', '/stock');
        }, 1000);
        
        setTimeout(() => {
            addNotification('Overdue Payment', 'Invoice #INV-2024-001 is 3 days overdue.', 'error', '/due-ledger');
        }, 3000);

        setTimeout(() => {
            addNotification('Marketing Opportunity', 'Ramadan season is approaching. Create a campaign now!', 'info', '/marketing');
        }, 8000);
    }
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
