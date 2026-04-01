/**
 * AI Training Hub — stores extractions, golden records, feedback, and metrics.
 * File-based storage (mirrors other services), Supabase-ready schema.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data/training');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const EXTRACTIONS_FILE = path.join(DATA_DIR, 'extractions.json');
const GOLDEN_FILE = path.join(DATA_DIR, 'golden-records.json');
const FEEDBACK_FILE = path.join(DATA_DIR, 'field-feedback.json');
const METRICS_FILE = path.join(DATA_DIR, 'metrics.json');
const PROMPTS_FILE = path.join(DATA_DIR, 'prompt-versions.json');

function readJSON(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
  catch { return fallback; }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* ── Extraction Logging ─────────────────────────────────── */

function logExtraction(data) {
  const extractions = readJSON(EXTRACTIONS_FILE, []);
  const entry = {
    id: 'ext-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    org_id: data.org_id || 'demo-org-id',
    user_id: data.user_id || null,
    document_name: data.document_name || 'Unknown',
    extraction_type: data.extraction_type || 'unknown',
    model_used: data.model_used || 'claude-sonnet-4-6',
    prompt_version: data.prompt_version || 1,
    input_tokens: data.input_tokens || 0,
    output_tokens: data.output_tokens || 0,
    validation_grade: data.validation_grade || null,
    validation_score: data.validation_score || null,
    raw_result: data.raw_result || {},
    item_count: data.item_count || 0,
    review_status: 'pending',
    reviewed_by: null,
    reviewed_at: null,
    created_at: new Date().toISOString(),
  };
  extractions.push(entry);
  writeJSON(EXTRACTIONS_FILE, extractions);
  return entry;
}

function getExtractions(filters = {}) {
  const all = readJSON(EXTRACTIONS_FILE, []);
  let filtered = all;
  if (filters.status) filtered = filtered.filter(e => e.review_status === filters.status);
  if (filters.type) filtered = filtered.filter(e => e.extraction_type === filters.type);
  if (filters.org_id) filtered = filtered.filter(e => e.org_id === filters.org_id);
  return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getExtraction(id) {
  const all = readJSON(EXTRACTIONS_FILE, []);
  return all.find(e => e.id === id) || null;
}

function updateExtractionStatus(id, status, reviewerId) {
  const all = readJSON(EXTRACTIONS_FILE, []);
  const idx = all.findIndex(e => e.id === id);
  if (idx < 0) return null;
  all[idx].review_status = status;
  if (reviewerId) all[idx].reviewed_by = reviewerId;
  if (status === 'reviewed') all[idx].reviewed_at = new Date().toISOString();
  writeJSON(EXTRACTIONS_FILE, all);
  return all[idx];
}

/* ── Golden Records ─────────────────────────────────────── */

function createGoldenRecord(data) {
  const records = readJSON(GOLDEN_FILE, []);
  const items = data.corrected_items || [];
  const original = data.original_items || [];

  let correct = 0, wrong = 0, hallucinations = 0, missed = 0;
  (data.feedback || []).forEach(f => {
    if (f.tag === 'correct' || f.tag === 'rule_applied') correct++;
    else if (f.tag === 'wrong_value' || f.tag === 'rule_ignored') wrong++;
    else if (f.tag === 'hallucination') hallucinations++;
    else if (f.tag === 'missed_item') missed++;
  });
  const total = correct + wrong + hallucinations + missed;

  const record = {
    id: 'gr-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    extraction_id: data.extraction_id,
    org_id: data.org_id || 'demo-org-id',
    document_name: data.document_name,
    extraction_type: data.extraction_type,
    corrected_items: items,
    original_items: original,
    feedback: data.feedback || [],
    item_count: total,
    correct_count: correct,
    wrong_count: wrong,
    hallucination_count: hallucinations,
    missed_count: missed,
    accuracy_pct: total > 0 ? Math.round((correct / total) * 100 * 100) / 100 : 0,
    reviewed_by: data.reviewed_by,
    created_at: new Date().toISOString(),
  };

  records.push(record);
  writeJSON(GOLDEN_FILE, records);

  // Update extraction status
  updateExtractionStatus(data.extraction_id, 'reviewed', data.reviewed_by);

  // Update rolling metrics
  updateMetrics(record);

  return record;
}

function getGoldenRecords(limit = 50) {
  const all = readJSON(GOLDEN_FILE, []);
  return all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit);
}

/* ── Field-Level Feedback ──────────────────────────────── */

function saveFeedback(goldenRecordId, feedbackItems) {
  const all = readJSON(FEEDBACK_FILE, []);
  feedbackItems.forEach(item => {
    all.push({
      id: 'fb-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      golden_record_id: goldenRecordId,
      item_index: item.item_index,
      field_name: item.field_name || 'description',
      original_value: item.original_value,
      corrected_value: item.corrected_value,
      tag: item.tag,
      comment: item.comment || '',
      rule_ref: item.rule_ref || '',
      severity: item.severity || 'medium',
      created_at: new Date().toISOString(),
    });
  });
  writeJSON(FEEDBACK_FILE, all);
  return all.length;
}

