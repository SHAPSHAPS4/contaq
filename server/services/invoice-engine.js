/**
 * Invoice Engine — converts priced quotes to invoices/applications
 * with variation tracking and CSV export.
 */

const fs = require('fs');
const path = require('path');

const INVOICE_DIR = path.join(__dirname, '../data/invoices');
if (!fs.existsSync(INVOICE_DIR)) fs.mkdirSync(INVOICE_DIR, { recursive: true });

function generateInvoiceRef(type) {
  const prefix = type === 'application' ? 'APP' : 'INV';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `${prefix}-${date}-${seq}`;
}

function createFromQuote(quote, options = {}) {
  const {
    type = 'invoice', client_name = '', client_address = '',
    payment_terms = 30, application_number = 1, retention_pct = 5, notes = '',
  } = options;

  const invoiceRef = generateInvoiceRef(type);
  const issueDate = new Date().toISOString().slice(0, 10);
  const dueDate = new Date(Date.now() + payment_terms * 86400000).toISOString().slice(0, 10);

  const lineItems = (quote.priced_items || [])
    .filter(i => i.pricing_status !== 'unpriced')
    .map(i => ({
      trade: i.trade, description: i.description, specification: i.specification,
      quantity: i.quantity, unit: i.unit,
      rate: parseFloat((i.total_with_overheads / (parseFloat(i.quantity) || 1)).toFixed(2)),
      total: i.total_with_overheads,
      source_quote_item: i.description, variation: false, variation_ref: null,
    }));

  const subtotal = lineItems.reduce((s, i) => s + (i.total || 0), 0);
  const retentionAmount = type === 'application' ? parseFloat((subtotal * retention_pct / 100).toFixed(2)) : 0;
  const vatAmount = parseFloat((subtotal * 0.20).toFixed(2));
  const totalDue = parseFloat((subtotal - retentionAmount + vatAmount).toFixed(2));

  const document = {
    invoice_ref: invoiceRef, type, status: 'draft',
    quote_ref: quote.quote_ref, project_ref: quote.project_ref,
    client_name, client_address, issue_date: issueDate, due_date: dueDate,
    payment_terms_days: payment_terms,
    application_number: type === 'application' ? application_number : null,
    retention_pct: type === 'application' ? retention_pct : 0,
    retention_amount: retentionAmount,
    line_items: lineItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    vat_rate: 20, vat_amount: vatAmount,
    retention_deducted: retentionAmount, total_due: totalDue,
    notes, variations: [],
    created_at: new Date().toISOString(), last_updated: new Date().toISOString(),
  };

  fs.writeFileSync(path.join(INVOICE_DIR, invoiceRef + '.json'), JSON.stringify(document, null, 2));
  return document;
}

function addVariation(invoiceRef, variation) {
  const filePath = path.join(INVOICE_DIR, invoiceRef + '.json');
  if (!fs.existsSync(filePath)) throw new Error('Invoice not found: ' + invoiceRef);
  const invoice = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const varRef = 'VAR-' + String(invoice.variations.length + 1).padStart(3, '0');
  const newVar = {
    variation_ref: varRef, description: variation.description, trade: variation.trade,
    quantity: variation.quantity, unit: variation.unit, rate: variation.rate,
    total: parseFloat((variation.quantity * variation.rate).toFixed(2)),
    reason: variation.reason || '', status: 'pending', added_at: new Date().toISOString(),
  };

  invoice.variations.push(newVar);
  invoice.line_items.push({
    trade: newVar.trade, description: `VARIATION ${varRef}: ${newVar.description}`,
    specification: '', quantity: newVar.quantity, unit: newVar.unit,
    rate: newVar.rate, total: newVar.total, variation: true, variation_ref: varRef,
  });

  invoice.subtotal = parseFloat((invoice.subtotal + newVar.total).toFixed(2));
  invoice.vat_amount = parseFloat((invoice.subtotal * invoice.vat_rate / 100).toFixed(2));
  invoice.retention_amount = parseFloat((invoice.subtotal * invoice.retention_pct / 100).toFixed(2));
  invoice.total_due = parseFloat((invoice.subtotal - invoice.retention_amount + invoice.vat_amount).toFixed(2));
  invoice.last_updated = new Date().toISOString();

  fs.writeFileSync(filePath, JSON.stringify(invoice, null, 2));
  return invoice;
}

function updateStatus(invoiceRef, status) {
  const filePath = path.join(INVOICE_DIR, invoiceRef + '.json');
  if (!fs.existsSync(filePath)) throw new Error('Invoice not found');
  const invoice = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  invoice.status = status;
  invoice.last_updated = new Date().toISOString();
  if (status === 'sent') invoice.sent_at = new Date().toISOString();
  if (status === 'paid') invoice.paid_at = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(invoice, null, 2));
  return invoice;
}

function listInvoices() {
  if (!fs.existsSync(INVOICE_DIR)) return [];
  return fs.readdirSync(INVOICE_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const inv = JSON.parse(fs.readFileSync(path.join(INVOICE_DIR, f), 'utf-8'));
      return {
        invoice_ref: inv.invoice_ref, type: inv.type, status: inv.status,
        project_ref: inv.project_ref, quote_ref: inv.quote_ref,
        client_name: inv.client_name, issue_date: inv.issue_date,
        due_date: inv.due_date, total_due: inv.total_due,
        variations_count: inv.variations?.length || 0,
      };
    })
    .sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date));
}

function getInvoice(invoiceRef) {
  const filePath = path.join(INVOICE_DIR, invoiceRef + '.json');
  if (!fs.existsSync(filePath)) throw new Error('Invoice not found');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function generateCSV(invoice) {
  const rows = [
    [`${invoice.type === 'application' ? 'APPLICATION FOR PAYMENT' : 'INVOICE'}: ${invoice.invoice_ref}`],
    [`Project: ${invoice.project_ref}`], [`Quote ref: ${invoice.quote_ref}`],
    [`Client: ${invoice.client_name}`], [`Issue date: ${invoice.issue_date}`],
    [`Due date: ${invoice.due_date}`], [''],
    ['Trade', 'Description', 'Specification', 'Qty', 'Unit', 'Rate £', 'Total £', 'Variation'],
  ];
  for (const item of invoice.line_items) {
    rows.push([item.trade, item.description, item.specification || '', item.quantity, item.unit, item.rate, item.total, item.variation ? 'YES' : '']);
  }
  rows.push(['']);
  rows.push(['Subtotal', '', '', '', '', '', invoice.subtotal]);
  rows.push(['VAT 20%', '', '', '', '', '', invoice.vat_amount]);
  if (invoice.retention_amount > 0) rows.push([`Retention ${invoice.retention_pct}%`, '', '', '', '', '', `-${invoice.retention_amount}`]);
  rows.push(['TOTAL DUE', '', '', '', '', '', invoice.total_due]);
  return rows.map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
}

module.exports = { createFromQuote, addVariation, updateStatus, listInvoices, getInvoice, generateCSV };
