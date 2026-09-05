// ============================================================================
// ASTRO GLITCH: QUANTUM HEIST - LEVELS & ANOMALY EVENTS CONFIGURATION
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
    "Singularity detected: You are now cosmic spaghetti."
];

const LEVELS = [
    // ------------------------------------------------------------------------
    // LEVEL 1: "Protocol Alpha" - Introduction to Phase Shift (Shift)
    // ------------------------------------------------------------------------
    {
        id: 1,
        title: "Protocol Alpha",
        subtitle: "A routine walk to the Stargate. What could go wrong?",
        hint: "Press [SHIFT] to Phase Shift through barriers & plasma!",
        featuredPower: "dash",
        playerStart: { x: 80, y: 380 },
        door: { x: 840, y: 380, width: 44, height: 64 },
        enemies: [
            { type: "smolly", x: 480, y: 422, width: 22, height: 22, minX: 445, maxX: 565, speed: 2.0, dir: 1 }
        ],
        platforms: [
            { x: 40, y: 444, width: 220, height: 40, type: "solid" },
            { x: 260, y: 444, width: 90, height: 40, type: "collapse", delay: 180 },
            { x: 350, y: 444, width: 90, height: 40, type: "collapse", delay: 120 },
            { x: 440, y: 444, width: 140, height: 40, type: "solid" },
            { x: 650, y: 280, width: 30, height: 164, type: "fake_wall", hintText: "PHASE" },
            { x: 650, y: 444, width: 270, height: 40, type: "solid" }
        ],
        spikes: [
            { x: 260, y: 520, width: 180, height: 20, dir: "up" },
            { x: 740, y: 424, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 90 }
        ],
        trollEvents: [
            {
                id: "popup_plasma_l1",
                type: "proximity",
                targetX: 740,
                dist: 90,
                triggered: false,
                run: (game) => {
                    const spike = game.level.spikes.find(s => s.x === 740 && s.isHidden);
                    if (spike) {
                        spike.isHidden = false;
                        game.particles.createSparks(spike.x + 20, spike.y + 10, '#ff0055', 12);
                        window.soundManager.playTroll();
                        game.showBanner("PLASMA NODE SURPRISE! ⚡", 1000);
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // LEVEL 2: "The Evasive Stargate" - Introduction to Chronos Dilation (E)
    // ------------------------------------------------------------------------
    {
        id: 2,
        title: "The Evasive Stargate",
        subtitle: "The Stargate has fired thrusters and is escaping!",
        hint: "Press [E] for Chronos Slow, or [SHIFT] to boost catch the gate!",
        featuredPower: "slowmo",
        playerStart: { x: 80, y: 380 },
        door: { x: 750, y: 380, width: 44, height: 64, canFlee: true, fleeSpeed: 5.5, fled: false },
        platforms: [
            { x: 40, y: 444, width: 880, height: 40, type: "solid" },
            { x: 300, y: 310, width: 120, height: 24, type: "solid" },
            { x: 500, y: 220, width: 140, height: 24, type: "solid" },
            { x: 720, y: 150, width: 140, height: 24, type: "solid" }
        ],
        spikes: [
            { x: 400, y: 424, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 80 },
            { x: 600, y: 424, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 80 }
        ],
        trollEvents: [
            {
                id: "door_flee",
                type: "proximity",
                targetX: 620,
                dist: 120,
                triggered: false,
                run: (game) => {
                    const door = game.level.door;
                    if (!door.fled) {
                        door.fled = true;
                        window.soundManager.playDoorFlee();
                        window.soundManager.playTroll();
                        game.showBanner("STARGATE THRUSTERS ENGAGED! 🚀💨", 1600);
                        game.camera.shake(8, 20);
                        door.targetY = 86;
                        door.targetX = 760;
                        door.isMoving = true;
                    }
                }
            },
            {
                id: "popup_plasma_floor",
                type: "proximity",
                targetX: 400,
                dist: 80,
                triggered: false,
                run: (game) => {
                    const spike = game.level.spikes.find(s => s.x === 400);
                    if (spike) {
                        spike.isHidden = false;
                        game.particles.createSparks(spike.x + 20, spike.y + 10, '#ff0055', 10);
                    }
                }
            },
            {
                id: "popup_plasma_floor2",
                type: "proximity",
                targetX: 600,
                dist: 80,
                triggered: false,
                run: (game) => {
                    const spike = game.level.spikes.find(s => s.x === 600);
                    if (spike) {
                        spike.isHidden = false;
                        game.particles.createSparks(spike.x + 20, spike.y + 10, '#ff0055', 10);
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // LEVEL 3: "Crusher Array" - Chronos Slow & Crushing Security Walls
    // ------------------------------------------------------------------------
    {
        id: 3,
        title: "Crusher Array",
        subtitle: "Defense grid closing down. Chronos Dilation required.",
        hint: "Hold [E] to Slow Time when the crushing bulkhead slams!",
        featuredPower: "slowmo",
        playerStart: { x: 70, y: 380 },
        door: { x: 860, y: 380, width: 44, height: 64 },
        platforms: [
            { x: 30, y: 444, width: 900, height: 40, type: "solid" },
            { x: 260, y: 60, width: 380, height: 100, type: "crusher", startY: 60, targetY: 344, speed: 10, triggered: false },
            { x: 420, y: 240, width: 60, height: 20, type: "solid" }
        ],
        spikes: [
            { x: 260, y: 160, width: 380, height: 20, dir: "down", attachedToCrusher: true },
            { x: 680, y: 424, width: 50, height: 20, dir: "up", isHidden: true, triggerDist: 70 }
        ],
        trollEvents: [
            {
                id: "bulkhead_drop",
                type: "proximity",
                targetX: 280,
                dist: 90,
                triggered: false,
                run: (game) => {
                    const crusher = game.level.platforms.find(p => p.type === "crusher");
                    if (crusher && !crusher.triggered) {
                        crusher.triggered = true;
                        game.camera.shake(14, 25);
                        window.soundManager.playTroll();
                        game.showBanner("CONTAINMENT BULKHEAD SLAM! ⚠️", 1400);
                    }
                }
            },
            {
                id: "spike_end_l3",
                type: "proximity",
                targetX: 680,
                dist: 70,
                triggered: false,
                run: (game) => {
                    const spike = game.level.spikes.find(s => s.x === 680);
                    if (spike) spike.isHidden = false;
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // LEVEL 4: "Polarity Inversion" - Magnetic Gravity Invert (W or Space)
    // ------------------------------------------------------------------------
    {
        id: 4,
        title: "Polarity Inversion",
        subtitle: "Floor is flooded with plasma. Invert magnetic polarity!",
        hint: "Press [W] or Double-Jump to INVERT GRAVITY and walk on ceiling!",
        featuredPower: "gravity",
        playerStart: { x: 80, y: 370 },
        door: { x: 850, y: 100, width: 44, height: 64, upsideDown: true },
        platforms: [
            { x: 40, y: 444, width: 120, height: 40, type: "solid" },
            { x: 40, y: 60, width: 880, height: 35, type: "solid" },
            { x: 340, y: 95, width: 30, height: 80, type: "fake_wall" },
            { x: 560, y: 95, width: 40, height: 90, type: "solid" },
            { x: 700, y: 95, width: 30, height: 80, type: "fake_wall" }
        ],
        spikes: [
            { x: 160, y: 444, width: 760, height: 24, dir: "up" },
            { x: 440, y: 95, width: 60, height: 20, dir: "down" }
        ],
        trollEvents: [
            {
                id: "gravity_hint",
                type: "onStart",
                run: (game) => {
                    game.showBanner("FLOOR IS PLASMA. INVERT POLARITY! 🚀", 1800);
                }
            },
            {
                id: "ceiling_trap",
                type: "proximity",
                targetX: 520,
                dist: 80,
                triggered: false,
                run: (game) => {
                    game.level.spikes.push({
                        x: 580, y: 95, width: 24, height: 24, dir: "down", velocityY: 6, isFalling: true
                    });
                    window.soundManager.playTroll();
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // LEVEL 5: "Temporal Paradox Buffer" - Introduction to Quantum Rewind (R)
    // ------------------------------------------------------------------------
    {
        id: 5,
        title: "Temporal Paradox",
        subtitle: "A deceptive decoy portal. Good thing you can rewind time!",
        hint: "Press [R] to REWIND time 2.5 seconds when trapped!",
        featuredPower: "rewind",
        playerStart: { x: 70, y: 380 },
        door: { x: 840, y: 380, width: 44, height: 64, isFakeTroll: true },
        realDoor: { x: 840, y: 160, width: 44, height: 64, isRevealed: false },
        enemies: [
            { type: "ghost", x: 620, y: 280, width: 24, height: 26, floatRange: 50, speed: 1.3, startY: 280 }
        ],
        platforms: [
            { x: 40, y: 444, width: 280, height: 40, type: "solid" },
            { x: 320, y: 444, width: 160, height: 40, type: "sinker", sinkSpeed: 8 },
            { x: 480, y: 444, width: 440, height: 40, type: "solid" },
            { x: 760, y: 224, width: 160, height: 30, type: "secret_platform", opacity: 0 }
        ],
        spikes: [
            { x: 320, y: 520, width: 160, height: 20, dir: "up" },
            { x: 780, y: 424, width: 60, height: 20, dir: "up", isHidden: true, triggerDist: 90 }
        ],
        trollEvents: [
            {
                id: "fake_door_trap",
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
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // LEVEL 6: "Memory Corrupt Field" - Neural Inversion
    // ------------------------------------------------------------------------
    {
        id: 6,
        title: "Memory Corrupt Field",
        subtitle: "Controls glitch and invert inside the corrupted purple grid!",
        hint: "Phase Shift [SHIFT] right through the Inversion Field!",
        featuredPower: "dash",
        playerStart: { x: 70, y: 380 },
        door: { x: 860, y: 380, width: 44, height: 64 },
        platforms: [
            { x: 40, y: 444, width: 220, height: 40, type: "solid" },
            { x: 280, y: 444, width: 90, height: 30, type: "moving_h", minX: 270, maxX: 430, speed: 2.5 },
            { x: 450, y: 444, width: 160, height: 40, type: "solid" },
            { x: 450, y: 220, width: 160, height: 224, type: "inversion_zone" },
            { x: 640, y: 444, width: 110, height: 40, type: "collapse", delay: 100 },
            { x: 770, y: 444, width: 150, height: 40, type: "solid" }
        ],
        spikes: [
            { x: 260, y: 520, width: 190, height: 20, dir: "up" },
            { x: 640, y: 520, width: 110, height: 20, dir: "up" },
            { x: 520, y: 340, width: 30, height: 30, dir: "down", isHidden: true, triggerDist: 70 }
        ],
        trollEvents: [
            {
                id: "inversion_trigger",
                type: "inversion_check",
                run: (game) => {
                    const zone = game.level.platforms.find(p => p.type === "inversion_zone");
                    if (!zone) return;
                    const p = game.player;
                    const inZone = (p.x + p.width > zone.x && p.x < zone.x + zone.width &&
                                   p.y + p.height > zone.y && p.y < zone.y + zone.height);
                    if (inZone && !p.isPhasing) {
                        game.player.controlsInverted = true;
                    } else {
                        game.player.controlsInverted = false;
                    }
                }
            },
            {
                id: "spike_inversion_surprise",
                type: "proximity",
                targetX: 520,
                dist: 70,
                triggered: false,
                run: (game) => {
                    const s = game.level.spikes.find(sp => sp.x === 520 && sp.isHidden);
                    if (s) s.isHidden = false;
                    window.soundManager.playTroll();
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // LEVEL 7: "The Trap Honeypot" - Systems React to Power Usage
    // ------------------------------------------------------------------------
    {
        id: 7,
        title: "The Trap Honeypot",
        subtitle: "Caution: Floor sensors trigger on Phase Boost! Take high route!",
        hint: "Combine Chronos Slow [E] + Gravity Flip [W] to take high catwalk!",
        featuredPower: "all",
        playerStart: { x: 70, y: 380 },
        door: { x: 860, y: 140, width: 44, height: 64 },
        platforms: [
            { x: 40, y: 444, width: 200, height: 40, type: "solid" },
            { x: 240, y: 444, width: 440, height: 40, type: "bait_floor", dropsOnDash: true },
            { x: 680, y: 444, width: 240, height: 40, type: "solid" },
            { x: 180, y: 160, width: 180, height: 25, type: "solid" },
            { x: 440, y: 140, width: 220, height: 25, type: "solid" },
            { x: 740, y: 204, width: 180, height: 30, type: "solid" }
        ],
        spikes: [
            { x: 240, y: 520, width: 440, height: 20, dir: "up" },
            { x: 380, y: 60, width: 40, height: 20, dir: "down" }
        ],
        trollEvents: [
            {
                id: "bait_floor_collapse",
                type: "custom",
                run: (game) => {
                    const floor = game.level.platforms.find(p => p.type === "bait_floor");
                    if (floor && !floor.collapsed && game.player.isPhasing && game.player.x > 240 && game.player.x < 680) {
                        floor.collapsed = true;
                        floor.y += 300;
                        game.camera.shake(12, 20);
                        window.soundManager.playTroll();
                        game.showBanner("SENSOR DETECTED BOOST! FLOOR DE-REZZED! 💥", 1500);
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // LEVEL 8: "Mainframe Core Showdown"
    // ------------------------------------------------------------------------
    {
        id: 8,
        title: "Mainframe Core Showdown",
        subtitle: "Phase, Slow, Flip, Rewind! Outplay the Core Security!",
        hint: "Combine all 4 systems to breach the Mainframe!",
        featuredPower: "all",
        playerStart: { x: 70, y: 380 },
        door: { x: 860, y: 380, width: 44, height: 64, isFinalDoor: true, finalTrollDone: false },
        enemies: [
            { type: "smolly", x: 440, y: 338, width: 22, height: 22, minX: 425, maxX: 515, speed: 2.4, dir: 1 },
            { type: "ghost", x: 740, y: 320, width: 24, height: 26, floatRange: 40, speed: 1.4, startY: 320 }
        ],
        platforms: [
            { x: 30, y: 444, width: 160, height: 40, type: "solid" },
            { x: 220, y: 380, width: 70, height: 100, type: "collapse", delay: 90 },
            { x: 330, y: 140, width: 200, height: 25, type: "solid" },
            { x: 420, y: 360, width: 110, height: 25, type: "solid" },
            { x: 620, y: 220, width: 30, height: 224, type: "fake_wall", hintText: "CORE BARRIER" },
            { x: 680, y: 444, width: 250, height: 40, type: "solid" }
        ],
        spikes: [
            { x: 190, y: 520, width: 490, height: 20, dir: "up" },
            { x: 750, y: 424, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 80 }
        ],
        trollEvents: [
            {
                id: "final_door_trick",
                type: "proximity",
                targetX: 800,
                dist: 90,
                triggered: false,
                run: (game) => {
                    const door = game.level.door;
                    if (!door.finalTrollDone) {
                        door.finalTrollDone = true;
                        window.soundManager.playDoorFlee();
                        window.soundManager.playTroll();
                        game.camera.shake(18, 30);
                        game.showBanner("SECURITY PROTOCOL OVERRIDE! WATCH THE FLOOR! ⚠️", 1600);
                        const endPlat = game.level.platforms.find(p => p.x === 680);
                        if (endPlat) {
                            endPlat.x += 40;
                        }
                    }
                }
            },
            {
                id: "final_spike_reveal",
                type: "proximity",
                targetX: 750,
                dist: 80,
                triggered: false,
                run: (game) => {
                    const s = game.level.spikes.find(sp => sp.x === 750 && s.isHidden);
                    if (s) s.isHidden = false;
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // LEVEL 9: "Zero-G Exfiltration" (Galactic Theme - Wormhole Warp)
    // ------------------------------------------------------------------------
    {
        id: 9,
        title: "Zero-G Exfiltration",
        subtitle: "Outer space sector! Press [T] or [C] for Wormhole Warp!",
        hint: "Press [T] or [C] for COSMIC WORMHOLE WARP across space voids!",
        isGalactic: true,
        featuredPower: "wormhole",
        playerStart: { x: 80, y: 380 },
        door: { x: 850, y: 220, width: 44, height: 64, isMoving: false },
        enemies: [
            { type: "ghost", x: 460, y: 220, width: 24, height: 26, floatRange: 45, speed: 1.4, startY: 220 }
        ],
        platforms: [
            { x: 40, y: 444, width: 180, height: 40, type: "asteroid" },
            { x: 270, y: 370, width: 100, height: 30, type: "asteroid" },
            { x: 420, y: 280, width: 90, height: 30, type: "collapse", delay: 140 },
            { x: 570, y: 200, width: 90, height: 30, type: "asteroid" },
            { x: 740, y: 284, width: 180, height: 40, type: "asteroid" }
        ],
        spikes: [
            { x: 220, y: 520, width: 520, height: 20, dir: "up" },
            { x: 460, y: 250, width: 30, height: 24, dir: "down", isHidden: true, triggerDist: 80 }
        ],
        trollEvents: [
            {
                id: "mine_reveal_l9",
                type: "proximity",
                targetX: 460,
                dist: 80,
                triggered: false,
                run: (game) => {
                    const s = game.level.spikes.find(sp => sp.x === 460);
                    if (s) {
                        s.isHidden = false;
                        window.soundManager.playTroll();
                        game.showBanner("PROXIMITY SPACE MINE! 💣", 1400);
                    }
                }
            },
            {
                id: "door_float_l9",
                type: "proximity",
                targetX: 740,
                dist: 110,
                triggered: false,
                run: (game) => {
                    const door = game.level.door;
                    if (!door.drifted) {
                        door.drifted = true;
                        door.targetX = 850;
                        door.targetY = 120;
                        door.isMoving = true;
                        window.soundManager.playDoorFlee();
                        window.soundManager.playTroll();
                        game.showBanner("STARGATE IN ORBITAL DRIFT! 🛰️💨", 1600);
                    }
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // LEVEL 10: "Event Horizon Singularity"
    // ------------------------------------------------------------------------
    {
        id: 10,
        title: "Event Horizon",
        subtitle: "Black hole gravitational pull active. Wormhole or get spaghettified!",
        hint: "The Singularity pulls you in! Use [T] Wormhole Warp or [SHIFT] Boost!",
        isGalactic: true,
        featuredPower: "wormhole",
        playerStart: { x: 70, y: 380 },
        door: { x: 860, y: 380, width: 44, height: 64 },
        blackHoles: [
            { x: 480, y: 240, radius: 240, pullStrength: 0.42, mass: 35 }
        ],
        platforms: [
            { x: 40, y: 444, width: 220, height: 40, type: "asteroid" },
            { x: 300, y: 444, width: 90, height: 35, type: "asteroid" },
            { x: 570, y: 444, width: 90, height: 35, type: "asteroid" },
            { x: 700, y: 444, width: 220, height: 40, type: "asteroid" },
            { x: 380, y: 110, width: 200, height: 26, type: "asteroid" }
        ],
        spikes: [
            { x: 260, y: 520, width: 440, height: 20, dir: "up" },
            { x: 440, y: 136, width: 80, height: 20, dir: "down" }
        ],
        trollEvents: [
            {
                id: "black_hole_warning",
                type: "onStart",
                run: (game) => {
                    window.soundManager.playBlackHoleHum();
                    game.showBanner("BEWARE THE EVENT HORIZON! 🕳️", 2000);
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // LEVEL 11: "Solar Laser Matrix"
    // ------------------------------------------------------------------------
    {
        id: 11,
        title: "Laser Matrix",
        subtitle: "Solar defense lasers cycling. Chronos Slow is essential.",
        hint: "Hold [E] to Slow Time while passing through pulsing solar lasers!",
        isGalactic: true,
        featuredPower: "slowmo",
        playerStart: { x: 70, y: 380 },
        door: { x: 860, y: 200, width: 44, height: 64 },
        lasers: [
            { x: 340, y: 40, width: 14, height: 440, active: true, cycleTime: 160, onDuration: 90, timer: 0 },
            { x: 620, y: 40, width: 14, height: 440, active: true, cycleTime: 160, onDuration: 90, timer: 80 }
        ],
        platforms: [
            { x: 40, y: 444, width: 240, height: 40, type: "asteroid" },
            { x: 370, y: 370, width: 100, height: 30, type: "asteroid" },
            { x: 500, y: 280, width: 100, height: 30, type: "collapse", delay: 100 },
            { x: 650, y: 264, width: 120, height: 30, type: "asteroid" },
            { x: 790, y: 264, width: 130, height: 30, type: "asteroid" }
        ],
        spikes: [
            { x: 280, y: 520, width: 520, height: 20, dir: "up" },
            { x: 670, y: 240, width: 40, height: 24, dir: "up", isHidden: true, triggerDist: 70 }
        ],
        trollEvents: [
            {
                id: "meteor_drop_l11",
                type: "proximity",
                targetX: 520,
                dist: 80,
                triggered: false,
                run: (game) => {
                    game.level.spikes.push({
                        x: 520, y: 40, width: 26, height: 26, dir: "down", velocityY: 9, isFalling: true
                    });
                    window.soundManager.playLaser();
                    window.soundManager.playTroll();
                    game.showBanner("INCOMING METEOR STRIKE! ☄️", 1200);
                }
            },
            {
                id: "spike_reveal_l11",
                type: "proximity",
                targetX: 670,
                dist: 70,
                triggered: false,
                run: (game) => {
                    const s = game.level.spikes.find(sp => sp.x === 670);
                    if (s) s.isHidden = false;
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // LEVEL 12: "The Cosmic Overlord AI"
    // ------------------------------------------------------------------------
    {
        id: 12,
        title: "The Cosmic Overlord AI",
        subtitle: "Black holes, meteors, lasers, and quantum anomalies! GODSPEED!",
        hint: "Engage ALL 5 POWERS! Warp, Shift, Slow, Flip, Rewind!",
        isGalactic: true,
        featuredPower: "all",
        playerStart: { x: 70, y: 380 },
        door: { x: 860, y: 150, width: 44, height: 64, isFinalCosmic: true },
        enemies: [
            { type: "smolly", x: 200, y: 78, width: 22, height: 22, minX: 165, maxX: 345, speed: 2.6, dir: 1 },
            { type: "ghost", x: 520, y: 220, width: 24, height: 26, floatRange: 60, speed: 1.6, startY: 220 }
        ],
        blackHoles: [
            { x: 500, y: 320, radius: 210, pullStrength: 0.38, mass: 30 }
        ],
        lasers: [
            { x: 680, y: 40, width: 14, height: 420, active: true, cycleTime: 180, onDuration: 90, timer: 40 }
        ],
        platforms: [
            { x: 30, y: 444, width: 180, height: 40, type: "asteroid" },
            { x: 160, y: 100, width: 200, height: 30, type: "asteroid" },
            { x: 360, y: 390, width: 80, height: 30, type: "sinker", sinkSpeed: 6 },
            { x: 480, y: 140, width: 110, height: 26, type: "asteroid" },
            { x: 630, y: 70, width: 28, height: 220, type: "fake_wall", hintText: "SECURITY BARRIER" },
            { x: 720, y: 214, width: 200, height: 35, type: "asteroid" }
        ],
        spikes: [
            { x: 210, y: 520, width: 510, height: 20, dir: "up" },
            { x: 760, y: 194, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 80 }
        ],
        trollEvents: [
            {
                id: "meteor_strike_l12",
                type: "proximity",
                targetX: 490,
                dist: 80,
                triggered: false,
                run: (game) => {
                    game.level.spikes.push({
                        x: 500, y: 20, width: 28, height: 28, dir: "down", velocityY: 8.5, isFalling: true
                    });
                    window.soundManager.playLaser();
                    game.camera.shake(14, 20);
                }
            },
            {
                id: "final_cosmic_spike",
                type: "proximity",
                targetX: 760,
                dist: 80,
                triggered: false,
                run: (game) => {
                    const s = game.level.spikes.find(sp => sp.x === 760 && sp.isHidden);
                    if (s) s.isHidden = false;
                    window.soundManager.playTroll();
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // LEVEL 13: "Laser Sight Breach" - Featured: Heat Vision [Z / 6]
    // ------------------------------------------------------------------------
    {
        id: 13,
        title: "Sector 13: Laser Sight Breach",
        subtitle: "Reinforced titanium bulkheads block the path. Melt them with Heat Vision!",
        hint: "Press [Z] or [6] to fire Heat Vision! Incinerate barriers & sentries!",
        featuredPower: "laser",
        playerStart: { x: 70, y: 380 },
        door: { x: 860, y: 380, width: 44, height: 64 },
        enemies: [
            { type: "smolly", x: 500, y: 422, width: 22, height: 22, minX: 470, maxX: 600, speed: 2.4, dir: 1 },
            { type: "smolly", x: 740, y: 422, width: 22, height: 22, minX: 720, maxX: 820, speed: 2.8, dir: -1 }
        ],
        platforms: [
            { x: 30, y: 444, width: 200, height: 40, type: "solid" },
            { x: 230, y: 320, width: 34, height: 124, type: "destructible", hp: 1 },
            { x: 264, y: 444, width: 180, height: 40, type: "solid" },
            { x: 444, y: 444, width: 140, height: 40, type: "collapse", delay: 140 },
            { x: 584, y: 280, width: 36, height: 164, type: "destructible", hp: 1 },
            { x: 620, y: 444, width: 270, height: 40, type: "solid" }
        ],
        spikes: [
            { x: 444, y: 520, width: 140, height: 20, dir: "up" },
            { x: 700, y: 424, width: 36, height: 20, dir: "up", isHidden: true, triggerDist: 80 }
        ],
        trollEvents: [
            {
                id: "pop_spike_l13",
                type: "proximity",
                targetX: 700,
                dist: 80,
                triggered: false,
                run: (game) => {
                    const sp = game.level.spikes.find(s => s.x === 700 && s.isHidden);
                    if (sp) sp.isHidden = false;
                    window.soundManager.playTroll();
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // LEVEL 14: "The Aegis Gauntlet" - Featured: Hero Aegis Shield [X / 7]
    // ------------------------------------------------------------------------
    {
        id: 14,
        title: "Sector 14: The Aegis Gauntlet",
        subtitle: "Unavoidable beam cannons and falling spikes. Pop your shield on impact!",
        hint: "Press [X] or [7] to activate the Aegis Shield! Deflect fatal hazards!",
        featuredPower: "shield",
        playerStart: { x: 70, y: 380 },
        door: { x: 860, y: 380, width: 44, height: 64 },
        enemies: [
            { type: "ghost", x: 620, y: 320, width: 24, height: 26, floatRange: 50, speed: 2.0, startY: 320 }
        ],
        lasers: [
            { x: 380, y: 40, width: 16, height: 420, active: true, cycleTime: 90, onDuration: 90, timer: 0 }
        ],
        platforms: [
            { x: 30, y: 444, width: 220, height: 40, type: "solid" },
            { x: 270, y: 444, width: 180, height: 40, type: "solid" },
            { x: 470, y: 444, width: 180, height: 40, type: "solid" },
            { x: 670, y: 444, width: 220, height: 40, type: "solid" }
        ],
        spikes: [
            { x: 250, y: 424, width: 20, height: 20, dir: "up" },
            { x: 450, y: 424, width: 20, height: 20, dir: "up" },
            { x: 650, y: 424, width: 20, height: 20, dir: "up" }
        ],
        trollEvents: [
            {
                id: "ceiling_crush_l14",
                type: "proximity",
                targetX: 520,
                dist: 70,
                triggered: false,
                run: (game) => {
                    game.level.spikes.push({
                        x: 520, y: 40, width: 34, height: 34, dir: "down", velocityY: 9.0, isFalling: true
                    });
                    window.soundManager.playLaser();
                    game.camera.shake(12, 18);
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // LEVEL 15: "Hulk Seismic Vault" - Featured: Thunder Slam [C / V / 8]
    // ------------------------------------------------------------------------
    {
        id: 15,
        title: "Sector 15: Hulk Seismic Vault",
        subtitle: "The surface is a lethal plasma pit. Jump high and Thunder Slam through the deck!",
        hint: "Jump high and press [C] or [V] to Thunder Slam through cracked floors!",
        featuredPower: "slam",
        playerStart: { x: 70, y: 240 },
        door: { x: 840, y: 470, width: 44, height: 64 },
        enemies: [
            { type: "smolly", x: 460, y: 512, width: 22, height: 22, minX: 420, maxX: 560, speed: 2.2, dir: 1 }
        ],
        platforms: [
            // Upper deck
            { x: 30, y: 290, width: 180, height: 30, type: "solid" },
            { x: 210, y: 290, width: 140, height: 30, type: "destructible", hp: 1, isFloor: true },
            { x: 350, y: 290, width: 120, height: 30, type: "destructible", hp: 1, isFloor: true },
            { x: 470, y: 290, width: 420, height: 30, type: "solid" },
            // Lower bunker vault
            { x: 120, y: 534, width: 770, height: 40, type: "solid" }
        ],
        spikes: [
            // Surface is pure death
            { x: 470, y: 266, width: 380, height: 24, dir: "up" },
            { x: 720, y: 514, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 70 }
        ],
        trollEvents: [
            {
                id: "vault_trap_spike",
                type: "proximity",
                targetX: 720,
                dist: 70,
                triggered: false,
                run: (game) => {
                    const sp = game.level.spikes.find(s => s.x === 720 && s.isHidden);
                    if (sp) sp.isHidden = false;
                    window.soundManager.playTroll();
                }
            }
        ]
    },

    // ------------------------------------------------------------------------
    // LEVEL 16: "Superhero Assemble: Final Heist" - The Grand Finale
    // ------------------------------------------------------------------------
    {
        id: 16,
        title: "Sector 16: Superhero Assemble",
        subtitle: "The Ultimate Grand Finale! Combine Heat Vision, Aegis Shield & Thunder Slam!",
        hint: "Chain ALL superhero powers: Laser [Z], Shield [X], Slam [C], & Warp [T]!",
        featuredPower: "all",
        playerStart: { x: 60, y: 160 },
        door: { x: 860, y: 460, width: 44, height: 64, isFinalCosmic: true },
        enemies: [
            { type: "smolly", x: 260, y: 188, width: 22, height: 22, minX: 220, maxX: 380, speed: 2.6, dir: 1 },
            { type: "ghost", x: 580, y: 360, width: 24, height: 26, floatRange: 70, speed: 2.2, startY: 360 }
        ],
        lasers: [
            { x: 500, y: 30, width: 14, height: 480, active: true, cycleTime: 120, onDuration: 60, timer: 30 }
        ],
        platforms: [
            { x: 30, y: 210, width: 180, height: 30, type: "solid" },
            { x: 210, y: 110, width: 34, height: 100, type: "destructible", hp: 1 },
            { x: 244, y: 210, width: 180, height: 30, type: "solid" },
            { x: 424, y: 210, width: 110, height: 30, type: "destructible", hp: 1, isFloor: true },
            { x: 534, y: 380, width: 160, height: 30, type: "collapse", delay: 100 },
            { x: 720, y: 524, width: 200, height: 40, type: "solid" }
        ],
        spikes: [
            { x: 30, y: 550, width: 680, height: 24, dir: "up" },
            { x: 790, y: 504, width: 40, height: 20, dir: "up", isHidden: true, triggerDist: 75 }
        ],
        trollEvents: [
            {
                id: "fleeing_final_gate_l16",
                type: "proximity",
                targetX: 840,
                dist: 90,
                triggered: false,
                run: (game) => {
                    // Stargate leaps up 180px!
                    if (game.level.door) {
                        game.level.door.y = 280;
                        game.camera.shake(12, 18);
                        window.soundManager.playTroll();
                        game.showBanner("WARP GATE TELEPORTING! USE WORMHOLE WARP [T]!", 2500);
                    }
                }
            },
            {
                id: "final_trap_spike_l16",
                type: "proximity",
                targetX: 790,
                dist: 75,
                triggered: false,
                run: (game) => {
                    const sp = game.level.spikes.find(s => s.x === 790 && s.isHidden);
                    if (sp) sp.isHidden = false;
                }
            }
        ]
    }
];

if (typeof window !== "undefined") {
    window.LEVELS = LEVELS;
    window.TROLL_DEATH_QUOTES = TROLL_DEATH_QUOTES;
}
