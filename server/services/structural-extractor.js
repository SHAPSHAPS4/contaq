/**
 * Structural Extractor — Pass A (deterministic, no LLM)
 *
 * Extracts explicit data from documents using regex, text parsing,
 * and pattern matching. No AI inference — only EXTRACTED confidence.
 *
 * Targets: tables, quantities with units, schedule dates, section headings,
 * numeric values, NBS references, drawing references.
 */

const crypto = require('crypto');

let pdfParse;
try { pdfParse = require('pdf-parse'); } catch { pdfParse = null; }

/**
 * Run structural extraction on a document buffer.
 */
async function extractStructural(buffer, fileName, mimeType) {
  const slug = fileName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  const items = [];
  let text = '';

  // Extract text from PDF
  if (pdfParse && (mimeType === 'application/pdf' || fileName.endsWith('.pdf'))) {
    try {
      const parsed = await pdfParse(buffer);
      text = parsed.text || '';
    } catch (e) {
      console.warn('[Structural] PDF parse failed:', e.message);
    }
  } else {
    // For non-PDF, try to read as text
    try { text = buffer.toString('utf-8'); } catch { text = ''; }
  }

  if (!text.trim()) return { structural: items, text_content: '', document_slug: slug };

  let itemIdx = 0;

  // ── Quantities with units (e.g., "450m²", "12no.", "6.5t", "150m", "25nr")
  const qtyPattern = /(\d+\.?\d*)\s*(m²|m³|m\b|mm\b|nr\b|no\.?\b|nos\.?\b|sets?\b|items?\b|hrs?\b|weeks?\b|tonnes?\b|t\b|kg\b|litres?\b|l\b)/gi;
  let match;
  while ((match = qtyPattern.exec(text)) !== null) {
    const value = parseFloat(match[1]);
    let unit = match[2].toLowerCase().replace(/\.$/, '');
    // Normalise units
    if (unit === 'no' || unit === 'nos') unit = 'nr';
    if (unit === 'sets') unit = 'set';
    if (unit === 'items') unit = 'item';
    if (unit === 'hrs') unit = 'hr';
    if (unit === 'tonnes' || unit === 't') unit = 'tonne';

    // Get surrounding context (30 chars either side)
    const ctxStart = Math.max(0, match.index - 50);
    const ctxEnd = Math.min(text.length, match.index + match[0].length + 50);
    const context = text.slice(ctxStart, ctxEnd).replace(/\s+/g, ' ').trim();

    items.push({
      id: `${slug}__qty_${++itemIdx}`,
      type: 'quantity',
      raw_text: match[0],
      value,
      unit,
      context,
      source_file: fileName,
      source_location: `Character ${match.index}`,
      confidence: 'EXTRACTED',
    });
  }

  // ── Currency values (e.g., "£12,500.00", "£450", "GBP 1,200")
  const currencyPattern = /[£]\s*([\d,]+\.?\d{0,2})/g;
  while ((match = currencyPattern.exec(text)) !== null) {
    const value = parseFloat(match[1].replace(/,/g, ''));
    if (value > 0) {
      const ctxStart = Math.max(0, match.index - 50);
      const ctxEnd = Math.min(text.length, match.index + match[0].length + 50);
      items.push({
        id: `${slug}__val_${++itemIdx}`,
        type: 'currency_value',
        raw_text: match[0],
        value,
        unit: 'GBP',
        context: text.slice(ctxStart, ctxEnd).replace(/\s+/g, ' ').trim(),
        source_file: fileName,
        confidence: 'EXTRACTED',
      });
    }
  }

  // ── NBS specification references (e.g., "Y10", "Y20", "M41", "Z22")
  const nbsPattern = /\b([A-Z]\d{1,2})\b/g;
  const nbsSections = new Set();
  while ((match = nbsPattern.exec(text)) !== null) {
    const ref = match[1];
    // Only capture likely NBS refs (Y, M, Z, R, S, N, P sections)
    if (/^[YMZRSNP]\d{1,2}$/.test(ref) && !nbsSections.has(ref)) {
      nbsSections.add(ref);
      items.push({
        id: `${slug}__nbs_${++itemIdx}`,
        type: 'nbs_reference',
        raw_text: ref,
        value: ref,
        unit: null,
        source_file: fileName,
        confidence: 'EXTRACTED',
      });
    }
  }

  // ── Drawing references (e.g., "M-201", "E-101 Rev P03", "C1799-00-DR-MX-55001")
  const dwgPattern = /\b([A-Z]{1,3}[-/]\d{2,5}(?:[-/][A-Z0-9-]*)?)\b/g;
  const dwgRefs = new Set();
  while ((match = dwgPattern.exec(text)) !== null) {
    const ref = match[1];
    if (ref.length > 4 && !dwgRefs.has(ref)) {
      dwgRefs.add(ref);
      items.push({
        id: `${slug}__dwg_${++itemIdx}`,
        type: 'drawing_reference',
        raw_text: ref,
        value: ref,
        unit: null,
        source_file: fileName,
        confidence: 'EXTRACTED',
      });
    }
  }

  // ── Dates (e.g., "01/04/2026", "1 April 2026", "2026-04-01")
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/g,
    /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/gi,
    /(\d{4})-(\d{2})-(\d{2})/g,
  ];
  for (const dp of datePatterns) {
    while ((match = dp.exec(text)) !== null) {
      const ctxStart = Math.max(0, match.index - 40);
      const ctxEnd = Math.min(text.length, match.index + match[0].length + 40);
      items.push({
        id: `${slug}__date_${++itemIdx}`,
        type: 'date',
        raw_text: match[0],
        value: match[0],
        unit: null,
        context: text.slice(ctxStart, ctxEnd).replace(/\s+/g, ' ').trim(),
        source_file: fileName,
        confidence: 'EXTRACTED',
      });
    }
  }

  // ── Section headings (lines that look like headings — short, capitalised or numbered)
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length > 3 && line.length < 100) {
      // Numbered sections like "3.2 Mechanical Installations" or "SECTION 4: DUCTWORK"
      if (/^(\d+\.?\d*\.?\d*)\s+[A-Z]/.test(line) || /^SECTION\s+\d/i.test(line)) {
        items.push({
          id: `${slug}__heading_${++itemIdx}`,
          type: 'heading',
          raw_text: line,
          value: line,
          unit: null,
          source_file: fileName,
          source_location: `Line ${i + 1}`,
          confidence: 'EXTRACTED',
        });
      }
    }
  }

  // ── Equipment tags (AHU-01, FCU-GF-03, etc.)
  const tagPattern = /\b(?:AHU|FCU|AC|BC|VCD|FD|SD|FSD|EF|TEF|KEF|DB|MDB|MSB|P|CH|CHP|CAL|PHE|PU|EV|ATT|MVHR)-?\d{1,3}(?:-[A-Z0-9]{1,4})?\b/gi;
  const tags = new Set();
  while ((match = tagPattern.exec(text)) !== null) {
    const tag = match[0].toUpperCase();
    if (!tags.has(tag)) {
      tags.add(tag);
      items.push({
        id: `${slug}__tag_${++itemIdx}`,
        type: 'equipment_tag',
        raw_text: tag,
        value: tag,
        unit: null,
        source_file: fileName,
        confidence: 'EXTRACTED',
      });
    }
  }

  return {
    structural: items,
    text_content: text.slice(0, 5000), // truncated for context
    document_slug: slug,
    stats: {
      quantities: items.filter(i => i.type === 'quantity').length,
      currency_values: items.filter(i => i.type === 'currency_value').length,
      nbs_references: items.filter(i => i.type === 'nbs_reference').length,
      drawing_references: items.filter(i => i.type === 'drawing_reference').length,
      dates: items.filter(i => i.type === 'date').length,
      headings: items.filter(i => i.type === 'heading').length,
      equipment_tags: items.filter(i => i.type === 'equipment_tag').length,
      total: items.length,
    },
  };
}

