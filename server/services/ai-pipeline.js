/**
 * AI Pipeline Service — AlphaLab-inspired multi-phase processing
 *
 * Phase 1: Deep Analysis → Generation (two-call grounded pipeline)
 * Phase 2: Adversarial Critic (audit pass on any AI output)
 * Phase 3: Dual-Model Divergence (conservative vs aggressive estimation)
 */

const { callAI } = require('./ai');

/* ══════════════════════════════════════════════════════════════════
   PHASE 1 — DEEP ANALYSIS PIPELINE
   Call 1: Structured analysis of source documents
   Call 2: Grounded generation using analysis as context
   ══════════════════════════════════════════════════════════════════ */

const ANALYSIS_SYSTEM_PROMPT = `You are an M&E construction contract analyst. You will be given a set of project documents (journal entries, contracts, correspondence, programme data).

Your job is to extract:
(a) All delay events with dates and responsible parties
(b) All relevant contract clauses cited or applicable
(c) Programme baseline dates vs actual dates where identifiable
(d) Any cost substantiation references (daywork sheets, invoices, valuations)
(e) Key personnel and parties mentioned
(f) Current contract status and any dispute indicators

Output ONLY a structured JSON object — no prose, no markdown. Use this schema:
{
  "delay_events": [{ "date": "", "event": "", "responsible_party": "", "impact": "", "clause_ref": "" }],
  "contract_clauses": [{ "clause": "", "relevance": "", "source_document": "" }],
  "programme": { "baseline_dates": [], "actual_dates": [], "slippage_days": 0 },
  "cost_references": [{ "type": "", "amount": "", "date": "", "description": "" }],
  "parties": [{ "name": "", "role": "" }],
  "status_summary": "",
  "document_count": 0
}`;

const GENERATION_PROMPTS = {
  eot: `You are a specialist M&E subcontractor commercial manager drafting an Extension of Time claim.
You have been given a structured analysis of all project documents.
Use ONLY the facts in this analysis — do not invent dates, amounts, or clause references.
Structure your output as:
1. Executive Summary (2-3 sentences)
2. Factual Background (chronological, referenced)
3. Grounds for Extension (with specific clause references from the analysis)
4. Duration Sought (with programme evidence from the analysis)
5. Supporting Records (list documents/evidence from the analysis)
If the analysis does not contain sufficient information for any section, state "Insufficient data — [what is needed]".`,

  loss_expense: `You are a specialist M&E subcontractor commercial manager drafting a Loss & Expense claim.
You have been given a structured analysis of all project documents.
Use ONLY the facts in this analysis — do not invent amounts, dates, or clause references.
Structure your output as:
1. Executive Summary
2. Heads of Claim (prolongation, disruption, acceleration — only those supported by evidence)
3. Quantification (using cost references from the analysis)
4. Supporting Records
5. Contractual Basis (specific clause references from the analysis)
If the analysis lacks cost substantiation, state this clearly.`,

  contract_risk: `You are an M&E contract risk analyst. You have been given a structured analysis of project documents.
Identify and classify risks using ONLY the facts in the analysis. Structure as:
1. Critical Risks (immediate action required)
2. High Risks (monitor closely)
3. Medium Risks (awareness)
4. Opportunities (favourable positions)
For each risk: description, evidence from analysis, recommended action, relevant clause.`
};

async function runAnalysisPipeline({ documents, journalEntries, userRequest, generationType, kbPrompt }) {
  // CALL 1: Structured analysis
  const contextParts = [];
  if (journalEntries && journalEntries.length > 0) {
    contextParts.push('## Journal Entries\n' + journalEntries.map((j, i) =>
      `Entry ${i + 1} (${j.date || 'undated'}): ${j.content || j.text || JSON.stringify(j)}`
    ).join('\n'));
  }
  if (userRequest) {
    contextParts.push('## User Request\n' + userRequest);
  }

  const analysisResult = await callAI({
    systemPrompt: ANALYSIS_SYSTEM_PROMPT,
    userPrompt: contextParts.join('\n\n') || 'Analyse the provided documents.',
    documents: documents || [],
    maxTokens: 2000,
    model: 'claude-sonnet-4-6',
  });

  const analysis = analysisResult.data;

  // CALL 2: Grounded generation
  const genPrompt = GENERATION_PROMPTS[generationType] || GENERATION_PROMPTS.eot;
  const kbPrefix = kbPrompt ? kbPrompt + '\n\n' : '';

  const generationResult = await callAI({
    systemPrompt: kbPrefix + genPrompt,
    userPrompt: `## Document Analysis (from Phase 1)\n${JSON.stringify(analysis, null, 2)}\n\n## User Request\n${userRequest || 'Generate the requested output based on the analysis above.'}`,
    documents: [],
    maxTokens: 1500,
    model: 'claude-sonnet-4-6',
  });

  return {
    analysis,
    output: generationResult.data,
    raw_output: generationResult.raw,
    usage: {
      analysis: analysisResult.usage,
      generation: generationResult.usage,
      total_tokens: analysisResult.usage.total_tokens + generationResult.usage.total_tokens,
    },
    document_count: (documents || []).length + (journalEntries || []).length,
  };
}

/* ══════════════════════════════════════════════════════════════════
   PHASE 2 — ADVERSARIAL CRITIC PASS
   Audits any AI output for inconsistency, unsupported claims,
   and missing critical elements.
   ══════════════════════════════════════════════════════════════════ */

