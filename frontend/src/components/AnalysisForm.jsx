import { useRef, useState } from 'react';
import { Eraser, Loader2, ScanSearch, Sparkles, User } from 'lucide-react';
import { LIMITS } from '../utils/constants';
import { validateAnalysisInput } from '../utils/validation';
import FileOrTextInput from './FileOrTextInput';
import { guessCandidateNameFromFilename, extractNameFromResumeText } from '../utils/fileExtract';

// Sample dataset so evaluators can test the full AI screening flow with one click.
// All details are entirely fictional and for demonstration purposes only.
const SAMPLE_DATA = {
  candidateName: 'Alex Morgan',
  jobDescription: `Senior Full Stack Java Engineer
ResumeIQ Platform Team

Key Responsibilities:
- Design and build scalable RESTful microservices using Java 21 and Spring Boot 3.x.
- Develop modern, responsive web user interfaces with React, Vite, and Tailwind CSS.
- Architect high-performance PostgreSQL databases, write optimized JPA/Hibernate queries, and design JSONB data models.
- Integrate Large Language Models (LLMs) and Generative AI pipelines into enterprise workflows.
- Implement robust CI/CD, unit testing with JUnit 5/Mockito, and automated containerised deployments.

Requirements:
- 5+ years of production experience in Java and the Spring Boot ecosystem.
- Strong hands-on proficiency with React, TypeScript or modern JavaScript, and REST APIs.
- Deep expertise in relational databases (PostgreSQL preferred) and SQL tuning.
- Experience with Docker, cloud deployment (AWS/GCP), and secure API designs.
- Bachelor's or Master's degree in Computer Science or equivalent work experience.`,

  resume: `ALEX MORGAN
alex.morgan@example.dev | github.com/alexmdev

SUMMARY:
Senior Software Engineer with 6 years of experience designing distributed backend systems in Java/Spring Boot and responsive frontends with React. Skilled in PostgreSQL schema design, secure RESTful APIs, and LLM-assisted feature development.

TECHNICAL SKILLS:
- Languages & Frameworks: Java 17/21, Spring Boot 3.x, Spring Data JPA, Hibernate, React, TypeScript, JavaScript (ES6+), Tailwind CSS
- Databases & Storage: PostgreSQL (JSONB, query optimisation, indexing), Redis, Liquibase
- Cloud & DevOps: Docker, Kubernetes, AWS (ECS, RDS, S3), GitHub Actions CI/CD
- Testing: JUnit 5, Mockito, Testcontainers, Jest

EXPERIENCE:
Senior Backend Engineer — CloudScale Solutions (2021 – Present)
- Engineered high-throughput Spring Boot 3 microservices handling 15,000+ requests/sec at sub-50 ms latency.
- Designed PostgreSQL schemas with JSONB caching strategies, reducing query latency by 35%.
- Integrated OpenAI and Claude LLM APIs to automate customer ticket categorisation and sentiment analysis.
- Led migration from Java 11 to Java 21, adopting virtual threads and record patterns.

Full Stack Developer — Nexus Web Labs (2018 – 2021)
- Developed customer-facing analytics dashboards with React, Redux, and Tailwind CSS.
- Built Spring Boot REST APIs supporting dynamic filtering, aggregation, and data export.
- Raised test coverage from 62% to 88% using JUnit 5 and Mockito.

EDUCATION:
Bachelor of Science in Computer Science — State University (2018)`,
};

