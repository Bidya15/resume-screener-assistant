import { Check, CheckCircle2, Clock, ExternalLink, Info, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const TYPE_CONFIG = {
  success: {
    icon: CheckCircle2,
    color: 'text-[#16A36A]',
    bg: 'bg-[#EBFBF3] dark:bg-[#0E2D1F]',
    border: 'border-[#A7F3D0] dark:border-[#16A36A]/30',
  },
  warning: {
    icon: Info,
    color: 'text-[#E6A23C]',
    bg: 'bg-[#FEF7EC] dark:bg-[#2D2010]',
    border: 'border-[#FCD34D] dark:border-[#E6A23C]/30',
  },
  info: {
    icon: Info,
    color: 'text-[#5935E8]',
    bg: 'bg-[#F0EDFF] dark:bg-[#2A1F5A]',
    border: 'border-[#D9D1FE] dark:border-[#5935E8]/30',
  },
};

function formatRelativeTime(isoString) {
  try {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return 'Recently';
  }
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDismiss,
  onNavigate,
}) {
  const { id, title, message, timestamp, read, type, link } = notification;
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const Icon = cfg.icon;

  const content = (
    <div
      className={`group relative flex items-start gap-3 rounded-xl border p-3.5 transition-all ${
        read
          ? 'border-transparent bg-white dark:bg-[#12162E] hover:bg-[#F7F8FC] dark:hover:bg-[#161A36]'
          : 'border-[#5935E8]/20 bg-[#F0EDFF]/30 dark:bg-[#161238]/60 hover:bg-[#F0EDFF]/50 dark:hover:bg-[#161238]'
      }`}
    >
      {/* Type Icon */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg} ${cfg.color}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 pr-12">
        <div className="flex items-center gap-2">
          <p className={`text-xs font-bold truncate ${read ? 'text-[#172033] dark:text-[#E2E8F0]' : 'text-[#172033] dark:text-white'}`}>
            {title}
          </p>
          {!read && (
            <span className="h-1.5 w-1.5 rounded-full bg-[#5935E8] shrink-0" title="Unread" />
          )}
        </div>

        <p className="mt-0.5 text-xs text-[#687386] dark:text-[#9AA3B2] leading-relaxed line-clamp-2">
          {message}
        </p>

        <div className="mt-2 flex items-center gap-3 text-[10px] text-[#9AA3B2] dark:text-[#687386]">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(timestamp)}
          </span>
          {link && (
            <span className="flex items-center gap-0.5 text-[#5935E8] dark:text-[#A58EFF] font-semibold">
              View <ExternalLink className="h-2.5 w-2.5" />
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons (Mark read / dismiss) */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
        {!read && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkAsRead(id);
            }}
            aria-label="Mark as read"
            title="Mark as read"
            className="rounded p-1 text-[#687386] hover:bg-[#F0EDFF] hover:text-[#5935E8] dark:hover:bg-[#2A1F5A] transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDismiss(id);
          }}
          aria-label="Dismiss notification"
          title="Dismiss notification"
          className="rounded p-1 text-[#9AA3B2] hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link
        to={link}
        onClick={() => {
          if (!read) onMarkAsRead(id);
          if (onNavigate) onNavigate();
        }}
        className="block"
      >
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
}

