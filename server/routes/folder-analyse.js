/**
 * Folder Upload Analysis — AI-powered document classification and metadata extraction
 *
 * POST /api/folders/analyse
 *   Body: { files: [{ file_base64, file_name, mime_type }], target_folder, entity_type }
 *   Response: SSE stream → final JSON with classification per file
 */

const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const SYSTEM_PROMPT = `You are a document classification and metadata extraction assistant for UK M&E (Mechanical & Electrical) construction subcontractors.

You are given one or more uploaded documents. For each file, analyse the content and extract:

- document_type: What kind of document is this? Use one of: Drawing, Specification, Schedule, Letter, Email, Minutes, Programme, Report, Certificate, Purchase Order, Variation Order, Quote, Invoice, Delivery Note, Method Statement, Risk Assessment, O&M Manual, Test Certificate, Commissioning Record, Photo, Other
- suggested_folder: Which project folder best fits this document? Use one of: drawings, specs, documents, purchaseOrder, voQuote
  - drawings: Engineering/architectural drawings, layouts, GA drawings, isometrics, schematics, plans, sections, elevations, detail drawings
  - specs: NBS specifications, performance requirements, schedules of work, technical standards, compliance documents
  - documents: Emails, meeting minutes, programmes, reports, letters, memos, certificates, general correspondence
  - purchaseOrder: Purchase orders, order confirmations, contract awards, instruction to proceed, authorisations
  - voQuote: Variation orders, change orders, extra works, additional works, daywork sheets, omissions
- revision: Extract the revision/version identifier. Look for: "Rev A", "Rev 01", "Version 2", "Draft", "Issue 3", "P01", "C02" etc. Return as a short string (e.g. "A", "01", "v2", "Draft"). Use "1" if no revision is indicated.
- title: A clean, concise title for the document extracted from its content (not the filename). Max 80 characters.
- summary: A one-line summary of what the document contains (max 120 characters).
- date: Any date found in the document (issue date, revision date, letter date). Return as YYYY-MM-DD or null.
- author: The author, sender, or issuing party if identifiable. Or null.

Rules:
- Analyse the CONTENT of each file, not just the filename.
- If a file is an image (photo), classify as document_type "Photo" and suggested_folder "documents".
- For multi-page documents, look at the title page and headers for classification.
- Be precise with revision extraction — look for revision tables, title blocks, header stamps.
- If the document clearly belongs in a different folder than the user selected, flag it via suggested_folder.

Return ONLY a JSON object:
{
  "files": [
    {
      "filename": "original_filename.pdf",
      "document_type": "Drawing",
      "suggested_folder": "drawings",
      "revision": "B",
      "title": "Ground Floor Pipework Layout — Block A",
      "summary": "Heating pipework layout showing LTHW flow and return routes for ground floor",
      "date": "2026-02-15",
      "author": "Smith & Jones Consulting Engineers"
    }
  ]
}`;

