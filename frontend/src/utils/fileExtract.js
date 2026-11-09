import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import mammoth from 'mammoth';

// Configure the PDF.js worker using Vite's URL asset import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Extract plain text from an uploaded File object (.txt, .md, .pdf, .docx).
 *
 * @param {File} file
 * @returns {Promise<{ text: string, fileName: string, fileSize: number, fileType: string }>}
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

  // 1. Plain text and Markdown
  if (lowerName.endsWith('.txt') || lowerName.endsWith('.md') || lowerName.endsWith('.markdown')) {
    const raw = await file.text();
    return { text: cleanText(raw), fileName, fileSize, fileType: 'txt' };
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
      return { text, fileName, fileSize, fileType: 'docx' };
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
        const pageStrings = content.items.map((item) => item.str);
        pagesText.push(pageStrings.join(' '));
      }

      const combined = cleanText(pagesText.join('\n\n'));
      if (!combined) {
        throw new Error('The PDF appears to be scanned or contains only images without selectable text.');
      }
      return { text: combined, fileName, fileSize, fileType: 'pdf' };
    } catch (err) {
      throw new Error(`Failed to read PDF file: ${err.message}`);
    }
  }

  // Fallback: try plain text reading
  try {
    const text = await file.text();
    return { text: cleanText(text), fileName, fileSize, fileType: 'unknown' };
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
 * Logic:
 * 1. Look for an explicit "Name:" label in the first 25 lines.
 * 2. Scan the first 15 lines for 2–4 properly capitalized words that look like a name.
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
  ]);

  // Strategy 1: Explicit "Name:" label in first 25 lines
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

  // Strategy 2: Standalone name in first 15 lines (before contact info / sections)
  const emailPattern = /[@]/;
  const phonePattern = /[\d\-+()]{7,}/;
  const urlPattern   = /https?:\/\/|www\.|linkedin\.com|github\.com/i;

  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i];
    // Skip lines that contain email, phone number, or URLs
    if (emailPattern.test(line) || phonePattern.test(line) || urlPattern.test(line)) continue;
    // Skip lines with special characters common in addresses or headers
    if (/[|•\\/,@#*]/.test(line)) continue;

    const words = line.split(/\s+/).filter(Boolean);
    if (words.length < 2 || words.length > 5) continue;
    if (looksLikeName(line, headingWords)) {
      return toTitleCase(line);
    }
  }

  return ''; // Could not determine name with confidence
}

/**
 * Returns true if the string looks like a person's name:
 * - 2–5 words, each beginning with a capital letter
 * - No digits, no headings
 * - Only contains letters, hyphens, apostrophes, and periods
 */
function looksLikeName(str, headingWords) {
  if (!str) return false;
  const words = str.trim().split(/\s+/);
  if (words.length < 2 || words.length > 5) return false;
  if (words.some((w) => !(/^[A-Za-z][A-Za-z'\-.]*$/.test(w)))) return false;
  // All words must start with a capital letter (or be short connectors like 'de', 'van')
  const isCapitalized = words.every((w) => /^[A-Z]/.test(w) || w.length <= 2);
  if (!isCapitalized) return false;
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

