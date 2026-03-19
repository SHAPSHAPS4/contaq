/**
 * KB-E02: Cable Containment
 *
 * Structured lookup tables for cable tray, ladder, trunking,
 * conduit, busbar, containment sizing rules, segregation,
 * and support/fixing allowances.
 * Injected into extraction prompts at runtime.
 *
 * Part of Contraq M&E Knowledge Base v6.0
 * Source: BS 7671 (18th Ed), BS EN 61537, IET Guidance, UK M&E practice
 */

const KB_E02 = {
  id: 'KB-E02',
  title: 'Cable Containment',
  version: '1.0',
  date: '2026-03-19',

  /* ══════════════════════════════════════════════════════════════
     1. CABLE TRAY
     ══════════════════════════════════════════════════════════════ */
  cable_tray: {
    name: 'Cable Tray',
    measurement: { unit: 'm (linear metres)', note: 'Always state WIDTH with measurement.' },
    description: 'Open-top channel for supporting cables. Cables laid on tray surface, not enclosed.',
    standard: 'BS EN 61537',
    types: {
      perforated: {
        name: 'Perforated Cable Tray',
        description: 'Standard tray with punched holes in base. Allows cable ties and ventilation.',
        use: 'Most common type. Standard for internal commercial installations.'
      },
      solid_bottom: {
        name: 'Solid Bottom Cable Tray',
        description: 'No perforations — enclosed base. Better EMC screening.',
        use: 'Data centres, areas requiring electromagnetic screening, external (with lid).'
      },
      basket: {
        name: 'Wire Mesh / Basket Tray',
        description: 'Open wire mesh construction. Lightweight, excellent ventilation.',
        use: 'Data cables, ceiling voids, lightweight cable runs. Popular for Cat6/Cat6A installations.'
      },
      return_flange: {
        name: 'Return Flange Tray',
        description: 'Tray edges turned inward for safety and cable retention.',
        use: 'Where cables might be disturbed or in accessible areas.'
      }
    },
    widths_mm: [
      { width: 50, typical_use: 'Single cable run, small final circuit' },
      { width: 75, typical_use: 'Small cable runs, branch tray' },
      { width: 100, typical_use: 'Small distribution' },
      { width: 150, typical_use: 'Branch distribution, small riser' },
      { width: 200, typical_use: 'Medium distribution' },
      { width: 300, typical_use: 'Standard distribution — most common commercial size' },
      { width: 450, typical_use: 'Main distribution, sub-main routes' },
      { width: 600, typical_use: 'Main distribution, heavy cable loads' },
      { width: 750, typical_use: 'Major distribution, plant rooms' },
      { width: 900, typical_use: 'Largest standard — major plant rooms, switchroom exits' }
    ],
    materials: {
      pre_galvanised: 'Pre-galvanised steel — standard for internal use. Most common and cost-effective.',
      hot_dip_galvanised: 'Hot-dip galvanised steel — external use, corrosive environments. Thicker zinc coating.',
      stainless_steel: 'Stainless steel — food/pharmaceutical, coastal, highly corrosive environments. 3-5× cost of standard.',
      grp: 'GRP (Glass Reinforced Plastic) — chemical plants, swimming pools, extreme corrosion. Non-conductive.',
      aluminium: 'Aluminium — lightweight, corrosion resistant. External or weight-sensitive applications.'
    },
    loading: {
      light_duty: 'Light duty — small cables, data. Lower gauge steel.',
      medium_duty: 'Medium duty — standard power cables. Standard gauge.',
      heavy_duty: 'Heavy duty — heavy SWA cables, plant rooms, risers. Thicker gauge, closer support centres.',
      note: 'If spec says "heavy duty" or "extra heavy duty", flag for cost — heavier tray is significantly more expensive.'
    },
    fittings: {
      unit: 'nr (count individually)',
      types: {
        flat_bend: { name: 'Flat Bend (90° or 45°)', count_rule: 'Count at every horizontal direction change.' },
        tee: { name: 'Tee', count_rule: 'Count at every branch junction.' },
        cross: { name: 'Cross', count_rule: 'Count where two trays cross at right angles.' },
        reducer: { name: 'Reducer', count_rule: 'Count at every width change. Note both widths.' },
        riser_bend: { name: 'Riser Bend (internal/external)', count_rule: 'Count at every vertical direction change (floor/ceiling transitions).' },
        coupler: { name: 'Coupler / Splice Plate', count_rule: 'Generally included in tray rate (every 3m joint). Only count separately if spec requires special couplers.' },
        end_cap: { name: 'End Cap / Stop End', count_rule: 'Count at every tray termination.' },
        lid: { name: 'Tray Lid / Cover', count_rule: 'Measured in m (same length as tray). Only if specified — not standard.' }
      }
    },
    drawing_notations: ['CT', 'cable tray', 'tray', 'perforated tray', 'basket tray', 'wire mesh']
  },

  /* ══════════════════════════════════════════════════════════════
     2. CABLE LADDER
     ══════════════════════════════════════════════════════════════ */
  cable_ladder: {
    name: 'Cable Ladder',
    measurement: { unit: 'm (linear metres)', note: 'State WIDTH and RUNG SPACING.' },
    description: 'Heavy-duty open construction with side rails and cross rungs. For large/heavy cable installations.',
    types: {
      standard: 'Standard cable ladder — galvanised steel side rails with rungs at regular spacing.',
      heavy_duty: 'Heavy duty — thicker gauge, closer rung spacing. For very heavy cable loads.',
      aluminium: 'Aluminium ladder — lightweight, corrosion resistant. External or weight-sensitive.'
    },
    widths_mm: [
      { width: 300, typical_use: 'Branch routes, small risers' },
      { width: 450, typical_use: 'Standard distribution' },
      { width: 600, typical_use: 'Main distribution — most common size' },
      { width: 750, typical_use: 'Heavy distribution, main risers' },
      { width: 900, typical_use: 'Major distribution, switchroom exits' }
    ],
    rung_spacing_mm: {
      '300mm': 'Standard — suitable for most cable sizes.',
      '150mm': 'Close-spaced — for smaller cables that might sag between rungs.',
      note: 'Spec should state rung spacing. If not stated, default to 300mm and flag.'
    },
    materials: {
      pre_galvanised: 'Standard internal use.',
      hot_dip_galvanised: 'External, industrial, corrosive environments.',
      stainless_steel: 'Food, pharmaceutical, coastal.',
      aluminium: 'Lightweight, external.',
      frp: 'Fibre Reinforced Plastic — chemical plants, non-conductive requirement.'
    },
    fittings: {
      unit: 'nr',
      types: {
        flat_bend: { name: 'Flat Bend (90° / 45°)', count_rule: 'Count at every horizontal direction change.' },
        tee: { name: 'Tee Piece', count_rule: 'Count at every branch junction.' },
        reducer: { name: 'Reducer', count_rule: 'Count at every width change.' },
        riser: { name: 'Riser Section', count_rule: 'Count at every vertical transition.' },
        end_plate: { name: 'End Plate', count_rule: 'Count at every ladder termination.' }
      }
    },
    drawing_notations: ['CL', 'cable ladder', 'ladder rack', 'ladder tray'],
    note: 'Cable ladder is heavier and more expensive than cable tray. Used where cable load exceeds tray capacity or where cables are very large (>70mm² SWA).'
  },

  /* ══════════════════════════════════════════════════════════════
     3. TRUNKING
     ══════════════════════════════════════════════════════════════ */
  trunking: {
    name: 'Trunking',
    measurement: { unit: 'm (linear metres)', note: 'State dimensions W × H in mm.' },
    description: 'Fully enclosed rectangular channel with removable lid. Provides mechanical protection and neat appearance.',

    types: {
      standard: {
        name: 'Standard Steel Trunking',
        description: 'Galvanised steel, screw-on or snap-fit lid. Wall or ceiling mounted.',
        use: 'Distribution runs in plant rooms, risers, behind panels. Where neat cable routing and protection needed.',
        material: 'Pre-galvanised steel (standard), powder-coated (decorative areas).'
      },
      dado: {
        name: 'Dado / Skirting Trunking',
        description: 'Wall-mounted at desk height. Multiple compartments for power, data, comms.',
        use: 'Office perimeter power and data distribution. Wall-mounted at 300mm or desk height.',
        note: 'Dado trunking often has 2 or 3 compartments — power, data, spare. Count as single trunking run but note compartments.'
      },
      floor: {
        name: 'Floor Trunking / Underfloor Trunking',
        description: 'Recessed into or laid on floor screed. Covered with floor finish.',
        use: 'Open-plan offices, trading floors. Provides power/data to floor boxes.',
        note: 'Requires builder\'s work to install (screed recess). Cross-reference with floor boxes (nr).'
      },
      mini: {
        name: 'Mini Trunking',
        description: 'Small PVC trunking for surface-mounted final circuits.',
        use: 'Final wiring to sockets, switches in refurbishment. Surface-mounted on finished walls.',
        sizes: '16×16, 25×16, 38×16, 38×25, 50×25mm',
        material: 'PVC (white standard, other colours available).'
      },
      fire_rated: {
        name: 'Fire-Rated Trunking',
        description: 'Steel trunking with fire-rated coating or construction for life safety cable routes.',
        use: 'Fire alarm cable routes, emergency lighting routes where separate containment is required.',
        note: 'Alternative to running FP cables on separate fire-rated clips. Check spec for preference.'
      }
    },

    sizes_mm: [
      { w: 50, h: 50, typical_use: 'Small runs, final distribution' },
      { w: 75, h: 50, typical_use: 'Small distribution' },
      { w: 75, h: 75, typical_use: 'Medium distribution' },
      { w: 100, h: 50, typical_use: 'Medium, single layer cables' },
      { w: 100, h: 75, typical_use: 'Standard distribution — very common size' },
      { w: 100, h: 100, typical_use: 'Standard distribution, multiple circuits' },
      { w: 150, h: 50, typical_use: 'Wider distribution, single layer' },
      { w: 150, h: 75, typical_use: 'Main distribution' },
      { w: 150, h: 100, typical_use: 'Main distribution, sub-main routes' },
      { w: 150, h: 150, typical_use: 'Heavy distribution, plant room' },
      { w: 225, h: 75, typical_use: 'Wide distribution, multiple parallel circuits' },
      { w: 225, h: 100, typical_use: 'Major distribution' },
      { w: 300, h: 75, typical_use: 'Major distribution, riser trunking' },
      { w: 300, h: 100, typical_use: 'Main riser trunking' }
    ],

    fittings: {
      unit: 'nr',
      types: {
        internal_bend: { name: 'Internal Bend (90°)', count_rule: 'Count at inside corners.' },
        external_bend: { name: 'External Bend (90°)', count_rule: 'Count at outside corners.' },
        flat_bend: { name: 'Flat Bend (90° / 45°)', count_rule: 'Count at horizontal direction changes.' },
        tee: { name: 'Tee', count_rule: 'Count at every branch.' },
        crossover: { name: 'Crossover', count_rule: 'Count where one trunking crosses another.' },
        reducer: { name: 'Reducer', count_rule: 'Count at every size change.' },
        end_cap: { name: 'End Cap', count_rule: 'Count at every termination.' },
        coupler: { name: 'Coupler', count_rule: 'Every joint (typically every 3m). Usually included in rate.' }
      }
    },
    drawing_notations: ['TRK', 'trunking', 'cable trunking', 'dado', 'mini trunking', 'skirting trunking']
  },

  /* ══════════════════════════════════════════════════════════════
     4. CONDUIT
     ══════════════════════════════════════════════════════════════ */
  conduit: {
    name: 'Conduit',
    measurement: { unit: 'm (linear metres)', note: 'State DIAMETER and TYPE (rigid/flexible, steel/PVC).' },
    description: 'Tube for routing and protecting individual cables. Available in rigid and flexible types.',

    types: {
      rigid_steel: {
        name: 'Rigid Steel Conduit (Heavy Gauge)',
        standard: 'BS EN 61386-21',
        material: 'Galvanised steel (Class 4 — welded, screwed)',
        use: 'Exposed areas, plant rooms, industrial, external. Provides mechanical protection and earth continuity.',
        note: 'Steel conduit can act as CPC (earth conductor) if properly installed with bonding at each joint.'
      },
      rigid_pvc: {
        name: 'Rigid PVC Conduit',
        standard: 'BS EN 61386-22',
        material: 'Impact-resistant PVC (grey or white)',
        use: 'Concealed in walls/ceilings (domestic/light commercial). Surface-mounted in non-industrial areas.',
        note: 'Cannot act as CPC — separate earth conductor required. Cheaper than steel but less mechanical protection.'
      },
      flexible_steel: {
        name: 'Flexible Steel Conduit (Copex)',
        material: 'Interlocked galvanised steel strip, often with PVC outer sheath',
        use: 'Final connections to equipment, motors, luminaires. Where vibration or movement expected.',
        note: 'Not a substitute for rigid conduit over long runs. Used for last 300-600mm to equipment.'
      },
      flexible_pvc: {
        name: 'Flexible PVC Conduit (Corrugated)',
        material: 'Corrugated PVC tube',
        use: 'Concealed in concrete slabs, embedded in screed, lightweight final connections.',
        note: 'Often cast into concrete slabs during construction for power/data routes to floor boxes.'
      },
      fire_rated: {
        name: 'Fire-Rated Conduit',
        description: 'Steel conduit with fire-rated fixings — used for fire alarm and emergency lighting final connections.',
        note: 'Steel conduit provides inherent fire protection. With appropriate clips, it meets BS 8519 requirements.'
      }
    },

    diameters_mm: [
      { dia: 16, typical_use: 'Minimum size. Lighting circuits, single small cables.' },
      { dia: 20, typical_use: 'Standard for most final circuits. 1-3 small cables.' },
      { dia: 25, typical_use: 'Larger final circuits. Multiple cables or larger conductors.' },
      { dia: 32, typical_use: 'Sub-distribution. Multiple larger cables.' },
      { dia: 50, typical_use: 'Main feeds, multiple large cables. Less common — trunking often preferred at this size.' }
    ],

    fittings: {
      unit: 'nr',
      types: {
        junction_box: {
          name: 'Conduit Junction Box / Through Box',
          variants: ['1-way (terminal)', '2-way (through)', '3-way (tee)', '4-way (cross)'],
          count_rule: 'Count at every junction, direction change, and termination. Maximum 2 right-angle bends between boxes per BS 7671.',
          note: 'Junction box at every direction change is the standard installation method. This generates significant fitting counts.'
        },
        bend: { name: 'Conduit Bend (90° / 45°)', count_rule: 'Count if pre-formed bend used. Alternatively, field-bent (steel) with no separate fitting.' },
        coupler: { name: 'Coupler', count_rule: 'At every joint (typically every 3.75m for steel, 3m for PVC).' },
        adaptor: { name: 'Male/Female Adaptor', count_rule: 'At equipment and trunking connections.' },
        saddle: { name: 'Spacer Bar Saddle / Clip', count_rule: 'See support section — every 0.75-1.0m.' },
        gland: { name: 'Cable Gland', count_rule: 'At equipment entry points. Count every conduit-to-equipment connection.' }
      }
    },
    drawing_notations: ['CDT', 'conduit', 'rigid conduit', 'flex conduit', 'Copex', '20mm conduit', '25mm CDT']
  },

  /* ══════════════════════════════════════════════════════════════
     5. BUSBAR TRUNKING
     ══════════════════════════════════════════════════════════════ */
  busbar: {
    name: 'Busbar Trunking',
    measurement: { unit: 'm (linear metres)', note: 'State CURRENT RATING (A) and CONDUCTOR MATERIAL.' },
    description: 'Prefabricated copper or aluminium conductors in a protective housing. Alternative to large cable for high-current distribution.',

    applications: ['Rising mains (vertical distribution in multi-storey buildings)', 'Floor-to-floor power distribution', 'Large open-plan floor distribution (lighting busbar)', 'Industrial power distribution', 'Data centre power rows'],

    ratings_A: [
      { rating: 100, typical_use: 'Lighting distribution (lighting busbar / tap-off system)' },
      { rating: 160, typical_use: 'Small power distribution' },
      { rating: 250, typical_use: 'Floor distribution, small rising main' },
      { rating: 400, typical_use: 'Rising main (small-medium building)' },
      { rating: 630, typical_use: 'Rising main (medium building)' },
      { rating: 800, typical_use: 'Rising main (medium-large building)' },
      { rating: 1000, typical_use: 'Rising main (large building)' },
      { rating: 1250, typical_use: 'Main distribution' },
      { rating: 1600, typical_use: 'Main distribution (large building)' },
      { rating: 2000, typical_use: 'Main distribution' },
      { rating: 2500, typical_use: 'Main incoming (large building)' },
      { rating: 3200, typical_use: 'Main incoming (very large building)' },
      { rating: 4000, typical_use: 'Major infrastructure / data centre' },
      { rating: 5000, typical_use: 'Major infrastructure' }
    ],

    conductor_material: {
      copper: 'Standard — higher conductivity, smaller cross-section for same rating. More expensive material.',
      aluminium: 'Lighter, cheaper material but larger cross-section needed. Increasingly common for cost reasons.'
    },

    fittings: {
      unit: 'nr (count individually — busbar fittings are high-value items)',
      types: {
        end_feed: {
          name: 'End Feed Box / Feed Unit',
          function: 'Connection from incoming cable to busbar system. One per busbar run.',
          count_rule: 'Count 1nr per busbar run. Note cable entry size.'
        },
        centre_feed: {
          name: 'Centre Feed Box',
          function: 'Cable connection at mid-point of busbar. Allows shorter volt drop.',
          count_rule: 'Count if shown. Less common than end feed.'
        },
        tap_off: {
          name: 'Tap-Off Box / Plug-In Unit',
          function: 'Branch connection from busbar to local DB or load. Plugs into busbar at any point.',
          variants: ['Fused tap-off (with fuse/MCCB)', 'Unfused tap-off (direct connection)', 'Metered tap-off (with energy meter)'],
          count_rule: 'Count EVERY tap-off unit. Note type (fused/unfused), rating (A), and whether metered. High-value items.',
          note: 'Tap-off boxes are the main cost driver for busbar systems — count carefully.'
        },
        elbow: {
          name: 'Elbow / Bend',
          function: 'Direction change in busbar route',
          variants: ['Flat elbow (horizontal 90°)', 'Vertical elbow (riser turn)', 'Offset section'],
          count_rule: 'Count at every direction change. Busbar elbows are expensive fabricated items.'
        },
        fire_barrier: {
          name: 'Fire Barrier',
          function: 'Fire stopping within busbar at floor penetrations',
          count_rule: 'Count 1nr at EVERY floor penetration. Fire-rated to match floor rating.',
          note: 'Often missed in takeoffs — every riser penetration needs a fire barrier.'
        },
        end_cap: { name: 'End Cap / End Closure', count_rule: 'Count at every busbar termination.' },
        expansion_joint: { name: 'Expansion Joint', count_rule: 'Count on long runs (typically every 20-30m) or where thermal movement expected.' }
      }
    },

    drawing_notations: ['BBT', 'busbar', 'bus duct', 'rising main', 'tap-off', 'plug-in busbar'],
    note: 'Busbar is a PREMIUM system — 2-5× cost of equivalent cable installation. Only used where high current capacity, multiple tap-off points, or flexibility of connection is needed. Check spec justification.'
  },

  /* ══════════════════════════════════════════════════════════════
     6. CONTAINMENT SIZING & SEGREGATION RULES
     ══════════════════════════════════════════════════════════════ */
  sizing_rules: {
    fill_capacity: {
      rule: 'Containment size indicates maximum cable capacity. Do NOT estimate cable quantities from containment size alone.',
      max_fill: {
        tray: '50% fill maximum (cables side by side, single layer preferred for derating). Tray width ÷ cable diameters.',
        trunking: '45% of cross-sectional area (BS 7671 Table 4C1).',
        conduit: '40% of cross-sectional area — maximum for easy cable pulling.',
        note: 'Fill percentages are MAXIMUM. Spec may require more spare capacity.'
      },
      spare_capacity: {
        typical: '30-40% spare capacity commonly specified for future additions.',
        note: 'If spec states spare capacity %, apply it. If not stated, assume 30% spare and flag.',
        flag_if: 'Containment appears undersized for the cables shown — flag for design check.'
      }
    },

    segregation: {
      rule: 'BS 7671 requires segregation between certain cable types to prevent interference and maintain fire safety.',
      categories: {
        lv_power: {
          name: 'LV Power (Band II)',
          cables: 'Mains power cables (230V/400V), lighting, small power, motor feeds',
          segregation: 'Can share containment with other Band II cables. Must be segregated from ELV and fire alarm.'
        },
        elv_data: {
          name: 'ELV / Data (Band I)',
          cables: 'Cat5e/6/6A, fibre, telephone, BMS, CCTV, intercom',
          segregation: 'Must be segregated from LV power. Separate tray/trunking/compartment required.',
          note: 'Data cables near power cables suffer electromagnetic interference (crosstalk). Physical separation is essential.'
        },
        fire_alarm: {
          name: 'Fire Alarm / Life Safety',
          cables: 'FP200, MICC, emergency lighting, voice alarm, smoke vent controls',
          segregation: 'MUST be in dedicated containment or on dedicated fire-rated clips. NEVER share containment with LV power or ELV.',
          note: 'This is a LIFE SAFETY requirement. Fire alarm cables in shared containment is a BS 5839 / BS 8519 non-compliance. Always flag.'
        }
      },
      flag_triggers: [
        'Fire alarm cables shown sharing tray/trunking with power cables — flag as non-compliant.',
        'Data cables shown on same tray as power cables without segregation barrier — flag.',
        'No separate containment shown for fire alarm system — flag.',
        'Single trunking shown serving power AND data without compartments — flag.'
      ],
      solutions: [
        'Separate trays (one for power, one for data, one for fire alarm)',
        'Compartmentalised trunking (multi-compartment dado/skirting)',
        'Segregation barrier on shared tray (metal divider)',
        'Dedicated fire-rated clips for fire alarm (no containment needed if BS 8519 clips used)'
      ]
    }
  },

  /* ══════════════════════════════════════════════════════════════
     7. SUPPORT & FIXING
     ══════════════════════════════════════════════════════════════ */
  supports: {
    rule: 'Support quantities are based on standard spacing. Adjust if spec requires closer centres or if loading requires it.',

    cable_tray: {
      spacing: '1.5m',
      supports_per_m: 0.67,
      types: {
        cantilever: 'Cantilever bracket from wall — standard for single tray.',
        trapeze: 'Trapeze (two threaded rods + crossbar) from ceiling — for suspended tray.',
        strut_channel: 'Unistrut/Superstrut channel system — versatile, adjustable.',
        floor_stand: 'Floor-mounted stand — for tray on floor in plant rooms/risers.'
      },
      note: 'Heavy-duty tray or tray with heavy cable loads may need closer support centres (1.0m or 1.2m). Check spec.'
    },
    cable_ladder: {
      spacing: '1.5m',
      supports_per_m: 0.67,
      types: 'Same as cable tray. Ladder brackets are typically heavier gauge.',
      note: 'Ladder supports carry higher loads — check structural capacity of fixing points.'
    },
    trunking: {
      spacing: '1.0m',
      supports_per_m: 1.0,
      types: {
        clip: 'Trunking clip/saddle — surface-mounted. Standard for wall/ceiling fixing.',
        bracket: 'Angle bracket — for heavier trunking.',
        channel: 'Channel/strut system — for suspended trunking.'
      },
      note: 'Mini trunking: every 0.6m. Dado trunking: every 0.6-0.8m (wall-mounted, closer centres needed).'
    },
    conduit: {
      rigid: {
        spacing: '0.75m',
        supports_per_m: 1.33,
        type: 'Spacer bar saddle (steel conduit), snap-in clip (PVC conduit).',
        note: 'Steel conduit maximum spacing per BS 7671: 0.75m horizontal, 1.0m vertical.'
      },
      flexible: {
        spacing: '0.5m',
        supports_per_m: 2.0,
        type: 'P-clip, cable tie to structure.',
        note: 'Flexible conduit must be supported at closer centres to prevent sagging and maintain minimum bend radius.'
      }
    },
    busbar: {
      spacing: '1.5-2.0m',
      supports_per_m: 0.57,
      types: {
        wall_bracket: 'Wall brackets for vertical rising main.',
        ceiling_hanger: 'Ceiling hangers for horizontal runs.',
        floor_stand: 'Floor-mounted supports in plant rooms.'
      },
      note: 'Busbar manufacturer specifies support centres — use manufacturer data if available.'
    },
    threaded_rod: {
      sizes: {
        M8: 'Light duty — mini trunking, lightweight tray.',
        M10: 'Standard — cable tray, small trunking.',
        M12: 'Heavy duty — cable ladder, large trunking, busbar.',
        M16: 'Extra heavy duty — very large/heavy installations.'
      },
      note: 'Threaded rod length depends on ceiling void depth. If void depth not known, flag and use provisional length (e.g. 500mm).',
      accessories: 'Each rod needs: 2× nuts + 2× washers + 1× drop-in anchor or beam clamp. Count as part of support item.'
    }
  }
};

module.exports = KB_E02;
