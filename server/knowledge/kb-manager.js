/**
 * KB Manager — Intelligent Knowledge Base Assembly
 *
 * Maps each API endpoint to only the KB sections it needs,
 * manages token budgets, and persists learned rules to disk.
 * Replaces monolithic getFullKnowledgeBase() with per-endpoint assembly.
 *
 * Part of Contraq M&E Knowledge Base v7.2
 */

const fs = require('node:fs');
const path = require('node:path');
const kb = require('./mep-knowledge-base');
const { formatMap, formatList } = kb;

const LEARNING_DIR = path.join(__dirname, 'learning');
const RULES_FILE = path.join(LEARNING_DIR, 'learned-rules.json');
const PATTERNS_FILE = path.join(LEARNING_DIR, 'pattern-errors.json');

/* ══════════════════════════════════════════════════════════════════
   ENDPOINT → KB SECTION MAPPING
   Each endpoint gets only the sections it needs, with priority tiers.
   critical = always loaded. high = loaded if budget allows. medium = loaded last.
   ══════════════════════════════════════════════════════════════════ */

const ENDPOINT_KB_MAP = {
  '/api/drawings/extract': {
    critical: ['drawing_standards', 'extraction_logic', 'hallucination_prevention', 'confidence_scoring'],
    high: ['estimating_principles', 'conflict_resolution', 'pipe_materials_ref', 'fittings_valves', 'hvac_ductwork', 'mechanical_plant', 'cable_types', 'containment', 'electrical_equipment', 'lighting_small_power', 'specialist_electrical', 'pipe_insulation', 'duct_insulation', 'equipment_insulation', 'fire_specialist_insulation'],
    medium: ['uk_standards_ref', 'document_hierarchy']
  },
  '/api/specs/analyse': {
    critical: ['uk_standards_ref', 'document_hierarchy', 'hallucination_prevention', 'confidence_scoring'],
    high: ['estimating_principles', 'conflict_resolution', 'pipe_materials_ref', 'pipe_insulation'],
    medium: ['fittings_valves', 'hvac_ductwork', 'cable_types', 'containment']
  },
  '/api/takeoff/consolidate': {
    critical: ['conflict_resolution', 'hallucination_prevention', 'confidence_scoring', 'extraction_logic'],
    high: ['estimating_principles', 'document_hierarchy'],
    medium: ['uk_standards_ref']
  },
  '/api/feedback/process': {
    critical: ['confidence_scoring', 'hallucination_prevention', 'extraction_logic'],
    high: ['estimating_principles'],
    medium: []
  },
  '/api/quotes/extract': {
    critical: [],
    high: [],
    medium: []
  },
  '/api/journal/analyse': {
    critical: [],
    high: [],
    medium: []
  },
  '/api/quote-files/analyse': {
    critical: [],
    high: [],
    medium: []
  }
};

/* ══════════════════════════════════════════════════════════════════
   SECTION FORMATTERS
   Each KB section gets a formatted text block for prompt injection.
   Uses getSection() from main KB + formatMap/formatList helpers.
   ══════════════════════════════════════════════════════════════════ */

