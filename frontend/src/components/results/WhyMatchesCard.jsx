import { CheckCircle2 } from 'lucide-react';

export default function WhyMatchesCard({ matchingSkills = [] }) {
  if (!matchingSkills || matchingSkills.length === 0) {
    return (
      <div className="card p-5">
        <h3 className="text-sm font-bold text-[#172033] dark:text-white mb-3">Why This Candidate Matches</h3>
        <p className="text-xs text-[#687386] dark:text-[#9AA3B2]">No strong direct matches were extracted for this profile.</p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold text-[#172033] dark:text-white mb-3">Why This Candidate Matches</h3>

      <ul className="space-y-3">
        {matchingSkills.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16A36A] mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-[#172033] dark:text-white">{item.skill}</span>
              <p className="leading-relaxed text-[#687386] dark:text-[#9AA3B2]">
                {item.evidence || item.reason || 'Demonstrated proficiency in candidate background.'}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
