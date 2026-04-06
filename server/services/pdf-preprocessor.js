/**
 * PDF Pre-Processor — Extract text, annotations, and metadata from PDFs
 * before sending to Claude. Provides structured data alongside the image
 * so Claude doesn't have to OCR everything from the visual.
 */

let pdfParse;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  console.warn('[PDF Preprocessor] pdf-parse not available:', e.message);
  pdfParse = null;
}

/**
 * Extract all available text and metadata from a PDF buffer.
 * Returns structured data that reduces Claude's OCR burden.
 */
async function preprocessPDF(buffer) {
  const result = {
    text_content: '',
    page_count: 0,
    metadata: {},
    extracted_annotations: [],
    scale_hints: [],
    dimension_hints: [],
    equipment_tags: [],
    size_annotations: [],
    has_text_layer: false,
  };

  if (!pdfParse) return result;

  try {
    const parsed = await pdfParse(buffer);
    result.text_content = parsed.text || '';
    result.page_count = parsed.numpages || 0;
    result.metadata = parsed.info || {};
    result.has_text_layer = (parsed.text || '').trim().length > 50;

    const text = result.text_content;

    // Extract scale references
    const scaleMatches = text.match(/(?:scale|SCALE)\s*[:=]?\s*1\s*:\s*(\d+)/gi) || [];
    scaleMatches.forEach(m => {
      const num = m.match(/1\s*:\s*(\d+)/);
      if (num) result.scale_hints.push('1:' + num[1]);
    });

    // Extract dimension annotations (e.g., "7500", "3.750", "DN50", "Ø315")
    const dimMatches = text.match(/(?:Ø|DN|dia|diameter)\s*(\d{2,4})/gi) || [];
    dimMatches.forEach(m => result.size_annotations.push(m.trim()));

    // Extract duct dimensions (e.g., "600x400", "600×400")
    const ductDims = text.match(/\d{2,4}\s*[x×]\s*\d{2,4}/g) || [];
    ductDims.forEach(d => result.size_annotations.push(d.trim()));

    // Extract equipment tags (e.g., "AHU-01", "FCU-GF-03", "AC-01", "BC-01", "VCD")
    const tagPattern = /\b(?:AHU|FCU|AC|BC|VCD|FD|SD|EF|TEF|DB|MDB|P|CH|CHP|CAL|PHE|PU|EV|ATT|MVHR)-?\d{1,3}(?:-\d{1,3})?\b/gi;
    const tags = text.match(tagPattern) || [];
    result.equipment_tags = [...new Set(tags.map(t => t.toUpperCase()))];

    // Extract any dimension numbers with units (e.g., "15.0m", "45m²")
    const unitDims = text.match(/\d+\.?\d*\s*(?:m²|m|mm|nr|no\.?|nos\.?)/gi) || [];
    unitDims.forEach(d => result.dimension_hints.push(d.trim()));

    // Extract drawing number patterns (e.g., "C1799-00-DR-MX-55001")
    const dwgNums = text.match(/[A-Z]{1,3}\d{2,5}[-/][A-Z0-9-]{3,}/g) || [];
    if (dwgNums.length > 0) result.metadata.drawing_numbers = [...new Set(dwgNums)];

    // Extract revision references
    const revMatches = text.match(/(?:Rev|REV|Revision)\s*[.:=]?\s*([A-Z]\d{0,2}|\d{1,3})/gi) || [];
    if (revMatches.length > 0) result.metadata.revisions = revMatches.map(r => r.trim());

  } catch (err) {
    console.error('[PDF Preprocessor] Parse error:', err.message);
    // Return partial result — the image will still be sent to Claude
  }

  return result;
}

/**
 * Build a structured context block from preprocessed PDF data.
 * This gets injected into the Claude prompt alongside the image.
 */
function buildPreprocessorContext(preprocessed) {
  const parts = [];

  if (preprocessed.has_text_layer) {
    parts.push('## PDF TEXT LAYER DETECTED');
    parts.push('This PDF has embedded text. The following data was extracted from the text layer (more reliable than OCR from image).');
  } else {
    parts.push('## NO TEXT LAYER — SCANNED/IMAGE PDF');
    parts.push('This PDF has no embedded text. All annotations must be read visually from the image.');
  }

  if (preprocessed.scale_hints.length > 0) {
    parts.push('\n### Scale References Found: ' + preprocessed.scale_hints.join(', '));
  }

  if (preprocessed.equipment_tags.length > 0) {
    parts.push('\n### Equipment Tags Found: ' + preprocessed.equipment_tags.join(', '));
    parts.push('These tags were extracted from the PDF text layer. Use them to identify and count equipment.');
  }

  if (preprocessed.size_annotations.length > 0) {
    const unique = [...new Set(preprocessed.size_annotations)];
    parts.push('\n### Size Annotations Found: ' + unique.slice(0, 30).join(', '));
  }

  if (preprocessed.dimension_hints.length > 0) {
    const unique = [...new Set(preprocessed.dimension_hints)];
    parts.push('\n### Dimension References: ' + unique.slice(0, 20).join(', '));
  }

  if (preprocessed.metadata.drawing_numbers) {
    parts.push('\n### Drawing Numbers: ' + preprocessed.metadata.drawing_numbers.join(', '));
  }

  if (preprocessed.metadata.revisions) {
    parts.push('### Revisions: ' + preprocessed.metadata.revisions.join(', '));
  }

  parts.push('\nPage count: ' + preprocessed.page_count);

  return parts.join('\n');
}

module.exports = { preprocessPDF, buildPreprocessorContext };
