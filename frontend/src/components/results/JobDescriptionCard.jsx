import { Briefcase, ExternalLink } from 'lucide-react';
import { extractJobMetadata } from '../../utils/resumeParser';

export default function JobDescriptionCard({ jobDescription, onViewFullJd }) {
  const meta = extractJobMetadata(jobDescription);

  return (
    <div className="card p-5">
      {/* Header with Purple Icon */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0EDFF] dark:bg-[#2A1F5A] text-[#5935E8]">
          <Briefcase className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold text-[#172033] dark:text-white">Job Description</h3>
      </div>

      {/* Role Title and Summary */}
      <div className="mt-3">
        <h4 className="text-sm font-semibold text-[#172033] dark:text-white line-clamp-1">
          {meta.title}
        </h4>
        <p className="mt-1 text-xs leading-relaxed text-[#687386] dark:text-[#9AA3B2] line-clamp-3">
          {meta.summary}
        </p>
      </div>

      {/* Key Requirements List */}
      {meta.requirements && meta.requirements.length > 0 && (
        <div className="mt-4 border-t border-[#E8EAF1] dark:border-[#1E2448] pt-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#9AA3B2] dark:text-[#687386]">
            Key Requirements
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-[#687386] dark:text-[#9AA3B2]">
            {meta.requirements.slice(0, 4).map((req, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5935E8]" />
                <span className="line-clamp-2">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action: View Full JD Button */}
      <div className="mt-4 border-t border-[#E8EAF1] dark:border-[#1E2448] pt-3">
        <button
          type="button"
          onClick={onViewFullJd}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E8EAF1] dark:border-[#1E2448] py-2 text-xs font-semibold text-[#172033] dark:text-[#E2E8F0] hover:bg-[#F7F8FC] dark:hover:bg-[#1B1F3B] hover:border-[#D5D9E4] dark:hover:border-[#5935E8] transition-colors"
        >
          <span>View Full JD</span>
          <ExternalLink className="h-3 w-3 text-[#687386] dark:text-[#9AA3B2]" />
        </button>
      </div>
    </div>
  );
}
