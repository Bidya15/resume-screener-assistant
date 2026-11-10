import { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, Sparkles, Trash2, X } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { getAnalysisById, deleteAnalysis } from '../services/analysisService';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import CandidateProfileCard from '../components/results/CandidateProfileCard';
import JobDescriptionCard from '../components/results/JobDescriptionCard';
import MatchingDetailsCard from '../components/results/MatchingDetailsCard';
import MatchScoreCard from '../components/results/MatchScoreCard';
import SemanticExplanationBanner from '../components/results/SemanticExplanationBanner';
import DetailedScoreBreakdown from '../components/results/DetailedScoreBreakdown';
import WhyMatchesCard from '../components/results/WhyMatchesCard';
import SkillsOverlapCard from '../components/results/SkillsOverlapCard';
import SkillGapsCard from '../components/results/SkillGapsCard';
import InterviewQuestionsCard from '../components/results/InterviewQuestionsCard';
import AIRecommendationBanner from '../components/results/AIRecommendationBanner';
import ReportExportCard from '../components/results/ReportExportCard';
import TextModal from '../components/results/TextModal';
import ShareMatchModal from '../components/ShareMatchModal';
import { formatFullDateTime } from '../utils/scoreUtils';

/**
 * AnalysisResults — 3-column candidate match details page.
 * Share Match button has been moved from the header into the ReportExportCard.
 */
