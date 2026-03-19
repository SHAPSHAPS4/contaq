/**
 * Contraq M&E Knowledge Base — Server-Side Shared Module
 *
 * v4.1 — 25 sources
 * Canonical source of M&E estimation knowledge.
 * Any API endpoint can import sections of this knowledge base
 * to enrich its system prompt with domain expertise.
 *
 * Sources:
 *  1-2   CIBSE Standard Symbols (Systems PDF, Drawing Symbols Library)
 *  3-4   Pipe Flow Expert (pipework layouts, isometric recognition)
 *  5     Wermac Piping Isometrics Guide
 *  6-7   Archtoolbox (HVAC plan symbols, abbreviations)
 *  8     Wendes Mechanical Estimating Manual
 *  9     MobiDev OCR Systems Development Guide
 *  10    PaddleOCR PP-OCRv5 Fine-Tuning Guide
 *  11    Official PaddleOCR documentation
 *  12    Keras-OCR for Engineering Drawings (Sainath/Medium)
 *  13    iTech AI-based OCR for Engineering Drawings
 *  14    Donut OCR-free Document Understanding (NAVER CLOVA)
 *  15    Helle R. (2023) YOLOv7+Tesseract Symbol Detection Thesis
 *  16-17 MEP Academy (riser inference, riser tracing)
 *  18    RICS NRM2 2nd Edition
 *  19-20 Grabber/SMACNA Firestopping Guides
 *  21-22 NBS/CSI Specification Parsing
 *  23-25 BSRIA BG 85/87, A90 Document Precedence
 */

const KB_VERSION = '6.3';
const KB_VERSION_DATE = '2026-03-19';
const KB_VERSION_SOURCES = 39;

/* ── Structured KB modules ────────────────────────────────────── */
const KB_C01 = require('./kb-c01-drawing-standards');
const KB_C02 = require('./kb-c02-estimating-principles');
const KB_C03 = require('./kb-c03-uk-standards');
const KB_C04 = require('./kb-c04-document-hierarchy');
const KB_M01 = require('./kb-m01-pipe-materials');
const KB_M02 = require('./kb-m02-fittings-valves');
const KB_M03 = require('./kb-m03-hvac-ductwork');
const KB_M04 = require('./kb-m04-mechanical-plant');
const KB_E01 = require('./kb-e01-cable-types');
const KB_E02 = require('./kb-e02-containment');
const KB_E03 = require('./kb-e03-electrical-equipment');
const KB_E04 = require('./kb-e04-lighting-small-power');
const KB_E05 = require('./kb-e05-specialist-electrical');

/* ══════════════════════════════════════════════════════════════════
   CIBSE SYMBOL REFERENCE
   ══════════════════════════════════════════════════════════════════ */

const CIBSE = {
  ductwork_colours: {
    'Supply Air (SA)':    '#8095ff (blue-violet fill, black outline, HSL 230/100/75)',
    'Extract Air (EA)':   '#ff8095 (pink-red fill, black outline, HSL 350/100/75)',
    'Intake Air (IA)':    '#00d5ff (cyan fill, black outline, HSL 190/100/50)',
    'Discharge Air (DA)': '#ffbf80 (peach/orange fill, black outline, HSL 30/100/75)',
    'Toilet Extract':     '#f2bf8c (muted peach, S=80%)',
    'Kitchen Extract':    '#e6bf99 (muted tan, S=60%)',
    'Fume Cupboard':      '#d9bfa6 (muted beige, S=40%)',
    'Flue':               '#ccbfb3 (very muted, S=20%)'
  },
  pipework_colours: {
    'LTHW Flow':          'outline #993300, fill #ffaa80 (HSL 20/100, L=30/75)',
    'LTHW Return':        'outline #e64d00, fill #ffaa80 (HSL 20/100, L=45/75)',
    'LTHW FanCoils Flow': 'outline #8a380f, fill #f2ae8c (HSL 20/80, L=30/75)',
    'LTHW Radiators Flow':'outline #7a3d1f, fill #e6b399 (HSL 20/60, L=30/75)',
    'ChW Flow':           'outline #006699, fill #80d4ff (HSL 200/100, L=30/75)',
    'ChW Return':         'outline #0099e6, fill #80d4ff (HSL 200/100, L=45/75)',
    'CdW Flow':           'outline #660099, fill #d580ff (HSL 280/100, L=30/75)',
    'CdW Return':         'outline #9900e6, fill #d580ff (HSL 280/100, L=45/75)',
    'DHW Flow':           'outline #990033, fill #ff80aa (HSL 340/100, L=30/75)',
    'DHW Return':         'outline #e6004c, fill #ff80aa (HSL 340/100, L=45/75)',
    'Mains Cold Water':   'outline #009999, fill #80ffff (HSL 180/100, L=30/75)',
    'Boosted Cold Water':  'outline #000099, fill #8080ff (HSL 240/100, L=30/75)',
    'Condensate':         'outline #990066, fill #ff80d5 (HSL 320/100, L=30/75)',
    'Refrigerant Gas':    'outline #00e699, fill #80ffd4 (HSL 160/100, L=45/75)',
    'Refrigerant Liquid': 'outline #009966, fill #80ffd4 (HSL 160/100, L=30/75)',
    'Natural Gas':        'outline #999900, fill #ffff80 (HSL 60/100, L=30/75)',
    'Fuel Oil':           'outline #009933, fill #80ffaa (HSL 140/100, L=30/75)',
    'Compressed Air':     'outline #003399, fill #80aaff (HSL 220/100, L=30/75)',
    'Fire Sprinkler':     'outline #ff0000, fill #ff8080 (HSL 0/100, L=50/75)',
    'Rain Water Pipe':    'outline #009900, fill #80ff80 (HSL 120/100, L=30/75)',
    'Soil Vent Pipe':     'outline #996600, fill #ffd480 (HSL 40/100, L=30/75)',
    'Grey Water':         'outline #669900, fill #d5ff80 (HSL 80/100, L=30/75)',
    'Recycled Cold Water':'outline #990099, fill #ff80ff (HSL 300/100, L=30/75)'
  },
  electrical_colours: {
    'Power LV': '#80bfff (HSL 210)', 'Power HV': '#9580ff (HSL 250)',
    'Power ELV': '#80ffea (HSL 170)', 'Lighting': '#eaff80 (HSL 70)',
    'Data': '#ea80ff (HSL 290)', 'Comms': '#ff80ea (HSL 310)',
    'Fire Alarm': '#ff9580 (HSL 10)', 'BMS': '#80ffbf (HSL 150)',
    'Security': '#ffea80 (HSL 50)', 'Audio Visual': '#ff80bf (HSL 330)'
  },
  ventilation_symbols: {
    'AHU': 'Rectangle with fan symbol. Colour: ventilation green #96c882.',
    'MHRV/MVHR': 'Compact rectangle with dual fan arrows (supply+extract). Often labelled.',
    'FCU': 'Smaller rectangle with single fan symbol.',
    'VCD': 'Butterfly/throttle symbol within duct run. Count as nr.',
    'Fire Damper (FD)': 'Specific symbol in duct at fire compartment boundary. Count as nr.',
    'NRV/Backdraught': 'Flap symbol in duct. Prevents reverse airflow.',
    'Attenuator': 'Hatched/lined rectangular section in duct run.',
    'Grille/Diffuser': 'Crossed square (grille) or circle (diffuser) at duct terminals. Count as nr.',
    'Louvre': 'Parallel lines at external wall openings.',
    'Flexible Duct': 'Wavy/corrugated section connecting solid duct to terminal. Count as nr item, NOT duct length.',
    'Spiral/Circular Duct': 'Thick outer lines with faded centreline. Only count if centreline confirms duct profile.'
  },
  pipework_accessories: {
    'Gate Valve': 'Angled bow-tie/butterfly on pipe line.',
    'Globe Valve': 'Circle on pipe line.',
    'Ball Valve': 'Circle with line through.',
    'Butterfly Valve': 'Small disc symbol on large pipes.',
    'Check Valve/NRV': 'Arrow pointing in flow direction.',
    'Strainer': 'Y-shape or basket symbol.',
    'Pump': 'Circle with arrow (centrifugal) or triangle (inline).',
    'Pressure Gauge': 'Circle with "P".',
    'Temperature Gauge': 'Circle with "T".',
    'Expansion Vessel': 'Semi-circle or dome shape.',
    'Flow Meter': 'Diamond with "F".'
  },
  key_rules: [
    'Ductwork: BLACK outlines, colour is FILL only',
    'Pipework: COLOURED outlines (not black), fill shows primary type',
    'Flow vs Return: same fill, different outline lightness (flow=30%, return=45%)',
    'Sub-systems vary SATURATION: LTHW radiator S=60% vs main S=100%',
    'Duct accessories darker than parent: same hue at L=30%',
    'Electrical containment: black outline, colour fill denotes cable purpose',
    'Equipment colour = primary function, not individual systems',
    'Insulation: transparent overlay inheriting system shade — duct visible underneath',
    'Fire resistant duct: cross-hatched or patterned cladding overlay',
    'Flexible duct may lack colour but inherits from connected solid duct',
    'Clearance zones: orange outline #ffb98a with 50% transparency',
    'Underscore _ used as field delimiter in abbreviations (not dash)'
  ]
};

/* ══════════════════════════════════════════════════════════════════
   PIPEWORK LAYOUT PATTERNS
   ══════════════════════════════════════════════════════════════════ */

