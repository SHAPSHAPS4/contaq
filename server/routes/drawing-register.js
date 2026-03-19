/**
 * Drawing Register Routes — multi-drawing project management
 * POST /api/register/create
 * GET  /api/register/:projectRef
 * POST /api/register/:projectRef/process-all
 * POST /api/register/:projectRef/reprocess/:drawingId
 * GET  /api/register/:projectRef/aggregate
 * POST /api/register/:projectRef/resolve-duplicate
 */

const express = require('express');
const router = express.Router();
const {
  createRegister, loadRegister, updateDrawingStatus,
  aggregateExtractions, resolveDuplicate,
} = require('../services/drawing-register');
const { validateExtraction } = require('../services/extraction-validator');
const { callAI } = require('../services/ai');
const { loadUpload, bufferToBase64 } = require('../services/pdf-processor');
const { assembleKBPrompt } = require('../kb/index');
const { logSession } = require('../services/session-logger');

router.post('/create', (req, res) => {
  const { project_ref, drawings } = req.body;
  if (!project_ref || !drawings?.length) return res.status(400).json({ error: 'project_ref and drawings required' });
  const register = createRegister(project_ref, drawings);
  res.json({ success: true, register });
});

router.get('/:projectRef', (req, res) => {
  const register = loadRegister(req.params.projectRef);
  if (!register) return res.status(404).json({ error: 'Register not found' });
  res.json(register);
});

router.post('/:projectRef/process-all', async (req, res) => {
  const register = loadRegister(req.params.projectRef);
  if (!register) return res.status(404).json({ error: 'Register not found' });

  // Respond immediately — processing happens asynchronously
  res.json({ success: true, message: 'Processing started', total: register.drawings.length });

  const kbPrompt = (() => {
    try { return assembleKBPrompt('/api/drawings/extract', { priorityFilter: 'critical' }); }
    catch { return ''; }
  })();

  for (const drawing of register.drawings) {
    if (drawing.extraction_status !== 'pending') continue;

    updateDrawingStatus(req.params.projectRef, drawing.id, { extraction_status: 'processing' });

    try {
      const buffer = loadUpload(drawing.file_id);
      const base64 = bufferToBase64(buffer);

      const systemPrompt = `You are an expert M&E estimating assistant.\n${kbPrompt}\nYou MUST respond with valid JSON only.`;
      const userPrompt = `Analyse this M&E drawing and extract all quantities.\nProject reference: ${req.params.projectRef}\nOutput with drawing_reference, extraction array, and flags array.`;

      const result = await callAI({
        systemPrompt, userPrompt,
        documents: [{ base64, mimeType: 'application/pdf' }],
        maxTokens: 8000,
      });

      const validation = validateExtraction(result.data);

      updateDrawingStatus(req.params.projectRef, drawing.id, {
        extraction_status: 'complete',
        extraction_result: result.data,
        validation_score: validation.score,
        validation_grade: validation.grade,
        items_extracted: result.data?.extraction?.length || 0,
        flags_raised: result.data?.flags?.length || 0,
        drawing_reference: result.data?.drawing_reference || null,
        processed_at: new Date().toISOString(),
      });

      logSession({
        type: 'drawing_extract_batch',
        project_ref: req.params.projectRef,
        drawing_id: drawing.id,
        tokens: result.usage,
        items: result.data?.extraction?.length || 0,
        validation_score: validation.score,
      });
    } catch (err) {
      updateDrawingStatus(req.params.projectRef, drawing.id, {
        extraction_status: 'error',
        error: err.message,
        processed_at: new Date().toISOString(),
      });
    }
  }

  // Aggregate after all drawings processed
  aggregateExtractions(req.params.projectRef);
});

router.post('/:projectRef/reprocess/:drawingId', async (req, res) => {
  const register = loadRegister(req.params.projectRef);
  if (!register) return res.status(404).json({ error: 'Register not found' });
  const drawing = register.drawings.find(d => d.id === req.params.drawingId);
  if (!drawing) return res.status(404).json({ error: 'Drawing not found' });
  updateDrawingStatus(req.params.projectRef, drawing.id, { extraction_status: 'pending', error: null });
  res.json({ success: true, message: 'Drawing reset to pending — trigger process-all to reprocess' });
});

router.get('/:projectRef/aggregate', (req, res) => {
  try {
    const register = aggregateExtractions(req.params.projectRef);
    res.json({ success: true, aggregate: register.aggregate, duplicates: register.duplicate_flags });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:projectRef/resolve-duplicate', (req, res) => {
  try {
    const { duplicate_index, action, keep_drawing } = req.body;
    const register = resolveDuplicate(req.params.projectRef, duplicate_index, action, keep_drawing);
    res.json({ success: true, register });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
