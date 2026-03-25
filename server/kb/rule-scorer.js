/**
 * Contraq Rule Scorer — Semantic Relevance Engine
 *
 * Scores learned rules against the current request context to determine
 * which rules are most relevant. Prevents dumping all rules into the prompt
 * as the rule count grows — injects only the top N most relevant.
 *
 * Three scoring layers (combined):
 *   1. Keyword TF-IDF — term frequency on MEP domain vocabulary
 *   2. Trade affinity — rules from the same trade score higher
 *   3. Recency + confidence — recent, high-occurrence rules score higher
 *
 * Designed with a pluggable interface: swap scoreRules() for a vector DB
 * query when the rule count justifies it (500+ rules).
 */

/* ══════════════════════════════════════════════════════════════════
   MEP DOMAIN VOCABULARY
   ══════════════════════════════════════════════════════════════════ */

const TRADE_KEYWORDS = {
  mechanical: [
    'pipe','pipework','copper','steel','plastic','valve','isolating','gate','ball','butterfly',
    'flange','coupling','tee','elbow','reducer','expansion','bellows','strainer','pump',
    'boiler','chiller','calorifier','heat exchanger','plate','lthw','mthw','hthw','chws','chwr',
    'dhw','cws','hws','cwb','condenser','header','manifold','pressurisation','bfp',
    'flow','return','dead leg','commissioning set','regulating','double','lockshield',
  ],
  electrical: [
    'cable','swa','lsf','xlpe','micc','tray','basket','ladder','conduit','trunking',
    'containment','busbar','db','distribution board','mcb','rcbo','rcd','mccb','acb',
    'transformer','ups','generator','switch','socket','fcu','fused spur','isolator',
    'lighting','luminaire','led','emergency','exit sign','pir','sensor','dimmer',
    'fire alarm','detection','sounder','call point','panel','loop','addressable',
    'data','cat6','fibre','comms','cctv','access control','intruder',
  ],
  insulation: [
    'insulation','lagging','cladding','phenolic','mineral wool','rockwool','nitrile','armaflex',
    'kaiflex','foil faced','pir','polyiso','calcium silicate','microporous',
    'aluminium','stainless','plastisol','coloured','ral','painted',
    'trace heating','frost protection','anti-condensation','acoustic',
    'fire stopping','fire sleeve','fire collar','fire wrap','intumescent',
    'thermal','thickness','bore','od','nb','dn','bs 5422','bs 5970','timsa',
    'vapour barrier','vapour seal','adhesive','mastic','saddle','support',
  ],
  ductwork: [
    'duct','ductwork','rectangular','circular','spiral','flat oval',
    'galvanised','gi','pre-insulated','phenolic','pir','fire rated',
    'grille','diffuser','swirl','jet','slot','linear','transfer',
    'damper','fire damper','smoke damper','volume control','vcd','motorised',
    'attenuator','silencer','flexible','flex','plenum','connection',
    'ahu','air handling','fan coil','fcu','vav','cav','extract','supply',
    'bms','sensor','actuator','thermostat','controller',
  ],
  plumbing: [
    'sanitary','wc','toilet','basin','sink','urinal','bath','shower',
    'waste','soil','stack','vent','svp','overflow','trap','gully','drain',
    'rainwater','rwp','downpipe','hopper','gutter',
    'hot water','cold water','boosted','mains','storage','cylinder',
    'expansion vessel','prv','pressure reducing','backflow','rpz',
  ],
  fire: [
    'sprinkler','fire suppression','deluge','pre-action','wet riser','dry riser',
    'landing valve','hose reel','extinguisher','hydrant','fire damper',
    'smoke damper','fire stopping','fire collar','fire wrap','intumescent',
    'compartment','penetration','seal','barrier','fire rated',
  ],
};

// Flatten all domain terms for general matching
const ALL_DOMAIN_TERMS = new Set();
for (const terms of Object.values(TRADE_KEYWORDS)) {
  for (const t of terms) ALL_DOMAIN_TERMS.add(t.toLowerCase());
}

/* ══════════════════════════════════════════════════════════════════
   TOKENISER
   ══════════════════════════════════════════════════════════════════ */

// Common stopwords to skip
const STOPWORDS = new Set([
  'the','a','an','is','are','was','were','be','been','being',
  'have','has','had','do','does','did','will','would','shall','should',
  'may','might','can','could','must','need','dare','ought',
  'and','but','or','nor','not','no','so','if','then','than','that','this',
  'it','its','of','in','on','at','to','for','with','from','by','as',
  'up','out','off','over','into','onto','upon','about','through',
  'all','each','every','both','few','more','most','other','some','such',
  'only','own','same','too','very','just','also','now','here','there',
]);

