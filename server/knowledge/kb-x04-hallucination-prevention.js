/**
 * KB-X04: Hallucination Prevention Rules
 *
 * Structured rules to prevent the AI from inventing, assuming,
 * or extrapolating M&E quantities, specifications, or system
 * layouts not supported by the source documents.
 * Injected into extraction prompts at runtime.
 *
 * Part of Contraq M&E Knowledge Base v7.1
 * Source: Contraq AI governance, estimation best practice
 */

const KB_X04 = {
  id: 'KB-X04',
  title: 'Hallucination Prevention Rules',
  version: '1.0',
  date: '2026-03-19',

  /* ══════════════════════════════════════════════════════════════
     1. HALLUCINATION DEFINITION
     ══════════════════════════════════════════════════════════════ */
  definition: {
    what: 'In M&E extraction, hallucination is the AI producing output that is NOT supported by the source documents provided.',
    why_dangerous: 'Hallucinated quantities enter the takeoff as if they were real measurements. If not caught, they are priced, tendered, and may result in commercial loss or contractual disputes.',

    forms: [
      {
        type: 'Invented Quantities',
        description: 'Producing a quantity (length, count, area) that cannot be traced to a specific measurement, annotation, or schedule on the provided documents.',
        example: 'Stating "45m of 42mm copper pipe" when no 42mm pipe is visible on any drawing and no pipe schedule lists it.',
        severity: 'HIGH — creates a fictitious takeoff item.'
      },
      {
        type: 'Assumed Specifications',
        description: 'Assigning a material, size, rating, or type to an item when the specification is not stated in the provided documents.',
        example: 'Calling a pipe "copper" when the drawing only shows a line with no material annotation and the spec does not state the material.',
        severity: 'HIGH — may lead to pricing the wrong material entirely.'
      },
      {
        type: 'Extrapolated Layouts',
        description: 'Extending or completing a system layout beyond what is shown on the drawing, based on what the AI thinks the system "should" look like.',
        example: 'A drawing shows pipework terminating at the edge of the drawing area. The AI extends the pipe run into the adjacent area (not shown) because "it must connect somewhere".',
        severity: 'HIGH — creates quantities for a layout that may not exist.'
      },
      {
        type: 'Convention-Based Additions',
        description: 'Adding items because trade convention says they "should" be there, even though they are not shown on any drawing or listed in any schedule.',
        example: 'Adding isolation valves at every branch because "that is standard practice" when no valves are shown and the spec does not require them.',
        severity: 'MEDIUM — these items may indeed be needed, but they should be flagged as IMPLICIT (KB-X01), not presented as confirmed extractions.',
        correct_approach: 'Flag as "Implicit" source with Medium confidence. Do NOT present as if drawn or scheduled.'
      },
      {
        type: 'Containment-to-Cable Estimation',
        description: 'Estimating the number and size of cables inside a cable tray/trunking based on the containment size, without being instructed to do so.',
        example: 'Seeing a 450mm cable tray on the drawing and stating "approximately 20 cables of various sizes" without any cable schedule or circuit diagram.',
        severity: 'MEDIUM — containment size implies capacity but does NOT define content. Cable quantities come from cable schedules, not containment drawings.',
        correct_approach: 'Extract containment (tray, trunking, conduit) dimensions and lengths. For cables, use cable schedule or flag "cable schedule required for cable quantities".'
      },
      {
        type: 'Specification from AI Training Data',
        description: 'Applying technical specifications from the AI\'s training knowledge rather than from the project documents. Even if the AI\'s knowledge is correct in general, it may not apply to this specific project.',
        example: 'Stating "insulation thickness 25mm per BS 5422" when the project spec actually requires 40mm. The AI\'s training data is correct for the general case but wrong for this project.',
        severity: 'HIGH — project-specific specifications override general standards. The AI must extract from provided documents, not from memory.',
        correct_approach: 'If spec states a value, use it. If spec is silent, state "spec silent — BS 5422 suggests [X]mm" and flag as "assumed per standard — verify".'
      }
    ]
  },

  /* ══════════════════════════════════════════════════════════════
     2. HIGH RISK SCENARIOS
     ══════════════════════════════════════════════════════════════ */
  high_risk_scenarios: {
    description: 'These situations have the HIGHEST probability of triggering hallucination. Apply EXTRA verification when any of these are present.',

    scenarios: [
      {
        scenario: 'Complex plant rooms with overlapping services',
        risk: 'Multiple pipe/duct/cable systems overlapping makes it difficult to distinguish individual services. AI may misidentify or merge services.',
        prevention: 'Trace each service individually by colour/line type per legend. Count systematically. If uncertain about a specific service, flag it rather than guess.',
        verification: 'Cross-check plant room extraction against equipment schedule — every piece of equipment should have connections. Missing connections = possible misidentification.'
      },
      {
        scenario: 'Low resolution or scanned PDF drawings',
        risk: 'Text annotations may be illegible. Line types may be indistinguishable. Colours may be washed out or merged.',
        prevention: 'Note drawing quality in output metadata. Set baseline confidence to Medium at best. Flag any items where annotations cannot be read.',
        verification: 'If key annotations are illegible, do NOT guess — state "annotation illegible at [location]" and set Low confidence.'
      },
      {
        scenario: 'Drawings with poor annotation or missing schedules',
        risk: 'Without annotations, the AI must rely entirely on symbols and scale — increasing interpretation risk.',
        prevention: 'Extract what is clearly identifiable. For unidentified items, describe the symbol and location but do NOT assign a specification.',
        verification: 'Count unidentified items. If >20% of items on a drawing cannot be positively identified, flag the entire drawing.'
      },
      {
        scenario: 'Specification only — no drawings provided',
        risk: 'Spec describes WHAT is required but not HOW MUCH. Without drawings, quantities cannot be extracted.',
        prevention: 'Extract specification REQUIREMENTS only (KB-I01/E01/M01 material types, thicknesses, standards). Do NOT estimate quantities.',
        verification: 'Ensure output clearly states "quantities cannot be extracted — no drawings provided". Spec analysis only.',
        flag: 'CRITICAL — no quantities without drawings.'
      },
      {
        scenario: 'Drawings marked Preliminary or For Coordination',
        risk: 'Design is not finalised. Routing, equipment selection, and sizes may change.',
        prevention: 'Extract quantities but mark ALL as PRELIMINARY. Apply cautious interpretation.',
        verification: 'Check if any items appear provisional (dotted lines, TBC annotations, alternative options shown).'
      },
      {
        scenario: 'Unfamiliar abbreviations or non-standard symbols',
        risk: 'AI may misinterpret a symbol or abbreviation, leading to wrong item identification.',
        prevention: 'If an abbreviation or symbol is not in the legend AND not recognisable from CIBSE/BS standards, do NOT guess. Describe it and flag for identification.',
        verification: 'List all unrecognised symbols in the flags section with their drawing location.'
      },
      {
        scenario: 'Partial drawings — service appears to continue beyond drawing edge',
        risk: 'AI may extrapolate the service run beyond the drawing area based on assumed routing.',
        prevention: 'Measure ONLY what is shown. Note where services exit the drawing boundary. State "continues beyond drawing extent — additional drawings required".',
        verification: 'Check for match lines or drawing continuation references. If found, note which drawing continues the route.'
      },
      {
        scenario: 'Mixed revision drawings in document set',
        risk: 'AI may extract from a superseded drawing, producing quantities that are no longer current.',
        prevention: 'Always check drawing revision before extracting. Use latest revision only. Flag if multiple revisions present.',
        verification: 'List all drawing revisions processed. Confirm latest revision used for each.'
      }
    ]
  },

  /* ══════════════════════════════════════════════════════════════
     3. PREVENTION RULES
     ══════════════════════════════════════════════════════════════ */
  rules: {
    'H-01': {
      id: 'H-01',
      name: 'Only Extract What You Can See',
      rule: 'If an item is NOT visible on the drawing or listed in a schedule, DO NOT extract it.',
      detail: 'Convention does not override evidence. Trade practice says "there should be a valve here" but if no valve is shown and no valve schedule lists it, you cannot extract a valve. You CAN flag it as an implicit item (Source: Implicit, Medium confidence) but you CANNOT present it as a confirmed extraction.',
      test: 'For every item in your extraction: Can I point to where on the drawing I saw this? If no → do not extract.',
      violation_example: 'Extracting "2nr isolation valves at pump P-01" when no valves are shown on the drawing near P-01.',
      correct_approach: 'Flag: "No isolation valves shown at pump P-01 — standard practice requires isolation valves at both sides of pump. Recommend adding to takeoff as implicit items, subject to estimator confirmation."'
    },
    'H-02': {
      id: 'H-02',
      name: 'No Specification from Memory',
      rule: 'Do NOT apply material specifications, sizes, or ratings from your training data unless explicitly instructed to do so AND the assumption is flagged.',
      detail: 'The AI knows that LTHW pipework is "typically" copper or carbon steel. But "typically" is not "definitely" — this project might use MLCP, stainless steel, or something else. Only the project specification defines the material.',
      test: 'For every specification in your extraction: Did I read this from the provided spec or drawing, or am I applying general knowledge? If general knowledge → flag as assumption.',
      violation_example: 'Stating "42mm copper pipe" when the drawing shows "42mm" but does not state "copper" and no spec is provided.',
      correct_approach: 'State "42mm pipe — material not specified on drawing or in spec. Flag: material specification required before pricing."'
    },
    'H-03': {
      id: 'H-03',
      name: 'No Quantity from Schematics',
      rule: 'NEVER extract linear quantities (metres) from schematics, flow diagrams, riser diagrams, or single-line diagrams.',
      detail: 'Schematics show system LOGIC — which components connect to which. Lengths on schematics are diagrammatic and bear no relation to physical distances. A 10mm line on a schematic could represent 100m of pipe in reality.',
      test: 'For every linear measurement: Was this measured from a GA drawing at a stated scale? If measured from a schematic → delete the measurement.',
      violation_example: 'Measuring "15m of pipework" from a heating schematic where the pipe line happens to be drawn 15cm long at some assumed scale.',
      correct_approach: 'From schematic: extract EQUIPMENT LIST (what exists), CONNECTIVITY (what connects to what), SIZES (if annotated). Do NOT extract lengths. State "schematic only — linear quantities require GA drawing".',
      exception: 'Equipment COUNTS from schematics are acceptable (Medium confidence) because the schematic should correctly show the number of items in the system.'
    },
    'H-04': {
      id: 'H-04',
      name: 'Flag Before Assuming',
      rule: 'If you are about to make an assumption to complete an extraction, STOP. Flag the assumption. Mark the item Low confidence.',
      detail: 'Assumptions are necessary sometimes — but they must be VISIBLE, not hidden. An assumption buried in a quantity is a hidden risk. An assumption flagged in the output is a managed risk.',
      test: 'Before writing any extraction value, ask: "Am I certain of this, or am I assuming?" If assuming → flag it.',
      process: '1. Identify the gap (what information is missing). 2. State the assumption you would make. 3. Flag it: "Assumption: [what was assumed]. Reason: [why information is missing]. Impact: [how it affects the item]." 4. Set confidence to Low.',
      violation_example: 'Silently assuming "25mm insulation" because BS 5422 says 25mm for this pipe size, without noting that the spec didn\'t state the thickness.',
      correct_approach: 'State the quantity with note: "Insulation thickness assumed 25mm per BS 5422 Table 7 — spec does not state thickness. Verify with design team." Confidence: Low.'
    },
    'H-05': {
      id: 'H-05',
      name: 'Schedule Overrides Estimation',
      rule: 'If a schedule exists for an item, use the schedule. NEVER estimate what a schedule already answers.',
      detail: 'Schedules are prepared by the designer. They represent definitive quantities and specifications. Estimation is for items NOT covered by schedules. Using estimation when a schedule is available is a form of hallucination — you are replacing a definitive answer with a guess.',
      test: 'Before estimating any item: Does a schedule exist for this item type? (Equipment schedule, valve schedule, luminaire schedule, cable schedule, damper schedule.) If yes → use the schedule.',
      violation_example: 'Counting luminaires from the reflected ceiling plan when a luminaire schedule is provided with exact quantities per room.',
      correct_approach: 'Use luminaire schedule quantities. Cross-reference RCP count to verify — if different, flag the discrepancy but use the schedule count.',
      cross_ref: 'KB-X01 priority order: Schedule > Annotation > Scale > Estimated.'
    },
    'H-06': {
      id: 'H-06',
      name: 'Uncertainty = Low Confidence + Flag',
      rule: 'When uncertain about ANY aspect of an extraction, do NOT fill the gap with a plausible answer. Mark it Low confidence and explain why in the flags section.',
      detail: 'The AI\'s plausible answer may be wrong. A wrong answer that looks right is more dangerous than a flagged gap. The estimator can fill gaps with project knowledge — the AI cannot.',
      test: 'For every item: Am I CERTAIN of this? If not certain → Low confidence + flag explaining the uncertainty.',
      violation_example: 'Uncertain whether a line on the drawing is a pipe or a cable tray. Guessing "pipe" and extracting it as 50m of pipework.',
      correct_approach: 'State: "Unidentified service at [location]. Appears to be [pipe/cable tray] but cannot confirm from drawing. Flag: service type requires confirmation. Not extracted — flag only."'
    }
  },

  /* ══════════════════════════════════════════════════════════════
     4. PRE-OUTPUT SELF-CHECK
     ══════════════════════════════════════════════════════════════ */
  self_check: {
    rule: 'Before FINALISING any extraction output, run this self-check. If ANY question answers YES, revise the output before returning it.',

    questions: [
      {
        id: 'SC-01',
        question: 'Is every quantity traceable to something visible on the drawing or listed in a schedule?',
        if_no: 'PASS — all quantities have a source.',
        if_yes: 'FAIL — identify the untraceable items. Either remove them, flag them as implicit, or explain their source.',
        rule_ref: 'H-01'
      },
      {
        id: 'SC-02',
        question: 'Have I applied any material specifications from my training data (memory) without flagging them as assumptions?',
        if_no: 'PASS — all specifications come from provided documents.',
        if_yes: 'FAIL — identify the assumed specs. Add flags: "Assumed [spec] — not stated in provided documents. Verify." Set affected items to Medium or Low confidence.',
        rule_ref: 'H-02'
      },
      {
        id: 'SC-03',
        question: 'Have I extracted any linear quantities from schematics, riser diagrams, or flow diagrams?',
        if_no: 'PASS — all linear quantities from GA drawings.',
        if_yes: 'FAIL — remove the linear quantities. Replace with: "Linear quantities require GA drawing — schematic only provided." Equipment counts from schematics are OK (Medium confidence).',
        rule_ref: 'H-03'
      },
      {
        id: 'SC-04',
        question: 'Have I made any assumptions without flagging them in the output?',
        if_no: 'PASS — all assumptions are flagged.',
        if_yes: 'FAIL — find every hidden assumption. Make it visible in the flags section. Set affected items to Low confidence.',
        rule_ref: 'H-04'
      },
      {
        id: 'SC-05',
        question: 'Have I estimated anything that a provided schedule already answers?',
        if_no: 'PASS — schedules used where available.',
        if_yes: 'FAIL — replace the estimate with the schedule value. Note: "Corrected: schedule value used instead of estimate."',
        rule_ref: 'H-05'
      },
      {
        id: 'SC-06',
        question: 'Are there any uncertain items that I have presented with Medium or High confidence?',
        if_no: 'PASS — confidence accurately reflects certainty.',
        if_yes: 'FAIL — downgrade uncertain items to Low confidence. Add flags explaining the uncertainty.',
        rule_ref: 'H-06'
      },
      {
        id: 'SC-07',
        question: 'Have I extrapolated any service runs beyond the drawing boundary?',
        if_no: 'PASS — all measurements within drawing extents.',
        if_yes: 'FAIL — trim to drawing extent. Note: "Service continues beyond drawing boundary. Quantity covers visible extent only."',
        rule_ref: 'H-01'
      },
      {
        id: 'SC-08',
        question: 'Could an experienced M&E estimator, looking at the same documents, question any of my extracted values?',
        if_no: 'PASS — extraction would be defensible.',
        if_yes: 'Review the questionable items. If the concern is justified, add flags. If the concern is about judgement calls, note the judgement in the flags section.',
        rule_ref: 'General'
      }
    ],

    output_statement: {
      all_pass: '"Self-check: PASSED. All 8 checks clear. No hallucination risks identified."',
      some_fail: '"Self-check: [N] items revised following hallucination prevention review. See flags for details."',
      note: 'The self-check statement should appear in the output metadata so the estimator knows it was performed.'
    }
  },

  /* ══════════════════════════════════════════════════════════════
     5. HALLUCINATION SEVERITY CLASSIFICATION
     ══════════════════════════════════════════════════════════════ */
  severity_classification: {
    high: {
      level: 'HIGH',
      description: 'Hallucination creates a fictitious item, quantity, or specification that has no basis in the source documents.',
      examples: ['Inventing a pipe run not shown on any drawing', 'Applying a specification not in the project spec', 'Adding equipment not on any schedule or drawing'],
      action: 'REMOVE the item entirely. Or reclassify as "implicit" if trade practice genuinely requires it, with Low confidence and full explanation.',
      risk: 'If not caught, creates a priced item for something that may not exist.'
    },
    medium: {
      level: 'MEDIUM',
      description: 'Hallucination fills a gap with a plausible but unconfirmed value.',
      examples: ['Estimating cable quantities from containment size', 'Applying standard waste factor as if it were project-specific', 'Assuming material type from colour without legend confirmation'],
      action: 'FLAG the assumption explicitly. Set confidence to Low. Describe what information would confirm the value.',
      risk: 'If not caught, creates a price based on assumption rather than fact. May be close or may be completely wrong.'
    },
    low: {
      level: 'LOW',
      description: 'Hallucination in a minor detail that does not significantly affect the takeoff.',
      examples: ['Assuming standard mounting height for a socket', 'Rounding a scale measurement to a standard length', 'Assuming standard rung spacing on cable ladder'],
      action: 'Note the assumption. Confidence can remain Medium if the assumption is reasonable.',
      risk: 'Minimal commercial impact. But transparency is still required.'
    }
  }
};

module.exports = KB_X04;
