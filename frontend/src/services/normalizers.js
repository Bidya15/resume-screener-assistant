// ALL knowledge of the backend's JSON field names lives in this file.
// If the Spring Boot DTOs differ from what is assumed here, adjust ONLY this file.
// Each function accepts several likely spellings and returns the shape the UI uses.

const pick = (obj, keys, fallback) => {
  for (const k of keys) if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  return fallback;
};

export function normalizeAnalysis(raw = {}) {
  return {
    id: pick(raw, ['id', 'analysisId']),
    candidateName: pick(raw, ['candidateName', 'candidate_name', 'name'], 'Unknown candidate'),
    jobDescription: pick(raw, ['jobDescription', 'job_description'], ''),
    resumeText: pick(raw, ['resumeText', 'resume_text', 'resume'], ''),
    matchScore: Number(pick(raw, ['matchScore', 'match_score', 'score'], 0)),
    overallAssessment: pick(raw, ['overallAssessment', 'overall_assessment', 'assessment', 'summary'], ''),
    recruitmentStatus: pick(raw, ['recruitmentStatus', 'recruitment_status'], 'NEW'),
    candidateEmail: pick(raw, ['candidateEmail', 'candidate_email', 'email'], null),
    candidatePhone: pick(raw, ['candidatePhone', 'candidate_phone', 'phone'], null),
    candidateLocation: pick(raw, ['candidateLocation', 'candidate_location', 'location'], null),
    candidateLinkedin: pick(raw, ['candidateLinkedin', 'candidate_linkedin', 'linkedin'], null),
    candidateGithub: pick(raw, ['candidateGithub', 'candidate_github', 'github'], null),
    createdAt: pick(raw, ['createdAt', 'created_at', 'analysisDate', 'date']),
    matchingSkills: (pick(raw, ['matchingSkills', 'matching_skills'], []) || []).map((s) => ({
      skill: pick(s, ['skill', 'name']),
      reason: pick(s, ['reason'], ''),
      evidence: pick(s, ['evidence', 'supportingEvidence', 'reason'], ''),
    })),
    skillGaps: (pick(raw, ['skillGaps', 'skill_gaps'], []) || []).map((g) => {
      const type = String(pick(g, ['gapType', 'gap_type', 'classification', 'type'], '')).toUpperCase();
      return {
        skill: pick(g, ['skill', 'name']),
        explanation: pick(g, ['explanation', 'reason'], ''),
        gapType: type,
        classification: type,
      };
    }),
    interviewQuestions: (pick(raw, ['interviewQuestions', 'interview_questions', 'suggestedQuestions'], []) || []).map((q) => ({
      question: pick(q, ['question', 'text']),
      purpose: pick(q, ['purpose', 'reason'], ''),
      relatedSkill: pick(q, ['relatedSkill', 'related_skill', 'skill'], ''),
    })),
  };
}

// Accepts either a plain array or a Spring Page ({ content: [...] }).
export function normalizeAnalysisList(raw) {
  const list = Array.isArray(raw) ? raw : raw?.content || raw?.items || [];
  return list.map(normalizeAnalysis);
}

export function normalizeStats(raw = {}) {
  return {
    totalAnalyses: Number(pick(raw, ['totalAnalyses', 'total_analyses', 'total'], 0)),
    averageMatchScore: Number(pick(raw, ['averageMatchScore', 'average_match_score', 'averageScore'], 0)),
    highMatchCandidates: Number(pick(raw, ['highMatchCandidates', 'high_match_candidates', 'highMatchCount', 'strongMatches'], 0)),
    recentAnalyses: normalizeAnalysisList(pick(raw, ['recentAnalyses', 'recent_analyses', 'recent'], [])),
  };
}
