/**
 * KB-X02: Confidence Scoring Rules
 *
 * Structured definitions, scoring rules, threshold triggers,
 * escalation actions, and contextual guidance for confidence
 * assessment of every extracted M&E item.
 * Injected into extraction prompts at runtime.
 *
 * Part of Contraq M&E Knowledge Base v6.9
 * Source: Contraq estimation methodology, UK QS practice
 */

const KB_X02 = {
  id: 'KB-X02',
  title: 'Confidence Scoring Rules',
  version: '1.0',
  date: '2026-03-19',

  /* ══════════════════════════════════════════════════════════════
     1. CONFIDENCE DEFINITIONS
     ══════════════════════════════════════════════════════════════ */
  definitions: {
    rule: 'EVERY extracted item MUST have a confidence score. No exceptions. Confidence reflects certainty of the EXTRACTION, not the importance of the item.',

    high: {
      score: 'High',
      numeric_range: '75-100%',
      definition: 'Item is clearly identified, fully specified, accurately quantified, and free from conflict.',
      criteria: {
        all_must_be_true: [
          'Item clearly visible on GA drawing (not schematic, not detail-only)',
          'Drawing status is "For Construction"',
          'Specification confirmed — material, size, type all identified from spec or schedule',
          'Quantity measured from: annotated dimension, scale bar, or schedule count',
          'No conflicting information between drawing, spec, or schedule',
          'Legend confirms symbol meaning (or symbol is unambiguous)'
        ]
      },
      label: 'From drawing — specification confirmed',
      source_requirement: 'Schedule or Drawing annotation or Scale measurement with scale bar',
      examples: [
        '42mm copper pipe clearly shown on For Construction GA, sized in spec, measured 23.5m from scale bar → High',
        'FCU counted from RCP and confirmed on equipment schedule with full spec → High',
        'Fire damper at fire wall, FD symbol confirmed by legend, size annotated → High'
      ]
    },

    medium: {
      score: 'Medium',
      numeric_range: '45-74%',
      definition: 'Item is identifiable and quantifiable but has one or more minor uncertainties that do not fundamentally undermine the extraction.',
      criteria: {
        any_of_these_present: [
          'Item visible but specification partially incomplete (e.g. material stated but thickness not)',
          'Quantity measured from stated scale but NO scale bar present (print scale may be distorted)',
          'Minor routing ambiguity that does not significantly affect total quantity (±10%)',
          'Drawing status is "For Coordination" (design may change but routing is indicative)',
          'Item identified by CIBSE standard symbols but no project-specific legend to confirm',
          'Implicit item — always required per trade practice but not individually drawn (KB-M02)',
          'Item within a revision cloud on a For Construction drawing (recently changed — verify)',
          'Schedule exists but minor discrepancy with drawing count (±1-2 items)'
        ]
      },
      label: 'Partially estimated — verify specification',
      source_requirement: 'Scale measurement without bar, OR annotation with partial spec, OR implicit item',
      examples: [
        'Pipe run measured at 1:100 from title block (no scale bar). Route clear but length could be ±5% → Medium',
        'Ductwork sized "600×400" on drawing but insulation not stated in spec — size High but insulation unknown → Medium',
        'Isolation valves at pump (implicit — always required but not individually drawn) → Medium',
        'For Coordination drawing — routing shown but may change during clash resolution → Medium'
      ]
    },

    low: {
      score: 'Low',
      numeric_range: '0-44%',
      definition: 'Item has significant uncertainty — specification, quantity, or identification cannot be confidently determined. Estimator MUST review before pricing.',
      criteria: {
        any_of_these_present: [
          'Item implied but NOT explicitly shown on any drawing',
          'Specification absent — material, type, or size is completely unknown',
          'Drawing quality prevents confident measurement (blurred, low resolution, illegible)',
          'Significant routing ambiguity — multiple possible routes affect quantity by >20%',
          'Drawing status is "Preliminary" or "Tender" (design is early stage)',
          'Item measured from schematic or riser diagram (not valid for linear quantities)',
          'Conflicting information between drawing and spec with no resolution',
          'Two drawings show different quantities for the same item',
          'Item annotated "TBC", "TBA", or "to be confirmed"',
          'No legend and symbol meaning is guessed from CIBSE standards',
          'Estimated allowance used (fittings, supports) as quantities not individually shown',
          'Drawing has no scale bar AND no stated scale — measurement is unreliable'
        ]
      },
      label: 'AI estimate — verify before pricing',
      source_requirement: 'Estimated allowance, OR poor quality measurement, OR unresolved conflict',
      mandatory_actions: [
        'MUST be paired with a specific flag explaining WHY confidence is Low',
        'MUST be listed in the "estimator_review_required" section of output',
        'Estimator MUST sign off before this item can be used for pricing',
        'If possible, state what additional information would raise confidence (e.g. "provide spec section Y10" or "confirm drawing is latest revision")'
      ],
      examples: [
        'Pipe run shown on Preliminary drawing — route and size may change entirely → Low',
        'Cable quantity estimated from containment route (no cable schedule) → Low',
        'Equipment shown on drawing but not on schedule — no spec available → Low',
        'Spec says "25mm insulation" but drawing annotation says "30mm" — unresolved conflict → Low',
        'Fittings estimated at 1 per 3m (not individually shown) → Low'
      ]
    }
  },

  /* ══════════════════════════════════════════════════════════════
     2. SCORING RULES
     ══════════════════════════════════════════════════════════════ */
  scoring_rules: {
    mandatory: [
      'Every extracted item MUST have a confidence score — no item is exempt.',
      'Confidence is assessed per ITEM, not per drawing. Different items on the same drawing may have different scores.',
      'If in doubt between two scores, use the LOWER score. Err on the side of caution.',
      'Confidence score must be consistent with the source label (KB-X01). Schedule source → High. Estimated allowance → Low.'
    ],

    high_blockers: {
      description: 'The following conditions PREVENT High confidence — if ANY is true, score MUST be Medium or Low:',
      blockers: [
        { condition: 'Missing specification', result: 'Cannot be High — material/type/size unknown.', max_score: 'Medium (if partially specified) or Low (if completely unspecified)' },
        { condition: 'Measured from schematic or riser diagram', result: 'Cannot be High — schematics are not to scale.', max_score: 'Low (for linear quantities). Medium (for equipment counts from schematics).' },
        { condition: 'Drawing status not For Construction', result: 'Cannot be High — design not finalised.', max_score: 'Medium (For Coordination) or Low (Preliminary/Tender).' },
        { condition: 'Conflicting information present', result: 'Cannot be High — until conflict is resolved.', max_score: 'Low (if conflict affects quantity/spec). Medium (if conflict is minor/cosmetic).' },
        { condition: 'No legend and symbol assumed', result: 'Cannot be High — symbol meaning is a guess.', max_score: 'Medium (if CIBSE standard symbol is unambiguous). Low (if symbol is ambiguous).' },
        { condition: 'Estimated allowance used', result: 'Cannot be High — quantity is not from a definitive source.', max_score: 'Low.' },
        { condition: 'Item not visible on drawing (implicit)', result: 'Cannot be High — item is inferred, not confirmed.', max_score: 'Medium.' },
        { condition: 'Revision cloud on non-For-Construction drawing', result: 'Cannot be High — area is actively changing.', max_score: 'Low.' }
      ]
    },

    upgrade_rules: {
      description: 'Confidence can be UPGRADED if additional information is found during extraction:',
      scenarios: [
        'Item initially Medium (no spec on drawing) → spec found in specification document → upgrade to High.',
        'Item initially Low (estimated fittings) → fittings schedule found → upgrade to High (from schedule).',
        'Item initially Medium (For Coordination drawing) → same item confirmed on For Construction drawing → upgrade to High.',
        'Item initially Low (no legend) → legend found on another drawing sheet → re-assess with legend.'
      ],
      rule: 'Always re-assess confidence after cross-referencing additional documents. The FINAL confidence reflects ALL available information.'
    },

    downgrade_rules: {
      description: 'Confidence must be DOWNGRADED if problems are discovered:',
      scenarios: [
        'Item initially High → conflict found between drawing and spec → downgrade to Low.',
        'Item initially High → drawing discovered to be Preliminary (not For Construction) → downgrade to Medium or Low.',
        'Item initially Medium → second drawing shows different quantity → downgrade to Low (unresolved conflict).',
        'Any item where hallucination risk is identified → immediately downgrade to Low.'
      ]
    }
  },

  /* ══════════════════════════════════════════════════════════════
     3. THRESHOLD TRIGGERS & ESCALATION
     ══════════════════════════════════════════════════════════════ */
  thresholds: {
    drawing_level: {
      normal: {
        threshold: '<30% Low confidence items on a drawing',
        status: 'NORMAL — proceed with extraction. Note Low items for estimator review.',
        action: 'Complete extraction. List Low confidence items in flags. Estimator reviews flagged items.'
      },
      elevated: {
        threshold: '30-50% Low confidence items on a drawing',
        status: 'ELEVATED — flag ENTIRE drawing extraction as LOW RELIABILITY.',
        action: [
          'Complete extraction but mark all quantities from this drawing as PRELIMINARY.',
          'Flag prominently: "This drawing has >30% Low confidence items. Entire extraction has reduced reliability."',
          'Recommend estimator review BEFORE proceeding to consolidation (Stage 3).',
          'List specific issues causing Low confidence — the estimator needs to know what to fix.'
        ]
      },
      critical: {
        threshold: '>50% Low confidence items on a drawing',
        status: 'CRITICAL — recommend drawing re-issue before continuing extraction.',
        action: [
          'Complete extraction as best-effort but mark ALL quantities as UNRELIABLE.',
          'Flag prominently: "This drawing has >50% Low confidence items. Extraction is UNRELIABLE."',
          'Recommend: "Drawing should be re-issued at higher detail/quality before finalising quantities."',
          'List ALL issues preventing confident extraction.',
          'Do NOT proceed to consolidation (Stage 3) with this drawing without estimator approval.'
        ]
      }
    },

    project_level: {
      description: 'Assess overall project confidence after all drawings are extracted.',
      healthy: '<20% Low confidence items across all drawings. Project extraction is reliable.',
      concerning: '20-40% Low confidence across project. Significant uncertainty. Flag for commercial review.',
      unreliable: '>40% Low confidence across project. Too much uncertainty for confident pricing. Recommend: additional design information, site survey, or qualification in tender submission.'
    },

    hallucination: {
      description: 'If the AI detects it may be inventing or assuming items not supported by the drawings or spec.',
      trigger: 'Any item that cannot be traced back to a specific drawing, annotation, schedule, or specification clause.',
      action: [
        'IMMEDIATELY flag the item.',
        'Set confidence to Low.',
        'Label source as "AI inference — not confirmed on drawing/spec".',
        'Add to estimator review list with note: "This item may be an AI assumption. Verify against source documents."',
        'If multiple hallucination risks detected, flag the entire extraction for review.'
      ],
      prevention: [
        'Only extract items that can be positively identified on a drawing or in a schedule.',
        'If an item "should" exist based on system logic but is not shown — mark as "implicit" (Medium), NOT as a confirmed item.',
        'Never invent pipe sizes, cable ratings, equipment specs, or quantities.',
        'If unsure whether an item exists — flag it rather than include it.'
      ]
    }
  },

  /* ══════════════════════════════════════════════════════════════
     4. CONFIDENCE IN CONTEXT
     ══════════════════════════════════════════════════════════════ */
  context: {
    principles: [
      'Confidence reflects EXTRACTION CERTAINTY — how sure are we that this item, at this quantity and specification, is correct?',
      'Confidence does NOT reflect item IMPORTANCE or VALUE. A £500,000 chiller at Low confidence needs MORE attention, not less.',
      'Low confidence is NOT a failure — it is an honest assessment that the estimator should verify this item. Hiding uncertainty is far worse than flagging it.',
      'High confidence does not mean "guaranteed correct" — it means "based on available information, this is the best extraction possible".',
      'Confidence can change over time — as design develops and more information becomes available, items can be re-scored.'
    ],

    pairing_rule: {
      rule: 'Every Low confidence item MUST be paired with:',
      requirements: [
        'A specific flag explaining WHY confidence is Low (not just "Low confidence")',
        'What information would be needed to raise confidence (actionable recommendation)',
        'Whether the item should be included in pricing as-is or held pending clarification'
      ],
      bad_example: '{ confidence: "Low" } — NO. Why is it Low? What should the estimator do?',
      good_example: '{ confidence: "Low", flag: "Pipe material not stated on drawing or in spec. Drawing shows 42mm pipe but material could be copper, steel, or MLCP — affects price significantly.", recommendation: "Obtain specification section Y10 to confirm pipe material before pricing." }'
    },

    estimator_signoff: {
      rule: 'The estimator MUST sign off ALL Low confidence items before pricing proceeds.',
      process: [
        '1. AI extraction produces output with confidence scores.',
        '2. All Low confidence items are listed in "estimator_review_required" section.',
        '3. Estimator reviews each Low item — accepts, adjusts, or requests more information.',
        '4. Only after estimator sign-off can Low items be used for pricing.',
        '5. If estimator cannot resolve a Low item, it should be qualified in the tender submission.'
      ],
      tender_qualification: 'Items that remain Low after estimator review should be listed as tender qualifications: "Our price is based on [assumption]. If [actual requirement] differs, we reserve the right to adjust."'
    },

    value_risk_matrix: {
      description: 'High-value items with Low confidence represent the HIGHEST commercial risk.',
      matrix: [
        { value: 'High', confidence: 'High', risk: 'LOW — well understood, well quantified.', action: 'Price with confidence.' },
        { value: 'High', confidence: 'Medium', risk: 'MEDIUM — spec or quantity has some uncertainty.', action: 'Price with contingency allowance.' },
        { value: 'High', confidence: 'Low', risk: 'HIGH — significant cost item with significant uncertainty.', action: 'Flag to commercial team. Qualify in tender. Consider provisional sum.' },
        { value: 'Low', confidence: 'High', risk: 'LOW — small item, well understood.', action: 'Price normally.' },
        { value: 'Low', confidence: 'Medium', risk: 'LOW — small item, minor uncertainty.', action: 'Price with standard allowance.' },
        { value: 'Low', confidence: 'Low', risk: 'MEDIUM — small item but uncertainty could multiply across many similar items.', action: 'Check if there are many similar items — cumulative risk may be significant.' }
      ]
    }
  }
};

module.exports = KB_X02;
