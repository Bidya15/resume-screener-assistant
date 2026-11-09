import { CheckCircle2, Cpu, Sparkles } from 'lucide-react';
import { formatFullDateTime } from '../../utils/scoreUtils';

export default function MatchingDetailsCard({ analysisId, createdAt }) {
  return (
    <div className="card p-5">
      {/* Header with Purple Icon */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0EDFF] dark:bg-[#2A1F5A] text-[#5935E8]">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold text-[#172033] dark:text-white">Matching Details</h3>
      </div>

      <div className="mt-4 divide-y divide-[#E8EAF1] dark:divide-[#1E2448] text-xs">
        <div className="flex items-center justify-between py-2">
          <span className="text-[#687386] dark:text-[#9AA3B2]">Matched on</span>
          <span className="font-medium text-[#172033] dark:text-white">{formatFullDateTime(createdAt)}</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-[#687386] dark:text-[#9AA3B2]">Matching Model</span>
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#5935E8]">
            <Cpu className="h-3 w-3" /> groq / gpt-oss-120b
          </span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-[#687386] dark:text-[#9AA3B2]">Evaluation Type</span>
          <span className="font-medium text-[#172033] dark:text-white">Semantic AI Matching</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-[#687386] dark:text-[#9AA3B2]">Verification</span>
          <span className="inline-flex items-center gap-1 text-[#16A36A] font-semibold text-[11px]">
            <CheckCircle2 className="h-3.5 w-3.5" /> Evidence Grounded
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[#687386] dark:text-[#9AA3B2]">Match ID</span>
          <span className="font-mono text-[11px] text-[#9AA3B2] dark:text-[#687386]">#analysis_{analysisId}</span>
        </div>
      </div>
    </div>
  );
}
