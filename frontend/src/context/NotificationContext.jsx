import { createContext, useContext, useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  dismissNotification: () => {},
  clearAll: () => {},
  addNotification: () => {},
});

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => notificationService.getAll());

  // Derive unread count dynamically
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    const updated = notificationService.markAsRead(id);
    setNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notificationService.markAllAsRead();
    setNotifications(updated);
  };

  const dismissNotification = (id) => {
    const updated = notificationService.dismiss(id);
    setNotifications(updated);
  };

  const clearAll = () => {
    const updated = notificationService.clearAll();
    setNotifications(updated);
  };

  const addNotification = (item) => {
    const updated = notificationService.add(item);
    setNotifications(updated);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        clearAll,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}

