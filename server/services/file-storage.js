/**
 * File Storage Service — Supabase Storage + DB metadata
 *
 * Stores files in Supabase Storage bucket 'documents'.
 * Creates records in the documents table linked to org/project.
 * Handles retrieval, signed URLs, and retention policy.
 */

const { createClient } = require('@supabase/supabase-js');

function getClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

const BUCKET = 'documents';

/**
 * Upload a file to Supabase Storage and create a DB record.
 * @param {Object} opts
 * @param {string} opts.orgId - Organization ID
 * @param {string} opts.userId - Uploading user ID
 * @param {string} opts.projectId - Project ID (optional)
 * @param {Buffer|Uint8Array} opts.fileBuffer - File content
 * @param {string} opts.fileName - Original file name
 * @param {string} opts.mimeType - MIME type
 * @param {string} opts.folder - Logical folder path (default '/')
 * @param {string} opts.notes - Optional notes
 * @returns {Object} { document, storageUrl }
 */
async function uploadFile({ orgId, userId, projectId, fileBuffer, fileName, mimeType, folder, notes }) {
  const sb = getClient();

  // Build storage path: org_id/project_id/timestamp_filename
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${orgId}/${projectId || 'general'}/${timestamp}_${safeName}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadErr } = await sb.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType || 'application/pdf',
      upsert: false,
    });

  if (uploadErr) throw new Error('Storage upload failed: ' + uploadErr.message);

  // Create DB record
  const { data: doc, error: docErr } = await sb.from('documents').insert({
    org_id: orgId,
    project_id: projectId || null,
    folder: folder || '/',
    name: fileName,
    type: fileName.split('.').pop().toLowerCase(),
    size_bytes: fileBuffer.length,
    storage_url: storagePath,
    uploaded_by: userId || null,
    version: 1,
    notes: notes || null,
  }).select().single();

  if (docErr) {
    // Clean up storage if DB insert fails
    await sb.storage.from(BUCKET).remove([storagePath]).catch(() => {});
    throw new Error('Document record creation failed: ' + docErr.message);
  }

  console.log(`[Storage] Uploaded ${fileName} (${(fileBuffer.length / 1024).toFixed(1)}KB) → ${storagePath}`);
  return { document: doc, storagePath };
}

/**
 * Get a signed download URL for a document (valid 1 hour).
 */
async function getSignedUrl(storagePath, expiresIn) {
  const sb = getClient();
  const { data, error } = await sb.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresIn || 3600);

  if (error) throw new Error('Signed URL failed: ' + error.message);
  return data.signedUrl;
}

/**
 * List documents for an org, optionally filtered by project.
 */
async function listDocuments(orgId, { projectId, folder, limit, offset } = {}) {
  const sb = getClient();
  let query = sb.from('documents').select('*').eq('org_id', orgId).order('created_at', { ascending: false });

  if (projectId) query = query.eq('project_id', projectId);
  if (folder) query = query.eq('folder', folder);
  if (limit) query = query.limit(limit);
  if (offset) query = query.range(offset, offset + (limit || 50) - 1);

  const { data, error } = await query;
  if (error) throw new Error('List documents failed: ' + error.message);
  return data || [];
}

/**
 * Get a single document by ID.
 */
async function getDocument(orgId, documentId) {
  const sb = getClient();
  const { data, error } = await sb.from('documents').select('*')
    .eq('org_id', orgId).eq('id', documentId).single();
  if (error) throw new Error('Document not found: ' + error.message);
  return data;
}

/**
 * Delete a document (storage + DB record).
 */
async function deleteDocument(orgId, documentId) {
  const sb = getClient();

  // Get the document to find storage path
  const { data: doc, error: getErr } = await sb.from('documents').select('storage_url')
    .eq('org_id', orgId).eq('id', documentId).single();
  if (getErr) throw new Error('Document not found');

  // Delete from storage
  if (doc.storage_url) {
    await sb.storage.from(BUCKET).remove([doc.storage_url]).catch(e => {
      console.warn('[Storage] Could not delete file:', e.message);
    });
  }

  // Delete DB record
  const { error: delErr } = await sb.from('documents').delete()
    .eq('org_id', orgId).eq('id', documentId);
  if (delErr) throw new Error('Delete failed: ' + delErr.message);

  return true;
}

/**
 * Save an extraction result to the extractions table.
 */
async function saveExtraction({ orgId, userId, quoteId, stage, inputFiles, resultJson, grade, score, itemsCount, flagsCount, tokensUsed, model, processingMs }) {
  const sb = getClient();
  const { data, error } = await sb.from('extractions').insert({
    org_id: orgId,
    quote_id: quoteId || null,
    stage: stage || 'drawing',
    input_files: inputFiles || [],
    result_json: resultJson || {},
    grade: grade || null,
    score: score || null,
    items_count: itemsCount || 0,
    flags_count: flagsCount || 0,
    tokens_used: tokensUsed || 0,
    model: model || 'claude-sonnet-4-6',
    processing_ms: processingMs || 0,
    created_by: userId || null,
  }).select().single();

  if (error) throw new Error('Save extraction failed: ' + error.message);
  console.log(`[Storage] Extraction saved: ${data.id} (${stage}, ${itemsCount} items)`);
  return data;
}

/**
 * List extractions for an org.
 */
async function listExtractions(orgId, { stage, quoteId, limit } = {}) {
  const sb = getClient();
  let query = sb.from('extractions').select('*').eq('org_id', orgId).order('created_at', { ascending: false });

  if (stage) query = query.eq('stage', stage);
  if (quoteId) query = query.eq('quote_id', quoteId);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw new Error('List extractions failed: ' + error.message);
  return data || [];
}

/**
 * Get a single extraction by ID.
 */
async function getExtraction(orgId, extractionId) {
  const sb = getClient();
  const { data, error } = await sb.from('extractions').select('*')
    .eq('org_id', orgId).eq('id', extractionId).single();
  if (error) throw new Error('Extraction not found: ' + error.message);
  return data;
}

/**
 * 12-month retention policy: find documents older than N months.
 */
async function getAgedDocuments(orgId, months) {
  const sb = getClient();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - (months || 12));

  const { data, error } = await sb.from('documents').select('*')
    .eq('org_id', orgId)
    .lt('created_at', cutoff.toISOString())
    .order('created_at', { ascending: true });

  if (error) throw new Error('Aged documents query failed: ' + error.message);
  return data || [];
}

module.exports = {
  uploadFile,
  getSignedUrl,
  listDocuments,
  getDocument,
  deleteDocument,
  saveExtraction,
  listExtractions,
  getExtraction,
  getAgedDocuments,
  BUCKET,
};
