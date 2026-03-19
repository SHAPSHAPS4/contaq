const express = require('express');
const router = express.Router();
const { priceTakeoff, applyManualOverride, loadOverheads, loadLearnedRates, saveLearnedRate } = require('../services/pricing-engine');
const { logSession } = require('../services/session-logger');
const path = require('path');
const fs = require('fs');

// POST /api/pricing/price
router.post('/price', async (req, res) => {
  const startTime = Date.now();
  try {
    const { takeoff_items, overheads_override, project_ref } = req.body;
    if (!takeoff_items || !takeoff_items.length) return res.status(400).json({ error: 'takeoff_items required' });
    const result = priceTakeoff(takeoff_items, overheads_override || {});
    logSession({ type: 'pricing', project_ref, duration_ms: Date.now() - startTime, items: takeoff_items.length, grand_total: result.summary.grand_total });
    res.json({ success: true, duration_ms: Date.now() - startTime, ...result });
  } catch (err) {
    console.error('[pricing/price]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/pricing/override
router.post('/override', (req, res) => {
  try {
    const { item, override } = req.body;
    if (!item || !override) return res.status(400).json({ error: 'item and override required' });
    const updated = applyManualOverride(item, override);
    res.json({ success: true, item: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/pricing/overheads
router.get('/overheads', (req, res) => {
  res.json(loadOverheads());
});

// POST /api/pricing/overheads
router.post('/overheads', (req, res) => {
  try {
    const ohPath = path.join(__dirname, '../data/overheads.json');
    const current = loadOverheads();
    const updated = { ...current, ...req.body, last_updated: new Date().toISOString() };
    fs.writeFileSync(ohPath, JSON.stringify(updated, null, 2));
    res.json({ success: true, overheads: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/pricing/export-csv
router.post('/export-csv', (req, res) => {
  try {
    const { priced_items, summary, project_ref } = req.body;
    if (!priced_items) return res.status(400).json({ error: 'priced_items required' });
    const rows = [
      ['Project', project_ref || 'Untitled', '', '', '', '', '', '', ''],
      ['Generated', new Date().toISOString(), '', '', '', '', '', '', ''],
      [''],
      ['Trade','Description','Specification','Qty','Unit','Material £','Labour £','Subtotal £','Total inc. OH £','Status','Notes'],
    ];
    for (const item of priced_items) {
      rows.push([
        item.trade || '', item.description || '', item.specification || '',
        item.quantity || '', item.unit || '',
        item.material_total ?? '', item.labour_total ?? '',
        item.subtotal ?? '', item.total_with_overheads ?? '',
        item.pricing_status || '', item.pricing_note || item.notes || '',
      ]);
    }
    rows.push(['']);
    rows.push(['SUMMARY']);
    rows.push(['Material subtotal', '', '', '', '', summary.material_subtotal]);
    rows.push(['Labour subtotal', '', '', '', '', '', summary.labour_subtotal]);
    rows.push(['Subtotal', '', '', '', '', '', '', summary.subtotal]);
    rows.push(['Overheads', '', '', '', '', '', '', summary.overhead_total]);
    rows.push(['Profit', '', '', '', '', '', '', summary.profit_total]);
    rows.push(['Contingency', '', '', '', '', '', '', summary.contingency_total]);
    rows.push(['GRAND TOTAL', '', '', '', '', '', '', summary.grand_total]);

    const csv = rows.map(r => r.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="quote_${project_ref || 'untitled'}_${new Date().toISOString().slice(0,10)}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/pricing/save-quote
router.post('/save-quote', (req, res) => {
  try {
    const { priced_items, summary, project_ref, quote_ref } = req.body;
    const quotesDir = path.join(__dirname, '../data/quotes');
    if (!fs.existsSync(quotesDir)) fs.mkdirSync(quotesDir, { recursive: true });
    const ref = quote_ref || 'QT-' + Date.now();
    const filePath = path.join(quotesDir, ref + '.json');
    const quote = { quote_ref: ref, project_ref, created: new Date().toISOString(), priced_items, summary };
    fs.writeFileSync(filePath, JSON.stringify(quote, null, 2));
    res.json({ success: true, quote_ref: ref, file: filePath });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/pricing/quotes
router.get('/quotes', (req, res) => {
  try {
    const quotesDir = path.join(__dirname, '../data/quotes');
    if (!fs.existsSync(quotesDir)) return res.json([]);
    const files = fs.readdirSync(quotesDir).filter(f => f.endsWith('.json'));
    const quotes = files.map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(quotesDir, f), 'utf-8'));
      return { quote_ref: data.quote_ref, project_ref: data.project_ref, created: data.created, grand_total: data.summary?.grand_total, items: data.priced_items?.length };
    });
    res.json(quotes.sort((a, b) => new Date(b.created) - new Date(a.created)));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/pricing/learn-rate
router.post('/learn-rate', (req, res) => {
  const { item, override_total, project_ref, confirm } = req.body;
  if (!item || !override_total) return res.status(400).json({ error: 'item and override_total required' });
  if (!confirm) {
    return res.json({
      preview: true,
      message: 'This will save the following rate for future use:',
      description: item.description,
      inferred_rate: parseFloat((override_total / (parseFloat(item.quantity) || 1)).toFixed(2)),
      unit: item.unit,
      confirm_required: true,
    });
  }
  const rate = saveLearnedRate(item, override_total, project_ref);
  res.json({ success: true, rate, message: 'Rate saved to learned rate library' });
});

// GET /api/pricing/learned-rates
router.get('/learned-rates', (req, res) => {
  res.json(loadLearnedRates());
});

module.exports = router;