function tokenise(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-\/]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOPWORDS.has(w));
}

// Extract n-grams (bigrams) for multi-word MEP terms
function extractBigrams(tokens) {
  const bigrams = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(tokens[i] + ' ' + tokens[i + 1]);
  }
  return bigrams;
}

/* ══════════════════════════════════════════════════════════════════
   CONTEXT EXTRACTOR
   ══════════════════════════════════════════════════════════════════ */

/**
 * Extract scoring context from the current request.
 * Called by the KB middleware before rule scoring.
 *
 * @param {Object} req - Express request object
 * @returns {Object} context — { trade, tokens, bigrams, equipment, specs }
 */
function extractContext(req) {
  const trade = req.userTrade || req.body?.trade || null;

  // Gather all text from the request that describes what's being analysed
  const textParts = [];

  // User prompt / messages content
  if (req.body?.messages) {
    for (const msg of req.body.messages) {
      if (msg.content && typeof msg.content === 'string') textParts.push(msg.content);
      if (Array.isArray(msg.content)) {
        for (const block of msg.content) {
          if (block.type === 'text') textParts.push(block.text);
        }
      }
    }
  }

  // Direct text fields
  if (req.body?.description) textParts.push(req.body.description);
  if (req.body?.specification) textParts.push(req.body.specification);
  if (req.body?.drawing_title) textParts.push(req.body.drawing_title);
  if (req.body?.project_ref) textParts.push(req.body.project_ref);
  if (req.body?.general_feedback) textParts.push(req.body.general_feedback);

  // Original extraction items (for feedback requests)
  if (req.body?.original_extraction) {
    const oe = req.body.original_extraction;
    if (Array.isArray(oe)) {
      for (const item of oe.slice(0, 20)) { // cap to avoid huge context
        if (item.service) textParts.push(item.service);
        if (item.desc) textParts.push(item.desc);
        if (item.unit_equip) textParts.push(item.unit_equip);
      }
    }
  }

  // Corrections (for feedback requests)
  if (req.body?.corrections) {
    for (const c of req.body.corrections) {
      if (c.error) textParts.push(c.error);
      if (c.correction) textParts.push(c.correction);
      if (c.description) textParts.push(c.description);
    }
  }

  const fullText = textParts.join(' ');
  const tokens = tokenise(fullText);
  const bigrams = extractBigrams(tokens);

  // Extract equipment references (AHU-01, FCU-03, DB-L1, etc.)
  const equipRefs = (fullText.match(/[A-Z]{2,4}[-\s]?\d{1,3}/g) || []).map(e => e.toLowerCase());

  // Extract spec/drawing references (M-201, E-101, NRM2, NBS Y10, etc.)
  const specRefs = (fullText.match(/[A-Z]\d{1,2}[-/]\d{2,3}|NRM\d|NBS\s?[A-Z]\d+|BS\s?\d+/gi) || []).map(s => s.toLowerCase());

  return { trade, tokens, bigrams, equipment: equipRefs, specs: specRefs, fullText };
}

/* ══════════════════════════════════════════════════════════════════
   SCORING ENGINE
   ══════════════════════════════════════════════════════════════════ */

/**
 * Score a single rule against the request context.
 * Returns a score from 0 to 1.
 */
