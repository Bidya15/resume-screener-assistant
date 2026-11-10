import { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Mail,
  MessageSquare,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';

export default function ShareMatchModal({
  isOpen,
  onClose,
  candidateName = 'Candidate',
  matchScore = 0,
  analysisId,
  overallAssessment = '',
}) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // Fallback
    }
  };

  const formattedSummaryText = `🎯 ResumeIQ Candidate Screening Report
Candidate: ${candidateName}
Match Score: ${matchScore}%
AI Assessment: ${overallAssessment ? overallAssessment.slice(0, 180) + '...' : 'Strong alignment with job requirements.'}
Full Report: ${currentUrl}`;

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(formattedSummaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ResumeIQ Match: ${candidateName}`,
          text: `Review AI candidate screening for ${candidateName} (Match Score: ${matchScore}%)`,
          url: currentUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share failed', err);
      }
    } else {
      handleCopyUrl();
    }
  };

  const mailtoSubject = encodeURIComponent(`Candidate Screening Evaluation: ${candidateName} (${matchScore}%)`);
  const mailtoBody = encodeURIComponent(
    `Hi Team,\n\nPlease review the AI screening analysis for candidate ${candidateName}.\n\nOverall Match Score: ${matchScore}%\nReview the full match breakdown here: ${currentUrl}\n\nBest regards,\nResumeIQ Screener`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#101329]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-[#E8EAF1] dark:border-[#1E2448] bg-white dark:bg-[#12162E] p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8EAF1] dark:border-[#1E2448] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0EDFF] text-[#5935E8]">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172033] dark:text-white">
                Share Match Details
              </h3>
              <p className="text-xs text-[#687386] dark:text-[#9AA3B2]">
                Share candidate screening report with hiring managers or team members
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#9AA3B2] hover:bg-[#F7F8FC] dark:hover:bg-[#1B2144] hover:text-[#172033] dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Candidate Highlight Card */}
        <div className="mt-4 rounded-xl border border-[#E8EAF1] dark:border-[#1E2448] bg-[#F7F8FC] dark:bg-[#161A36] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5935E8] text-sm font-bold text-white">
              {candidateName?.slice(0, 2).toUpperCase() || 'CA'}
            </div>
            <div>
              <p className="text-sm font-bold text-[#172033] dark:text-white">{candidateName}</p>
              <p className="text-xs text-[#687386] dark:text-[#9AA3B2]">Match ID: #{analysisId || 'analysis'}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-base font-black text-[#5935E8]">{matchScore}%</span>
            <p className="text-[10px] font-semibold text-[#16A36A]">Verified Match</p>
          </div>
        </div>

        {/* 1. Direct Link Section */}
        <div className="mt-4 space-y-1.5">
          <label className="text-xs font-semibold text-[#172033] dark:text-white">
            Direct Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="input text-xs font-mono select-all truncate"
            />
            <button
              type="button"
              onClick={handleCopyUrl}
              className="btn-primary shrink-0 text-xs py-2 px-3.5"
            >
              {copiedUrl ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. Formatted Summary for Slack / Teams / Notes */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#172033] dark:text-white flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-[#5935E8]" />
              Slack / Teams Summary Format
            </label>
            <button
              type="button"
              onClick={handleCopySummary}
              className="text-xs font-semibold text-[#5935E8] hover:underline flex items-center gap-1"
            >
              {copiedSummary ? (
                <>
                  <Check className="h-3 w-3 text-[#16A36A]" />
                  <span className="text-[#16A36A]">Summary Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy Formatted Summary</span>
                </>
              )}
            </button>
          </div>
          <div className="rounded-lg border border-[#E8EAF1] dark:border-[#1E2448] bg-[#F7F8FC] dark:bg-[#0E1226] p-3 text-xs font-mono text-[#687386] dark:text-[#9AA3B2] whitespace-pre-wrap leading-relaxed max-h-28 overflow-y-auto">
            {formattedSummaryText}
          </div>
        </div>

        {/* 3. Action Buttons: Native Share & Email */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E8EAF1] dark:border-[#1E2448]">
          <a
            href={`mailto:?subject=${mailtoSubject}&body=${mailtoBody}`}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Mail className="h-3.5 w-3.5 text-[#5935E8]" />
            <span>Email Hiring Manager</span>
          </a>

          <div className="flex items-center gap-2">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Share2 className="h-3.5 w-3.5 text-[#5935E8]" />
                <span>Share via App…</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-3"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

