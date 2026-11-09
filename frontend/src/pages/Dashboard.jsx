import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  FilePlus2,
  FolderSearch,
  History,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { getDashboardStats } from '../services/analysisService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { getScoreTier } from '../utils/scoreUtils';
import { formatDate } from '../utils/format';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, loading, error, reload } = useFetch(getDashboardStats, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#E8EAF1] dark:border-[#1E2448] bg-gradient-to-r from-white via-white to-[#F0EDFF] dark:from-[#12162E] dark:via-[#12162E] dark:to-[#1A1550] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F0EDFF] dark:bg-[#2A1F5A] px-3 py-1 text-xs font-bold text-[#5935E8] mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Recruitment Platform</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#172033] dark:text-white">
              Welcome to Synthweb AI
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#687386] dark:text-[#9AA3B2]">
              Evaluate candidate resumes intelligently and make evidence-based recruitment decisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/analysis/new" className="btn-primary">
              <FilePlus2 className="h-4 w-4" />
              <span>New Resume Analysis</span>
            </Link>
            <Link to="/analysis/history" className="btn-secondary">
              <History className="h-4 w-4 text-[#687386]" />
              <span>View History</span>
            </Link>
          </div>
        </div>

        {/* Decorative circle graphic */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-[#5935E8]/5 pointer-events-none" />
      </div>

      {loading && <LoadingSpinner label="Loading dashboard metrics…" />}
      {error && <ErrorMessage title="Could not load dashboard metrics" message={error.message} onRetry={reload} />}

      {stats && (
        <>
          {/* 4 Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Analyses */}
            <div className="card p-5 hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9AA3B2]">
                  Total Analyses
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0EDFF] dark:bg-[#2A1F5A] text-[#5935E8]">
                  <BarChart3 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-[#172033] dark:text-white tabular-nums">
                  {stats.totalAnalyses.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-[#687386] dark:text-[#9AA3B2]">
                  Total candidate evaluations generated
                </p>
              </div>
            </div>

            {/* Card 2: Average Match Score */}
            <div className="card p-5 hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9AA3B2]">
                  Average Match Score
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF] dark:bg-[#1A2D5A] text-[#3B82F6]">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-[#172033] dark:text-white tabular-nums">
                  {Math.round(stats.averageMatchScore)}%
                </p>
                <p className="mt-1 text-xs text-[#687386] dark:text-[#9AA3B2]">
                  Across all screened applicants
                </p>
              </div>
            </div>

            {/* Card 3: Strong Matches */}
            <div className="card p-5 hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9AA3B2]">
                  Strong Matches
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBFBF3] dark:bg-[#0E2D1F] text-[#16A36A]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-[#172033] dark:text-white tabular-nums">
                  {stats.highMatchCandidates.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-[#687386] dark:text-[#9AA3B2]">
                  Candidates scoring ≥ 70% threshold
                </p>
              </div>
            </div>

            {/* Card 4: Recent Analyses */}
            <div className="card p-5 hover:shadow-card-hover transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9AA3B2]">
                  Recent Activity
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF7EC] dark:bg-[#2D2010] text-[#E6A23C]">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-black text-[#172033] dark:text-white tabular-nums">
                  {stats.recentAnalyses.length}
                </p>
                <p className="mt-1 text-xs text-[#687386] dark:text-[#9AA3B2]">
                  Candidates evaluated in current cohort
                </p>
              </div>
            </div>
          </div>

          {/* Recent Analyses Section */}
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#E8EAF1] dark:border-[#1E2448] px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-[#172033] dark:text-white">Recent Analyses</h3>
                <p className="text-xs text-[#687386] dark:text-[#9AA3B2]">Latest candidate screenings from the database</p>
              </div>
              <Link
                to="/analysis/history"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#5935E8] hover:text-[#4926D6]"
              >
                <span>View all history</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {stats.recentAnalyses.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={FolderSearch}
                  title="No analyses yet"
                  description="Start by analyzing your first candidate resume against a job description."
                  action={
                    <Link to="/analysis/new" className="btn-primary">
                      <FilePlus2 className="h-4 w-4" />
                      <span>Screen First Resume</span>
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E8EAF1] dark:border-[#1E2448] bg-[#F7F8FC] dark:bg-[#0E1226] text-[11px] font-bold uppercase tracking-wider text-[#9AA3B2]">
                      <th className="py-3 px-6">Candidate</th>
                      <th className="py-3 px-6">Match Score</th>
                      <th className="py-3 px-6">Evaluation Tier</th>
                      <th className="py-3 px-6">Analysis Date</th>
                      <th className="py-3 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8EAF1] dark:divide-[#1E2448]">
                    {stats.recentAnalyses.map((item) => {
                      const tier = getScoreTier(item.matchScore);
                      return (
                        <tr
                          key={item.id}
                          onClick={() => navigate(`/analysis/${item.id}`)}
                          className="hover:bg-[#F7F8FC] dark:hover:bg-[#1B1F3B] cursor-pointer transition-colors"
                        >
                          {/* Candidate name & initials */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5935E8] text-xs font-bold text-white shrink-0">
                                {item.candidateName?.slice(0, 2).toUpperCase() || 'CA'}
                              </div>
                              <span className="font-bold text-[#172033] dark:text-white">
                                {item.candidateName || 'Unknown Candidate'}
                              </span>
                            </div>
                          </td>

                          {/* Match score bar & percentage */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <span className="font-bold tabular-nums text-[#172033] dark:text-white w-9">
                                {item.matchScore}%
                              </span>
                              <div className="h-2 w-20 rounded-full bg-[#E8EAF1] dark:bg-[#1E2448] overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${item.matchScore}%`,
                                    backgroundColor: tier.color,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Tier badge */}
                          <td className="py-4 px-6">
                            <span
                              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                              style={{ backgroundColor: tier.bg, color: tier.text }}
                            >
                              {tier.label}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-6 text-[#687386] dark:text-[#9AA3B2]">
                            {formatDate(item.createdAt)}
                          </td>

                          {/* Action button */}
                          <td className="py-4 px-6 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/analysis/${item.id}`);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#E8EAF1] dark:border-[#1E2448] px-2.5 py-1 text-xs font-semibold text-[#172033] dark:text-[#E2E8F0] hover:border-[#5935E8] hover:text-[#5935E8] dark:hover:border-[#5935E8] dark:hover:text-[#A58EFF] transition-colors"
                            >
                              <span>Details</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
