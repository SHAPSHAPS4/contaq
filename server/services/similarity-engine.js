/**
 * Similar Projects Engine — searches completed quotes to surface
 * relevant historical references for sanity checks and variance detection.
 */

const fs = require('fs');
const path = require('path');

const QUOTES_DIR = path.join(__dirname, '../data/quotes');
const PROJECTS_INDEX_PATH = path.join(__dirname, '../data/projects-index.json');

function buildProjectsIndex() {
  if (!fs.existsSync(QUOTES_DIR)) return [];
  const quotes = fs.readdirSync(QUOTES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        const q = JSON.parse(fs.readFileSync(path.join(QUOTES_DIR, f), 'utf-8'));
        const tradeBreakdown = {};
        for (const item of q.priced_items || []) {
          const t = item.trade || 'Unknown';
          tradeBreakdown[t] = (tradeBreakdown[t] || 0) + (item.total_with_overheads || 0);
        }
        const itemDescriptions = (q.priced_items || []).map(i => (i.description || '').toLowerCase());
        const keywords = [...new Set(itemDescriptions.flatMap(d => d.split(' ')).filter(w => w.length > 4))];
        return {
          quote_ref: q.quote_ref,
          project_ref: q.project_ref,
          grand_total: q.summary?.grand_total || 0,
          total_items: q.priced_items?.length || 0,
          trade_breakdown: tradeBreakdown,
          keywords: keywords.slice(0, 50),
          created: q.created,
        };
      } catch { return null; }
    })
    .filter(Boolean);
  fs.writeFileSync(PROJECTS_INDEX_PATH, JSON.stringify({ projects: quotes, last_built: new Date().toISOString() }, null, 2));
  return quotes;
}

function loadIndex() {
  try { return JSON.parse(fs.readFileSync(PROJECTS_INDEX_PATH, 'utf-8')).projects; }
  catch { return buildProjectsIndex(); }
}

function findSimilarProjects(newExtractionItems, limit = 3) {
  const index = loadIndex();
  if (!index.length) return [];

  const newKeywords = [...new Set(
    (newExtractionItems || [])
      .flatMap(i => (i.description || '').toLowerCase().split(' '))
      .filter(w => w.length > 4)
  )];
  const newTrades = [...new Set((newExtractionItems || []).map(i => i.trade))];

  const scored = index.map(project => {
    let score = 0;

    // Keyword overlap (max 30 points)
    const keywordOverlap = newKeywords.filter(k => project.keywords.includes(k)).length;
    score += Math.min(keywordOverlap * 3, 30);

    // Trade overlap (max 30 points)
    const tradeOverlap = newTrades.filter(t => project.trade_breakdown[t] > 0).length;
    score += tradeOverlap * 10;

    // Item count similarity (max 20 points)
    const newItemCount = newExtractionItems?.length || 0;
    const projectItemCount = project.total_items;
    if (newItemCount > 0 && projectItemCount > 0) {
      const ratio = Math.min(newItemCount, projectItemCount) / Math.max(newItemCount, projectItemCount);
      score += ratio * 20;
    }

    return { ...project, similarity_score: Math.round(score) };
  });

  return scored
    .filter(p => p.similarity_score > 10)
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, limit);
}

function compareWithReference(newItems, referenceQuoteRef) {
  const quotePath = path.join(QUOTES_DIR, referenceQuoteRef + '.json');
  if (!fs.existsSync(quotePath)) throw new Error('Reference quote not found');
  const refQuote = JSON.parse(fs.readFileSync(quotePath, 'utf-8'));
  const refItems = refQuote.priced_items || [];

  const variances = [];

  for (const newItem of newItems) {
    const descLower = (newItem.description || '').toLowerCase();
    const match = refItems.find(r => {
      const refDescLower = (r.description || '').toLowerCase();
      const words = descLower.split(' ').filter(w => w.length > 3);
      return words.filter(w => refDescLower.includes(w)).length >= 2;
    });

    if (match) {
      const newQty = parseFloat(newItem.quantity) || 0;
      const refQty = parseFloat(match.quantity) || 0;
      const variancePct = refQty > 0 ? Math.round(((newQty - refQty) / refQty) * 100) : null;

      if (variancePct !== null && Math.abs(variancePct) > 25) {
        variances.push({
          description: newItem.description,
          trade: newItem.trade,
          new_quantity: newQty,
          new_unit: newItem.unit,
          ref_quantity: refQty,
          ref_unit: match.unit,
          variance_pct: variancePct,
          severity: Math.abs(variancePct) > 50 ? 'HIGH' : 'MEDIUM',
          flag: `Quantity ${variancePct > 0 ? 'higher' : 'lower'} than ${referenceQuoteRef} by ${Math.abs(variancePct)}%`,
        });
      }
    }
  }

  return {
    reference_quote: referenceQuoteRef,
    reference_project: refQuote.project_ref,
    reference_total: refQuote.summary?.grand_total,
    variances_found: variances.length,
    high_variances: variances.filter(v => v.severity === 'HIGH').length,
    variances,
    compared_at: new Date().toISOString(),
  };
}

module.exports = { findSimilarProjects, compareWithReference, buildProjectsIndex };
