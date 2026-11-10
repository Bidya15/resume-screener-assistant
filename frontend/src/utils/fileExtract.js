import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import mammoth from 'mammoth';

// Configure the PDF.js worker using Vite's URL asset import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Read a browser File object as a base64 Data URL.
 *
 * @param {File} file
 * @returns {Promise<string|null>}
 */
export function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Extract plain text and Data URL from an uploaded File object (.txt, .md, .pdf, .docx).
 * Preserves structural visual line breaks so headings, contact details, and bullet points
 * are not smashed into a single line.
 *
 * @param {File} file
 * @returns {Promise<{ text: string, fileName: string, fileSize: number, fileType: string, dataUrl: string|null }>}
 */
export async function extractTextFromFile(file) {
  if (!file) throw new Error('No file provided');

  const fileName = file.name;
  const fileSize = file.size;
  const lowerName = fileName.toLowerCase();

  // 10MB limit safeguard
  if (fileSize > 10 * 1024 * 1024) {
    throw new Error(`File is too large (${(fileSize / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`);
  }

  // Pre-fetch Data URL for exact document viewing
  const dataUrl = await readFileAsDataUrl(file);

  // 1. Plain text and Markdown
  if (lowerName.endsWith('.txt') || lowerName.endsWith('.md') || lowerName.endsWith('.markdown')) {
    const raw = await file.text();
    return { text: cleanText(raw), fileName, fileSize, fileType: 'txt', dataUrl };
  }

  // 2. Microsoft Word (.docx)
  if (lowerName.endsWith('.docx')) {
    try {
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      const text = cleanText(result.value || '');
      if (!text) {
        throw new Error('The DOCX file appears to be empty or contains only non-text elements (e.g. images).');
      }
      return { text, fileName, fileSize, fileType: 'docx', dataUrl };
    } catch (err) {
      throw new Error(`Failed to parse DOCX file: ${err.message}`);
    }
  }

  // 3. Legacy Word (.doc)
  if (lowerName.endsWith('.doc')) {
    throw new Error('Legacy .doc binary format is not directly supported. Please save or export your document as .docx or .pdf.');
  }

  // 4. Adobe PDF (.pdf)
  if (lowerName.endsWith('.pdf')) {
    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      const pagesText = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        let pageText = '';
        let lastY = null;

        for (const item of content.items) {
          if (!item.str) continue;
          const y = item.transform ? item.transform[5] : null;

          // When vertical position changes significantly, insert a newline
          if (lastY !== null && y !== null && Math.abs(y - lastY) > 3) {
            pageText += '\n';
          } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
            pageText += ' ';
          }

          pageText += item.str;

          if (item.hasEOL) {
            pageText += '\n';
          }
          lastY = y;
        }

        pagesText.push(pageText);
      }

      const combined = cleanText(pagesText.join('\n\n'));
      if (!combined) {
        throw new Error('The PDF appears to be scanned or contains only images without selectable text.');
      }
      return { text: combined, fileName, fileSize, fileType: 'pdf', dataUrl };
    } catch (err) {
      throw new Error(`Failed to read PDF file: ${err.message}`);
    }
  }

  // Fallback: try plain text reading
  try {
    const text = await file.text();
    return { text: cleanText(text), fileName, fileSize, fileType: 'unknown', dataUrl };
  } catch (err) {
    throw new Error(`Unsupported file type (${fileName}). Please upload a .txt, .pdf, or .docx file.`);
  }
}

/**
 * Remove excessive blank lines and normalize whitespace.
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Attempt to guess a candidate's name from a resume filename or content.
 * e.g., "John_Doe_Resume_2024.pdf" -> "John Doe"
 */
