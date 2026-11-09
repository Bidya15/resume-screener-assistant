import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 py-12 text-[#687386] dark:text-[#9AA3B2]"
    >
      <Loader2 className="h-8 w-8 animate-spin text-[#5935E8]" aria-hidden="true" />
      <span className="text-sm font-medium">{label}</span>
      <span className="sr-only">Please wait</span>
    </div>
  );
}

