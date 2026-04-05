/**
 * Training Hub DB Service — Supabase-backed replacement for file-based storage.
 * Falls back to the file-based service if Supabase is not available.
 */

const { createClient } = require('@supabase/supabase-js');

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function isAvailable() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/* ── Extraction Logging ─────────────────────────────────── */

async function logExtraction(data) {
  const sb = getClient();
  if (!sb) return require('./training-hub').logExtraction(data); // file fallback

  const { data: entry, error } = await sb.from('training_extractions').insert({
    org_id: data.org_id || 'demo-org-id',
    user_id: data.user_id || null,
    document_name: data.document_name || 'Unknown',
    extraction_type: data.extraction_type || 'drawing',
    model_used: data.model_used || 'claude-sonnet-4-6',
    prompt_version: data.prompt_version || 1,
    input_tokens: data.input_tokens || 0,
    output_tokens: data.output_tokens || 0,
    validation_grade: data.validation_grade || null,
    validation_score: data.validation_score || null,
    raw_result: data.raw_result || {},
    item_count: data.item_count || 0,
    review_status: 'pending',
  }).select().single();

  if (error) {
    console.error('[Training DB] logExtraction error:', error.message);
    return require('./training-hub').logExtraction(data); // file fallback
  }
  return entry;
}

async function getExtractions(filters = {}) {
  const sb = getClient();
  if (!sb) return require('./training-hub').getExtractions(filters);

  let query = sb.from('training_extractions').select('*').order('created_at', { ascending: false });
  if (filters.status) query = query.eq('review_status', filters.status);
  if (filters.type) query = query.eq('extraction_type', filters.type);
  if (filters.org_id) query = query.eq('org_id', filters.org_id);

  const { data, error } = await query.limit(100);
  if (error) {
    console.error('[Training DB] getExtractions error:', error.message);
    return require('./training-hub').getExtractions(filters);
  }
  return data || [];
}

async function getExtraction(id) {
  const sb = getClient();
  if (!sb) return require('./training-hub').getExtraction(id);

  const { data, error } = await sb.from('training_extractions').select('*').eq('id', id).maybeSingle();
  if (error) return null;
  return data;
}

async function updateExtractionStatus(id, status, reviewerId) {
  const sb = getClient();
  if (!sb) return require('./training-hub').updateExtractionStatus(id, status, reviewerId);

  const update = { review_status: status };
  if (reviewerId) update.reviewed_by = reviewerId;
  if (status === 'reviewed') update.reviewed_at = new Date().toISOString();

  const { data, error } = await sb.from('training_extractions').update(update).eq('id', id).select().maybeSingle();
  if (error) console.error('[Training DB] updateExtractionStatus error:', error.message);
  return data;
}

/* ── Golden Records ─────────────────────────────────────── */

async function createGoldenRecord(data) {
  const sb = getClient();
  if (!sb) return require('./training-hub').createGoldenRecord(data);

  const feedback = data.feedback || [];
  let correct = 0, wrong = 0, hallucinations = 0, missed = 0;
  feedback.forEach(f => {
    if (f.tag === 'correct' || f.tag === 'rule_applied') correct++;
    else if (f.tag === 'wrong_value' || f.tag === 'rule_ignored') wrong++;
    else if (f.tag === 'hallucination') hallucinations++;
    else if (f.tag === 'missed_item') missed++;
  });
  const total = correct + wrong + hallucinations + missed;

  const { data: record, error } = await sb.from('training_golden_records').insert({
    extraction_id: data.extraction_id || null,
    org_id: data.org_id || 'demo-org-id',
    document_name: data.document_name,
    extraction_type: data.extraction_type,
    corrected_items: data.corrected_items || [],
    original_items: data.original_items || [],
    feedback: feedback,
    item_count: total,
    correct_count: correct,
    wrong_count: wrong,
    hallucination_count: hallucinations,
    missed_count: missed,
    accuracy_pct: total > 0 ? Math.round((correct / total) * 100 * 100) / 100 : 0,
    reviewed_by: data.reviewed_by || null,
  }).select().single();

  if (error) {
    console.error('[Training DB] createGoldenRecord error:', error.message);
    return require('./training-hub').createGoldenRecord(data);
  }

  // Update extraction status
  if (data.extraction_id) {
    await updateExtractionStatus(data.extraction_id, 'reviewed', data.reviewed_by).catch(() => {});
  }

  return record;
}

