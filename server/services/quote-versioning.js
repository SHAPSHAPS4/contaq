/**
 * Quote Versioning — version control for priced quotes.
 * Every save creates a snapshot, enables comparison between any two versions.
 */

const fs = require('fs');
const path = require('path');

const VERSIONS_DIR = path.join(__dirname, '../data/quote-versions');
if (!fs.existsSync(VERSIONS_DIR)) fs.mkdirSync(VERSIONS_DIR, { recursive: true });

function saveVersion(quoteRef, quoteData, changeNote) {
  const versionsPath = path.join(VERSIONS_DIR, quoteRef + '_versions.json');
  let history = [];
  try { history = JSON.parse(fs.readFileSync(versionsPath, 'utf-8')); } catch {}

  const version = {
    version_number: history.length + 1,
    version_ref: `${quoteRef}-v${String(history.length + 1).padStart(2, '0')}`,
    saved_at: new Date().toISOString(),
    change_note: changeNote || 'No note provided',
    summary: {
      grand_total: quoteData.summary?.grand_total,
      total_items: quoteData.priced_items?.length,
      priced_items: quoteData.priced_items?.filter(i => i.pricing_status === 'priced').length,
    },
    snapshot: JSON.parse(JSON.stringify(quoteData)),
  };

  history.push(version);
  fs.writeFileSync(versionsPath, JSON.stringify(history, null, 2));
  return version;
}

function getVersionHistory(quoteRef) {
  const versionsPath = path.join(VERSIONS_DIR, quoteRef + '_versions.json');
  try { return JSON.parse(fs.readFileSync(versionsPath, 'utf-8')); }
  catch { return []; }
}

function getVersion(quoteRef, versionNumber) {
  const history = getVersionHistory(quoteRef);
  const version = history.find(v => v.version_number === parseInt(versionNumber));
  if (!version) throw new Error(`Version ${versionNumber} not found for quote ${quoteRef}`);
  return version;
}

function compareVersions(quoteRef, versionA, versionB) {
  const snapA = versionA.snapshot;
  const snapB = versionB.snapshot;
  const itemsA = snapA.priced_items || [];
  const itemsB = snapB.priced_items || [];
  const changes = [];

  const mapA = new Map(itemsA.map(i => [i.description?.toLowerCase().trim(), i]));
  const mapB = new Map(itemsB.map(i => [i.description?.toLowerCase().trim(), i]));

  // Check items in B
  for (const [key, itemB] of mapB) {
    const itemA = mapA.get(key);
    if (!itemA) {
      changes.push({
        type: 'ADDED', description: itemB.description, trade: itemB.trade,
        version_a: null,
        version_b: { quantity: itemB.quantity, unit: itemB.unit, total: itemB.total_with_overheads },
        delta_total: itemB.total_with_overheads || 0,
        delta_quantity: itemB.quantity,
        colour: 'green',
      });
    } else {
      const qtyDelta = (parseFloat(itemB.quantity) || 0) - (parseFloat(itemA.quantity) || 0);
      const totalDelta = (itemB.total_with_overheads || 0) - (itemA.total_with_overheads || 0);
      if (Math.abs(qtyDelta) > 0.01 || Math.abs(totalDelta) > 0.01) {
        changes.push({
          type: 'CHANGED', description: itemB.description, trade: itemB.trade,
          version_a: { quantity: itemA.quantity, unit: itemA.unit, total: itemA.total_with_overheads },
          version_b: { quantity: itemB.quantity, unit: itemB.unit, total: itemB.total_with_overheads },
          delta_total: parseFloat(totalDelta.toFixed(2)),
          delta_quantity: parseFloat(qtyDelta.toFixed(2)),
          colour: totalDelta > 0 ? 'amber' : 'blue',
        });
      }
    }
  }

  // Check items removed from A
  for (const [key, itemA] of mapA) {
    if (!mapB.has(key)) {
      changes.push({
        type: 'REMOVED', description: itemA.description, trade: itemA.trade,
        version_a: { quantity: itemA.quantity, unit: itemA.unit, total: itemA.total_with_overheads },
        version_b: null,
        delta_total: -(itemA.total_with_overheads || 0),
        delta_quantity: -(parseFloat(itemA.quantity) || 0),
        colour: 'red',
      });
    }
  }

  const totalDelta = changes.reduce((sum, c) => sum + (c.delta_total || 0), 0);

  return {
    quote_ref: quoteRef,
    version_a: { number: versionA.version_number, ref: versionA.version_ref, total: snapA.summary?.grand_total, saved_at: versionA.saved_at },
    version_b: { number: versionB.version_number, ref: versionB.version_ref, total: snapB.summary?.grand_total, saved_at: versionB.saved_at },
    changes_count: changes.length,
    added: changes.filter(c => c.type === 'ADDED').length,
    changed: changes.filter(c => c.type === 'CHANGED').length,
    removed: changes.filter(c => c.type === 'REMOVED').length,
    total_delta: parseFloat(totalDelta.toFixed(2)),
    changes,
    compared_at: new Date().toISOString(),
  };
}

module.exports = { saveVersion, getVersionHistory, getVersion, compareVersions };
