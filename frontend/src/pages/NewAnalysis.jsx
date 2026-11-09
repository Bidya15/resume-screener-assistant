import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnalysisForm from '../components/AnalysisForm';
import ErrorMessage from '../components/common/ErrorMessage';
import { createAnalysis } from '../services/analysisService';
import { useNotifications } from '../context/NotificationContext';

export default function NewAnalysis() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      const saved = await createAnalysis(values);

      // Trigger in-app notification for the newly generated evaluation
      addNotification({
        title: 'AI Screening Completed',
        message: `Evaluation ready for ${saved.candidateName || 'Candidate'}. Match score: ${saved.matchScore}%.`,
        type: saved.matchScore >= 70 ? 'success' : 'info',
        link: `/analysis/${saved.id}`,
      });

      // Navigate to the 3-column analysis details view
      navigate(`/analysis/${saved.id}`, { state: { justCreated: true, analysis: saved } });
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#172033] dark:text-white">
          New Resume Analysis
        </h2>
        <p className="mt-0.5 text-xs text-[#687386] dark:text-[#9AA3B2]">
          Compare candidate qualifications against job requirements using AI-powered semantic evaluation.
        </p>
      </div>

      {error && <ErrorMessage title="Analysis failed" message={error.message} />}

      <AnalysisForm onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
