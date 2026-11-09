import { Sparkles } from 'lucide-react';

export default function SemanticExplanationBanner() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#E8EAF1] dark:border-[#1E2448] bg-[#F0EDFF]/50 dark:bg-[#161238] p-4 text-xs text-[#172033] dark:text-[#E2E8F0]">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#5935E8] text-white">
        <Sparkles className="h-4 w-4" />
      </div>
      <p className="leading-relaxed text-[#687386] dark:text-[#9AA3B2]">
        <strong className="text-[#172033] dark:text-white">Semantic AI Evaluation:</strong> This match score is based on deep semantic understanding of candidate experience, technical alignment, and role expectations — <span className="text-[#5935E8] dark:text-[#A58EFF] font-medium">not superficial keyword matching</span>.
      </p>
    </div>
  );
}
