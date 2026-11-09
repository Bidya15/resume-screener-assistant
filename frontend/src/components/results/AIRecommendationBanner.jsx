import { Star } from 'lucide-react';
import RecruitmentActionsPanel from './RecruitmentActionsPanel';

/**
 * AIRecommendationBanner — full-width bottom section showing the AI assessment text
 * and the live, API-wired recruitment status action buttons.
 *
 * @param {object}   props
 * @param {string}   props.overallAssessment  - AI-generated summary text
 * @param {string}   props.candidateName
 * @param {number}   props.analysisId
 * @param {string}   props.recruitmentStatus  - current DB-persisted status
 * @param {Function} props.onStatusChange     - called with updated analysis after PATCH
 */
export default function AIRecommendationBanner({
  overallAssessment,
  candidateName,
  analysisId,
  recruitmentStatus,
  onStatusChange,
}) {
  return (
    <div className="card p-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        {/* Left: Assessment Text */}
        <div className="flex items-start gap-4 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0EDFF] dark:bg-[#2A1F5A] text-[#5935E8]">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#172033] dark:text-white">AI Recommendation</h3>
              <span className="rounded bg-[#F0EDFF] dark:bg-[#2A1F5A] px-2 py-0.5 text-[10px] font-bold text-[#5935E8]">
                Advisory Only
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#687386] dark:text-[#9AA3B2] max-w-2xl">
              {overallAssessment ||
                `${candidateName || 'This candidate'} shows strong qualifications matching the role requirements. Recommended for initial technical screening interview.`}
            </p>
          </div>
        </div>

        {/* Right: Real status action buttons (wired to backend) */}
        <div className="shrink-0 min-w-0 lg:min-w-[320px]">
          <RecruitmentActionsPanel
            analysisId={analysisId}
            currentStatus={recruitmentStatus}
            onStatusChange={onStatusChange}
          />
        </div>
      </div>
    </div>
  );
}
