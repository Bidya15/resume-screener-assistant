import { useState } from 'react';
import { Check, Copy, Download, Eye, FileCode, FileText, X } from 'lucide-react';

/**
 * Enterprise Document Viewer Modal
 * Supports:
 * - Direct PDF preview via embedded viewer when original PDF data is available
 * - Formatted document view with preserved visual line breaks & headings
 * - Download in exact uploaded format (.pdf / .docx) — never raw .txt
 */
export default function TextModal({
  isOpen,
  onClose,
  title,
  content,
  fileData,
  fileName,
}) {
  const isPdf = Boolean(
    (fileData && typeof fileData === 'string' && (fileData.startsWith('data:application/pdf') || fileData.includes('pdf'))) ||
    (fileName && fileName.toLowerCase().endsWith('.pdf'))
  );

  const isDocx = Boolean(
    (fileData && typeof fileData === 'string' && (fileData.includes('wordprocessingml') || fileData.includes('msword'))) ||
    (fileName && (fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc')))
  );

  const [activeTab, setActiveTab] = useState(isPdf && fileData ? 'pdf' : 'text');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (fileData) {
      // 1. Exact uploaded binary file (.pdf / .docx)
      const link = document.createElement('a');
      link.href = fileData;
      link.download = fileName || (isPdf ? `${title}.pdf` : isDocx ? `${title}.docx` : `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // 2. Open print window to save as styled PDF document
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
                h1 { font-size: 20px; font-weight: 800; border-bottom: 2px solid #5935e8; padding-bottom: 10px; margin-bottom: 20px; color: #172033; }
                pre { font-family: inherit; font-size: 13px; white-space: pre-wrap; word-wrap: break-word; }
                @media print { body { padding: 0; } }
              </style>
            </head>
            <body>
              <h1>${title}</h1>
              <pre>${(content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
              <script>
                window.onload = function() {
                  window.print();
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const downloadLabel = isPdf ? 'Download PDF' : isDocx ? 'Download DOCX' : 'Export PDF';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#101329]/70 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex flex-col w-full max-w-4xl max-h-[92vh] rounded-2xl border border-[#E8EAF1] dark:border-[#1E2448] bg-white dark:bg-[#12162E] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#E8EAF1] dark:border-[#1E2448] p-4 sm:px-6 bg-[#F7F8FC]/60 dark:bg-[#0E1226]/60 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0EDFF] dark:bg-[#2A1F5A] text-[#5935E8]">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-[#172033] dark:text-white truncate">
                {title}
              </h3>
              {fileName && (
                <p className="text-xs text-[#687386] dark:text-[#9AA3B2] truncate">
                  Uploaded file: <span className="font-medium text-[#5935E8] dark:text-[#A58EFF]">{fileName}</span>
                </p>
              )}
            </div>
          </div>

          {/* Action buttons & mode toggle */}
          <div className="flex items-center gap-2">
            {/* View mode toggle (PDF vs Text) */}
            {isPdf && fileData && (
              <div className="inline-flex rounded-lg bg-[#E8EAF1] dark:bg-[#1E2448] p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('pdf')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                    activeTab === 'pdf'
                      ? 'bg-white dark:bg-[#12162E] text-[#5935E8] dark:text-[#A58EFF] shadow-sm'
                      : 'text-[#687386] dark:text-[#9AA3B2] hover:text-[#172033]'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Exact PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                    activeTab === 'text'
                      ? 'bg-white dark:bg-[#12162E] text-[#5935E8] dark:text-[#A58EFF] shadow-sm'
                      : 'text-[#687386] dark:text-[#9AA3B2] hover:text-[#172033]'
                  }`}
                >
                  <FileCode className="h-3.5 w-3.5" />
                  <span>Parsed Text</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="btn-primary text-xs py-1.5 px-3"
              title="Download original document"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{downloadLabel}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="btn-secondary text-xs py-1.5 px-3"
              title="Copy text content"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#16A36A]" />
                  <span className="text-[#16A36A]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Copy Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-lg p-1.5 text-[#9AA3B2] hover:bg-[#F7F8FC] dark:hover:bg-[#1B2144] hover:text-[#172033] dark:hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6 bg-[#F7F8FC]/30 dark:bg-[#0B0E20]/30">
          {activeTab === 'pdf' && isPdf && fileData ? (
            /* EXACT PDF VIEWER IFRAME */
            <div className="h-[68vh] w-full rounded-xl overflow-hidden border border-[#E8EAF1] dark:border-[#1E2448] bg-white shadow-inner">
              <iframe
                src={`${fileData}#toolbar=1&navpanes=0`}
                title={title}
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            /* FORMATTED DOCUMENT TEXT VIEW */
            <div className="h-[68vh] overflow-y-auto rounded-xl border border-[#E8EAF1] dark:border-[#1E2448] bg-white dark:bg-[#0E1226] p-5 sm:p-7 shadow-inner">
              {isDocx && fileName && (
                <div className="mb-4 flex items-center justify-between rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 p-3 text-xs">
                  <div className="flex items-center gap-2 text-[#5935E8] dark:text-[#A58EFF] font-semibold">
                    <FileText className="h-4 w-4" />
                    <span>Uploaded Word Document: {fileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 font-semibold text-[#5935E8] dark:text-[#A58EFF] underline hover:text-[#4926D6]"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download Original .docx</span>
                  </button>
                </div>
              )}

              <div className="max-w-3xl mx-auto space-y-4">
                {content ? (
                  content.split('\n\n').map((paragraph, idx) => {
                    const trimmed = paragraph.trim();
                    if (!trimmed) return null;

                    // Check if paragraph looks like a section header (short, uppercase or followed by colon)
                    const isHeader =
                      trimmed.length < 50 &&
                      (trimmed === trimmed.toUpperCase() || trimmed.endsWith(':'));

                    return isHeader ? (
                      <h4
                        key={idx}
                        className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5935E8] dark:text-[#A58EFF] pt-3 pb-1 border-b border-[#E8EAF1] dark:border-[#1E2448]"
                      >
                        {trimmed}
                      </h4>
                    ) : (
                      <p
                        key={idx}
                        className="text-xs sm:text-[13px] leading-relaxed text-[#172033] dark:text-[#E2E8F0] whitespace-pre-wrap font-sans"
                      >
                        {trimmed}
                      </p>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#9AA3B2] italic text-center py-12">
                    No document content available.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#E8EAF1] dark:border-[#1E2448] px-4 py-3 sm:px-6 bg-[#F7F8FC]/60 dark:bg-[#0E1226]/60">
          <p className="text-xs text-[#687386] dark:text-[#9AA3B2]">
            {isPdf && fileData
              ? 'Showing exact uploaded document with original layout and formatting.'
              : 'Preserving full structural formatting, headings, and line breaks.'}
          </p>
          <button type="button" onClick={onClose} className="btn-secondary text-xs py-1.5 px-4">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
