/**
 * PDF Processor — upload, validation, base64 conversion
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '../uploads');
const MAX_FILE_SIZE_MB = 20;

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function validatePDF(buffer, originalName) {
  const errors = [];
  if (buffer.length > MAX_FILE_SIZE_MB * 1024 * 1024) {
    errors.push(`File exceeds ${MAX_FILE_SIZE_MB}MB limit`);
  }
  const header = buffer.slice(0, 4).toString('ascii');
  if (header !== '%PDF') {
    errors.push('File does not appear to be a valid PDF');
  }
  return errors;
}

function bufferToBase64(buffer) {
  return buffer.toString('base64');
}

function saveUpload(buffer, originalName) {
  const ext = path.extname(originalName);
  const hash = crypto.randomBytes(8).toString('hex');
  const fileName = `${Date.now()}_${hash}${ext}`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  fs.writeFileSync(filePath, buffer);
  return { fileName, filePath, sizeBytes: buffer.length };
}

function loadUpload(fileName) {
  const filePath = path.join(UPLOAD_DIR, fileName);
  if (!fs.existsSync(filePath)) throw new Error('Upload not found: ' + fileName);
  return fs.readFileSync(filePath);
}

function deleteUpload(fileName) {
  const filePath = path.join(UPLOAD_DIR, fileName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function getFileSizeLabel(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

module.exports = { validatePDF, bufferToBase64, saveUpload, loadUpload, deleteUpload, getFileSizeLabel };
