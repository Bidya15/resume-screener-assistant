export default function SkillsOverlapCard({ matchingSkills = [], skillGaps = [] }) {
  // Combine matching skills (matched = true) and skill gaps (matched = false)
  const list = [
    ...matchingSkills.map((s) => ({
      name: s.skill,
      matched: true,
      pct: 95,
    })),
    ...skillGaps.map((g) => ({
      name: g.skill,
      matched: false,
      pct: 20,
    })),
  ].slice(0, 8); // Top 8 items for a clean card height

  if (list.length === 0) return null;

  return (
    <div className="card p-5">
      {/* Header with Legend matching HireAI */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[#172033] dark:text-white">Skills Overlap</h3>
        <div className="flex items-center gap-3 text-[11px] font-medium">
          <span className="flex items-center gap-1 text-[#5935E8]">
            <span className="h-2 w-2 rounded-full bg-[#5935E8]" /> Matched
          </span>
          <span className="flex items-center gap-1 text-[#9AA3B2]">
            <span className="h-2 w-2 rounded-full bg-[#E8EAF1] dark:bg-[#1E2448]" /> Missing
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {list.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-medium ${item.matched ? 'text-[#172033] dark:text-white' : 'text-[#687386] dark:text-[#9AA3B2]'}`}>
                {item.name}
              </span>
              <span className="text-[11px] font-semibold tabular-nums text-[#9AA3B2] dark:text-[#687386]">
                {item.matched ? '100%' : 'Gap'}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#E8EAF1] dark:bg-[#1E2448] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  item.matched ? 'bg-[#5935E8]' : 'bg-[#DC5555]'
                }`}
                style={{ width: item.matched ? '100%' : '20%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
