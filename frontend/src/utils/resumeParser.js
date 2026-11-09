/**
 * Parses contact information and metadata directly from the candidate's resume text.
 * Strictly extracts real text found in the resume without fabricating information.
 */
export function extractResumeMetadata(resumeText = '') {
  if (!resumeText) return {};

  const lines = resumeText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Email extraction regex
  const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : null;

  // Phone extraction regex
  const phoneMatch = resumeText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : null;

  // LinkedIn extraction
  const linkedinMatch = resumeText.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : null;

  // GitHub extraction
  const githubMatch = resumeText.match(/github\.com\/[a-zA-Z0-9_-]+/i);
  const github = githubMatch ? githubMatch[0] : null;

  // Years of experience extraction (e.g., "6 years", "5+ years of experience")
  const expMatch = resumeText.match(/(\d+\+?\s*(?:years|yrs)(?:\s+of\s+experience)?)/i);
  const experience = expMatch ? expMatch[0] : null;

  // Education extraction hint
  const eduMatch = resumeText.match(/(?:Bachelor|Master|B\.Tech|B\.S\.|M\.S\.|BSc|MSc|PhD|Degree)[^\n,.]*/i);
  const education = eduMatch ? eduMatch[0].trim() : null;

  // Potential location extraction (e.g. "San Francisco, CA" or "Bengaluru, India")
  let location = null;
  for (const line of lines.slice(0, 5)) {
    if (/^[A-Za-z\s]+,\s*[A-Za-z\s]+$/.test(line) && line.length < 40 && !line.includes('@')) {
      location = line;
      break;
    }
  }

  return {
    email,
    phone,
    linkedin,
    github,
    experience,
    education,
    location,
  };
}

/**
 * Extracts a concise title and key requirements from the Job Description text.
 */
export function extractJobMetadata(jobDescription = '') {
  if (!jobDescription) return { title: 'Target Role', summary: '', requirements: [] };

  const lines = jobDescription.split('\n').map((l) => l.trim()).filter(Boolean);
  const title = lines[0] && lines[0].length < 60 ? lines[0] : 'Role Requirements';

  // Find requirements bullet points
  const requirements = [];
  let capture = false;
  for (const line of lines) {
    if (/requirements|responsibilities|qualifications|skills/i.test(line)) {
      capture = true;
      continue;
    }
    if (capture && (line.startsWith('-') || line.startsWith('•') || line.startsWith('*'))) {
      requirements.push(line.replace(/^[-•*]\s*/, ''));
      if (requirements.length >= 6) break;
    }
  }

  // Fallback summary
  const summary = lines.slice(1, 3).join(' ') || jobDescription.slice(0, 150) + '...';

  return {
    title,
    summary,
    requirements: requirements.length > 0 ? requirements : lines.slice(1, 5),
  };
}

