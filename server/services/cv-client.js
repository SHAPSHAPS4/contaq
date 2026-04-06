/**
 * CV Service Client — calls the Python FastAPI CV service
 * for PDF pre-processing and symbol detection.
 *
 * Falls back gracefully if the CV service is not available.
 * Set CV_SERVICE_URL env var to enable (e.g., http://cv-service.railway.internal:8000)
 */

let CV_SERVICE_URL = process.env.CV_SERVICE_URL || null;
if (CV_SERVICE_URL && !CV_SERVICE_URL.startsWith('http')) {
  CV_SERVICE_URL = 'https://' + CV_SERVICE_URL;
}

function isAvailable() {
  return !!CV_SERVICE_URL;
}

/**
 * Call the CV service's /full endpoint for pre-processing + detection.
 * Returns null if service is unavailable.
 */
async function callCVService(pdfBuffer) {
  if (!CV_SERVICE_URL) return null;

  try {
    // Build multipart form data manually (no external dep needed)
    const boundary = '----ContraqCVBoundary' + Date.now();
    const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="drawing.pdf"\r\nContent-Type: application/pdf\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;

    const body = Buffer.concat([
      Buffer.from(header),
      pdfBuffer,
      Buffer.from(footer),
    ]);

    const response = await fetch(`${CV_SERVICE_URL}/full`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      console.warn('[CV Client] Service returned', response.status);
      return null;
    }

    const data = await response.json();
    if (data.success) {
      console.log(`[CV Client] Pre-processed: ${data.preprocessed?.page_count || '?'} pages, ${data.preprocessed?.equipment_tags?.length || 0} tags, CV items: ${data.cv_results?.total_items_detected || 0}`);
      return data;
    }
    return null;
  } catch (err) {
    console.warn('[CV Client] Service unavailable:', err.message);
    return null;
  }
}

/**
 * Check if the CV service is healthy.
 */
async function healthCheck() {
  if (!CV_SERVICE_URL) return { available: false, reason: 'CV_SERVICE_URL not set' };

  try {
    const response = await fetch(`${CV_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json();
    return { available: true, ...data };
  } catch (err) {
    return { available: false, reason: err.message };
  }
}

module.exports = { isAvailable, callCVService, healthCheck };
