import { AlertTriangle } from 'lucide-react';

// Light-mode badge styles — these use very light tints that are fine on white cards.
// For dark mode we override with dark-compatible equivalents via inline style logic.
const GAP_TYPES = {
  MISSING_SKILL:          { label: 'Missing Skill',         color: '#DC5555', bg: '#FDF2F2', darkBg: '#2D1010' },
  MISSING_EVIDENCE:       { label: 'Missing Evidence',      color: '#E6A23C', bg: '#FEF7EC', darkBg: '#2D2010' },
  INSUFFICIENT_DEPTH:     { label: 'Insufficient Depth',    color: '#E6A23C', bg: '#FEF7EC', darkBg: '#2D2010' },
  MISSING_QUALIFICATION:  { label: 'Missing Qualification', color: '#DC5555', bg: '#FDF2F2', darkBg: '#2D1010' },
  CRITICAL:               { label: 'Critical',              color: '#DC5555', bg: '#FDF2F2', darkBg: '#2D1010' },
  MAJOR:                  { label: 'Major',                 color: '#DC5555', bg: '#FDF2F2', darkBg: '#2D1010' },
  MODERATE:               { label: 'Moderate',              color: '#E6A23C', bg: '#FEF7EC', darkBg: '#2D2010' },
  MINOR:                  { label: 'Minor',                 color: '#687386', bg: '#F1F3F9', darkBg: '#1B1F3B' },
};

const prettify = (type) => {
  if (!type) return 'Skill Gap';
  const known = GAP_TYPES[type];
  if (known) return known.label;
  return type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, ' ');
};

export default function SkillGapsCard({ skillGaps = [] }) {
  if (!skillGaps || skillGaps.length === 0) {
    return (
      <div className="card p-5">
        <h3 className="text-sm font-bold text-[#172033] dark:text-white mb-2">Skill Gaps</h3>
        <p className="text-xs text-[#16A36A] flex items-center gap-1.5">
          ✓ No significant gaps were identified for this role.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[#E6A23C]" />
          <h3 className="text-sm font-bold text-[#172033] dark:text-white">Skill Gaps</h3>
        </div>
        <span className="rounded-full bg-[#FEF7EC] dark:bg-[#2D2010] px-2 py-0.5 text-[11px] font-bold text-[#E6A23C]">
          {skillGaps.length} Identified
        </span>
      </div>

      <ul className="divide-y divide-[#E8EAF1] dark:divide-[#1E2448]">
        {skillGaps.map((item, idx) => {
          const type = (item.gapType || item.classification || '').toUpperCase();
          const def = GAP_TYPES[type] || { label: 'Gap', color: '#687386', bg: '#F1F3F9', darkBg: '#1B1F3B' };

          return (
            <li key={idx} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#172033] dark:text-white">{item.skill}</span>
                {type && (
                  <span
                    className="rounded-full border px-2 py-0.5 text-[10px] font-bold shrink-0"
                    style={{
                      backgroundColor: def.bg,
                      color: def.color,
                      borderColor: def.color + '50',
                    }}
                  >
                    {prettify(type)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-[#687386] dark:text-[#9AA3B2]">
                {item.explanation || item.reason}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
