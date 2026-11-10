import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, FilePlus2, FolderSearch, RotateCcw, Search, SearchX } from 'lucide-react';
import AnalysisTable from '../components/AnalysisTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import useFetch from '../hooks/useFetch';
import { getAnalyses, deleteAnalysis } from '../services/analysisService';
import { useNotifications } from '../context/NotificationContext';

const toNumberOrNull = (v) => (v === '' || Number.isNaN(Number(v)) ? null : Number(v));

export default function AnalysisHistory() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { data: analyses, loading, error, reload } = useFetch(getAnalyses, []);

  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [sort, setSort] = useState({ key: 'createdAt', dir: 'desc' });

  const min = toNumberOrNull(minScore);
  const max = toNumberOrNull(maxScore);
  const rangeInvalid = min !== null && max !== null && min > max;

  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const handleDeleteConfirm = async () => {
    if (!candidateToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAnalysis(candidateToDelete.id);
      const name = candidateToDelete.candidateName && candidateToDelete.candidateName !== 'Unknown'
        ? candidateToDelete.candidateName
        : `Candidate #${candidateToDelete.id}`;
      
      addNotification({
        title: 'Candidate Record Deleted',
        message: `${name} was successfully removed from the database.`,
        type: 'info',
      });
      
      setCandidateToDelete(null);
      reload();
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete candidate record. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter and sort candidates
  const visible = useMemo(() => {
    if (!analyses) return [];
    const q = search.trim().toLowerCase();
    const rows = analyses.filter(
      (a) =>
        (!q || (a.candidateName && a.candidateName.toLowerCase().includes(q))) &&
        (min === null || a.matchScore >= min) &&
        (max === null || a.matchScore <= max)
    );
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      if (sort.key === 'candidateName') {
        return (a.candidateName || '').localeCompare(b.candidateName || '') * dir;
      }
      if (sort.key === 'matchScore') {
        return (a.matchScore - b.matchScore) * dir;
      }
      return (new Date(a.createdAt || 0) - new Date(b.createdAt || 0)) * dir;
    });
  }, [analyses, search, min, max, sort]);

  const onSort = (key) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: key === 'candidateName' ? 'asc' : 'desc' }
    );

  const filtersActive = search || minScore !== '' || maxScore !== '';
  const resetFilters = () => {
    setSearch('');
    setMinScore('');
    setMaxScore('');
  };

  return (
    <div className="space-y-6">
      {/* Quick Action */}
      <div className="flex items-center justify-end">
        <Link to="/analysis/new" className="btn-primary text-xs">
          <FilePlus2 className="h-4 w-4" />
          <span>New Analysis</span>
        </Link>
      </div>

      {/* Filter and Search Card */}
      <div className="card p-5 bg-white dark:bg-[#12162E] border border-[#E8EAF1] dark:border-[#1E2448]">
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem_8rem_auto] sm:items-end">
          {/* Candidate Search */}
          <div>
            <label htmlFor="search" className="mb-1.5 block text-xs font-semibold text-[#172033] dark:text-white">
              Candidate name
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AA3B2]"
                aria-hidden="true"
              />
              <input
                id="search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate name…"
                className="input pl-9"
              />
            </div>
          </div>

          {/* Min Score */}
          <div>
            <label htmlFor="min" className="mb-1.5 block text-xs font-semibold text-[#172033] dark:text-white">
              Min score
            </label>
            <input
              id="min"
              type="number"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(e.target.value)}
              placeholder="0%"
              className="input"
            />
          </div>

          {/* Max Score */}
          <div>
            <label htmlFor="max" className="mb-1.5 block text-xs font-semibold text-[#172033] dark:text-white">
              Max score
            </label>
            <input
              id="max"
              type="number"
              min="0"
              max="100"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              placeholder="100%"
              className="input"
            />
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={resetFilters}
            disabled={!filtersActive}
            className="btn-secondary text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {rangeInvalid && (
          <p role="alert" className="mt-3 text-xs font-medium text-[#DC5555]">
            Minimum score cannot be higher than maximum score.
          </p>
        )}
      </div>

      {/* Main Table Card */}
      <div className="card overflow-hidden bg-white dark:bg-[#12162E] border border-[#E8EAF1] dark:border-[#1E2448]">
        {loading && <LoadingSpinner label="Loading candidate history…" />}
        {error && (
          <div className="p-6">
            <ErrorMessage
              title="Could not load candidate history"
              message={error.message}
              onRetry={reload}
            />
          </div>
        )}

        {analyses && analyses.length === 0 && (
          <div className="p-8">
            <EmptyState
              icon={FolderSearch}
              title="No analyses found"
              description="Screen your first candidate resume to see it in your history."
              action={
                <Link to="/analysis/new" className="btn-primary">
                  <FilePlus2 className="h-4 w-4" />
                  <span>Start First Analysis</span>
                </Link>
              }
            />
          </div>
        )}

        {analyses && analyses.length > 0 && visible.length === 0 && (
          <div className="p-8">
            <EmptyState
              icon={SearchX}
              title="No candidates match your filters"
              description="Try adjusting your candidate name search or broadening your score range."
              action={
                <button type="button" onClick={resetFilters} className="btn-secondary">
                  Reset filters
                </button>
              }
            />
          </div>
        )}

        {visible.length > 0 && (
          <>
            <AnalysisTable
              analyses={visible}
              sort={sort}
              onSort={onSort}
              onView={(id) => navigate(`/analysis/${id}`)}
              onDelete={(candidate) => setCandidateToDelete(candidate)}
            />
            <div className="flex items-center justify-between border-t border-[#E8EAF1] dark:border-[#1E2448] bg-[#F7F8FC]/50 dark:bg-[#0E1226]/50 px-6 py-3 text-xs text-[#687386] dark:text-[#9AA3B2]">
              <span>
                Showing <strong>{visible.length}</strong> of <strong>{analyses.length}</strong> candidate profiles
              </span>
              <span className="text-[11px] text-[#9AA3B2] dark:text-[#687386]">
                PostgreSQL Database Verified
              </span>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {candidateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#101329]/60 dark:bg-black/70 backdrop-blur-sm"
            onClick={() => !deleting && setCandidateToDelete(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-red-200 dark:border-red-900 bg-white dark:bg-[#12162E] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#172033] dark:text-white">
              Delete Candidate Record?
            </h3>
            <p className="text-xs text-[#687386] dark:text-[#9AA3B2] leading-relaxed">
              Are you sure you want to permanently delete the analysis for{' '}
              <strong className="text-[#172033] dark:text-white">
                {candidateToDelete.candidateName && candidateToDelete.candidateName !== 'Unknown'
                  ? candidateToDelete.candidateName
                  : `Candidate #${candidateToDelete.id}`}
              </strong>?
              This action cannot be undone.
            </p>

            {deleteError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-600 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCandidateToDelete(null);
                  setDeleteError(null);
                }}
                className="btn-secondary text-xs"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