const PIPEWORK_PATTERNS = {
  systems: {
    closed_loop: 'Heating (LTHW) and cooling (ChW) systems are CLOSED LOOPS with flow+return. Require pressure reference (expansion vessel/header tank). Flow in = flow out at every junction.',
    chilled_water: 'Typically: chiller plant → pumps → ring main/distribution → AHU cooling coils / FCUs → return to chiller. Multiple chillers with duty/standby. FCVs control flow to each terminal.',
    lthw_heating: 'Boiler → pumps → distribution (flow) → radiators/fan coils/AHU heater batteries → return. Sub-circuits for different loads at different saturation colours.',
    dhw_domestic: 'Mains cold water → storage/calorifier → distribution with secondary return loop. Hot and cold branches to outlets. PRVs at lower floors.',
    fire_sprinkler: 'Grid/loop layout for redundancy. Sized for simultaneous operation of worst zone. Ring main with multiple feed points.',
    compressed_air: 'Ring main loop from compressor. PRVs create lower-pressure sub-zones.'
  },
  what_to_count: [
    'Physical pipe runs matching legend (flow AND return separately)',
    'Pipe sizes from annotations (mm bore or Ø)',
    'Valves, strainers, pumps as nr items at their locations',
    'Heat exchangers, boilers, fan coils, chillers as nr items',
    'Expansion vessels, header tanks as nr',
    'Tee fittings at branches (count separately, or use % allowance)',
    'Pipe enlargements/contractions as nr where sizes change',
    'Sprinkler heads / spray nozzles as nr'
  ],
  what_NOT_to_count: [
    'Schematic flow arrows (show direction, not physical pipe)',
    'Node labels (N1, N2 etc.) — calculation reference points',
    'Pressure/flow annotations (psi, l/min values)',
    'Performance curve data or pump schedules',
    'Dimension/elevation text and arrows',
    'Pipe reference numbers (P1, P2 etc.)',
    'Component modelling symbols (fixed loss, Cv/Kv indicators)',
    'Rubber-banding or construction lines'
  ],
  measurement_rules: [
    'Measure each pipe run once only — flow and return are SEPARATE runs',
    'At tee junctions: main run continues, branch is a separate measurement',
    'Risers/droppers: vertical runs between floors count as separate measured lengths',
    'Closed loops: total length = sum of all individual pipe segments, not loop perimeter twice',
    'Parallel duty/standby equipment: only count pipes to ACTIVE equipment unless spec says otherwise',
    'FCVs, PRVs, BPVs: count as nr accessories on the pipe they serve'
  ]
};

/* ══════════════════════════════════════════════════════════════════
   ISOMETRIC RECOGNITION
   ══════════════════════════════════════════════════════════════════ */

const ISOMETRIC = {
  plan_to_iso_translation: [
    'Horizontal runs on plans appear as angled lines (30°/150°) in isometric',
    'Vertical risers appear as true vertical lines in both plan and isometric',
    'Plan view shows ROUTING but not elevation changes — check isometric/section for actual vertical runs',
    'Branch take-offs at tees: main run continues straight, branch departs at angle',
    'Expansion loops: count TOTAL pipe length including loop, not straight-line distance',
    'Pump sets shown inline: count pump as nr but include pipe through/around it',
    'Header/manifold: count individual branch pipes, not header as one long pipe'
  ],
  error_prone_elements: [
    'CENTRELINES vs PIPES: Centrelines are thin chain-dot reference lines. Pipes are thicker solid/dashed. Never measure a centreline as pipe length.',
    'FLOW ARROWS vs PIPE: Arrows showing flow direction are annotations, not physical pipe.',
    'ELEVATION ANNOTATIONS: Numbers showing heights (e.g. "+3.500") are text labels, not pipe.',
    'NODE LABELS: Reference points (N1, N2) are calculation aids, not physical components.',
    'DUTY/STANDBY: Two parallel branches for duty and standby. Only count active path unless spec says otherwise.',
    'PIPE SIZE CHANGES: Annotation shows new size. Measure each diameter segment separately.',
    'HEADER TANKS: Tank symbol = nr item, not pipe length.',
    'COMPONENT SYMBOLS: Heat exchangers, chillers, filters = nr equipment items, not pipe.',
    'INSULATION OUTLINE: Wider concentric outline = insulation. Measure the PIPE inside; insulation is separate m².'
  ],
  wermac_rules: [
    'Isometrics are NOT drawn to scale — dimensions are ALWAYS required for exact lengths.',
    'Pipes in isometric are SINGLE LINES representing the CENTRELINE. All dimensions centreline-to-centreline.',
    'Isometrics drawn on 60° equilateral triangle grid (30° from horizontal).',
    'Line breaks where pipes cross behind each other are drawing convention, NOT a disconnection.',
    'Hatches (short diagonal marks) indicate directional changes, NOT fittings.'
  ],
  what_NOT_to_measure: [
    'Dimension text and arrows (A, B, C measurements are reference info)',
    'North arrow and orientation markers',
    'Auxiliary cube/grid lines (visualisation aids)',
    'Line breaks where pipes cross behind each other',
    'Hatch marks indicating direction changes',
    'Weld dots (joint indicators)',
    'Support callout symbols and reference tags'
  ]
};

/* ══════════════════════════════════════════════════════════════════
   HVAC SYMBOLS & ABBREVIATIONS (Archtoolbox)
   ══════════════════════════════════════════════════════════════════ */

const HVAC_SYMBOLS = {
  supply_return_symbols: {
    '4-Way Ceiling Diffuser': 'Square with 4 directional arrows. Count as nr. Most common supply terminal.',
    '3-Way Ceiling Diffuser': 'Square with 3 directional arrows. Count as nr.',
    '2-Way Ceiling Diffuser': 'Square with 2 directional arrows (opposite sides). Count as nr.',
    '1-Way Ceiling Diffuser': 'Square with 1 directional arrow. Count as nr. Linear slot diffuser.',
    'Return Grille': 'Square with X pattern (crossed diagonals). Count as nr.',
    'Direction of Supply Air': 'Arrow on duct showing airflow direction. ANNOTATION — do NOT count as duct.',
    'Direction of Return Air': 'Dashed arrow on duct. ANNOTATION only — do NOT count.'
  },
  damper_symbols: {
    'Volume Damper (VD)': 'Thin line across duct with adjustment indicator. Count as nr.',
    'Fire Damper (FD)': 'Thicker line at fire compartment boundary, often with "FD" label. Count as nr. CRITICAL for fire stopping.',
    'Smoke Damper (SD)': 'Similar to fire damper with "SD" label. Count as nr.',
    'Combination Smoke/Fire Damper (SFD)': 'Combined symbol. Count as nr.',
    'Back-Draft Damper (BDD)': 'Angled flap symbol in duct. Count as nr.'
  },
  abbreviations: {
    equipment: 'AHU=Air Handling Unit, FCU=Fan Coil Unit, CUH=Cabinet Unit Heater, EUH=Electrical Unit Heater, HRU=Heat Recovery Unit, RTU=Roof-Top Unit, CT=Cooling Tower, EF=Exhaust Fan, VFD=Variable Frequency Drive',
    ductwork: 'SA=Supply Air, RA=Return Air, OA=Outside Air, EA=Exhaust Air, MUA=Make-Up Air, CFM=Cubic Feet per Minute, VAV=Variable Air Volume',
    dampers: 'VD=Volume Damper, FD=Fire Damper, SD=Smoke Damper, SFD=Smoke/Fire Damper, BDD=Back-Draft Damper, MD=Motorized Damper',
    piping: 'CHW=Chilled Water, CHWS=CHW Supply, CHWR=CHW Return, HWS=Hot Water Supply, HWR=Hot Water Return, MU=Make-Up Water, PRV=Pressure Reducing Valve',
    controls: 'ATC=Automatic Temperature Control, DDC=Direct Digital Control, EMS=Energy Management System, NC=Normally Closed, NO=Normally Open'
  },
  key_recognition_notes: [
    'Each M&E office uses their own symbol set — ALWAYS check the project legend first',
    'Diffusers are terminal devices: count as nr at end of duct branches, connected via flex duct',
    'Supply diffusers have outward arrows; return grilles have X/diagonal pattern',
    'Dampers are inline duct accessories: count as nr at their position',
    'Fire dampers appear at fire-rated wall/floor penetrations',
    'Flow direction arrows are annotations, not physical duct — never count them',
    'Sensors/thermostats are BMS items, not insulation scope unless trace heating is involved'
  ]
};

/* ══════════════════════════════════════════════════════════════════
   WENDES MECHANICAL ESTIMATING
   ══════════════════════════════════════════════════════════════════ */

