/**
 * KB-M03: HVAC & Ductwork
 *
 * Structured reference for ductwork types, measurement rules,
 * fittings, dampers, air terminals, AH plant, and VRF systems.
 * Injected into extraction prompts at runtime.
 *
 * Part of Contraq M&E Knowledge Base v5.7
 * Source: DW/144, DW/172, CIBSE Guide B2, BESA, UK M&E practice
 */

const KB_M03 = {
  id: 'KB-M03',
  title: 'HVAC & Ductwork',
  version: '1.0',
  date: '2026-03-18',

  /* ══════════════════════════════════════════════════════════════
     1. DUCTWORK TYPES & MEASUREMENT
     ══════════════════════════════════════════════════════════════ */
  ductwork_types: {

    rectangular: {
      name: 'Rectangular Ductwork',
      material_default: 'Galvanised Mild Steel (GMS)',
      standard: 'DW/144 (BESA — Specification for Sheet Metal Ductwork)',
      measurement: {
        unit: 'm² (surface area)',
        formula: '2 × (W + H) × Length = surface area in m²',
        example: '600mm × 400mm duct, 10m long: 2 × (0.6 + 0.4) × 10 = 20.0 m²',
        note: 'Width and Height are INTERNAL dimensions. Always stated as W × H (e.g. 600×400).'
      },
      dimension_notation: 'Width × Height in mm (e.g. 600×400, 1200×600, 300×200)',
      pressure_classes: {
        low: { class: 'Class A (Low Pressure)', velocity: '<10 m/s', static_pressure: '≤500 Pa', typical_use: 'Standard office/commercial supply and extract' },
        medium: { class: 'Class B (Medium Pressure)', velocity: '10-20 m/s', static_pressure: '500-1000 Pa', typical_use: 'Higher velocity systems, longer duct runs' },
        high: { class: 'Class C (High Pressure)', velocity: '>20 m/s', static_pressure: '>1000 Pa', typical_use: 'VAV systems, high-velocity distribution' }
      },
      airtightness_classes: {
        A: 'Lowest airtightness — acceptable for Class A pressure only',
        B: 'Medium airtightness — standard for most commercial',
        C: 'Highest airtightness — required for energy-efficient systems, clean rooms',
        D: 'Special — above Class C, for specific applications'
      },
      gauge_by_size: {
        note: 'Gauge (thickness) is determined by duct size and pressure class per DW/144.',
        typical: [
          { max_dimension: '≤750mm', gauge_mm: 0.6, gauge_swg: 24, note: 'Standard small/medium duct' },
          { max_dimension: '751-1000mm', gauge_mm: 0.8, gauge_swg: 22, note: 'Medium duct' },
          { max_dimension: '1001-1500mm', gauge_mm: 1.0, gauge_swg: 20, note: 'Large duct' },
          { max_dimension: '1501-2000mm', gauge_mm: 1.2, gauge_swg: 18, note: 'Very large duct' },
          { max_dimension: '>2000mm', gauge_mm: 1.6, gauge_swg: 16, note: 'Exceptional — structural consideration' }
        ],
        rule: 'If spec does not state gauge, use DW/144 defaults. Higher pressure class requires heavier gauge for same duct size.'
      },
      joint_types: {
        slip_joint: 'Slipped connection with sealant and pop rivets — standard for Class A',
        flanged: 'Angle iron or TDC/TDF flanges — standard for Class B/C and larger ducts',
        tdc: 'Transverse Duct Connection (folded flange) — quick erection, standard modern practice',
        tdf: 'Transverse Duct Flange — similar to TDC, alternative manufacturer system',
        note: 'Joint type affects labour cost and airtightness. Flanged joints are more expensive but provide better sealing.'
      },
      common_sizes: [
        '200×200', '300×200', '300×300', '400×200', '400×300', '400×400',
        '500×300', '500×400', '500×500', '600×300', '600×400', '600×500', '600×600',
        '800×400', '800×500', '800×600', '800×800',
        '1000×400', '1000×500', '1000×600', '1000×800', '1000×1000',
        '1200×400', '1200×600', '1200×800', '1200×1000', '1200×1200',
        '1500×600', '1500×800', '1500×1000',
        '2000×600', '2000×800', '2000×1000'
      ]
    },

    circular: {
      name: 'Circular Ductwork (Spiral)',
      material_default: 'Galvanised Mild Steel (GMS) — spiral wound',
      standard: 'DW/144',
      measurement: {
        unit: 'm (linear metres)',
        note: 'State diameter with each measurement.',
        example: '25m of Ø315mm circular duct'
      },
      diameter_notation: 'Ø followed by diameter in mm (e.g. Ø100, Ø200, Ø315, Ø500)',
      construction: {
        spiral: 'Spiral wound from continuous strip — standard for most circular duct. Self-stiffening.',
        longitudinal: 'Single longitudinal seam — used for larger diameters or where spiral is not available.'
      },
      common_sizes_mm: [100, 125, 150, 160, 200, 250, 315, 355, 400, 450, 500, 560, 630, 710, 800, 900, 1000, 1250],
      advantages: 'Lower pressure drop than rectangular for same flow. Self-stiffening. Fewer joints. Less air leakage.',
      supply_lengths: '3m standard lengths. Custom lengths available.'
    },

    flat_oval: {
      name: 'Flat Oval Ductwork',
      material_default: 'Galvanised Mild Steel (GMS)',
      measurement: {
        unit: 'm (linear metres)',
        note: 'State dimensions: major axis × minor axis (e.g. 500×200 flat oval).',
        example: '15m of 600×200 flat oval duct'
      },
      typical_use: 'Where ceiling void height is restricted but circular duct performance is desired. Lower height profile than rectangular for same airflow.',
      common_sizes: ['300×150', '400×150', '400×200', '500×200', '600×200', '600×250', '800×250'],
      note: 'Less common than rectangular or circular. Check spec — not all fabricators produce flat oval. May need special fittings.'
    },

    flexible: {
      name: 'Flexible Ductwork',
      measurement: {
        unit: 'm (linear metres)',
        note: 'State diameter. Always note if insulated or uninsulated.'
      },
      types: {
        uninsulated: 'Wire helix with aluminium/polyester laminate — lightweight, for short connections.',
        insulated: 'As above with integral insulation jacket (25mm or 50mm) and vapour barrier.',
        acoustic: 'Internally lined for noise attenuation — used near diffusers in noise-sensitive areas.'
      },
      common_sizes_mm: [100, 125, 150, 160, 200, 250, 315],
      max_length_rule: {
        max_straight: '1.5m (CIBSE/BESA recommendation)',
        reason: 'Longer runs cause excessive pressure drop and turbulence. Flex duct must be pulled taut, not compressed.',
        flag_if: 'Drawing shows flex duct run longer than 1.5m — flag as non-compliant with best practice.'
      },
      typical_use: 'Final connection from rigid duct to diffuser/grille. Allows adjustment of terminal device position.',
      note: 'Flex duct is NOT a substitute for rigid duct. It is for SHORT final connections only.'
    },

    specialist: {
      kitchen_extract: {
        name: 'Kitchen Extract Ductwork',
        standard: 'DW/172 (BESA)',
        material: 'Galvanised steel, welded joints (grease-tight), heavier gauge than standard duct',
        measurement: 'm² surface area (same as rectangular)',
        notes: 'Significantly more expensive than standard ductwork. Welded joints, no sealant. Access panels for cleaning. May need fire-rated wrap.',
        flag_if: 'Kitchen extract system shown but DW/172 not referenced in spec — potential underspecification.'
      },
      fire_rated: {
        name: 'Fire-Rated Ductwork',
        standards: ['BS EN 1366-1 (fire resistance of ducts)', 'BS 476-24 (fire resistance)'],
        types: {
          proprietary_system: 'Factory-made fire-rated duct system (e.g. Promat MASTERBOARD, Isover ULTIMATE)',
          site_applied_wrap: 'Standard duct with fire-rated wrap/board applied on site (e.g. Rockwool, Isover)',
          concrete_casing: 'Duct enclosed in fire-rated construction — builder\'s work'
        },
        measurement: 'm² of fire-rated duct surface area (wrap/board), or m (linear) for proprietary systems',
        ratings: ['30 minutes', '60 minutes', '90 minutes', '120 minutes'],
        note: 'Fire-rated ductwork is 2-5× the cost of standard ductwork. Ensure fire rating is confirmed in spec.'
      },
      smoke_extract: {
        name: 'Smoke Extract / Smoke Control Ductwork',
        standard: 'BS EN 12101 (smoke control systems)',
        notes: 'Must maintain integrity at high temperatures. Often fire-rated ductwork. Dampers rated for smoke leakage.',
        flag_if: 'Smoke extract system shown — confirm smoke control strategy and fire engineering requirements.'
      }
    }
  },

  /* ══════════════════════════════════════════════════════════════
     2. DUCTWORK FITTINGS
     ══════════════════════════════════════════════════════════════ */
  ductwork_fittings: {
    unit: 'nr (ALWAYS count individually from GA drawings)',
    rule: 'Ductwork fittings should be counted individually wherever possible. If not individually shown, allow 25% of straight duct quantity as fittings cost (Wendes method). Flag as estimated.',

    types: {
      bend_90: {
        name: '90° Bend',
        variants: ['Radiused bend (standard — lower pressure drop)', 'Mitre bend with turning vanes (rectangular only)', 'Segmented bend'],
        count_rule: 'Count every 90° direction change. Note duct size.',
        note: 'Radiused bends preferred. Mitre bends with turning vanes for tight spaces. Turning vanes are an additional item if specified.'
      },
      bend_45: {
        name: '45° Bend',
        count_rule: 'Count every 45° change. Two 45° bends forming an offset = count as 2nr.',
        note: 'Often used in pairs to create offsets around obstructions.'
      },
      offset: {
        name: 'Offset',
        function: 'S-shaped transition to move duct laterally (e.g. around a beam)',
        count_rule: 'Count as 1nr offset. Equivalent to 2× 45° bends or 2× custom-angle bends.',
        note: 'May be shown as two bends in quick succession on the drawing.'
      },
      taper: {
        name: 'Taper / Reducer / Transition',
        function: 'Size change in duct run (larger to smaller or vice versa)',
        variants: ['Symmetrical taper (centred)', 'Eccentric taper (one side flat — maintains ceiling line)', 'Rectangular to circular transformation'],
        count_rule: 'Count at every duct size change. Note both sizes (e.g. "600×400 to 400×300 taper").',
        note: 'Transformation pieces (rectangular to circular) are more expensive than standard tapers.'
      },
      branch: {
        name: 'Branch / Tee',
        function: 'Takeoff from main duct for sub-distribution',
        variants: ['Equal tee (both branches same size)', 'Reducing tee (branch smaller than main)', 'Shoe (angled takeoff at 45° — lower pressure drop)', 'Saddle tap (small branch from large duct)'],
        count_rule: 'Count every branch. Note main duct size and branch size. Note angle if not 90°.',
        note: 'Branches are significant cost items — always count individually.'
      },
      access_door: {
        name: 'Access Door / Inspection Hatch',
        function: 'Allows internal access for cleaning, damper adjustment, or inspection',
        count_rule: 'Count every access door. Note duct size.',
        spec_note: 'DW/144 and most specs require access doors at: fire dampers, volume control dampers, bends, and at regular intervals on long straight runs (typically every 3-6m for cleaning access). Check spec.',
        note: 'If not individually shown on drawings, check spec for access door requirements — they may be specified by rule rather than drawn.'
      },
      test_hole: {
        name: 'Test Hole / Measurement Port',
        function: 'Small port for air velocity/pressure measurement during commissioning',
        count_rule: 'Count if shown. Often specified by commissioning spec rather than drawn.',
        note: 'Typically located: downstream of fans, at branch takeoffs, at main duct transitions. Check commissioning spec.'
      },
      end_cap: {
        name: 'End Cap',
        function: 'Terminates a duct run',
        count_rule: 'Count at every duct termination not connected to equipment or terminal device.'
      },
      turning_vanes: {
        name: 'Turning Vanes',
        function: 'Aerodynamic guide vanes inside mitre bends to reduce pressure drop and noise',
        count_rule: 'Count as a SET per mitre bend. Note duct size. Not needed in radiused bends.',
        note: 'Turning vanes are specified in addition to the bend itself. Check spec — not always required.'
      }
    }
  },

  /* ══════════════════════════════════════════════════════════════
     3. DAMPERS
     ══════════════════════════════════════════════════════════════ */
  dampers: {
    unit: 'nr (ALWAYS count individually)',
    rule: 'Dampers are critical items — always count individually. Fire dampers are life-safety items. Never estimate by allowance.',

    types: {
      fire_damper: {
        name: 'Fire Damper (FD)',
        function: 'Automatically closes to prevent fire spreading through ductwork penetrations of fire-rated walls/floors',
        fire_ratings: ['60 minutes (E60)', '90 minutes (E90)', '120 minutes (EI120)', '240 minutes (EI240)'],
        actuation: {
          intumescent: 'Intumescent element expands with heat, releasing blade. Resets manually. Most common.',
          fusible_link: 'Metal link melts at set temperature (typically 72°C). Oldest type.',
          motorised: 'Motor-driven with fusible link backup and fire alarm interface. For smoke control.'
        },
        standards: ['BS EN 1366-2 (fire testing)', 'BS EN 15650 (product standard)'],
        count_rule: 'Count EVERY fire damper. Note: size (W×H or Ø), fire rating (minutes), actuation type, wall/floor rating.',
        drawing_symbol: 'Thick bar or specific FD symbol at duct-wall intersection. Usually labelled "FD".',
        installation_note: 'Fire damper requires: access door on duct (for inspection/reset), fire-rated sleeve through wall/floor, fire stopping around sleeve. Count these ASSOCIATED ITEMS separately.',
        note: 'Fire dampers are MANDATORY at every duct penetration through a fire-rated wall or floor. If not shown on drawings but fire compartmentation exists, flag as potentially missing.'
      },
      smoke_damper: {
        name: 'Smoke Damper (SD)',
        function: 'Prevents smoke spread through ductwork. Closes on fire alarm signal.',
        actuation: 'Motorised — closes on signal from fire alarm panel. Requires power supply and fire alarm interface.',
        standards: ['BS EN 1366-2', 'BS EN 12101-8'],
        count_rule: 'Count every smoke damper. Note size and actuation. Note fire alarm zone interface.',
        drawing_notations: ['SD', 'smoke damper'],
        note: 'Smoke dampers require: power supply, fire alarm interface, access door. Count electrical connections as separate items.'
      },
      combined_fire_smoke: {
        name: 'Combined Fire/Smoke Damper (FSD)',
        function: 'Combined fire and smoke damper — provides both fire resistance and smoke control',
        count_rule: 'Count every occurrence. Note size, fire rating, and actuation type.',
        drawing_notations: ['FSD', 'FS', 'fire/smoke damper'],
        note: 'More expensive than separate FD or SD. Requires power, fire alarm interface, and access door.'
      },
      motorised_vcd: {
        name: 'Motorised Volume Control Damper (VCD)',
        function: 'Adjusts airflow volume — controlled by BMS for zone temperature/pressure control',
        actuation: 'Electric actuator (0-10V or 4-20mA signal from BMS)',
        count_rule: 'Count every motorised VCD. Note size and actuator type. Note BMS point reference if shown.',
        drawing_symbol: 'Butterfly/throttle symbol with motor symbol (M) on duct line',
        drawing_notations: ['VCD', 'MVCD', 'motorised damper', 'MD'],
        note: 'Motorised VCDs require: power supply, BMS control signal. Count electrical connections as separate items or cross-reference KB-E electrical.'
      },
      manual_vcd: {
        name: 'Manual Volume Control Damper',
        function: 'Manual airflow adjustment — set during commissioning, not automatically controlled',
        count_rule: 'Count every manual VCD. Note size. Note if locking quadrant handle specified.',
        drawing_symbol: 'Butterfly/throttle symbol on duct line WITHOUT motor symbol',
        drawing_notations: ['VCD', 'damper', 'volume damper', 'BD (balancing damper)'],
        note: 'Manual VCDs are cheaper than motorised but still count individually. Check spec for handle/quadrant type.'
      },
      non_return: {
        name: 'Non-Return Damper (Backdraught Damper)',
        function: 'Prevents reverse airflow — gravity or spring operated',
        count_rule: 'Count every occurrence. Note size.',
        drawing_notations: ['NRD', 'BD', 'backdraught damper', 'non-return'],
        note: 'Typically installed at: fan discharge, external wall openings, kitchen/WC extract terminations.'
      }
    }
  },

  /* ══════════════════════════════════════════════════════════════
     4. AIR TERMINAL DEVICES
     ══════════════════════════════════════════════════════════════ */
  air_terminals: {
    unit: 'nr (count individually)',
    rule: 'Always check air terminal schedule if available — the schedule is authoritative for type, size, and quantity. If no schedule, count from reflected ceiling plan (RCP) or GA drawing.',

    supply: {
      four_way_diffuser: {
        name: '4-Way Ceiling Diffuser',
        function: 'Distributes supply air in four directions from ceiling-mounted unit',
        typical_sizes: '300×300, 450×450, 600×600 (face sizes)',
        drawing_symbol: 'Square with 4 outward arrows',
        count_rule: 'Count from RCP or schedule. Note size and neck diameter.'
      },
      two_way_diffuser: {
        name: '2-Way Ceiling Diffuser',
        function: 'Distributes supply air in two opposite directions',
        drawing_symbol: 'Square with 2 outward arrows (opposite sides)',
        count_rule: 'Count from RCP or schedule. Note size.'
      },
      linear_diffuser: {
        name: 'Linear Slot Diffuser',
        function: 'Continuous linear supply along a ceiling edge or bulkhead',
        typical_sizes: '1-slot, 2-slot, 3-slot, 4-slot. Lengths vary (600mm to 3000mm+ sections)',
        measurement: 'm (linear metres) of diffuser length, noting number of slots',
        drawing_symbol: 'Long thin rectangle along ceiling edge',
        count_rule: 'Measure total length (m) or count sections (nr). Note slot count. Check schedule.'
      },
      swirl_diffuser: {
        name: 'Swirl Diffuser',
        function: 'Creates swirling air pattern for rapid mixing in high-ceiling spaces',
        typical_sizes: 'Ø200 to Ø630',
        drawing_symbol: 'Circle with curved arrows',
        count_rule: 'Count from RCP or schedule. Note size.'
      },
      jet_nozzle: {
        name: 'Jet Nozzle',
        function: 'Long-throw supply for large open spaces (atria, sports halls)',
        count_rule: 'Count from drawings. Note size and throw distance. Usually shown on GA, not RCP.',
        note: 'Specialist item — check air terminal schedule for manufacturer and model.'
      },
      displacement_diffuser: {
        name: 'Floor/Low-Level Displacement Diffuser',
        function: 'Low-velocity supply at floor level for displacement ventilation',
        count_rule: 'Count from floor plan. Note type (floor swirl, wall-mounted, under-seat).',
        note: 'Displacement systems have different duct routing than conventional (supply at low level, extract at high level).'
      }
    },

    return_extract: {
      return_grille: {
        name: 'Return Air Grille',
        function: 'Ceiling or wall-mounted grille for return air path to AHU',
        typical_sizes: '300×300, 450×300, 600×300, 600×600',
        drawing_symbol: 'Square with X pattern (crossed diagonals) or parallel bars',
        count_rule: 'Count from RCP or schedule. Note size and mounting (ceiling/wall).'
      },
      extract_grille: {
        name: 'Extract/Exhaust Grille',
        function: 'Grille for extract air — similar to return grille but on extract system (air exhausted to outside)',
        count_rule: 'Count from RCP or schedule. Note size and system (WC extract, kitchen extract, general extract).',
        note: 'Distinguish between RETURN (air recirculated back to AHU) and EXTRACT (air exhausted to atmosphere). Check system type on drawing.'
      },
      transfer_grille: {
        name: 'Transfer Grille',
        function: 'Allows air to pass between rooms (typically from corridor to office or from room to ceiling void) — not connected to ductwork',
        count_rule: 'Count from door schedule or GA drawing. Note size.',
        note: 'Transfer grilles are NOT connected to ductwork. They are typically in doors, walls, or ceilings. May be fire-rated if in fire compartment boundary.'
      },
      eave_grille: {
        name: 'External Louvre / Weather Louvre',
        function: 'External air intake or exhaust termination — protects duct from weather ingress',
        count_rule: 'Count from elevation drawings or schedule. Note size and material (aluminium standard).',
        note: 'External louvres may require: bird mesh, insect screen, penthouse hood. Check spec for requirements.'
      }
    },

    schedule_priority: 'If an air terminal schedule exists, use it as the AUTHORITATIVE source for type, size, quantity, and location. Cross-reference with RCP drawing to verify positions.'
  },

  /* ══════════════════════════════════════════════════════════════
     5. AIR HANDLING PLANT
     ══════════════════════════════════════════════════════════════ */
  plant: {
    unit: 'nr (count individually with full specification)',
    rule: 'Equipment items must include specification from the equipment schedule. If no schedule, extract what is shown on drawings and flag for spec confirmation.',

    types: {
      ahu: {
        name: 'Air Handling Unit (AHU)',
        function: 'Central air processing unit — filters, heats, cools, and distributes air',
        specification_required: ['Airflow capacity (m³/hr or l/s)', 'Heating coil (LTHW/electric/none)', 'Cooling coil (ChW/DX/none)', 'Filter grades (G4, F7, F9, HEPA)', 'Heat recovery type (plate, rotary, run-around)', 'Fan type and motor (kW)', 'Sound attenuation'],
        drawing_notations: ['AHU', 'AHU-01', 'Air Handling Unit'],
        count_rule: 'Count every AHU. Note reference number, location, and capacity from schedule.',
        associated_items: 'Flexible connections (duct + pipe), isolation valves, control valves, strainers, drain points, vibration mounts.'
      },
      fcu: {
        name: 'Fan Coil Unit (FCU)',
        function: 'Local air conditioning unit — heats and/or cools air in individual zones',
        configuration: {
          two_pipe: '2-pipe — heating OR cooling (changeover system). One coil, flow+return.',
          four_pipe: '4-pipe — simultaneous heating AND cooling. Two coils (heating + cooling), 4 pipe connections.',
          electric_reheat: '2-pipe cooling + electric heater. Cooling coil on ChW, supplementary electric heat.'
        },
        mounting: {
          ceiling_concealed: 'Horizontal, above ceiling — most common commercial',
          ceiling_exposed: 'Horizontal, below ceiling — visible unit',
          wall_mounted: 'Vertical, wall-mounted — perimeter units',
          floor_standing: 'Vertical, floor-mounted — under window or in cupboard'
        },
        specification_required: ['Capacity (kW heating/cooling)', 'Configuration (2-pipe/4-pipe)', 'Mounting type', 'Airflow (l/s)', 'EC or AC motor'],
        drawing_notations: ['FCU', 'FC', 'Fan Coil', 'FCU-01'],
        count_rule: 'Count every FCU. Note reference, configuration, mounting, and capacity from schedule.',
        note: 'FCUs connect to both ductwork (supply/return air) AND pipework (CHW/LTHW). Count both connections.'
      },
      mvhr: {
        name: 'MVHR / Heat Recovery Unit',
        function: 'Mechanical Ventilation with Heat Recovery — extracts stale air and recovers heat to incoming fresh air',
        specification_required: ['Airflow (l/s or m³/hr)', 'Heat recovery efficiency (%)', 'Type (counterflow, rotary, enthalpy)', 'Summer bypass'],
        drawing_notations: ['MVHR', 'HRV', 'MHRV', 'heat recovery'],
        count_rule: 'Count every unit. Note capacity and recovery efficiency.',
        note: 'Common in residential and small commercial. 4 duct connections: fresh air in, supply to rooms, extract from rooms, exhaust out.'
      },
      extract_fan: {
        name: 'Extract Fan',
        function: 'Extracts air from a space to outside — WC extract, kitchen extract, general extract',
        types: {
          centrifugal: 'Centrifugal — for higher pressure systems, duct-mounted or external',
          axial: 'Axial — for low-pressure, wall/window mounted or inline',
          mixed_flow: 'Mixed flow — compact, moderate pressure, inline mounting',
          roof_mounted: 'Roof-mounted upblast — kitchen extract, general extract'
        },
        specification_required: ['Airflow (l/s or m³/hr)', 'External static pressure (Pa)', 'Motor (kW)', 'Type (centrifugal/axial/mixed flow)', 'Mounting (inline/roof/wall)'],
        drawing_notations: ['EF', 'extract fan', 'TEF (toilet extract fan)', 'KEF (kitchen extract fan)'],
        count_rule: 'Count every fan. Note reference, type, capacity.',
        note: 'Extract fans require: electrical supply, isolator, controls. Cross-reference KB-E for electrical items.'
      },
      inline_fan: {
        name: 'Inline Fan / Duct-Mounted Fan',
        function: 'Boosts airflow in a duct run — installed within the ductwork',
        specification_required: ['Airflow (l/s)', 'Diameter or duct size', 'Motor (kW)'],
        drawing_notations: ['IF', 'inline fan', 'duct fan', 'booster fan'],
        count_rule: 'Count every fan. Note size (diameter matches duct).',
        note: 'Inline fans need flexible connections either side to isolate vibration.'
      },
      attenuator: {
        name: 'Acoustic Attenuator / Silencer',
        function: 'Reduces noise in ductwork — typically after fans or before terminal devices in noise-sensitive areas',
        measurement: 'nr — count individually. Note length (typically 600mm, 900mm, 1200mm, 1500mm) and duct size.',
        drawing_notations: ['ATT', 'attenuator', 'silencer', 'acoustic'],
        count_rule: 'Count every attenuator. Note duct size and attenuator length.',
        note: 'Attenuators cause pressure drop — check if designer has accounted for this in fan selection.'
      }
    }
  },

  /* ══════════════════════════════════════════════════════════════
     6. VRF / VRV SYSTEMS
     ══════════════════════════════════════════════════════════════ */
  vrf: {
    description: 'Variable Refrigerant Flow (VRF) / Variable Refrigerant Volume (VRV) — direct expansion air conditioning system using refrigerant instead of chilled water.',
    note: 'VRF is the generic term. VRV is Daikin\'s trademark. Functionally identical.',

    outdoor_unit: {
      name: 'VRF Outdoor Unit (ODU)',
      function: 'Compressor and heat exchanger unit — located externally (roof, ground, plant area)',
      specification_required: ['Cooling capacity (kW)', 'Heating capacity (kW)', 'Refrigerant type (R410A, R32)', 'COP/EER rating', 'Sound level (dB)', 'Phase (single/three)'],
      drawing_notations: ['ODU', 'VRF outdoor', 'VRV outdoor', 'condensing unit'],
      count_rule: 'Count every outdoor unit. Note reference and capacity (kW) from schedule.',
      note: 'Outdoor units need: concrete plinth or structural frame, electrical supply (usually three-phase), controls wiring, refrigerant pipe connections.'
    },
    indoor_unit: {
      name: 'VRF Indoor Unit (IDU)',
      function: 'Room-level heating/cooling unit connected to outdoor unit by refrigerant piping',
      types: {
        cassette: 'Ceiling cassette (4-way blow) — recessed in ceiling. Most common commercial.',
        ducted: 'Ducted — concealed above ceiling with ductwork to diffusers. Higher-end installations.',
        wall_mounted: 'Wall-mounted split — residential and small commercial.',
        floor_standing: 'Floor-standing — perimeter heating/cooling under windows.',
        ceiling_suspended: 'Ceiling-suspended — exposed below ceiling. Low void height installations.'
      },
      specification_required: ['Cooling capacity (kW)', 'Heating capacity (kW)', 'Type (cassette/ducted/wall/floor)', 'Airflow (l/s)'],
      drawing_notations: ['IDU', 'VRF indoor', 'VRV indoor', 'cassette', 'FCU (sometimes used incorrectly for VRF indoor units)'],
      count_rule: 'Count every indoor unit. Note reference, type, and capacity from schedule.',
      note: 'Indoor units connect to refrigerant piping (NOT water pipes). Condensate drain required for each unit.'
    },
    refrigerant_pipework: {
      name: 'Refrigerant Pipework',
      measurement: 'm (linear metres). TWO pipes per run: liquid line (small) and suction/gas line (large).',
      sizes: {
        liquid: 'Smaller diameter — typically 6.35mm (1/4") to 15.88mm (5/8") OD copper',
        suction: 'Larger diameter — typically 12.7mm (1/2") to 28.58mm (1-1/8") OD copper',
        note: 'Exact sizes depend on system capacity and pipe run length. Check manufacturer sizing tables.'
      },
      material: 'ACR grade copper (cleaned and dehydrated for refrigerant use). NOT standard plumbing copper.',
      jointing: 'Brazed (silver solder) or flared connections. Press-fit NOT suitable for refrigerant.',
      count_rule: 'Measure total route length. Count as TWO pipe runs (liquid + suction). Note both diameters.',
      insulation: 'BOTH liquid and suction lines MUST be insulated. Cross-reference KB-I01 for insulation specification.',
      associated_items: ['Branch selectors / Y-joints (nr — at each split from main to branches)', 'Condensate drain pipe (m — from each indoor unit to nearest drain)', 'Refrigerant charge (kg — additional charge for long pipe runs beyond factory charge)']
    },
    controls: {
      items: ['Wired remote controller per zone (nr)', 'Central controller / BMS interface (nr)', 'Branch selector boxes (nr — 2-pipe heat recovery systems)'],
      note: 'VRF control wiring is typically by the VRF installer. Cross-reference with electrical scope to avoid double-counting.'
    }
  }
};

module.exports = KB_M03;
