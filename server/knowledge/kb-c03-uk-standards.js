/**
 * KB-C03: UK Standards & Regulations Reference
 *
 * Structured lookup tables for UK M&E standards by trade,
 * common spec clause patterns, and flag triggers.
 * Injected into extraction prompts at runtime.
 *
 * Part of Contraq M&E Knowledge Base v5.3
 * Source: BSI, CIBSE, BSRIA, IET, TIMSA, Building Regulations
 */

const KB_C03 = {
  id: 'KB-C03',
  title: 'UK Standards & Regulations Reference',
  version: '1.0',
  date: '2026-03-18',

  /* ══════════════════════════════════════════════════════════════
     1. MECHANICAL STANDARDS
     ══════════════════════════════════════════════════════════════ */
  mechanical: {
    'BS EN 806': {
      title: 'Specifications for installations inside buildings conveying water for human consumption',
      parts: {
        'Part 1': 'General',
        'Part 2': 'Design',
        'Part 3': 'Pipe sizing — simplified method',
        'Part 4': 'Installation',
        'Part 5': 'Operation and maintenance'
      },
      affects: ['Pipe material selection', 'Pipe sizing methodology', 'Installation methods', 'Testing requirements'],
      quantity_impact: 'Indirect — defines materials and methods but not quantities. May specify minimum pipe sizes.',
      common_spec_usage: 'Usually referenced as "All domestic water pipework shall comply with BS EN 806". Rarely cites specific parts.',
      flag_if: 'Spec references BS EN 806 without stating which parts apply or which sizing method (simplified vs full calculation).'
    },
    'BS 8558': {
      title: 'Guide to the design, installation, testing and maintenance of services supplying water for domestic use within buildings and their curtilages',
      edition: '2015',
      affects: ['System design', 'Material specification', 'Testing procedures', 'Maintenance access'],
      quantity_impact: 'Indirect — may specify backflow prevention devices (nr), testing requirements (item).',
      common_spec_usage: 'Often referenced alongside BS EN 806 for domestic water systems.',
      flag_if: 'Spec references BS 8558 but does not define specific testing or commissioning requirements.'
    },
    'BS EN 13480': {
      title: 'Metallic industrial piping',
      parts: {
        'Part 1': 'General',
        'Part 2': 'Materials',
        'Part 3': 'Design and calculation',
        'Part 4': 'Fabrication and installation',
        'Part 5': 'Inspection and testing',
        'Part 6': 'Additional requirements for buried piping'
      },
      affects: ['Industrial/process pipework material', 'Pressure ratings', 'Welding procedures', 'Testing requirements'],
      quantity_impact: 'May specify pressure test requirements (item), weld inspection (nr), radiographic testing (nr).',
      common_spec_usage: 'Referenced for LTHW/MTHW/CHW steel pipework in commercial buildings.',
      flag_if: 'Spec references BS EN 13480 for standard commercial heating — may be overspecified (typically BS EN 806 or CIBSE suffices).'
    },
    'CIBSE Guide B': {
      title: 'Heating, Ventilating, Air Conditioning and Refrigeration',
      parts: {
        'B1': 'Heating',
        'B2': 'Ventilation and ductwork',
        'B3': 'Air conditioning and refrigeration',
        'B4': 'Noise and vibration control',
        'B5': 'Noise and vibration control (updated)'
      },
      affects: ['System design parameters', 'Duct sizing', 'Pipe sizing', 'Equipment selection', 'Noise criteria'],
      quantity_impact: 'Indirect — defines design parameters that determine equipment sizes and service routing.',
      common_spec_usage: 'Usually referenced as general design standard: "Design in accordance with CIBSE Guide B".',
      flag_if: 'Spec references CIBSE Guide B without stating specific design criteria (e.g. room temperatures, air change rates, noise ratings).'
    },
    'BSRIA BG 29': {
      title: 'Pre-commission Cleaning of Pipework Systems',
      edition: '2020 (5th edition)',
      affects: ['Flushing and cleaning requirements', 'Chemical treatment', 'Water quality on handover'],
      quantity_impact: 'Item — pre-commission cleaning is typically a provisional or defined sum per system.',
      common_spec_usage: '"All pipework systems to be cleaned and flushed in accordance with BSRIA BG 29."',
      flag_if: 'Spec references cleaning without specifying the flushing method (dynamic flush, chemical clean) or acceptance criteria.'
    },
    'L8 ACOP': {
      title: 'Legionnaires\' Disease — The Control of Legionella Bacteria in Water Systems (Approved Code of Practice L8)',
      affects: ['DHW storage temperature (60°C min)', 'DHW distribution temperature (50°C at outlets)', 'CWS temperature (below 20°C)', 'Dead leg lengths (max permitted)', 'Insulation requirements to prevent warming of cold water'],
      quantity_impact: 'DIRECT — affects insulation thickness on cold water pipes (must prevent warming above 20°C). May require additional thermostatic mixing valves (nr), sentinel taps (nr), temperature monitoring points (nr).',
      common_spec_usage: '"All water systems designed and installed to comply with HSE L8 ACOP and HSG274."',
      flag_if: 'Spec references L8 without specifying: cold water insulation thickness, dead leg maximum lengths, TMV locations, or monitoring point requirements.',
      related: 'HSG274 Part 2 (hot and cold water systems)'
    },
    'BSRIA BG 85': {
      title: 'Commissioning Water Systems',
      affects: ['Commissioning procedures', 'Balancing requirements', 'Documentation'],
      quantity_impact: 'Item — commissioning is typically per system. May specify specific commissioning valves (nr).',
      flag_if: 'Spec references commissioning without specifying who is responsible (installer vs specialist commissioning contractor).'
    },
    'DW/144': {
      title: 'Specification for Sheet Metal Ductwork (HVCA/BESA)',
      affects: ['Ductwork gauge/thickness by size', 'Joint types', 'Airtightness class', 'Pressure class', 'Hanger/support requirements'],
      quantity_impact: 'DIRECT — specifies minimum gauge (affects cost), airtightness class (affects testing), joint type (affects labour).',
      common_spec_usage: '"All low pressure ductwork to DW/144 Class C airtightness."',
      flag_if: 'Spec references DW/144 without stating pressure class (low/medium/high) or airtightness class (A/B/C).'
    },
    'DW/172': {
      title: 'Specification for Kitchen Ventilation Systems (BESA)',
      affects: ['Kitchen extract ductwork specification', 'Fire resistance', 'Grease filtration', 'Cleaning access'],
      quantity_impact: 'DIRECT — kitchen extract duct is heavier gauge, welded joints, and more expensive than standard duct.',
      flag_if: 'Kitchen extract system referenced but DW/172 not cited — flag potential underspecification.'
    }
  },

  /* ══════════════════════════════════════════════════════════════
     2. ELECTRICAL STANDARDS
     ══════════════════════════════════════════════════════════════ */
  electrical: {
    'BS 7671': {
      title: 'Requirements for Electrical Installations — IET Wiring Regulations',
      edition: '18th Edition (2022, Amendment 2)',
      affects: ['ALL electrical installation design and installation', 'Cable sizing', 'Protection selection', 'Earthing', 'Testing and inspection'],
      quantity_impact: 'Indirect — defines design rules that determine cable sizes, protection devices, earth conductor sizes.',
      common_spec_usage: '"All electrical installations in accordance with BS 7671:2018+A2:2022."',
      flag_if: 'Spec references BS 7671 without stating edition — older editions (16th, 17th) have different requirements.',
      note: 'BS 7671 is THE governing standard for all UK electrical installations. Almost always referenced.'
    },
    'BS 5266': {
      title: 'Emergency Lighting',
      parts: {
        'Part 1': 'Code of practice for the emergency escape lighting of premises',
        'Part 7': 'Guidance on performance of luminaires'
      },
      affects: ['Emergency luminaire locations', 'Illumination levels', 'Duration (maintained/non-maintained)', 'Testing requirements'],
      quantity_impact: 'DIRECT — defines minimum number and spacing of emergency luminaires. Affects luminaire count (nr).',
      common_spec_usage: '"Emergency lighting designed to BS 5266-1 with 3-hour maintained operation."',
      flag_if: 'Spec references BS 5266 without stating: maintained vs non-maintained, duration (1hr/3hr), or whether self-contained or central battery.'
    },
    'BS 5839': {
      title: 'Fire Detection and Fire Alarm Systems for Buildings',
      parts: {
        'Part 1': 'Code of practice for design, installation, commissioning and maintenance of systems in non-domestic premises',
        'Part 6': 'Code of practice for design, installation, commissioning and maintenance of systems in domestic premises'
      },
      affects: ['Detector type and spacing', 'Call point locations', 'Sounder/beacon coverage', 'Cable type (FP200/MICC)', 'System category (L1-L5, M, P1-P2)'],
      quantity_impact: 'DIRECT — system category determines detector coverage. L1 = full coverage (most detectors). L5 = specific rooms only (fewest). Affects detector count (nr), cable length (m), sounder count (nr).',
      common_spec_usage: '"Fire alarm system to BS 5839-1 Category L2."',
      flag_if: 'Spec references BS 5839 without stating system category (L1/L2/L3/L4/L5/M/P1/P2). Category has massive impact on quantities.',
      categories: {
        L1: 'Automatic detection throughout ALL areas — maximum coverage, maximum quantity',
        L2: 'Automatic detection in defined areas (escape routes + high risk rooms)',
        L3: 'Automatic detection in escape routes only',
        L4: 'Automatic detection in escape routes within residential accommodation',
        L5: 'Automatic detection in specific rooms only (custom defined)',
        M: 'Manual system only — call points, no automatic detection',
        P1: 'Property protection — full coverage',
        P2: 'Property protection — defined areas'
      }
    },
    'BS EN 61439': {
      title: 'Low-voltage Switchgear and Controlgear Assemblies',
      note: 'Replaces BS EN 60439',
      parts: {
        'Part 1': 'General rules',
        'Part 2': 'Power switchgear and controlgear assemblies',
        'Part 3': 'Distribution boards'
      },
      affects: ['Distribution board specification', 'Switchgear ratings', 'Form of separation (1/2/3/4)'],
      quantity_impact: 'Indirect — determines DB specification and cost, not quantity.',
      flag_if: 'Spec references old BS EN 60439 instead of current BS EN 61439 — flag as potentially outdated reference.'
    },
    'IET Guidance Notes': {
      title: 'IET Guidance Notes 1-8 (supporting BS 7671)',
      notes: {
        'GN1': 'Selection and Erection of Equipment',
        'GN2': 'Isolation and Switching',
        'GN3': 'Inspection and Testing',
        'GN4': 'Protection Against Fire',
        'GN5': 'Protection Against Electric Shock',
        'GN6': 'Protection Against Overcurrent',
        'GN7': 'Special Installations or Locations',
        'GN8': 'Earthing and Bonding'
      },
      affects: ['Detailed interpretation of BS 7671 requirements'],
      quantity_impact: 'Indirect — provides design guidance that may affect cable sizing, protection selection.',
      flag_if: 'Rarely referenced directly in specs. If cited, usually GN3 (testing) or GN8 (earthing).'
    },
    'CIBSE SLL Lighting Guide': {
      title: 'Society of Light and Lighting — Lighting Guide series',
      key_guides: {
        'LG1': 'The Industrial Environment',
        'LG3': 'Areas for Visual Display Terminals',
        'LG7': 'Office Lighting',
        'LG10': 'Daylighting and Window Design',
        'LG14': 'Control of Electric Lighting'
      },
      affects: ['Lux levels per room type', 'Luminaire selection', 'Control strategy', 'Emergency lighting integration'],
      quantity_impact: 'DIRECT — lux level requirements determine luminaire count (nr). Higher lux = more fittings.',
      common_spec_usage: '"Lighting design to CIBSE SLL LG7 for office areas, 400 lux at desk level."',
      flag_if: 'Spec references CIBSE lighting guides without stating target lux levels by room type.'
    },
    'BS EN 50171': {
      title: 'Central Power Supply Systems for emergency lighting',
      affects: ['Central battery system specification', 'Distribution cable requirements'],
      quantity_impact: 'DIRECT — if central battery specified instead of self-contained, affects cable quantities significantly (dedicated fire-rated circuit to each fitting).',
      flag_if: 'Emergency lighting type (self-contained vs central battery) not stated — massive impact on cable quantities.'
    }
  },

  /* ══════════════════════════════════════════════════════════════
     3. INSULATION STANDARDS
     ══════════════════════════════════════════════════════════════ */
  insulation: {
    'BS 5422': {
      title: 'Method for Specifying Thermal Insulating Materials on Pipes, Ductwork and Equipment',
      edition: '2009 (current)',
      affects: ['Minimum insulation thickness by pipe size and system type', 'Material selection', 'Condensation prevention'],
      quantity_impact: 'DIRECT — specifies minimum insulation thickness. Thicker insulation = more material = higher cost per metre.',
      common_spec_usage: '"Insulation thickness to BS 5422 Table [X] for [system type]."',
      flag_if: 'Spec references BS 5422 without stating which table applies (tables vary by system temperature, pipe size, and emissivity).',
      key_tables: {
        'Table 7': 'Non-domestic heating — LTHW flow and return pipes',
        'Table 8': 'Non-domestic heating — MTHW and HTHW pipes',
        'Table 9': 'Non-domestic hot water supply pipes',
        'Table 10': 'Chilled and cold water pipes (preventing condensation)',
        'Table 11': 'Refrigeration pipework',
        'Table 12': 'Ductwork insulation (thermal)'
      },
      note: 'BS 5422 gives MINIMUM thicknesses. Spec may require MORE than the minimum. Always check.'
    },
    'TIMSA HVAC Guide': {
      title: 'TIMSA Practical Guide to HVAC Insulation Standards',
      edition: '2nd Edition',
      affects: ['Practical application of BS 5422', 'Material recommendations by application', 'Condensation prevention guidance', 'Vapour barrier requirements'],
      quantity_impact: 'DIRECT — provides practical thickness recommendations that often exceed BS 5422 minimums.',
      common_spec_usage: '"Insulation materials and thicknesses in accordance with TIMSA HVAC Guide."',
      flag_if: 'TIMSA referenced without BS 5422 — TIMSA is a guide, BS 5422 is the standard. Both should be referenced.',
      key_guidance: {
        chilled_water: 'Closed-cell insulation (Armaflex or equivalent) with integral vapour barrier. Thickness per BS 5422 Table 10.',
        lthw: 'Mineral wool or phenolic foam. Thickness per BS 5422 Table 7.',
        dhw: 'Mineral wool or phenolic foam. Thickness per BS 5422 Table 9. Must maintain 50°C at outlets per L8.',
        cold_water: 'Must prevent warming above 20°C per L8. Thickness per BS 5422 Table 10 or TIMSA guidance.',
        ductwork: 'External wrap: mineral wool with foil facing. Internal lining: check acoustic requirements separately.'
      }
    },
    'BS EN 14303': {
      title: 'Thermal Insulation Products for Building Equipment and Industrial Installations — Factory Made Mineral Wool (MW) Products',
      affects: ['Mineral wool insulation specification', 'Performance requirements', 'Classification'],
      quantity_impact: 'Indirect — defines product performance requirements. Affects material selection, not quantity.',
      common_spec_usage: '"Mineral wool insulation to BS EN 14303 Class [X]."',
      flag_if: 'Spec does not state the classification class required.'
    },
    'BS EN 14313': {
      title: 'Thermal Insulation Products — Factory Made Polyethylene Foam (PEF) Products',
      affects: ['Polyethylene foam specification for cold water/refrigeration insulation'],
      quantity_impact: 'Indirect — product standard, not thickness determinant.',
      flag_if: 'PEF insulation specified but application temperature range not confirmed (PEF has limited temperature range).'
    },
    'BS EN 14314': {
      title: 'Thermal Insulation Products — Factory Made Phenolic Foam (PF) Products',
      affects: ['Phenolic foam specification (Kingspan Kooltherm, etc.)'],
      quantity_impact: 'Indirect — product standard. Phenolic foam is thinner for equivalent performance = less space needed.',
      common_spec_usage: '"Phenolic foam insulation to BS EN 14314, Kingspan Kooltherm or approved equal."',
      flag_if: 'Spec names specific manufacturer (Kingspan) without "or approved equal" — may limit procurement options.'
    },
    'Part L Building Regulations': {
      title: 'Conservation of Fuel and Power (Building Regulations Approved Document L)',
      parts: {
        'Part L1A': 'New dwellings',
        'Part L1B': 'Existing dwellings',
        'Part L2A': 'New buildings other than dwellings',
        'Part L2B': 'Existing buildings other than dwellings'
      },
      affects: ['MINIMUM insulation thicknesses for compliance', 'U-value targets', 'Pipe insulation requirements in unheated spaces'],
      quantity_impact: 'DIRECT — Part L sets mandatory minimum insulation thicknesses. Non-compliance = building control rejection.',
      common_spec_usage: '"All pipe insulation to meet or exceed Part L2A requirements."',
      flag_if: 'Spec references Part L without stating which part (L1A/L1B/L2A/L2B) or which edition year.',
      note: 'Part L requirements are MANDATORY. BS 5422/TIMSA recommendations may exceed Part L — the GREATER thickness applies.'
    }
  },

  /* ══════════════════════════════════════════════════════════════
     4. FIRE & SAFETY STANDARDS
     ══════════════════════════════════════════════════════════════ */
  fire_safety: {
    'BS 476': {
      title: 'Fire Tests on Building Materials and Structures',
      parts: {
        'Part 4': 'Non-combustibility test',
        'Part 6': 'Fire propagation test',
        'Part 7': 'Surface spread of flame test',
        'Part 20-24': 'Fire resistance tests (elements of construction)'
      },
      affects: ['Material fire ratings', 'Surface spread of flame classification', 'Fire resistance periods'],
      quantity_impact: 'Indirect — determines which materials can be used. Fire-rated materials cost more.',
      note: 'Being partially superseded by BS EN 13501 (European classification) but still widely referenced in UK specs.',
      flag_if: 'Spec references BS 476 for a classification that now has a BS EN 13501 equivalent — may indicate outdated spec.'
    },
    'BS EN 13501': {
      title: 'Fire Classification of Construction Products and Building Elements',
      parts: {
        'Part 1': 'Classification using data from reaction to fire tests (Euroclasses A1, A2, B, C, D, E, F)',
        'Part 2': 'Classification using data from fire resistance tests (REI ratings)'
      },
      affects: ['Material fire reaction classification (Euroclass)', 'Fire resistance periods (REI 30/60/90/120)'],
      quantity_impact: 'Indirect — determines acceptable materials. Higher fire rating = higher material cost.',
      classifications: {
        A1: 'Non-combustible (e.g. mineral wool, calcium silicate)',
        A2: 'Limited combustibility (e.g. some phenolic foams)',
        B: 'Very limited contribution to fire (e.g. some elastomeric foams)',
        C: 'Limited contribution to fire',
        D: 'Medium contribution to fire',
        E: 'High contribution to fire',
        F: 'No performance determined'
      },
      common_spec_usage: '"All insulation materials to achieve minimum Euroclass A2-s1,d0 reaction to fire."',
      flag_if: 'Spec states a fire class without the smoke (s) and droplet (d) sub-classifications.'
    },
    'BS EN 1366': {
      title: 'Fire Resistance Tests for Service Installations',
      parts: {
        'Part 1': 'Ducts',
        'Part 2': 'Fire dampers',
        'Part 3': 'Penetration seals',
        'Part 4': 'Linear joint seals',
        'Part 5': 'Service ducts and shafts'
      },
      affects: ['Fire damper specification', 'Penetration seal systems', 'Fire-rated ductwork specification'],
      quantity_impact: 'DIRECT — Part 2 affects fire damper specification (nr). Part 3 affects fire stopping specification (nr).',
      flag_if: 'Fire dampers or fire stopping referenced without citing the tested system (manufacturer + configuration).'
    },
    'Approved Document B': {
      title: 'Fire Safety — Building Regulations Approved Document B',
      volumes: {
        'Volume 1': 'Dwellings',
        'Volume 2': 'Buildings other than dwellings'
      },
      affects: ['Fire compartmentation requirements', 'Fire damper locations', 'Fire stopping at penetrations', 'Escape route protection', 'Smoke control systems'],
      quantity_impact: 'DIRECT — defines where fire dampers (nr), fire stopping (nr), and smoke control equipment are required.',
      common_spec_usage: '"Fire stopping at all service penetrations through fire-rated construction in accordance with Approved Document B."',
      flag_if: 'Spec references AD-B without stating the fire rating required at each location (30/60/90/120 minutes).',
      note: 'AD-B is MANDATORY under Building Regulations. Fire stopping and fire damper quantities are driven by fire compartmentation layout.'
    },
    'BS 8519': {
      title: 'Selection and Installation of Fire-Resistant Power and Control Cable Systems for Life Safety and Fire-Fighting Applications',
      affects: ['Fire-rated cable selection', 'Installation methods for FP cables', 'Support systems for fire cables'],
      quantity_impact: 'DIRECT — fire-rated cable (FP200, MICC) costs significantly more than standard cable. Support systems for fire cables are more onerous.',
      flag_if: 'Fire-rated cables specified without referencing BS 8519 installation requirements — supports and fixings may be underspecified.'
    }
  },

  /* ══════════════════════════════════════════════════════════════
     5. USAGE RULES
     ══════════════════════════════════════════════════════════════ */
  usage_rules: [
    'When a spec references a standard, note the standard reference in extraction output.',
    'Do NOT expand on standard requirements unless they DIRECTLY affect quantities (thickness, count, spacing).',
    'Flag if spec references a standard without stating which clauses or parts apply.',
    'Flag if spec references an outdated standard edition (e.g. BS EN 60439 instead of BS EN 61439, 17th Edition BS 7671 instead of 18th).',
    'NEVER invent standard requirements — only extract what the specification explicitly states.',
    'If two standards are referenced and they conflict, note both and flag for estimator resolution.',
    'Standards define MINIMUM requirements — the spec may require MORE than the standard minimum.'
  ],

  /* ══════════════════════════════════════════════════════════════
     6. COMMON SPEC CLAUSE PATTERNS
     ══════════════════════════════════════════════════════════════ */
  clause_patterns: {
    no_quantity_impact: [
      {
        pattern: '"In accordance with BS XXXX"',
        meaning: 'General compliance reference',
        action: 'Note the standard reference. No direct quantity impact.',
        example: '"All pipework installed in accordance with BS EN 806."'
      },
      {
        pattern: '"To the satisfaction of the Engineer"',
        meaning: 'Quality/workmanship clause',
        action: 'Note — no quantity impact but flag if it makes scope unclear.',
        example: '"Surface finish to the satisfaction of the Engineer."'
      },
      {
        pattern: '"Best trade practice"',
        meaning: 'General quality reference',
        action: 'Note — no quantity impact.',
        example: '"All joints made in accordance with best trade practice."'
      }
    ],
    quantity_impact: [
      {
        pattern: '"Minimum X thickness as per BS XXXX"',
        meaning: 'Specifies a measurable requirement',
        action: 'EXTRACT the thickness value. This directly affects insulation quantities.',
        example: '"Minimum 25mm insulation thickness as per BS 5422 Table 7."'
      },
      {
        pattern: '"At maximum X centres"',
        meaning: 'Specifies spacing for supports, fixings, or detection devices',
        action: 'EXTRACT the spacing. Calculate quantities: length ÷ spacing = number of items.',
        example: '"Pipe brackets at maximum 1.5m centres."'
      },
      {
        pattern: '"X nr per room" / "one per X m²"',
        meaning: 'Specifies density or count per area',
        action: 'EXTRACT the rate. Calculate from room count or floor area.',
        example: '"Smoke detectors: one per 50m² of floor area."'
      },
      {
        pattern: '"Category L2 to BS 5839"',
        meaning: 'Specifies fire alarm coverage level',
        action: 'EXTRACT the category. This determines detector quantities across the building.',
        example: '"Fire alarm system Category L2 to BS 5839-1."'
      }
    ],
    flag_triggers: [
      {
        pattern: '"As approved by the Engineer"',
        flag_type: 'SCOPE_UNDEFINED',
        action: 'Flag for estimator — the item or selection is not yet defined. May need a provisional allowance.',
        risk: 'Contractor may be pricing something the engineer later specifies at higher cost.'
      },
      {
        pattern: '"To contractor\'s design"',
        flag_type: 'SCOPE_UNDEFINED',
        action: 'Flag strongly — the contractor is responsible for design AND supply. Scope may be much larger than apparent.',
        risk: 'Design liability transfers to contractor. May need specialist design input (cost) on top of materials/labour.'
      },
      {
        pattern: '"Provisional sum of £XXXX"',
        flag_type: 'NOT_FIRM',
        action: 'Flag — this is a defined budget, not a measured quantity. Include as a lump sum.',
        risk: 'Provisional sums are adjusted at final account. May increase or decrease.'
      },
      {
        pattern: '"Provisional quantity"',
        flag_type: 'NOT_FIRM',
        action: 'Flag — quantity is an estimate. Expect re-measurement.',
        risk: 'Final quantity may differ significantly. Price as stated but note risk.'
      },
      {
        pattern: '"Or approved equal"',
        flag_type: 'SUBSTITUTION_ALLOWED',
        action: 'Note — alternative products may be proposed. Price the named product but note alternatives exist.',
        risk: 'Low risk — standard clause allowing contractor to propose alternatives for approval.'
      },
      {
        pattern: '"Refer to Architectural/Structural drawings"',
        flag_type: 'CROSS_REFERENCE',
        action: 'Flag — information needed from another discipline\'s drawings. May affect builder\'s work quantities.',
        risk: 'Missing cross-reference may mean incomplete scope.'
      },
      {
        pattern: '"TBC" / "TBA" / "To be confirmed"',
        flag_type: 'INCOMPLETE_DESIGN',
        action: 'Flag strongly — design incomplete. Cannot extract firm quantities for this item.',
        risk: 'High — item is undefined. Include a provisional allowance and flag for update.'
      },
      {
        pattern: '"By others" / "Not in this contract"',
        flag_type: 'SCOPE_EXCLUSION',
        action: 'Note the exclusion. Do NOT include in takeoff. But flag the interface — coordination may still be required.',
        risk: 'Scope boundaries are a common source of commercial disputes.'
      }
    ]
  },

  /* ══════════════════════════════════════════════════════════════
     7. OUTDATED STANDARDS — FLAG TRIGGERS
     ══════════════════════════════════════════════════════════════ */
  outdated_standards: [
    { old: 'BS EN 60439', current: 'BS EN 61439', note: 'Switchgear assemblies — superseded' },
    { old: 'BS 7671:2008 (17th Edition)', current: 'BS 7671:2018+A2:2022 (18th Edition)', note: 'Wiring Regulations — major changes in Amendment 2' },
    { old: 'BS 7671:2018 (no amendment)', current: 'BS 7671:2018+A2:2022', note: 'Amendment 2 is significant — check which amendment is referenced' },
    { old: 'CP 413', current: 'BS 5839-1', note: 'Fire alarm systems — CP 413 long withdrawn' },
    { old: 'BS 5588', current: 'Approved Document B (2019)', note: 'Fire safety in buildings — BS 5588 withdrawn' },
    { old: 'BS 5720', current: 'CIBSE Guide B2', note: 'Mechanical ventilation and air conditioning — BS 5720 withdrawn' },
    { old: 'DW/142', current: 'DW/144', note: 'Sheet metal ductwork specification — DW/142 superseded' },
    { old: 'BS CP 3013', current: 'BS EN 806', note: 'Water supply installations — CP 3013 long withdrawn' }
  ]
};

module.exports = KB_C03;
