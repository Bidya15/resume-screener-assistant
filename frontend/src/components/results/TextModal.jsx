import { useState } from 'react';
import { Check, Copy, FileText, X } from 'lucide-react';

export default function TextModal({ isOpen, onClose, title, content }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#101329]/60 dark:bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-[#E8EAF1] dark:border-[#1E2448] bg-white dark:bg-[#12162E] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8EAF1] dark:border-[#1E2448] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0EDFF] dark:bg-[#2A1F5A] text-[#5935E8]">
              <FileText className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-[#172033] dark:text-white">{title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#16A36A]" />
                  <span className="text-[#16A36A]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#9AA3B2] hover:bg-[#F7F8FC] dark:hover:bg-[#1B2144] hover:text-[#172033] dark:hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-xl border border-[#E8EAF1] dark:border-[#1E2448] bg-[#F7F8FC] dark:bg-[#0E1226] p-4 text-xs font-mono leading-relaxed text-[#172033] dark:text-[#E2E8F0] whitespace-pre-wrap">
          {content || 'No text content available.'}
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
