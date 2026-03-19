/**
 * Drawing Register — manages multi-drawing project extraction
 * Tracks per-drawing status, aggregates quantities, detects duplicates.
 */

const fs = require('fs');
const path = require('path');

const REGISTER_DIR = path.join(__dirname, '../data/drawing-registers');
if (!fs.existsSync(REGISTER_DIR)) fs.mkdirSync(REGISTER_DIR, { recursive: true });

function createRegister(projectRef, drawings) {
  const register = {
    project_ref: projectRef,
    created: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    status: 'pending',
    drawings: drawings.map((d, i) => ({
      id: `DRW-${String(i + 1).padStart(3, '0')}`,
      file_id: d.file_id,
      original_name: d.original_name,
      size_label: d.size_label,
      extraction_status: 'pending',
      extraction_result: null,
      validation_score: null,
      validation_grade: null,
      items_extracted: 0,
      flags_raised: 0,
      drawing_reference: null,
      revision: null,
      processed_at: null,
      error: null,
    })),
    aggregate: null,
    duplicate_flags: [],
    total_items: 0,
    processed_count: 0,
    error_count: 0,
  };
  saveRegister(projectRef, register);
  return register;
}

function saveRegister(projectRef, register) {
  register.last_updated = new Date().toISOString();
  const filePath = path.join(REGISTER_DIR, projectRef.replace(/[^a-z0-9]/gi, '_') + '_register.json');
  fs.writeFileSync(filePath, JSON.stringify(register, null, 2));
  return register;
}

function loadRegister(projectRef) {
  const filePath = path.join(REGISTER_DIR, projectRef.replace(/[^a-z0-9]/gi, '_') + '_register.json');
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function updateDrawingStatus(projectRef, drawingId, update) {
  const register = loadRegister(projectRef);
  if (!register) throw new Error('Register not found: ' + projectRef);
  const drawing = register.drawings.find(d => d.id === drawingId);
  if (!drawing) throw new Error('Drawing not found: ' + drawingId);
  Object.assign(drawing, update);
  register.processed_count = register.drawings.filter(d => d.extraction_status === 'complete').length;
  register.error_count = register.drawings.filter(d => d.extraction_status === 'error').length;
  register.total_items = register.drawings.reduce((sum, d) => sum + (d.items_extracted || 0), 0);
  if (register.processed_count === register.drawings.length) register.status = 'complete';
  else if (register.processed_count > 0) register.status = 'processing';
  return saveRegister(projectRef, register);
}

function aggregateExtractions(projectRef) {
  const register = loadRegister(projectRef);
  if (!register) throw new Error('Register not found: ' + projectRef);

  const allItems = [];
  const duplicates = [];
  const seenItems = new Map();

  for (const drawing of register.drawings) {
    if (!drawing.extraction_result?.extraction) continue;
    for (const item of drawing.extraction_result.extraction) {
      const key = [
        item.trade,
        (item.description || '').toLowerCase().trim(),
        item.specification,
        item.unit,
      ].join('|');

      const enrichedItem = {
        ...item,
        source_drawing: drawing.id,
        source_file: drawing.original_name,
        drawing_reference: drawing.drawing_reference,
      };

      if (seenItems.has(key)) {
        const existing = seenItems.get(key);
        duplicates.push({
          description: item.description,
          trade: item.trade,
          drawing_1: existing.source_drawing,
          drawing_1_name: existing.source_file,
          drawing_1_qty: existing.quantity,
          drawing_2: drawing.id,
          drawing_2_name: drawing.original_name,
          drawing_2_qty: item.quantity,
          resolution: 'pending',
          action: null,
        });
      } else {
        seenItems.set(key, enrichedItem);
        allItems.push(enrichedItem);
      }
    }
  }

  const tradeBreakdown = {};
  for (const item of allItems) {
    const trade = item.trade || 'Unknown';
    if (!tradeBreakdown[trade]) tradeBreakdown[trade] = { items: 0 };
    tradeBreakdown[trade].items++;
  }

  register.aggregate = {
    total_items: allItems.length,
    duplicate_count: duplicates.length,
    trade_breakdown: tradeBreakdown,
    items: allItems,
    aggregated_at: new Date().toISOString(),
  };
  register.duplicate_flags = duplicates;

  return saveRegister(projectRef, register);
}

function resolveDuplicate(projectRef, duplicateIndex, action, keepDrawing) {
  const register = loadRegister(projectRef);
  if (!register) throw new Error('Register not found');
  const dup = register.duplicate_flags[duplicateIndex];
  if (!dup) throw new Error('Duplicate not found');

  dup.resolution = action;
  dup.keep_drawing = keepDrawing;
  dup.resolved_at = new Date().toISOString();

  if (action === 'remove' && register.aggregate?.items) {
    const removeFrom = keepDrawing === dup.drawing_1 ? dup.drawing_2 : dup.drawing_1;
    register.aggregate.items = register.aggregate.items.filter(i =>
      !(i.source_drawing === removeFrom &&
        i.description?.toLowerCase().trim() === dup.description?.toLowerCase().trim())
    );
  }

  return saveRegister(projectRef, register);
}

module.exports = { createRegister, loadRegister, updateDrawingStatus, aggregateExtractions, resolveDuplicate, saveRegister };
