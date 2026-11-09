import { ExternalLink, Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { extractResumeMetadata } from '../../utils/resumeParser';

/**
 * CandidateProfileCard — shows candidate avatar, name, and contact info.
 *
 * Contact fields come from the BACKEND (AI-extracted from resume text) as the source of truth.
 * Falls back to client-side parsing (resumeParser) only for older records that pre-date
 * the backend contact-extraction feature.
 */
export default function CandidateProfileCard({
  candidateName,
  resumeText,
  // Backend-extracted contact info (nullable — null for older records)
  candidateEmail,
  candidatePhone,
  candidateLocation,
  candidateLinkedin,
  candidateGithub,
  onViewResume,
}) {
  // Client-side parse is the fallback when backend fields are null (older records)
  const meta = extractResumeMetadata(resumeText);

  // Prefer backend-extracted values, fall back to client-side parse
  const email    = candidateEmail    || meta.email    || null;
  const phone    = candidatePhone    || meta.phone    || null;
  const location = candidateLocation || meta.location || null;
  const linkedin = candidateLinkedin || meta.linkedin || null;
  const github   = candidateGithub   || meta.github   || null;

  const getInitials = (name) => {
    if (!name || name === 'Unknown') return 'C';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayName = candidateName && candidateName !== 'Unknown' ? candidateName : 'Candidate Profile';
  const experienceText = meta.experience || 'Applicant';

  return (
    <div className="card p-5">
      {/* Header: Avatar, Name, Role, AI Parsed Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5935E8] text-sm font-bold text-white shadow-sm ring-4 ring-[#F0EDFF] dark:ring-[#2A1F5A]">
            {getInitials(displayName)}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#172033] dark:text-white tracking-tight">
              {displayName}
            </h2>
            <p className="text-xs font-medium text-[#687386] dark:text-[#9AA3B2]">
              {experienceText}
            </p>
            {location && (
              <p className="flex items-center gap-1 text-[11px] text-[#9AA3B2] dark:text-[#687386] mt-0.5">
                <MapPin className="h-3 w-3" /> {location}
              </p>
            )}
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-[#EBFBF3] dark:bg-[#0E2D1F] px-2.5 py-1 text-[11px] font-semibold text-[#16A36A] shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-[#16A36A]" />
          AI Parsed
        </span>
      </div>

      {/* Contact & Social Links List */}
      <div className="mt-5 space-y-2 border-t border-[#E8EAF1] dark:border-[#1E2448] pt-4 text-xs">
        {email ? (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2.5 text-[#687386] dark:text-[#9AA3B2] hover:text-[#5935E8] dark:hover:text-[#A58EFF] transition-colors"
          >
            <Mail className="h-3.5 w-3.5 text-[#9AA3B2] dark:text-[#687386]" />
            <span className="truncate">{email}</span>
          </a>
        ) : (
          <div className="flex items-center gap-2.5 text-[#9AA3B2] dark:text-[#4E5677]">
            <Mail className="h-3.5 w-3.5" />
            <span className="italic">Email not listed</span>
          </div>
        )}

        {phone && (
          <div className="flex items-center gap-2.5 text-[#687386] dark:text-[#9AA3B2]">
            <Phone className="h-3.5 w-3.5 text-[#9AA3B2] dark:text-[#687386]" />
            <span>{phone}</span>
          </div>
        )}

        {linkedin && (
          <a
            href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 text-[#687386] dark:text-[#9AA3B2] hover:text-[#5935E8] dark:hover:text-[#A58EFF] transition-colors"
          >
            <Linkedin className="h-3.5 w-3.5 text-[#9AA3B2] dark:text-[#687386]" />
            <span className="truncate">{linkedin}</span>
          </a>
        )}

        {github && (
          <a
            href={github.startsWith('http') ? github : `https://${github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 text-[#687386] dark:text-[#9AA3B2] hover:text-[#5935E8] dark:hover:text-[#A58EFF] transition-colors"
          >
            <Github className="h-3.5 w-3.5 text-[#9AA3B2] dark:text-[#687386]" />
            <span className="truncate">{github}</span>
          </a>
        )}
      </div>

      {/* Action: View Full Resume */}
      <div className="mt-4 border-t border-[#E8EAF1] dark:border-[#1E2448] pt-3">
        <button
          type="button"
          onClick={onViewResume}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#E8EAF1] dark:border-[#1E2448] py-2 text-xs font-semibold text-[#172033] dark:text-[#E2E8F0] hover:bg-[#F7F8FC] dark:hover:bg-[#1B1F3B] hover:border-[#D5D9E4] dark:hover:border-[#5935E8] transition-colors"
        >
          <span>View Full Resume</span>
          <ExternalLink className="h-3 w-3 text-[#687386] dark:text-[#9AA3B2]" />
        </button>
      </div>
    </div>
  );
}
