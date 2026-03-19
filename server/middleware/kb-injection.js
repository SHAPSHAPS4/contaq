/**
 * KB Injection Middleware
 *
 * Runs before all /api/ routes. Assembles the appropriate KB
 * prompt for the endpoint and attaches it to req.kbPrompt.
 * Endpoints just use req.kbPrompt — no manual assembly needed.
 */

const kbManager = require('../knowledge/kb-manager');

// Token budgets per endpoint (reserve space for KB within total context)
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
    const { prompt, truncated, warningMessage } = kbManager.getKBPromptWithBudget(endpoint, budget);

    req.kbPrompt = prompt;
    req.kbTruncated = truncated || false;

    if (truncated) {
      console.warn(`[KB Middleware] ${endpoint}: KB truncated to critical sections. ${warningMessage || ''}`);
    }

    next();
  } catch (err) {
    console.error(`[KB Middleware] Failed to assemble KB for ${endpoint}:`, err.message);
    req.kbPrompt = '';
    req.kbTruncated = false;
    next();
  }
}

module.exports = { kbInjectionMiddleware, KB_TOKEN_BUDGETS };