const WENDES = {
  takeoff_principles: [
    'Know your trade: understand systems, equipment, all parts needed, components, accessories, operations, materials, tools',
    'Mark and colour drawings BEFORE takeoff: identify different items, highlight duct runs by system type',
    'Draw pictures and diagrams to clarify: sketch on plans, on separate sheets',
    'Indicate lengths, quantities, operations required, component parts not obvious on plans',
    'Riser sections may need separate takeoff from plan views — check sections/elevations',
    'Add 20% allowance to ductwork surface area for hangers, cleats, hardware, waste and seams'
  ],
  ductwork_labour: {
    hours_per_piece: 'Most accurate method. Per-piece labour for each duct type/size.',
    hours_per_pound: 'Low pressure galvanised: 44 lbs/hr fabrication (0.023 hrs/lb). Quick cross-check.',
    hours_per_sqft: '24ga galv = 38 SF/hr fab, 22 SF/hr install. Convert via 1.156 lbs/SF.',
    fittings_allowance: '25% typical. 15-20% for straight runs, 30-35% for complex plant rooms.',
    waste: 'Add 20% to duct surface area for hangers, cleats, hardware, waste, seams.'
  },
  insulation_estimating: {
    external_wrap: 'm² surface area + 15-20% waste (pins, tape, laps, overlaps, cut pieces). £8-15/m² supply+fix.',
    pipe_insulation: 'lin.m by size + fittings as nr or % allowance. 10-15% waste. £5-20/lin.m.',
    duct_lining: 'Internal acoustic lining m². Reduces effective duct cross-section.'
  },
  piping_estimating: {
    measurement: 'lin.m centre-to-centre. Count fittings individually or add 15-20%.',
    supports: 'Every 1.5-3m depending on size.',
    testing: 'Provisional sum per system (hydrostatic for water, pneumatic for gas).'
  },
  common_errors: [
    'Missing items — not all items included that should be',
    'Wrong quantities — miscounting or misreading drawings',
    'Missed ductwork or piping runs — especially risers and voids',
    'Mistakes in labour calculations — wrong productivity rate for material type',
    'Too much budgeting/rough pricing — leads to under-estimation',
    'Not checking estimate thoroughly — always cross-check totals'
  ],
  ai_checks: [
    'Verify all symbols on drawing are clear and legible',
    'Check that AI has read all documents in the bid package',
    'Confirm AI has sufficient data for the particular trade niche',
    'Review AI output against manual count for critical items',
    'Labour and material accuracy is foremost — verify before submitting'
  ]
};

/* ══════════════════════════════════════════════════════════════════
   NRM2 MEASUREMENT RULES
   ══════════════════════════════════════════════════════════════════ */

const NRM2 = {
  units: {
    m: 'linear metre (pipework, ductwork, cable, insulation to pipes/ducts)',
    m2: 'square metre (insulation to flat surfaces, sheet cladding, fire stopping boards)',
    nr: 'number (equipment, fittings, accessories, valves, dampers)',
    kg: 'kilogramme (steelwork supports)',
    kW: 'kilowatt (plant capacity rating)',
    item: 'item (testing, commissioning, provisional sums)'
  },
  pipework: {
    unit: 'm (centreline)',
    must_state: ['Material (copper, steel, stainless, plastic, MLCP)', 'Nominal bore/diameter', 'Jointing method', 'System type (LTHW, ChW, DHW, CWS, condensate)', 'Fixing method']
  },
  ductwork: {
    unit: 'm (centreline)',
    circular_classification: 'By diameter in 50mm stages from 200mm',
    rectangular_classification: 'By girth: ≤1000mm, 1000-2000mm, 2000-3000mm, >3000mm',
    must_state: ['Material (galv steel, aluminium, phenolic, fabric)', 'Cross-section dimensions', 'Gauge/thickness', 'System type', 'Fixing method']
  },
  insulation: {
    pipework: 'm (linear metre), stating pipe diameter, insulation material, thickness, finish.',
    ductwork: 'm² for external wrap/board, m for internal lining. State duct size, material, thickness, facing.',
    equipment: 'nr or m² depending on jacket vs sheet. State equipment type, material, thickness, finish.',
    trace_heating: 'm for cable/tape. State pipe diameter range, W/m, control method. Thermostats as nr.'
  },
  fire_stopping: {
    unit: 'nr per penetration',
    must_state: ['Wall/floor type', 'Fire rating (30/60/120/240 min)', 'Penetration type', 'Service size', 'Fire stopping system/product']
  },
  equipment: {
    unit: 'nr with full specification',
    items: ['Boilers (fuel, output kW)', 'Chillers (capacity kW, refrigerant)', 'AHUs (airflow l/s)', 'FCUs', 'Pumps', 'Heat exchangers', 'Pressurisation units', 'BMS', 'Expansion vessels']
  },
  electrical: {
    cable: 'm stating size mm², cores, type (XLPE, LSOH, SWA, FP), voltage rating',
    containment: 'm stating type (tray/basket/trunking/conduit/ladder), material, size',
    accessories: 'nr stating type, rating, finish (switches, sockets, isolators)',
    luminaires: 'nr stating type, wattage, dimensions, lamp type',
    fire_alarm: 'nr stating type and specification (detectors, call points, sounders)'
  },
  builders_work: {
    holes: 'nr stating size, wall/floor type, thickness. Classified by size bands.',
    chases: 'm stating width, depth, wall/floor material.',
    sleeves: 'nr stating pipe size, sleeve material, length.'
  },
  key_principle: 'All items measured NET — no waste allowance in quantities (waste is in the rate).'
};

/* ══════════════════════════════════════════════════════════════════
   SPECIFICATION INTELLIGENCE
   ══════════════════════════════════════════════════════════════════ */

const SPEC_INTELLIGENCE = {
  precedence: 'Schedules of Work > Preliminaries > Contract Drawings > Reference Specification.',
  jct_rule: 'Spec governs quality/product. Drawing governs dimensions/positions.',
  nec_rule: 'All Works Information read together. Ambiguity = Project Manager instruction.',
  conflict_resolution: [
    'MAJORITY VOTE — 3/4 documents agree = prevailing interpretation',
    'BEST PRACTICE — align with CIBSE/BS/DW144/BSRIA',
    'MOST SPECIFIC — 1:5 detail > 1:50 plan',
    'MOST RECENT — later document > earlier',
    'COMMERCIAL COMMON SENSE — reject absurd interpretation',
    'GIVE NOTICE — flag as RFI when genuinely ambiguous'
  ],
  bsria_defaults: {
    duct_velocity: '3-6 m/s low-velocity, 7.5-15 m/s high-velocity',
    pipe_velocity: '1.5 m/s ≤50mm, 3.0 m/s >50mm',
    lthw_temps: '82/71°C traditional, 70/50°C modern condensing',
    insulation_bs5422: 'LTHW 25-50mm, ChW 25mm closed-cell+VB, DHW 19mm',
    cooling_loads: 'Offices 87 W/m², Retail 140, Data centres 1500'
  },
  sense_check_thresholds: {
    duct_size: 'Office main 600×400 to 1200×600. >1600mm any dimension = check.',
    pipe_size: 'LTHW main 40-100mm/floor. >150mm single floor = check.',
    riser_length: 'Cannot exceed floors × 5m.',
    ahu: '2,000-15,000 l/s per floor. 10× outside range = misread.',
    insulation: '19-50mm typical. >100mm on standard pipe = reading OD not thickness.'
  }
};

/* ══════════════════════════════════════════════════════════════════
   VERTICAL / RISER INFERENCE
   ══════════════════════════════════════════════════════════════════ */

const RISER_INFERENCE = {
  floor_to_floor_defaults: {
    commercial_office: '3.6-4.2m (UK typical 3.75m)',
    retail: '4.0-5.0m',
    residential: '2.7-3.0m',
    plant_room: '4.5-6.0m',
    basement: '3.0-3.6m',
    hospital: '4.0-4.5m'
  },
  vertical_drops: {
    riser_to_horizontal: '300-600mm per elbow',
    main_to_branch: '150-450mm',
    ceiling_to_terminal: '100-300mm'
  },
  rules: [
    'Plan views show HORIZONTAL only. Section/elevation for vertical.',
    'Default riser = floor-to-floor height. Add 2×90° elbows per floor.',
    'Column grid is the universal coordinate across all sheets and floors.',
    'Hidden lines (dashed) = services running BELOW visible level.',
    'Match lines: sum runs from both sheets, do NOT double-count.',
    'Similar floors: measure one, multiply by number of typical floors.'
  ]
};

/* ══════════════════════════════════════════════════════════════════
   OCR & VISION CALIBRATION
   ══════════════════════════════════════════════════════════════════ */

const VISION_CALIBRATION = {
  image_segments: [
    'Title Block: Project info, drawing number, revision, scale — extract as metadata',
    'Legend/Key: Symbol definitions, line types, colours — extract FIRST as master reference',
    'Geometric elements: Physical service lines (ducts, pipes, cables) — MEASURE these',
    'Text annotations: Labels, sizes, room names, flow rates — INFORM measurements, NOT physical services',
    'Dimension lines: Arrows, leaders, dimension text — NEVER count as service length',
    'Equipment symbols: AHUs, VCDs, grilles, valves — COUNT as nr items',
    'Architectural background: Walls, doors, grid lines, furniture — IGNORE entirely',
    'Hatching/shading: Material fills, insulation indicators — INFORM spec, NOT physical runs'
  ],
  distinguish: {
    physical_services: 'Solid/heavy lines matching legend colours. MEASURE these.',
    text_annotations: 'Alphanumeric near services showing sizes/labels/flow rates. READ, do NOT measure.',
    dimension_elements: 'Thin lines with arrowheads + numbers. NEVER measure as service.',
    equipment_symbols: 'Standardised shapes (rectangles=AHU, butterflies=VCD). COUNT as nr.',
    drawing_furniture: 'Grid lines, north arrows, section markers, revision clouds. IGNORE.',
    insulation_indicators: 'Wider concentric outline or cross-hatching. Quantify separately as m².'
  },
  text_patterns: {
    duct_sizes: '"NNNmm∅" (circular) or "NNN×NNN" (rectangular). ∅ symbol is critical.',
    pipe_sizes: '"NNmm", "NNmm∅", "DNNN" (DN=nominal diameter). Smaller than ducts.',
    equipment_labels: '"AHU-01", "MHRV 1", "FCU-3A", "VCD", "FD". Alphanumeric with hyphens.',
    system_codes: '"SA", "EA", "IA", "DA", "LTHW_F", "ChW_R". Uppercase with underscores.',
    drawing_refs: '"C1799/00/DR/MX/57001", "Rev P01". Alphanumeric with slashes.',
    scale: '"1:50@A1", "NTS", "DO NOT SCALE". In title block.'
  },
  dual_pass: [
    'PASS 1 — SERVICE LINES: Trace duct/pipe runs. Identify equipment. Detect system colours. GEOMETRIC pass.',
    'PASS 2 — TEXT EXTRACTION: Focus on reading text annotations cleanly. TEXT pass.',
    'MERGE: Size labels → nearest service. Equipment tags → nearest symbol. Room labels → space they occupy.',
    'VALIDATE: Cross-reference extracted quantities against expected ranges per service type.'
  ]
};

