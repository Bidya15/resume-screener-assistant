import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-5 text-rose-900 dark:text-rose-200"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" aria-hidden="true" />
        <div>
          <h3 className="text-sm font-bold text-rose-900 dark:text-rose-100">{title}</h3>
          {message && <p className="mt-1 text-xs text-rose-700 dark:text-rose-300 leading-relaxed">{message}</p>}
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-[#1B1F3B] px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 shadow-sm hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Try again</span>
        </button>
      )}
    </div>
  );
}