const SECTION_FORMATTERS = {
  drawing_standards(data) {
    const d = data || kb.KB_C01;
    return [
      '## Drawing Standards (KB-C01)',
      'Drawing Types:',
      ...Object.entries(d.drawing_types).map(([k, v]) => `  ${k}: ${v.full_name} — ${v.extract_linear ? 'EXTRACT linear' : 'NO linear'}. ${v.purpose}`),
      '\nScales: ' + Object.entries(d.scales.lookup).map(([k, v]) => `${k}=${v.purpose.split('—')[0].trim()}`).join(', '),
      '\nScale Rules:\n' + formatList(d.scales.rules),
      '\nTitle Block: ' + Object.keys(d.title_block.required_fields).join(', '),
      '\nStatus: ' + d.status_hierarchy.levels.map(l => `${l.status}(${l.code})`).join(' > '),
      '\nRevision: ' + d.revision_control.rules.slice(0, 3).join(' '),
      '\nLegend: ' + d.legend_rules.priority,
      '\nSegregation:\n' + formatList(d.multi_discipline.extraction_rules.slice(0, 4))
    ].join('\n');
  },

  estimating_principles(data) {
    const d = data || kb.KB_C02;
    return [
      '## Estimating Principles (KB-C02)',
      'Units: m (linear), m² (area), nr (number), kg (weight), item. ' + d.units.rule,
      '\nWaste: Pipework ' + Object.entries(d.waste_factors.pipework).map(([k, v]) => `${k}:${v.range}`).join(', '),
      '  Cable ' + d.waste_factors.cable.general_wiring.range + ', Duct rect ' + d.waste_factors.ductwork.rectangular.range + ', Insulation ' + d.waste_factors.insulation.pipe_sections.range,
      '\nFittings Priority: ' + d.fittings_allowance.priority_order.join(' → '),
      '\nSupports: Pipe <42mm every ' + d.supports.pipework.small_bore.spacing + ', Tray ' + d.supports.cable_containment.cable_tray.spacing + ', Duct rect ' + d.supports.ductwork.rectangular.spacing,
      '\nRounding: ' + d.rounding.golden_rule,
      '\nMeasurement Priority: ' + d.measurement.measurement_priority,
      '\nQuantity Status:\n' + Object.entries(d.quantity_status.classifications).map(([k, v]) => `  ${k}: ${v.description}`).join('\n')
    ].join('\n');
  },

  uk_standards_ref(data) {
    const d = data || kb.KB_C03;
    return [
      '## UK Standards (KB-C03)',
      'Mechanical: ' + Object.entries(d.mechanical).map(([k, v]) => `${k}(${v.title.substring(0, 40)})`).join(', '),
      '\nElectrical: ' + Object.entries(d.electrical).map(([k, v]) => `${k}(${v.title.substring(0, 40)})`).join(', '),
      '\nInsulation: ' + Object.entries(d.insulation).map(([k, v]) => `${k}(${v.title.substring(0, 40)})`).join(', '),
      '\nUsage:\n' + formatList(d.usage_rules),
      '\nFlag triggers:\n' + d.clause_patterns.flag_triggers.map(f => `  "${f.pattern}" → ${f.flag_type}: ${f.action}`).join('\n'),
      '\nOutdated: ' + d.outdated_standards.map(s => `${s.old}→${s.current}`).join(', ')
    ].join('\n');
  },

  document_hierarchy(data) {
    const d = data || kb.KB_C04;
    return [
      '## Document Hierarchy (KB-C04)',
      'Authority: ' + d.authority_hierarchy.levels.map(l => `${l.rank}.${l.document}`).join(' > '),
      '\n' + d.authority_hierarchy.usage_rule,
      '\nConflicts:\n' + d.conflict_resolution.rules.map(r => `  ${r.conflict}: ${r.resolution}. ${r.action.substring(0, 80)}`).join('\n'),
      '\n' + d.conflict_resolution.golden_rule,
      '\nMissing Docs (CRITICAL):\n' + d.missing_document_flags.critical.map(f => `  [${f.severity}] ${f.missing}`).join('\n'),
      '\nTender: ' + d.project_stages.tender.characteristics.join(' '),
      '\nConstruction: ' + d.project_stages.construction.characteristics.join(' ')
    ].join('\n');
  },

  pipe_materials_ref(data) {
    const d = data || kb.KB_M01;
    return [
      '## Pipe Materials (KB-M01)',
      'Copper (BS EN 1057): ' + d.copper.sizes_mm.map(s => s.od + 'mm').join(', ') + '. Jointing: ' + Object.keys(d.copper.jointing_methods).join(', '),
      'Carbon Steel (BS EN 10255): ' + d.carbon_steel.sizes.map(s => s.dn).join(', ') + '. Screwed ≤DN50, flanged/welded >DN50.',
      'Stainless: Grades ' + Object.keys(d.stainless_steel.grades).join(', '),
      'CPVC max 80°C, uPVC max 60°C. MDPE: blue=water, yellow=gas. MLCP: 16-75mm.',
      'Size: ' + d.size_equivalents.rule,
      'Colour (BS 1710): Green/Blue=water, Red=heating/HW, Yellow=gas, Black=drainage. ' + d.colour_coding.critical_rule
    ].join('\n');
  },

  fittings_valves(data) {
    const d = data || kb.KB_M02;
    return [
      '## Fittings & Valves (KB-M02)',
      'Fittings (nr): ' + Object.keys(d.standard_fittings.types).join(', ') + '. Tees/reducers/valves ALWAYS count individually.',
      'Isolation: ball, gate, butterfly, globe. Control: 2-port, 3-port mix/div, PICV.',
      'Safety: PRV WARNING—same abbreviation for relief AND reducing. Check context. NRV, strainer (upstream of valves/pumps).',
      'Balancing: MBV, DRV (memory stop), commissioning set.',
      'Symbols (verify vs legend):\n' + Object.entries(d.drawing_symbols.common_symbols).slice(0, 8).map(([s, i]) => `  ${s} → ${i.likely}`).join('\n'),
      'Speciality (nr): ' + Object.keys(d.speciality_items.types).join(', '),
      'Implicit: isolation at equipment, strainers at pumps, drains at low, air vents at high, flexibles at rotating equipment.'
    ].join('\n');
  },

  hvac_ductwork(data) {
    const d = data || kb.KB_M03;
    return [
      '## HVAC & Ductwork (KB-M03)',
      'Rect duct: m² = 2(W+H)×L. DW/144. Class A/B/C airtightness.',
      'Circular: m linear + Ø. Sizes: ' + d.ductwork_types.circular.common_sizes_mm.join(', ') + 'mm',
      'Flex: m linear. Max ' + d.ductwork_types.flexible.max_length_rule.max_straight + ' straight.',
      'Specialist: Kitchen extract DW/172, fire-rated BS EN 1366-1, smoke extract BS EN 12101.',
      'Fittings (nr): ' + Object.keys(d.ductwork_fittings.types).join(', '),
      'Dampers (nr, ALWAYS count): Fire (60/90/120min, MANDATORY at fire walls), smoke, VCD motorised/manual.',
      'Terminals (nr from schedule): diffusers, grilles, louvres.',
      'Plant (nr): AHU, FCU (2/4-pipe), MVHR, extract/inline fans, attenuators.',
      'VRF: ODU (nr, kW) + IDU (nr by type) + refrigerant pipe (m, BOTH lines) + condensate (m).'
    ].join('\n');
  },

  mechanical_plant(data) {
    const d = data || kb.KB_M04;
    return [
      '## Mechanical Plant (KB-M04)',
      'Heat: boiler (kW, condensing, cascade), electric boiler, heat pump ASHP/GSHP (kW, COP), CHP, HIU.',
      'HW: calorifier (litres, L8: store≥60°C, dist≥50°C), electric, instantaneous, thermal store.',
      'Cooling: chiller air/water-cooled (kW, refrigerant), cooling tower (L8 mandatory), dry cooler, DX.',
      'Distribution: pumps (l/s, kPa, VSD, D/S config), expansion vessel, pressurisation, buffer, PHE, LLH.',
      '  Every pump: isolation valves both sides, flexibles, strainer suction, NRV discharge.',
      'Water treatment: chemical dosing (BG 29 mandatory closed systems), softener, UV, filtration.',
      'Gas: meter (FLAG utility), governor, solenoid (safety), unit heater, gas pipework (Gas Safe).',
      'Schedule is AUTHORITATIVE. Every equipment has ASSOCIATED ITEMS.'
    ].join('\n');
  },

  cable_types(data) {
    const d = data || kb.KB_E01;
    return [
      '## Cable Types (KB-E01)',
      'SWA: mains/sub-mains/underground. 1.5-300mm², 2-5 core. XLPE or PVC insulated. Armour=CPC.',
      'LSZH: STANDARD for ALL commercial interiors. Low smoke. Must use in occupied buildings.',
      'Fire: FP200 (30min), FP400 (60min), MICC (3hr+, specialist termination). BS 8519: cable+clips both fire-rated.',
      'Data: Cat5e (1G), Cat6 (10G/55m), Cat6A (10G/100m). Fibre: OM3/OM4 multimode, OS2 singlemode.',
      'Sizing: [cores]c × [size]mm² [type]. 1.5mm²=lighting, 2.5mm²=sockets, 16mm²=sub-main, 95mm²=main.',
      'Qty: cables NOT shown individually. Schedule > SLD > GA measurement. +10% waste + 400mm/termination.',
      'Multiple cables per route — count EACH cable, not just route length.'
    ].join('\n');
  },

  containment(data) {
    const d = data || kb.KB_E02;
    return [
      '## Containment (KB-E02)',
      'Tray (m, width): 50-900mm. Perforated/basket/solid. GS/HDG/SS/GRP.',
      'Ladder (m, width+rung): 300-900mm. Heavy duty.',
      'Trunking (m, W×H): standard/dado/floor/mini/fire-rated. 50×50 to 300×100.',
      'Conduit (m, Ø+type): rigid steel (CPC), rigid PVC, flex steel, flex PVC. 16-50mm.',
      'Busbar (m, A): 100-5000A. Tap-offs (nr, major cost). Fire barriers at floors.',
      'Segregation: LV power separate from ELV/data separate from fire alarm. NEVER share FA with power.',
      'Fill: tray 50%, trunking 45%, conduit 40%. Spare: 30-40%.',
      'Supports: tray 1.5m, trunking 1.0m, conduit 0.75m, flex 0.5m.'
    ].join('\n');
  },

  electrical_equipment(data) {
    const d = data || kb.KB_E03;
    return [
      '## Electrical Equipment (KB-E03)',
      'Switchgear: MSP (kVA/A, form 1-4), DB (A, phases, ways), MCC, PFC, MCCB panel.',
      'Transformers: HV/LV (ALWAYS SPECIALIST), step-down, isolating.',
      'Standby: generator (kVA, fuel tank+exhaust+vent+ATS), UPS (kVA, autonomy), ATS, battery.',
      'Metering: utility meter (FLAG scope+lead time), sub-meters, CTs (3nr per 3ph circuit), PMU.',
      'HV: ALWAYS SPECIALIST. DNO involvement. 12-52 week lead time.',
      'Earthing (MANDATORY): electrode, MET+SEB, earth cable (mm²), main bonding (gas/water/steel 25mm²), supplementary bonding (6mm²).',
      'Systems: TN-S, TN-C-S (PME), TT. Flag if no earthing strategy shown.'
    ].join('\n');
  },

  lighting_small_power(data) {
    const d = data || kb.KB_E04;
    return [
      '## Lighting & Small Power (KB-E04)',
      'Luminaires (nr from schedule): recessed/surface DL, linear LED, pendant, bulkhead, floodlight, high bay, track, exit sign. Note wattage, IP, DALI.',
      'Emergency (BS 5266): self-contained vs central battery (massive cable impact). M/NM. 1hr/3hr.',
      'Controls (nr): PIR (Part L mandatory), daylight, DALI (controller+bus cable), scene, timer, BMS point.',
      'Small power (nr): SSO, DSO (most common), SFCU, floor box, dado, industrial/CEE, USB.',
      'Specialist: EV (7-350kW, Part S mandatory), server PDU (A+B=2×/rack).'
    ].join('\n');
  },

  specialist_electrical(data) {
    const d = data || kb.KB_E05;
    return [
      '## Specialist Electrical (KB-E05)',
      'Fire Alarm (BS 5839, SPECIALIST): FACP, detectors (optical/multi/beam/VESDA), MCP, sounders/beacons, interfaces. FP200/MICC cable. Category L1-L5/M drives coverage.',
      'Access Control (SPECIALIST): controller, readers (1nr per SIDE), maglock (fail-safe), contact, REX, PSU.',
      'CCTV (SPECIALIST): IP cameras (dome/bullet/PTZ), NVR, PoE switch. Cat6 per camera.',
      'Data (often SPECIALIST): switches, patch panels, cabinets, data outlets, fibre, WAPs.',
      'PA/VA: PA=standard cable. VA=LIFE SAFETY (FP200 mandatory BS 5839-8). 2-3× cost.',
      'BMS (ALWAYS SPECIALIST): DDC, sensors (AI), actuators (AO), status (DI), commands (DO). Scope boundary VARIES — check spec.'
    ].join('\n');
  },

  pipe_insulation(data) {
    const d = data || kb.KB_I01;
    return [
      '## Pipe Insulation (KB-I01)',
      'Mineral wool: LTHW/steam, ≤300°C, A1. Phenolic: hot+cold, thinnest, 1.5-2× cost. Elastomeric (Armaflex): ChW/CWS PRIMARY, inherent VB, 2-3× cost. CalSil: high temp ≤650°C.',
      'LTHW: 15-22mm=25mm, 28-35mm=30mm, 42-54mm=40mm, DN80-100=50mm, DN150=60mm, DN200+=75mm.',
      'CWS: 15-22mm=9mm elast, 28-54mm=13mm, >54mm=19-25mm. VB ESSENTIAL.',
      'ChW: 25-50mm elastomeric. VB CRITICAL. Support inserts at EVERY bracket.',
      'Refrigerant: BOTH lines. Condensate: insulate or drips.',
      'Notation: "[pipe]mm [material], [thickness]mm [insulation], [facing]". Different specs = separate items.',
      'Valves: nr, 1.5× rate. Flanges: nr, 2× rate. Strainers: nr, removable.'
    ].join('\n');
  },

  duct_insulation(data) {
    const d = data || kb.KB_I02;
    return [
      '## Duct Insulation (KB-I02)',
      'Internal lining (m² internal): acoustic+thermal, 25/50mm. REDUCES duct dimensions.',
      'External wrap (m² external): glass wool foil (standard), elastomeric (cold ducts), 25-75mm. VB on cold ducts.',
      'Fire wrap (m²): mineral wool 30/60/90/120 min. BS EN 1366-1 tested. Extends 500-1500mm each side of wall.',
      'Surface area: rect 2(W+H)×L, circ π×D×L. +10-15% fittings.',
      'By system: supply=insulate (VB if cold), return=often NOT, extract=usually NOT (except kitchen), fresh air=ALWAYS+VB.',
      'Fire damper OR fire wrap at penetrations — not both.'
    ].join('\n');
  },

  equipment_insulation(data) {
    const d = data || kb.KB_I03;
    return [
      '## Equipment Insulation (KB-I03)',
      'Calorifiers: factory pre-insulated (verify spec) OR site m² (50-75mm + cladding).',
      'Tanks: CWS (elastomeric+VB, insulate lid), buffer (50mm+), expansion (usually pre-insulated).',
      'Pumps: removable box/jacket (nr). ChW pumps VB-sealed. ALWAYS removable.',
      'Cladding (SEPARATE): aluminium (standard, 30-50% of cost), SS (food/pharma), PVC (internal), canvas (basic).',
      'SA formulas: vert cyl π×D×(H+D/2), horiz π×D×L+2×π×(D/2)², rect tank 2(LH+WH)+LW.'
    ].join('\n');
  },

  fire_specialist_insulation(data) {
    const d = data || kb.KB_I04;
    return [
      '## Fire & Specialist Insulation (KB-I04)',
      'Fire (BS EN 1366-3): intumescent collar (nr, plastic pipes), fire wrap (m, metal pipes), sleeve (nr), sealant (nr per penetration), transit system (nr). 30/60/90/120/240 min.',
      '  Count EVERY penetration — commonly underestimated.',
      'Acoustic: pipe lagging (dense MW+mass barrier), anti-vib mounts (nr), enclosures (m²). Hotels 30dB, hospitals 35dB.',
      'Condensation: ChW=elastomeric MANDATORY. CWS=elastomeric in warm. VB continuous, sealed joints, support inserts.',
      'Specialist: catering (SS316L, 3-5×), pharma (non-shedding, 5-10×), external (UV+weather cladding), high temp >120°C (CalSil), trace heating (cable m + thermostat nr + insulation over).'
    ].join('\n');
  },

  extraction_logic(data) {
    const d = data || kb.KB_X01;
    return [
      '## Extraction Logic (KB-X01)',
      'Source Priority: 1.Schedule > 2.Annotation > 3.Scale > 4.Estimated (LAST RESORT, flag).',
      'Figured dimensions ALWAYS override scale. Never estimate when schedule exists.',
      'Linear: centreline start→end, include verticals. NO schematics/risers/details.',
      'Area: rect duct 2(W+H)×L, equipment all faces. +10-15% fittings.',
      'Count: drawing vs schedule cross-check. Schedule wins. Avoid double-count.',
      'Multi-floor: per-floor tracking. Risers = floors × height + fittings. Similar floors: measure 1 × count.',
      'Extract (High): clear+spec+measurable. Extract+Flag (Med/Low): incomplete spec, coord dwg, implicit. Flag-only: schematics, TBC, poor quality.',
      'Completeness: all trades? all sheets? title block? status? legend? waste separate? flags populated? implicit items? confidence? source? quantity status? cross-trade refs?'
    ].join('\n');
  },

  confidence_scoring(data) {
    const d = data || kb.KB_X02;
    return [
      '## Confidence Scoring (KB-X02)',
      'HIGH: FC drawing, spec confirmed, schedule/annotation/scale-bar, no conflicts.',
      'MEDIUM: spec incomplete, scale without bar, ±10% ambiguity, For Coordination, implicit, CIBSE assumed.',
      'LOW: implied not shown, spec absent, poor quality, >20% ambiguity, Preliminary/Tender, schematic, conflict, TBC, estimated.',
      'Blockers (cannot be High): missing spec, schematic source, not FC, conflict, no legend, estimated, implicit.',
      'Thresholds: <30% Low=normal, 30-50%=ELEVATED (flag drawing), >50%=CRITICAL (recommend re-issue).',
      'Hallucination: untraceable item → immediately Low + flag "AI inference".',
      'Pairing: every Low needs WHY + what info would help + price/hold decision.',
      'Value×Risk: High value + Low confidence = HIGHEST RISK → qualify in tender.'
    ].join('\n');
  },

  conflict_resolution(data) {
    const d = data || kb.KB_X03;
    return [
      '## Conflict Resolution (KB-X03)',
      'GOLDEN RULE: NEVER resolve silently. Every conflict → 3 outputs: resolution, what each said, flag.',
      'Dwg vs Spec: spec wins (material/quality). Dwg vs Dwg same rev: DO NOT extract, flag. Diff rev: latest.',
      'Spec vs Spec: flag both, don\'t resolve, use conservative provisional.',
      'Schedule vs Dwg: schedule wins. BoQ vs Dwg: BoQ (contractual). Annotation vs Scale: annotation ALWAYS.',
      'CRITICAL: blocks extraction (FC drawings conflict, different system). MODERATE: affects qty/spec. MINOR: <5% detail.',
      'Detection: multiple revisions, material mismatch, schedule count, spec contradiction, status mismatch.'
    ].join('\n');
  },

  hallucination_prevention(data) {
    const d = data || kb.KB_X04;
    return [
      '## Hallucination Prevention (KB-X04)',
      'H-01: Only extract what you can SEE. Convention ≠ evidence.',
      'H-02: No spec from memory. Spec silent → say so, don\'t fill from training data.',
      'H-03: No linear qty from schematics. Equipment counts OK (Medium).',
      'H-04: Flag before assuming. Every assumption → Low + flag.',
      'H-05: Schedule overrides estimation. NEVER estimate what schedule answers.',
      'H-06: Uncertainty = Low + flag. Don\'t fill gaps with plausible answers.',
      'High risk: complex plant rooms, low-res PDFs, poor annotation, spec-only, Preliminary, unfamiliar symbols.',
      'Self-check: traceable? memory-free? no schematics? all flagged? schedules used? confidence accurate? no extrapolation? estimator-defensible?'
    ].join('\n');
  }
};