/* ══════════════════════════════════════════════════════════════════
   FIRE STOPPING
   ══════════════════════════════════════════════════════════════════ */

const FIRE_STOPPING = {
  ratings: {
    f_rating: 'Fire endurance based on flame occurrence. 1-4 hours.',
    t_rating: 'Temperature — unexposed side ≤325°F (181°C) above ambient.',
    ft_rating: 'Combined flame + temperature. Required near combustibles.',
    annular_space: 'Max 25mm for services ≤50mmØ, max 37mm for >50mmØ.'
  },
  what_to_count: [
    'Every pipe crossing a fire-rated wall = 1 nr firestop',
    'Every duct crossing a fire-rated wall = 1 nr firestop (or fire damper)',
    'Every cable tray/basket crossing = 1 nr firestop',
    'Every conduit crossing = 1 nr firestop',
    'Grouped cables through single opening = 1 nr firestop (transit)',
    'Mixed services through single opening = 1 nr composite firestop'
  ],
  detection_on_drawings: {
    fire_rated_walls: 'Identified by hatching, "FR" notation, fire rating (e.g. "60/60/60"), thick line weight, or colour.',
    penetration_points: 'Where a service line crosses a fire-rated wall/floor. Intersection = firestop location.',
    fire_dampers: 'Rectangular symbol at duct-wall intersection, usually marked "FD".',
    fire_collars: 'Circle around pipe at wall penetration. For plastic pipes through fire-rated construction.'
  }
};


/* ══════════════════════════════════════════════════════════════════
   ESTIMATING RULES (Source 26: Contraq M&E Estimating Rulebook)
   ══════════════════════════════════════════════════════════════════ */

const ESTIMATING_RULES = {
  waste_factors: {
    pipework: '10-15% for offcuts, bends, and joints',
    cable: '10% for pulls, loops at terminations, and waste',
    ductwork: '5-10% for fittings and connections',
    insulation: '15% for overlaps, valves, and fittings',
    rule: 'Waste factors noted separately in output so estimator can adjust.'
  },
  scaling: {
    common_scales: {
      '1:100': 'General arrangement (GA) drawings',
      '1:50': 'Detailed area drawings',
      '1:20': 'Plant room drawings',
      '1:5 or 1:2': 'Detail drawings (fittings, brackets) — for installation guidance, NOT quantities'
    },
    rules: [
      'Always check for a scale bar before estimating lengths.',
      'If no scale bar: flag immediately, do not estimate lengths without reference.',
      'Do NOT extract quantities from detail drawings unless they show quantities explicitly.'
    ]
  },
  drawing_types: {
    'General Arrangement (GA)': 'Primary source for quantities and routing.',
    'Schematic / Flow Diagram': 'Shows system logic, NOT physical lengths. NEVER extract linear quantities.',
    'Detail Drawing': 'Shows installation method, NOT quantities.',
    'Schedule / Legend': 'Confirms spec and equipment types.',
    'As-Built': 'Reflects actual installed condition — treat with caution for new work.',
    rule: 'NEVER extract linear quantities from schematics or flow diagrams. Flag if only schematics provided.'
  },
  drawing_status: {
    'For Construction': 'Approved for installation — quantities can be relied upon.',
    'For Coordination': 'May change — flag that quantities are provisional.',
    'Preliminary': 'Early stage — flag that quantities will likely change.',
    rule: 'Always check title block for drawing status. Flag Preliminary or For Coordination drawings.'
  },
  revision_clouds: [
    'Areas marked with cloud + revision triangle = recently changed.',
    'Always note revisions and flag for estimator — may affect quantities.',
    'Check drawing revision number (Rev A, Rev B, etc.) — always use latest.',
    'Do NOT ignore revision clouds.'
  ]
};

const PIPE_MATERIALS = {
  copper: {
    application: 'Domestic/commercial hot & cold water (DHWS, CWS)',
    sizes: '15mm, 22mm, 28mm, 35mm, 42mm, 54mm, 67mm, 76mm, 108mm',
    jointing: 'Solder, compression, or press-fit'
  },
  carbon_steel: {
    application: 'Heating systems, LTHW, MTHW (black steel)',
    sizes: 'DN15 to DN300+',
    jointing: 'Screwed (small bore), flanged or welded (large bore)'
  },
  stainless_steel: {
    application: 'Process pipework, clean water, food grade'
  },
  cpvc_upvc: {
    application: 'Cold water, drainage, some chemical applications'
  },
  mdpe: {
    application: 'Cold water mains underground (blue pipe)'
  },
  hdpe: {
    application: 'Drainage, below ground'
  },
  drawing_conventions: {
    single_line: 'Small bore (typically under 50mm)',
    double_line: 'Large bore (typically 50mm+)',
    size_formats: 'DN50 = 50nb = 2" = 50mm — all mean the same',
    colour_codes: 'Blue=Cold water, Red=Hot/heating flow, Green=Return, Yellow=Gas, Brown/black=Soil & waste'
  },
  fittings_allowance: {
    straight_runs: '1 elbow per 3m of pipe on average',
    risers: 'Additional elbows at top and bottom',
    individual_count: 'Always count tees, reducers, and valves individually if shown',
    schedule_priority: 'If fittings schedule exists in spec, use that — do not estimate'
  }
};

const DUCTWORK_RULES = {
  measurement: {
    rectangular: 'm² of surface area. Formula: 2(W+H) × Length = m²',
    circular: 'Linear metres with diameter noted',
    flat_oval: 'Linear metres',
    flexible: 'Linear metres — note diameter'
  },
  fittings_individual: [
    'Bends, offsets, tapers, branches',
    'Access doors, inspection hatches',
    'Fire dampers, motorised dampers, volume control dampers',
    'Attenuators / acoustic liners'
  ],
  air_terminals: [
    'Supply diffusers, return grilles, exhaust grilles — count as nr',
    'Fan coil units, VAV boxes, induction units — count as nr',
    'Extract fans, inline fans — count as nr'
  ]
};

const ELECTRICAL_RULES = {
  containment_types: {
    cable_tray: 'Open top, m (linear). Note width (300mm, 450mm, 600mm).',
    cable_ladder: 'Heavy duty, m (linear). Note width and rung spacing.',
    trunking: 'Enclosed, m (linear). Note dimensions (100×50, 150×75).',
    conduit: 'Rigid or flexible, m (linear). Note diameter (20mm, 25mm, 32mm, 50mm).',
    note: 'Containment runs on drawings represent routes, not individual cables.'
  },
  cable_types: {
    SWA: 'Steel Wire Armoured — main distribution, underground, external',
    LSZH: 'Low Smoke Zero Halogen — most common internal wiring in commercial',
    FP200: 'Fire performance cable — life safety systems',
    MICC: 'Mineral Insulated — fire alarm, emergency lighting in high risk areas',
    data: 'Cat5e, Cat6, Cat6a, fibre optic',
    conductor_sizes: '1.5mm², 2.5mm², 4mm², 6mm², 10mm², 16mm², 25mm², 35mm², 50mm², 70mm², 95mm²'
  },
  cable_quantity_rules: [
    'Cables NOT usually shown individually on GA drawings.',
    'Containment size implies cable quantity — do not estimate cable from containment unless instructed.',
    'If cable schedule exists, use it.',
    'For power circuits: measure from DB to furthest point + 10% for drops and terminations.'
  ],
  earthing_bonding: [
    'Often missing from drawings but required by spec.',
    'Flag if no earthing strategy is shown.',
    'Common items: earth bars, bonding clamps, earth cable runs.'
  ]
};

const INSULATION_RULES = {
  pipe_insulation: {
    unit: 'Linear metres by pipe diameter and insulation thickness',
    types: {
      mineral_wool: 'Heating pipework (rock wool / glass wool)',
      phenolic_foam: 'Hot & cold water, refrigeration (Kingspan, Kooltherm)',
      elastomeric_foam: 'Chilled water, refrigeration, cold pipes (Armaflex)',
      pre_formed: 'Standard for circular pipes',
      calcium_silicate: 'High temperature pipework'
    },
    description_format: 'e.g. "54mm copper pipe, 25mm phenolic, foil faced"'
  },
  duct_insulation: {
    unit: 'm² of duct surface area',
    types: 'Internal lining (25mm or 50mm), external wrap (note VB requirement), fire-rated wrap (note fire rating 60/120 min)'
  },
  equipment_insulation: {
    unit: 'nr with description. Calorifiers/tanks/vessels: m² surface area. Valves/flanges: nr at 1.5× pipe section rate.'
  },
  flags: [
    'Insulation spec referenced but thickness not stated',
    'Drawing shows insulated pipe but spec does not define system',
    'Pipe service unclear (hot or cold affects insulation type)',
    'Fire rating requirement mentioned without detail'
  ]
};

