/**
 * Pricebook Import — AI-powered extraction from supplier price books
 *
 * POST /api/pricebook/import
 *   Body: { file_base64, file_name, mime_type }
 *   Response: SSE stream → final JSON with extracted materials
 */

const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const SYSTEM_PROMPT = `You are an expert M&E (Mechanical & Electrical) materials pricing analyst for UK construction subcontractors — pipe fitters, plumbers, electricians, AC/ductwork, ventilation, fire stopping, insulation/lagging, and trace heating trades.

Your task is to extract every material/product line item from the uploaded supplier price book document and return structured JSON.

For each item, extract:
- name: The full product/material name including size, specification, thickness etc.
- unit: Unit of measurement (m, m², roll, sheet, pack, section, board, tin, kit, box, pair, length, each/nr). Normalise to lowercase abbreviations.
- qty_per_pack: Quantity per pack/bundle if stated (integer or null if sold individually)
- supplier_price: The price per unit as a decimal number. Use the trade/wholesale price if multiple price columns exist (not RRP). Exclude VAT.
- category: Classify into one of these categories: Pipe Insulation, Sheet Insulation, High-Temp Insulation, Ductwork, Adhesives & Tape, Fixings, Cladding, Tools, Trace Heating, Fire Stopping, Acoustic, Valves & Fittings, Supports & Hangers, Refrigerant, Cable & Trunking, Consumables, PPE, Other
- supplier: The supplier/manufacturer name (extract from document header, footer, or branding if present)

Rules:
- Extract ALL rows — do not skip or summarise. Every single product line must appear.
- If a price is given per pack but the unit is per metre, calculate the per-unit price.
- Ignore header rows, subtotals, delivery charges, and VAT lines.
- If the document has multiple sheets/pages, extract from all of them.
- If you cannot determine a field, use null (never guess prices).
- Prices must be numeric (no £ symbol, no commas).

Return ONLY a JSON object in this exact format:
{
  "supplier_name": "Detected supplier name or null",
  "items_found": <number>,
  "items": [
    {
      "name": "Armaflex AF Insulation Tube 15mm x 9mm",
      "unit": "m",
      "qty_per_pack": 2,
      "supplier_price": 1.42,
      "category": "Pipe Insulation",
      "supplier": "Armacell UK"
    }
  ]
}`;

const USER_PROMPT = `Extract every material/product line item from this supplier price book. Return the complete JSON with all items. Do not skip any rows.`;

router.post('/import', optionalAuth, async (req, res) => {
  try {
    const { file_base64, file_name, mime_type } = req.body;

    if (!file_base64 || !mime_type) {
      return res.status(400).json({
        error: { type: 'invalid_request', message: 'file_base64 and mime_type are required' }
      });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'];
    if (!allowedTypes.includes(mime_type) && !mime_type.startsWith('image/')) {
      return res.status(400).json({
        error: { type: 'invalid_request', message: 'Unsupported file type. Upload PDF, Excel, or image files.' }
      });
    }

    // Validate base64 size (rough check — 50MB limit)
    if (file_base64.length > 67_000_000) {
      return res.status(400).json({
        error: { type: 'invalid_request', message: 'File too large. Maximum 50MB.' }
      });
    }

    console.log(`[Pricebook Import] Starting: ${file_name || 'unknown'} (${mime_type}, ${Math.round(file_base64.length * 0.75 / 1024)} KB)`);
    const startTime = Date.now();

    // Build content blocks — use 'document' for PDFs, 'image' for images
    const isPdf = mime_type === 'application/pdf';
    const isImage = mime_type.startsWith('image/');
    const contentBlocks = [];

    if (isPdf) {
      contentBlocks.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: file_base64 }
      });
    } else if (isImage) {
      contentBlocks.push({
        type: 'image',
        source: { type: 'base64', media_type: mime_type, data: file_base64 }
      });
    } else {
      // Excel files — send as document (Claude can read xlsx via document type)
      contentBlocks.push({
        type: 'document',
        source: { type: 'base64', media_type: mime_type, data: file_base64 }
      });
    }

    contentBlocks.push({
      type: 'text',
      text: USER_PROMPT + (file_name ? `\n\nFilename: ${file_name}` : '')
    });

    // Stream SSE to keep connection alive through Cloudflare
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const anthropicBody = {
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: contentBlocks }],
      stream: true
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000);

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
      console.error(`[Pricebook Import] Anthropic error ${anthropicResp.status}`);
      res.write(`data: ${JSON.stringify({ error: true, status: anthropicResp.status, message: errorBody })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    // Stream chunks back — send item count updates so frontend can show progress
    let fullText = '';
    let usage = { input_tokens: 0, output_tokens: 0 };
    let stopReason = 'end_turn';
    let respModel = 'claude-sonnet-4-6';

    const reader = anthropicResp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let lastItemCount = 0;

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

            // Count extracted items so far for progress updates
            const itemMatches = fullText.match(/"name"\s*:/g);
            const currentCount = itemMatches ? itemMatches.length : 0;
            if (currentCount > lastItemCount) {
              lastItemCount = currentCount;
              res.write(`data: ${JSON.stringify({ progress: true, items_so_far: currentCount })}\n\n`);
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
    console.log(`[Pricebook Import] Done: ${fullText.length} chars in ${elapsed}s (${usage.input_tokens}+${usage.output_tokens} tokens)`);

    // Parse the extracted JSON
    let parsed;
    try {
      const jsonMatch = fullText.match(/```json\n?([\s\S]*?)\n?```/) || fullText.match(/(\{[\s\S]*\})/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[1]);
      else parsed = JSON.parse(fullText);
    } catch {
      parsed = { error: true, raw_text: fullText, parse_error: 'Failed to parse AI response as JSON' };
    }

    // Send final result
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

    // Save extraction record to database if authenticated
    if (req.orgId) {
      try {
        const { saveExtraction } = require('../db/queries');
        await saveExtraction(req.orgId, {
          stage: 'pricebook-import',
          result_json: { items_found: parsed.items_found || 0, supplier: parsed.supplier_name },
          tokens_used: (usage.input_tokens || 0) + (usage.output_tokens || 0),
          model: respModel,
          created_by: req.user?.id
        });
      } catch (e) { console.error('[DB] Failed to save pricebook extraction:', e.message); }
    }

  } catch (err) {
    const errMsg = err.name === 'AbortError'
      ? 'AI request timed out (3 min). Try with a smaller document.'
      : 'Failed to process price book. Please try again.';
    console.error('[Pricebook Import] Error:', err.message);
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