export default function AnalysisResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { addNotification } = useNotifications();
  const [showSuccess, setShowSuccess] = useState(Boolean(state?.justCreated));
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [statusOverride, setStatusOverride] = useState(null);

  // Modal states
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [jdModalOpen, setJdModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Fetch data from backend
  const { data: analysis, loading, error, reload } = useFetch(
    () => getAnalysisById(id),
    [id]
  );

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAnalysis(id);
      addNotification({
        title: 'Candidate Analysis Deleted',
        message: `Evaluation for ${analysis?.candidateName || `ID #${id}`} was removed.`,
        type: 'info',
      });
      navigate('/analysis/history', { replace: true });
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete candidate analysis. Please try again.');
      setDeleting(false);
    }
  };

  // Called when RecruitmentActionsPanel successfully updates status
  // We update the local analysis state so the UI reflects the new status immediately in real time
  const handleStatusChange = useCallback((updatedAnalysis) => {
    if (updatedAnalysis?.recruitmentStatus) {
      setStatusOverride(updatedAnalysis.recruitmentStatus);
    }
    reload(); // Re-fetch to get the authoritative state from the backend
  }, [reload]);

  if (loading) {
    return (
      <div className="py-20">
        <LoadingSpinner label="Loading semantic match analysis…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorMessage
          title="Could not load analysis details"
          message={error.message}
          onRetry={reload}
        />
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#172033] dark:text-white">
            {analysis.candidateName || 'Candidate Evaluation'}
          </h2>
          <p className="mt-0.5 text-xs text-[#687386] dark:text-[#9AA3B2]">
            Screened for <strong className="text-[#172033] dark:text-white">{analysis.jobTitle || 'Target Role'}</strong> • Evaluated on {formatFullDateTime(analysis.createdAt)} • Match ID: #{analysis.id}
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          <Link to="/analysis/history" className="btn-secondary text-xs">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Candidates</span>
          </Link>

          {/* Delete Candidate Button */}
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="btn-secondary text-xs hover:border-red-300 hover:text-red-600 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors"
            title="Delete this candidate analysis"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#101329]/60 dark:bg-black/70 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-red-200 dark:border-red-900 bg-white dark:bg-[#12162E] p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#172033] dark:text-white">
              Delete Candidate Analysis?
            </h3>
            <p className="text-xs text-[#687386] dark:text-[#9AA3B2] leading-relaxed">
              Are you sure you want to delete the screening record for{' '}
              <strong className="text-[#172033] dark:text-white">
                {analysis?.candidateName && analysis.candidateName !== 'Unknown'
                  ? analysis.candidateName
                  : `Candidate #${id}`}
              </strong>?
              This will permanently remove the match score, resume evaluation, and status history.
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
                  setShowDeleteConfirm(false);
                  setDeleteError(null);
                }}
                className="btn-secondary text-xs"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div
          role="status"
          className="flex items-center justify-between rounded-xl border border-[#A7F3D0] bg-[#EBFBF3] p-4 text-xs font-medium text-[#16A36A]"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-[#16A36A]" />
            <span>AI analysis completed successfully and saved to your history!</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccess(false)}
            aria-label="Dismiss"
            className="rounded p-1 hover:bg-[#D1FAE5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 3-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Candidate, Job Description, Matching Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* CandidateProfileCard receives backend-extracted contact info and live status */}
          <CandidateProfileCard
            candidateName={analysis.candidateName}
            resumeText={analysis.resumeText}
            recruitmentStatus={statusOverride || analysis.recruitmentStatus}
            candidateEmail={analysis.candidateEmail}
            candidatePhone={analysis.candidatePhone}
            candidateLocation={analysis.candidateLocation}
            candidateLinkedin={analysis.candidateLinkedin}
            candidateGithub={analysis.candidateGithub}
            onViewResume={() => setResumeModalOpen(true)}
          />

          <JobDescriptionCard
            jobDescription={analysis.jobDescription}
            onViewFullJd={() => setJdModalOpen(true)}
          />

          <MatchingDetailsCard
            analysisId={analysis.id}
            createdAt={analysis.createdAt}
          />
        </div>

        {/* CENTER COLUMN: Match Score, Explanation, Detailed Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <MatchScoreCard
            matchScore={analysis.matchScore}
            matchingSkills={analysis.matchingSkills}
            skillGaps={analysis.skillGaps}
          />

          <SemanticExplanationBanner />

          <DetailedScoreBreakdown
            matchingSkills={analysis.matchingSkills}
            resumeText={analysis.resumeText}
            matchScore={analysis.matchScore}
          />
        </div>

        {/* RIGHT COLUMN: AI Insights, Overlap, Gaps, Questions, Export */}
        <div className="lg:col-span-4 space-y-6">
          <WhyMatchesCard matchingSkills={analysis.matchingSkills} />

          <SkillsOverlapCard
            matchingSkills={analysis.matchingSkills}
            skillGaps={analysis.skillGaps}
          />

          <SkillGapsCard skillGaps={analysis.skillGaps} />

          <InterviewQuestionsCard interviewQuestions={analysis.interviewQuestions} />

          {/* Export card — hosts PDF download and Share Match (moved from header) */}
          <ReportExportCard
            analysis={analysis}
            onShareClick={() => setShareModalOpen(true)}
          />
        </div>
      </div>

      {/* BOTTOM ROW: AI Recommendation + Real Status Buttons */}
      <AIRecommendationBanner
        overallAssessment={analysis.overallAssessment}
        candidateName={analysis.candidateName}
        analysisId={analysis.id}
        recruitmentStatus={statusOverride || analysis.recruitmentStatus}
        onStatusChange={handleStatusChange}
      />

      {/* Modals */}
      <TextModal
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        title={`Original Resume — ${analysis.candidateName}`}
        content={analysis.resumeText}
        fileData={analysis.resumeFileData}
        fileName={analysis.resumeFileName}
      />

      <TextModal
        isOpen={jdModalOpen}
        onClose={() => setJdModalOpen(false)}
        title="Original Job Description"
        content={analysis.jobDescription}
        fileData={analysis.jobDescriptionFileData}
        fileName={analysis.jobDescriptionFileName}
      />

      <ShareMatchModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        candidateName={analysis.candidateName}
        matchScore={analysis.matchScore}
        analysisId={analysis.id}
        overallAssessment={analysis.overallAssessment}
      />
    </div>
  );
}