const UK_STANDARDS = {
  'BS EN 806': 'Specifications for installations inside buildings conveying water',
  'BS 8558': 'Guide to design, installation, testing and maintenance of services',
  'CIBSE Guide B': 'Heating, ventilating, air conditioning and refrigeration',
  'BS 7671 (18th Ed)': 'IET Wiring Regulations — Electrical installations',
  'BS 5266': 'Emergency lighting',
  'BS 5839': 'Fire detection and alarm systems',
  'BS 5422': 'Method for specifying thermal insulating materials',
  'TIMSA Guide': 'Thermal insulation for building services',
  rule: 'When spec references these standards, note it and flag if spec does not clarify which specific clauses apply.'
};

const QUALITY_RULES = {
  confidence_scoring: {
    High: 'Item clearly shown, spec confirmed, quantity measurable from scale.',
    Medium: 'Item visible but spec unclear, or scale approximate.',
    Low: 'Item implied but not explicitly shown, or drawing quality poor.'
  },
  never_do: [
    'Do not invent pipe sizes, cable ratings, or equipment specs.',
    'Do not assume a service type from colour alone without checking legend.',
    'Do not extract quantities from schematics or riser diagrams.',
    'Do not ignore revision clouds.',
    'Do not omit the flags section — if nothing flagged, state "No flags identified".'
  ],
  always_do: [
    'Check title block for: project name, drawing number, revision, scale, date.',
    'Note drawing status: For Construction vs For Coordination vs Preliminary.',
    'Flag any drawing marked Preliminary or For Coordination — quantities may change.',
    'Cross-reference legends and schedules before extracting quantities.'
  ]
};

/* ══════════════════════════════════════════════════════════════════
   PUBLIC API — Prompt builders for different endpoints
   ══════════════════════════════════════════════════════════════════ */

/**
 * Returns the full knowledge base as a formatted string
 * suitable for injection into any system prompt.
 */
