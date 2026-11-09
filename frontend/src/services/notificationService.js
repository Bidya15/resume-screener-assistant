/**
 * Notification Service
 * Manages in-app notifications with persistent storage and reactive updates.
 *
 * BACKEND INTEGRATION NOTE:
 * When backend notification endpoints become available, replace the local persistence
 * calls below with:
 * - GET    /api/notifications
 * - PATCH  /api/notifications/:id/read
 * - POST   /api/notifications/read-all
 * - DELETE /api/notifications/:id
 * - DELETE /api/notifications
 */

const STORAGE_KEY = 'synthweb_notifications';

// Initial seed notifications representing real recruitment workflow events
const SEED_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'AI Analysis Completed',
    message: 'Analysis report for Sarah Jenkins is ready. Match score: 92% (Strong Match).',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    read: false,
    type: 'success',
    link: '/analysis/1',
  },
  {
    id: 'notif-2',
    title: 'Candidate Screening Alert',
    message: 'Urban Company BDA role evaluation completed. Match score: 19% (Weak Match).',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
    read: false,
    type: 'warning',
    link: '/analysis/history',
  },
  {
    id: 'notif-3',
    title: 'Groq LLM Engine Online',
    message: 'Connected to Groq AI inference engine (openai/gpt-oss-120b) with 100% health.',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
    read: true,
    type: 'info',
    link: '/settings',
  },
];

export const notificationService = {
  getAll() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_NOTIFICATIONS));
        return SEED_NOTIFICATIONS;
      }
      return JSON.parse(stored);
    } catch {
      return SEED_NOTIFICATIONS;
    }
  },

  saveAll(notifications) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (err) {
      console.error('Failed to persist notifications', err);
    }
  },

  markAsRead(id) {
    const list = this.getAll();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.saveAll(updated);
    return updated;
  },

  markAllAsRead() {
    const list = this.getAll();
    const updated = list.map((n) => ({ ...n, read: true }));
    this.saveAll(updated);
    return updated;
  },

  dismiss(id) {
    const list = this.getAll();
    const updated = list.filter((n) => n.id !== id);
    this.saveAll(updated);
    return updated;
  },

  clearAll() {
    this.saveAll([]);
    return [];
  },

  add({ title, message, type = 'info', link = null }) {
    const list = this.getAll();
    const newNotif = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type,
      link,
    };
    const updated = [newNotif, ...list];
    this.saveAll(updated);
    return updated;
  },
};

