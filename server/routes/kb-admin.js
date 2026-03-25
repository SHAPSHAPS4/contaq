const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { persistLearnedRules, persistPatternError, loadLearning } = require('../kb/index');

const KB_BASE = path.join(__dirname, '../kb/sections');
const L01_PATH = path.join(KB_BASE, 'learning/L01_learned_rules.json');
const L02_PATH = path.join(KB_BASE, 'learning/L02_pattern_errors.json');

function readJSON(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); }
  catch { return fallback; }
}

function writeJSON(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

// Helper: get DB module if available
let _db = null;
function getDB() {
  if (!_db) { try { _db = require('../db/queries'); } catch { _db = null; } }
  return _db && _db.dbReady() ? _db : null;
}

// GET /api/kb/rules — org-scoped
router.get('/rules', async (req, res) => {
  try {
    const orgId = req.orgId || null;
    const data = await loadLearning(orgId);
    res.json(data.learnedRules || []);
  } catch (err) {
    // Fallback to files
    const data = readJSON(L01_PATH, { learned_rules: [], total_rules: 0, last_updated: null });
    res.json(data.learned_rules || []);
  }
});

// POST /api/kb/rules — org-scoped
router.post('/rules', async (req, res) => {
  const orgId = req.orgId || null;
  const userId = req.user?.id || null;
  const { rule_id, error_type, trigger, action, reason } = req.body;
  if (!trigger || !action) {
    return res.status(400).json({ error: 'trigger and action are required' });
  }

  const db = getDB();
  if (orgId && orgId !== 'demo-org-id' && db) {
    try {
      const rule = await db.upsertLearnedRule(orgId, rule_id, {
        rule_type: error_type || 'extraction',
        trigger_text: trigger,
        action_text: action,
        reason: reason || '',
        created_by: userId,
      });
      return res.json({ success: true, rule, org_scoped: true });
    } catch (err) {
      console.error('[kb-admin/rules POST]', err.message);
    }
  }

  // File-based fallback
  const existing = readJSON(L01_PATH, { learned_rules: [] });
  const rules = existing.learned_rules || [];
  const id = rule_id || 'LEARNED_' + String(rules.length + 1).padStart(3, '0');
  const idx = rules.findIndex(r => r.rule_id === id);
  const rule = { rule_id: id, error_type: error_type || 'SPECIFICATION_ERROR', trigger, action, reason: reason || '', date: new Date().toISOString().slice(0, 10) };
  if (idx >= 0) { rules[idx] = rule; } else { rules.push(rule); }
  writeJSON(L01_PATH, { learned_rules: rules, total_rules: rules.length, last_updated: new Date().toISOString() });
  res.json({ success: true, rule, org_scoped: false });
});

// DELETE /api/kb/rules/:id — org-scoped
router.delete('/rules/:id', async (req, res) => {
  const orgId = req.orgId || null;
  const db = getDB();

  if (orgId && orgId !== 'demo-org-id' && db) {
    try {
      await db.deleteLearnedRule(orgId, req.params.id);
      return res.json({ success: true, deleted: req.params.id, org_scoped: true });
    } catch (err) {
      console.error('[kb-admin/rules DELETE]', err.message);
    }
  }

  // File-based fallback
  const existing = readJSON(L01_PATH, { learned_rules: [] });
  const before = existing.learned_rules || [];
  const after = before.filter(r => r.rule_id !== req.params.id);
  if (before.length === after.length) return res.status(404).json({ error: 'Rule not found' });
  writeJSON(L01_PATH, { learned_rules: after, total_rules: after.length, last_updated: new Date().toISOString() });
  res.json({ success: true, deleted: req.params.id, org_scoped: false });
});

// GET /api/kb/patterns — org-scoped
router.get('/patterns', async (req, res) => {
  try {
    const orgId = req.orgId || null;
    const data = await loadLearning(orgId);
    res.json(data.patternErrors || []);
  } catch (err) {
    const data = readJSON(L02_PATH, { pattern_errors: [] });
    res.json(data.pattern_errors || []);
  }
});

// POST /api/kb/patterns — org-scoped
router.post('/patterns', async (req, res) => {
  const orgId = req.orgId || null;
  const userId = req.user?.id || null;
  const { error_type, occurrences, heightened_action } = req.body;
  if (!error_type || !heightened_action) return res.status(400).json({ error: 'error_type and heightened_action are required' });
  await persistPatternError(error_type, occurrences || 3, heightened_action, orgId, userId);
  res.json({ success: true, org_scoped: !!orgId });
});

// GET /api/kb/stats — org-scoped
router.get('/stats', async (req, res) => {
  const orgId = req.orgId || null;
  const db = getDB();

  if (orgId && orgId !== 'demo-org-id' && db) {
    try {
      const stats = await db.getLearnedRuleStats(orgId);
      return res.json({
        total_rules: stats.total,
        rule_type_breakdown: stats.by_type,
        total_sections: 22,
        sections_loaded: 22,
        org_scoped: true,
      });
    } catch (err) {
      console.error('[kb-admin/stats]', err.message);
    }
  }

  // File-based fallback
  const l01 = readJSON(L01_PATH, { learned_rules: [], last_updated: null });
  const l02 = readJSON(L02_PATH, { pattern_errors: [], last_updated: null });
  const sessionsPath = path.join(KB_BASE, 'learning/sessions_log.json');
  const sessions = readJSON(sessionsPath, { sessions: [] });
  const errorCounts = {};
  (l01.learned_rules || []).forEach(r => {
    errorCounts[r.error_type] = (errorCounts[r.error_type] || 0) + 1;
  });
  res.json({
    total_rules: (l01.learned_rules || []).length,
    total_patterns: (l02.pattern_errors || []).length,
    total_sections: 22,
    sections_loaded: 22,
    total_sessions: (sessions.sessions || []).length,
    last_updated: l01.last_updated,
    error_type_breakdown: errorCounts,
    org_scoped: false,
  });
});

// GET /api/kb/sections — shared (not org-scoped, these are industry standards)
router.get('/sections', (req, res) => {
  const sectionDefs = [
    { id:'KB-C01', name:'Drawing standards', group:'Core', file:'core/C01_drawing_standards.json' },
    { id:'KB-C02', name:'Estimating principles', group:'Core', file:'core/C02_estimating_principles.json' },
    { id:'KB-C03', name:'UK standards', group:'Core', file:'core/C03_uk_standards.json' },
    { id:'KB-C04', name:'Document hierarchy', group:'Core', file:'core/C04_document_hierarchy.json' },
    { id:'KB-M01', name:'Pipe materials', group:'Mechanical', file:'mechanical/M01_pipe_materials.json' },
    { id:'KB-M02', name:'Fittings & valves', group:'Mechanical', file:'mechanical/M02_fittings_valves.json' },
    { id:'KB-M03', name:'HVAC & ductwork', group:'Mechanical', file:'mechanical/M03_hvac_ductwork.json' },
    { id:'KB-M04', name:'Plant & equipment', group:'Mechanical', file:'mechanical/M04_plant_equipment.json' },
    { id:'KB-E01', name:'Cable types', group:'Electrical', file:'electrical/E01_cable_types.json' },
    { id:'KB-E02', name:'Cable containment', group:'Electrical', file:'electrical/E02_cable_containment.json' },
    { id:'KB-E03', name:'Distribution', group:'Electrical', file:'electrical/E03_distribution.json' },
    { id:'KB-E04', name:'Lighting & power', group:'Electrical', file:'electrical/E04_lighting_power.json' },
    { id:'KB-E05', name:'Specialist systems', group:'Electrical', file:'electrical/E05_specialist_systems.json' },
    { id:'KB-I01', name:'Pipe insulation', group:'Insulation', file:'insulation/I01_pipe_insulation.json' },
    { id:'KB-I02', name:'Duct insulation', group:'Insulation', file:'insulation/I02_duct_insulation.json' },
    { id:'KB-I03', name:'Equipment insulation', group:'Insulation', file:'insulation/I03_equipment_insulation.json' },
    { id:'KB-I04', name:'Fire & specialist', group:'Insulation', file:'insulation/I04_fire_specialist.json' },
    { id:'KB-X01', name:'Extraction logic', group:'Rules', file:'rules/X01_extraction_logic.json' },
    { id:'KB-X02', name:'Confidence scoring', group:'Rules', file:'rules/X02_confidence_scoring.json' },
    { id:'KB-X03', name:'Conflict resolution', group:'Rules', file:'rules/X03_conflict_resolution.json' },
    { id:'KB-X04', name:'Hallucination prevention', group:'Rules', file:'rules/X04_hallucination_prevention.json' },
  ].map(s => ({
    ...s,
    loaded: fs.existsSync(path.join(KB_BASE, s.file))
  }));
  res.json(sectionDefs);
});

// POST /api/kb/promote — org-scoped
router.post('/promote', async (req, res) => {
  const orgId = req.orgId || null;
  const db = getDB();
  const { rule_id, notes } = req.body;
  if (!rule_id) return res.status(400).json({ error: 'rule_id is required' });

  if (orgId && orgId !== 'demo-org-id' && db) {
    try {
      const promoted = await db.promoteLearnedRule(orgId, rule_id);
      return res.json({ success: true, message: rule_id + ' promoted', rule: promoted, org_scoped: true });
    } catch (err) {
      console.error('[kb-admin/promote]', err.message);
    }
  }

  // File-based fallback
  const promotePath = path.join(KB_BASE, 'learning/promotion_queue.json');
  const queue = readJSON(promotePath, { promotions: [] });
  queue.promotions.push({ rule_id, notes: notes || '', submitted: new Date().toISOString(), status: 'pending' });
  writeJSON(promotePath, queue);
  res.json({ success: true, message: rule_id + ' added to promotion queue', org_scoped: false });
});

// GET /api/kb/promote
router.get('/promote', (req, res) => {
  const promotePath = path.join(KB_BASE, 'learning/promotion_queue.json');
  const queue = readJSON(promotePath, { promotions: [] });
  res.json(queue.promotions || []);
});

// POST /api/kb/session-log
router.post('/session-log', (req, res) => {
  const sessionsPath = path.join(KB_BASE, 'learning/sessions_log.json');
  const log = readJSON(sessionsPath, { sessions: [] });
  log.sessions.push({ ...req.body, org_id: req.orgId || null, timestamp: new Date().toISOString() });
  writeJSON(sessionsPath, log);
  res.json({ success: true, total_sessions: log.sessions.length });
});

// POST /api/kb/import — org-scoped
router.post('/import', async (req, res) => {
  const orgId = req.orgId || null;
  const userId = req.user?.id || null;
  const { learned_rules, pattern_errors } = req.body;
  if (!learned_rules && !pattern_errors) return res.status(400).json({ error: 'No data to import' });

  const db = getDB();
  if (orgId && orgId !== 'demo-org-id' && db) {
    try {
      let rulesImported = 0, patternsImported = 0;
      for (const r of (learned_rules || [])) {
        await db.upsertLearnedRule(orgId, null, {
          rule_type: r.error_type || 'extraction',
          trigger_text: r.trigger,
          action_text: r.action,
          reason: r.reason || '',
          created_by: userId,
        });
        rulesImported++;
      }
      for (const p of (pattern_errors || [])) {
        await db.upsertLearnedRule(orgId, null, {
          rule_type: 'pattern-error',
          trigger_text: p.error_type,
          action_text: p.heightened_action,
          reason: `${p.occurrences || 3} occurrences`,
          occurrences: p.occurrences || 3,
          created_by: userId,
        });
        patternsImported++;
      }
      return res.json({ success: true, rules_imported: rulesImported, patterns_imported: patternsImported, org_scoped: true });
    } catch (err) {
      console.error('[kb-admin/import]', err.message);
    }
  }

  // File-based fallback
  if (learned_rules) {
    writeJSON(L01_PATH, { learned_rules, total_rules: learned_rules.length, last_updated: new Date().toISOString() });
  }
  if (pattern_errors) {
    writeJSON(L02_PATH, { pattern_errors, last_updated: new Date().toISOString() });
  }
  res.json({ success: true, rules_imported: (learned_rules || []).length, patterns_imported: (pattern_errors || []).length, org_scoped: false });
});

/* ══════════════════════════════════════════════════════════════════
   TRADE COLLECTIVE LEARNING
   ══════════════════════════════════════════════════════════════════ */

// POST /api/kb/collective/share — share a rule to the trade collective
router.post('/collective/share', async (req, res) => {
  const orgId = req.orgId || null;
  const db = getDB();
  if (!orgId || orgId === 'demo-org-id' || !db) {
    return res.status(403).json({ error: 'Authentication required to share rules' });
  }

  const { rule_id } = req.body;
  if (!rule_id) return res.status(400).json({ error: 'rule_id is required' });

  // Get org trade
  const trade = req.user?.organizations?.trade;
  if (!trade) return res.status(400).json({ error: 'Organisation trade not set — configure in Settings' });

  try {
    const shared = await db.shareRuleToCollective(orgId, rule_id, trade);
    res.json({
      success: true,
      message: `Rule shared to ${trade.toUpperCase()} collective`,
      rule: shared,
      trade,
    });
  } catch (err) {
    console.error('[kb-admin/collective/share]', err.message);
    // Return user-friendly errors for known validation failures
    if (err.message.includes('Pricing rules')) return res.status(403).json({ error: err.message });
    if (err.message.includes('not found')) return res.status(404).json({ error: err.message });
    res.status(500).json({ error: 'Failed to share rule: ' + err.message });
  }
});

// GET /api/kb/collective/rules — view collective rules for this org's trade
router.get('/collective/rules', async (req, res) => {
  const orgId = req.orgId || null;
  const db = getDB();
  if (!db) return res.json([]);

  const trade = req.user?.organizations?.trade || req.query.trade;
  if (!trade) return res.json([]);

  try {
    const rules = await db.getCollectiveRulesForTrade(trade);
    res.json({
      trade,
      rules: rules.map(r => ({
        id: r.id,
        trigger: r.trigger_text,
        action: r.action_text,
        reason: r.reason,
        example_before: r.example_before,
        example_after: r.example_after,
        occurrences: r.occurrences,
        shared_at: r.shared_at,
        shared_by_own_org: r.shared_by_org === orgId,
      })),
      total: rules.length,
    });
  } catch (err) {
    console.error('[kb-admin/collective/rules]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/kb/collective/stats — collective stats for this trade
router.get('/collective/stats', async (req, res) => {
  const db = getDB();
  if (!db) return res.json({ total: 0, contributing_orgs: 0 });

  const trade = req.user?.organizations?.trade || req.query.trade;
  if (!trade) return res.json({ total: 0, contributing_orgs: 0 });

  try {
    const stats = await db.getCollectiveRuleStats(trade);
    res.json({ trade, ...stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/kb/collective/settings — get collective learning opt-in status
router.get('/collective/settings', async (req, res) => {
  const orgId = req.orgId || null;
  const db = getDB();
  if (!orgId || !db) return res.json({ collective_learning_enabled: true });

  try {
    const enabled = await db.isCollectiveLearningEnabled(orgId);
    res.json({ collective_learning_enabled: enabled });
  } catch (err) {
    res.json({ collective_learning_enabled: true });
  }
});

// PUT /api/kb/collective/settings — toggle collective learning
router.put('/collective/settings', async (req, res) => {
  const orgId = req.orgId || null;
  const db = getDB();
  if (!orgId || orgId === 'demo-org-id' || !db) {
    return res.status(403).json({ error: 'Authentication required' });
  }

  const { enabled } = req.body;
  if (typeof enabled !== 'boolean') return res.status(400).json({ error: 'enabled (boolean) is required' });

  try {
    const result = await db.setCollectiveLearning(orgId, enabled);
    res.json({
      success: true,
      collective_learning_enabled: result.collective_learning_enabled,
      message: enabled
        ? 'Trade collective learning enabled — your AI will now benefit from other contractors\' corrections.'
        : 'Trade collective learning disabled — your AI will only use your organisation\'s own rules.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
