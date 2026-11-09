import { useState } from 'react';
import { Check, Copy, MessageSquare } from 'lucide-react';

export default function InterviewQuestionsCard({ interviewQuestions = [] }) {
  const [copiedIdx, setCopiedIdx] = useState(null);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!interviewQuestions || interviewQuestions.length === 0) return null;

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F0EDFF] dark:bg-[#2A1F5A] text-[#5935E8]">
          <MessageSquare className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold text-[#172033] dark:text-white">Suggested Interview Questions</h3>
      </div>

      <p className="text-xs text-[#687386] dark:text-[#9AA3B2] mb-4">
        AI-crafted questions specifically targeted at candidate skill depth and role alignment.
      </p>

      <div className="space-y-3.5">
        {interviewQuestions.map((q, idx) => (
          <div
            key={idx}
            className="group relative rounded-xl border border-[#E8EAF1] dark:border-[#1E2448] bg-[#F7F8FC]/50 dark:bg-[#0E1226] p-3.5 text-xs transition-colors hover:border-[#D5D9E4] dark:hover:border-[#5935E8] hover:bg-white dark:hover:bg-[#161A36]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 font-bold text-[#5935E8]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F0EDFF] dark:bg-[#2A1F5A] text-[11px]">
                  {idx + 1}
                </span>
                {q.relatedSkill && (
                  <span className="rounded bg-white dark:bg-[#1B1F3B] border border-[#E8EAF1] dark:border-[#1E2448] px-2 py-0.5 text-[10px] font-semibold text-[#172033] dark:text-[#E2E8F0]">
                    Focus: {q.relatedSkill}
                  </span>
                )}
              </div>

              {/* Copy Question Button */}
              <button
                type="button"
                onClick={() => handleCopy(q.question, idx)}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-[#687386] dark:text-[#9AA3B2] hover:bg-[#F0EDFF] dark:hover:bg-[#2A1F5A] hover:text-[#5935E8] transition-colors"
                title="Copy Question"
              >
                {copiedIdx === idx ? (
                  <>
                    <Check className="h-3 w-3 text-[#16A36A]" />
                    <span className="text-[#16A36A]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <p className="mt-2 text-xs font-semibold leading-relaxed text-[#172033] dark:text-white">
              "{q.question}"
            </p>

            {q.purpose && (
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#687386] dark:text-[#9AA3B2] flex items-start gap-1.5">
                <span className="font-semibold text-[#9AA3B2] dark:text-[#687386] shrink-0">Purpose:</span>
                <span>{q.purpose}</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