/**
 * Compute SHA256 hash of a buffer for caching.
 */
function hashDocument(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Validate quote extraction against schema.
 */
function validateQuoteExtraction(data) {
  const errors = [];
  if (!data) { errors.push('Missing extraction data'); return { valid: false, errors }; }

  const q = data.quote_extraction || data;
  if (!Array.isArray(q.scope_items)) errors.push('scope_items must be array');

  const validConf = ['EXTRACTED', 'INFERRED', 'AMBIGUOUS', 'High', 'Medium', 'Low'];
  const validUnits = ['m', 'm²', 'm³', 'nr', 'set', 'allow', 'item', 'hr', 'week', 'tonne', 'kg', 'GBP'];

  if (Array.isArray(q.scope_items)) {
    q.scope_items.forEach((item, i) => {
      if (!item.description) errors.push(`scope_items[${i}] missing description`);
      if (item.confidence && !validConf.includes(item.confidence)) errors.push(`scope_items[${i}] invalid confidence: ${item.confidence}`);
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Calculate completeness score.
 */
function calculateCompleteness(extraction) {
  const items = extraction.scope_items || [];
  if (items.length === 0) return 0;

  let score = 0;
  items.forEach(item => {
    if (item.confidence === 'EXTRACTED') score += 1;
    else if (item.confidence === 'INFERRED') score += 0.5;
    // AMBIGUOUS = 0
  });

  return Math.round((score / items.length) * 100) / 100;
}

/**
 * Detect document type for routing.
 */
function detectDocumentType(fileName, textContent) {
  const ext = (fileName || '').split('.').pop().toLowerCase();
  const text = (textContent || '').toLowerCase();

  if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return 'spreadsheet';
  if (ext === 'mpp') return 'programme';
  if (ext === 'dwg') return 'drawing';

  // PDF/DOCX — detect by content
  if (text.includes('bill of quantities') || text.includes('schedule of rates') || text.includes('item') && text.includes('rate') && text.includes('amount')) return 'boq';
  if (text.includes('scope of works') || text.includes('specification') || text.includes('nbs')) return 'specification';
  if (text.includes('programme') || text.includes('gantt') || text.includes('milestone')) return 'programme';
  if (text.includes('tender') || text.includes('enquiry') || text.includes('invitation to tender')) return 'tender_letter';

  // Single-page PDFs are likely drawings
  return 'general';
}

module.exports = {
  extractStructural,
  hashDocument,
  validateQuoteExtraction,
  calculateCompleteness,
  detectDocumentType,
};
