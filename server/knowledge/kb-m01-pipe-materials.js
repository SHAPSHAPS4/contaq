/**
 * KB-M01: Pipe Materials & Sizing
 *
 * Structured lookup tables for UK pipe materials, sizes,
 * jointing methods, drawing notations, service colour coding,
 * and size notation equivalents.
 * Injected into extraction prompts at runtime.
 *
 * Part of Contraq M&E Knowledge Base v5.5
 * Source: BS EN 1057, BS EN 10255, BS 1387, BS 1710, UK M&E practice
 */

const KB_M01 = {
  id: 'KB-M01',
  title: 'Pipe Materials & Sizing',
  version: '1.0',
  date: '2026-03-18',

  /* ══════════════════════════════════════════════════════════════
     1. COPPER PIPE
     ══════════════════════════════════════════════════════════════ */
  copper: {
    material: 'Copper',
    standard: 'BS EN 1057',
    temper_grades: {
      R220: 'Soft (annealed) — bendable, supplied in coils. Used for concealed/underground runs.',
      R250: 'Half-hard — most common for above-ground commercial/domestic installations.',
      R290: 'Hard — straight lengths, highest strength. Used for exposed pipework.'
    },
    applications: ['Domestic hot water supply (DHWS)', 'Cold water supply (CWS)', 'Low temperature hot water heating (LTHW)', 'Medical gas pipework (MGPS)', 'Solar thermal', 'Refrigerant (ACR grade)'],
    sizes_mm: [
      { od: 15, wall: 0.7, bore_approx: 13.6, common_use: 'Basin taps, radiator connections, small domestic' },
      { od: 22, wall: 0.9, bore_approx: 20.2, common_use: 'Bath taps, domestic hot/cold distribution, radiator circuits' },
      { od: 28, wall: 0.9, bore_approx: 26.2, common_use: 'Boiler connections, larger domestic distribution' },
      { od: 35, wall: 1.0, bore_approx: 33.0, common_use: 'Commercial risers, larger distribution' },
      { od: 42, wall: 1.0, bore_approx: 40.0, common_use: 'Main distribution, plant room headers' },
      { od: 54, wall: 1.2, bore_approx: 51.6, common_use: 'Main distribution, commercial mains' },
      { od: 67, wall: 1.2, bore_approx: 64.6, common_use: 'Large commercial distribution' },
      { od: 76.1, wall: 1.5, bore_approx: 73.1, common_use: 'Main risers, large distribution (less common — steel often used at this size)' },
      { od: 108, wall: 1.5, bore_approx: 105, common_use: 'Main risers (uncommon — transition to steel usually occurs before this size)' }
    ],
    jointing_methods: {
      solder_capillary: {
        name: 'Solder (capillary)',
        types: ['End-feed (requires separate solder)', 'Pre-soldered (Yorkshire type — solder ring built in)'],
        applicable_sizes: 'All sizes',
        skill_level: 'Moderate — requires flame/torch',
        notes: 'Traditional method. Hot work permit may be required on site. Lead-free solder mandatory for potable water.'
      },
      compression: {
        name: 'Compression',
        types: ['Type A (non-manipulative — brass olive)', 'Type B (manipulative — flared end)'],
        applicable_sizes: '15mm to 54mm (Type A), larger available but uncommon',
        skill_level: 'Low — hand tools only, no hot work',
        notes: 'No flame required. Slower and more expensive per joint than solder. Common for maintenance and retrofit.'
      },
      press_fit: {
        name: 'Press-fit',
        types: ['M-profile (Viega, Geberit Mapress)', 'V-profile (some manufacturers)'],
        applicable_sizes: '12mm to 108mm',
        skill_level: 'Low — requires press tool (battery operated)',
        notes: 'Fastest installation. No hot work. Press tool investment required. Unpressed fittings have a visible indicator. Becoming standard in commercial.'
      },
      brazed: {
        name: 'Brazed (silver solder)',
        applicable_sizes: 'All sizes, primarily >54mm and for medical gas/refrigerant',
        skill_level: 'High — specialist skill',
        notes: 'Required for medical gas (HTM 02-01), some refrigerant connections, and high-pressure applications.'
      }
    },
    drawing_notations: ['Cu', 'CU', 'copper', 'Copper', 'Cu pipe', 'CU PIPE'],
    colour_coding: {
      dhws: 'Red with white band (BS 1710)',
      cws: 'Blue or Green (BS 1710)',
      lthw: 'Red (BS 1710)',
      note: 'Always check project-specific legend — colours vary between consultants.'
    },
    supply_lengths: {
      straight: '3m or 6m lengths (hard or half-hard temper)',
      coils: '10m, 15m, 25m, 50m (soft temper only)',
      note: 'Coil supply affects waste factor — less offcut waste but more bending time.'
    }
  },

  /* ══════════════════════════════════════════════════════════════
     2. CARBON STEEL (BLACK STEEL)
     ══════════════════════════════════════════════════════════════ */
  carbon_steel: {
    material: 'Carbon Steel (Black Steel)',
    standards: ['BS EN 10255 (current)', 'BS 1387 (withdrawn but still widely referenced)'],
    weight_classes: {
      light: 'Light weight — thinner wall. Rarely used for pressure systems.',
      medium: 'Medium weight — standard for most LTHW/MTHW systems.',
      heavy: 'Heavy weight — higher pressure rating. Used for steam, high-pressure systems.'
    },
    applications: ['Low temperature hot water (LTHW) — most common', 'Medium temperature hot water (MTHW)', 'High temperature hot water (HTHW)', 'Steam systems', 'Natural gas distribution', 'Fire sprinkler systems', 'Compressed air'],
    sizes: [
      { dn: 'DN15', nb: '15mm', imperial: '1/2"', od_mm: 21.3, common_use: 'Small branches, instrument connections' },
      { dn: 'DN20', nb: '20mm', imperial: '3/4"', od_mm: 26.9, common_use: 'Radiator branches, small distribution' },
      { dn: 'DN25', nb: '25mm', imperial: '1"', od_mm: 33.7, common_use: 'Common branch size, radiator circuits' },
      { dn: 'DN32', nb: '32mm', imperial: '1.25"', od_mm: 42.4, common_use: 'Sub-distribution, pump connections' },
      { dn: 'DN40', nb: '40mm', imperial: '1.5"', od_mm: 48.3, common_use: 'Sub-distribution, header connections' },
      { dn: 'DN50', nb: '50mm', imperial: '2"', od_mm: 60.3, common_use: 'Main distribution, risers. Transition point: screwed → flanged/welded.' },
      { dn: 'DN65', nb: '65mm', imperial: '2.5"', od_mm: 76.1, common_use: 'Main distribution' },
      { dn: 'DN80', nb: '80mm', imperial: '3"', od_mm: 88.9, common_use: 'Main distribution, plant connections' },
      { dn: 'DN100', nb: '100mm', imperial: '4"', od_mm: 114.3, common_use: 'Main headers, risers, plant room mains' },
      { dn: 'DN125', nb: '125mm', imperial: '5"', od_mm: 139.7, common_use: 'Large distribution (less common size)' },
      { dn: 'DN150', nb: '150mm', imperial: '6"', od_mm: 168.3, common_use: 'Main headers, large risers' },
      { dn: 'DN200', nb: '200mm', imperial: '8"', od_mm: 219.1, common_use: 'Major distribution, chiller/boiler connections' },
      { dn: 'DN250', nb: '250mm', imperial: '10"', od_mm: 273.0, common_use: 'Major plant connections' },
      { dn: 'DN300', nb: '300mm', imperial: '12"', od_mm: 323.9, common_use: 'District heating mains, major infrastructure' }
    ],
    jointing_methods: {
      screwed: {
        name: 'Screwed (threaded)',
        applicable_sizes: 'DN15 to DN50 (standard practice). DN65 possible but uncommon.',
        thread_standard: 'BSP (British Standard Pipe) parallel or taper',
        fittings: 'Malleable iron (MI) fittings — elbows, tees, reducers, unions, nipples, bushes',
        notes: 'Standard for small bore heating. Thread sealant (PTFE tape or Loctite 55) required. Quicker than welding for small bore.'
      },
      flanged: {
        name: 'Flanged',
        applicable_sizes: 'DN50 and above (standard for >DN50)',
        flange_types: ['PN6 (low pressure)', 'PN10 (standard LTHW)', 'PN16 (standard commercial)', 'PN25 (medium pressure)', 'PN40 (high pressure)'],
        notes: 'Flanges welded to pipe ends, bolted together with gasket. Allows disassembly for maintenance. Count flanges in PAIRS.'
      },
      welded: {
        name: 'Welded',
        applicable_sizes: 'DN50 and above',
        weld_types: ['Butt weld (most common)', 'Socket weld (small bore high pressure)'],
        notes: 'Permanent joint. Strongest connection. Requires coded welder on site. Hot work permits required. Weld inspection may be specified (visual, dye penetrant, radiographic).'
      },
      grooved: {
        name: 'Grooved (Victaulic type)',
        applicable_sizes: 'DN50 to DN300+',
        notes: 'Mechanical coupling over grooved pipe ends. Fast installation. No hot work. Common for sprinkler systems and some HVAC. Allows slight movement/flexibility.'
      }
    },
    drawing_notations: ['CS', 'BS', 'MS', 'black steel', 'Black Steel', 'carbon steel', 'mild steel', 'STEEL', 'St'],
    surface_treatment: {
      black: 'Untreated — standard for closed systems (heating, cooling). Will rust if exposed.',
      galvanised: 'Zinc coated — for water systems, external use, some drainage. Standard: BS EN 10240 or BS 1387.',
      note: 'If drawing/spec says "galvanised" or "galv", this is a different (more expensive) product than standard black steel.'
    },
    supply_lengths: '6m standard lengths. Larger sizes may be longer by arrangement.'
  },

  /* ══════════════════════════════════════════════════════════════
     3. STAINLESS STEEL
     ══════════════════════════════════════════════════════════════ */
  stainless_steel: {
    material: 'Stainless Steel',
    standards: ['BS EN 10312 (welded tube)', 'BS EN 10296-2 (seamless tube)'],
    grades: {
      '304': 'Standard austenitic — good corrosion resistance. Most common grade for M&E.',
      '316': 'Marine grade — enhanced chloride resistance. Required near coast or for process/pharmaceutical.',
      '316L': 'Low carbon 316 — better weldability. Standard for pharmaceutical and food grade.',
      '321': 'Stabilised — for high temperature applications (>425°C).'
    },
    applications: ['Process pipework', 'Clean/pure water systems', 'Food grade / pharmaceutical', 'Laboratories', 'Swimming pool plant', 'Coastal environments (316 grade)', 'High-purity medical gas'],
    sizes: 'Similar range to carbon steel (DN15-DN150 common in M&E). Also available in metric OD (15mm-108mm for press-fit systems).',
    jointing_methods: {
      press_fit: {
        name: 'Press-fit (M-profile or V-profile)',
        notes: 'Most common in commercial M&E. Viega Sanpress Inox, Geberit Mapress Stainless. Fast, no hot work.'
      },
      welded: {
        name: 'TIG welded (orbital or manual)',
        notes: 'Required for pharmaceutical/food grade. Orbital welding for consistent quality. Purge gas (argon) required inside pipe during welding.'
      },
      hygienic_clamp: {
        name: 'Hygienic tri-clamp',
        notes: 'Pharmaceutical and food grade. Allows disassembly for cleaning. Counted as nr items (clamp + gasket).'
      }
    },
    drawing_notations: ['SS', 'S/S', '304SS', '316SS', '316L', 'stainless', 'Stainless Steel', 'St.St.'],
    cost_note: 'Stainless steel is significantly more expensive than copper or carbon steel (typically 2-3× material cost). Ensure correct grade is specified.'
  },

  /* ══════════════════════════════════════════════════════════════
     4. CPVC / uPVC
     ══════════════════════════════════════════════════════════════ */
  cpvc: {
    material: 'CPVC / uPVC',
    variants: {
      cpvc: {
        name: 'CPVC (Chlorinated Polyvinyl Chloride)',
        standard: 'BS EN ISO 15877',
        max_temp: '80°C continuous',
        applications: ['Hot water supply', 'Cold water supply', 'Some heating applications'],
        note: 'Can handle hot water — unlike standard uPVC.'
      },
      upvc: {
        name: 'uPVC (Unplasticised Polyvinyl Chloride)',
        standard: 'BS EN 1452 (pressure), BS EN 1329/1401 (drainage)',
        max_temp: '60°C maximum',
        applications: ['Cold water supply only', 'Chemical drainage', 'Condensate (if below 60°C)'],
        note: 'NOT suitable for hot water. Cheaper than CPVC.'
      }
    },
    sizes: [
      { nominal: '15mm', od: 16, common: true },
      { nominal: '22mm', od: 22, common: true },
      { nominal: '28mm', od: 28, common: true },
      { nominal: '35mm', od: 35, common: true },
      { nominal: '42mm', od: 42, common: true },
      { nominal: '54mm', od: 54, common: true },
      { nominal: '63mm', od: 63, common: true },
      { nominal: '76mm', od: 76, common: false },
      { nominal: '110mm', od: 110, common: true, note: 'Standard soil/waste size' },
      { nominal: '160mm', od: 160, common: true, note: 'Underground drainage' }
    ],
    jointing_methods: {
      solvent_cement: {
        name: 'Solvent cement (solvent weld)',
        notes: 'Permanent joint. Fast setting. No hot work. Most common for pressure systems. Specific cement for CPVC vs uPVC — not interchangeable.'
      },
      compression: {
        name: 'Compression',
        notes: 'Demountable. Used where disassembly may be needed. More expensive per joint.'
      },
      push_fit: {
        name: 'Push-fit (with O-ring seal)',
        notes: 'Drainage systems primarily. Quick installation. Not used for pressure systems.'
      }
    },
    drawing_notations: ['PVC', 'CPVC', 'uPVC', 'UPVC', 'plastic pipe', 'PVC-U'],
    fire_note: 'PVC pipes emit toxic fumes (HCl) when burning. Fire stopping at penetrations is critical. Some specs prohibit PVC in certain areas (plenum ceilings, escape routes).'
  },

  /* ══════════════════════════════════════════════════════════════
     5. MDPE
     ══════════════════════════════════════════════════════════════ */
  mdpe: {
    material: 'MDPE (Medium Density Polyethylene)',
    standard: 'BS EN 12201 (water), BS EN 1555 (gas)',
    colour_coding: {
      blue: 'Potable cold water supply (mains and distribution)',
      yellow: 'Gas supply (natural gas and LPG)',
      black: 'Non-potable water, irrigation',
      note: 'Colour is integral (not painted) and identifies the service. Blue = water, Yellow = gas.'
    },
    applications: ['Underground cold water mains', 'Water service connections', 'Gas supply (yellow)', 'Irrigation'],
    sizes: [
      { od: 20, sdr: 11, common_use: 'Individual service connections' },
      { od: 25, sdr: 11, common_use: 'Domestic service connections' },
      { od: 32, sdr: 11, common_use: 'Small commercial connections' },
      { od: 40, sdr: 11, common_use: 'Commercial connections' },
      { od: 50, sdr: 11, common_use: 'Small distribution mains' },
      { od: 63, sdr: 11, common_use: 'Distribution mains' },
      { od: 90, sdr: 11, common_use: 'Distribution mains' },
      { od: 110, sdr: 11, common_use: 'Trunk mains' },
      { od: 125, sdr: 11, common_use: 'Trunk mains' },
      { od: 160, sdr: 11, common_use: 'Major distribution' },
      { od: 180, sdr: 11, common_use: 'Major infrastructure' }
    ],
    jointing_methods: {
      compression: {
        name: 'Compression (mechanical)',
        applicable_sizes: '20mm to 63mm',
        notes: 'Quick connection. Demountable. No special tools. Standard for service connections and small sizes.'
      },
      electrofusion: {
        name: 'Electrofusion',
        applicable_sizes: '20mm to 180mm+',
        notes: 'Electric heating element in fitting melts pipe and fitting together. Requires electrofusion machine. Permanent joint. Traceable (logged by machine).'
      },
      butt_fusion: {
        name: 'Butt fusion',
        applicable_sizes: '63mm and above',
        notes: 'Pipe ends heated on hot plate then pressed together. Strongest joint. Requires butt fusion machine (large, heavy). Standard for larger sizes.'
      }
    },
    drawing_notations: ['MDPE', 'Blue MDPE', 'Yellow MDPE', 'PE80', 'PE100', 'poly pipe', 'polyethylene'],
    supply: 'Coils (20-63mm: 25m, 50m, 100m, 150m coils) or straight lengths (90mm+: 6m or 12m).',
    note: 'MDPE is underground only — not suitable for above-ground exposed installation (UV degradation without protection).'
  },

  /* ══════════════════════════════════════════════════════════════
     6. HDPE
     ══════════════════════════════════════════════════════════════ */
  hdpe: {
    material: 'HDPE (High Density Polyethylene)',
    standard: 'BS EN 12201 (pressure), BS EN 13244 (non-pressure)',
    applications: ['Below-ground drainage', 'Sewage systems', 'Chemical waste', 'Industrial effluent', 'Rainwater systems', 'Sub-soil drainage'],
    sizes: '90mm to 630mm+ OD. Sizes overlap with MDPE but wall thickness differs (SDR varies).',
    jointing_methods: {
      butt_fusion: { name: 'Butt fusion', notes: 'Standard for HDPE. Same principle as MDPE butt fusion.' },
      electrofusion: { name: 'Electrofusion', notes: 'Used where butt fusion machine access is restricted.' },
      mechanical: { name: 'Mechanical couplings', notes: 'For connections to other materials (clay, concrete, cast iron).' }
    },
    drawing_notations: ['HDPE', 'PE-HD', 'high density polyethylene'],
    note: 'HDPE is stronger and stiffer than MDPE. Used for drainage and sewage where pressure resistance and chemical resistance are needed.'
  },

  /* ══════════════════════════════════════════════════════════════
     7. MULTILAYER COMPOSITE (MLCP)
     ══════════════════════════════════════════════════════════════ */
  mlcp: {
    material: 'MLCP (Multilayer Composite Pipe)',
    standard: 'BS EN ISO 21003',
    construction: 'PE-X inner layer, aluminium barrier, PE-X or PE-RT outer layer',
    applications: ['Heating (LTHW, underfloor)', 'Hot and cold water', 'Chilled water', 'Radiator connections'],
    sizes: [
      { od: 16, common_use: 'Radiator connections, underfloor heating' },
      { od: 20, common_use: 'Small distribution' },
      { od: 25, common_use: 'Distribution' },
      { od: 32, common_use: 'Distribution' },
      { od: 40, common_use: 'Sub-mains' },
      { od: 50, common_use: 'Sub-mains' },
      { od: 63, common_use: 'Mains distribution' },
      { od: 75, common_use: 'Main distribution (larger sizes available)' }
    ],
    jointing_methods: {
      press_fit: { name: 'Press-fit', notes: 'Standard method. Manufacturer-specific fittings (Henco, Uponor, Wavin). Requires press tool.' },
      push_fit: { name: 'Push-fit', notes: 'Some systems offer push-fit for smaller sizes. Demountable.' }
    },
    drawing_notations: ['MLCP', 'multi-layer', 'multilayer', 'composite pipe', 'MLC', 'PEX-AL-PEX'],
    advantages: 'Lightweight, flexible, corrosion-free, oxygen barrier (aluminium layer), low thermal expansion.',
    note: 'Increasingly common as alternative to copper in commercial heating. Check spec carefully — some engineers still prefer copper.'
  },

  /* ══════════════════════════════════════════════════════════════
     8. SIZE NOTATION EQUIVALENTS
     ══════════════════════════════════════════════════════════════ */
  size_equivalents: {
    lookup: [
      { dn: 'DN15', nb: '15mm', imperial: '1/2"', od_steel: 21.3, od_copper: 15, note: '' },
      { dn: 'DN20', nb: '20mm', imperial: '3/4"', od_steel: 26.9, od_copper: 22, note: '' },
      { dn: 'DN25', nb: '25mm', imperial: '1"', od_steel: 33.7, od_copper: 28, note: '' },
      { dn: 'DN32', nb: '32mm', imperial: '1.25"', od_steel: 42.4, od_copper: 35, note: '' },
      { dn: 'DN40', nb: '40mm', imperial: '1.5"', od_steel: 48.3, od_copper: 42, note: '' },
      { dn: 'DN50', nb: '50mm', imperial: '2"', od_steel: 60.3, od_copper: 54, note: 'Transition: screwed→flanged for steel' },
      { dn: 'DN65', nb: '65mm', imperial: '2.5"', od_steel: 76.1, od_copper: 67, note: '' },
      { dn: 'DN80', nb: '80mm', imperial: '3"', od_steel: 88.9, od_copper: 76.1, note: '' },
      { dn: 'DN100', nb: '100mm', imperial: '4"', od_steel: 114.3, od_copper: 108, note: '' },
      { dn: 'DN125', nb: '125mm', imperial: '5"', od_steel: 139.7, od_copper: null, note: 'Copper not standard at this size' },
      { dn: 'DN150', nb: '150mm', imperial: '6"', od_steel: 168.3, od_copper: null, note: '' },
      { dn: 'DN200', nb: '200mm', imperial: '8"', od_steel: 219.1, od_copper: null, note: '' },
      { dn: 'DN250', nb: '250mm', imperial: '10"', od_steel: 273.0, od_copper: null, note: '' },
      { dn: 'DN300', nb: '300mm', imperial: '12"', od_steel: 323.9, od_copper: null, note: '' }
    ],
    rule: 'ALWAYS standardise to DN notation in output. If drawing says "2 inch pipe", convert to DN50. If it says "50mm copper", note as "54mm OD copper (equivalent DN50)".',
    note: 'DN (Diamètre Nominal) is the standard designation. NB (Nominal Bore) and DN are effectively the same number. Imperial sizes are still used on some older drawings.'
  },

  /* ══════════════════════════════════════════════════════════════
     9. SERVICE COLOUR CODING (BS 1710)
     ══════════════════════════════════════════════════════════════ */
  colour_coding: {
    standard: 'BS 1710:2014 — Specification for Identification of Pipelines and Services',
    basic_colours: {
      green: { service: 'Water (general)', systems: ['Cold water supply', 'Mains water', 'Chilled water (sometimes)'] },
      blue: { service: 'Cold water (alternative)', systems: ['Cold water supply', 'Boosted cold water'], note: 'Blue and green are both used for cold water — check legend.' },
      crimson_red: { service: 'Fire fighting', systems: ['Fire sprinkler', 'Fire hydrant', 'Hose reel'] },
      red: { service: 'Heating / hot water', systems: ['LTHW flow', 'MTHW flow', 'HTHW', 'DHWS flow'] },
      yellow_ochre: { service: 'Gas', systems: ['Natural gas', 'LPG', 'Medical gas (with specific banding)'] },
      brown: { service: 'Oils and combustible liquids', systems: ['Fuel oil', 'Hydraulic oil'] },
      orange: { service: 'Acids and alkalis', systems: ['Chemical drainage', 'Acid waste'] },
      violet: { service: 'Radiation hazard', systems: ['Radioactive waste (specialist)'] },
      grey: { service: 'Other gases', systems: ['Compressed air', 'Vacuum', 'Nitrogen'] },
      black: { service: 'Drainage / waste', systems: ['Soil', 'Waste', 'Vent pipe', 'Rainwater'] },
      white: { service: 'Return / secondary', systems: ['LTHW return', 'Condensate return'], note: 'Sometimes used with coloured bands for return legs.' }
    },
    banding_system: {
      description: 'BS 1710 uses coloured BANDS on a basic colour pipe to identify the specific service.',
      example: 'Green pipe (water) with red band = hot water supply. Green pipe with blue band = cold water supply.',
      note: 'Full banding details are in BS 1710 Annex A. The basic colour identifies the broad category; the band identifies the specific service.'
    },
    critical_rule: 'ALWAYS check the project-specific drawing legend before relying on BS 1710 colours. Many M&E consultants use their own colour schemes that differ from BS 1710. The legend is AUTHORITATIVE — BS 1710 is the FALLBACK.',
    common_non_standard: [
      'CIBSE/consultant colours often differ from BS 1710 (see CIBSE_SYMBOLS_REF in main KB)',
      'Flow and return distinguished by shade/lightness rather than different colours',
      'Chilled water sometimes shown in light blue (not green)',
      'Condensate sometimes shown in pink or magenta',
      'Some consultants use line STYLE (solid vs dashed) instead of colour for flow vs return'
    ]
  }
};

module.exports = KB_M01;
