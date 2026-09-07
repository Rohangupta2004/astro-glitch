// ============================================================================
// ASTRO GLITCH: QUANTUM HEIST - 24 STORY SECTORS (ACTS I - IV)
// ============================================================================

const TROLL_DEATH_QUOTES = [
    "System Error 404: Floor not found in memory.",
    "The Stargate has filed a restraining order.",
    "Warning: Gravity driver crashed unexpectedly.",
    "Decompressed in 0.04 seconds. New personal record!",
    "Zap-Bot sends its electronic regards. ⚡",
    "Firewall breach rejected: Skill deficit detected.",
    "Security AI: 1, Cyber-Bot: 0.",
    "Quantum entanglement severed. Re-instantiating...",
    "Pro tip: Anti-matter plasma is hazardous to chassis.",
    "Memory leak detected: Reality de-allocated.",
    "Nice jump! Too bad physics was temporarily deprecated.",
    "The Stargate departed at Mach 3. Good luck catching it.",
    "Error: Human reflex buffer underflow.",
    "Did you really trust that holo-bridge? In this galaxy?",
    "Ghosted! Quantum anomaly phase-locked your position. 👻",
    "Security lockdown engaged: You got vaporized.",
    "Event horizon consumed your data packets. Om nom nom.",
    "Houston, we have a major operational malfunction.",
    "Singularity detected: You are now cosmic spaghetti.",
    "Nexus-9 chuckles in binary: 01001100 01001111 01001100.",
    "Thermal throttling: Byte's chassis exceeded 9000° Kelvin.",
    "Shield battery depleted! Deflection angle was suboptimal."
];

