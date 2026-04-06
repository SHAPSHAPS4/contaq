/**
 * Quote Extraction Pipeline — Two-pass architecture from graphify
 *
 * Pass A: Structural (deterministic, no LLM) — tables, quantities, dates, refs
 * Pass B: Semantic (Claude, parallel) — scope items, prelims, exclusions, qualifications
 *
 * Outputs merged extraction with EXTRACTED/INFERRED/AMBIGUOUS confidence,
 * completeness score, flags, and schema validation.
 */

const { callAI } = require('./ai');
const { extractStructural, hashDocument, validateQuoteExtraction, calculateCompleteness, detectDocumentType } = require('./structural-extractor');

const SEMANTIC_SYSTEM_PROMPT = `You are an M&E subcontractor estimating assistant. Read the following document and extract structured quote data.

Confidence rules — apply strictly:
- EXTRACTED: figure, scope item, or clause is explicitly stated in the document
- INFERRED: reasonable deduction from context (e.g. inferred rate from similar items)
- AMBIGUOUS: uncertain — flag it, do not omit it, do not guess

Flag rules — add these strings to the flags array when applicable:
- "no_rate" — quantity found but no rate or value
- "conflicting_quantity" — two different quantities for same item
- "spec_ref_missing" — references a spec clause not in uploaded set
- "drawing_ref_missing" — references a drawing not in uploaded set
- "unit_unclear" — unit is ambiguous
- "prelims_not_stated" — prelims implied but not explicit

Never invent rates or quantities. If a value is not in the document, set it to 0 and flag "no_rate".

Return ONLY valid JSON — no markdown fences, no preamble.`;

const SEMANTIC_OUTPUT_SCHEMA = `{
  "scope_items": [
    {
      "id": "unique_id",
      "description": "plain English description of this work item",
      "trade": "pipework|ductwork|electrical|hvac|sprinkler|fire_stopping|insulation|trace_heating|civil|other",
      "quantity": 0,
      "unit": "m|m²|m³|nr|set|allow|item|hr",
      "rate": 0,
      "value": 0,
      "confidence": "EXTRACTED|INFERRED|AMBIGUOUS",
      "source_location": "",
      "flags": []
    }
  ],
  "prelims": [
    {
      "type": "supervision|welfare|plant|temp_services|health_safety|design|commissioning|other",
      "description": "",
      "value": 0,
      "basis": "% of works|lump sum|per week|stated",
      "confidence": "EXTRACTED|INFERRED|AMBIGUOUS"
    }
  ],
  "exclusions": [
    { "description": "", "confidence": "EXTRACTED|AMBIGUOUS" }
  ],
  "qualifications": [
    { "description": "", "risk_level": "low|medium|high", "confidence": "EXTRACTED|INFERRED|AMBIGUOUS" }
  ],
  "programme": {
    "duration_weeks": 0,
    "start_constraint": "",
    "key_milestones": [],
    "confidence": "EXTRACTED|INFERRED|AMBIGUOUS"
  }
}`;

/**
 * Run the full quote extraction pipeline on one or more documents.
 */
