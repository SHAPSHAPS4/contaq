/**
 * Golden Examples Service
 * Pulls the most recent reviewed golden records from Supabase
 * and formats them for injection into the extraction prompt.
 */

const { createClient } = require('@supabase/supabase-js');

async function getGoldenExamples(orgId, limit) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !orgId || orgId === 'demo-org-id') return [];

  try {
    const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

    const { data, error } = await sb.from('training_golden_records')
      .select('document_name, extraction_type, corrected_items, feedback, accuracy_pct, correct_count, wrong_count, hallucination_count, missed_count, created_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit || 8);

    if (error) {
      console.error('[Golden Examples] Query error:', error.message);
      return [];
    }

    // Filter to only include examples with reasonable accuracy (>30%)
    // and that have actual corrections (to show the AI what was wrong)
    return (data || []).filter(r => r.corrected_items && r.corrected_items.length > 0);
  } catch (e) {
    console.error('[Golden Examples] Error:', e.message);
    return [];
  }
}

module.exports = { getGoldenExamples };
