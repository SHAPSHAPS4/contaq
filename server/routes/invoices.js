/**
 * Invoice Routes — quote-to-invoice bridge
 * POST /api/invoices/create-from-quote
 * GET  /api/invoices
 * GET  /api/invoices/:ref
 * POST /api/invoices/:ref/variation
 * POST /api/invoices/:ref/status
 * GET  /api/invoices/:ref/export-csv
 */

const express = require('express');
const router = express.Router();
const {
  createFromQuote, addVariation, updateStatus,
  listInvoices, getInvoice, generateCSV,
} = require('../services/invoice-engine');
const fs = require('fs');
const path = require('path');

router.post('/create-from-quote', (req, res) => {
  try {
    const { quote_ref, ...options } = req.body;
    if (!quote_ref) return res.status(400).json({ error: 'quote_ref required' });
    const quotePath = path.join(__dirname, '../data/quotes/', quote_ref + '.json');
    if (!fs.existsSync(quotePath)) return res.status(404).json({ error: 'Quote not found: ' + quote_ref });
    const quote = JSON.parse(fs.readFileSync(quotePath, 'utf-8'));
    const invoice = createFromQuote(quote, options);
    res.json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/', (req, res) => {
  res.json(listInvoices());
});

router.get('/:ref', (req, res) => {
  try {
    res.json(getInvoice(req.params.ref));
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

router.post('/:ref/variation', (req, res) => {
  try {
    const invoice = addVariation(req.params.ref, req.body);
    res.json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:ref/status', (req, res) => {
  try {
    const invoice = updateStatus(req.params.ref, req.body.status);
    res.json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:ref/export-csv', (req, res) => {
  try {
    const invoice = getInvoice(req.params.ref);
    const csv = generateCSV(invoice);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoice_ref}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