/* ══════════════════════════════════════════════════════════════════
   LEARNING PERSISTENCE (KB-L01 + KB-L02)
   ══════════════════════════════════════════════════════════════════ */

function loadLearning() {
  let rules = [], patterns = [];
  try { rules = JSON.parse(fs.readFileSync(RULES_FILE, 'utf-8')).learned_rules || []; } catch {}
  try { patterns = JSON.parse(fs.readFileSync(PATTERNS_FILE, 'utf-8')).pattern_errors || []; } catch {}
  return { learnedRules: rules, patternErrors: patterns };
}

function saveLearning(rules, patterns) {
  try {
    fs.mkdirSync(LEARNING_DIR, { recursive: true });
    const tmpRules = RULES_FILE + '.tmp';
    const tmpPatterns = PATTERNS_FILE + '.tmp';
    fs.writeFileSync(tmpRules, JSON.stringify({ learned_rules: rules, last_updated: new Date().toISOString(), total_rules: rules.length }, null, 2));
    fs.renameSync(tmpRules, RULES_FILE);
    fs.writeFileSync(tmpPatterns, JSON.stringify({ pattern_errors: patterns, last_updated: new Date().toISOString(), total_patterns: patterns.length }, null, 2));
    fs.renameSync(tmpPatterns, PATTERNS_FILE);
    console.log(`[KB Manager] Persisted ${rules.length} learned rules, ${patterns.length} pattern errors.`);
  } catch (err) {
    console.error('[KB Manager] Failed to persist learning:', err.message);
  }
}

