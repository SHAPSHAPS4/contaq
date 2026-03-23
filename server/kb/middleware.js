/**
 * KB Injection Middleware
 *
 * Runs before /api/ routes. Assembles the appropriate KB prompt
 * for the endpoint and attaches it to req.kbPrompt.
 *
 * Trade-aware: prioritises KB sections relevant to the user's trade.
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

/**
 * Trade-to-KB section priority mapping.
 * Primary sections load first (within token budget), secondary load if space.
 */
const TRADE_KB_PRIORITY = {
  insulation:  { primary: ['I01','I02','I03','I04'], secondary: ['M01','M03'] },
  ductwork:    { primary: ['M03','M04','I02'], secondary: ['M01','M02'] },
  pipework:    { primary: ['M01','M02','M04'], secondary: ['I01'] },
  mechanical:  { primary: ['M01','M02','M03','M04'], secondary: ['I01'] },
  electrical:  { primary: ['E01','E02','E03','E04','E05'], secondary: [] },
  plumbing:    { primary: ['M01','M02'], secondary: ['M04'] },
  hvac:        { primary: ['M03','M04','M01','M02'], secondary: ['I02'] },
  fire:        { primary: ['I04','E05'], secondary: ['I01','M03'] },
  multi:       { primary: [], secondary: [] }, // loads all equally
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
    // Detect user trade from auth context or request body
    let userTrade = null;
    if (req.user && req.user.organizations && req.user.organizations.trade) {
      userTrade = req.user.organizations.trade;
    } else if (req.body && req.body.trade) {
      userTrade = req.body.trade;
    }

    // Get standard KB prompt
    const { prompt, truncated, warningMessage } = getKBPromptWithBudget(endpoint, budget);

    // Add trade context header if trade is known
    let tradeHeader = '';
    if (userTrade && TRADE_KB_PRIORITY[userTrade]) {
      const priority = TRADE_KB_PRIORITY[userTrade];
      tradeHeader = '\n## TRADE CONTEXT\n'
        + 'This user is a ' + userTrade.toUpperCase() + ' specialist contractor.\n'
        + 'Prioritise ' + userTrade + '-specific materials, specifications, and conventions.\n'
        + (priority.primary.length ? 'Primary KB sections for this trade: ' + priority.primary.join(', ') + '\n' : '')
        + 'When uncertain about trade-specific details, flag for human review rather than guessing.\n';
    }

    req.kbPrompt = tradeHeader + prompt;
    req.kbTruncated = truncated || false;
    req.userTrade = userTrade;

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

module.exports = { kbInjectionMiddleware, KB_TOKEN_BUDGETS, TRADE_KB_PRIORITY };