async function extractQuote({ documents, projectRef, tradeType, kbPrompt, existingItems }) {
  const results = {
    quote_extraction: {
      project_ref: projectRef || '',
      source_documents: [],
      extracted_at: new Date().toISOString(),
      scope_items: [],
      prelims: [],
      exclusions: [],
      qualifications: [],
      programme: {},
      structural_data: [],
      summary: {},
    },
    usage: { total_tokens: 0 },
    timing: { structural_ms: 0, semantic_ms: 0, total_ms: 0 },
    document_cache_hits: 0,
  };

  const startTime = Date.now();

  // ═══ PASS A: STRUCTURAL (deterministic, parallel) ═══
  console.log(`[Quote Extract] Pass A — Structural extraction on ${documents.length} document(s)...`);
  const structStart = Date.now();

  const structuralResults = await Promise.all(
    documents.map(async (doc) => {
      const buffer = Buffer.from(doc.base64 || doc.content || '', 'base64');
      const structural = await extractStructural(buffer, doc.name, doc.mimeType);
      const docType = detectDocumentType(doc.name, structural.text_content);
      results.quote_extraction.source_documents.push(doc.name);
      return { ...structural, docType, docName: doc.name };
    })
  );

  results.timing.structural_ms = Date.now() - structStart;
  console.log(`[Quote Extract] Pass A complete: ${results.timing.structural_ms}ms, ${structuralResults.reduce((s, r) => s + r.stats.total, 0)} structural items found`);

  // Store all structural data
  results.quote_extraction.structural_data = structuralResults.map(r => ({
    document: r.docName,
    type: r.docType,
    stats: r.stats,
    items: r.structural,
  }));

  // ═══ PASS B: SEMANTIC (LLM, parallel subagents) ═══
  console.log(`[Quote Extract] Pass B — Semantic extraction (parallel)...`);
  const semStart = Date.now();

  const semanticPromises = structuralResults.map(async (structResult) => {
    const structContext = structResult.structural.length > 0
      ? '\n\nStructural extraction already found (do not re-extract — use as grounding):\n' + JSON.stringify(structResult.structural.slice(0, 50), null, 2)
      : '';

    const existingContext = (existingItems && existingItems.length > 0)
      ? '\n\nExisting quote items (avoid duplicating):\n' + existingItems.map(i => i.description).join(', ')
      : '';

    const userPrompt = `Document: ${structResult.docName} (type: ${structResult.docType})
Trade context: ${tradeType || 'M&E general'}
${structContext}${existingContext}

Document content (first 4000 chars):
${structResult.text_content.slice(0, 4000)}

Extract scope_items, prelims, exclusions, qualifications, and programme using this schema:
${SEMANTIC_OUTPUT_SCHEMA}`;

    try {
      const result = await callAI({
        systemPrompt: (kbPrompt ? kbPrompt + '\n\n' : '') + SEMANTIC_SYSTEM_PROMPT,
        userPrompt,
        documents: [],
        maxTokens: 2000,
        model: 'claude-sonnet-4-6',
      });

      results.usage.total_tokens += result.usage?.total_tokens || 0;
      return result.data;
    } catch (e) {
      console.error(`[Quote Extract] Semantic extraction failed for ${structResult.docName}:`, e.message);
      return null;
    }
  });

  const semanticResults = await Promise.all(semanticPromises);
  results.timing.semantic_ms = Date.now() - semStart;

  // ═══ MERGE ═══
  let itemIdx = 0;
  for (const sem of semanticResults) {
    if (!sem) continue;

    // Merge scope items
    const items = Array.isArray(sem.scope_items) ? sem.scope_items : [];
    items.forEach(item => {
      item.id = item.id || `scope_${++itemIdx}`;
      results.quote_extraction.scope_items.push(item);
    });

    // Merge prelims
    if (Array.isArray(sem.prelims)) {
      results.quote_extraction.prelims.push(...sem.prelims);
    }

    // Merge exclusions
    if (Array.isArray(sem.exclusions)) {
      results.quote_extraction.exclusions.push(...sem.exclusions);
    }

    // Merge qualifications
    if (Array.isArray(sem.qualifications)) {
      results.quote_extraction.qualifications.push(...sem.qualifications);
    }

    // Take first non-empty programme
    if (sem.programme && sem.programme.duration_weeks && !results.quote_extraction.programme.duration_weeks) {
      results.quote_extraction.programme = sem.programme;
    }
  }

  // ═══ VALIDATE ═══
  const validation = validateQuoteExtraction(results.quote_extraction);
  if (!validation.valid) {
    console.warn('[Quote Extract] Validation warnings:', validation.errors.join(', '));
  }

  // ═══ SUMMARY ═══
  const scopeItems = results.quote_extraction.scope_items;
  const byConfidence = { EXTRACTED: 0, INFERRED: 0, AMBIGUOUS: 0 };
  let flaggedItems = 0;
  scopeItems.forEach(item => {
    if (byConfidence.hasOwnProperty(item.confidence)) byConfidence[item.confidence]++;
    if (item.flags && item.flags.length > 0) flaggedItems++;
  });

  const missingCritical = [];
  if (scopeItems.length === 0) missingCritical.push('scope_items');
  if (results.quote_extraction.prelims.length === 0) missingCritical.push('prelims');
  if (results.quote_extraction.exclusions.length === 0) missingCritical.push('exclusions');
  if (!results.quote_extraction.programme.duration_weeks) missingCritical.push('programme');

  results.quote_extraction.summary = {
    total_scope_items: scopeItems.length,
    items_by_confidence: byConfidence,
    items_with_flags: flaggedItems,
    completeness_score: calculateCompleteness({ scope_items: scopeItems }),
    missing_critical: missingCritical,
    validation: validation,
  };

  results.timing.total_ms = Date.now() - startTime;
  console.log(`[Quote Extract] Complete: ${scopeItems.length} items, completeness ${results.quote_extraction.summary.completeness_score}, ${results.timing.total_ms}ms`);

  return results;
}

module.exports = { extractQuote };