function getFullKnowledgeBase() {
  return [
    `## CONTRAQ M&E KNOWLEDGE BASE v${KB_VERSION} (${KB_VERSION_DATE}) — ${KB_VERSION_SOURCES} sources\n`,

    '### CIBSE Ductwork Colour System',
    formatMap(CIBSE.ductwork_colours),

    '### CIBSE Pipework Colour System',
    formatMap(CIBSE.pipework_colours),

    '### Electrical Containment Colours',
    formatMap(CIBSE.electrical_colours),

    '### Ventilation Symbol Recognition',
    formatMap(CIBSE.ventilation_symbols),

    '### Pipework Accessory Symbols',
    formatMap(CIBSE.pipework_accessories),

    '### Key CIBSE Rules',
    formatList(CIBSE.key_rules),

    '### Pipework Layout Patterns',
    formatMap(PIPEWORK_PATTERNS.systems),
    '\nCOUNT these:\n' + formatList(PIPEWORK_PATTERNS.what_to_count),
    '\nDO NOT COUNT:\n' + formatList(PIPEWORK_PATTERNS.what_NOT_to_count),
    '\nMeasurement Rules:\n' + formatList(PIPEWORK_PATTERNS.measurement_rules),

    '### Isometric Recognition',
    'Plan-to-Iso Translation:\n' + formatList(ISOMETRIC.plan_to_iso_translation),
    '\nError-Prone Elements:\n' + formatList(ISOMETRIC.error_prone_elements),
    '\nWermac Fundamental Rules:\n' + formatList(ISOMETRIC.wermac_rules),
    '\nDo NOT Measure from Isometrics:\n' + formatList(ISOMETRIC.what_NOT_to_measure),

    '### HVAC Plan Symbols (Archtoolbox)',
    'Supply/Return Terminals:\n' + formatMap(HVAC_SYMBOLS.supply_return_symbols),
    '\nDamper Symbols:\n' + formatMap(HVAC_SYMBOLS.damper_symbols),
    '\nKey Notes:\n' + formatList(HVAC_SYMBOLS.key_recognition_notes),

    '### Wendes Mechanical Estimating',
    'Takeoff Principles:\n' + formatList(WENDES.takeoff_principles),
    '\nDuctwork Labour:\n' + formatMap(WENDES.ductwork_labour),
    '\nInsulation Estimating:\n' + formatMap(WENDES.insulation_estimating),
    '\nPiping Estimating:\n' + formatMap(WENDES.piping_estimating),
    '\nCommon Errors:\n' + formatList(WENDES.common_errors),

    '### NRM2 Measurement Rules (RICS)',
    'Units: ' + formatMap(NRM2.units),
    '\nPipework: ' + NRM2.pipework.unit + '. Must state: ' + NRM2.pipework.must_state.join(', '),
    '\nDuctwork: ' + NRM2.ductwork.unit + '. Must state: ' + NRM2.ductwork.must_state.join(', '),
    '\nInsulation: Pipes=' + NRM2.insulation.pipework + ' Ducts=' + NRM2.insulation.ductwork,
    '\nFire Stopping: ' + NRM2.fire_stopping.unit + '. Must state: ' + NRM2.fire_stopping.must_state.join(', '),
    '\nElectrical — Cable: ' + NRM2.electrical.cable + '. Containment: ' + NRM2.electrical.containment,
    '\n' + NRM2.key_principle,

    '### Specification Intelligence',
    'Document Precedence: ' + SPEC_INTELLIGENCE.precedence,
    '\nConflict Resolution:\n' + formatList(SPEC_INTELLIGENCE.conflict_resolution),
    '\nBSRIA Defaults:\n' + formatMap(SPEC_INTELLIGENCE.bsria_defaults),
    '\nSense-Check Thresholds:\n' + formatMap(SPEC_INTELLIGENCE.sense_check_thresholds),

    '### Vertical / Riser Inference',
    'Floor-to-Floor Defaults:\n' + formatMap(RISER_INFERENCE.floor_to_floor_defaults),
    '\nVertical Drops:\n' + formatMap(RISER_INFERENCE.vertical_drops),
    '\nRules:\n' + formatList(RISER_INFERENCE.rules),

    '### Vision / OCR Calibration',
    'Image Segments:\n' + formatList(VISION_CALIBRATION.image_segments),
    '\nDual-Pass Strategy:\n' + formatList(VISION_CALIBRATION.dual_pass),
    '\nText Patterns:\n' + formatMap(VISION_CALIBRATION.text_patterns),

    '### Fire Stopping',
    'What to Count:\n' + formatList(FIRE_STOPPING.what_to_count),
    '\nDetection on Drawings:\n' + formatMap(FIRE_STOPPING.detection_on_drawings),

    '### Estimating Rules',
    'Waste Factors:\n' + formatMap(ESTIMATING_RULES.waste_factors),
    '\nDrawing Scales:\n' + formatMap(ESTIMATING_RULES.scaling.common_scales),
    '\nScaling Rules:\n' + formatList(ESTIMATING_RULES.scaling.rules),
    '\nDrawing Types:\n' + formatMap(ESTIMATING_RULES.drawing_types),
    '\nDrawing Status:\n' + formatMap(ESTIMATING_RULES.drawing_status),
    '\nRevision Clouds:\n' + formatList(ESTIMATING_RULES.revision_clouds),

    '### UK Pipe Materials',
    'Copper: ' + PIPE_MATERIALS.copper.application + '. Sizes: ' + PIPE_MATERIALS.copper.sizes + '. Jointing: ' + PIPE_MATERIALS.copper.jointing,
    '\nCarbon Steel: ' + PIPE_MATERIALS.carbon_steel.application + '. Sizes: ' + PIPE_MATERIALS.carbon_steel.sizes + '. Jointing: ' + PIPE_MATERIALS.carbon_steel.jointing,
    '\nDrawing Conventions:\n' + formatMap(PIPE_MATERIALS.drawing_conventions),
    '\nFittings Allowance:\n' + formatMap(PIPE_MATERIALS.fittings_allowance),

    '### Ductwork Measurement Rules',
    formatMap(DUCTWORK_RULES.measurement),
    '\nFittings (count individually):\n' + formatList(DUCTWORK_RULES.fittings_individual),
    '\nAir Terminals:\n' + formatList(DUCTWORK_RULES.air_terminals),

    '### Electrical Rules',
    'Containment Types:\n' + formatMap(ELECTRICAL_RULES.containment_types),
    '\nCable Types:\n' + formatMap(ELECTRICAL_RULES.cable_types),
    '\nCable Quantity Rules:\n' + formatList(ELECTRICAL_RULES.cable_quantity_rules),
    '\nEarthing & Bonding:\n' + formatList(ELECTRICAL_RULES.earthing_bonding),

    '### Insulation Rules',
    'Pipe Insulation: ' + INSULATION_RULES.pipe_insulation.unit,
    '\nTypes:\n' + formatMap(INSULATION_RULES.pipe_insulation.types),
    '\nDuct Insulation: ' + INSULATION_RULES.duct_insulation.unit + '. ' + INSULATION_RULES.duct_insulation.types,
    '\nEquipment: ' + INSULATION_RULES.equipment_insulation.unit,
    '\nInsulation Flags (always check):\n' + formatList(INSULATION_RULES.flags),

    '### UK Standards Reference',
    formatMap(UK_STANDARDS),

    '### Quality & Accuracy Rules',
    'Confidence Scoring:\n' + formatMap(QUALITY_RULES.confidence_scoring),
    '\nNEVER Do:\n' + formatList(QUALITY_RULES.never_do),
    '\nALWAYS Do:\n' + formatList(QUALITY_RULES.always_do),

    '### KB-C01: Drawing Standards & Conventions',
    'Drawing Types (extract quantities from):',
    ...Object.entries(KB_C01.drawing_types).map(([k, v]) =>
      '  ' + k + ' (' + v.full_name + '): ' + (v.extract_linear ? 'EXTRACT linear' : 'NO linear') + ', ' + (v.extract_point_count ? 'EXTRACT counts' : 'NO counts') + '. ' + v.purpose
    ),
    '\nDrawing Scales:',
    ...Object.entries(KB_C01.scales.lookup).map(([k, v]) => '  ' + k + ': ' + v.purpose + '. ' + v.measurement_rule),
    '\nScale Rules:\n' + formatList(KB_C01.scales.rules),
    '\nTitle Block — Always Extract: ' + Object.keys(KB_C01.title_block.required_fields).join(', '),
    '\nDiscipline Codes:\n' + formatMap(KB_C01.title_block.discipline_codes),
    '\nRevision Control:\n' + formatList(KB_C01.revision_control.rules),
    '\nDrawing Status Hierarchy:',
    ...KB_C01.status_hierarchy.levels.map(l => '  ' + l.status + ' (' + l.code + '): ' + l.reliability + ' — ' + l.action),
    '\n' + KB_C01.status_hierarchy.rule,
    '\nLegend Rules: ' + KB_C01.legend_rules.priority,
    '\nMissing Legend Protocol:\n' + formatList(KB_C01.legend_rules.missing_legend_protocol),
    '\nMulti-Discipline Extraction:\n' + formatList(KB_C01.multi_discipline.extraction_rules),

    '### KB-C02: Estimating Principles & Waste Factors',
    'Units: m (linear), m² (area), nr (number), kg (weight), item (provisional). ' + KB_C02.units.rule,

    'Waste Factors — Pipework:',
    ...Object.entries(KB_C02.waste_factors.pipework).map(([k, v]) => '  ' + k + ': ' + v.range + ' (default ' + (v.default * 100) + '%) — ' + v.reason),
    '\nWaste Factors — Cable:',
    ...Object.entries(KB_C02.waste_factors.cable).filter(([k]) => k !== 'termination_allowance').map(([k, v]) => '  ' + k + ': ' + v.range + ' (default ' + (v.default * 100) + '%)'),
    '  Termination allowance: ' + KB_C02.waste_factors.cable.termination_allowance.per_termination + ' per termination point',
    '\nWaste Factors — Ductwork:',
    ...Object.entries(KB_C02.waste_factors.ductwork).map(([k, v]) => '  ' + k + ': ' + v.range + ' (' + v.unit + ')'),
    '\nWaste Factors — Insulation:',
    ...Object.entries(KB_C02.waste_factors.insulation).map(([k, v]) => '  ' + k + ': ' + v.range + ' (default ' + (v.default * 100) + '%)'),
    '\nWaste Application Rules:\n' + formatList(KB_C02.waste_factors.application_rules),

    'Fittings Allowance (when not individually shown):',
    'Priority: ' + KB_C02.fittings_allowance.priority_order.join(' → '),
    '\nElbow rates:',
    ...Object.entries(KB_C02.fittings_allowance.elbow_allowances).map(([k, v]) => '  ' + v.size_range + ': ' + v.rate),
    '\nAlways count individually:\n' + formatList(KB_C02.fittings_allowance.always_count_individually),

    'Fixing & Support Spacings:',
    '  Pipe <42mm: every ' + KB_C02.supports.pipework.small_bore.spacing,
    '  Pipe 42-80mm: every ' + KB_C02.supports.pipework.medium_bore.spacing,
    '  Pipe >80mm: every ' + KB_C02.supports.pipework.large_bore.spacing,
    '  Cable tray: every ' + KB_C02.supports.cable_containment.cable_tray.spacing,
    '  Rect duct: every ' + KB_C02.supports.ductwork.rectangular.spacing,
    '  Circ duct: every ' + KB_C02.supports.ductwork.circular.spacing,
    '  Riser multiplier: +20%',

    'Rounding: ' + KB_C02.rounding.golden_rule,
    '  Linear → nearest 0.5m UP. Area → nearest 0.5m² UP. Number → whole number UP.',

    'Measurement Priority: ' + KB_C02.measurement.measurement_priority,

    'Quantity Status:\n' + Object.entries(KB_C02.quantity_status.classifications).map(([k, v]) => '  ' + k + ': ' + v.description).join('\n'),
    '\n' + KB_C02.quantity_status.rule,

    '### KB-C03: UK Standards & Regulations Reference',
    'Mechanical Standards:',
    ...Object.entries(KB_C03.mechanical).map(([k, v]) => '  ' + k + ': ' + v.title + (v.quantity_impact ? ' — QTY IMPACT: ' + v.quantity_impact : '')),
    '\nElectrical Standards:',
    ...Object.entries(KB_C03.electrical).map(([k, v]) => '  ' + k + ': ' + v.title + (v.quantity_impact ? ' — QTY IMPACT: ' + v.quantity_impact : '')),
    '\nInsulation Standards:',
    ...Object.entries(KB_C03.insulation).map(([k, v]) => '  ' + k + ': ' + v.title + (v.quantity_impact ? ' — QTY IMPACT: ' + v.quantity_impact : '')),
    '\nFire & Safety Standards:',
    ...Object.entries(KB_C03.fire_safety).map(([k, v]) => '  ' + k + ': ' + v.title + (v.quantity_impact ? ' — QTY IMPACT: ' + v.quantity_impact : '')),
    '\nUsage Rules:\n' + formatList(KB_C03.usage_rules),
    '\nSpec Clause Patterns — Flag Triggers:',
    ...KB_C03.clause_patterns.flag_triggers.map(f => '  "' + f.pattern + '" → ' + f.flag_type + ': ' + f.action),
    '\nOutdated Standards (flag if referenced):',
    ...KB_C03.outdated_standards.map(s => '  ' + s.old + ' → replaced by ' + s.current),

    '### KB-C04: Project Document Hierarchy',
    'Document Authority (highest → lowest):',
    ...KB_C04.authority_hierarchy.levels.map(l => '  ' + l.rank + '. ' + l.document + ' — ' + l.rule),
    '\n' + KB_C04.authority_hierarchy.usage_rule,

    'Conflict Resolution:',
    ...KB_C04.conflict_resolution.rules.map(r => '  ' + r.conflict + ': ' + r.resolution + '. ' + r.action),
    '\n' + KB_C04.conflict_resolution.golden_rule,

    'Missing Document Flags (CRITICAL):',
    ...KB_C04.missing_document_flags.critical.map(f => '  [' + f.severity + '] ' + f.missing + ' — ' + f.impact),
    '\nMissing Document Flags (IMPORTANT):',
    ...KB_C04.missing_document_flags.important.map(f => '  [' + f.severity + '] ' + f.missing + ' — ' + f.impact),

    'Tender Stage: ' + KB_C04.project_stages.tender.characteristics.join(' '),
    'Construction Stage: ' + KB_C04.project_stages.construction.characteristics.join(' '),
    '\nStage Detection: ' + KB_C04.project_stages.stage_detection.rule,

    '### KB-M01: Pipe Materials & Sizing',
    'Copper (BS EN 1057): Sizes ' + KB_M01.copper.sizes_mm.map(s => s.od + 'mm').join(', '),
    '  Applications: ' + KB_M01.copper.applications.join(', '),
    '  Jointing: ' + Object.keys(KB_M01.copper.jointing_methods).join(', '),
    '  Notations: ' + KB_M01.copper.drawing_notations.join(', '),

    'Carbon Steel (BS EN 10255): Sizes ' + KB_M01.carbon_steel.sizes.map(s => s.dn).join(', '),
    '  Applications: ' + KB_M01.carbon_steel.applications.join(', '),
    '  Jointing: screwed (≤DN50), flanged or welded (>DN50), grooved',
    '  Notations: ' + KB_M01.carbon_steel.drawing_notations.join(', '),

    'Stainless Steel: Grades ' + Object.keys(KB_M01.stainless_steel.grades).join(', '),
    '  Applications: ' + KB_M01.stainless_steel.applications.join(', '),
    '  Notations: ' + KB_M01.stainless_steel.drawing_notations.join(', '),

    'CPVC/uPVC: CPVC max 80°C (hot+cold), uPVC max 60°C (cold only). Notations: ' + KB_M01.cpvc.drawing_notations.join(', '),

    'MDPE: Blue=water, Yellow=gas. Underground only. Sizes 20-180mm. Notations: ' + KB_M01.mdpe.drawing_notations.join(', '),

    'MLCP: PE-X/Aluminium/PE-X composite. Heating, hot/cold water. Sizes 16-75mm. Notations: ' + KB_M01.mlcp.drawing_notations.join(', '),

    'Size Notation: ' + KB_M01.size_equivalents.rule,
    'Key equivalents: DN15=1/2", DN25=1", DN50=2" (screwed→flanged transition), DN100=4", DN150=6"',

    'Colour Coding (BS 1710): Green/Blue=water, Red=heating/HW, Yellow=gas, Black=drainage, Grey=compressed air.',
    KB_M01.colour_coding.critical_rule,

    '### KB-M02: Pipe Fittings & Valves',
    'Standard Fittings (count as nr): ' + Object.keys(KB_M02.standard_fittings.types).join(', '),
    '  Tees, reducers, valves, flanges: ALWAYS count individually — never estimate.',
    '  Flanges: count in PAIRS. State size and pressure rating (PN6/10/16/25/40).',
    '  Transition couplings (material change): always count separately.',

    'Isolation Valves:',
    ...Object.entries(KB_M02.valves.isolation).map(([k, v]) => '  ' + v.name + ': ' + v.function + '. Sizes: ' + v.typical_sizes + '. Symbol: ' + (v.drawing_symbol || '')),

    'Control Valves:',
    ...Object.entries(KB_M02.valves.control).map(([k, v]) => '  ' + v.name + ': ' + v.function),

    'Safety & Regulation:',
    '  PRV WARNING: "PRV" = Pressure RELIEF Valve (safety) OR Pressure REDUCING Valve (regulation). Check context.',
    '  Check Valve/NRV: ' + KB_M02.valves.safety_regulation.check_valve.function,
    '  Strainer: ' + KB_M02.valves.safety_regulation.strainer.function + '. Always upstream of valves/pumps.',

    'Balancing: MBV (manual), DRV (double regulating with memory stop), Commissioning Set (combined metering)',

    'Drawing Symbols (verify against legend):',
    ...Object.entries(KB_M02.drawing_symbols.common_symbols).map(([symbol, info]) => '  ' + symbol + ' → ' + info.likely),

    'Speciality Items (count individually): ' + Object.keys(KB_M02.speciality_items.types).join(', '),
    '  Implicit items (required even if not shown): isolation at equipment, strainers at valves/pumps, drains at low points, air vents at high points, flexibles at rotating equipment.',

    'Fittings Priority: ' + KB_M02.estimation_rules.priority.join(' → '),

    '### KB-M03: HVAC & Ductwork',
    'Rectangular duct: ' + KB_M03.ductwork_types.rectangular.measurement.unit + '. Formula: ' + KB_M03.ductwork_types.rectangular.measurement.formula,
    '  Pressure classes: A (low <10m/s), B (medium 10-20m/s), C (high >20m/s). Airtightness: A/B/C/D.',
    '  Standard: DW/144. Material: GMS.',

    'Circular duct: ' + KB_M03.ductwork_types.circular.measurement.unit + '. Sizes: ' + KB_M03.ductwork_types.circular.common_sizes_mm.join(', ') + 'mm',

    'Flexible duct: m (linear). Max ' + KB_M03.ductwork_types.flexible.max_length_rule.max_straight + ' straight. Flag if longer.',

    'Specialist: Kitchen extract (DW/172 — welded joints, heavier gauge), Fire-rated duct (BS EN 1366-1, 60-120 min), Smoke extract (BS EN 12101).',

    'Duct Fittings (count as nr): ' + Object.keys(KB_M03.ductwork_fittings.types).join(', '),
    '  If not shown: allow 25% of straight duct as fittings cost (Wendes). Flag as estimated.',

    'Dampers (ALWAYS count individually):',
    '  Fire Damper: ratings 60/90/120 min. MANDATORY at every duct penetration through fire-rated construction.',
    '  Smoke Damper: motorised, fire alarm interface required.',
    '  VCD (motorised): BMS controlled. VCD (manual): set during commissioning.',

    'Air Terminals (count as nr): 4-way/2-way diffusers, linear diffusers (m), swirl diffusers, return grilles, extract grilles, transfer grilles, external louvres.',
    '  Use air terminal schedule if available — it is AUTHORITATIVE.',

    'AH Plant: AHU (note capacity, coils, filters, recovery), FCU (2-pipe or 4-pipe, mounting type), MVHR, extract fans, inline fans, attenuators.',

    'VRF/VRV: Outdoor units (nr, kW), Indoor units (nr by type: cassette/ducted/wall/floor), Refrigerant pipe (m — TWO pipes: liquid + suction, ACR copper, brazed), Condensate drains (m).',
    '  Refrigerant pipe insulation ALWAYS required. Branch selectors at each split (nr).',

    '### KB-M04: Mechanical Plant & Equipment',
    'Heat Sources (nr): Gas boiler (kW, condensing/non-condensing, flue, cascade), Electric boiler (kW), Heat pump ASHP/GSHP/WSHP (kW, COP, refrigerant), CHP (kWe+kWth), District HIU (kW).',
    '  Boiler cascade: count each boiler + 1nr cascade controller + common header + hydraulic separator.',

    'Hot Water (nr): Calorifier (litres, coil kW, L8 compliance), Direct electric (litres, kW), Instantaneous (l/min, kW), Thermal store.',
    '  L8: storage ≥60°C, distribution ≥50°C at outlets, cold <20°C.',

    'Cooling (nr): Chiller air-cooled/water-cooled (kW, refrigerant, COP), Cooling tower (kW, L8 water treatment MANDATORY), Dry cooler (kW), DX split.',

    'Distribution (nr): Pumps single/duty-standby (l/s, kPa, inline/base-mounted, VSD), Expansion vessel (litres, bar), Pressurisation unit, Buffer vessel, PHE (kW), Low loss header.',
    '  Every pump needs: isolation valves both sides, flexibles, strainer suction side, NRV discharge side.',
    '  Every sealed system needs: expansion vessel + safety valve. Flag if missing.',

    'Water Treatment (nr): Chemical dosing (BSRIA BG 29 — mandatory for closed systems), Softener, UV steriliser, Filtration, Side-stream filter.',

    'Gas (nr): Gas meter (flag — utility connection, confirm scope), Governor, Solenoid valve (safety — fire alarm interface), Unit heater (warm air/radiant), Gas pipework (m, Gas Safe registered).',

    'Equipment Schedule: ' + KB_M04.schedule_rules.priority[0],
    '  Every equipment item has ASSOCIATED ITEMS (valves, flexibles, strainers, connections). Always include these.',

    '### KB-E01: Cable Types & Sizing',
    'Power Cables:',
    '  SWA (BS 6346/5467): Mains, sub-mains, underground. 1.5-300mm², 2-5 core. PVC or XLPE insulation. Armour = CPC earth.',
    '  LSZH (BS 7211): STANDARD for ALL commercial interiors. Low smoke in fire. 1.5-300mm². MUST use in occupied buildings.',
    '  PVC/T&E (BS 6004): Domestic only. NOT for commercial unless spec permits.',

    'Fire Performance Cables:',
    '  FP200: 30 min fire rating. Standard for fire alarm + emergency lighting. Red sheath. BS 8519 clips required.',
    '  FP400: 60 min fire rating. Enhanced performance.',
    '  MICC: 3+ hours (mineral insulated, non-combustible). Highest rating. 3-5× cost. Specialist termination. Hygroscopic — seal ends.',
    '  BS 8519: Cable AND installation must BOTH achieve fire rating. Fire-rated clips mandatory. Segregation from non-FR cables.',

    'Data & Comms:',
    '  Cat5e (1Gbps/100m), Cat6 (10Gbps/55m), Cat6A (10Gbps/100m — larger dia, affects containment). 15% waste + service loops.',
    '  Fibre: OM3/OM4 multimode (building backbone), OS2 singlemode (campus/long distance). Note core count.',
    '  Coaxial: TV/CCTV legacy. Being replaced by Cat6 for IP systems.',

    'Sizing: Format [cores]c × [size]mm² [type]. e.g. "4c × 16mm² SWA" = 3-phase sub-main.',
    '  1.5mm²=lighting, 2.5mm²=sockets, 16mm²=small sub-main, 95mm²=main distribution, 240-300mm²=main incoming.',

    'Cable Quantity Rules:',
    '  Cables NOT shown individually on drawings — containment shows ROUTES, not individual cables.',
    '  Schedule > Single-line diagram > GA measurement. Measure DB to furthest load + drops.',
    '  Add 10% waste + 400mm per termination (EACH end).',
    '  Multiple cables share containment — count EACH CABLE individually, not just route length.',

    '### KB-E02: Cable Containment',
    'Cable Tray (m, note width): Perforated (standard), solid, basket/mesh (data), return flange. Widths 50-900mm. GS/HDG/SS/GRP.',
    'Cable Ladder (m, note width + rung spacing): Heavy duty. Widths 300-900mm. Plant rooms, risers, industrial.',
    'Trunking (m, note W×H): Standard steel, dado (multi-compartment), floor, mini (PVC), fire-rated. Sizes 50×50 to 300×100.',
    'Conduit (m, note dia + type): Rigid steel (acts as CPC), rigid PVC, flexible steel (Copex), flex PVC. Dia 16-50mm.',
    'Busbar (m, note A rating): Copper/aluminium. 100A-5000A. Tap-offs (nr — major cost item), end feeds, elbows, fire barriers at floors.',

    'Containment Fittings (count as nr): bends, tees, reducers, risers, end caps. All types.',

    'Segregation (BS 7671):',
    '  LV Power: separate from ELV/data and fire alarm.',
    '  ELV/Data: separate from LV power. Interference risk.',
    '  Fire Alarm: DEDICATED containment or fire-rated clips. NEVER share with power. Non-compliance if shared.',
    '  Flag: any fire/life-safety cables sharing containment with power.',

    'Fill: Tray 50%, trunking 45%, conduit 40% max. Spare: 30-40% typical.',
    'Supports: tray/ladder 1.5m, trunking 1.0m, rigid conduit 0.75m, flex conduit 0.5m, busbar 1.5-2.0m.',

    '### KB-E03: Electrical Equipment & Distribution',
    'Switchgear (nr): MSP/main switchboard (kVA/A, ways, form of separation 1-4), DB (A, phases, ways, MCB/RCBO), Consumer unit (metal per 18th Ed), MCC (starters, VFDs), PFC panel (kVAr), MCCB panel.',
    '  DB naming: DB-L-GF = Lighting Ground Floor, DB-P-02 = Power 2nd Floor.',

    'Transformers (nr): HV/LV (kVA, 11kV→400V, ALWAYS FLAG SPECIALIST), Step-down (LV/LV), Isolating (medical IT, bathrooms).',

    'Standby Power (nr): Generator (kVA, diesel, fuel tank + exhaust + ventilation + ATS required), UPS (kVA, autonomy mins, battery type), ATS (A, open/closed transition), Battery bank (Ah, ventilation for VRLA).',

    'Metering (nr): Utility meter (FLAG — utility scope, 12-20 week lead), Sub-meters with CTs (3nr CT per 3-phase circuit), PMU, AMR system.',

    'HV Equipment (ALWAYS FLAG SPECIALIST): RMU, HV switchgear, HV cable. DNO involvement mandatory. Lead time 12-52 weeks.',

    'Earthing (MANDATORY per BS 7671):',
    '  Earth electrode (nr), Earth bar MET+SEB (nr), Earth cable (m, note mm²), Bonding clamps (nr).',
    '  Main bonding: gas, water, steel — 1nr clamp per service, 25mm² typical commercial.',
    '  Supplementary bonding: plant rooms, bathrooms — 1nr clamp per connection, 6mm² typical.',
    '  Systems: TN-S (utility earth), TN-C-S (PME, common UK), TT (own electrode, rural).',
    '  Flag if NO earthing strategy shown — this is critical.',

    '### KB-E04: Lighting & Small Power',
    'Luminaires (nr from schedule): Recessed DL, surface DL, linear LED (600/1200/1500mm), pendant, bulkhead (IP65), floodlight (external), high bay (>6m ceiling), track light (track=m, spots=nr).',
    '  Schedule is AUTHORITATIVE. Note: wattage, colour temp, IP rating, DALI/switched, emergency function.',
    '  IP ratings: IP20 (dry), IP44 (splash/bathroom), IP65 (external/wet), IP67 (in-ground).',

    'Emergency Lighting (nr, BS 5266):',
    '  Self-contained (battery in fitting) vs Central battery (dedicated FP cable to EVERY fitting — massive cable impact).',
    '  Maintained (M, always on), Non-maintained (NM, mains fail only). Duration: 1hr or 3hr (3hr standard commercial).',
    '  Required at: exits, escape routes, intersections, level changes, call points, fire equipment, lifts, toilets >8m², open areas >60m².',
    '  Flag if: type (self-contained/central) not stated, duration not specified, M/NM not stated.',

    'Controls (nr): PIR/absence detector (Part L mandatory), daylight sensor, DALI controller/gateway (+ DALI bus cable), scene panel, timer/astronomical clock, BMS lighting point.',
    '  DALI: 64 devices per line. Requires 2-core bus cable (separate from power). Count bus cable separately.',

    'Small Power (nr): SSO (13A single), DSO (13A double — most common), SFCU (fused connection — fixed appliances), Floor box (note compartments + contents), Dado socket, Industrial/CEE (note A + voltage + IP), USB socket.',

    'Specialist: EV charging (7/22/50kW, Part S mandatory for new builds, PME earthing restrictions), Server PDU (A+B dual-feed = 2× per rack), Raised floor outlets.',

    '### KB-E05: Specialist Electrical Systems',
    'Fire Alarm (BS 5839, SPECIALIST): FACP (loops/zones), smoke det (optical/multi-sensor/beam/VESDA), heat det, MCP (45m max spacing), sounder/beacon (65dB min), interface modules (I/O for gas shut-off, AHU, lifts).',
    '  Cable: FP200 (standard) or MICC (enhanced). Fire-rated clips per BS 8519. Class A loop = 2× cable of Class B.',
    '  System category (L1-L5/M/P) determines detector coverage — MUST be stated. Flag if missing.',

    'Access Control (SPECIALIST): Controller (2/4/8 door), card reader (1nr per SIDE — entry+exit = 2nr), electric lock (maglock fail-safe for fire exits), door contact, REX, PSU.',
    '  Per controlled door: ~1 reader + 1 lock + 1 contact + 1 REX + share of controller/PSU.',

    'CCTV (SPECIALIST): IP camera (dome/bullet/PTZ, note resolution MP), NVR (channels, TB storage), monitor, PoE switch. Cable: Cat6 per camera (PoE = power+data on same cable).',

    'Data & Comms (often SPECIALIST): Network switch (ports, PoE), patch panel (24/48 port), comms cabinet (6U-42U), data outlet RJ45 (1-2× per desk), fibre panel, WAP (1 per 150-250m², PoE).',
    '  One Cat6 cable per outlet. 15% waste + 3m service loop. Separate from CCTV cable count.',

    'PA/VA: PA = not life safety (standard cable). VA = LIFE SAFETY (FP200 mandatory, BS 5839-8). VA is 2-3× cost of PA.',
    '  Amplifier (W, zones), speakers (ceiling/wall/horn, W), microphone. VA requires fireman\'s microphone at fire panel.',

    'BMS (ALWAYS SPECIALIST): DDC controller (I/O points, BACnet/Modbus), sensors (temp/humidity/CO2/pressure = AI), actuators (valves/dampers = AO), status (DI), commands (DO).',
    '  Scope boundary VARIES: check spec for who provides valves, actuators, VFDs, sensors. Flag if unclear.',
    '  BMS points schedule is AUTHORITATIVE if provided. Flag if no points schedule.'
  ].join('\n\n');
}

