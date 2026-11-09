import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0EDFF] dark:bg-[#1E2448] text-[#5935E8] mb-3 shadow-sm">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-bold text-[#172033] dark:text-white">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-[#687386] dark:text-[#9AA3B2] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

