/**
 * Pricing Engine — turns consolidated takeoff into priced quote
 */

const path = require('path');
const fs = require('fs');

const RATES_PATH = path.join(__dirname, '../data/rates');
const OVERHEADS_PATH = path.join(__dirname, '../data/overheads.json');

function loadRates(trade) {
  const filePath = path.join(RATES_PATH, trade.toLowerCase() + '.json');
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); }
  catch { return null; }
}

function loadOverheads() {
  try { return JSON.parse(fs.readFileSync(OVERHEADS_PATH, 'utf-8')); }
  catch {
    return {
      labour_uplift_pct: 15,
      material_uplift_pct: 10,
      overhead_pct: 12,
      profit_pct: 8,
      contingency_pct: 5,
    };
  }
}

function lookupRate(ratesData, description, specification, unit) {
  if (!ratesData || !ratesData.rates) return null;
  const descLower = description.toLowerCase();
  const specLower = (specification || '').toLowerCase();
  for (const rate of ratesData.rates) {
    const keywordsMatch = rate.keywords.some(k =>
      descLower.includes(k.toLowerCase()) || specLower.includes(k.toLowerCase())
    );
    const unitMatch = !rate.unit || rate.unit === unit;
    if (keywordsMatch && unitMatch) return rate;
  }
  return null;
}

function priceItem(item, overheads) {
  const rates = loadRates(item.trade);
  const rate = lookupRate(rates, item.description, item.specification, item.unit);

  if (!rate) {
    return {
      ...item,
      material_rate: null, labour_rate: null,
      material_total: null, labour_total: null,
      subtotal: null, total_with_overheads: null,
      pricing_status: 'unpriced',
      pricing_note: 'No matching rate found — manual pricing required',
    };
  }

  const qty = parseFloat(item.quantity) || 0;
  const materialRate = rate.material_rate || 0;
  const labourRate = rate.labour_rate || 0;
  const materialBase = qty * materialRate;
  const labourBase = qty * labourRate;
  const materialTotal = materialBase * (1 + overheads.material_uplift_pct / 100);
  const labourTotal = labourBase * (1 + overheads.labour_uplift_pct / 100);
  const subtotal = materialTotal + labourTotal;
  const withOverhead = subtotal * (1 + overheads.overhead_pct / 100);
  const withProfit = withOverhead * (1 + overheads.profit_pct / 100);
  const withContingency = withProfit * (1 + overheads.contingency_pct / 100);

  return {
    ...item,
    material_rate: materialRate,
    labour_rate: labourRate,
    material_total: parseFloat(materialTotal.toFixed(2)),
    labour_total: parseFloat(labourTotal.toFixed(2)),
    subtotal: parseFloat(subtotal.toFixed(2)),
    overhead_total: parseFloat((withOverhead - subtotal).toFixed(2)),
    profit_total: parseFloat((withProfit - withOverhead).toFixed(2)),
    contingency_total: parseFloat((withContingency - withProfit).toFixed(2)),
    total_with_overheads: parseFloat(withContingency.toFixed(2)),
    rate_source: rate.source || 'standard',
    rate_description: rate.description,
    pricing_status: 'priced',
    pricing_note: null,
  };
}

function priceTakeoff(takeoffItems, overrideOverheads = {}) {
  const overheads = { ...loadOverheads(), ...overrideOverheads };
  const pricedItems = takeoffItems.map(item => priceItem(item, overheads));

  const summary = {
    total_items: pricedItems.length,
    priced_items: pricedItems.filter(i => i.pricing_status === 'priced').length,
    unpriced_items: pricedItems.filter(i => i.pricing_status === 'unpriced').length,
    material_subtotal: 0, labour_subtotal: 0, subtotal: 0,
    overhead_total: 0, profit_total: 0, contingency_total: 0, grand_total: 0,
    by_trade: {},
    overheads_applied: overheads,
  };

  for (const item of pricedItems) {
    if (item.pricing_status !== 'priced') continue;
    summary.material_subtotal += item.material_total || 0;
    summary.labour_subtotal += item.labour_total || 0;
    summary.subtotal += item.subtotal || 0;
    summary.overhead_total += item.overhead_total || 0;
    summary.profit_total += item.profit_total || 0;
    summary.contingency_total += item.contingency_total || 0;
    summary.grand_total += item.total_with_overheads || 0;

    const trade = item.trade || 'Unknown';
    if (!summary.by_trade[trade]) {
      summary.by_trade[trade] = { items: 0, material: 0, labour: 0, total: 0 };
    }
    summary.by_trade[trade].items++;
    summary.by_trade[trade].material += item.material_total || 0;
    summary.by_trade[trade].labour += item.labour_total || 0;
    summary.by_trade[trade].total += item.total_with_overheads || 0;
  }

  for (const key of ['material_subtotal','labour_subtotal','subtotal','overhead_total','profit_total','contingency_total','grand_total']) {
    summary[key] = parseFloat(summary[key].toFixed(2));
  }
  for (const trade of Object.keys(summary.by_trade)) {
    for (const k of ['material','labour','total']) {
      summary.by_trade[trade][k] = parseFloat(summary.by_trade[trade][k].toFixed(2));
    }
  }

  return { priced_items: pricedItems, summary };
}

function applyManualOverride(pricedItem, override) {
  const updated = { ...pricedItem, ...override, pricing_status: 'manual_override', manual_override: true };
  if (override.total_with_overheads !== undefined) {
    updated.total_with_overheads = parseFloat(override.total_with_overheads.toFixed(2));
  }
  return updated;
}

module.exports = { priceTakeoff, priceItem, applyManualOverride, loadOverheads };