async function getGoldenRecords(orgId, limit) {
  const sb = getClient();
  if (!sb) return require('./training-hub').getGoldenRecords(limit);

  let query = sb.from('training_golden_records').select('*').order('created_at', { ascending: false });
  if (orgId) query = query.eq('org_id', orgId);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

/* ── Field-Level Feedback ──────────────────────────────── */

async function saveFeedback(goldenRecordId, orgId, feedbackItems) {
  const sb = getClient();
  if (!sb) return require('./training-hub').saveFeedback(goldenRecordId, feedbackItems);

  const rows = feedbackItems.map(item => ({
    golden_record_id: goldenRecordId,
    org_id: orgId,
    item_index: item.item_index,
    field_name: item.field_name || 'description',
    original_value: item.original_value,
    corrected_value: item.corrected_value,
    tag: item.tag,
    comment: item.comment || '',
    rule_ref: item.rule_ref || '',
    severity: item.severity || 'medium',
  }));

  const { error } = await sb.from('training_feedback').insert(rows);
  if (error) console.error('[Training DB] saveFeedback error:', error.message);
  return rows.length;
}

/* ── Metrics ───────────────────────────────────────────── */

async function getMetrics(orgId) {
  const sb = getClient();
  if (!sb) return require('./training-hub').getMetrics();

  // Aggregate from golden records
  const { data: records } = await sb.from('training_golden_records').select('correct_count, wrong_count, hallucination_count, missed_count, accuracy_pct, created_at')
    .eq('org_id', orgId).order('created_at', { ascending: false }).limit(500);

  const totals = { total_reviews: 0, total_items: 0, correct: 0, wrong: 0, hallucinations: 0, missed: 0 };
  const weeklyMap = {};

  (records || []).forEach(r => {
    totals.total_reviews++;
    totals.correct += r.correct_count || 0;
    totals.wrong += r.wrong_count || 0;
    totals.hallucinations += r.hallucination_count || 0;
    totals.missed += r.missed_count || 0;
    totals.total_items += (r.correct_count || 0) + (r.wrong_count || 0) + (r.hallucination_count || 0) + (r.missed_count || 0);

    const weekKey = r.created_at ? r.created_at.slice(0, 10) : 'unknown';
    if (!weeklyMap[weekKey]) weeklyMap[weekKey] = { date: weekKey, reviews: 0, items: 0, correct: 0, wrong: 0, hallucinations: 0, missed: 0 };
    weeklyMap[weekKey].reviews++;
    weeklyMap[weekKey].correct += r.correct_count || 0;
    weeklyMap[weekKey].wrong += r.wrong_count || 0;
    weeklyMap[weekKey].hallucinations += r.hallucination_count || 0;
    weeklyMap[weekKey].missed += r.missed_count || 0;
    weeklyMap[weekKey].items += (r.correct_count || 0) + (r.wrong_count || 0) + (r.hallucination_count || 0) + (r.missed_count || 0);
  });

  const totalTagged = totals.correct + totals.wrong + totals.hallucinations + totals.missed;
  const pending = await sb.from('training_extractions').select('id', { count: 'exact', head: true }).eq('org_id', orgId).eq('review_status', 'pending');

  return {
    totals,
    rates: {
      accuracy_pct: totalTagged > 0 ? Math.round((totals.correct / totalTagged) * 100 * 10) / 10 : 0,
      hallucination_pct: totalTagged > 0 ? Math.round((totals.hallucinations / totalTagged) * 100 * 10) / 10 : 0,
      wrong_pct: totalTagged > 0 ? Math.round((totals.wrong / totalTagged) * 100 * 10) / 10 : 0,
    },
    weekly: Object.values(weeklyMap).sort((a, b) => a.date.localeCompare(b.date)).slice(-12),
    pending_reviews: pending.count || 0,
    golden_records: (records || []).length,
  };
}

/* ── Export ───────────────────────────────────────────── */

async function exportTrainingData(orgId) {
  const sb = getClient();
  if (!sb) return require('./training-hub').exportTrainingData();

  const [records, feedback] = await Promise.all([
    sb.from('training_golden_records').select('*').eq('org_id', orgId),
    sb.from('training_feedback').select('*').eq('org_id', orgId),
  ]);

  return {
    exported_at: new Date().toISOString(),
    golden_records: records.data || [],
    field_feedback: feedback.data || [],
    metrics: await getMetrics(orgId),
  };
}

module.exports = {
  isAvailable,
  logExtraction,
  getExtractions,
  getExtraction,
  updateExtractionStatus,
  createGoldenRecord,
  getGoldenRecords,
  saveFeedback,
  getMetrics,
  exportTrainingData,
};
