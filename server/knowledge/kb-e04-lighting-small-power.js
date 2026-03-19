/**
 * KB-E04: Lighting & Small Power
 *
 * Structured reference for luminaire types, emergency lighting,
 * lighting controls, small power outlets, and specialist power.
 * Injected into extraction prompts at runtime.
 *
 * Part of Contraq M&E Knowledge Base v6.2
 * Source: BS 5266, BS 7671, CIBSE SLL, IET, UK M&E practice
 */

const KB_E04 = {
  id: 'KB-E04',
  title: 'Lighting & Small Power',
  version: '1.0',
  date: '2026-03-19',

  /* ══════════════════════════════════════════════════════════════
     1. LIGHT FITTINGS
     ══════════════════════════════════════════════════════════════ */
  luminaires: {
    unit: 'nr (ALWAYS count from luminaire schedule if available)',
    rule: 'The luminaire schedule is the AUTHORITATIVE source for fitting type, quantity, wattage, and location. If no schedule, count from reflected ceiling plan (RCP). Never estimate luminaire quantities from GA floor plans alone.',

    types: {
      recessed_downlight: {
        name: 'Recessed Downlight',
        mounting: 'Recessed into ceiling tile or plasterboard',
        description: 'Compact circular or square fitting recessed flush with ceiling. LED standard.',
        typical_use: 'Offices, corridors, reception areas, retail. Most common commercial fitting type.',
        specification_notes: ['Wattage (W)', 'Colour temperature (3000K warm, 4000K neutral)', 'Lumen output (lm)', 'Beam angle (narrow/medium/wide)', 'Cut-out size (mm)', 'IP rating (IP20 standard, IP44/IP65 for wet areas)', 'UGR (Unified Glare Rating)', 'CRI (Colour Rendering Index — 80+ standard, 90+ retail/healthcare)'],
        drawing_symbol: 'Circle (often with size annotation or reference tag)',
        drawing_notations: ['DL', 'downlight', 'recessed DL', 'LED downlight']
      },
      surface_downlight: {
        name: 'Surface Downlight / Surface Mount',
        mounting: 'Surface-mounted to ceiling (no recess required)',
        description: 'Similar to recessed but sits below ceiling surface. Used where void is insufficient for recessing.',
        typical_use: 'Exposed soffits, low ceiling voids, retrofit, plant rooms.',
        drawing_notations: ['SDL', 'surface downlight', 'surface mount']
      },
      linear_led: {
        name: 'Linear LED / LED Batten',
        mounting: 'Recessed into ceiling grid, surface-mounted, or suspended',
        description: 'Rectangular or strip LED fitting. Replaces traditional fluorescent battens.',
        measurement: 'Count as nr for individual fittings. If continuous run, may measure in m (linear) — check schedule.',
        typical_lengths: ['600mm (2ft)', '1200mm (4ft — most common)', '1500mm (5ft)', '1800mm (6ft)'],
        typical_use: 'Offices (main worksurface lighting), corridors, classrooms, retail.',
        variants: {
          recessed_modular: 'Recessed into 600×600 ceiling grid. Standard office lighting.',
          surface_batten: 'Surface-mounted. Plant rooms, stores, back of house.',
          suspended: 'Suspended on wire/rod from ceiling. Open-plan offices, feature lighting.',
          continuous: 'Multiple fittings joined end-to-end for continuous light line. Corridors, retail.'
        },
        drawing_notations: ['LIN', 'linear', 'LED batten', 'modular', '600x600', '1200x300']
      },
      pendant: {
        name: 'Pendant Fitting',
        mounting: 'Suspended from ceiling on cable, chain, or rod',
        description: 'Decorative or functional fitting hanging below ceiling level.',
        typical_use: 'Reception, atrium, restaurant, meeting rooms, stairwells.',
        specification_notes: ['Suspension length (may need adjusting on site)', 'Weight (structural support consideration)', 'Decorative — often architect-specified'],
        drawing_notations: ['PEN', 'pendant', 'suspended']
      },
      bulkhead: {
        name: 'Bulkhead',
        mounting: 'Wall or ceiling surface-mounted, robust enclosure',
        description: 'Enclosed fitting with sealed lens. Impact-resistant. Often IP65.',
        typical_use: 'External walls, stairwells, plant rooms, car parks, loading bays, service areas.',
        specification_notes: ['IP rating (IP44 minimum, IP65 for external)', 'IK rating (impact — IK07 minimum, IK10 for vandal areas)', 'Emergency variant available'],
        drawing_notations: ['BH', 'bulkhead', 'wall light']
      },
      floodlight: {
        name: 'Floodlight',
        mounting: 'External — wall, pole, or ground-mounted',
        description: 'High-output external lighting for building facade, car parks, sports areas.',
        typical_use: 'External areas, car parks, building facade, security lighting, sports.',
        specification_notes: ['Wattage (W)', 'Lumen output (lm)', 'Beam angle', 'IP rating (IP65 minimum external)', 'Mounting height', 'Aiming angle'],
        drawing_notations: ['FL', 'floodlight', 'area light', 'exterior light'],
        note: 'External floodlights may need: column/pole (separate item), foundation (builder\'s work), external cable (SWA).'
      },
      high_bay: {
        name: 'High Bay',
        mounting: 'Suspended from ceiling structure in high-ceiling spaces',
        description: 'High-output fitting for spaces with ceiling heights >6m. LED replacing HID/metal halide.',
        typical_use: 'Warehouses, factories, sports halls, atriums, large retail.',
        specification_notes: ['Wattage (W — typically 100-400W LED)', 'Mounting height (6m-20m+)', 'Lumen output', 'Beam angle (for height)'],
        drawing_notations: ['HB', 'high bay', 'industrial']
      },
      track_light: {
        name: 'Track Light / Track Spot',
        mounting: 'Mounted on electrified track system. Adjustable position along track.',
        description: 'Individual spot fittings on a continuous powered track.',
        measurement: 'Track measured in m (linear). Spot fittings counted as nr. Both are separate items.',
        typical_use: 'Retail, galleries, museums, feature display.',
        drawing_notations: ['TRK', 'track', 'spot', 'track spot']
      },
      emergency_luminaire: {
        name: 'Emergency Luminaire',
        mounting: 'Ceiling or wall — varies by type',
        description: 'Provides illumination during mains power failure for safe evacuation.',
        detail: 'See Emergency Lighting section below for full classification.',
        drawing_notations: ['EM', 'emergency', 'EM/M', 'EM/NM'],
        note: 'Emergency fittings may be dedicated units OR standard fittings with emergency battery pack. Check schedule.'
      },
      exit_sign: {
        name: 'Exit Sign / Escape Route Sign',
        mounting: 'Wall or ceiling — above doors, at route changes, at final exits',
        description: 'Illuminated green running-man sign per BS 5266. Maintained emergency operation.',
        variants: {
          wall_mounted: 'Flat against wall above door.',
          suspended: 'Suspended from ceiling, visible from both sides (double-sided).',
          recessed: 'Recessed into ceiling or wall.',
          blade: 'Projecting blade sign — perpendicular to wall for corridor visibility.'
        },
        specification_notes: ['Direction (left, right, down, straight)', 'Viewing distance (determines sign size)', 'Maintained (always illuminated)', 'Double-sided for suspended'],
        drawing_notations: ['EXIT', 'exit sign', 'escape sign', 'running man'],
        note: 'Exit signs are ALWAYS maintained emergency. They must comply with BS 5266 and the Health & Safety (Safety Signs) Regulations.'
      }
    },

    schedule_rule: {
      priority: '1. LUMINAIRE SCHEDULE — authoritative. 2. RCP (Reflected Ceiling Plan) — count from drawing. 3. Room data sheets — may specify lux levels / fitting types.',
      extract: ['Fitting type/reference', 'Manufacturer and model (if specified)', 'Wattage (W)', 'Colour temperature (K)', 'Quantity per room/area', 'Emergency function (M/NM/none)', 'Circuit reference', 'DALI/switched control type'],
      flag_if: ['No luminaire schedule provided — flag and count from RCP with reduced confidence', 'Lux levels stated but no schedule — flag for design check']
    },

    ip_ratings: {
      IP20: 'Standard internal (no moisture protection). Offices, dry areas.',
      IP44: 'Splash-proof. Bathrooms (Zone 2+), covered external, commercial kitchens.',
      IP54: 'Dust-protected, splash-proof. Plant rooms, car parks.',
      IP65: 'Dust-tight, water-jet resistant. External, wet areas, food production.',
      IP66: 'Dust-tight, powerful water-jet resistant. Harsh external, wash-down areas.',
      IP67: 'Dust-tight, immersion-resistant. In-ground fittings, water features.',
      rule: 'Check IP rating per area. Wet areas, external, and food areas MUST have appropriate IP. Flag if IP not specified for wet/external fittings.'
    }
  },

  /* ══════════════════════════════════════════════════════════════
     2. EMERGENCY LIGHTING
     ══════════════════════════════════════════════════════════════ */
  emergency_lighting: {
    unit: 'nr',
    standard: 'BS 5266-1 (design), BS EN 1838 (photometric requirements)',
    rule: 'Count every emergency fitting individually. Note type (maintained/non-maintained), duration, and whether self-contained or central battery.',

    system_types: {
      self_contained: {
        name: 'Self-Contained Emergency',
        description: 'Each fitting has its own internal battery. Most common system type.',
        advantages: 'Simple, no additional wiring for battery supply. Each fitting independent.',
        disadvantages: 'Battery replacement needed per fitting (3-4 year life). More maintenance points.',
        cable: 'Standard lighting cable to each fitting (mains-powered with integral battery).',
        note: 'Self-contained fittings can be: dedicated emergency fittings (always off, illuminate on mains fail) OR standard fittings with emergency battery pack (illuminate normally, switch to battery on mains fail).'
      },
      central_battery: {
        name: 'Central Battery System',
        description: 'One central battery unit supplies multiple emergency fittings via dedicated fire-rated cable.',
        advantages: 'Centralised testing, longer battery life, lower per-fitting cost for large installations.',
        disadvantages: 'Requires dedicated fire-rated cable to every fitting (FP200 or MICC). Battery unit is a single point of failure.',
        cable: 'Fire-rated cable (FP200/MICC) from central battery to EVERY emergency fitting.',
        additional_items: ['Central battery unit (nr — see KB-E03)', 'Fire-rated cable (m — significant quantity)', 'Distribution board for emergency circuits', 'Monitoring/test panel'],
        note: 'Central battery dramatically increases cable quantities. Cross-reference KB-E01 for fire-rated cable.'
      }
    },

    operation_modes: {
      maintained: {
        code: 'M',
        description: 'Fitting is ALWAYS illuminated (on mains AND on battery). Switching not permitted.',
        typical_use: 'Exit signs, areas of high risk, areas that may be used in darkness (cinemas, theatres).',
        note: 'Maintained fittings burn lamps continuously — shorter lamp life. LED has reduced this concern.'
      },
      non_maintained: {
        code: 'NM',
        description: 'Fitting only illuminates on MAINS FAILURE. Off during normal operation.',
        typical_use: 'Escape routes, open areas, high-risk areas where normal lighting is always on during occupation.',
        note: 'Most common mode for general emergency lighting in commercial buildings.'
      },
      sustained: {
        code: 'S',
        description: 'Fitting has separate lamps: one for normal use (switchable), one for emergency (always available).',
        typical_use: 'Combined normal + emergency fitting. Reduces total fitting count.'
      },
      combined_maintained_non_maintained: {
        code: 'M/NM or Combined',
        description: 'Dual-mode fitting — can operate as maintained or non-maintained depending on wiring.',
        typical_use: 'Versatile fitting choice — mode set by wiring connection.'
      }
    },

    duration: {
      '1 hour': 'Minimum for premises with sleeping accommodation (BS 5266). Suitable where immediate evacuation is possible.',
      '3 hours': 'Standard for most non-domestic premises. Required where evacuation may take longer, or where sleeping risk exists.',
      note: 'Duration should be stated in spec. If not, default assumption is 3-hour for commercial. Always flag if not stated.'
    },

    locations_required: [
      'Every exit door and final exit',
      'Escape routes (corridors, stairways)',
      'Intersections of corridors',
      'Changes in floor level (steps, ramps)',
      'Changes in direction on escape routes',
      'Outside each final exit (external — for 1m minimum)',
      'Near fire alarm call points',
      'Near fire-fighting equipment (extinguishers, hose reels)',
      'Near first aid points',
      'Lift cars (separate requirement)',
      'Toilets and changing rooms exceeding 8m²',
      'Motor generator rooms, control rooms, plant rooms, switch rooms',
      'Open areas exceeding 60m² (anti-panic lighting)'
    ],

    flag_triggers: [
      'Emergency lighting type (self-contained vs central battery) not stated — flag. Massive impact on cable quantities.',
      'Duration (1hr vs 3hr) not specified — flag.',
      'Maintained vs non-maintained not stated per fitting — flag.',
      'No emergency lighting shown on escape routes — flag as non-compliant.',
      'BS 5266 not referenced in spec — flag.'
    ]
  },

  /* ══════════════════════════════════════════════════════════════
     3. LIGHTING CONTROLS & SENSORS
     ══════════════════════════════════════════════════════════════ */
  controls: {
    unit: 'nr',
    rule: 'Count every control device individually. Note type, protocol (DALI/switched/1-10V), and location. Cross-reference BMS scope for integrated lighting control.',

    types: {
      pir: {
        name: 'PIR Occupancy Sensor / Presence Detector',
        function: 'Detects occupancy by infrared motion. Switches lighting on/off or triggers dimming.',
        mounting: { ceiling: 'Most common — detects movement in cone below.', wall: 'Corner-mount — for corridors, small rooms.', high_bay: 'For high-ceiling spaces — longer detection range.' },
        specification_notes: ['Detection range (m)', 'Mounting height', 'Time delay (adjustable)', 'Daylight hold-off (combined presence + daylight)'],
        drawing_notations: ['PIR', 'occupancy', 'presence', 'motion sensor'],
        note: 'Part L Building Regulations requires automatic lighting controls (occupancy and/or daylight sensing) in most non-domestic buildings.'
      },
      absence_detector: {
        name: 'Absence Detector',
        function: 'Similar to PIR but requires MANUAL switch-on. Auto-off when room vacated.',
        note: 'More energy-efficient than PIR (doesn\'t auto-on when entering). Increasingly specified for Part L compliance.',
        drawing_notations: ['absence', 'manual-on sensor']
      },
      daylight_sensor: {
        name: 'Daylight Sensor / Photocell',
        function: 'Measures ambient light level. Dims or switches lighting to maintain target lux level.',
        types: {
          internal: 'Ceiling-mounted sensor measuring room light level. Works with DALI dimming.',
          external: 'External photocell — switches external lighting based on daylight level (dawn/dusk).'
        },
        drawing_notations: ['photocell', 'daylight sensor', 'lux sensor', 'PC'],
        note: 'Part L requires daylight-linked dimming in spaces with significant daylight contribution.'
      },
      dali: {
        name: 'DALI Controller / DALI Driver',
        function: 'Digital Addressable Lighting Interface — intelligent lighting control protocol',
        description: 'DALI allows individual addressing and dimming of every fitting on a DALI bus. Up to 64 devices per DALI line.',
        components: {
          driver: 'DALI LED driver — integral to each DALI-compatible fitting. Receives DALI signal.',
          controller: 'DALI controller/gateway — converts BMS/switch commands to DALI protocol.',
          bus_supply: 'DALI bus power supply — powers the DALI communication bus (16V DC).',
          sensor: 'DALI-compatible sensor — occupancy/daylight directly on DALI bus.'
        },
        drawing_notations: ['DALI', 'DALI driver', 'DALI gateway', 'DALI controller'],
        note: 'DALI requires 2-core DALI bus cable (extra cable run alongside power). Count DALI bus cable separately. Cross-reference KB-E01 for cable type.',
        flag_if: 'DALI specified but no DALI controllers or bus cable shown — flag for scope check.'
      },
      scene_controller: {
        name: 'Scene Controller / Lighting Control Panel',
        function: 'User interface for selecting pre-programmed lighting scenes (e.g. presentation, meeting, clean).',
        types: {
          wall_plate: 'Flush wall-mounted plate with scene buttons. Standard for meeting rooms, board rooms.',
          touch_panel: 'Touch screen panel. Premium installations.',
          remote: 'Handheld/wireless remote. Flexible but can be lost.'
        },
        drawing_notations: ['scene panel', 'lighting panel', 'scene controller', 'SCP'],
        count_rule: 'Count 1nr per room or zone that has scene control. Note number of scenes.'
      },
      timer: {
        name: 'Time Clock / Timer Controller',
        function: 'Switches lighting on/off at programmed times. External lighting, common areas.',
        types: {
          analogue: 'Mechanical time clock — pin-set times. Simple, reliable.',
          digital: 'Digital programmer — multiple on/off times, day/week programmes.',
          astronomical: 'Calculates sunrise/sunset automatically. Ideal for external lighting.'
        },
        drawing_notations: ['timer', 'time clock', 'programmer', 'astro timer'],
        note: 'External lighting almost always requires an astronomical time clock + photocell combination.'
      },
      bms_point: {
        name: 'BMS Lighting Control Point',
        function: 'Interface between Building Management System and lighting. Allows central scheduling, monitoring, override.',
        count_rule: 'Count 1nr BMS point per lighting circuit or zone controlled by BMS. Cross-reference with BMS scope.',
        drawing_notations: ['BMS point', 'BMS interface', 'lighting BMS'],
        note: 'BMS lighting control is often in addition to local switches/sensors. Check scope — BMS contractor may provide the interface hardware.'
      }
    }
  },

  /* ══════════════════════════════════════════════════════════════
     4. SMALL POWER
     ══════════════════════════════════════════════════════════════ */
  small_power: {
    unit: 'nr',
    rule: 'Count every outlet individually. Note type and any non-standard features (USB, IP rating, etc.). Use socket outlet schedule if provided.',

    types: {
      sso: {
        name: 'Single Socket Outlet (SSO)',
        rating: '13A, 230V, BS 1363',
        description: 'Single gang switched socket outlet. One socket position.',
        mounting: { flush: 'Standard — recessed into wall.', surface: 'Box-mounted on wall surface.', dado: 'In dado trunking (count in trunking section).' },
        drawing_symbol: 'Single parallel lines or small rectangle with "1" annotation',
        drawing_notations: ['SSO', '1G', 'single socket', 'SP'],
        note: 'Less common than DSO in commercial. Often specified for dedicated equipment points.'
      },
      dso: {
        name: 'Double Socket Outlet (DSO)',
        rating: '13A, 230V, BS 1363',
        description: 'Double gang switched socket outlet. Two socket positions. Standard commercial outlet.',
        mounting: { flush: 'Standard.', surface: 'Plant rooms, workshops.', dado: 'In dado trunking.', floor: 'In floor box.' },
        drawing_symbol: 'Double parallel lines or small rectangle with "2" annotation',
        drawing_notations: ['DSO', '2G', 'double socket', 'twin socket', 'DP'],
        note: 'Most common outlet in commercial buildings. Default assumption if "socket" shown without type annotation.'
      },
      sfcu: {
        name: 'Switched Fused Connection Unit (SFCU / FCU)',
        rating: '13A fused, 230V',
        description: 'Fused and switched connection for permanently wired equipment (hand dryers, water heaters, fans).',
        drawing_notations: ['FCU', 'SFCU', 'fused spur', 'fused connection'],
        note: 'Used for equipment that should not be unplugged by users. Always check what equipment it serves.',
        common_loads: ['Hand dryer', 'Under-sink water heater', 'Extract fan', 'Towel rail', 'Wall-mounted heater', 'Vending machine']
      },
      floor_box: {
        name: 'Floor Box / Floor Outlet',
        description: 'Recessed into raised access floor or screed floor. Contains power and/or data sockets.',
        specification_notes: ['Number of power sockets per box (typically 2-4)', 'Number of data outlets per box (typically 2-4)', 'Power + data compartments (segregated)', 'Box size (3-compartment, 4-compartment)', 'Floor finish (to match floor tile)'],
        drawing_notations: ['FB', 'floor box', 'floor outlet', 'access floor outlet'],
        count_rule: 'Count 1nr per floor box position. Note contents (e.g. "3-comp floor box: 2×DSO power + 2×Cat6A data + 1×spare").',
        note: 'Floor boxes are fed from underfloor containment. Cross-reference KB-E02 for floor trunking.'
      },
      dado_socket: {
        name: 'Dado Trunking Socket',
        description: 'Socket outlet installed in dado/perimeter trunking system.',
        count_rule: 'Count total number of sockets in dado system. The trunking itself is measured in KB-E02.',
        note: 'Dado systems combine containment (m) with outlets (nr). Count both separately.'
      },
      industrial_socket: {
        name: 'Industrial Socket Outlet (CEE / Commando)',
        description: 'High-power round-pin socket for industrial equipment. IP44/IP67 rated. Colour-coded by voltage.',
        colours: {
          blue: '230V single phase (16A, 32A)',
          red: '400V three phase (16A, 32A, 63A, 125A)',
          yellow: '110V (site supply)',
          note: 'Colour indicates voltage — always note colour or voltage.'
        },
        specification_notes: ['Current rating (A)', 'Voltage/phase (230V 1ph, 400V 3ph)', 'IP rating (IP44 splash, IP67 submersible)', 'Interlocked (switched + mechanically interlocked for safety)'],
        drawing_notations: ['IND', 'industrial socket', 'commando', 'CEE', '32A 3ph', 'blue socket', 'red socket'],
        flag_if: 'Industrial socket shown without rating — flag for spec check.'
      },
      usb_socket: {
        name: 'USB Socket Outlet',
        description: 'Standard 13A socket with integrated USB charging ports.',
        types: {
          usb_a: 'USB Type-A ports (5V, 2.1A typical). Standard charging.',
          usb_c: 'USB Type-C ports (up to 45W PD). Fast charging. Increasingly specified.',
          combined: 'Socket with both USB-A and USB-C ports.'
        },
        drawing_notations: ['USB', 'USB socket', 'charging socket'],
        note: 'USB sockets are replacing standard sockets in premium commercial, hospitality, and residential. Premium cost vs standard DSO.'
      }
    }
  },

  /* ══════════════════════════════════════════════════════════════
     5. SPECIALIST SMALL POWER
     ══════════════════════════════════════════════════════════════ */
  specialist: {
    unit: 'nr',
    rule: 'Count every specialist outlet. These are high-value items — ensure specification is captured.',

    ev_charging: {
      name: 'EV Charging Point',
      function: 'Electric vehicle charging station. Increasingly mandatory for new buildings.',
      types: {
        mode_2: '3kW — domestic 3-pin plug (slow). Not typically specified in commercial.',
        mode_3_slow: '7kW — dedicated EV socket or tethered cable. Standard for workplace/residential.',
        mode_3_fast: '22kW — three-phase, AC fast charging. Workplace, retail, public.',
        mode_4_rapid: '50kW DC rapid — dedicated unit. Forecourts, public hubs.',
        mode_4_ultra: '150-350kW DC ultra-rapid — specialist highway/forecourt.'
      },
      specification_required: ['Power output (kW)', 'Socket type (Type 1, Type 2, CCS, CHAdeMO)', 'Tethered cable or socket', 'Smart charging capability (OCPP)', 'Load management (if multiple chargers)', 'Electrical supply (single/three phase, dedicated circuit)'],
      drawing_notations: ['EV', 'EVCP', 'EV charger', 'charging point'],
      associated_items: ['Dedicated circuit from DB (cable sizing for EV load)', 'Earthing (PME restrictions may apply — TT earth may be needed)', 'RCD protection (Type B for DC charging)', 'Load management controller (for multiple chargers)', 'Bollard/post (if not wall-mounted)', 'Civil works (pad, duct, ducting for external)'],
      regulations: {
        part_s: 'Building Regulations Part S (2022): requires EV charge points in new buildings with parking. Minimum: 1 active charge point per dwelling with parking. Non-domestic: EV-ready cable routes.',
        note: 'Part S is MANDATORY for new builds. Check if existing building regulations apply on refurbishment.'
      },
      flag_if: ['kW rating not stated', 'Number of active vs passive (cable-only) provisions not specified', 'Electrical capacity for EV load not confirmed']
    },

    server_pdu: {
      name: 'Server Room PDU (Power Distribution Unit)',
      function: 'Distributes power to IT equipment in server room or data centre. Rack-mounted.',
      types: {
        basic: 'Basic PDU — no monitoring. Simple power strip for rack.',
        metered: 'Metered PDU — shows total load per PDU. Standard for commercial server rooms.',
        switched: 'Switched PDU — individual outlet switching and monitoring. Premium.',
        managed: 'Intelligent PDU — per-outlet monitoring, remote management, alarms. Data centre standard.'
      },
      specification_required: ['kW/kVA capacity', 'Number of outlets', 'Outlet type (C13, C19)', 'Input connection (32A commando, hardwired)', 'Monitoring (basic/metered/managed)', 'Redundancy (A+B dual-feed per rack)'],
      drawing_notations: ['PDU', 'rack PDU', 'power strip'],
      note: 'Server rooms typically have dual-feed (A+B) power to each rack = 2× PDUs per rack. Count carefully.',
      flag_if: ['Server room shown but PDU spec not provided', 'Redundancy (A+B feeds) not clarified']
    },

    raised_floor_outlet: {
      name: 'Raised Floor Power Outlet',
      description: 'Power outlet integrated into raised access floor system. Alternative to floor boxes.',
      types: {
        grommeted: 'Grommet in floor tile with cables passing through to desk. Simple, low cost.',
        power_pole: 'Power pole from floor to desk height. Contains sockets and data. Free-standing.',
        desk_unit: 'Power/data unit mounted in desk surface. Fed from floor via grommet.'
      },
      drawing_notations: ['floor outlet', 'grommet', 'power pole', 'desk unit'],
      note: 'Raised floor outlets serve the same function as floor boxes but with different installation method. Check floor system type.'
    }
  }
};

module.exports = KB_E04;
