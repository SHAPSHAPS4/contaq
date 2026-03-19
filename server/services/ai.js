/**
 * AI Service — Anthropic Claude SDK wrapper
 * Single point of contact for all Claude API calls.
 */

const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function callAI({ systemPrompt, userPrompt, documents = [], maxTokens = 8000, model = 'claude-sonnet-4-6' }) {
  const contentBlocks = [];

  for (const doc of documents) {
    if (doc.base64 && doc.mimeType) {
      contentBlocks.push({
        type: 'document',
        source: { type: 'base64', media_type: doc.mimeType, data: doc.base64 },
      });
    }
  }

  contentBlocks.push({ type: 'text', text: userPrompt });

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: contentBlocks }],
  });

  const raw = response.content[0]?.text || '';
  const usage = {
    input_tokens: response.usage?.input_tokens || 0,
    output_tokens: response.usage?.output_tokens || 0,
    total_tokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
  };

  let parsed = raw;
  try {
    const jsonMatch = raw.match(/```json\n?([\s\S]*?)\n?```/) || raw.match(/(\{[\s\S]*\})/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[1]);
    else parsed = JSON.parse(raw);
  } catch {
    parsed = { raw_text: raw, parse_error: true };
  }

  return { data: parsed, raw, usage };
}

async function callAIStream({ systemPrompt, userPrompt, documents = [], maxTokens = 8000, model = 'claude-sonnet-4-6', onChunk }) {
  const contentBlocks = [];

  for (const doc of documents) {
    if (doc.base64 && doc.mimeType) {
      contentBlocks.push({
        type: 'document',
        source: { type: 'base64', media_type: doc.mimeType, data: doc.base64 },
      });
    }
  }

  contentBlocks.push({ type: 'text', text: userPrompt });

  const stream = await client.messages.stream({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: contentBlocks }],
  });

  let fullText = '';
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
      fullText += chunk.delta.text;
      if (onChunk) onChunk(chunk.delta.text);
    }
  }

  const finalMessage = await stream.finalMessage();
  const usage = {
    input_tokens: finalMessage.usage?.input_tokens || 0,
    output_tokens: finalMessage.usage?.output_tokens || 0,
    total_tokens: (finalMessage.usage?.input_tokens || 0) + (finalMessage.usage?.output_tokens || 0),
  };

  let parsed = fullText;
  try {
    const jsonMatch = fullText.match(/```json\n?([\s\S]*?)\n?```/) || fullText.match(/(\{[\s\S]*\})/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[1]);
    else parsed = JSON.parse(fullText);
  } catch {
    parsed = { raw_text: fullText, parse_error: true };
  }

  return { data: parsed, raw: fullText, usage };
}

module.exports = { callAI, callAIStream };
