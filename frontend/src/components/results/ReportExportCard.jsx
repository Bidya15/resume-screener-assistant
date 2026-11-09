import { useState } from 'react';
import { Download, FileText, Share2, Loader2, CheckCircle2 } from 'lucide-react';
import { downloadPdfReport } from '../../services/exportService';

/**
 * ReportExportCard — right-column card for exporting and sharing a candidate evaluation.
 * Hosts the Download PDF button and the Share Match trigger.
 */
export default function ReportExportCard({ analysis, onShareClick }) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    setPdfError(null);
    setPdfSuccess(false);
    try {
      await downloadPdfReport(analysis.id, analysis.candidateName);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      setPdfError('Failed to generate PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0EDFF] dark:bg-[#2A1F5A] text-[#5935E8]">
          <FileText className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold text-[#172033] dark:text-white">Export & Share</h3>
      </div>

      <p className="text-xs text-[#687386] dark:text-[#9AA3B2] mb-4">
        Generate a professional candidate evaluation report or share this match with your team.
      </p>

      <div className="space-y-2.5">
        {/* Download PDF */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={pdfLoading}
          className="btn-primary w-full text-xs py-2.5 justify-center disabled:opacity-60"
        >
          {pdfLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : pdfSuccess ? (
            <CheckCircle2 className="h-4 w-4 text-green-300" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>
            {pdfLoading ? 'Generating PDF…' : pdfSuccess ? 'Downloaded!' : 'Download PDF Report'}
          </span>
        </button>

        {/* Share Match */}
        <button
          type="button"
          onClick={onShareClick}
          className="btn-secondary w-full text-xs py-2.5 justify-center"
        >
          <Share2 className="h-4 w-4 text-[#5935E8]" />
          <span>Share Match Summary</span>
        </button>
      </div>

      {/* Error feedback */}
      {pdfError && (
        <p className="mt-3 text-xs text-red-500 dark:text-red-400">{pdfError}</p>
      )}

      {/* Disclaimer */}
      <p className="mt-4 text-[10px] text-[#9AA3B2] dark:text-[#687386] leading-relaxed">
        The PDF report contains all candidate evaluation data including match score, skill analysis, and interview questions.
      </p>
    </div>
  );
}

