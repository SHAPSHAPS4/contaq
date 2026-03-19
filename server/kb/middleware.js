/**
 * KB Injection Middleware
 *
 * Runs before /api/ routes. Assembles the appropriate KB prompt
 * for the endpoint and attaches it to req.kbPrompt.
 */

const { getKBPromptWithBudget } = require('./index');

const KB_TOKEN_BUDGETS = {
  '/api/drawings/extract':    6000,
  '/api/specs/analyse':       6000,
  '/api/takeoff/consolidate': 4000,
  '/api/feedback/process':    3000,
  '/api/quotes/extract':      8000,
  '/api/journal/analyse':     1000,
  '/api/quote-files/analyse': 800,
};

function kbInjectionMiddleware(req, res, next) {
  const endpoint = req.path;
  const budget = KB_TOKEN_BUDGETS[endpoint];

  if (!budget) {
    req.kbPrompt = '';
    req.kbTruncated = false;
    return next();
  }

  try {
    const { prompt, truncated, warningMessage } = getKBPromptWithBudget(endpoint, budget);
    req.kbPrompt = prompt;
    req.kbTruncated = truncated || false;

    if (truncated) {
      console.warn(`[KB Middleware] ${endpoint}: KB truncated. ${warningMessage || ''}`);
    }

    next();
  } catch (err) {
    console.error(`[KB Middleware] Failed for ${endpoint}:`, err.message);
    req.kbPrompt = '';
    req.kbTruncated = false;
    next();
  }
}

module.exports = { kbInjectionMiddleware, KB_TOKEN_BUDGETS };
