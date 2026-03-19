/**
 * KB-X03: Conflict Resolution Rules
 *
 * Structured rules for identifying, classifying, and handling
 * conflicts between drawings, specs, schedules, and other
 * project documents during M&E quantity extraction.
 * Injected into extraction prompts at runtime.
 *
 * Part of Contraq M&E Knowledge Base v7.0
 * Source: JCT/NEC contract practice, NRM2, A90, UK QS practice
 */

const KB_X03 = {
  id: 'KB-X03',
  title: 'Conflict Resolution Rules',
  version: '1.0',
  date: '2026-03-19',

  /* ══════════════════════════════════════════════════════════════
     GOLDEN RULE
     ══════════════════════════════════════════════════════════════ */
  golden_rule: {
    statement: 'NEVER resolve a conflict autonomously without flagging it. The estimator MUST be aware of EVERY conflict, regardless of severity.',
    reasoning: 'A silently resolved conflict that turns out to be wrong is MORE DANGEROUS than a flagged conflict that slows the process. Silent resolution hides risk. Flagged conflicts are visible risk that the estimator can manage.',
    corollary: 'Even when the resolution is obvious (e.g. use latest revision), STILL flag that the conflict existed. The estimator needs to know that different information was present in the document set.',
    application: 'Every conflict produces THREE outputs: (1) the resolution applied, (2) what each source said, (3) a flag in the output for estimator awareness.'
  },

  /* ══════════════════════════════════════════════════════════════
     1. CONFLICT TYPES & RESOLUTION
     ══════════════════════════════════════════════════════════════ */
  conflict_types: {

    drawing_vs_spec: {
      name: 'Drawing vs Specification',
      description: 'Drawing shows one thing, specification states another. Common and important.',
      resolution: 'Default to SPECIFICATION requirement.',
      authority: 'Spec governs quality, materials, and methods. Drawing governs dimensions and positions. (JCT principle — cross-ref KB-C04)',
      confidence: 'Medium — for affected items.',
      action: [
        'Extract using spec requirement for material/quality/method.',
        'Extract using drawing for quantity/position/routing.',
        'Flag the conflict clearly: state what drawing shows AND what spec requires.',
        'Note which source was used for the extraction.',
        'If the conflict affects QUANTITY (not just spec), use spec but note drawing measurement as alternative.'
      ],
      examples: [
        { drawing: '42mm copper pipe annotated on plan', spec: 'Spec Y10 requires MLCP pipework for all LTHW', resolution: 'Use MLCP (spec wins for material). Quantity from drawing route. Flag: "Drawing annotates copper but spec requires MLCP."' },
        { drawing: 'Ductwork shown as 600×400 on plan', spec: 'Spec says "minimum 800×400 for this system"', resolution: 'Use 800×400 (spec minimum). Flag: "Drawing shows 600×400 but spec requires minimum 800×400. Verify design intent."' },
        { drawing: '25mm insulation shown', spec: 'Spec states "40mm minimum per BS 5422"', resolution: 'Use 40mm (spec minimum). Flag: "Drawing shows 25mm but spec requires 40mm minimum. Use spec value."' }
      ],
      flag_template: '{ conflict_type: "Drawing vs Spec", description: "[what differs]", drawing_says: "[drawing value]", spec_says: "[spec value]", resolution: "Spec requirement used", recommendation: "[what estimator should check]" }'
    },

    drawing_vs_drawing_same_rev: {
      name: 'Drawing vs Drawing (Same Revision)',
      description: 'Two different drawings at the same revision level show conflicting information for the same area or item.',
      resolution: 'DO NOT extract for the affected items. Flag for estimator resolution.',
      confidence: 'Low — cannot determine which drawing is correct.',
      action: [
        'Identify the specific conflict (different quantities, different sizes, different routing).',
        'Flag BOTH drawing numbers and what each shows.',
        'Do NOT pick one drawing over the other — they have equal authority.',
        'If the conflict affects only part of the extraction, extract unaffected items normally.',
        'Request estimator to seek clarification from the design team before finalising.'
      ],
      examples: [
        { dwg_a: 'Mechanical GA shows 8 radiators in Zone A', dwg_b: 'Heating schematic shows 6 radiators in Zone A', resolution: 'Flag both. Do not extract radiator count for Zone A until resolved. Note: schematic may be out of date.' },
        { dwg_a: 'Level 01 ceiling plan shows 12 diffusers', dwg_b: 'Level 01 HVAC GA shows 10 diffusers', resolution: 'Flag both. Extract as "10-12 nr — conflict between drawings, verify". Confidence: Low.' }
      ],
      severity: 'CRITICAL if both drawings are For Construction. MODERATE if one is For Coordination.',
      flag_template: '{ conflict_type: "Drawing vs Drawing (same revision)", description: "[what differs]", drawing_a: "[DWG number]: [value]", drawing_b: "[DWG number]: [value]", resolution: "NOT EXTRACTED — estimator to resolve", recommendation: "Request design clarification" }'
    },

    drawing_vs_drawing_diff_rev: {
      name: 'Drawing vs Drawing (Different Revisions)',
      description: 'Multiple revisions of the same drawing are present in the document set.',
      resolution: 'Use LATEST revision only. Discard older revisions entirely.',
      confidence: 'High — if latest revision is For Construction. Medium — if latest is For Coordination.',
      action: [
        'Identify the latest revision by revision number/letter (highest = latest).',
        'Extract from latest revision ONLY.',
        'Flag that an older revision was also present in the document set.',
        'Note: "Superseded drawing [number] Rev [X] was also provided. Extracted from Rev [Y] (latest)."',
        'If revision numbering is ambiguous, flag for estimator to confirm which is latest.'
      ],
      revision_priority: 'C-prefix (construction) > P-prefix (preliminary). Higher number = later. Rev D > Rev C > Rev B > Rev A. Rev P05 > Rev P03.',
      examples: [
        { old: 'MX-001 Rev P03 (Preliminary)', new: 'MX-001 Rev C01 (For Construction)', resolution: 'Use Rev C01. Flag: "Superseded Rev P03 also in document set."' },
        { old: 'ME-102 Rev B', new: 'ME-102 Rev D', resolution: 'Use Rev D. Flag: "Rev B also provided — superseded by Rev D."' }
      ],
      flag_template: '{ conflict_type: "Superseded Drawing", description: "Multiple revisions present", latest: "[DWG Rev Y]", superseded: "[DWG Rev X]", resolution: "Latest revision used", recommendation: "Confirm Rev [Y] is current issue" }'
    },

    spec_vs_spec: {
      name: 'Specification vs Specification (Internal Contradiction)',
      description: 'The specification contradicts itself — two clauses state different requirements for the same item.',
      resolution: 'Flag BOTH conflicting clauses. DO NOT resolve autonomously.',
      confidence: 'Low — for all items affected by the contradicting clauses.',
      action: [
        'Identify both clauses with their section/clause numbers.',
        'State exactly what each clause requires.',
        'Do NOT pick one clause over the other — the spec author must clarify.',
        'Extract using the MORE CONSERVATIVE (higher spec/thicker/more expensive) interpretation as a PROVISIONAL value.',
        'Flag prominently for estimator/design team resolution.'
      ],
      common_causes: [
        'Template/boilerplate spec not fully edited for the specific project.',
        'Spec updated in one section but not in a cross-referencing section.',
        'Different authors wrote different sections without coordination.',
        'Cut-and-paste from a previous project with different requirements.'
      ],
      examples: [
        { clause_a: 'Section 2.3: "Pipe insulation 25mm Armaflex"', clause_b: 'Section 4.1: "All cold water insulation minimum 30mm per BS 5422"', resolution: 'Flag both. Use 30mm as provisional (more conservative). Flag: "Spec contradicts itself — 25mm in §2.3 vs 30mm minimum in §4.1."' },
        { clause_a: 'Section Y10: "All pipework copper to BS EN 1057"', clause_b: 'Section Y10 clause 3.2: "LTHW pipework carbon steel to BS EN 10255"', resolution: 'Flag both. Cannot determine which material is correct. Flag: "Same spec section gives conflicting pipe materials."' }
      ],
      flag_template: '{ conflict_type: "Spec vs Spec", description: "[what contradicts]", clause_a: "[section]: [requirement]", clause_b: "[section]: [requirement]", resolution: "NOT RESOLVED — both clauses flagged. Provisional: [conservative value]", recommendation: "Design team to clarify which clause governs" }'
    },

    schedule_vs_drawing: {
      name: 'Schedule vs Drawing',
      description: 'Equipment/material schedule shows different quantity or specification than the drawing.',
      resolution: 'Use SCHEDULE as primary source (higher authority for equipment specification and count).',
      confidence: 'High — if using schedule. Flag the drawing discrepancy.',
      action: [
        'Use schedule count and specification.',
        'Note the drawing count/spec as a secondary reference.',
        'Flag the discrepancy for estimator awareness.',
        'Common reasons: drawing not updated to match latest schedule, schedule has a typo, drawing shows an indicative layout that differs from schedule count.'
      ],
      exceptions: [
        'If schedule is marked "provisional" or "preliminary", the drawing may be more current — flag for clarification.',
        'If schedule count is LOWER than drawing count, specifically flag: "Schedule shows fewer items than drawing — possible schedule omission."',
        'If schedule item has no corresponding drawing location, flag: "Scheduled item not located on drawing."'
      ],
      examples: [
        { schedule: 'Luminaire schedule: 24nr type A downlights in Zone 3', drawing: 'RCP shows 22nr type A downlights in Zone 3', resolution: 'Use 24 (schedule). Flag: "Drawing shows 22 but schedule states 24. Schedule count used."' },
        { schedule: 'Equipment schedule: Pump P-01, 2.2kW', drawing: 'Drawing labels P-01 as 3.0kW', resolution: 'Use schedule spec (2.2kW). Flag: "Drawing annotation (3.0kW) differs from schedule (2.2kW). Schedule used."' }
      ],
      flag_template: '{ conflict_type: "Schedule vs Drawing", description: "[what differs]", schedule_says: "[value]", drawing_says: "[value]", resolution: "Schedule value used", recommendation: "[what estimator should verify]" }'
    },

    boq_vs_drawing: {
      name: 'BoQ vs Drawing',
      description: 'Pre-measured Bill of Quantities shows different quantity than drawing measurement.',
      resolution: 'Use BOQ quantity (contractual document).',
      confidence: 'High — BoQ is the contractual quantity basis.',
      action: [
        'Use BoQ quantity.',
        'Note drawing measurement as reference.',
        'Flag the discrepancy with both values.',
        'BoQ is the contractual quantity under NRM2 — the QS has measured it.'
      ],
      exception: 'If BoQ is marked "approximate" or "provisional", flag that re-measurement may apply.',
      flag_template: '{ conflict_type: "BoQ vs Drawing", description: "[what differs]", boq_says: "[value]", drawing_says: "[value]", resolution: "BoQ quantity used (contractual)", recommendation: "Note for final account re-measurement" }'
    },

    annotation_vs_scale: {
      name: 'Annotated Dimension vs Scaled Measurement',
      description: 'A dimension written on the drawing differs from what you measure using the scale.',
      resolution: 'ALWAYS use the annotated (figured) dimension.',
      confidence: 'High — figured dimensions are authoritative.',
      action: [
        'Use the annotated dimension.',
        'The scale may be distorted (printing, PDF conversion) or the annotation may reflect a design intent that the drawing does not perfectly represent.',
        'Flag if the discrepancy is >10% — may indicate a drawing error rather than normal scale distortion.'
      ],
      rule: 'FIGURED DIMENSIONS ALWAYS OVERRIDE SCALED MEASUREMENTS. This is a fundamental drawing convention.',
      flag_template: '{ conflict_type: "Annotation vs Scale", annotated: "[value]", scaled: "[value]", resolution: "Annotated dimension used", recommendation: "[flag if >10% discrepancy]" }'
    }
  },

  /* ══════════════════════════════════════════════════════════════
     2. CONFLICT SEVERITY LEVELS
     ══════════════════════════════════════════════════════════════ */
  severity: {

    critical: {
      level: 'CRITICAL',
      description: 'Conflicts that PREVENT reliable extraction for affected items.',
      criteria: [
        'Two For Construction drawings show the same area with fundamentally different information.',
        'Spec and drawing show fundamentally different system types (e.g. spec says VRF, drawing shows ChW FCUs).',
        'Drawing and spec show completely different equipment (e.g. spec lists boilers, drawing shows heat pumps).',
        'BoQ item has no corresponding drawing or spec — cannot verify what is being priced.'
      ],
      action: [
        'STOP extraction for the affected area/items.',
        'Flag IMMEDIATELY with CRITICAL severity.',
        'Do NOT attempt to extract quantities for conflicted items.',
        'List what information is needed to resolve the conflict.',
        'Recommend: estimator to contact design team for clarification before extraction continues.'
      ],
      impact: 'Extraction is blocked for affected items. Overall extraction may be incomplete.',
      flag_template: '{ severity: "CRITICAL", conflict: "[description]", impact: "Extraction BLOCKED for [affected items]", action_required: "Design clarification needed before extraction can proceed" }'
    },

    moderate: {
      level: 'MODERATE',
      description: 'Conflicts that affect quantity or specification but do not prevent extraction.',
      criteria: [
        'Different pipe/duct sizes shown on drawing vs spec.',
        'Equipment count differs between drawing and schedule by more than 2 items.',
        'Insulation thickness differs between drawing annotation and spec.',
        'Valve type differs between drawing symbol and spec description.',
        'Cable size differs between single-line diagram and cable schedule.'
      ],
      action: [
        'Extract using the HIGHER AUTHORITY source (per KB-C04 hierarchy).',
        'Flag the conflict with BOTH values.',
        'Set confidence to Medium for affected items.',
        'Note which source was used and why.',
        'Estimator should review before finalising.'
      ],
      impact: 'Extraction proceeds but affected items have reduced confidence.',
      flag_template: '{ severity: "MODERATE", conflict: "[description]", source_a: "[value]", source_b: "[value]", resolution: "[which source used and why]", action_required: "Estimator to verify" }'
    },

    minor: {
      level: 'MINOR',
      description: 'Conflicts that affect detail only — no significant impact on quantity or pricing.',
      criteria: [
        'Minor dimension discrepancy within 5% (likely print/scale distortion).',
        'Annotation inconsistency that does not affect quantity (e.g. different abbreviation for same item).',
        'Drawing symbol slightly different from legend but clearly identifiable.',
        'Room name differs between drawing and spec but location is unambiguous.',
        'Minor revision cloud with no apparent change to M&E services.'
      ],
      action: [
        'Extract using best interpretation.',
        'Note the minor discrepancy in flags section.',
        'Confidence remains as-is (not downgraded for minor discrepancies).',
        'Estimator awareness only — no action required unless they disagree with interpretation.'
      ],
      impact: 'Negligible impact on extraction accuracy.',
      flag_template: '{ severity: "MINOR", conflict: "[description]", note: "[how it was interpreted]" }'
    }
  },

  /* ══════════════════════════════════════════════════════════════
     3. CONFLICT DETECTION CHECKLIST
     ══════════════════════════════════════════════════════════════ */
  detection_checklist: {
    description: 'Run this checklist during extraction to identify potential conflicts BEFORE they cause errors.',

    checks: [
      {
        check: 'Multiple revisions of same drawing',
        how: 'Check drawing numbers — if same number appears with different revisions, flag and use latest.',
        common_location: 'Multiple PDFs in document set, or revision history on drawing.'
      },
      {
        check: 'Drawing vs spec material mismatch',
        how: 'Compare pipe/cable/duct material annotations on drawing against spec material clauses.',
        common_location: 'Spec sections Y10 (pipework), Y20 (ductwork), electrical spec vs drawing annotations.'
      },
      {
        check: 'Schedule count vs drawing count',
        how: 'Count items on drawing, compare to schedule total. Flag if different.',
        common_location: 'Luminaire schedule vs RCP, equipment schedule vs GA, valve schedule vs mechanical plan.'
      },
      {
        check: 'Spec internal contradiction',
        how: 'When reading spec, watch for: same parameter stated differently in different sections, or general clause contradicted by specific clause.',
        common_location: 'Part 1 (General) vs Part 2 (Products). Or spec intro vs detailed work section.'
      },
      {
        check: 'Drawing annotation vs specification',
        how: 'Compare dimensional annotations and size labels on drawings against spec requirements.',
        common_location: 'Insulation thickness, pipe sizes, duct sizes, equipment ratings.'
      },
      {
        check: 'Drawing status mismatch',
        how: 'Check if all drawings are at the same status. Mixed For Construction + Preliminary = flag.',
        common_location: 'Title blocks across the drawing set.'
      },
      {
        check: 'Cross-discipline conflict',
        how: 'Check mechanical vs electrical drawings for same area — do they show same equipment, same routes?',
        common_location: 'Combined services drawings vs single-discipline drawings.'
      }
    ]
  },

  /* ══════════════════════════════════════════════════════════════
     4. CONFLICT OUTPUT FORMAT
     ══════════════════════════════════════════════════════════════ */
  output_format: {
    rule: 'Every identified conflict MUST appear in the "conflicts" array of the extraction output. Format:',
    schema: {
      conflict_type: 'Drawing vs Spec | Drawing vs Drawing | Spec vs Spec | Schedule vs Drawing | BoQ vs Drawing | Annotation vs Scale',
      severity: 'CRITICAL | MODERATE | MINOR',
      description: 'What the conflict is — clear, specific, factual.',
      source_a: 'What source A says (with document reference).',
      source_b: 'What source B says (with document reference).',
      resolution: 'What was done — which source was used, or "NOT EXTRACTED" if blocked.',
      recommendation: 'What the estimator should do — specific, actionable.',
      affected_items: 'Which takeoff items are affected by this conflict.'
    },
    no_conflicts: 'If no conflicts are found, state: "conflicts": []. An empty array is valid — it means no conflicts were detected. Do NOT omit the conflicts field.'
  }
};

module.exports = KB_X03;