function scoreRule(rule, context) {
  // Build the rule's text corpus
  const ruleText = [
    rule.trigger || '',
    rule.action || '',
    rule.reason || '',
    rule.example_before || '',
    rule.example_after || '',
  ].join(' ');

  const ruleTokens = tokenise(ruleText);
  const ruleBigrams = extractBigrams(ruleTokens);
  const ruleTokenSet = new Set(ruleTokens);
  const ruleBigramSet = new Set(ruleBigrams);

  let score = 0;
  let maxScore = 0;

  // ── Layer 1: Keyword overlap (0–0.5) ──────────────────────
  // How many context tokens appear in the rule?
  maxScore += 0.5;
  if (context.tokens.length > 0 && ruleTokens.length > 0) {
    let matches = 0;
    let domainMatches = 0;
    const contextTokenSet = new Set(context.tokens);

    for (const token of contextTokenSet) {
      if (ruleTokenSet.has(token)) {
        matches++;
        // Domain-specific terms are worth more
        if (ALL_DOMAIN_TERMS.has(token)) domainMatches++;
      }
    }

    // Bigram matching (multi-word terms like "fire damper", "copper pipe")
    const contextBigramSet = new Set(context.bigrams);
    let bigramMatches = 0;
    for (const bg of contextBigramSet) {
      if (ruleBigramSet.has(bg)) bigramMatches++;
    }

    const uniqueContextTerms = contextTokenSet.size;
    const rawOverlap = uniqueContextTerms > 0 ? matches / uniqueContextTerms : 0;
    const domainBoost = domainMatches * 0.03; // extra weight per domain match
    const bigramBoost = bigramMatches * 0.05; // extra weight per bigram match
    score += Math.min(0.5, (rawOverlap * 0.35) + domainBoost + bigramBoost);
  }

  // ── Layer 2: Trade affinity (0–0.2) ───────────────────────
  maxScore += 0.2;
  if (context.trade) {
    const tradeTerms = TRADE_KEYWORDS[context.trade] || [];
    if (tradeTerms.length > 0) {
      let tradeHits = 0;
      for (const term of tradeTerms) {
        const termTokens = term.split(/\s+/);
        for (const tt of termTokens) {
          if (ruleTokenSet.has(tt)) { tradeHits++; break; }
        }
      }
      score += Math.min(0.2, (tradeHits / tradeTerms.length) * 0.8);
    }
  }

  // ── Layer 3: Equipment/spec reference match (0–0.15) ──────
  maxScore += 0.15;
  const ruleTextLower = ruleText.toLowerCase();
  let refMatches = 0;
  for (const eq of context.equipment) {
    if (ruleTextLower.includes(eq)) refMatches++;
  }
  for (const sp of context.specs) {
    if (ruleTextLower.includes(sp)) refMatches++;
  }
  const totalRefs = context.equipment.length + context.specs.length;
  if (totalRefs > 0) {
    score += Math.min(0.15, (refMatches / totalRefs) * 0.15);
  }

  // ── Layer 4: Recency + occurrence boost (0–0.15) ──────────
  maxScore += 0.15;
  const occurrences = rule.occurrences || 1;
  const occurrenceScore = Math.min(0.08, Math.log2(occurrences + 1) * 0.02);

  let recencyScore = 0;
  if (rule.date || rule.last_triggered) {
    const ruleDate = new Date(rule.date || rule.last_triggered);
    const daysSince = (Date.now() - ruleDate.getTime()) / (1000 * 60 * 60 * 24);
    recencyScore = Math.max(0, 0.07 * (1 - daysSince / 365)); // decays over 1 year
  }
  score += occurrenceScore + recencyScore;

  return { score: Math.min(1, score), maxScore };
}

/* ══════════════════════════════════════════════════════════════════
   PUBLIC API
   ══════════════════════════════════════════════════════════════════ */

/**
 * Score and rank rules against request context.
 * Returns rules sorted by relevance, with scores attached.
 *
 * @param {Array} rules - Array of learned rule objects
 * @param {Object} context - Output from extractContext()
 * @param {Object} options - { maxRules, minScore }
 * @returns {Array} Scored and filtered rules, sorted by relevance desc
 */
function scoreRules(rules, context, options = {}) {
  const {
    maxRules = 10,       // Max rules to inject into prompt
    minScore = 0.05,     // Minimum relevance score to include
  } = options;

  if (!rules || rules.length === 0) return [];

  // If very few rules, skip scoring — include them all
  if (rules.length <= maxRules) {
    return rules.map(r => ({ ...r, _relevanceScore: 1.0 }));
  }

  const scored = rules.map(rule => {
    const { score } = scoreRule(rule, context);
    return { ...rule, _relevanceScore: score };
  });

  return scored
    .filter(r => r._relevanceScore >= minScore)
    .sort((a, b) => b._relevanceScore - a._relevanceScore)
    .slice(0, maxRules);
}

/**
 * Get the configured max rules limit based on endpoint token budget.
 * Extraction endpoints get more rules; lightweight endpoints get fewer.
 */
function getMaxRulesForEndpoint(endpoint) {
  const heavy = ['/api/drawings/extract', '/api/quotes/extract', '/api/specs/analyse'];
  const medium = ['/api/takeoff/consolidate', '/api/feedback/process'];

  if (heavy.includes(endpoint)) return 10;
  if (medium.includes(endpoint)) return 6;
  return 3; // lightweight endpoints (journal, quote-files)
}

module.exports = {
  extractContext,
  scoreRules,
  scoreRule,
  getMaxRulesForEndpoint,
  tokenise,
  TRADE_KEYWORDS,
};
