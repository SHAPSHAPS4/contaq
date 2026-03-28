/**
 * Client Register Import — AI-powered extraction from client lists / spreadsheets
 *
 * POST /api/clients/import
 *   Body: { file_base64, file_name, mime_type }
 *   Response: SSE stream → final JSON with extracted client records
 */

const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const SYSTEM_PROMPT = `You are an expert data extraction assistant for UK construction subcontractors. You specialise in parsing client registers, customer lists, and contractor databases used in the M&E (Mechanical & Electrical) fit-out industry.

Your task is to extract every client/company record from the uploaded document and return structured JSON.

For each client, extract:
- name: The company/organisation name (full legal or trading name)
- sector: Classify into one of: Tier-1 Contractor, Tier-2 Contractor, Regional Contractor, Fit-Out Contractor, Developer, Engineering, Project Management, Facilities Management, Public Sector, Other
- contact: Primary contact person's full name (or null if not listed)
- phone: Primary phone number, preserving original format (or null)
- email: Primary email address (or null)
- address: Full postal address on one line (or null)
- credit_terms: Payment terms in days as an integer (e.g. 30, 45, 60). Look for "payment terms", "credit days", "net X days". Use null if not stated.
- retention_pct: Retention percentage as a number (e.g. 5 for 5%). Look for "retention", "retentions". Use null if not stated.
- notes: Any additional notes, status, or comments from the document (or null)
- since: Year the relationship started if mentioned (e.g. "2021"), or null

Rules:
- Extract ALL client rows — do not skip or summarise.
- If a company appears multiple times (e.g. different contacts), create one record with the primary contact.
- Ignore header rows, totals, blank rows, and formatting artefacts.
- If the document has multiple sheets/pages, extract from all of them.
- If you cannot determine a field, use null (never fabricate contact details).
- Clean up formatting: trim whitespace, normalise phone numbers, fix obvious typos in emails.

Return ONLY a JSON object in this exact format:
{
  "source_description": "Brief description of the document (e.g. 'Excel client register with 45 rows')",
  "clients_found": <number>,
  "clients": [
    {
      "name": "Balfour Beatty",
      "sector": "Tier-1 Contractor",
      "contact": "Sarah Webb",
      "phone": "020 7216 6800",
      "email": "s.webb@balfourbeatty.com",
      "address": "130 Wilton Road, London SW1V 1LQ",
      "credit_terms": 30,
      "retention_pct": 5,
      "notes": "Major framework contractor. Priority account.",
      "since": "2019"
    }
  ]
}`;

const USER_PROMPT = `Extract every client/company record from this document. Return the complete JSON with all clients. Do not skip any rows.`;

router.post('/import', optionalAuth, async (req, res) => {
  try {
    const { file_base64, file_name, mime_type } = req.body;

    if (!file_base64 || !mime_type) {
      return res.status(400).json({
        error: { type: 'invalid_request', message: 'file_base64 and mime_type are required' }
      });
    }

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'];
    if (!allowedTypes.includes(mime_type) && !mime_type.startsWith('image/')) {
      return res.status(400).json({
        error: { type: 'invalid_request', message: 'Unsupported file type. Upload PDF, Excel, or image files.' }
      });
    }

    if (file_base64.length > 67_000_000) {
      return res.status(400).json({
        error: { type: 'invalid_request', message: 'File too large. Maximum 50MB.' }
      });
    }

    console.log(`[Client Import] Starting: ${file_name || 'unknown'} (${mime_type}, ${Math.round(file_base64.length * 0.75 / 1024)} KB)`);
    const startTime = Date.now();

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
      contentBlocks.push({
        type: 'document',
        source: { type: 'base64', media_type: mime_type, data: file_base64 }
      });
    }

    contentBlocks.push({
      type: 'text',
      text: USER_PROMPT + (file_name ? `\n\nFilename: ${file_name}` : '')
    });

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
      console.error(`[Client Import] Anthropic error ${anthropicResp.status}`);
      res.write(`data: ${JSON.stringify({ error: true, status: anthropicResp.status, message: errorBody })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    let fullText = '';
    let usage = { input_tokens: 0, output_tokens: 0 };
    let stopReason = 'end_turn';
    let respModel = 'claude-sonnet-4-6';

    const reader = anthropicResp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let lastClientCount = 0;

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

            const clientMatches = fullText.match(/"name"\s*:/g);
            const currentCount = clientMatches ? clientMatches.length : 0;
            if (currentCount > lastClientCount) {
              lastClientCount = currentCount;
              res.write(`data: ${JSON.stringify({ progress: true, clients_so_far: currentCount })}\n\n`);
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
    console.log(`[Client Import] Done: ${fullText.length} chars in ${elapsed}s (${usage.input_tokens}+${usage.output_tokens} tokens)`);

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
          stage: 'client-import',
          result_json: { clients_found: parsed.clients_found || 0 },
          tokens_used: (usage.input_tokens || 0) + (usage.output_tokens || 0),
          model: respModel,
          created_by: req.user?.id
        });
      } catch (e) { console.error('[DB] Failed to save client extraction:', e.message); }
    }

  } catch (err) {
    const errMsg = err.name === 'AbortError'
      ? 'AI request timed out (3 min). Try with a smaller document.'
      : 'Failed to process client records. Please try again.';
    console.error('[Client Import] Error:', err.message);
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