function getFeedbackStats() {
  const all = readJSON(FEEDBACK_FILE, []);
  const tags = {};
  all.forEach(f => { tags[f.tag] = (tags[f.tag] || 0) + 1; });
  return { total: all.length, by_tag: tags };
}

/* ── Prompt Versions ───────────────────────────────────── */

function getPromptVersions(extractionType) {
  const all = readJSON(PROMPTS_FILE, []);
  if (extractionType) return all.filter(p => p.extraction_type === extractionType);
  return all;
}

function savePromptVersion(data) {
  const all = readJSON(PROMPTS_FILE, []);

  // Deactivate current active version for this type
  all.forEach(p => {
    if (p.extraction_type === data.extraction_type && p.is_active) p.is_active = false;
  });

  const version = {
    id: all.length + 1,
    version_number: all.filter(p => p.extraction_type === data.extraction_type).length + 1,
    extraction_type: data.extraction_type,
    prompt_text: data.prompt_text,
    change_note: data.change_note || '',
    performance: data.performance || null,
    is_active: true,
    created_by: data.created_by,
    created_at: new Date().toISOString(),
  };

  all.push(version);
  writeJSON(PROMPTS_FILE, all);
  return version;
}

function rollbackPrompt(extractionType, versionNumber) {
  const all = readJSON(PROMPTS_FILE, []);
  all.forEach(p => {
    if (p.extraction_type === extractionType) {
      p.is_active = (p.version_number === versionNumber);
    }
  });
  writeJSON(PROMPTS_FILE, all);
  return all.find(p => p.extraction_type === extractionType && p.is_active);
}

/* ── Metrics ───────────────────────────────────────────── */

function updateMetrics(goldenRecord) {
  const metrics = readJSON(METRICS_FILE, { weekly: [], totals: { total_reviews: 0, total_items: 0, correct: 0, wrong: 0, hallucinations: 0, missed: 0 } });

  metrics.totals.total_reviews++;
  metrics.totals.total_items += goldenRecord.item_count;
  metrics.totals.correct += goldenRecord.correct_count;
  metrics.totals.wrong += goldenRecord.wrong_count;
  metrics.totals.hallucinations += goldenRecord.hallucination_count;
  metrics.totals.missed += goldenRecord.missed_count;

  // Weekly rollup
  const weekKey = new Date().toISOString().split('T')[0];
  let week = metrics.weekly.find(w => w.date === weekKey);
  if (!week) {
    week = { date: weekKey, reviews: 0, items: 0, correct: 0, wrong: 0, hallucinations: 0, missed: 0 };
    metrics.weekly.push(week);
  }
  week.reviews++;
  week.items += goldenRecord.item_count;
  week.correct += goldenRecord.correct_count;
  week.wrong += goldenRecord.wrong_count;
  week.hallucinations += goldenRecord.hallucination_count;
  week.missed += goldenRecord.missed_count;

  // Keep last 90 days
  const cutoff = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
  metrics.weekly = metrics.weekly.filter(w => w.date >= cutoff);

  writeJSON(METRICS_FILE, metrics);
  return metrics;
}

function getMetrics() {
  const metrics = readJSON(METRICS_FILE, { weekly: [], totals: { total_reviews: 0, total_items: 0, correct: 0, wrong: 0, hallucinations: 0, missed: 0 } });
  const t = metrics.totals;
  const totalTagged = t.correct + t.wrong + t.hallucinations + t.missed;

  return {
    totals: t,
    rates: {
      accuracy_pct: totalTagged > 0 ? Math.round((t.correct / totalTagged) * 100 * 10) / 10 : 0,
      hallucination_pct: totalTagged > 0 ? Math.round((t.hallucinations / totalTagged) * 100 * 10) / 10 : 0,
      wrong_pct: totalTagged > 0 ? Math.round((t.wrong / totalTagged) * 100 * 10) / 10 : 0,
    },
    weekly: metrics.weekly.slice(-12),
    pending_reviews: getExtractions({ status: 'pending' }).length,
    golden_records: readJSON(GOLDEN_FILE, []).length,
    active_rules: (() => { try { const lr = JSON.parse(fs.readFileSync(path.join(__dirname, '../kb/sections/learning/learned_rules.json'), 'utf-8')); return lr.rules ? lr.rules.length : 0; } catch { return 0; } })(),
    prompt_versions: readJSON(PROMPTS_FILE, []).filter(p => p.is_active).length,
  };
}

/* ── Training Data Export ──────────────────────────────── */

function exportTrainingData() {
  return {
    exported_at: new Date().toISOString(),
    golden_records: readJSON(GOLDEN_FILE, []),
    field_feedback: readJSON(FEEDBACK_FILE, []),
    metrics: getMetrics(),
    prompt_versions: readJSON(PROMPTS_FILE, []),
  };
}

module.exports = {
  logExtraction,
  getExtractions,
  getExtraction,
  updateExtractionStatus,
  createGoldenRecord,
  getGoldenRecords,
  saveFeedback,
  getFeedbackStats,
  getPromptVersions,
  savePromptVersion,
  rollbackPrompt,
  getMetrics,
  exportTrainingData,
};
