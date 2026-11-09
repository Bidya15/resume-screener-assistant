import api from './api';

/**
 * Downloads the PDF evaluation report for a candidate analysis.
 * Triggers a browser file download automatically.
 *
 * @param {number|string} analysisId
 * @param {string} candidateName - Used to build the suggested filename
 */
export async function downloadPdfReport(analysisId, candidateName) {
  const response = await api.get(`/analyses/${analysisId}/export/pdf`, {
    responseType: 'blob', // Important: receive binary PDF data
  });

  // Create a temporary URL and click it to trigger browser download
  const url = window.URL.createObjectURL(
    new Blob([response.data], { type: 'application/pdf' })
  );
  const link = document.createElement('a');
  link.href = url;
  const safeName = (candidateName || 'candidate').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `evaluation-report-${safeName}-#${analysisId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

