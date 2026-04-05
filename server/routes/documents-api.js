/**
 * Documents API — file upload, retrieval, management
 *
 * POST   /api/documents/upload        — Upload file to Supabase Storage + DB record
 * GET    /api/documents               — List documents for org (optionally by project)
 * GET    /api/documents/:id           — Get document metadata
 * GET    /api/documents/:id/download  — Get signed download URL
 * DELETE /api/documents/:id           — Delete document (storage + DB)
 * GET    /api/documents/aged          — List documents older than 12 months
 *
 * GET    /api/extractions             — List extractions for org
 * GET    /api/extractions/:id         — Get single extraction with full result
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const storage = require('../services/file-storage');

// Multer config — 50MB max, memory storage (buffer available)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 52428800 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.xlsx', '.xls', '.dwg', '.png', '.jpg', '.jpeg', '.docx'];
    const ext = '.' + file.originalname.split('.').pop().toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('File type not allowed: ' + ext));
  }
});

router.use(requireAuth);

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file provided' });

    const result = await storage.uploadFile({
      orgId: req.orgId,
      userId: req.user.id,
      projectId: req.body.project_id || null,
      fileBuffer: req.file.buffer,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      folder: req.body.folder || '/',
      notes: req.body.notes || null,
    });

    res.json({
      success: true,
      document: result.document,
      storage_path: result.storagePath,
    });
  } catch (err) {
    console.error('[Documents] Upload error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Upload multiple files
router.post('/upload-multiple', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, error: 'No files provided' });

    const results = [];
    for (const file of req.files) {
      const result = await storage.uploadFile({
        orgId: req.orgId,
        userId: req.user.id,
        projectId: req.body.project_id || null,
        fileBuffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
        folder: req.body.folder || '/',
      });
      results.push(result.document);
    }

    res.json({ success: true, documents: results, count: results.length });
  } catch (err) {
    console.error('[Documents] Multi-upload error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// List documents
router.get('/', async (req, res) => {
  try {
    const docs = await storage.listDocuments(req.orgId, {
      projectId: req.query.project_id,
      folder: req.query.folder,
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
    });
    res.json({ success: true, documents: docs, count: docs.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get document metadata
router.get('/:id', async (req, res) => {
  try {
    const doc = await storage.getDocument(req.orgId, req.params.id);
    res.json({ success: true, document: doc });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

// Get signed download URL
router.get('/:id/download', async (req, res) => {
  try {
    const doc = await storage.getDocument(req.orgId, req.params.id);
    const url = await storage.getSignedUrl(doc.storage_url, 3600);
    res.json({ success: true, download_url: url, expires_in: 3600 });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete document
router.delete('/:id', async (req, res) => {
  try {
    await storage.deleteDocument(req.orgId, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Aged documents (12-month retention policy)
router.get('/retention/aged', async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 12;
    const docs = await storage.getAgedDocuments(req.orgId, months);
    res.json({
      success: true,
      aged_documents: docs,
      count: docs.length,
      threshold_months: months,
      message: docs.length > 0
        ? `${docs.length} document(s) are older than ${months} months. Review and delete if no longer needed.`
        : `No documents older than ${months} months.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// List extractions
router.get('/extractions/list', async (req, res) => {
  try {
    const extractions = await storage.listExtractions(req.orgId, {
      stage: req.query.stage,
      quoteId: req.query.quote_id,
      limit: parseInt(req.query.limit) || 50,
    });
    res.json({ success: true, extractions, count: extractions.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single extraction
router.get('/extractions/:id', async (req, res) => {
  try {
    const extraction = await storage.getExtraction(req.orgId, req.params.id);
    res.json({ success: true, extraction });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
});

module.exports = router;
