/**
 * KB-M02: Pipe Fittings & Valves
 *
 * Structured lookup tables for pipe fittings, valve types,
 * drawing symbol recognition, speciality items, and
 * fittings estimation rules.
 * Injected into extraction prompts at runtime.
 *
 * Part of Contraq M&E Knowledge Base v5.6
 * Source: CIBSE, BSRIA, UK M&E estimating practice, valve manufacturers
 */

const KB_M02 = {
  id: 'KB-M02',
  title: 'Pipe Fittings & Valves',
  version: '1.0',
  date: '2026-03-18',

  /* ══════════════════════════════════════════════════════════════
     1. STANDARD FITTINGS
     ══════════════════════════════════════════════════════════════ */
  standard_fittings: {
    unit: 'nr (always counted individually when shown on drawings)',
    types: {
      elbow_90: {
        name: '90° Elbow',
        function: 'Direction change — right angle turn in pipe run',
        variants: ['Short radius (SR) — tighter turn, higher pressure drop', 'Long radius (LR) — gentler turn, lower pressure drop, standard for most M&E'],
        available_in: 'All pipe materials and sizes',
        drawing_appearance: 'Pipe line changes direction by 90°. May show as sharp corner or radiused curve.',
        count_rule: 'Count every 90° direction change in the pipe run.'
      },
      elbow_45: {
        name: '45° Elbow',
        function: 'Direction change — 45 degree offset',
        variants: ['Standard 45° elbow'],
        available_in: 'All pipe materials and sizes',
        drawing_appearance: 'Pipe line changes direction by 45°. Often used in pairs to create an offset.',
        count_rule: 'Count every 45° direction change. Two 45° elbows forming an offset = count as 2nr.'
      },
      tee: {
        name: 'Tee',
        function: 'Branch takeoff from main pipe run',
        variants: ['Equal tee (all three ports same size)', 'Reducing tee (branch smaller than main run)', 'Swept tee (lower pressure drop, used in drainage)'],
        available_in: 'All pipe materials and sizes',
        drawing_appearance: 'T-junction where a branch pipe leaves the main run.',
        count_rule: 'Count every branch junction. State main size and branch size. If reducing, note both sizes.',
        note: 'Tees must ALWAYS be counted individually — never estimated by allowance.'
      },
      reducer: {
        name: 'Reducer / Enlargement',
        function: 'Size change in pipe run',
        variants: ['Concentric (centred — standard)', 'Eccentric (offset — used to maintain soffit/invert level)'],
        available_in: 'All pipe materials and sizes',
        drawing_appearance: 'Pipe line narrows (or widens) with a tapered section. Size annotation changes.',
        count_rule: 'Count at every pipe size change. State both sizes (e.g. "DN50 to DN32 reducer").',
        note: 'Reducers must ALWAYS be counted individually.'
      },
      coupling: {
        name: 'Coupling / Connector',
        function: 'Straight inline connection between two pipe sections',
        variants: ['Standard coupling', 'Slip coupling (for repair/retrofit)', 'Transition coupling (joining different materials)'],
        available_in: 'All pipe materials',
        drawing_appearance: 'Not usually shown on GA drawings — implied at pipe joints.',
        count_rule: 'Generally included in pipe rate. Only count separately if specifically shown or if transition between different materials.',
        note: 'Transition couplings (e.g. copper to steel, copper to MDPE) should always be counted as they are significant items.'
      },
      union: {
        name: 'Union',
        function: 'Demountable connection for maintenance access',
        variants: ['Screwed union (small bore)', 'Union nut (compression systems)'],
        available_in: 'Small bore pipe (typically ≤DN50)',
        drawing_appearance: 'Small symbol on pipe line, or annotated "union". Often shown at equipment connections.',
        count_rule: 'Count where shown. Typically provided at: equipment connections (both sides of pump, both sides of valve), isolation points.',
        note: 'Larger bore pipes use flanged joints instead of unions for demountable connections.'
      },
      flange: {
        name: 'Flange',
        function: 'Bolted demountable connection for large bore pipes and equipment',
        variants: {
          weld_neck: 'Welded to pipe — standard for steel pipe. Best stress distribution.',
          slip_on: 'Slides over pipe end — cheaper but less strong than weld neck.',
          blind: 'Solid flange — closes off pipe end. Permanent blanking plate.',
          threaded: 'Screwed onto pipe end — for small bore connections to flanged equipment.',
          stub_end_lap: 'Used with loose backing flange — common for stainless steel (allows rotation for bolt hole alignment).'
        },
        pressure_ratings: ['PN6 (low pressure)', 'PN10 (standard)', 'PN16 (standard commercial)', 'PN25 (medium pressure)', 'PN40 (high pressure)'],
        available_in: 'Carbon steel, stainless steel. DN15 and above (typically DN50+).',
        drawing_appearance: 'Two short perpendicular lines across the pipe at a joint. May show bolt pattern.',
        count_rule: 'Count in PAIRS — every flanged joint needs two flanges plus bolts and gasket. State size and pressure rating.',
        note: 'Flange bolts and gaskets are typically included in the flange item but confirm with spec.'
      },
      end_cap: {
        name: 'End Cap / Blank',
        function: 'Terminates a pipe run — permanent or temporary',
        variants: ['Soldered/press-fit cap (permanent)', 'Screwed cap/plug (demountable)', 'Blind flange (large bore)'],
        available_in: 'All pipe materials and sizes',
        drawing_appearance: 'Pipe line terminates. May be annotated "capped" or "blanked".',
        count_rule: 'Count at every pipe termination that is not connected to equipment.'
      }
    }
  },

  /* ══════════════════════════════════════════════════════════════
     2. VALVES
     ══════════════════════════════════════════════════════════════ */
  valves: {
    unit: 'nr (ALWAYS count individually — never estimate valves by allowance)',
    rule: 'Every valve must be counted, sized, and typed. Valves are high-value items that significantly affect pricing.',

    isolation: {
      ball_valve: {
        name: 'Ball Valve',
        function: 'Quarter-turn isolation — full bore, low pressure drop when open',
        typical_sizes: 'DN15 to DN100 (larger available but butterfly preferred for >DN100)',
        applications: ['General isolation', 'Equipment isolation', 'Branch isolation', 'Domestic services'],
        drawing_symbol: 'Circle with horizontal line through centre (resembles ball shape)',
        drawing_notations: ['BV', 'IV', 'ISO', 'ball valve'],
        count_rule: 'Count every occurrence. Note size. Note if full bore or reduced bore.',
        spec_note: 'Check spec for: brass vs stainless steel body, lever handle vs T-handle, WRAS approved (potable water).'
      },
      gate_valve: {
        name: 'Gate Valve',
        function: 'Full bore isolation — low pressure drop, not for throttling',
        typical_sizes: 'DN50 and above (sometimes DN15-DN50 for specific applications)',
        applications: ['Main isolation', 'Plant room headers', 'Riser isolation', 'Fire sprinkler systems'],
        drawing_symbol: 'Angled bow-tie shape (two triangles meeting at points on the pipe line)',
        drawing_notations: ['GV', 'gate valve', 'gate'],
        count_rule: 'Count every occurrence. Note size. State flanged or screwed.',
        spec_note: 'Gate valves should NOT be used for throttling — they are fully open or fully closed. Check spec for rising stem vs non-rising stem.'
      },
      butterfly_valve: {
        name: 'Butterfly Valve',
        function: 'Large bore isolation/control — compact, quarter-turn',
        typical_sizes: 'DN50 to DN600+ (standard choice for large bore isolation)',
        applications: ['Main headers', 'Plant connections', 'Chiller/boiler isolation', 'Large distribution'],
        drawing_symbol: 'Disc shape perpendicular to pipe line, or butterfly wing shape',
        drawing_notations: ['BFV', 'BTFV', 'butterfly', 'BV (context — large bore)'],
        count_rule: 'Count every occurrence. Note size. Note wafer or lugged body type.',
        spec_note: 'Check spec for: wafer (between flanges) vs lugged (own bolting), EPDM vs PTFE liner, lever vs gearbox vs actuator operator.'
      },
      globe_valve: {
        name: 'Globe Valve',
        function: 'Flow regulation and throttling — higher pressure drop than ball/gate',
        typical_sizes: 'DN15 to DN200',
        applications: ['Flow throttling', 'Hose bibs', 'Drain points', 'Where fine flow adjustment needed'],
        drawing_symbol: 'Circle on pipe line (full circle, no line through)',
        drawing_notations: ['GLV', 'globe', 'throttle valve'],
        count_rule: 'Count every occurrence. Note size.',
        spec_note: 'Higher pressure drop than ball/gate valves. Used where flow control is needed, not just isolation.'
      }
    },

    control: {
      two_port: {
        name: '2-Port Control Valve',
        function: 'On/off or modulating control of flow through a single path',
        typical_sizes: 'DN15 to DN150',
        applications: ['FCU control', 'AHU coil control', 'Zone control', 'Domestic HW control'],
        drawing_notations: ['2PV', 'CV', 'MV', '2-port', 'motorised valve'],
        count_rule: 'Count every occurrence. Note size, note if on/off or modulating, note actuator type.',
        spec_note: 'Check spec for: actuator type (thermal, motorised, pneumatic), fail-safe position (open/closed), control signal (0-10V, 4-20mA, on/off).',
        includes: 'Valve body + actuator. Usually supplied as a set.'
      },
      three_port_mixing: {
        name: '3-Port Mixing Valve',
        function: 'Blends two input flows (hot + bypass) to one output at controlled temperature',
        typical_sizes: 'DN15 to DN150',
        applications: ['Heating circuit temperature control', 'Boiler shunt pump circuits', 'Underfloor heating blending'],
        drawing_notations: ['3PV', '3-port', 'mixing valve', 'MXV'],
        count_rule: 'Count every occurrence. Note size. Note mixing vs diverting.',
        spec_note: 'Mixing valve has two INLETS and one OUTLET. Do not confuse with diverting valve.',
        port_arrangement: 'Port A = hot flow, Port B = bypass/return, Port AB = mixed output.'
      },
      three_port_diverting: {
        name: '3-Port Diverting Valve',
        function: 'Splits one input flow into two output paths',
        typical_sizes: 'DN15 to DN150',
        applications: ['Changeover between heating/cooling coils', 'Diverting to different zones'],
        drawing_notations: ['3PV', '3-port', 'diverting valve', 'DIV'],
        count_rule: 'Count every occurrence. Note size. Note mixing vs diverting.',
        spec_note: 'Diverting valve has one INLET and two OUTLETS. Opposite of mixing valve.',
        port_arrangement: 'Port AB = inlet, Port A = output 1, Port B = output 2.'
      },
      picv: {
        name: 'Pressure Independent Control Valve (PICV)',
        function: 'Combined flow limiting, balancing, and modulating control in one valve',
        typical_sizes: 'DN15 to DN150',
        applications: ['FCU connections', 'AHU coil connections', 'Variable flow systems', 'Replaces separate balancing + control valves'],
        drawing_notations: ['PICV', 'pressure independent', 'PI-CV'],
        count_rule: 'Count every occurrence. Note size and flow range (l/s).',
        spec_note: 'PICVs replace a DRV + 2PV combination. Higher unit cost but fewer valves overall. Check if spec mandates PICV or allows separate valves.',
        manufacturers: 'IMI TA-Modulator, Danfoss AB-QM, Belimo EP, Crane D991'
      }
    },

    safety_regulation: {
      pressure_relief: {
        name: 'Pressure Relief Valve (PRV / Safety Valve)',
        function: 'SAFETY DEVICE — relieves excess pressure to prevent system damage or explosion',
        applications: ['Sealed heating systems', 'Hot water cylinders', 'Pressurised vessels', 'Boiler circuits'],
        drawing_notations: ['PRV', 'safety valve', 'SV', 'relief valve', 'T&P valve'],
        count_rule: 'ALWAYS count — this is a life-safety item. Note set pressure and discharge size.',
        spec_note: 'Discharge MUST be piped to safe location (usually tundish + drain). Count the discharge pipework separately.',
        warning: 'PRV = Pressure RELIEF Valve (safety). Also abbreviated PRV = Pressure REDUCING Valve (regulation). Context determines which — check carefully.'
      },
      pressure_reducing: {
        name: 'Pressure Reducing Valve (PRV / PRD)',
        function: 'Reduces incoming pressure to a lower controlled downstream pressure',
        applications: ['Mains water pressure reduction', 'Steam pressure reduction', 'Compressed air regulation'],
        drawing_notations: ['PRV', 'PRD', 'pressure reducing', 'reducing valve'],
        count_rule: 'Count every occurrence. Note inlet pressure, outlet pressure, and size.',
        spec_note: 'Often installed with upstream strainer and downstream pressure gauge. Check spec for these associated items.',
        warning: 'Same abbreviation PRV as pressure RELIEF valve. If drawing says "PRV" without context, flag for clarification.'
      },
      check_valve: {
        name: 'Check Valve / Non-Return Valve (NRV)',
        function: 'Prevents reverse flow — allows flow in one direction only',
        variants: {
          swing: 'Swing check — hinged disc. Low pressure drop. Horizontal or vertical (upflow) only.',
          spring: 'Spring-loaded disc. Works in any orientation. Higher pressure drop.',
          wafer: 'Wafer (dual-plate) check — compact, fits between flanges. Common for large bore.',
          foot: 'Foot valve — at bottom of suction pipe in pump well. Includes strainer.'
        },
        applications: ['Pump discharge (prevent reverse flow on pump stop)', 'System interconnections', 'Backflow prevention', 'Booster set discharge'],
        drawing_symbol: 'Triangle pointing in flow direction on the pipe line, or arrowhead shape',
        drawing_notations: ['NRV', 'CV', 'check valve', 'non-return', 'check'],
        count_rule: 'Count every occurrence. Note size and type (swing/spring/wafer).',
        spec_note: 'NRVs are typically installed downstream of pumps and at system interconnection points. Check spec for type.'
      },
      strainer: {
        name: 'Strainer (Y-Type or Basket)',
        function: 'Filters debris from flow — protects downstream equipment (valves, pumps, coils)',
        variants: {
          y_type: 'Y-strainer — inline, compact. Standard for small-medium bore. Can be installed horizontally or vertically.',
          basket: 'Basket strainer — larger capacity, flanged. Standard for large bore and pump suction.',
          duplex: 'Duplex basket — two baskets, changeover without shutdown. For critical systems.'
        },
        applications: ['Upstream of control valves', 'Upstream of pumps', 'Upstream of heat exchangers', 'Upstream of PICVs'],
        drawing_symbol: 'Square or diamond shape on pipe line, sometimes with Y-shape indication',
        drawing_notations: ['STR', 'strainer', 'Y-strainer', 'basket strainer', 'filter'],
        count_rule: 'Count every occurrence. Note size and type (Y-type/basket). Note mesh size if spec states.',
        spec_note: 'Strainers need regular cleaning — check spec for blowdown valve requirement and isolation arrangement.'
      }
    },

    balancing: {
      manual_balancing: {
        name: 'Manual Balancing Valve (MBV)',
        function: 'Fixed-position valve for proportional flow balancing during commissioning',
        typical_sizes: 'DN15 to DN150',
        applications: ['Terminal unit branches', 'Riser branches', 'Circuit balancing'],
        drawing_notations: ['MBV', 'BV (context — balancing)', 'balancing valve'],
        count_rule: 'Count every occurrence. Note size.',
        spec_note: 'Often specified as "commissioning valve with test points". Requires commissioning to set position.'
      },
      double_regulating: {
        name: 'Double Regulating Valve (DRV)',
        function: 'Balancing valve with memory stop — can be isolated and returned to set position',
        typical_sizes: 'DN15 to DN150',
        applications: ['Branch balancing', 'Sub-circuit balancing', 'Widely used on LTHW systems'],
        drawing_notations: ['DRV', 'DPCV', 'double reg', 'regulating valve'],
        count_rule: 'Count every occurrence. Note size.',
        spec_note: 'DRV has test points for measuring differential pressure. Required for commissioning to BSRIA BG 85.',
        manufacturers: 'IMI TA-STAD, Crane DRV, Honeywell Kombi-3'
      },
      commissioning_set: {
        name: 'Commissioning Set / Metering Station',
        function: 'Combined fixed orifice and DRV for accurate flow measurement and balancing',
        typical_sizes: 'DN15 to DN300',
        applications: ['Main headers', 'Plant connections', 'Riser take-offs', 'AHU connections'],
        drawing_notations: ['COMM SET', 'commissioning set', 'metering station', 'CMS'],
        count_rule: 'Count every occurrence. Note size and configuration.',
        spec_note: 'More expensive than DRV alone but provides more accurate commissioning. Check spec for manufacturer preference.',
        manufacturers: 'IMI TA-STAF, Crane D940, Honeywell Kombi-QM'
      }
    }
  },

  /* ══════════════════════════════════════════════════════════════
     3. VALVE DRAWING SYMBOLS
     ══════════════════════════════════════════════════════════════ */
  drawing_symbols: {
    rule: 'ALWAYS verify symbol meaning against the drawing legend. These are common conventions but projects may use non-standard symbols.',
    common_symbols: {
      'Circle with horizontal line': { likely: 'Ball valve', confidence_without_legend: 'Medium' },
      'Angled bow-tie (two triangles at points)': { likely: 'Gate valve', confidence_without_legend: 'Medium' },
      'Butterfly/disc shape on pipe': { likely: 'Butterfly valve', confidence_without_legend: 'Medium' },
      'Full circle on pipe (no line)': { likely: 'Globe valve', confidence_without_legend: 'Low' },
      'Triangle pointing into flow': { likely: 'Check valve / NRV', confidence_without_legend: 'Medium' },
      'Square or Y-shape on pipe': { likely: 'Strainer', confidence_without_legend: 'Medium' },
      'Circle with arrow/motor': { likely: 'Control valve (motorised)', confidence_without_legend: 'Medium' },
      'Circle with P': { likely: 'Pressure gauge', confidence_without_legend: 'Medium' },
      'Circle with T': { likely: 'Temperature gauge', confidence_without_legend: 'Medium' },
      'Zigzag on pipe': { likely: 'Expansion loop or flexible connection', confidence_without_legend: 'Low' },
      'Circle with arrow (centrifugal)': { likely: 'Pump', confidence_without_legend: 'Medium' },
      'Semi-circle / dome shape': { likely: 'Expansion vessel', confidence_without_legend: 'Low' },
      'Diamond with F': { likely: 'Flow meter', confidence_without_legend: 'Medium' }
    },
    without_legend_rule: 'If no legend is available, use these common symbols as BEST ESTIMATE only. Set confidence to "Medium" at best. List all symbol assumptions in the flags section.'
  },

  /* ══════════════════════════════════════════════════════════════
     4. SPECIALITY ITEMS
     ══════════════════════════════════════════════════════════════ */
  speciality_items: {
    unit: 'nr (count individually)',
    types: {
      expansion_loop: {
        name: 'Expansion Loop',
        function: 'Absorbs thermal expansion in long pipe runs. U-shaped or Z-shaped diversion.',
        count_rule: 'Count every loop. Note pipe size. The loop itself uses additional pipe (measure the loop length separately).',
        note: 'Expansion loops are ADDITIONAL pipe length — the straight-line distance plus the loop pipe.'
      },
      expansion_bellows: {
        name: 'Expansion Bellows / Compensator',
        function: 'Absorbs thermal expansion inline — compact alternative to expansion loop',
        count_rule: 'Count every bellows. Note size and movement range.',
        note: 'Bellows require anchor points either side. Count anchors separately.'
      },
      flexible_connection: {
        name: 'Flexible Connection / Anti-Vibration Joint',
        function: 'Isolates vibration from rotating equipment (pumps, fans, compressors)',
        count_rule: 'Count every flexible. Note size. Typically 1nr each side of pump (2nr per pump).',
        note: 'Always check for flexibles at: pumps, boilers, chillers, AHUs, pressurisation units.'
      },
      anchor_point: {
        name: 'Anchor Point / Fixed Point',
        function: 'Restrains pipe movement at a specific location — directs expansion towards bellows/loops',
        count_rule: 'Count every anchor. Often shown as a heavy bracket symbol or annotated "FP" or "anchor".',
        note: 'Anchors are structurally significant — may need engineer-designed brackets.'
      },
      guide: {
        name: 'Pipe Guide',
        function: 'Allows axial pipe movement while preventing lateral movement',
        count_rule: 'Count every guide. Typically placed either side of expansion devices.',
        note: 'Guides work with bellows and expansion loops to control the direction of pipe movement.'
      },
      pipe_bridge: {
        name: 'Pipe Bridge / Crossover',
        function: 'Allows one pipe to cross over another without connecting',
        count_rule: 'Count every crossover. Note both pipe sizes. A crossover uses 4× elbows and additional pipe.',
        note: 'Crossovers are sometimes shown on drawings as a bump/arc in the pipe line.'
      },
      drain_point: {
        name: 'Drain Point / Drain Cock',
        function: 'Low point drain for system filling and draining',
        count_rule: 'Count every drain point. Note size (typically DN15 or DN20).',
        note: 'Required at every low point in the system. Often missed on drawings — check spec for requirements. Flag if no drain points shown on a closed-loop system.'
      },
      air_vent: {
        name: 'Air Vent / Air Release Valve',
        function: 'High point vent for removing trapped air from pipework systems',
        variants: {
          manual: 'Manual air vent — turned by hand or key to release air.',
          automatic: 'Automatic air vent (AAV) — float-operated, releases air continuously.'
        },
        count_rule: 'Count every air vent. Note type (manual/automatic). Note size.',
        note: 'Required at every high point in closed-loop systems. Often missed on drawings — check spec. Flag if no air vents shown on a closed-loop system.'
      }
    }
  },

  /* ══════════════════════════════════════════════════════════════
     5. FITTINGS ESTIMATION RULES
     ══════════════════════════════════════════════════════════════ */
  estimation_rules: {
    priority: [
      '1. Use FITTINGS SCHEDULE from spec/drawing — MOST ACCURATE. If a schedule exists, use it EXCLUSIVELY.',
      '2. Count INDIVIDUALLY from GA drawings — ACCURATE. Count every visible fitting.',
      '3. ESTIMATE using allowance rates from KB-C02 — LEAST ACCURATE. Only when fittings are not shown.'
    ],
    when_to_estimate: 'Only estimate fittings if they are NOT individually shown on drawings AND no fittings schedule exists in the specification or on a drawing.',
    when_NOT_to_estimate: [
      'If a fittings schedule exists — use it exclusively.',
      'If fittings are individually shown on GA drawings — count them.',
      'If both schedule and drawing exist — use the schedule (higher authority for specification).'
    ],
    output_labelling: {
      from_schedule: 'Source: "Schedule" — fittings taken from fittings/valve schedule. Highest confidence.',
      from_drawing: 'Source: "Drawing" — fittings counted individually from GA drawing. High confidence.',
      estimated: 'Source: "Estimated allowance" — fittings estimated using KB-C02 rates. Medium confidence. Must be flagged for estimator review.'
    },
    cross_ref: 'Fittings allowance rates (elbows per metre by pipe size/material) are defined in KB-C02.',
    implicit_items: {
      description: 'Certain fittings are ALWAYS required even if not shown on drawings:',
      items: [
        'Isolation valves at equipment connections (both sides of pumps, at boiler/chiller connections)',
        'Strainers upstream of control valves and pumps',
        'Drain points at system low points',
        'Air vents at system high points',
        'Flexible connections at rotating equipment',
        'Unions or flanges for maintenance access at valves and equipment'
      ],
      rule: 'If these items are not shown on drawings, include them as "Implicit" source with Medium confidence. Flag for estimator verification.'
    }
  }
};

module.exports = KB_M02;
