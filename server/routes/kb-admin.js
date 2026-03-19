const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { persistLearnedRules, persistPatternError } = require('../kb/index');

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

// GET /api/kb/rules
router.get('/rules', (req, res) => {
  const data = readJSON(L01_PATH, { learned_rules: [], total_rules: 0, last_updated: null });
  res.json(data.learned_rules || []);
});

// POST /api/kb/rules
router.post('/rules', (req, res) => {
  const { rule_id, error_type, trigger, action, reason } = req.body;
  if (!trigger || !action) {
    return res.status(400).json({ error: 'trigger and action are required' });
  }
  const existing = readJSON(L01_PATH, { learned_rules: [] });
  const rules = existing.learned_rules || [];
  const id = rule_id || 'LEARNED_' + String(rules.length + 1).padStart(3, '0');
  const idx = rules.findIndex(r => r.rule_id === id);
  const rule = { rule_id: id, error_type: error_type || 'SPECIFICATION_ERROR', trigger, action, reason: reason || '', date: new Date().toISOString().slice(0, 10) };
  if (idx >= 0) { rules[idx] = rule; } else { rules.push(rule); }
  writeJSON(L01_PATH, { learned_rules: rules, total_rules: rules.length, last_updated: new Date().toISOString() });
  res.json({ success: true, rule });
});

// DELETE /api/kb/rules/:id
router.delete('/rules/:id', (req, res) => {
  const existing = readJSON(L01_PATH, { learned_rules: [] });
  const before = existing.learned_rules || [];
  const after = before.filter(r => r.rule_id !== req.params.id);
  if (before.length === after.length) return res.status(404).json({ error: 'Rule not found' });
  writeJSON(L01_PATH, { learned_rules: after, total_rules: after.length, last_updated: new Date().toISOString() });
  res.json({ success: true, deleted: req.params.id });
});

// GET /api/kb/patterns
router.get('/patterns', (req, res) => {
  const data = readJSON(L02_PATH, { pattern_errors: [] });
  res.json(data.pattern_errors || []);
});

// POST /api/kb/patterns
router.post('/patterns', (req, res) => {
  const { error_type, occurrences, heightened_action } = req.body;
  if (!error_type || !heightened_action) return res.status(400).json({ error: 'error_type and heightened_action are required' });
  const result = persistPatternError(error_type, occurrences || 3, heightened_action);
  res.json({ success: true, data: result });
});

// GET /api/kb/stats
router.get('/stats', (req, res) => {
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
  });
});

// GET /api/kb/sections
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

// POST /api/kb/promote
router.post('/promote', (req, res) => {
  const { rule_id, notes } = req.body;
  if (!rule_id) return res.status(400).json({ error: 'rule_id is required' });
  const promotePath = path.join(KB_BASE, 'learning/promotion_queue.json');
  const queue = readJSON(promotePath, { promotions: [] });
  queue.promotions.push({ rule_id, notes: notes || '', submitted: new Date().toISOString(), status: 'pending' });
  writeJSON(promotePath, queue);
  res.json({ success: true, message: rule_id + ' added to promotion queue' });
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
  log.sessions.push({ ...req.body, timestamp: new Date().toISOString() });
  writeJSON(sessionsPath, log);
  res.json({ success: true, total_sessions: log.sessions.length });
});

// POST /api/kb/import
router.post('/import', (req, res) => {
  const { learned_rules, pattern_errors } = req.body;
  if (!learned_rules && !pattern_errors) return res.status(400).json({ error: 'No data to import' });
  if (learned_rules) {
    writeJSON(L01_PATH, { learned_rules, total_rules: learned_rules.length, last_updated: new Date().toISOString() });
  }
  if (pattern_errors) {
    writeJSON(L02_PATH, { pattern_errors, last_updated: new Date().toISOString() });
  }
  res.json({ success: true, rules_imported: (learned_rules || []).length, patterns_imported: (pattern_errors || []).length });
});

module.exports = router;