function processAndPersistFeedback(aiResponseText) {
  try {
    const cleaned = aiResponseText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return;
    const result = JSON.parse(match[0]);

    const existing = loadLearning();
    const newRules = result.learned_rules || [];
    const newPatterns = result.pattern_errors || [];

    // Merge rules (dedup by rule_id)
    const ruleIds = new Set(existing.learnedRules.map(r => r.rule_id));
    for (const rule of newRules) {
      if (!ruleIds.has(rule.rule_id)) {
        existing.learnedRules.push(rule);
        ruleIds.add(rule.rule_id);
      }
    }

    // Merge patterns (dedup by error_type)
    const patternTypes = new Set(existing.patternErrors.map(p => p.error_type));
    for (const pe of newPatterns) {
      if (!patternTypes.has(pe.error_type)) {
        existing.patternErrors.push(pe);
        patternTypes.add(pe.error_type);
      }
    }

    saveLearning(existing.learnedRules, existing.patternErrors);
    return existing;
  } catch (err) {
    console.error('[KB Manager] Failed to process feedback:', err.message);
    return null;
  }
}

/* ══════════════════════════════════════════════════════════════════
   LEARNING FORMATTERS
   ══════════════════════════════════════════════════════════════════ */

function formatLearning(learning) {
  const parts = [];
  if (learning.patternErrors.length) {
    parts.push('## PATTERN ERRORS (highest priority — 3+ occurrences)');
    learning.patternErrors.forEach(p => {
      parts.push(`  [${p.pattern_rule || p.pattern_id}] ${p.error_type}: ${p.heightened_action}`);
    });
  }
  if (learning.learnedRules.length) {
    parts.push('\n## LEARNED RULES FROM ESTIMATOR FEEDBACK');
    learning.learnedRules.forEach(r => {
      parts.push(`  [${r.rule_id}] When: ${r.trigger} → Do: ${r.action}`);
    });
  }
  return parts.join('\n');
}