export default function AnalysisForm({ onSubmit, submitting }) {
  const [values, setValues] = useState({
    candidateName: '',
    jobDescription: '',
    resume: '',
    resumeFileData: null,
    resumeFileName: null,
    jdFileData: null,
    jdFileName: null,
  });
  const [errors, setErrors] = useState({});
  const inFlight = useRef(false);

  const setField = (name) => (v) => {
    setValues((prev) => {
      const next = { ...prev, [name]: v };
      // If user pasted or typed into resume and candidateName is empty, auto-extract name from text
      if (name === 'resume' && !prev.candidateName.trim() && v && v.trim()) {
        const extracted = extractNameFromResumeText(v);
        if (extracted) {
          next.candidateName = extracted;
        }
      }
      return next;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleResumeFileLoaded = (fileResult) => {
    // 1. Try extracting candidate name from resume text content first
    let guessed = '';
    if (fileResult.text) {
      guessed = extractNameFromResumeText(fileResult.text);
    }
    // 2. Fallback to filename if text extraction returned empty
    if (!guessed && fileResult.fileName) {
      guessed = guessCandidateNameFromFilename(fileResult.fileName);
    }

    setValues((prev) => ({
      ...prev,
      candidateName: prev.candidateName.trim() ? prev.candidateName : (guessed || ''),
      resumeFileData: fileResult.dataUrl || prev.resumeFileData,
      resumeFileName: fileResult.fileName || prev.resumeFileName,
    }));
  };

  const handleJdFileLoaded = (fileResult) => {
    setValues((prev) => ({
      ...prev,
      jdFileData: fileResult.dataUrl || prev.jdFileData,
      jdFileName: fileResult.fileName || prev.jdFileName,
    }));
  };

  const loadSampleData = () => {
    setValues({
      candidateName: SAMPLE_DATA.candidateName,
      jobDescription: SAMPLE_DATA.jobDescription,
      resume: SAMPLE_DATA.resume,
      resumeFileData: null,
      resumeFileName: null,
      jdFileData: null,
      jdFileName: null,
    });
    setErrors({});
  };

  const clearAll = () => {
    setValues({
      candidateName: '',
      jobDescription: '',
      resume: '',
      resumeFileData: null,
      resumeFileName: null,
      jdFileData: null,
      jdFileName: null,
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inFlight.current || submitting) return;

    const found = validateAnalysisInput(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    inFlight.current = true;
    try {
      const detectedName = values.candidateName.trim() || extractNameFromResumeText(values.resume) || 'Unknown Candidate';
      await onSubmit({
        candidateName: detectedName,
        jobDescription: values.jobDescription.trim(),
        resumeText: values.resume.trim(),
        resumeFileData: values.resumeFileData || undefined,
        resumeFileName: values.resumeFileName || undefined,
        jobDescriptionFileData: values.jdFileData || undefined,
        jobDescriptionFileName: values.jdFileName || undefined,
      });
    } finally {
      inFlight.current = false;
    }
  };

  const isEmpty = !values.candidateName && !values.jobDescription && !values.resume;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E8EAF1] dark:border-[#1E2448] bg-[#F0EDFF]/50 dark:bg-[#161238] p-4">
        <div>
          <h3 className="text-sm font-semibold text-[#172033] dark:text-white">Screen a Candidate</h3>
          <p className="text-xs text-[#687386] dark:text-[#9AA3B2]">
            Paste text directly or upload files (.pdf, .docx, .txt). Both methods are supported for both inputs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSampleData}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#5935E8]/30 bg-white dark:bg-[#1B1F3B] px-3 py-1.5 text-xs font-semibold text-[#5935E8] dark:text-[#A58EFF] shadow-sm hover:bg-[#F0EDFF] dark:hover:bg-[#252A4E] disabled:opacity-50 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#5935E8] dark:text-[#A58EFF]" />
            Load sample data
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={submitting || isEmpty}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8EAF1] dark:border-[#1E2448] bg-white dark:bg-[#1B1F3B] px-3 py-1.5 text-xs font-medium text-[#687386] dark:text-[#9AA3B2] shadow-sm hover:bg-[#F7F8FC] dark:hover:bg-[#252A4E] disabled:opacity-50 transition-colors"
          >
            <Eraser className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Candidate Name Input */}
      <div className="card p-5">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="candidateName" className="flex items-center gap-1.5 text-sm font-semibold text-[#172033] dark:text-white">
            <User className="h-4 w-4 text-[#687386] dark:text-[#9AA3B2]" />
            Candidate name <span className="font-normal text-[#9AA3B2] dark:text-[#687386]">(optional)</span>
          </label>
        </div>
        <input
          id="candidateName"
          type="text"
          value={values.candidateName}
          onChange={(e) => setField('candidateName')(e.target.value)}
          disabled={submitting}
          placeholder="e.g. Jane Smith (or leave empty to let the AI extract it from the resume)"
          className="input w-full"
        />
        <p className="mt-2 text-xs text-[#687386] dark:text-[#9AA3B2]">
          If left blank, the AI will automatically extract and identify the candidate's name from the resume.
        </p>
      </div>

      {/* Grid: Job Description and Candidate Resume (both support text and file upload) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FileOrTextInput
          id="jobDescription"
          label="Job Description"
          value={values.jobDescription}
          onChange={setField('jobDescription')}
          onFileLoaded={handleJdFileLoaded}
          max={LIMITS.JOB_DESCRIPTION_MAX}
          error={errors.jobDescription}
          disabled={submitting}
          placeholder="Paste the full job description, required technical competencies, responsibilities, and experience level..."
          fileHint="Upload job description document (.pdf, .docx, .txt, .md)"
        />

        <FileOrTextInput
          id="resume"
          label="Candidate Resume"
          value={values.resume}
          onChange={setField('resume')}
          onFileLoaded={handleResumeFileLoaded}
          max={LIMITS.RESUME_MAX}
          error={errors.resume}
          disabled={submitting}
          placeholder="Paste the candidate's resume, work history, projects, skills, and educational qualifications..."
          fileHint="Upload candidate's resume (.pdf, .docx, .txt, .md)"
        />
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-col-reverse gap-3 rounded-xl border border-[#E8EAF1] dark:border-[#1E2448] bg-white dark:bg-[#12162E] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#687386] dark:text-[#9AA3B2]" role="status" aria-live="polite">
          {submitting ? (
            <span className="flex items-center gap-2 font-medium text-[#5935E8] dark:text-[#A58EFF]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing candidate profile... Evaluating skills, experience and job requirements.
            </span>
          ) : (
            'Both Job Description and Candidate Resume are required for semantic evaluation.'
          )}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={clearAll}
            disabled={submitting || isEmpty}
            className="btn-secondary"
          >
            <Eraser className="h-4 w-4" aria-hidden="true" /> Clear all
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ScanSearch className="h-4 w-4" aria-hidden="true" />
            )}
            {submitting ? 'Analyzing…' : 'Analyze Resume'}
          </button>
        </div>
      </div>
    </form>
  );
}
