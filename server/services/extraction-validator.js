/**
 * Extraction Validator — quality gate between Stage 2 and Stage 3
 * Scores extraction quality and blocks progression if too low.
 */

const QUALITY_THRESHOLDS = {
  block: 25,
  warn: 40,
  pass: 70,
};

function validateExtraction(extraction) {
  const result = {
    passed: false, score: 0, grade: 'F', block_reason: null,
    warnings: [], item_scores: [],
    summary: {
      total_items: 0, high_confidence: 0, medium_confidence: 0, low_confidence: 0,
      missing_spec: 0, missing_quantity: 0, suspicious_quantities: 0,
      hallucination_risk_items: [], unscored_items: 0,
    },
    recommendations: [],
  };

  const items = extraction?.extraction || [];
  result.summary.total_items = items.length;

  if (!items.length) {
    result.block_reason = 'NO_ITEMS_EXTRACTED';
    result.score = 0;
    result.recommendations.push('No items were extracted. Check that the PDF is a GA drawing not a schematic. Check drawing resolution.');
    return result;
  }

  if (extraction?.parse_error) {
    result.block_reason = 'PARSE_ERROR';
    result.score = 0;
    result.recommendations.push('AI response could not be parsed as JSON. Run the diagnostic tool to identify root cause.');
    return result;
  }

  let totalScore = 0;

  for (const item of items) {
    const itemScore = { description: item.description, issues: [], score: 100 };

    // Confidence scoring
    if (!item.confidence || item.confidence === 'Low') {
      result.summary.low_confidence++;
      itemScore.score -= 40;
      itemScore.issues.push('Low confidence');
    } else if (item.confidence === 'Medium') {
      result.summary.medium_confidence++;
      itemScore.score -= 15;
    } else {
      result.summary.high_confidence++;
    }

    // Missing specification
    if (!item.specification || item.specification === 'unspecified' || item.specification === '') {
      result.summary.missing_spec++;
      itemScore.score -= 20;
      itemScore.issues.push('Missing specification');
    }

    // Missing quantity
    if (!item.quantity || isNaN(parseFloat(item.quantity)) || parseFloat(item.quantity) <= 0) {
      result.summary.missing_quantity++;
      itemScore.score -= 30;
      itemScore.issues.push('Missing or invalid quantity');
    }

    // Suspicious quantities (hallucination detection)
    const qty = parseFloat(item.quantity);
    if (qty > 0 && ((qty % 100 === 0 && qty > 500) || qty > 10000)) {
      result.summary.suspicious_quantities++;
      result.summary.hallucination_risk_items.push({ description: item.description, quantity: qty, unit: item.unit });
      itemScore.score -= 25;
      itemScore.issues.push('Suspicious quantity — possible hallucination');
    }

    // Invalid trade
    if (!['Mechanical', 'Electrical', 'Insulation'].includes(item.trade)) {
      itemScore.score -= 10;
      itemScore.issues.push('Invalid trade value');
    }

    itemScore.score = Math.max(0, itemScore.score);
    totalScore += itemScore.score;
    result.item_scores.push(itemScore);
  }

  result.score = Math.round(totalScore / items.length);

  const lowConfidencePct = Math.round((result.summary.low_confidence / items.length) * 100);
  const missingSpecPct = Math.round((result.summary.missing_spec / items.length) * 100);

  // Block conditions
  if (lowConfidencePct > QUALITY_THRESHOLDS.block) {
    result.block_reason = 'HIGH_LOW_CONFIDENCE';
    result.recommendations.push(`${lowConfidencePct}% of items are Low confidence. Drawing may be unreadable, a schematic, or missing annotations.`);
    result.recommendations.push('Run the diagnostic tool to check if the PDF is text-based or scanned image.');
    result.recommendations.push('If scanned, run OCR before re-uploading.');
  }

  if (result.summary.missing_quantity > Math.floor(items.length * 0.3)) {
    result.block_reason = result.block_reason || 'HIGH_MISSING_QUANTITIES';
    result.recommendations.push('More than 30% of items have missing quantities. Check drawing scale is stated and visible.');
  }

  if (result.summary.hallucination_risk_items.length > 2) {
    result.block_reason = result.block_reason || 'HALLUCINATION_RISK';
    result.recommendations.push('Multiple suspiciously large or round quantities detected. Review these items carefully before proceeding.');
  }

  // Warnings
  if (missingSpecPct > 50) {
    result.warnings.push('More than 50% of items have missing specifications. Pricing accuracy will be low.');
    result.recommendations.push('Check spec document has been uploaded and processed in Stage 2.');
  }

  // Grade
  if (result.score >= QUALITY_THRESHOLDS.pass) result.grade = 'A';
  else if (result.score >= 60) result.grade = 'B';
  else if (result.score >= QUALITY_THRESHOLDS.warn) result.grade = 'C';
  else if (result.score >= QUALITY_THRESHOLDS.block) result.grade = 'D';
  else result.grade = 'F';

  result.passed = !result.block_reason && result.score >= QUALITY_THRESHOLDS.warn;

  if (result.passed) {
    result.recommendations.push('Extraction quality is acceptable. Review Low confidence items before pricing.');
  }

  return result;
}

function generateValidationReport(validationResult, projectRef) {
  return {
    project_ref: projectRef,
    validated_at: new Date().toISOString(),
    passed: validationResult.passed,
    score: validationResult.score,
    grade: validationResult.grade,
    block_reason: validationResult.block_reason,
    summary: validationResult.summary,
    warnings: validationResult.warnings,
    recommendations: validationResult.recommendations,
    high_risk_items: validationResult.summary.hallucination_risk_items,
    action_required: !validationResult.passed
      ? 'Extraction blocked. Estimator must review and override before proceeding.'
      : validationResult.warnings.length > 0
        ? 'Warnings present. Estimator should review before pricing.'
        : 'Extraction passed validation. Safe to proceed to consolidation.',
  };
}

module.exports = { validateExtraction, generateValidationReport, QUALITY_THRESHOLDS };
