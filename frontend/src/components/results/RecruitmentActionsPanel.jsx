import { useState } from 'react';
import { UserCheck, Users, UserX, Loader2, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { updateRecruitmentStatus } from '../../services/statusService';

/** Maps a status string to a badge style */
function StatusBadge({ status }) {
  const styles = {
    NEW:          'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    SHORTLISTED:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    UNDER_REVIEW: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    NOT_SUITABLE: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  const labels = {
    NEW:          'New',
    SHORTLISTED:  'Shortlisted',
    UNDER_REVIEW: 'Under Review',
    NOT_SUITABLE: 'Not Suitable',
  };
  const cls = styles[status] || styles.NEW;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cls}`}>
      {labels[status] || status}
    </span>
  );
}

/**
 * RecruitmentActionsPanel — replaces the demo status buttons in AIRecommendationBanner.
 * Makes real PATCH /api/analyses/{id}/status calls and reflects persisted state.
 *
 * @param {object} props
 * @param {number}   props.analysisId
 * @param {string}   props.currentStatus  - e.g. 'NEW', 'SHORTLISTED', etc.
 * @param {Function} props.onStatusChange - called with the updated AnalysisResponse after success
 */
export default function RecruitmentActionsPanel({ analysisId, currentStatus, onStatusChange }) {
  const [loading, setLoading] = useState(null);       // which action is loading
  const [notification, setNotification] = useState(null); // { type: 'success'|'error', message }
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [reason, setReason] = useState('');

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAction = async (newStatus, reasonText = null) => {
    if (loading) return;
    setLoading(newStatus);
    setNotification(null);
    try {
      const updated = await updateRecruitmentStatus(analysisId, newStatus, reasonText);
      onStatusChange?.(updated);
      notify('success', `Status updated to ${newStatus.replace('_', ' ')}`);
      setShowReasonBox(false);
      setReason('');
    } catch (err) {
      notify('error', err?.response?.data?.message || 'Failed to update status. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleNotAFit = () => {
    // For "Not a Fit" show a reason text box before submitting
    setShowReasonBox(true);
  };

  const handleNotAFitSubmit = () => {
    handleAction('NOT_SUITABLE', reason || null);
  };

  return (
    <div className="space-y-3">
      {/* Current Status */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#687386] dark:text-[#9AA3B2] font-medium">Current Status:</span>
        <StatusBadge status={currentStatus || 'NEW'} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Shortlist */}
        <button
          type="button"
          disabled={!!loading || currentStatus === 'SHORTLISTED'}
          onClick={() => handleAction('SHORTLISTED')}
          className="btn-primary text-xs py-2 px-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
          title={currentStatus === 'SHORTLISTED' ? 'Already shortlisted' : 'Add to shortlist'}
        >
          {loading === 'SHORTLISTED' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
          <span>Add to Shortlist</span>
        </button>

        {/* Under Review */}
        <button
          type="button"
          disabled={!!loading || currentStatus === 'UNDER_REVIEW'}
          onClick={() => handleAction('UNDER_REVIEW')}
          className="btn-secondary text-xs py-2 px-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
          title={currentStatus === 'UNDER_REVIEW' ? 'Already under review' : 'Move to review'}
        >
          {loading === 'UNDER_REVIEW' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4 text-[#687386]" />}
          <span>Move to Review</span>
        </button>

        {/* Not a Fit */}
        <button
          type="button"
          disabled={!!loading || currentStatus === 'NOT_SUITABLE'}
          onClick={handleNotAFit}
          className="btn-secondary text-xs py-2 px-3.5 hover:text-red-600 hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title={currentStatus === 'NOT_SUITABLE' ? 'Already marked as not suitable' : 'Mark as not a fit'}
        >
          {loading === 'NOT_SUITABLE' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserX className="h-4 w-4 text-[#687386]" />}
          <span>Not a Fit</span>
        </button>
      </div>

      {/* Reason textarea — shown only for "Not a Fit" */}
      {showReasonBox && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-3 space-y-2">
          <p className="text-xs font-medium text-red-700 dark:text-red-400">
            Reason for marking as "Not Suitable" (optional but recommended):
          </p>
          <textarea
            className="w-full text-xs rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-[#0D0F1E] text-[#172033] dark:text-white p-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
            rows={2}
            placeholder="e.g. Missing required cloud experience, insufficient seniority level…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleNotAFitSubmit}
              disabled={!!loading}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {loading === 'NOT_SUITABLE' ? 'Saving…' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={() => { setShowReasonBox(false); setReason(''); }}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E2448] text-[#687386] dark:text-[#9AA3B2] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1E3A]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`flex items-center gap-2 rounded-lg p-2.5 text-xs font-medium border ${
          notification.type === 'success'
            ? 'bg-[#EBFBF3] dark:bg-[#0E2D1F] text-[#16A36A] border-[#A7F3D0] dark:border-[#16A36A]/30'
            : 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
        }`}>
          {notification.type === 'success'
            ? <CheckCircle2 className="h-4 w-4 shrink-0" />
            : <AlertCircle className="h-4 w-4 shrink-0" />
          }
          <span>{notification.message}</span>
        </div>
      )}

      <p className="text-[10px] text-[#9AA3B2] dark:text-[#687386]">
        Status changes are recorded in the audit trail. Candidates are never deleted when marked as not suitable.
      </p>
    </div>
  );
}

