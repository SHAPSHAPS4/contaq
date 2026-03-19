/**
 * File Upload Routes
 * POST /api/upload/drawing — single drawing PDF
 * POST /api/upload/spec — single spec PDF
 * POST /api/upload/multiple — up to 10 PDFs
 * DELETE /api/upload/:fileId — remove uploaded file
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { validatePDF, bufferToBase64, saveUpload, getFileSizeLabel, deleteUpload } = require('../services/pdf-processor');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are accepted'), false);
  },
});

router.post('/drawing', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const errors = validatePDF(req.file.buffer, req.file.originalname);
  if (errors.length) return res.status(400).json({ errors });
  const saved = saveUpload(req.file.buffer, req.file.originalname);
  res.json({
    success: true,
    file_id: saved.fileName,
    original_name: req.file.originalname,
    size_bytes: saved.sizeBytes,
    size_label: getFileSizeLabel(saved.sizeBytes),
    type: 'drawing',
  });
});

router.post('/spec', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const errors = validatePDF(req.file.buffer, req.file.originalname);
  if (errors.length) return res.status(400).json({ errors });
  const saved = saveUpload(req.file.buffer, req.file.originalname);
  res.json({
    success: true,
    file_id: saved.fileName,
    original_name: req.file.originalname,
    size_bytes: saved.sizeBytes,
    size_label: getFileSizeLabel(saved.sizeBytes),
    type: 'spec',
  });
});

router.post('/multiple', upload.array('files', 10), (req, res) => {
  if (!req.files || !req.files.length) return res.status(400).json({ error: 'No files uploaded' });
  const results = [];
  const errors = [];
  for (const file of req.files) {
    const validationErrors = validatePDF(file.buffer, file.originalname);
    if (validationErrors.length) {
      errors.push({ file: file.originalname, errors: validationErrors });
      continue;
    }
    const saved = saveUpload(file.buffer, file.originalname);
    results.push({
      file_id: saved.fileName,
      original_name: file.originalname,
      size_bytes: saved.sizeBytes,
      size_label: getFileSizeLabel(saved.sizeBytes),
    });
  }
  res.json({ success: true, uploaded: results, rejected: errors });
});

router.delete('/:fileId', (req, res) => {
  try {
    deleteUpload(req.params.fileId);
    res.json({ success: true });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

module.exports = router;
