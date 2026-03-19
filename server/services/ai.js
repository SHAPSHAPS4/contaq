/**
 * AI Service — Anthropic Claude API abstraction
 *
 * Single point of contact for all Claude API calls.
 * Handles authentication, model validation, and response parsing.
 */

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

const ALLOWED_MODELS = [
  'claude-sonnet-4-6',
  'claude-sonnet-4-20250514',
  'claude-haiku-4-5-20251001'
];

/**
 * Call Claude API with structured inputs.
 *
 * @param {Object} options
 * @param {string} options.systemPrompt - System prompt with KB context
 * @param {string} options.userPrompt - User instruction text
 * @param {Array} [options.documents] - Array of { base64, mimeType } for PDFs/images
 * @param {number} [options.maxTokens=4000] - Max response tokens
 * @param {string} [options.model='claude-sonnet-4-6'] - Model to use
 * @returns {Object} Parsed AI response (JSON or raw text)
 */
async function callAI({ systemPrompt, userPrompt, documents = [], maxTokens = 4000, model = 'claude-sonnet-4-6' }) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const safeModel = ALLOWED_MODELS.includes(model) ? model : 'claude-sonnet-4-6';

  // Build content blocks
  const contentBlocks = [];

  // Add documents (PDFs, images)
  for (const doc of documents) {
    if (!doc.base64 || !doc.mimeType) continue;

    if (doc.mimeType === 'application/pdf') {
      contentBlocks.push({
        type: 'document',
        source: { type: 'base64', media_type: doc.mimeType, data: doc.base64 }
      });
    } else if (doc.mimeType.startsWith('image/')) {
      contentBlocks.push({
        type: 'image',
        source: { type: 'base64', media_type: doc.mimeType, data: doc.base64 }
      });
    }

    if (doc.filename) {
      contentBlocks.push({ type: 'text', text: `Filename: ${doc.filename}` });
    }
  }

  // Add user prompt text
  contentBlocks.push({ type: 'text', text: userPrompt });

  // Build request
  const requestBody = {
    model: safeModel,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: contentBlocks.length === 1 ? userPrompt : contentBlocks }]
  };

  const resp = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': ANTHROPIC_VERSION
    },
    body: JSON.stringify(requestBody)
  });

  if (!resp.ok) {
    const errBody = await resp.text();
    let detail = errBody;
    try { const j = JSON.parse(errBody); detail = (j.error && j.error.message) || errBody; } catch {}
    throw new Error(`Anthropic API ${resp.status}: ${detail}`);
  }

  const apiData = await resp.json();

  // Extract text from response
  let rawText = '';
  if (apiData.content && Array.isArray(apiData.content)) {
    for (const block of apiData.content) {
      if (block.type === 'text') rawText += block.text;
    }
  }

  // Try to parse as JSON
  const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

  return {
    raw: rawText,
    json: jsonMatch ? tryParse(jsonMatch[0]) : null,
    model: apiData.model,
    usage: apiData.usage,
    stop_reason: apiData.stop_reason
  };
}

function tryParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}

module.exports = { callAI, ALLOWED_MODELS };