const CRITIC_SYSTEM_PROMPT = `You are a quality auditor reviewing an AI-generated construction document.
Check for ONLY these three issues:

1. INTERNAL INCONSISTENCY — do dates, figures, or party names contradict each other within the output?
2. UNSUPPORTED CLAIMS — does the output reference specific clause numbers, amounts, or dates that were NOT present in the source analysis provided?
3. MISSING CRITICAL ELEMENTS — for an EOT: is there a cause, effect, and duration? For a quote: are prelims, materials, and labour all present? For a contract analysis: are risks classified?

Respond ONLY with JSON:
{
  "passed": boolean,
  "issues": [{ "type": "inconsistency"|"unsupported"|"missing", "description": "specific description" }],
  "confidence": "high"|"medium"|"low"
}`;

async function runCriticPass({ aiOutput, sourceAnalysis, outputType }) {
  const result = await callAI({
    systemPrompt: CRITIC_SYSTEM_PROMPT,
    userPrompt: `## Output Type: ${outputType || 'general'}\n\n## Source Analysis (what the AI was given)\n${JSON.stringify(sourceAnalysis || {}, null, 2)}\n\n## AI Output (what the AI produced — audit this)\n${typeof aiOutput === 'string' ? aiOutput : JSON.stringify(aiOutput, null, 2)}`,
    documents: [],
    maxTokens: 500,
    model: 'claude-sonnet-4-6',
  });

  return {
    ...result.data,
    usage: result.usage,
  };
}

/* ══════════════════════════════════════════════════════════════════
   PHASE 3 — DUAL-MODEL DIVERGENCE
   Run same scope through conservative (temp 0.3) and aggressive
   (temp 0.8) passes, surface delta as risk signals.
   ══════════════════════════════════════════════════════════════════ */

const QUOTE_SYSTEM_PROMPT = `You are an M&E quantity estimator producing a cost estimate from a scope description.
For each line item, provide: description, quantity, unit, unit_rate, value.
Group by system (mechanical, electrical, insulation, etc.).
Include: materials, labour, prelims as separate sections.
Output as JSON:
{
  "line_items": [{ "system": "", "description": "", "quantity": 0, "unit": "", "unit_rate": 0, "value": 0 }],
  "subtotal_materials": 0,
  "subtotal_labour": 0,
  "subtotal_prelims": 0,
  "total": 0
}`;

async function runDualModelQuote({ scopeDescription, kbPrompt, documents }) {
  const systemPrompt = (kbPrompt ? kbPrompt + '\n\n' : '') + QUOTE_SYSTEM_PROMPT;

  // Run conservative and aggressive in parallel
  const [conservative, aggressive] = await Promise.all([
    callAI({
      systemPrompt: systemPrompt + '\n\nYou are a CONSERVATIVE estimator. When uncertain, use the higher cost assumption. Include adequate contingency. Better to overestimate than underestimate.',
      userPrompt: scopeDescription,
      documents: documents || [],
      maxTokens: 800,
      model: 'claude-sonnet-4-6',
    }),
    callAI({
      systemPrompt: systemPrompt + '\n\nYou are an OPTIMISTIC estimator. When uncertain, use the lower cost assumption. Assume efficient installation and competitive pricing. Minimise contingency.',
      userPrompt: scopeDescription,
      documents: documents || [],
      maxTokens: 800,
      model: 'claude-sonnet-4-6',
    }),
  ]);

  // Analyse divergence
  const flags = analyseDivergence(conservative.data, aggressive.data);

  return {
    conservative: conservative.data,
    aggressive: aggressive.data,
    flags,
    usage: {
      conservative: conservative.usage,
      aggressive: aggressive.usage,
      total_tokens: conservative.usage.total_tokens + aggressive.usage.total_tokens,
    },
  };
}

function analyseDivergence(quoteA, quoteB) {
  const flags = [];
  const itemsA = quoteA?.line_items || [];
  const itemsB = quoteB?.line_items || [];

  itemsA.forEach((itemA, i) => {
    const itemB = itemsB[i];
    if (!itemB || !itemA.value || !itemB.value) return;

    const delta = Math.abs(itemA.value - itemB.value);
    const threshold = Math.min(itemA.value, itemB.value) * 0.15;

    if (delta > threshold) {
      flags.push({
        line_item: itemA.description,
        conservative: itemA.value,
        aggressive: itemB.value,
        delta,
        delta_percent: parseFloat((delta / Math.min(itemA.value, itemB.value) * 100).toFixed(1)),
      });
    }
  });

  // Also flag total divergence
  const totalA = quoteA?.total || 0;
  const totalB = quoteB?.total || 0;
  if (totalA && totalB) {
    const totalDelta = Math.abs(totalA - totalB);
    const totalPct = parseFloat((totalDelta / Math.min(totalA, totalB) * 100).toFixed(1));
    flags.push({
      line_item: 'TOTAL',
      conservative: totalA,
      aggressive: totalB,
      delta: totalDelta,
      delta_percent: totalPct,
    });
  }

  return flags;
}

/* ══════════════════════════════════════════════════════════════════
   FULL PIPELINE — Analysis + Generation + Critic
   ══════════════════════════════════════════════════════════════════ */

async function runFullPipeline({ documents, journalEntries, userRequest, generationType, kbPrompt }) {
  // Phase 1: Analysis + Generation
  const result = await runAnalysisPipeline({ documents, journalEntries, userRequest, generationType, kbPrompt });

  // Phase 2: Critic pass
  const critic = await runCriticPass({
    aiOutput: result.output,
    sourceAnalysis: result.analysis,
    outputType: generationType,
  });

  return {
    ...result,
    critic: {
      passed: critic.passed,
      issues: critic.issues || [],
      confidence: critic.confidence || 'medium',
    },
    usage: {
      ...result.usage,
      critic: critic.usage,
      total_tokens: result.usage.total_tokens + (critic.usage?.total_tokens || 0),
    },
  };
}

module.exports = {
  runAnalysisPipeline,
  runCriticPass,
  runDualModelQuote,
  runFullPipeline,
  analyseDivergence,
};
