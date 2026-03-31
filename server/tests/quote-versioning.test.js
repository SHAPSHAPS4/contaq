const fs = require('fs');
const path = require('path');
const { saveVersion, getVersionHistory, getVersion, compareVersions } = require('../services/quote-versioning');

const VERSIONS_DIR = path.join(__dirname, '../data/quote-versions');
const TEST_REF = 'TEST-QTE-' + Date.now();

afterAll(() => {
  // Clean up test version file
  const testFile = path.join(VERSIONS_DIR, TEST_REF + '_versions.json');
  try { fs.unlinkSync(testFile); } catch {}
});

describe('Quote Versioning', () => {
  test('saves first version with correct metadata', () => {
    const quoteData = {
      summary: { grand_total: 50000 },
      priced_items: [
        { description: '22mm Copper pipe', trade: 'Mechanical', quantity: 50, unit: 'm', total_with_overheads: 3500, pricing_status: 'priced' },
        { description: 'Isolation valve', trade: 'Mechanical', quantity: 4, unit: 'nr', total_with_overheads: 800, pricing_status: 'priced' }
      ]
    };
    const version = saveVersion(TEST_REF, quoteData, 'Initial quote');
    expect(version.version_number).toBe(1);
    expect(version.version_ref).toBe(TEST_REF + '-v01');
    expect(version.change_note).toBe('Initial quote');
    expect(version.summary.grand_total).toBe(50000);
    expect(version.summary.total_items).toBe(2);
    expect(version.summary.priced_items).toBe(2);
    expect(version.snapshot).toEqual(quoteData);
  });

  test('saves second version and increments number', () => {
    const quoteData = {
      summary: { grand_total: 55000 },
      priced_items: [
        { description: '22mm Copper pipe', trade: 'Mechanical', quantity: 60, unit: 'm', total_with_overheads: 4200, pricing_status: 'priced' },
        { description: 'Isolation valve', trade: 'Mechanical', quantity: 6, unit: 'nr', total_with_overheads: 1200, pricing_status: 'priced' },
        { description: 'Strainer Y-type', trade: 'Mechanical', quantity: 2, unit: 'nr', total_with_overheads: 300, pricing_status: 'priced' }
      ]
    };
    const version = saveVersion(TEST_REF, quoteData, 'Added strainers, increased pipe qty');
    expect(version.version_number).toBe(2);
    expect(version.version_ref).toBe(TEST_REF + '-v02');
    expect(version.summary.total_items).toBe(3);
  });

  test('getVersionHistory returns all versions', () => {
    const history = getVersionHistory(TEST_REF);
    expect(history.length).toBe(2);
    expect(history[0].version_number).toBe(1);
    expect(history[1].version_number).toBe(2);
  });

  test('getVersion returns specific version', () => {
    const v1 = getVersion(TEST_REF, 1);
    expect(v1.version_number).toBe(1);
    expect(v1.change_note).toBe('Initial quote');
  });

  test('getVersion throws for non-existent version', () => {
    expect(() => getVersion(TEST_REF, 99)).toThrow();
  });

  test('getVersionHistory returns empty for unknown quote', () => {
    const history = getVersionHistory('NONEXISTENT-QTE');
    expect(history).toEqual([]);
  });

  test('compareVersions detects added items', () => {
    const v1 = getVersion(TEST_REF, 1);
    const v2 = getVersion(TEST_REF, 2);
    const diff = compareVersions(TEST_REF, v1, v2);
    expect(diff.added).toBeGreaterThan(0);
    const addedItem = diff.changes.find(c => c.type === 'ADDED');
    expect(addedItem).toBeDefined();
    expect(addedItem.description.toLowerCase()).toContain('strainer');
    expect(addedItem.colour).toBe('green');
  });

  test('compareVersions detects changed quantities', () => {
    const v1 = getVersion(TEST_REF, 1);
    const v2 = getVersion(TEST_REF, 2);
    const diff = compareVersions(TEST_REF, v1, v2);
    const changedItem = diff.changes.find(c => c.type === 'CHANGED' && c.description.toLowerCase().includes('copper'));
    expect(changedItem).toBeDefined();
    expect(changedItem.delta_quantity).toBe(10); // 60 - 50
    expect(changedItem.delta_total).toBeGreaterThan(0);
  });

  test('compareVersions calculates net delta', () => {
    const v1 = getVersion(TEST_REF, 1);
    const v2 = getVersion(TEST_REF, 2);
    const diff = compareVersions(TEST_REF, v1, v2);
    expect(diff.total_delta).toBeGreaterThan(0); // v2 total > v1 total
    expect(diff.changes_count).toBe(diff.added + diff.changed + diff.removed);
  });

  test('compareVersions detects removed items', () => {
    // Save v3 with one item removed
    const quoteData = {
      summary: { grand_total: 4200 },
      priced_items: [
        { description: '22mm Copper pipe', trade: 'Mechanical', quantity: 60, unit: 'm', total_with_overheads: 4200, pricing_status: 'priced' }
      ]
    };
    saveVersion(TEST_REF, quoteData, 'Removed valves and strainers');
    const v2 = getVersion(TEST_REF, 2);
    const v3 = getVersion(TEST_REF, 3);
    const diff = compareVersions(TEST_REF, v2, v3);
    expect(diff.removed).toBe(2); // valve + strainer removed
    const removedItems = diff.changes.filter(c => c.type === 'REMOVED');
    expect(removedItems.length).toBe(2);
    expect(removedItems[0].colour).toBe('red');
  });
});