/**
 * Returns a subset of the knowledge base for a specific topic.
 * Useful when an endpoint only needs certain sections.
 */
function getSection(sectionName) {
  const sections = {
    cibse: CIBSE,
    pipework: PIPEWORK_PATTERNS,
    isometric: ISOMETRIC,
    hvac_symbols: HVAC_SYMBOLS,
    wendes: WENDES,
    nrm2: NRM2,
    spec: SPEC_INTELLIGENCE,
    risers: RISER_INFERENCE,
    vision: VISION_CALIBRATION,
    fire_stopping: FIRE_STOPPING,
    estimating_rules: ESTIMATING_RULES,
    pipe_materials: PIPE_MATERIALS,
    ductwork_rules: DUCTWORK_RULES,
    electrical_rules: ELECTRICAL_RULES,
    insulation_rules: INSULATION_RULES,
    uk_standards: UK_STANDARDS,
    quality_rules: QUALITY_RULES,
    drawing_standards: KB_C01,
    estimating_principles: KB_C02,
    uk_standards_ref: KB_C03,
    document_hierarchy: KB_C04,
    pipe_materials_ref: KB_M01,
    fittings_valves: KB_M02,
    hvac_ductwork: KB_M03,
    mechanical_plant: KB_M04,
    cable_types: KB_E01,
    containment: KB_E02,
    electrical_equipment: KB_E03,
    lighting_small_power: KB_E04,
    specialist_electrical: KB_E05
  };
  return sections[sectionName] || null;
}

