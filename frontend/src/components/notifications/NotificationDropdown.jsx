import { useEffect, useRef } from 'react';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';

export default function NotificationDropdown({ isOpen, onClose }) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAll,
  } = useNotifications();

  const dropdownRef = useRef(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-[#E8EAF1] dark:border-[#1E2448] bg-white dark:bg-[#101329] shadow-2xl z-50 overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E8EAF1] dark:border-[#1E2448] px-4 py-3.5 bg-[#F7F8FC]/50 dark:bg-[#12162E]/50">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F0EDFF] dark:bg-[#2A1F5A] text-[#5935E8]">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#172033] dark:text-white">Notifications</h3>
            <p className="text-[10px] text-[#687386] dark:text-[#9AA3B2]">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold text-[#5935E8] dark:text-[#A58EFF] hover:bg-[#F0EDFF] dark:hover:bg-[#2A1F5A] transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              aria-label="Clear all notifications"
              title="Clear all"
              className="rounded p-1 text-[#9AA3B2] hover:bg-[#F7F8FC] dark:hover:bg-[#1B1F3B] hover:text-rose-600 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications panel"
            className="rounded p-1 text-[#9AA3B2] hover:bg-[#F7F8FC] dark:hover:bg-[#1B1F3B] hover:text-[#172033] dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[22rem] overflow-y-auto p-2 space-y-1.5 divide-y divide-[#E8EAF1]/40 dark:divide-[#1E2448]/40">
        {notifications.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F0EDFF] dark:bg-[#1E2448] text-[#9AA3B2] mb-2">
              <Bell className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-[#172033] dark:text-white">No notifications</p>
            <p className="mt-0.5 text-[11px] text-[#687386] dark:text-[#9AA3B2]">
              You will be notified here when candidate evaluations complete.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkAsRead={markAsRead}
              onDismiss={dismissNotification}
              onNavigate={onClose}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-[#E8EAF1] dark:border-[#1E2448] px-4 py-2.5 bg-[#F7F8FC]/50 dark:bg-[#12162E]/50 text-center">
          <span className="text-[10px] text-[#9AA3B2] dark:text-[#687386]">
            Showing {notifications.length} recent system event{notifications.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}

