import { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileCheck,
  FileText,
  Loader2,
  UploadCloud,
  X,
} from 'lucide-react';
import { extractTextFromFile } from '../utils/fileExtract';

/**
 * Unified input component providing both a Text Box and a Drag & Drop File Upload.
 *
 * Supports .pdf, .docx, .txt, and .md files.
 * When a file is uploaded, its text is automatically extracted and synchronized with
 * the parent form state, allowing the user to either review/edit the extracted text or
 * submit it directly.
 */
export default function FileOrTextInput({
  id,
  label,
  value,
  onChange,
  onFileLoaded,
  max,
  error,
  disabled,
  placeholder,
  fileHint = 'Upload PDF, Word (.docx), or plain text (.txt, .md)',
}) {
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'file'
  const [uploadedFile, setUploadedFile] = useState(null); // { name, size, chars, type }
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileProcess = async (file) => {
    if (!file || disabled) return;

    setFileError(null);
    setIsExtracting(true);

    try {
      const result = await extractTextFromFile(file);
      setUploadedFile({
        name: result.fileName,
        size: result.fileSize,
        chars: result.text.length,
        type: result.fileType,
      });

      // Update parent value
      onChange(result.text);

      // Notify parent (e.g., to auto-suggest candidate name from resume file)
      if (onFileLoaded) {
        onFileLoaded(result);
      }
    } catch (err) {
      setFileError(err.message || 'Failed to read file');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isExtracting) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled && !isExtracting) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
    // reset input value so re-uploading the same file still triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearAll = () => {
    setUploadedFile(null);
    setFileError(null);
    onChange('');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isOverLimit = value.length > max;

  return (
    <div className="card p-5 transition-all">
      {/* Header with Title and Mode Switcher */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#E8EAF1] dark:border-[#1E2448] pb-3">
        <label htmlFor={id} className="text-sm font-bold text-[#172033] dark:text-white">
          {label}
        </label>

        {/* Tab Toggle: Text vs File Upload */}
        <div className="inline-flex rounded-lg bg-[#F1F3F9] dark:bg-[#1B1F3B] p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
              activeTab === 'text'
                ? 'bg-white dark:bg-[#12162E] text-[#5935E8] dark:text-[#A58EFF] shadow-sm font-semibold'
                : 'text-[#687386] dark:text-[#9AA3B2] hover:text-[#172033] dark:hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Text Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
              activeTab === 'file'
                ? 'bg-white dark:bg-[#12162E] text-[#5935E8] dark:text-[#A58EFF] shadow-sm font-semibold'
                : 'text-[#687386] dark:text-[#9AA3B2] hover:text-[#172033] dark:hover:text-white'
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Upload File
            {uploadedFile && (
              <span className="h-2 w-2 rounded-full bg-[#16A36A]" title="File attached" />
            )}
          </button>
        </div>
      </div>

      {/* Hidden File Input element */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt,.md,.markdown"
        onChange={handleFileInputChange}
        disabled={disabled || isExtracting}
        className="hidden"
        id={`${id}-file-input`}
      />

      {/* Content Area */}
      {activeTab === 'file' ? (
        /* FILE UPLOAD DROPZONE */
        <div className="space-y-3">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !disabled && !isExtracting && fileInputRef.current?.click()}
            className={`flex min-h-[14rem] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
              isDragging
                ? 'border-[#5935E8] bg-[#F0EDFF]/60 dark:bg-[#2A1F5A]/40 scale-[1.01]'
                : uploadedFile
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-[#0E2D1F]/30 hover:bg-emerald-50/50'
                : 'border-[#E8EAF1] dark:border-[#1E2448] bg-[#F7F8FC]/50 dark:bg-[#0E1226]/50 hover:border-[#5935E8] hover:bg-[#F7F8FC] dark:hover:bg-[#161A36]'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            {isExtracting ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#5935E8]" />
                <p className="text-sm font-medium text-[#172033] dark:text-white">Extracting text from document…</p>
                <p className="text-xs text-[#687386] dark:text-[#9AA3B2]">Parsing structure, pages, and content</p>
              </div>
            ) : uploadedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 p-3 text-emerald-600">
                  <FileCheck className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-semibold text-[#172033] dark:text-white">{uploadedFile.name}</p>
                  <p className="text-xs text-[#687386] dark:text-[#9AA3B2]">
                    {formatFileSize(uploadedFile.size)} • {uploadedFile.chars.toLocaleString()} characters extracted
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Ready for analysis
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="rounded-md border border-[#E8EAF1] dark:border-[#1E2448] bg-white dark:bg-[#1B1F3B] px-2.5 py-1 text-xs font-medium text-[#172033] dark:text-white hover:bg-[#F7F8FC] dark:hover:bg-[#252A4E]"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAll();
                    }}
                    className="rounded-md border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 text-xs font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-100"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-[#F0EDFF] dark:bg-[#2A1F5A] p-3 text-[#5935E8]">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#172033] dark:text-white">
                    Drag and drop your file here, or <span className="text-[#5935E8] dark:text-[#A58EFF] underline">browse</span>
                  </p>
                  <p className="mt-1 text-xs text-[#687386] dark:text-[#9AA3B2]">{fileHint}</p>
                  <p className="mt-0.5 text-xs text-[#9AA3B2] dark:text-[#687386]">Max file size: 10 MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick link to preview/edit extracted text */}
          {value && (
            <div className="flex items-center justify-between rounded-lg bg-[#F7F8FC] dark:bg-[#161A36] px-3 py-2 text-xs">
              <span className="text-[#687386] dark:text-[#9AA3B2]">
                {uploadedFile ? 'Extracted text is loaded.' : 'Text is populated in editor.'}{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  className="font-semibold text-[#5935E8] dark:text-[#A58EFF] underline hover:text-[#4926D6]"
                >
                  View or edit in Text Editor →
                </button>
              </span>
              <button
                type="button"
                onClick={clearAll}
                disabled={disabled}
                className="text-[#9AA3B2] hover:text-rose-600 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      ) : (
        /* DIRECT TEXTAREA */
        <div>
          {/* If a file was uploaded previously, show an informative banner above the textarea */}
          {uploadedFile && (
            <div className="mb-2 flex items-center justify-between rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  Loaded from <strong>{uploadedFile.name}</strong> ({formatFileSize(uploadedFile.size)})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('file')}
                className="font-medium text-emerald-900 dark:text-emerald-200 underline hover:text-emerald-950"
              >
                Change file
              </button>
            </div>
          )}

          <div className="relative">
            <textarea
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              rows={13}
              placeholder={placeholder}
              aria-invalid={Boolean(error)}
              aria-describedby={`${id}-help`}
              className={`input min-h-[14rem] resize-y leading-relaxed font-mono text-[13px] ${
                error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : ''
              }`}
            />

            {/* Quick Upload Button floating inside header/textarea toolbar */}
            <div className="mt-1.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isExtracting}
                className="inline-flex items-center gap-1 text-xs text-[#5935E8] dark:text-[#A58EFF] hover:underline disabled:opacity-50"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Or upload file instead</span>
              </button>

              {value && (
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={disabled}
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs text-[#687386] dark:text-[#9AA3B2] hover:bg-[#F7F8FC] dark:hover:bg-[#1B1F3B] hover:text-[#172033] dark:hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" /> Clear text
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File Parsing Error Alert */}
      {fileError && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Unable to read file</p>
            <p className="mt-0.5">{fileError}</p>
          </div>
          <button
            type="button"
            onClick={() => setFileError(null)}
            className="text-rose-500 hover:text-rose-800"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Validation error and Character Counter */}
      <div id={`${id}-help`} className="mt-2 flex items-start justify-between gap-4 text-xs">
        <p className={error ? 'text-rose-600 font-medium' : 'text-transparent'} role={error ? 'alert' : undefined}>
          {error || '.'}
        </p>
        <p
          className={`shrink-0 tabular-nums ${
            isOverLimit ? 'font-semibold text-rose-600' : 'text-[#687386] dark:text-[#9AA3B2]'
          }`}
        >
          {value.length.toLocaleString()} / {max.toLocaleString()} chars
        </p>
      </div>
    </div>
  );
}