router.post('/analyse', optionalAuth, async (req, res) => {
  try {
    const { files, target_folder, entity_type } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        error: { type: 'invalid_request', message: 'files array is required' }
      });
    }

    // Limit to 10 files per request
    if (files.length > 10) {
      return res.status(400).json({
        error: { type: 'invalid_request', message: 'Maximum 10 files per request.' }
      });
    }

    console.log(`[Folder Analyse] Starting: ${files.length} file(s), target=${target_folder || 'auto'}`);
    const startTime = Date.now();

    // Build content blocks — one document/image block per file
    const contentBlocks = [];
    for (const f of files) {
      if (!f.file_base64 || !f.mime_type) continue;

      const isPdf = f.mime_type === 'application/pdf';
      const isImage = f.mime_type.startsWith('image/');

      if (isPdf) {
        contentBlocks.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: f.file_base64 }
        });
      } else if (isImage) {
        contentBlocks.push({
          type: 'image',
          source: { type: 'base64', media_type: f.mime_type, data: f.file_base64 }
        });
      } else {
        contentBlocks.push({
          type: 'document',
          source: { type: 'base64', media_type: f.mime_type, data: f.file_base64 }
        });
      }

      contentBlocks.push({
        type: 'text',
        text: `Filename: ${f.file_name || 'unknown'}`
      });
    }

    const userPrompt = `Analyse ${files.length === 1 ? 'this document' : 'these ' + files.length + ' documents'} and return the classification JSON.`
      + (target_folder ? `\n\nThe user is uploading to the "${target_folder}" folder. Still analyse and suggest the correct folder — flag if it differs.` : '');

    contentBlocks.push({ type: 'text', text: userPrompt });

    // Stream SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const anthropicBody = {
      model: 'claude-haiku-4-5-20251001',  // Haiku for speed — classification doesn't need Sonnet
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: contentBlocks }],
      stream: true
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    const anthropicResp = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-beta': 'pdfs-2024-09-25'
      },
      body: JSON.stringify(anthropicBody),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!anthropicResp.ok) {
      const errorBody = await anthropicResp.text();
      console.error(`[Folder Analyse] Anthropic error ${anthropicResp.status}`);
      res.write(`data: ${JSON.stringify({ error: true, status: anthropicResp.status, message: errorBody })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    let fullText = '';
    let usage = { input_tokens: 0, output_tokens: 0 };
    let stopReason = 'end_turn';
    let respModel = 'claude-haiku-4-5-20251001';

    const reader = anthropicResp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let lastFileCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const event = JSON.parse(data);

          if (event.type === 'content_block_delta' && event.delta?.text) {
            fullText += event.delta.text;

            const fileMatches = fullText.match(/"filename"\s*:/g);
            const currentCount = fileMatches ? fileMatches.length : 0;
            if (currentCount > lastFileCount) {
              lastFileCount = currentCount;
              res.write(`data: ${JSON.stringify({ progress: true, files_analysed: currentCount })}\n\n`);
            } else {
              res.write(': keepalive\n\n');
            }
          }
          if (event.type === 'message_start' && event.message) {
            respModel = event.message.model || respModel;
            if (event.message.usage) usage.input_tokens = event.message.usage.input_tokens;
          }
          if (event.type === 'message_delta') {
            stopReason = event.delta?.stop_reason || stopReason;
            if (event.usage) usage.output_tokens = event.usage.output_tokens;
          }
        } catch {}
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Folder Analyse] Done: ${fullText.length} chars in ${elapsed}s (${usage.input_tokens}+${usage.output_tokens} tokens)`);

    let parsed;
    try {
      const jsonMatch = fullText.match(/```json\n?([\s\S]*?)\n?```/) || fullText.match(/(\{[\s\S]*\})/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[1]);
      else parsed = JSON.parse(fullText);
    } catch {
      parsed = { error: true, raw_text: fullText, parse_error: 'Failed to parse AI response as JSON' };
    }

    const result = {
      type: 'result',
      data: parsed,
      usage,
      model: respModel,
      elapsed_seconds: parseFloat(elapsed)
    };
    res.write(`data: ${JSON.stringify(result)}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();

    if (req.orgId) {
      try {
        const { saveExtraction } = require('../db/queries');
        await saveExtraction(req.orgId, {
          stage: 'folder-analyse',
          result_json: { files_analysed: files.length },
          tokens_used: (usage.input_tokens || 0) + (usage.output_tokens || 0),
          model: respModel,
          created_by: req.user?.id
        });
      } catch (e) { console.error('[DB] Failed to save folder analysis:', e.message); }
    }

  } catch (err) {
    const errMsg = err.name === 'AbortError'
      ? 'AI request timed out. Try with fewer or smaller files.'
      : 'Failed to analyse files. Please try again.';
    console.error('[Folder Analyse] Error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: { type: 'proxy_error', message: errMsg } });
    } else {
      res.write(`data: ${JSON.stringify({ error: true, message: errMsg })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
});

module.exports = router;