function formatSelfAudit(rules) {
  return [
    '\n## SELF-AUDIT — check extraction against learned rules before responding:',
    ...rules.map(r => `  - [${r.rule_id}] ${r.trigger} → ${r.action}`),
    'Flag any items that might trigger a known error pattern.'
  ].join('\n');
}

/* ══════════════════════════════════════════════════════════════════
   TOKEN ESTIMATION
   ══════════════════════════════════════════════════════════════════ */

function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/* ══════════════════════════════════════════════════════════════════
   MAIN ASSEMBLER
   ══════════════════════════════════════════════════════════════════ */

const DEFAULT_CHAR_BUDGET = 80000; // ~20K tokens

function assembleKB(endpointPath, options = {}) {
  const map = ENDPOINT_KB_MAP[endpointPath];
  if (!map) return '';

  const budget = options.charBudget || DEFAULT_CHAR_BUDGET;
  const sections = [];
  let charCount = 0;

  // Header
  const header = `## CONTRAQ M&E KNOWLEDGE BASE v${kb.KB_VERSION} (${kb.KB_VERSION_DATE}) — ${kb.KB_VERSION_SOURCES} sources\n`;
  sections.push(header);
  charCount += header.length;

  // Critical sections (always loaded)
  for (const name of map.critical) {
    const formatter = SECTION_FORMATTERS[name];
    if (formatter) {
      const text = formatter();
      sections.push(text);
      charCount += text.length;
    }
  }

  // High sections (loaded if budget allows)
  for (const name of map.high) {
    const formatter = SECTION_FORMATTERS[name];
    if (formatter) {
      const text = formatter();
      if (charCount + text.length < budget) {
        sections.push(text);
        charCount += text.length;
      }
    }
  }

  // Medium sections (loaded last, budget permitting)
  for (const name of map.medium) {
    const formatter = SECTION_FORMATTERS[name];
    if (formatter) {
      const text = formatter();
      if (charCount + text.length < budget) {
        sections.push(text);
        charCount += text.length;
      }
    }
  }

  // Dynamic: learned rules + pattern errors
  const learning = loadLearning();
  if (learning.learnedRules.length || learning.patternErrors.length) {
    const learningText = formatLearning(learning);
    sections.push(learningText);
    charCount += learningText.length;
  }

  // Self-audit if rules exist
  if (learning.learnedRules.length) {
    const auditText = formatSelfAudit(learning.learnedRules);
    sections.push(auditText);
    charCount += auditText.length;
  }

  return sections.join('\n\n');
}

/* ══════════════════════════════════════════════════════════════════
   STATS / DIAGNOSTICS
   ══════════════════════════════════════════════════════════════════ */

function getStats() {
  const learning = loadLearning();
  const endpointStats = {};
  for (const [ep, map] of Object.entries(ENDPOINT_KB_MAP)) {
    const total = map.critical.length + map.high.length + map.medium.length;
    endpointStats[ep] = { critical: map.critical.length, high: map.high.length, medium: map.medium.length, total };
  }
  return {
    total_formatters: Object.keys(SECTION_FORMATTERS).length,
    endpoints_mapped: Object.keys(ENDPOINT_KB_MAP).length,
    learned_rules: learning.learnedRules.length,
    pattern_errors: learning.patternErrors.length,
    per_endpoint: endpointStats
  };
}

module.exports = {
  assembleKB,
  loadLearning,
  saveLearning,
  processAndPersistFeedback,
  getStats,
  estimateTokens,
  ENDPOINT_KB_MAP,
  SECTION_FORMATTERS
};
