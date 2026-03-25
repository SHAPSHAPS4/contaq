// ═══════════════════════════════════════════════════════════════
// CONTRAQ — Database Queries
// Clean abstraction layer over Supabase for all CRUD operations
// Every query is scoped to org_id for tenant isolation
// ═══════════════════════════════════════════════════════════════

const { supabaseAdmin } = require('./supabase');

// ─── Helper: check DB is available ──────────────────────────
function dbReady() {
  return !!supabaseAdmin;
}

// ─── ORGANIZATIONS ──────────────────────────────────────────

async function createOrganization({ name, slug, plan, trade }) {
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .insert({ name, slug, plan: plan || 'starter', trade: trade || 'insulation' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getOrganization(orgId) {
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single();
  if (error) throw error;
  return data;
}

// ─── USERS ──────────────────────────────────────────────────

async function createUser({ orgId, authId, email, name, role }) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({ org_id: orgId, auth_id: authId, email, name, role: role || 'user' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getUserByAuthId(authId) {
  // Get user
  const { data: user, error: userErr } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('auth_id', authId)
    .maybeSingle();
  if (userErr) throw userErr;
  if (!user) return null;
  // Get org separately (avoids join issues)
  const { data: org, error: orgErr } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .eq('id', user.org_id)
    .maybeSingle();
  if (orgErr) throw orgErr;
  user.organizations = org;
  return user;
}

async function getUsersByOrg(orgId) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at');
  if (error) throw error;
  return data;
}

// ─── PROJECTS ───────────────────────────────────────────────

async function getProjects(orgId, { status, limit } = {}) {
  let query = supabaseAdmin.from('projects').select('*, clients(name)').eq('org_id', orgId);
  if (status) query = query.eq('status', status);
  query = query.order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function getProject(orgId, projectId) {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*, clients(name, contact, email)')
    .eq('org_id', orgId)
    .eq('id', projectId)
    .single();
  if (error) throw error;
  return data;
}

async function createProject(orgId, fields) {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .insert({ org_id: orgId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function updateProject(orgId, projectId, fields) {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .update(fields)
    .eq('org_id', orgId)
    .eq('id', projectId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── QUOTES ─────────────────────────────────────────────────

async function getQuotes(orgId, { status, limit } = {}) {
  let query = supabaseAdmin.from('quotes').select('*, clients(name), projects(name)').eq('org_id', orgId);
  if (status) query = query.eq('status', status);
  query = query.order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function createQuote(orgId, fields) {
  const { data, error } = await supabaseAdmin
    .from('quotes')
    .insert({ org_id: orgId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function updateQuote(orgId, quoteId, fields) {
  const { data, error } = await supabaseAdmin
    .from('quotes')
    .update(fields)
    .eq('org_id', orgId)
    .eq('id', quoteId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── QUOTE ITEMS ────────────────────────────────────────────

async function getQuoteItems(orgId, quoteId) {
  const { data, error } = await supabaseAdmin
    .from('quote_items')
    .select('*')
    .eq('org_id', orgId)
    .eq('quote_id', quoteId)
    .order('sort_order');
  if (error) throw error;
  return data;
}

async function insertQuoteItems(orgId, quoteId, items) {
  const rows = items.map((item, i) => ({
    org_id: orgId,
    quote_id: quoteId,
    description: item.description,
    trade: item.trade,
    quantity: item.quantity || 0,
    unit: item.unit || 'nr',
    material_rate: item.material_rate || 0,
    labour_rate: item.labour_rate || 0,
    total: item.total || 0,
    confidence: item.confidence || 'high',
    source_ref: item.source_ref || null,
    spec_ref: item.spec_ref || null,
    ai_extracted: item.ai_extracted || false,
    sort_order: i
  }));
  const { data, error } = await supabaseAdmin.from('quote_items').insert(rows).select();
  if (error) throw error;
  return data;
}

// ─── EXTRACTIONS ────────────────────────────────────────────

async function saveExtraction(orgId, fields) {
  const { data, error } = await supabaseAdmin
    .from('extractions')
    .insert({ org_id: orgId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getExtractions(orgId, { quoteId, limit } = {}) {
  let query = supabaseAdmin.from('extractions').select('*').eq('org_id', orgId);
  if (quoteId) query = query.eq('quote_id', quoteId);
  query = query.order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ─── INVOICES ───────────────────────────────────────────────

async function getInvoices(orgId, { status, limit } = {}) {
  let query = supabaseAdmin.from('invoices').select('*, clients(name), projects(name)').eq('org_id', orgId);
  if (status) query = query.eq('status', status);
  query = query.order('created_at', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function createInvoice(orgId, fields) {
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .insert({ org_id: orgId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function updateInvoice(orgId, invoiceId, fields) {
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .update(fields)
    .eq('org_id', orgId)
    .eq('id', invoiceId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── ENGINEERS ──────────────────────────────────────────────

async function getEngineers(orgId) {
  const { data, error } = await supabaseAdmin
    .from('engineers')
    .select('*, certifications(*)')
    .eq('org_id', orgId)
    .order('name');
  if (error) throw error;
  return data;
}

async function createEngineer(orgId, fields) {
  const { data, error } = await supabaseAdmin
    .from('engineers')
    .insert({ org_id: orgId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── CLIENTS ────────────────────────────────────────────────

async function getClients(orgId) {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('*')
    .eq('org_id', orgId)
    .order('name');
  if (error) throw error;
  return data;
}

async function createClient(orgId, fields) {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .insert({ org_id: orgId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── SUPPLIERS ──────────────────────────────────────────────

async function getSuppliers(orgId) {
  const { data, error } = await supabaseAdmin
    .from('suppliers')
    .select('*')
    .eq('org_id', orgId)
    .order('name');
  if (error) throw error;
  return data;
}

// ─── JOURNAL ────────────────────────────────────────────────

async function getJournalEntries(orgId, { projectId, limit } = {}) {
  let query = supabaseAdmin.from('journal_entries').select('*, users(name)').eq('org_id', orgId);
  if (projectId) query = query.eq('project_id', projectId);
  query = query.order('date', { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function createJournalEntry(orgId, fields) {
  const { data, error } = await supabaseAdmin
    .from('journal_entries')
    .insert({ org_id: orgId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── SCHEDULE ───────────────────────────────────────────────

async function getScheduleEvents(orgId, { startDate, endDate } = {}) {
  let query = supabaseAdmin.from('schedule_events').select('*').eq('org_id', orgId);
  if (startDate) query = query.gte('start_date', startDate);
  if (endDate) query = query.lte('start_date', endDate);
  query = query.order('start_date');
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ─── ACTIVITY LOG ───────────────────────────────────────────

async function logActivity(orgId, { userId, action, entityType, entityId, description, metadata }) {
  const { error } = await supabaseAdmin
    .from('activity_log')
    .insert({ org_id: orgId, user_id: userId, action, entity_type: entityType, entity_id: entityId, description, metadata });
  if (error) console.error('[Activity Log]', error.message);
}

async function getActivityLog(orgId, limit = 20) {
  const { data, error } = await supabaseAdmin
    .from('activity_log')
    .select('*, users(name)')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

// ─── LEARNED RULES ──────────────────────────────────────────

async function getLearnedRules(orgId, { ruleType } = {}) {
  let query = supabaseAdmin
    .from('learned_rules')
    .select('*')
    .eq('org_id', orgId);
  if (ruleType) query = query.eq('rule_type', ruleType);
  query = query.order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function saveLearnedRule(orgId, fields) {
  const { data, error } = await supabaseAdmin
    .from('learned_rules')
    .insert({ org_id: orgId, ...fields })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function upsertLearnedRule(orgId, ruleId, fields) {
  // Check if rule exists for this org with matching trigger
  const { data: existing } = await supabaseAdmin
    .from('learned_rules')
    .select('id, occurrences')
    .eq('org_id', orgId)
    .eq('trigger_text', fields.trigger_text)
    .eq('rule_type', fields.rule_type || 'extraction')
    .maybeSingle();

  if (existing) {
    const updateFields = {
      action_text: fields.action_text,
      reason: fields.reason,
      occurrences: (existing.occurrences || 1) + 1,
      source_project: fields.source_project,
    };
    // Update example fields if provided
    if (fields.example_before) updateFields.example_before = fields.example_before;
    if (fields.example_after) updateFields.example_after = fields.example_after;
    if (fields.context_keywords) updateFields.context_keywords = fields.context_keywords;

    const { data, error } = await supabaseAdmin
      .from('learned_rules')
      .update(updateFields)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  return saveLearnedRule(orgId, fields);
}

async function deleteLearnedRule(orgId, ruleId) {
  const { error } = await supabaseAdmin
    .from('learned_rules')
    .delete()
    .eq('org_id', orgId)
    .eq('id', ruleId);
  if (error) throw error;
}

async function clearLearnedRules(orgId) {
  const { error } = await supabaseAdmin
    .from('learned_rules')
    .delete()
    .eq('org_id', orgId);
  if (error) throw error;
}

async function promoteLearnedRule(orgId, ruleId) {
  const { data, error } = await supabaseAdmin
    .from('learned_rules')
    .update({ is_promoted: true })
    .eq('org_id', orgId)
    .eq('id', ruleId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── TRADE COLLECTIVE RULES ─────────────────────────────────

async function getCollectiveRulesForTrade(trade) {
  if (!trade) return [];
  const { data, error } = await supabaseAdmin
    .from('learned_rules')
    .select('*')
    .eq('scope', 'trade-collective')
    .eq('trade', trade)
    .order('occurrences', { ascending: false });
  if (error) throw error;
  return data || [];
}

async function shareRuleToCollective(orgId, ruleId, trade) {
  // Verify the rule belongs to this org
  const { data: rule, error: fetchErr } = await supabaseAdmin
    .from('learned_rules')
    .select('*')
    .eq('org_id', orgId)
    .eq('id', ruleId)
    .single();
  if (fetchErr) throw fetchErr;
  if (!rule) throw new Error('Rule not found');
  if (rule.rule_type === 'pricing') throw new Error('Pricing rules cannot be shared — commercial sensitivity');

  // Create a collective copy (separate row, not modifying the original)
  const { data, error } = await supabaseAdmin
    .from('learned_rules')
    .insert({
      org_id: orgId,  // still tracks origin for RLS, but scope marks it as collective
      rule_type: rule.rule_type,
      trigger_text: rule.trigger_text,
      action_text: rule.action_text,
      reason: rule.reason,
      example_before: rule.example_before,
      example_after: rule.example_after,
      context_keywords: rule.context_keywords,
      occurrences: rule.occurrences,
      source_project: rule.source_project,
      scope: 'trade-collective',
      trade: trade,
      shared_by_org: orgId,
      shared_at: new Date().toISOString(),
      created_by: rule.created_by,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function autoShareToCollective(orgId, fields, trade) {
  // Check if this exact rule already exists in the collective for this trade
  const { data: existing } = await supabaseAdmin
    .from('learned_rules')
    .select('id, occurrences')
    .eq('scope', 'trade-collective')
    .eq('trade', trade)
    .eq('trigger_text', fields.trigger_text)
    .eq('rule_type', fields.rule_type || 'extraction')
    .maybeSingle();

  if (existing) {
    // Increment occurrence count — more orgs hitting the same issue = stronger signal
    const { data, error } = await supabaseAdmin
      .from('learned_rules')
      .update({
        occurrences: (existing.occurrences || 1) + 1,
        action_text: fields.action_text,
        reason: fields.reason,
        example_before: fields.example_before || undefined,
        example_after: fields.example_after || undefined,
        context_keywords: fields.context_keywords || undefined,
      })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Create new collective entry
  const { data, error } = await supabaseAdmin
    .from('learned_rules')
    .insert({
      org_id: orgId,
      rule_type: fields.rule_type || 'extraction',
      trigger_text: fields.trigger_text,
      action_text: fields.action_text,
      reason: fields.reason || '',
      example_before: fields.example_before,
      example_after: fields.example_after,
      context_keywords: fields.context_keywords,
      occurrences: 1,
      scope: 'trade-collective',
      trade: trade,
      shared_by_org: orgId,
      shared_at: new Date().toISOString(),
      created_by: fields.created_by,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function getCollectiveRuleStats(trade) {
  if (!trade) return { total: 0, contributing_orgs: 0 };
  const { data, error } = await supabaseAdmin
    .from('learned_rules')
    .select('id, shared_by_org')
    .eq('scope', 'trade-collective')
    .eq('trade', trade);
  if (error) throw error;
  const orgs = new Set((data || []).map(r => r.shared_by_org).filter(Boolean));
  return { total: (data || []).length, contributing_orgs: orgs.size };
}

async function isCollectiveLearningEnabled(orgId) {
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .select('collective_learning_enabled')
    .eq('id', orgId)
    .single();
  if (error) return true; // default to enabled if lookup fails
  return data?.collective_learning_enabled !== false;
}

async function setCollectiveLearning(orgId, enabled) {
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .update({ collective_learning_enabled: enabled })
    .eq('id', orgId)
    .select('id, collective_learning_enabled')
    .single();
  if (error) throw error;
  return data;
}

async function getLearnedRuleStats(orgId) {
  const { data, error } = await supabaseAdmin
    .from('learned_rules')
    .select('rule_type, id')
    .eq('org_id', orgId);
  if (error) throw error;
  const byType = {};
  (data || []).forEach(r => { byType[r.rule_type] = (byType[r.rule_type] || 0) + 1; });
  return { total: (data || []).length, by_type: byType };
}

// ─── PRICEBOOK ──────────────────────────────────────────────

async function getPricebookItems(orgId, { category } = {}) {
  let query = supabaseAdmin.from('pricebook_items').select('*').eq('org_id', orgId);
  if (category) query = query.eq('category', category);
  query = query.order('category').order('description');
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ─── DASHBOARD STATS ────────────────────────────────────────

async function getDashboardStats(orgId) {
  const [projects, quotes, invoices, engineers] = await Promise.all([
    supabaseAdmin.from('projects').select('id, status, value', { count: 'exact' }).eq('org_id', orgId),
    supabaseAdmin.from('quotes').select('id, status, value', { count: 'exact' }).eq('org_id', orgId),
    supabaseAdmin.from('invoices').select('id, status, gross_amount, due_date', { count: 'exact' }).eq('org_id', orgId),
    supabaseAdmin.from('engineers').select('id', { count: 'exact' }).eq('org_id', orgId).eq('status', 'active'),
  ]);

  const activeProjects = (projects.data || []).filter(p => p.status === 'active').length;
  const openQuotes = (quotes.data || []).filter(q => ['draft', 'submitted'].includes(q.status)).length;
  const wonQuotes = (quotes.data || []).filter(q => q.status === 'won').length;
  const totalQuotes = (quotes.data || []).length;
  const overdueInvoices = (invoices.data || []).filter(i => i.status === 'overdue' || (i.status === 'sent' && new Date(i.due_date) < new Date())).length;
  const pipelineValue = (quotes.data || []).filter(q => ['draft', 'submitted'].includes(q.status)).reduce((sum, q) => sum + Number(q.value || 0), 0);

  return {
    activeProjects,
    openQuotes,
    wonQuotes,
    winRate: totalQuotes > 0 ? Math.round((wonQuotes / totalQuotes) * 100) : 0,
    overdueInvoices,
    pipelineValue,
    activeEngineers: engineers.count || 0,
    totalProjects: projects.count || 0,
    totalQuotes: quotes.count || 0,
    totalInvoices: invoices.count || 0
  };
}


module.exports = {
  dbReady,
  // Organizations
  createOrganization, getOrganization,
  // Users
  createUser, getUserByAuthId, getUsersByOrg,
  // Projects
  getProjects, getProject, createProject, updateProject,
  // Quotes
  getQuotes, createQuote, updateQuote,
  getQuoteItems, insertQuoteItems,
  // Extractions
  saveExtraction, getExtractions,
  // Invoices
  getInvoices, createInvoice, updateInvoice,
  // Engineers
  getEngineers, createEngineer,
  // Clients
  getClients, createClient,
  // Suppliers
  getSuppliers,
  // Journal
  getJournalEntries, createJournalEntry,
  // Schedule
  getScheduleEvents,
  // Activity
  logActivity, getActivityLog,
  // Learned Rules
  getLearnedRules, saveLearnedRule, upsertLearnedRule,
  deleteLearnedRule, clearLearnedRules, promoteLearnedRule, getLearnedRuleStats,
  // Trade Collective
  getCollectiveRulesForTrade, shareRuleToCollective, autoShareToCollective,
  getCollectiveRuleStats, isCollectiveLearningEnabled, setCollectiveLearning,
  // Pricebook
  getPricebookItems,
  // Dashboard
  getDashboardStats
};
