const { validateExtraction, generateValidationReport, QUALITY_THRESHOLDS } = require('../services/extraction-validator');

describe('Extraction Validator', () => {
  test('blocks extraction with no items', () => {
    const result = validateExtraction({ extraction: [] });
    expect(result.passed).toBe(false);
    expect(result.score).toBe(0);
    expect(result.block_reason).toBe('NO_ITEMS_EXTRACTED');
  });

  test('blocks extraction with parse error', () => {
    const result = validateExtraction({ extraction: [{ description: 'test' }], parse_error: true });
    expect(result.passed).toBe(false);
    expect(result.block_reason).toBe('PARSE_ERROR');
  });

  test('passes high quality extraction', () => {
    const result = validateExtraction({
      extraction: [
        { description: '22mm Copper pipe', specification: 'BS EN 1057', quantity: 50, unit: 'm', confidence: 'High', trade: 'Mechanical' },
        { description: 'Isolation valve', specification: 'Gate type PN16', quantity: 4, unit: 'nr', confidence: 'High', trade: 'Mechanical' },
        { description: '25mm Mineral wool insulation', specification: 'Rockwool', quantity: 50, unit: 'm', confidence: 'High', trade: 'Insulation' }
      ]
    });
    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(QUALITY_THRESHOLDS.warn);
    expect(result.grade).toMatch(/^[AB]$/);
    expect(result.summary.high_confidence).toBe(3);
  });

  test('penalises low confidence items', () => {
    const result = validateExtraction({
      extraction: [
        { description: 'Unknown item', specification: '', quantity: 10, unit: 'nr', confidence: 'Low', trade: 'Mechanical' }
      ]
    });
    expect(result.summary.low_confidence).toBe(1);
    expect(result.score).toBeLessThan(QUALITY_THRESHOLDS.pass);
  });

  test('penalises missing specifications', () => {
    const result = validateExtraction({
      extraction: [
        { description: 'Copper pipe', specification: '', quantity: 50, unit: 'm', confidence: 'High', trade: 'Mechanical' },
        { description: 'Steel pipe', specification: 'unspecified', quantity: 30, unit: 'm', confidence: 'High', trade: 'Mechanical' }
      ]
    });
    expect(result.summary.missing_spec).toBe(2);
  });

  test('penalises missing quantities', () => {
    const result = validateExtraction({
      extraction: [
        { description: 'Cable tray', specification: 'Galv', quantity: 0, unit: 'm', confidence: 'High', trade: 'Electrical' },
        { description: 'Trunking', specification: 'PVC', confidence: 'High', trade: 'Electrical' }
      ]
    });
    expect(result.summary.missing_quantity).toBe(2);
  });

  test('flags suspicious quantities as hallucination risk', () => {
    const result = validateExtraction({
      extraction: [
        { description: 'Cable', specification: 'SWA', quantity: 50000, unit: 'm', confidence: 'High', trade: 'Electrical' },
        { description: 'Pipe', specification: 'Copper', quantity: 1000, unit: 'm', confidence: 'High', trade: 'Mechanical' }
      ]
    });
    expect(result.summary.suspicious_quantities).toBeGreaterThan(0);
    expect(result.summary.hallucination_risk_items.length).toBeGreaterThan(0);
  });

  test('penalises invalid trade values', () => {
    const result = validateExtraction({
      extraction: [
        { description: 'Some item', specification: 'Spec', quantity: 10, unit: 'nr', confidence: 'High', trade: 'Plumbing' }
      ]
    });
    const itemScore = result.item_scores[0];
    expect(itemScore.issues).toContain('Invalid trade value');
  });

  test('assigns correct grades', () => {
    // Grade A: score >= 70
    const highResult = validateExtraction({
      extraction: [
        { description: 'Pipe', specification: 'Copper 22mm', quantity: 50, unit: 'm', confidence: 'High', trade: 'Mechanical' }
      ]
    });
    expect(highResult.grade).toBe('A');

    // Grade F: all low confidence, missing spec, missing qty
    const lowResult = validateExtraction({
      extraction: [
        { description: 'Unknown', confidence: 'Low', trade: 'Other' }
      ]
    });
    expect(lowResult.grade).toBe('F');
  });

  test('blocks when >25% low confidence items', () => {
    const items = [];
    for (let i = 0; i < 4; i++) {
      items.push({ description: 'Item ' + i, specification: 'Spec', quantity: 10, unit: 'nr', confidence: 'Low', trade: 'Mechanical' });
    }
    const result = validateExtraction({ extraction: items });
    expect(result.block_reason).toBeTruthy();
  });

  test('generateValidationReport produces correct structure', () => {
    const validation = validateExtraction({
      extraction: [
        { description: 'Pipe', specification: 'Spec', quantity: 50, unit: 'm', confidence: 'High', trade: 'Mechanical' }
      ]
    });
    const report = generateValidationReport(validation, 'PRJ-001');
    expect(report.project_ref).toBe('PRJ-001');
    expect(report).toHaveProperty('validated_at');
    expect(report).toHaveProperty('passed');
    expect(report).toHaveProperty('score');
    expect(report).toHaveProperty('grade');
    expect(report).toHaveProperty('action_required');
  });
});