export function guessCandidateNameFromFilename(fileName) {
  if (!fileName) return '';
  const base = fileName.replace(/\.[^/.]+$/, ''); // strip extension
  // Remove common resume noise words
  const cleaned = base
    .replace(/[-_]/g, ' ')
    .replace(/\b(resume|cv|curriculum|vitae|updated|latest|draft|v\d+|\d{4})\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If we have 2 to 4 alphabetic words, it's very likely the candidate's name
  const words = cleaned.split(' ').filter(Boolean);
  if (words.length >= 2 && words.length <= 4 && words.every((w) => /^[a-zA-Z.]+$/.test(w))) {
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
  return '';
}

/**
 * Attempt to extract a candidate's name from the resume text content.
 *
 * Strategy order:
 * 1. Explicit "Name:" / "Full Name:" label in the first 25 lines.
 * 2. First 1-3 pipe-separated segments on a contact-info line (e.g. PDF single-line headers).
 * 3. Scan the first 15 non-contact lines for 2–5 words that look like a name.
 *
 * Returns '' if the name cannot be determined with confidence.
 *
 * @param {string} text - Plain text resume content
 * @returns {string}
 */
export function extractNameFromResumeText(text) {
  if (!text) return '';

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // Section/heading words that are definitely NOT names
  const headingWords = new Set([
    'summary', 'objective', 'experience', 'education', 'skills', 'projects',
    'certifications', 'achievements', 'awards', 'interests', 'hobbies',
    'languages', 'contact', 'references', 'profile', 'personal', 'work',
    'professional', 'technical', 'career', 'curriculum', 'vitae', 'resume',
    'details', 'information',
  ]);

  // ── Strategy 1: Explicit "Name:" label ───────────────────────────────────
  const labelPattern = /^(?:full\s+)?name\s*[:\-]\s*(.+)$/i;
  for (let i = 0; i < Math.min(25, lines.length); i++) {
    const match = lines[i].match(labelPattern);
    if (match) {
      const candidate = match[1].trim();
      if (looksLikeName(candidate, headingWords)) {
        return toTitleCase(candidate);
      }
    }
  }

  // ── Strategy 2: Extract from separated header line (e.g. pipe, bullet, dash) ─
  // Many resumes collapse the header into one line: "JOHN DOE | john@email.com | +91 ..."
  // or "John Doe - Senior Software Engineer"
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const line = lines[i];
    if (/[|•–—\-]/.test(line)) {
      const firstSegment = line.split(/[|•–—\-]/)[0].trim();
      if (looksLikeName(firstSegment, headingWords)) {
        return toTitleCase(firstSegment);
      }
    }
  }

  // ── Strategy 3: Standalone name in first 15 lines ────────────────────────
  const emailPattern = /[@]/;
  const phonePattern = /[\d]{6,}/;        // 6+ consecutive digits = likely a phone/ID
  const urlPattern   = /https?:\/\/|www\.|linkedin\.com|github\.com/i;

  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i];
    // Skip lines containing email, URLs, or long digit sequences
    if (emailPattern.test(line) || phonePattern.test(line) || urlPattern.test(line)) continue;
    // Skip lines with pipe, bullet, slash, or other structural characters
    if (/[|•\\/,@#*]/.test(line)) continue;

    const words = line.split(/\s+/).filter(Boolean);
    if (words.length < 2 || words.length > 5) continue;

    // Skip spaced-out PDF fonts where each letter is a separate token: "J O H N  D O E"
    if (words.every((w) => w.length === 1)) continue;

    if (looksLikeName(line, headingWords)) {
      return toTitleCase(line);
    }
  }

  return ''; // Could not determine name with confidence
}

/**
 * Returns true if the string looks like a person's name:
 * - 2–5 words
 * - Each word contains only letters (including accented), hyphens, apostrophes, or periods
 * - At least half the words start with an uppercase letter
 * - None of the words are known section headings
 */
function looksLikeName(str, headingWords) {
  if (!str) return false;
  const words = str.trim().split(/\s+/);
  if (words.length < 2 || words.length > 5) return false;

  // Allow Unicode letters (handles accented: José, García, etc.), hyphens, apostrophes, periods
  const wordPattern = /^[\p{L}][\p{L}'\-.]*$/u;
  if (words.some((w) => !wordPattern.test(w))) return false;

  // At least majority of words must start with an uppercase letter
  // (handles ALL-CAPS "JOHN DOE", title-case "John Doe", and mixed "JOHN doe")
  const uppercaseCount = words.filter((w) => /^\p{Lu}/u.test(w)).length;
  if (uppercaseCount < Math.ceil(words.length / 2)) return false;

  // None of the words should be a known section heading
  if (words.some((w) => headingWords.has(w.toLowerCase()))) return false;
  return true;
}
function toTitleCase(str) {
  return str
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