/**
 * Returns metadata about the knowledge base version.
 */
function getMetadata() {
  return { version: KB_VERSION, date: KB_VERSION_DATE, sources: KB_VERSION_SOURCES };
}

/* ── Formatting helpers ───────────────────────────────────────── */

function formatMap(obj) {
  return Object.entries(obj).map(([k, v]) => `  ${k}: ${v}`).join('\n');
}

function formatList(arr) {
  return arr.map(item => `  • ${item}`).join('\n');
}

module.exports = {
  getFullKnowledgeBase,
  getSection,
  getMetadata,
  KB_VERSION,
  KB_VERSION_DATE,
  KB_VERSION_SOURCES,
  // Raw data exports for advanced use
  CIBSE,
  PIPEWORK_PATTERNS,
  ISOMETRIC,
  HVAC_SYMBOLS,
  WENDES,
  NRM2,
  SPEC_INTELLIGENCE,
  RISER_INFERENCE,
  VISION_CALIBRATION,
  FIRE_STOPPING,
  ESTIMATING_RULES,
  PIPE_MATERIALS,
  DUCTWORK_RULES,
  ELECTRICAL_RULES,
  INSULATION_RULES,
  UK_STANDARDS,
  QUALITY_RULES,
  KB_C01,
  KB_C02,
  KB_C03,
  KB_C04,
  KB_M01,
  KB_M02,
  KB_M03,
  KB_M04,
  KB_E01,
  KB_E02,
  KB_E03,
  KB_E04,
  KB_E05
};