const LEVELS = [
    // ========================================================================
    // ACT I: THE AWAKENING (SECTORS 01 - 06)
    // Gentle Onboarding, Movement Calibration, First Quantum Powers & Trolls
    // ========================================================================

    // ------------------------------------------------------------------------
    // SECTOR 01: "Boot Sequence" (Movement & Jump Calibration)
    // ------------------------------------------------------------------------
    {
        id: 1,
        act: 1,
        actTitle: "Act I: The Awakening",
        title: "Sector 01: Boot Sequence",
        subtitle: "A routine walk to the Stargate. Simple calibration.",
        hint: "Use [A / D] or Arrow Keys to move, and [W / SPACE] to jump!",
        collectibles: [{"id":"shard_01","type":"shard","x":420,"y":380},{"id":"core_01_1","type":"nanite","x":220,"y":400},{"id":"core_01_2","type":"nanite","x":560,"y":380},{"id":"core_01_3","type":"nanite","x":740,"y":380}],
        cutscene: "intro",
        featuredPower: "dash",
        playerStart: { x: 80, y: 390 },
        door: { x: 840, y: 380, width: 44, height: 64 },
        platforms: [
            // Wide, safe, non-punishing starting deck
            { x: 40, y: 444, width: 420, height: 40, type: "solid" },
            // Gentle 18px step
            { x: 460, y: 426, width: 460, height: 58, type: "solid" }
        ],
        spikes: [],
        enemies: [],
        trollEvents: [
            {
                id: "welcome_radio_l1",
                type: "onStart",
                run: (game) => {
                    if (window.storyManager) {
                        window.storyManager.triggerRadio('aura', "Sensors online, Byte! Walk and jump to reach the Stargate.");
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 02: "Calibration Jump" (Introducing Decaying Floors)
    // ------------------------------------------------------------------------
    {
        id: 2,
        act: 1,
        actTitle: "Act I: The Awakening",
        title: "Sector 02: Calibration Jump",
        subtitle: "Scrap decks are unstable. Jump over the decaying bridge!",
        hint: "Step lightly! Platforms shake before collapsing.",
        collectibles: [{"id":"shard_02","type":"shard","x":390,"y":350},{"id":"core_02_1","type":"nanite","x":200,"y":400},{"id":"core_02_2","type":"nanite","x":550,"y":400},{"id":"core_02_3","type":"nanite","x":720,"y":400}],
        vehicles: [{"id":"veh_02","type":"rover","x":600,"y":400}],
        featuredPower: "dash",
        playerStart: { x: 80, y: 380 },
        door: { x: 840, y: 380, width: 44, height: 64 },
        platforms: [
            { x: 40, y: 444, width: 280, height: 40, type: "solid" },
            // Forgiving collapse delay (320ms - generous reaction time)
            { x: 320, y: 444, width: 140, height: 40, type: "collapse", delay: 320 },
            { x: 460, y: 444, width: 460, height: 40, type: "solid" }
        ],
        spikes: [
            // Low pit plasma - clearly visible
            { x: 320, y: 520, width: 140, height: 20, dir: "up" }
        ],
        enemies: [],
        trollEvents: [
            {
                id: "decay_radio_l2",
                type: "onStart",
                run: (game) => {
                    if (window.storyManager) {
                        window.storyManager.triggerRadio('aura', "Careful! That platform deck is crumbling. Leap across!");
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 03: "Phase Shift Awakening" (Introducing Phase Shift [Shift / 1])
    // ------------------------------------------------------------------------
    {
        id: 3,
        act: 1,
        actTitle: "Act I: The Awakening",
        title: "Sector 03: Phase Shift Awakening",
        subtitle: "Security firewall blocking the corridor. Phase right through!",
        hint: "Press [SHIFT] or [1] to Phase Shift through holographic barriers!",
        collectibles: [{"id":"shard_03","type":"shard","x":620,"y":390},{"id":"core_03_1","type":"nanite","x":240,"y":400},{"id":"core_03_2","type":"nanite","x":440,"y":400},{"id":"core_03_3","type":"nanite","x":720,"y":400}],
        featuredPower: "dash",
        playerStart: { x: 80, y: 380 },
        door: { x: 850, y: 380, width: 44, height: 64 },
        platforms: [
            { x: 40, y: 444, width: 480, height: 40, type: "solid" },
            // Holographic firewall barrier (can be phased through with Shift)
            { x: 520, y: 260, width: 30, height: 184, type: "fake_wall", hintText: "PHASE" },
            { x: 520, y: 444, width: 400, height: 40, type: "solid" }
        ],
        spikes: [],
        enemies: [],
        trollEvents: [
            {
                id: "phase_hint_radio_l3",
                type: "onStart",
                run: (game) => {
                    if (window.storyManager) {
                        window.storyManager.triggerRadio('aura', "Energy firewall ahead! Tap [SHIFT] to Phase Shift right through it!");
                    }
                }
            },
            // Playful gentle troll: Gate slides back 25px when Byte approaches
            {
                id: "gate_nudge_l3",
                type: "proximity",
                targetX: 800,
                dist: 70,
                triggered: false,
                run: (game) => {
                    if (game.level.door) {
                        game.level.door.x = 880;
                        window.soundManager.playTroll();
                        game.showBanner("GATE RE-ALIGNED! ⚡", 1000);
                        if (window.storyManager) {
                            window.storyManager.triggerRadio('nexus', "Did you think the gateway was static, pest?");
                        }
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 04: "Chronos Dilation" (Introducing Chronos Slow [E / 2])
    // ------------------------------------------------------------------------
    {
        id: 4,
        act: 1,
        actTitle: "Act I: The Awakening",
        title: "Sector 04: Chronos Dilation",
        subtitle: "Hydraulic bulkhead descending. Dilate time to slip under.",
        hint: "Press [E] or [2] for Chronos Slow to slow down world time!",
        collectibles: [{"id":"shard_04","type":"shard","x":510,"y":390},{"id":"core_04_1","type":"nanite","x":250,"y":400},{"id":"core_04_2","type":"nanite","x":650,"y":400},{"id":"core_04_3","type":"nanite","x":780,"y":400}],
        featuredPower: "slowmo",
        playerStart: { x: 80, y: 380 },
        door: { x: 860, y: 380, width: 44, height: 64 },
        platforms: [
            { x: 30, y: 444, width: 900, height: 40, type: "solid" },
            // Slow crusher bulkhead with ample room to slide under
            { x: 440, y: 60, width: 140, height: 160, type: "crusher", startY: 60, targetY: 330, speed: 4.5, triggered: false }
        ],
        spikes: [
            { x: 440, y: 220, width: 140, height: 20, dir: "down", attachedToCrusher: true }
        ],
        enemies: [],
        trollEvents: [
            {
                id: "crusher_slow_l4",
                type: "proximity",
                targetX: 360,
                dist: 100,
                triggered: false,
                run: (game) => {
                    const crusher = game.level.platforms.find(p => p.type === "crusher");
                    if (crusher && !crusher.triggered) {
                        crusher.triggered = true;
                        game.camera.shake(8, 18);
                        window.soundManager.playTroll();
                        game.showBanner("BULKHEAD DESCENDING! USE [E] SLOW! ⏳", 1600);
                        if (window.storyManager) {
                            window.storyManager.triggerRadio('aura', "Hold [E] to dilate time and dash under before it seals!");
                        }
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 05: "The Evasive Stargate" (First Classic Troll!)
    // ------------------------------------------------------------------------
    {
        id: 5,
        act: 1,
        actTitle: "Act I: The Awakening",
        title: "Sector 05: Neon Highway Chase",
        subtitle: "Hop into the Apex Cyber-Rover! Boost with [SPACE] and jump the highway gaps!",
        hint: "Mount the rover with [E]! Floor the gas and press [SPACE] for Nitro Boost!",
        collectibles: [{"id":"shard_05","type":"shard","x":500,"y":180},{"id":"core_05_1","type":"nanite","x":340,"y":280},{"id":"core_05_2","type":"nanite","x":540,"y":190},{"id":"core_05_3","type":"nanite","x":720,"y":110}],
        vehicles: [{"id":"veh_05","type":"rover","x":140,"y":400}],
        featuredPower: "slowmo",
        playerStart: { x: 80, y: 380 },
        door: { x: 740, y: 380, width: 44, height: 64, canFlee: true, fleeSpeed: 6.0, fled: false },
        platforms: [
            { x: 40, y: 444, width: 880, height: 40, type: "solid" },
            // Ascent staircase to catch the runaway gate
            { x: 280, y: 320, width: 140, height: 24, type: "solid" },
            { x: 480, y: 230, width: 140, height: 24, type: "solid" },
            { x: 680, y: 150, width: 180, height: 24, type: "solid" }
        ],
        spikes: [
            { x: 500, y: 424, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 70 }
        ],
        enemies: [],
        trollEvents: [
            {
                id: "door_flee_l5",
                type: "proximity",
                targetX: 620,
                dist: 110,
                triggered: false,
                run: (game) => {
                    const door = game.level.door;
                    if (door && !door.fled) {
                        door.fled = true;
                        window.soundManager.playDoorFlee();
                        window.soundManager.playTroll();
                        game.showBanner("STARGATE THRUSTERS ENGAGED! 🚀💨", 1800);
                        game.camera.shake(8, 20);
                        door.targetY = 86;
                        door.targetX = 740;
                        door.isMoving = true;
                        if (window.storyManager) {
                            window.storyManager.triggerRadio('nexus', "Did you think I would let you walk out that easily?");
                        }
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 06: "Sentry-X Patrol" (First Enemy Encounter & Act I Climax)
    // ------------------------------------------------------------------------
    {
        id: 6,
        act: 1,
        actTitle: "Act I: The Awakening",
        title: "Sector 06: Sentry-X Patrol",
        subtitle: "Perimeter guard droid deployed. Jump over or Phase Shift through!",
        hint: "Phase Shift [SHIFT] grants temporary invulnerability against drones!",
        collectibles: [{"id":"shard_06","type":"shard","x":460,"y":260},{"id":"core_06_1","type":"nanite","x":240,"y":400},{"id":"core_06_2","type":"nanite","x":600,"y":400},{"id":"core_06_3","type":"nanite","x":700,"y":400}],
        featuredPower: "dash",
        playerStart: { x: 70, y: 380 },
        door: { x: 860, y: 380, width: 44, height: 64 },
        enemies: [
            { type: "smolly", x: 480, y: 422, width: 22, height: 22, minX: 400, maxX: 620, speed: 1.8, dir: 1 }
        ],
        platforms: [
            { x: 40, y: 444, width: 880, height: 40, type: "solid" },
            { x: 380, y: 310, width: 160, height: 24, type: "solid" }
        ],
        spikes: [
            { x: 760, y: 424, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 75 }
        ],
        trollEvents: [
            {
                id: "sentry_radio_l6",
                type: "onStart",
                run: (game) => {
                    if (window.storyManager) {
                        window.storyManager.triggerRadio('nexus', "SENTRY-X: PURGE THE INTRUDER.");
                    }
                }
            },
            {
                id: "end_spike_l6",
                type: "proximity",
                targetX: 760,
                dist: 75,
                triggered: false,
                run: (game) => {
                    const sp = game.level.spikes.find(s => s.x === 760);
                    if (sp) {
                        sp.isHidden = false;
                        window.soundManager.playTroll();
                        game.showBanner("SECURITY SPIKE POPUP! ⚡", 1000);
                    }
                }
            }
        ]
    },

    // ========================================================================
    // ACT II: THE SECURITY BASTION (SECTORS 07 - 12)
    // Moderate Difficulty: Gravity Flips, Quantum Rewind, Logic Inversion & Traps
    // ========================================================================

    // ------------------------------------------------------------------------
    // SECTOR 07: "Polarity Inversion" (Introducing Polarity Invert [Q / F / 3])
    // ------------------------------------------------------------------------
    {
        id: 7,
        act: 2,
        actTitle: "Act II: The Security Bastion",
        title: "Sector 07: Polarity Inversion",
        subtitle: "Floor is flooded with plasma. Invert magnetic polarity to ceiling!",
        hint: "Press [Q], [F], or [3] to invert gravity and walk on the ceiling!",
        collectibles: [{"id":"shard_07","type":"shard","x":480,"y":140},{"id":"core_07_1","type":"nanite","x":240,"y":120},{"id":"core_07_2","type":"nanite","x":560,"y":120},{"id":"core_07_3","type":"nanite","x":740,"y":120}],
        cutscene: "act2_intro",
        featuredPower: "gravity",
        playerStart: { x: 70, y: 370 },
        door: { x: 860, y: 90, width: 44, height: 64, upsideDown: true },
        platforms: [
            { x: 30, y: 444, width: 140, height: 40, type: "solid" },
            { x: 30, y: 60, width: 890, height: 35, type: "solid" },
            { x: 380, y: 95, width: 34, height: 80, type: "fake_wall" },
            { x: 620, y: 95, width: 40, height: 85, type: "solid" }
        ],
        spikes: [
            { x: 170, y: 444, width: 750, height: 24, dir: "up" },
            { x: 500, y: 95, width: 50, height: 20, dir: "down" }
        ],
        enemies: [],
        trollEvents: [
            {
                id: "gravity_hint_l7",
                type: "onStart",
                run: (game) => {
                    game.showBanner("PLASMA FLOOD! PRESS [Q] / [F] TO FLIP GRAVITY! 🚀", 2200);
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 08: "Temporal Paradox" (Introducing Quantum Rewind [R / 4])
    // ------------------------------------------------------------------------
    {
        id: 8,
        act: 2,
        actTitle: "Act II: The Security Bastion",
        title: "Sector 08: Temporal Paradox",
        subtitle: "A deceptive decoy portal. Good thing you can rewind time!",
        hint: "Press [R] or [4] to REWIND time 2.5 seconds when trapped!",
        collectibles: [{"id":"shard_08","type":"shard","x":460,"y":250},{"id":"core_08_1","type":"nanite","x":250,"y":400},{"id":"core_08_2","type":"nanite","x":620,"y":400},{"id":"core_08_3","type":"nanite","x":750,"y":400}],
        featuredPower: "rewind",
        playerStart: { x: 70, y: 380 },
        door: { x: 840, y: 380, width: 44, height: 64, isFakeTroll: true },
        realDoor: { x: 840, y: 160, width: 44, height: 64, isRevealed: false },
        enemies: [
            { type: "ghost", x: 620, y: 280, width: 24, height: 26, floatRange: 50, speed: 1.4, startY: 280 }
        ],
        platforms: [
            { x: 40, y: 444, width: 300, height: 40, type: "solid" },
            { x: 340, y: 444, width: 140, height: 40, type: "sinker", sinkSpeed: 7 },
            { x: 480, y: 444, width: 440, height: 40, type: "solid" },
            { x: 760, y: 224, width: 160, height: 30, type: "secret_platform", opacity: 0 }
        ],
        spikes: [
            { x: 340, y: 520, width: 140, height: 20, dir: "up" },
            { x: 780, y: 424, width: 60, height: 20, dir: "up", isHidden: true, triggerDist: 90 }
        ],
        trollEvents: [
            {
                id: "fake_door_trap_l8",
                type: "proximity",
                targetX: 800,
                dist: 80,
                triggered: false,
                run: (game) => {
                    const spike = game.level.spikes.find(s => s.x === 780);
                    if (spike) spike.isHidden = false;
                    game.camera.shake(15, 25);
                    window.soundManager.playTroll();
                    game.showBanner("HOLO-DECOY! REWIND BUFFER WITH [R]! ⏪⚡", 2000);
                    const secretPlat = game.level.platforms.find(p => p.type === "secret_platform");
                    if (secretPlat) secretPlat.opacity = 1;
                    if (game.level.realDoor) game.level.realDoor.isRevealed = true;
                    if (window.storyManager) {
                        window.storyManager.triggerRadio('aura', "It was a decoy! Rewind time with [R] and jump onto the hidden high platform!");
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 09: "Logic Inversion Field" (Inverted Horizontal Controls)
    // ------------------------------------------------------------------------
    {
        id: 9,
        act: 2,
        actTitle: "Act II: The Security Bastion",
        title: "Sector 09: Logic Inversion Field",
        subtitle: "Controls glitch and invert inside the corrupted purple grid!",
        hint: "Left is Right, Right is Left! Or Phase Shift [SHIFT] right through!",
        collectibles: [{"id":"shard_09","type":"shard","x":480,"y":390},{"id":"core_09_1","type":"nanite","x":200,"y":400},{"id":"core_09_2","type":"nanite","x":640,"y":400},{"id":"core_09_3","type":"nanite","x":800,"y":400}],
        featuredPower: "dash",
        playerStart: { x: 70, y: 380 },
        door: { x: 860, y: 380, width: 44, height: 64 },
        platforms: [
            { x: 40, y: 444, width: 260, height: 40, type: "solid" },
            { x: 300, y: 444, width: 340, height: 40, type: "inverted_field" },
            { x: 640, y: 444, width: 280, height: 40, type: "solid" },
            { x: 440, y: 280, width: 120, height: 24, type: "solid" }
        ],
        spikes: [
            { x: 440, y: 260, width: 120, height: 20, dir: "up" },
            { x: 740, y: 424, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 70 }
        ],
        enemies: [],
        trollEvents: [
            {
                id: "invert_radio_l9",
                type: "proximity",
                targetX: 320,
                dist: 60,
                triggered: false,
                run: (game) => {
                    game.showBanner("LOGIC INVERSION FIELD DETECTED! ↔️", 1500);
                    if (window.storyManager) {
                        window.storyManager.triggerRadio('nexus', "Your neural gyro has been inverted. Try walking now, bug.");
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 10: "Crusher Array Gauntlet" (Chronos Slow Timing Challenge)
    // ------------------------------------------------------------------------
    {
        id: 10,
        act: 2,
        actTitle: "Act II: The Security Bastion",
        title: "Sector 10: Crusher Array Gauntlet",
        subtitle: "Dual hydraulic crushers slamming in sequence.",
        hint: "Use Chronos Slow [E] to time the gaps between crushers!",
        collectibles: [{"id":"shard_10","type":"shard","x":500,"y":390},{"id":"core_10_1","type":"nanite","x":200,"y":400},{"id":"core_10_2","type":"nanite","x":480,"y":400},{"id":"core_10_3","type":"nanite","x":760,"y":400}],
        featuredPower: "slowmo",
        playerStart: { x: 70, y: 380 },
        door: { x: 870, y: 380, width: 44, height: 64 },
        platforms: [
            { x: 30, y: 444, width: 900, height: 40, type: "solid" },
            { x: 260, y: 60, width: 180, height: 120, type: "crusher", startY: 60, targetY: 340, speed: 7.5, triggered: false },
            { x: 540, y: 60, width: 180, height: 120, type: "crusher", startY: 60, targetY: 340, speed: 8.5, triggered: false }
        ],
        spikes: [
            { x: 260, y: 180, width: 180, height: 20, dir: "down", attachedToCrusher: true },
            { x: 540, y: 180, width: 180, height: 20, dir: "down", attachedToCrusher: true }
        ],
        enemies: [],
        trollEvents: [
            {
                id: "crush1_l10",
                type: "proximity",
                targetX: 230,
                dist: 80,
                triggered: false,
                run: (game) => {
                    const c = game.level.platforms[1];
                    if (c && !c.triggered) {
                        c.triggered = true;
                        game.camera.shake(10, 20);
                        window.soundManager.playTroll();
                    }
                }
            },
            {
                id: "crush2_l10",
                type: "proximity",
                targetX: 510,
                dist: 80,
                triggered: false,
                run: (game) => {
                    const c = game.level.platforms[2];
                    if (c && !c.triggered) {
                        c.triggered = true;
                        game.camera.shake(12, 22);
                        window.soundManager.playTroll();
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 11: "The Traitor Bridge" (Dash Bait Troll)
    // ------------------------------------------------------------------------
    {
        id: 11,
        act: 2,
        actTitle: "Act II: The Security Bastion",
        title: "Sector 11: Bastion Sky-Freeway",
        subtitle: "Rev the Apex Cyber-Rover across collapsing sky bridges!",
        hint: "Drive with [A/D], Nitro with [SPACE], and jump over the chasms!",
        collectibles: [{"id":"shard_11","type":"shard","x":560,"y":390},{"id":"core_11_1","type":"nanite","x":280,"y":400},{"id":"core_11_2","type":"nanite","x":420,"y":400},{"id":"core_11_3","type":"nanite","x":720,"y":400}],
        vehicles: [{"id":"veh_11","type":"rover","x":120,"y":400}],
        featuredPower: "rewind",
        playerStart: { x: 70, y: 380 },
        door: { x: 860, y: 380, width: 44, height: 64 },
        platforms: [
            { x: 40, y: 444, width: 220, height: 40, type: "solid" },
            // Traitor segments trigger collapse if fast dash velocity
            { x: 260, y: 444, width: 120, height: 40, type: "collapse", delay: 90 },
            { x: 380, y: 444, width: 120, height: 40, type: "collapse", delay: 90 },
            { x: 500, y: 444, width: 120, height: 40, type: "collapse", delay: 90 },
            { x: 620, y: 444, width: 300, height: 40, type: "solid" }
        ],
        spikes: [
            { x: 260, y: 520, width: 360, height: 20, dir: "up" },
            { x: 780, y: 424, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 75 }
        ],
        enemies: [],
        trollEvents: [
            {
                id: "traitor_radio_l11",
                type: "onStart",
                run: (game) => {
                    if (window.storyManager) {
                        window.storyManager.triggerRadio('aura', "This bridge looks rigged to kinetic shock. Careful with sudden dashes!");
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 12: "Bastion Core Breach" (Act II Climax & Laser Grid)
    // ------------------------------------------------------------------------
    {
        id: 12,
        act: 2,
        actTitle: "Act II: The Security Bastion",
        title: "Sector 12: Bastion Core Breach",
        subtitle: "Sentry-X and laser grids coordinated to halt your advance.",
        hint: "Phase Shift [SHIFT] through laser sweeps and sentries!",
        collectibles: [{"id":"shard_12","type":"shard","x":520,"y":170},{"id":"core_12_1","type":"nanite","x":280,"y":270},{"id":"core_12_2","type":"nanite","x":500,"y":400},{"id":"core_12_3","type":"nanite","x":750,"y":400}],
        featuredPower: "dash",
        playerStart: { x: 70, y: 380 },
        door: { x: 860, y: 380, width: 44, height: 64 },
        enemies: [
            { type: "smolly", x: 420, y: 422, width: 22, height: 22, minX: 340, maxX: 540, speed: 2.2, dir: 1 },
            { type: "ghost", x: 680, y: 280, width: 24, height: 26, floatRange: 60, speed: 1.6, startY: 280 }
        ],
        lasers: [
            { x: 600, y: 60, width: 12, height: 384, active: true, cycleTime: 110, onDuration: 55, timer: 0 }
        ],
        platforms: [
            { x: 40, y: 444, width: 880, height: 40, type: "solid" },
            { x: 220, y: 320, width: 140, height: 24, type: "solid" },
            { x: 460, y: 220, width: 140, height: 24, type: "solid" }
        ],
        spikes: [
            { x: 780, y: 424, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 80 }
        ],
        trollEvents: [
            {
                id: "core_breach_radio_l12",
                type: "onStart",
                run: (game) => {
                    if (window.storyManager) {
                        window.storyManager.triggerRadio('nexus', "YOU SHALL NOT REACH THE QUANTUM ABYSS. SYSTEM PURGE ENGAGED.");
                    }
                }
            }
        ]
    },

    // ========================================================================
    // ACT III: THE QUANTUM ABYSS (SECTORS 13 - 18)
    // High Difficulty: Superhero Arsenal (Wormhole, Heat Vision, Shield, Slam)
    // ========================================================================

    // ------------------------------------------------------------------------
    // SECTOR 13: "Orbital Void" (Introducing Cosmic Wormhole [T / 5])
    // ------------------------------------------------------------------------
    {
        id: 13,
        act: 3,
        actTitle: "Act III: The Quantum Abyss",
        title: "Sector 13: Orbital Void",
        subtitle: "Outer space low-gravity abyss. Teleport across cosmic voids!",
        hint: "Press [T] or [5] to Wormhole Warp across the bottomless chasm!",
        collectibles: [{"id":"shard_13","type":"shard","x":520,"y":250},{"id":"core_13_1","type":"nanite","x":220,"y":330},{"id":"core_13_2","type":"nanite","x":620,"y":210},{"id":"core_13_3","type":"nanite","x":800,"y":390}],
        cutscene: "act3_intro",
        featuredPower: "wormhole",
        isGalactic: true,
        playerStart: { x: 70, y: 350 },
        door: { x: 860, y: 350, width: 44, height: 64 },
        platforms: [
            { x: 30, y: 420, width: 180, height: 35, type: "solid" },
            { x: 280, y: 420, width: 90, height: 35, type: "asteroid", isMoving: true, minX: 260, maxX: 360, speed: 1.2 },
            // Massive void gap (must wormhole warp across)
            { x: 560, y: 420, width: 110, height: 35, type: "solid" },
            { x: 750, y: 420, width: 170, height: 35, type: "solid" }
        ],
        spikes: [
            { x: 30, y: 530, width: 900, height: 24, dir: "up" }
        ],
        enemies: [],
        trollEvents: [
            {
                id: "void_radio_l13",
                type: "onStart",
                run: (game) => {
                    game.showBanner("LOW GRAVITY DETECTED! USE WORMHOLE WARP [T]! 🌌", 2200);
                    if (window.storyManager) {
                        window.storyManager.triggerRadio('aura', "We're outside the Citadel hull! Use [T] to Wormhole Warp across the cosmic void!");
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 14: "Laser Sight Breach" (Introducing Heat Vision [Z / 6])
    // ------------------------------------------------------------------------
    {
        id: 14,
        act: 3,
        actTitle: "Act III: The Quantum Abyss",
        title: "Sector 14: Laser Sight Breach",
        subtitle: "Titanium blast barricades blocking the exit. Melt them with Heat Vision!",
        hint: "Press [Z] or [6] to fire twin optic Heat Vision lasers!",
        collectibles: [{"id":"shard_14","type":"shard","x":520,"y":380},{"id":"core_14_1","type":"nanite","x":260,"y":400},{"id":"core_14_2","type":"nanite","x":640,"y":400},{"id":"core_14_3","type":"nanite","x":780,"y":400}],
        featuredPower: "laser",
        playerStart: { x: 70, y: 380 },
        door: { x: 860, y: 380, width: 44, height: 64 },
        enemies: [
            { type: "smolly", x: 420, y: 422, width: 22, height: 22, minX: 380, maxX: 500, speed: 2.2, dir: 1 }
        ],
        platforms: [
            { x: 30, y: 444, width: 900, height: 40, type: "solid" },
            // Destructible titanium barriers (destroyed by Heat Vision)
            { x: 340, y: 300, width: 34, height: 144, type: "destructible", hp: 1 },
            { x: 640, y: 300, width: 34, height: 144, type: "destructible", hp: 1 }
        ],
        spikes: [
            { x: 760, y: 424, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 80 }
        ],
        trollEvents: [
            {
                id: "heat_radio_l14",
                type: "onStart",
                run: (game) => {
                    game.showBanner("SUPERHERO HEAT VISION UNLOCKED! PRESS [Z] / [6]! 🔥", 2200);
                    if (window.storyManager) {
                        window.storyManager.triggerRadio('aura', "Press [Z] to blast twin Heat Vision lasers and disintegrate those blast doors!");
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 15: "The Aegis Gauntlet" (Introducing Aegis Shield [X / 7])
    // ------------------------------------------------------------------------
    {
        id: 15,
        act: 3,
        actTitle: "Act III: The Quantum Abyss",
        title: "Sector 15: The Aegis Gauntlet",
        subtitle: "High-speed laser cannons & unavoidable spike drop. Activate Aegis Shield!",
        hint: "Press [X] or [7] to deploy Aegis Shield and absorb fatal hits!",
        collectibles: [{"id":"shard_15","type":"shard","x":460,"y":380},{"id":"core_15_1","type":"nanite","x":250,"y":400},{"id":"core_15_2","type":"nanite","x":620,"y":400},{"id":"core_15_3","type":"nanite","x":750,"y":400}],
        vehicles: [{"id":"veh_15","type":"rover","x":220,"y":400}],
        featuredPower: "shield",
        playerStart: { x: 70, y: 380 },
        door: { x: 860, y: 380, width: 44, height: 64 },
        lasers: [
            { x: 460, y: 40, width: 14, height: 404, active: true, cycleTime: 70, onDuration: 55, timer: 0 }
        ],
        platforms: [
            { x: 30, y: 444, width: 900, height: 40, type: "solid" }
        ],
        spikes: [
            { x: 740, y: 424, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 85 }
        ],
        trollEvents: [
            {
                id: "aegis_radio_l15",
                type: "onStart",
                run: (game) => {
                    game.showBanner("AEGIS SHIELD UNLOCKED! PRESS [X] / [7]! 🛡️", 2200);
                    if (window.storyManager) {
                        window.storyManager.triggerRadio('aura', "Aegis Shield [X] absorbs one fatal hit from spikes or lasers! Pop it on impact!");
                    }
                }
            },
            {
                id: "falling_ambush_l15",
                type: "proximity",
                targetX: 620,
                dist: 90,
                triggered: false,
                run: (game) => {
                    game.level.spikes.push({
                        x: 640, y: 40, width: 34, height: 34, dir: "down", velocityY: 9.0, isFalling: true
                    });
                    window.soundManager.playLaser();
                    game.camera.shake(12, 18);
                    game.showBanner("CEILING SPIKE DROP! POP SHIELD! 🛡️⚡", 1200);
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 16: "Hulk Seismic Vault" (Introducing Thunder Slam [C / V / 8])
    // ------------------------------------------------------------------------
    {
        id: 16,
        act: 3,
        actTitle: "Act III: The Quantum Abyss",
        title: "Sector 16: Hulk Seismic Vault",
        subtitle: "The surface is a lethal plasma bed. Jump high and Thunder Slam the deck!",
        hint: "Jump high and press [C], [V], or [8] to Thunder Slam through cracked decks!",
        collectibles: [{"id":"shard_16","type":"shard","x":480,"y":480},{"id":"core_16_1","type":"nanite","x":260,"y":200},{"id":"core_16_2","type":"nanite","x":520,"y":200},{"id":"core_16_3","type":"nanite","x":720,"y":480}],
        featuredPower: "slam",
        playerStart: { x: 70, y: 230 },
        door: { x: 850, y: 470, width: 44, height: 64 },
        enemies: [
            { type: "smolly", x: 460, y: 512, width: 22, height: 22, minX: 400, maxX: 560, speed: 2.4, dir: 1 }
        ],
        platforms: [
            // Upper deck
            { x: 30, y: 280, width: 180, height: 30, type: "solid" },
            { x: 210, y: 280, width: 140, height: 30, type: "destructible", hp: 1, isFloor: true },
            { x: 350, y: 280, width: 120, height: 30, type: "destructible", hp: 1, isFloor: true },
            { x: 470, y: 280, width: 430, height: 30, type: "solid" },
            // Lower bunker vault
            { x: 120, y: 534, width: 780, height: 40, type: "solid" }
        ],
        spikes: [
            // Surface is pure death
            { x: 470, y: 256, width: 400, height: 24, dir: "up" },
            { x: 720, y: 514, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 70 }
        ],
        trollEvents: [
            {
                id: "slam_radio_l16",
                type: "onStart",
                run: (game) => {
                    game.showBanner("THUNDER SLAM READY! JUMP & PRESS [C] / [V]! 💥", 2200);
                    if (window.storyManager) {
                        window.storyManager.triggerRadio('aura', "Surface is covered in plasma! Jump up and press [C] to Thunder Slam through the deck!");
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 17: "Event Horizon Abyss" (Gravitational Black Hole)
    // ------------------------------------------------------------------------
    {
        id: 17,
        act: 3,
        actTitle: "Act III: The Quantum Abyss",
        title: "Sector 17: Singularity Run",
        subtitle: "Gravitational vortexes ahead! Full throttle in the Apex Rover!",
        hint: "Floor the nitrous to break through the singularity gravity pull!",
        collectibles: [{"id":"shard_17","type":"shard","x":480,"y":260},{"id":"core_17_1","type":"nanite","x":260,"y":390},{"id":"core_17_2","type":"nanite","x":640,"y":390},{"id":"core_17_3","type":"nanite","x":800,"y":390}],
        vehicles: [{"id":"veh_17","type":"rover","x":120,"y":390}],
        featuredPower: "wormhole",
        isGalactic: true,
        playerStart: { x: 70, y: 380 },
        door: { x: 860, y: 380, width: 44, height: 64 },
        blackHoles: [
            { x: 460, y: 240, radius: 48, pullRadius: 360, pullForce: 0.42 }
        ],
        platforms: [
            { x: 30, y: 444, width: 220, height: 40, type: "solid" },
            { x: 380, y: 444, width: 160, height: 40, type: "solid" },
            { x: 700, y: 444, width: 220, height: 40, type: "solid" }
        ],
        spikes: [
            { x: 250, y: 520, width: 450, height: 20, dir: "up" }
        ],
        enemies: [],
        trollEvents: [
            {
                id: "blackhole_radio_l17",
                type: "onStart",
                run: (game) => {
                    game.showBanner("GRAVITATIONAL SINGULARITY ACTIVE! 🌌🌀", 2200);
                    if (window.storyManager) {
                        window.storyManager.triggerRadio('nexus', "FEEL THE PULL OF OBLIVION. EVEN LIGHT CANNOT ESCAPE.");
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 18: "Quantum Phantasm Ambush" (Act III Climax)
    // ------------------------------------------------------------------------
    {
        id: 18,
        act: 3,
        actTitle: "Act III: The Quantum Abyss",
        title: "Sector 18: Quantum Phantasm Ambush",
        subtitle: "Phantasms & Sentry drones coordinated with rapid beam lasers.",
        hint: "Shield [X] blocks phantasm strikes; Heat Vision [Z] vaporizes sentries!",
        collectibles: [{"id":"shard_18","type":"shard","x":500,"y":380},{"id":"core_18_1","type":"nanite","x":240,"y":400},{"id":"core_18_2","type":"nanite","x":620,"y":400},{"id":"core_18_3","type":"nanite","x":760,"y":400}],
        featuredPower: "shield",
        playerStart: { x: 60, y: 380 },
        door: { x: 860, y: 380, width: 44, height: 64 },
        enemies: [
            { type: "smolly", x: 380, y: 422, width: 22, height: 22, minX: 300, maxX: 460, speed: 2.4, dir: 1 },
            { type: "ghost", x: 640, y: 300, width: 24, height: 26, floatRange: 70, speed: 2.2, startY: 300 }
        ],
        lasers: [
            { x: 520, y: 40, width: 12, height: 404, active: true, cycleTime: 80, onDuration: 40, timer: 0 }
        ],
        platforms: [
            { x: 30, y: 444, width: 880, height: 40, type: "solid" },
            { x: 260, y: 300, width: 140, height: 24, type: "solid" }
        ],
        spikes: [
            { x: 760, y: 424, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 75 }
        ],
        trollEvents: [
            {
                id: "act3_climax_radio_l18",
                type: "onStart",
                run: (game) => {
                    if (window.storyManager) {
                        window.storyManager.triggerRadio('aura', "We're on the doorstep of the Core! Keep your shields charged!");
                    }
                }
            }
        ]
    },

    // ========================================================================
    // ACT IV: THE SINGULARITY HEIST (SECTORS 19 - 24)
    // Master Troll Gauntlet, Nexus-9 Boss Showdown & Hyperspace Escape
    // ========================================================================

    // ------------------------------------------------------------------------
    // SECTOR 19: "Solar Flare Array" (Dual Sweeping Lasers)
    // ------------------------------------------------------------------------
    {
        id: 19,
        act: 4,
        actTitle: "Act IV: The Singularity Heist",
        title: "Sector 19: Solar Flare Array",
        subtitle: "Synchronized dual solar beams and falling hyper-plasma.",
        hint: "Combine Chronos Slow [E] and Aegis Shield [X] to thread the beams!",
        collectibles: [{"id":"shard_19","type":"shard","x":480,"y":380},{"id":"core_19_1","type":"nanite","x":220,"y":400},{"id":"core_19_2","type":"nanite","x":560,"y":400},{"id":"core_19_3","type":"nanite","x":740,"y":400}],
        cutscene: "act4_intro",
        featuredPower: "slowmo",
        playerStart: { x: 70, y: 380 },
        door: { x: 860, y: 380, width: 44, height: 64 },
        lasers: [
            { x: 380, y: 40, width: 14, height: 404, active: true, cycleTime: 90, onDuration: 45, timer: 0 },
            { x: 620, y: 40, width: 14, height: 404, active: true, cycleTime: 90, onDuration: 45, timer: 45 }
        ],
        platforms: [
            { x: 30, y: 444, width: 900, height: 40, type: "solid" },
            { x: 440, y: 280, width: 120, height: 24, type: "solid" }
        ],
        spikes: [
            { x: 750, y: 424, width: 50, height: 20, dir: "up", isHidden: true, triggerDist: 80 }
        ],
        enemies: [],
        trollEvents: [
            {
                id: "solar_radio_l19",
                type: "onStart",
                run: (game) => {
                    game.showBanner("SOLAR FLARE ARRAY ACTIVE! ☀️⚡", 2000);
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 20: "The Mirror Dimension" (Double Gravity Flip Puzzle)
    // ------------------------------------------------------------------------
    {
        id: 20,
        act: 4,
        actTitle: "Act IV: The Singularity Heist",
        title: "Sector 20: The Mirror Dimension",
        subtitle: "Inverted fields and ceiling corridors. Flip gravity between decks!",
        hint: "Use [Q] / [F] to alternate between floor and ceiling decks.",
        collectibles: [{"id":"shard_20","type":"shard","x":480,"y":240},{"id":"core_20_1","type":"nanite","x":240,"y":120},{"id":"core_20_2","type":"nanite","x":540,"y":120},{"id":"core_20_3","type":"nanite","x":720,"y":400}],
        featuredPower: "gravity",
        playerStart: { x: 70, y: 370 },
        door: { x: 850, y: 380, width: 44, height: 64 },
        platforms: [
            { x: 30, y: 444, width: 280, height: 40, type: "solid" },
            { x: 30, y: 70, width: 880, height: 35, type: "solid" },
            { x: 310, y: 444, width: 320, height: 40, type: "solid" },
            { x: 630, y: 444, width: 280, height: 40, type: "solid" }
        ],
        spikes: [
            { x: 310, y: 420, width: 320, height: 24, dir: "up" },
            { x: 480, y: 105, width: 80, height: 20, dir: "down" }
        ],
        enemies: [],
        trollEvents: [
            {
                id: "mirror_radio_l20",
                type: "onStart",
                run: (game) => {
                    game.showBanner("MIRROR CORRIDOR: INVERT GRAVITY TO PASS! 🚀", 2200);
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 21: "Overclock Meltdown" (Progressive Room De-allocation)
    // ------------------------------------------------------------------------
    {
        id: 21,
        act: 4,
        actTitle: "Act IV: The Singularity Heist",
        title: "Sector 21: Overclock Meltdown",
        subtitle: "Red alert! Mainframe de-allocating floor decks from left to right!",
        hint: "Don't stop moving! Dash, jump, and Thunder Slam through obstacles!",
        collectibles: [{"id":"shard_21","type":"shard","x":500,"y":380},{"id":"core_21_1","type":"nanite","x":220,"y":400},{"id":"core_21_2","type":"nanite","x":600,"y":320},{"id":"core_21_3","type":"nanite","x":780,"y":400}],
        featuredPower: "dash",
        playerStart: { x: 60, y: 380 },
        door: { x: 870, y: 380, width: 44, height: 64 },
        platforms: [
            { x: 30, y: 444, width: 140, height: 40, type: "collapse", delay: 90 },
            { x: 170, y: 444, width: 140, height: 40, type: "collapse", delay: 130 },
            { x: 310, y: 444, width: 140, height: 40, type: "collapse", delay: 170 },
            { x: 450, y: 444, width: 140, height: 40, type: "collapse", delay: 210 },
            { x: 590, y: 444, width: 140, height: 40, type: "collapse", delay: 250 },
            { x: 730, y: 444, width: 200, height: 40, type: "solid" }
        ],
        spikes: [
            { x: 30, y: 520, width: 700, height: 24, dir: "up" },
            { x: 800, y: 424, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 70 }
        ],
        enemies: [],
        trollEvents: [
            {
                id: "meltdown_radio_l21",
                type: "onStart",
                run: (game) => {
                    game.showBanner("OVERCLOCK MELTDOWN: SPRINT TO THE RIGHT! ⚠️🔥", 2200);
                    if (window.storyManager) {
                        window.storyManager.triggerRadio('nexus', "PURGING SECTOR MEMORY IN 5... 4... 3...");
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 22: "Mach-3 Gate Pursuit" (Multi-Tier Runaway Gate)
    // ------------------------------------------------------------------------
    {
        id: 22,
        act: 4,
        actTitle: "Act IV: The Singularity Heist",
        title: "Sector 22: Mach-3 Gate Pursuit",
        subtitle: "The Stargate is hyper-accelerating across three vertical decks!",
        hint: "Chain Wormhole Warp [T] and Phase Shift [SHIFT] to catch the gate!",
        collectibles: [{"id":"shard_22","type":"shard","x":480,"y":220},{"id":"core_22_1","type":"nanite","x":260,"y":320},{"id":"core_22_2","type":"nanite","x":620,"y":220},{"id":"core_22_3","type":"nanite","x":800,"y":120}],
        featuredPower: "wormhole",
        playerStart: { x: 70, y: 380 },
        door: { x: 750, y: 380, width: 44, height: 64, canFlee: true, fleeSpeed: 7.0, fled: false },
        platforms: [
            // Deck 1 (Bottom)
            { x: 40, y: 444, width: 880, height: 40, type: "solid" },
            // Deck 2 (Middle)
            { x: 260, y: 290, width: 240, height: 24, type: "solid" },
            // Deck 3 (Top)
            { x: 620, y: 160, width: 260, height: 24, type: "solid" }
        ],
        spikes: [
            { x: 420, y: 424, width: 60, height: 20, dir: "up", isHidden: true, triggerDist: 80 }
        ],
        enemies: [
            { type: "ghost", x: 480, y: 220, width: 24, height: 26, floatRange: 50, speed: 2.0, startY: 220 }
        ],
        trollEvents: [
            {
                id: "mach3_flee_l22",
                type: "proximity",
                targetX: 660,
                dist: 110,
                triggered: false,
                run: (game) => {
                    const door = game.level.door;
                    if (door && !door.fled) {
                        door.fled = true;
                        window.soundManager.playDoorFlee();
                        window.soundManager.playTroll();
                        game.showBanner("GATE ESCAPED TO DECK 3! USE WORMHOLE [T]! 🚀💨", 2000);
                        door.targetY = 96;
                        door.targetX = 760;
                        door.isMoving = true;
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 23: "Nexus-9 Core Confrontation (Boss Battle)"
    // ------------------------------------------------------------------------
    {
        id: 23,
        act: 4,
        actTitle: "Act IV: The Singularity Heist",
        title: "Sector 23: Nexus-9 Core Confrontation",
        subtitle: "The Boss! Defeat Nexus-9's Mainframe Eye to claim the Chronos Heart!",
        hint: "Melt barriers with Laser [Z], block attacks with Shield [X], slam core with [C]!",
        collectibles: [{"id":"shard_23","type":"shard","x":480,"y":380},{"id":"core_23_1","type":"nanite","x":180,"y":400},{"id":"core_23_2","type":"nanite","x":340,"y":400},{"id":"core_23_3","type":"nanite","x":620,"y":400},{"id":"core_23_4","type":"nanite","x":780,"y":400}],
        cutscene: "boss_intro",
        featuredPower: "all",
        isBossLevel: true,
        playerStart: { x: 70, y: 220 },
        door: { x: 860, y: 460, width: 44, height: 64, isBossCoreDoor: true },
        boss: {
            name: "NEXUS-9 CORE",
            x: 480,
            y: 130,
            radius: 54,
            hp: 3,
            maxHp: 3,
            state: "shielded", // "shielded" -> "exposed" -> "defeated"
            laserTimer: 0
        },
        enemies: [
            { type: "smolly", x: 280, y: 258, width: 22, height: 22, minX: 240, maxX: 360, speed: 2.6, dir: 1 }
        ],
        lasers: [
            { x: 480, y: 190, width: 14, height: 320, active: true, cycleTime: 100, onDuration: 50, timer: 20 }
        ],
        platforms: [
            // Upper battle deck
            { x: 30, y: 280, width: 180, height: 30, type: "solid" },
            // Destructible optic conduit barrier 1
            { x: 210, y: 180, width: 34, height: 100, type: "destructible", hp: 1 },
            { x: 244, y: 280, width: 200, height: 30, type: "solid" },
            // Destructible cracked floor deck over reactor core
            { x: 444, y: 280, width: 120, height: 30, type: "destructible", hp: 1, isFloor: true },
            { x: 564, y: 280, width: 360, height: 30, type: "solid" },
            // Lower reactor deck
            { x: 140, y: 524, width: 780, height: 40, type: "solid" }
        ],
        spikes: [
            { x: 30, y: 540, width: 110, height: 24, dir: "up" },
            { x: 780, y: 504, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 75 }
        ],
        trollEvents: [
            {
                id: "boss_intro_radio_l23",
                type: "onStart",
                run: (game) => {
                    game.showBanner("BOSS BATTLE: NEXUS-9 CENTRAL CORE! 👁️🔥", 2500);
                    if (window.storyManager) {
                        window.storyManager.triggerRadio('nexus', "YOUR EXTINCTION EVENT IS NOW COMMENCING.");
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // SECTOR 24: "Quantum Heist: Hyperspace Escape" (The Grand Finale!)
    // ------------------------------------------------------------------------
    {
        id: 24,
        act: 4,
        actTitle: "Act IV: The Singularity Heist",
        title: "Sector 24: Grand Cosmic Escape",
        subtitle: "The Citadel is collapsing! Floor the Apex Rover into the final Cosmic Gate!",
        hint: "Drive at Mach-3, pop nitro, and leap through the starlight to freedom!",
        collectibles: [{"id":"shard_24","type":"shard","x":540,"y":330},{"id":"core_24_1","type":"nanite","x":180,"y":170},{"id":"core_24_2","type":"nanite","x":360,"y":170},{"id":"core_24_3","type":"nanite","x":600,"y":330},{"id":"core_24_4","type":"nanite","x":780,"y":480}],
        vehicles: [{"id":"veh_24","type":"rover","x":80,"y":165}],
        featuredPower: "all",
        isFinalCosmic: true,
        isGalactic: true,
        playerStart: { x: 60, y: 160 },
        door: { x: 870, y: 460, width: 44, height: 64, isFinalCosmic: true },
        enemies: [
            { type: "smolly", x: 260, y: 188, width: 22, height: 22, minX: 220, maxX: 360, speed: 2.8, dir: 1 },
            { type: "ghost", x: 600, y: 340, width: 24, height: 26, floatRange: 80, speed: 2.4, startY: 340 }
        ],
        lasers: [
            { x: 520, y: 30, width: 14, height: 490, active: true, cycleTime: 120, onDuration: 60, timer: 30 }
        ],
        platforms: [
            { x: 30, y: 210, width: 180, height: 30, type: "solid" },
            { x: 210, y: 110, width: 34, height: 100, type: "destructible", hp: 1 },
            { x: 244, y: 210, width: 180, height: 30, type: "solid" },
            { x: 424, y: 210, width: 110, height: 30, type: "destructible", hp: 1, isFloor: true },
            { x: 534, y: 380, width: 160, height: 30, type: "collapse", delay: 110 },
            { x: 720, y: 524, width: 210, height: 40, type: "solid" }
        ],
        spikes: [
            { x: 30, y: 550, width: 690, height: 24, dir: "up" },
            { x: 790, y: 504, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 75 }
        ],
        trollEvents: [
            {
                id: "grand_finale_radio_l24",
                type: "onStart",
                run: (game) => {
                    game.showBanner("FINAL HEIST ESCAPE: HYPERSPACE GATE AHEAD! 🌌🏆", 3000);
                    if (window.storyManager) {
                        window.storyManager.triggerRadio('aura', "We have the Chronos Heart! Reach the Final Cosmic Gate to escape!");
                    }
                }
            },
            {
                id: "fleeing_final_gate_l24",
                type: "proximity",
                targetX: 840,
                dist: 90,
                triggered: false,
                run: (game) => {
                    if (game.level.door) {
                        game.level.door.y = 280;
                        game.camera.shake(12, 20);
                        window.soundManager.playTroll();
                        game.showBanner("GATE TELEPORTING TO CEILING! USE WORMHOLE WARP [T]!", 2600);
                    }
                }
            }
        ]
    }
];

if (typeof window !== "undefined") {
    window.LEVELS = LEVELS;
    window.TROLL_DEATH_QUOTES = TROLL_DEATH_QUOTES;
}
