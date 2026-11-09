import { ArrowDown, ArrowRight, ArrowUp, ArrowUpDown, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/format';
import { getScoreTier } from '../utils/scoreUtils';

function SortHeader({ label, field, sort, onSort, className = '' }) {
  const active = sort.key === field;
  const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th
      scope="col"
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={`px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#9AA3B2] ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1.5 hover:text-[#172033] dark:hover:text-white transition-colors"
      >
        <span>{label}</span>
        <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#5935E8]' : 'text-[#9AA3B2]'}`} aria-hidden="true" />
      </button>
    </th>
  );
}

function StatusPill({ status }) {
  const styles = {
    NEW:          'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    SHORTLISTED:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    UNDER_REVIEW: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    NOT_SUITABLE: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800',
  };
  const labels = {
    NEW:          'New',
    SHORTLISTED:  'Shortlisted',
    UNDER_REVIEW: 'Review',
    NOT_SUITABLE: 'Not Suitable',
  };
  const s = status || 'NEW';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[s] || styles.NEW}`}>
      {labels[s] || s}
    </span>
  );
}

export default function AnalysisTable({ analyses, sort, onSort, onView, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[45rem] text-xs">
        <thead className="border-b border-[#E8EAF1] dark:border-[#1E2448] bg-[#F7F8FC] dark:bg-[#0E1226]/80 text-[#9AA3B2]">
          <tr>
            <SortHeader label="Candidate" field="candidateName" sort={sort} onSort={onSort} />
            <SortHeader label="Match Score" field="matchScore" sort={sort} onSort={onSort} />
            <th scope="col" className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#9AA3B2]">
              Evaluation Tier
            </th>
            <th scope="col" className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#9AA3B2]">
              HR Status
            </th>
            <SortHeader label="Screening Date" field="createdAt" sort={sort} onSort={onSort} />
            <th scope="col" className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#9AA3B2]">
              AI Assessment Summary
            </th>
            <th scope="col" className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-[#9AA3B2]">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E8EAF1] dark:divide-[#1E2448] bg-white dark:bg-[#12162E]">
          {analyses.map((a) => {
            const tier = getScoreTier(a.matchScore);
            const initials = a.candidateName
              ? a.candidateName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
              : 'CA';

            return (
              <tr
                key={a.id}
                onClick={() => onView(a.id)}
                className="hover:bg-[#F7F8FC] dark:hover:bg-[#1A2234] cursor-pointer transition-colors"
              >
                {/* Candidate with Initials Avatar */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5935E8] text-xs font-bold text-white">
                      {initials}
                    </div>
                    <div>
                      <p className="font-bold text-[#172033] dark:text-white">
                        {a.candidateName || 'Unknown Candidate'}
                      </p>
                      <p className="text-[11px] text-[#9AA3B2]">ID #{a.id}</p>
                    </div>
                  </div>
                </td>

                {/* Score bar & percentage */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold tabular-nums text-[#172033] dark:text-white w-9">
                      {a.matchScore}%
                    </span>
                    <div className="h-1.5 w-16 rounded-full bg-[#E8EAF1] dark:bg-[#1E2448] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${a.matchScore}%`,
                          backgroundColor: tier.color,
                        }}
                      />
                    </div>
                  </div>
                </td>

                {/* Tier Badge */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tier.badgeClass || ''}`}
                    style={!tier.badgeClass ? { backgroundColor: tier.bg, color: tier.text } : undefined}
                  >
                    {tier.label}
                  </span>
                </td>

                {/* Recruitment Status */}
                <td className="px-5 py-4">
                  <StatusPill status={a.recruitmentStatus} />
                </td>

                {/* Date */}
                <td className="px-5 py-4 whitespace-nowrap text-[#687386] dark:text-[#9AA3B2]">
                  {formatDate(a.createdAt)}
                </td>

                {/* Assessment Snippet */}
                <td className="px-5 py-4 max-w-xs text-[#687386] dark:text-[#9AA3B2]">
                  <p className="line-clamp-2">
                    {a.overallAssessment || 'No summary text available.'}
                  </p>
                </td>

                {/* Action Buttons */}
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(a.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E8EAF1] dark:border-[#1E2448] bg-white dark:bg-[#161A36] px-2.5 py-1 text-xs font-semibold text-[#172033] dark:text-[#E2E8F0] hover:border-[#5935E8] hover:text-[#5935E8] dark:hover:border-[#5935E8] dark:hover:text-[#A58EFF] transition-colors"
                    >
                      <span>Details</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                    {onDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(a);
                        }}
                        className="inline-flex items-center rounded-lg border border-[#E8EAF1] dark:border-[#1E2448] bg-white dark:bg-[#161A36] p-1 text-xs text-[#9AA3B2] hover:border-red-300 hover:text-red-500 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors"
                        title="Delete candidate"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
