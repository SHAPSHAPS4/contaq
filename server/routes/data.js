// ═══════════════════════════════════════════════════════════════
// CONTRAQ — Data API Routes
// CRUD endpoints for all frontend data, backed by Supabase
// Every route requires auth and scopes queries to req.orgId
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const { requireAuth, requireActiveTrial } = require('../middleware/auth');
const db = require('../db/queries');

// All data routes require authentication + active trial
router.use(requireAuth);
router.use(requireActiveTrial);

// ─── DASHBOARD ──────────────────────────────────────────────

router.get('/dashboard', async (req, res) => {
  try {
    const [stats, activity] = await Promise.all([
      db.getDashboardStats(req.orgId),
      db.getActivityLog(req.orgId, 10)
    ]);
    res.json({ stats, activity });
  } catch (err) {
    console.error('[Data API] Dashboard error:', err.message);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// ─── PROJECTS ───────────────────────────────────────────────

router.get('/projects', async (req, res) => {
  try {
    const data = await db.getProjects(req.orgId, req.query);
    res.json(data);
  } catch (err) {
    console.error('[Data API] Get projects error:', err.message);
    res.status(500).json({ error: 'Failed to load projects' });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const data = await db.createProject(req.orgId, req.body);
    db.logActivity(req.orgId, {
      userId: req.user.id,
      action: 'created',
      entityType: 'project',
      entityId: data.id,
      description: `Created project: ${data.name || data.id}`
    });
    res.json(data);
  } catch (err) {
    console.error('[Data API] Create project error:', err.message);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.get('/projects/:id', async (req, res) => {
  try {
    const data = await db.getProject(req.orgId, req.params.id);
    res.json(data);
  } catch (err) {
    console.error('[Data API] Get project error:', err.message);
    res.status(500).json({ error: 'Failed to load project' });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const data = await db.updateProject(req.orgId, req.params.id, req.body);
    db.logActivity(req.orgId, {
      userId: req.user.id,
      action: 'updated',
      entityType: 'project',
      entityId: req.params.id,
      description: `Updated project: ${data.name || req.params.id}`
    });
    res.json(data);
  } catch (err) {
    console.error('[Data API] Update project error:', err.message);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// ─── QUOTES ─────────────────────────────────────────────────

router.get('/quotes', async (req, res) => {
  try {
    const data = await db.getQuotes(req.orgId, req.query);
    res.json(data);
  } catch (err) {
    console.error('[Data API] Get quotes error:', err.message);
    res.status(500).json({ error: 'Failed to load quotes' });
  }
});

router.post('/quotes', async (req, res) => {
  try {
    const data = await db.createQuote(req.orgId, req.body);
    db.logActivity(req.orgId, {
      userId: req.user.id,
      action: 'created',
      entityType: 'quote',
      entityId: data.id,
      description: `Created quote: ${data.reference || data.id}`
    });
    res.json(data);
  } catch (err) {
    console.error('[Data API] Create quote error:', err.message);
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

router.put('/quotes/:id', async (req, res) => {
  try {
    const data = await db.updateQuote(req.orgId, req.params.id, req.body);
    db.logActivity(req.orgId, {
      userId: req.user.id,
      action: 'updated',
      entityType: 'quote',
      entityId: req.params.id,
      description: `Updated quote: ${data.reference || req.params.id}`
    });
    res.json(data);
  } catch (err) {
    console.error('[Data API] Update quote error:', err.message);
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

// ─── QUOTE ITEMS ────────────────────────────────────────────

router.get('/quotes/:id/items', async (req, res) => {
  try {
    const data = await db.getQuoteItems(req.orgId, req.params.id);
    res.json(data);
  } catch (err) {
    console.error('[Data API] Get quote items error:', err.message);
    res.status(500).json({ error: 'Failed to load quote items' });
  }
});

router.post('/quotes/:id/items', async (req, res) => {
  try {
    const data = await db.insertQuoteItems(req.orgId, req.params.id, req.body.items);
    db.logActivity(req.orgId, {
      userId: req.user.id,
      action: 'created',
      entityType: 'quote_items',
      entityId: req.params.id,
      description: `Added ${req.body.items.length} items to quote ${req.params.id}`
    });
    res.json(data);
  } catch (err) {
    console.error('[Data API] Insert quote items error:', err.message);
    res.status(500).json({ error: 'Failed to insert quote items' });
  }
});

// ─── INVOICES ───────────────────────────────────────────────

router.get('/invoices', async (req, res) => {
  try {
    const data = await db.getInvoices(req.orgId, req.query);
    res.json(data);
  } catch (err) {
    console.error('[Data API] Get invoices error:', err.message);
    res.status(500).json({ error: 'Failed to load invoices' });
  }
});

router.post('/invoices', async (req, res) => {
  try {
    const data = await db.createInvoice(req.orgId, req.body);
    db.logActivity(req.orgId, {
      userId: req.user.id,
      action: 'created',
      entityType: 'invoice',
      entityId: data.id,
      description: `Created invoice: ${data.reference || data.id}`
    });
    res.json(data);
  } catch (err) {
    console.error('[Data API] Create invoice error:', err.message);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

router.put('/invoices/:id', async (req, res) => {
  try {
    const data = await db.updateInvoice(req.orgId, req.params.id, req.body);
    db.logActivity(req.orgId, {
      userId: req.user.id,
      action: 'updated',
      entityType: 'invoice',
      entityId: req.params.id,
      description: `Updated invoice: ${data.reference || req.params.id}`
    });
    res.json(data);
  } catch (err) {
    console.error('[Data API] Update invoice error:', err.message);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// ─── ENGINEERS ──────────────────────────────────────────────

router.get('/engineers', async (req, res) => {
  try {
    const data = await db.getEngineers(req.orgId);
    res.json(data);
  } catch (err) {
    console.error('[Data API] Get engineers error:', err.message);
    res.status(500).json({ error: 'Failed to load engineers' });
  }
});

router.post('/engineers', async (req, res) => {
  try {
    const data = await db.createEngineer(req.orgId, req.body);
    db.logActivity(req.orgId, {
      userId: req.user.id,
      action: 'created',
      entityType: 'engineer',
      entityId: data.id,
      description: `Added engineer: ${data.name || data.id}`
    });
    res.json(data);
  } catch (err) {
    console.error('[Data API] Create engineer error:', err.message);
    res.status(500).json({ error: 'Failed to create engineer' });
  }
});

// ─── CLIENTS ────────────────────────────────────────────────

router.get('/clients', async (req, res) => {
  try {
    const data = await db.getClients(req.orgId);
    res.json(data);
  } catch (err) {
    console.error('[Data API] Get clients error:', err.message);
    res.status(500).json({ error: 'Failed to load clients' });
  }
});

router.post('/clients', async (req, res) => {
  try {
    const data = await db.createClient(req.orgId, req.body);
    db.logActivity(req.orgId, {
      userId: req.user.id,
      action: 'created',
      entityType: 'client',
      entityId: data.id,
      description: `Added client: ${data.name || data.id}`
    });
    res.json(data);
  } catch (err) {
    console.error('[Data API] Create client error:', err.message);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// ─── SUPPLIERS ──────────────────────────────────────────────

router.get('/suppliers', async (req, res) => {
  try {
    const data = await db.getSuppliers(req.orgId);
    res.json(data);
  } catch (err) {
    console.error('[Data API] Get suppliers error:', err.message);
    res.status(500).json({ error: 'Failed to load suppliers' });
  }
});

// ─── JOURNAL ────────────────────────────────────────────────

router.get('/journal', async (req, res) => {
  try {
    const data = await db.getJournalEntries(req.orgId, req.query);
    res.json(data);
  } catch (err) {
    console.error('[Data API] Get journal error:', err.message);
    res.status(500).json({ error: 'Failed to load journal entries' });
  }
});

router.post('/journal', async (req, res) => {
  try {
    const data = await db.createJournalEntry(req.orgId, req.body);
    db.logActivity(req.orgId, {
      userId: req.user.id,
      action: 'created',
      entityType: 'journal_entry',
      entityId: data.id,
      description: `Added journal entry: ${data.title || data.id}`
    });
    res.json(data);
  } catch (err) {
    console.error('[Data API] Create journal entry error:', err.message);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

// ─── SCHEDULE ───────────────────────────────────────────────

router.get('/schedule', async (req, res) => {
  try {
    const data = await db.getScheduleEvents(req.orgId, req.query);
    res.json(data);
  } catch (err) {
    console.error('[Data API] Get schedule error:', err.message);
    res.status(500).json({ error: 'Failed to load schedule' });
  }
});

// ─── PRICEBOOK ──────────────────────────────────────────────

router.get('/pricebook', async (req, res) => {
  try {
    const data = await db.getPricebookItems(req.orgId, req.query);
    res.json(data);
  } catch (err) {
    console.error('[Data API] Get pricebook error:', err.message);
    res.status(500).json({ error: 'Failed to load pricebook' });
  }
});

// ─── EXTRACTIONS ────────────────────────────────────────────

router.get('/extractions', async (req, res) => {
  try {
    const data = await db.getExtractions(req.orgId, req.query);
    res.json(data);
  } catch (err) {
    console.error('[Data API] Get extractions error:', err.message);
    res.status(500).json({ error: 'Failed to load extractions' });
  }
});

router.post('/extractions', async (req, res) => {
  try {
    const data = await db.saveExtraction(req.orgId, req.body);
    db.logActivity(req.orgId, {
      userId: req.user.id,
      action: 'created',
      entityType: 'extraction',
      entityId: data.id,
      description: `Saved AI extraction (${req.body.stage || 'unknown'} stage)`
    });
    res.json(data);
  } catch (err) {
    console.error('[Data API] Save extraction error:', err.message);
    res.status(500).json({ error: 'Failed to save extraction' });
  }
});

// ─── LEARNED RULES ──────────────────────────────────────────

router.get('/rules', async (req, res) => {
  try {
    const data = await db.getLearnedRules(req.orgId);
    res.json(data);
  } catch (err) {
    console.error('[Data API] Get rules error:', err.message);
    res.status(500).json({ error: 'Failed to load learned rules' });
  }
});

router.post('/rules', async (req, res) => {
  try {
    const data = await db.saveLearnedRule(req.orgId, req.body);
    db.logActivity(req.orgId, {
      userId: req.user.id,
      action: 'created',
      entityType: 'learned_rule',
      entityId: data.id,
      description: `Saved learned rule: ${req.body.rule_type || 'custom'}`
    });
    res.json(data);
  } catch (err) {
    console.error('[Data API] Save rule error:', err.message);
    res.status(500).json({ error: 'Failed to save learned rule' });
  }
});

// ─── ACTIVITY LOG ───────────────────────────────────────────

router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const data = await db.getActivityLog(req.orgId, limit);
    res.json(data);
  } catch (err) {
    console.error('[Data API] Get activity error:', err.message);
    res.status(500).json({ error: 'Failed to load activity log' });
  }
});

module.exports = router;
