/**
 * Scope Completeness Checker — identifies implied scope items
 * that should be present based on M&E best practice but are
 * missing from the extraction.
 */

const fs = require('fs');
const path = require('path');

const RULES_PATH = path.join(__dirname, '../data/scope-rules.json');

function loadRules() {
  return JSON.parse(fs.readFileSync(RULES_PATH, 'utf-8')).rules;
}

function evaluateFormula(formula, triggerQuantity) {
  if (!formula) return 1;
  if (formula.startsWith('fixed:')) return parseFloat(formula.replace('fixed:', ''));
  if (formula.includes('trigger_quantity')) {
    const expr = formula.replace(/trigger_quantity/g, triggerQuantity);
    try { return Math.ceil(eval(expr)); }
    catch { return 1; }
  }
  return 1;
}

function checkScope(consolidatedTakeoff) {
  const rules = loadRules();
  const items = consolidatedTakeoff?.consolidated_takeoff
    || consolidatedTakeoff?.extraction
    || (Array.isArray(consolidatedTakeoff) ? consolidatedTakeoff : []);

  const missingItems = [];
  const checkedRules = [];

  for (const rule of rules) {
    const triggerItems = items.filter(item => {
      const descLower = (item.description || '').toLowerCase();
      const specLower = (item.specification || '').toLowerCase();
      return rule.trigger_keywords.some(k => descLower.includes(k) || specLower.includes(k));
    });

    if (!triggerItems.length) continue;

    const totalTriggerQty = triggerItems.reduce((sum, i) => sum + (parseFloat(i.quantity) || 0), 0);
    if (totalTriggerQty < (rule.trigger_min_quantity || 0)) continue;

    checkedRules.push(rule.rule_id);

    for (const implied of rule.implied_items) {
      const alreadyPresent = items.some(item => {
        const descLower = (item.description || '').toLowerCase();
        const impliedWords = implied.description.toLowerCase().split(' ').slice(0, 3);
        return impliedWords.every(w => descLower.includes(w));
      });

      if (!alreadyPresent) {
        const estimatedQty = Math.max(
          evaluateFormula(implied.estimate_formula, totalTriggerQty),
          implied.minimum || 1
        );

        missingItems.push({
          rule_id: rule.rule_id,
          trade: rule.trade,
          description: implied.description,
          estimated_quantity: estimatedQty,
          unit: implied.unit,
          trigger_rule: rule.trigger_condition,
          trigger_quantity: totalTriggerQty,
          severity: 'SCOPE_GAP',
          action: 'Add to takeoff or confirm not required',
          confidence: 'Medium',
        });
      }
    }
  }

  return {
    checked_rules: checkedRules.length,
    total_rules: rules.length,
    scope_gaps_found: missingItems.length,
    missing_items: missingItems,
    summary: missingItems.length === 0
      ? 'No scope gaps detected — all implied items present'
      : `${missingItems.length} implied scope item(s) not found in extraction`,
    checked_at: new Date().toISOString(),
  };
}

module.exports = { checkScope };
