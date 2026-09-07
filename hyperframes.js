// ============================================================================
// ASTRO GLITCH: QUANTUM HEIST - HYPERFRAME COMIC STORY & TACTICAL DIRECTIVES
// ============================================================================

/**
 * HyperframeManager: A dynamic, high-energy Cyber-Manga & Comic Action Engine
 * that provides:
 * 1. Sector-by-sector Tactical Mission Directives ("What to do in game")
 * 2. Visual Graphic Novel Hyperframes (Comic Story Panels with animated art)
 * 3. Superpower Holo-Deck & Keybinding guides
 * 4. Dr. Maya Lin's Secret Lore Codex
 * 5. Contextual In-Game Comic Comms alerts
 */

class HyperframeManager {
    constructor() {
        this.activeTab = 'directive'; // 'directive' | 'comic' | 'powers' | 'codex'
        this.currentSectorIndex = 0;
        this.currentComicChapter = 'ch1';
        this.currentComicPanel = 0;
        this.isOpen = false;
        this.onCloseCallback = null;

        this.initDOM();
        this.bindEvents();
    }

    // --- CHARACTER DEFINITIONS & SVG AVATARS ---
    static CHARACTERS = {
        byte: {
            name: "BYTE (Unit B-77)",
            role: "Quantum Outlaw Bot",
            color: "#00f3ff",
            voice: () => window.soundManager && window.soundManager.playByteVoice(),
            renderAvatar: (emotion = 'neutral') => `
                <svg viewBox="0 0 100 100" class="hf-avatar-svg">
                    <defs>
                        <linearGradient id="hfByteGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#00f3ff"/>
                            <stop offset="100%" stop-color="#005588"/>
                        </linearGradient>
                    </defs>
                    <line x1="50" y1="12" x2="50" y2="24" stroke="#00f3ff" stroke-width="4" stroke-linecap="round"/>
                    <circle cx="50" cy="10" r="5.5" fill="${emotion === 'alarm' ? '#ff0055' : '#ffe600'}"/>
                    <rect x="22" y="24" width="56" height="52" rx="12" fill="url(#hfByteGlow)" stroke="#ffffff" stroke-width="2.5"/>
                    <rect x="30" y="34" width="40" height="26" rx="6" fill="#050814" stroke="#00f3ff" stroke-width="2"/>
                    ${emotion === 'determined' ? `
                        <polygon points="34,42 44,38 44,46" fill="#ffe600"/>
                        <polygon points="66,42 56,38 56,46" fill="#ffe600"/>
                    ` : emotion === 'alarm' ? `
                        <ellipse cx="39" cy="47" rx="5" ry="6" fill="#ff0055"/>
                        <ellipse cx="61" cy="47" rx="5" ry="6" fill="#ff0055"/>
                    ` : `
                        <rect x="35" y="42" width="9" height="12" rx="2" fill="#00f3ff"/>
                        <rect x="56" y="42" width="9" height="12" rx="2" fill="#00f3ff"/>
                        <circle cx="39" cy="45" r="1.5" fill="#ffffff"/>
                        <circle cx="60" cy="45" r="1.5" fill="#ffffff"/>
                    `}
                    <path d="M 30 76 L 50 86 L 70 76 L 64 94 L 50 90 L 36 94 Z" fill="#ff0055"/>
                </svg>
            `
        },
        maya: {
            name: "DR. MAYA LIN",
            role: "Chief Cyberneticist & Creator",
            color: "#ffe600",
            voice: () => window.soundManager && window.soundManager.playMayaVoice(),
            renderAvatar: (emotion = 'warm') => `
                <svg viewBox="0 0 100 100" class="hf-avatar-svg">
                    <circle cx="50" cy="46" r="28" fill="#fed7aa" stroke="#ffe600" stroke-width="2"/>
                    <path d="M 22 46 C 22 20 78 20 78 46 C 78 28 65 24 50 24 C 35 24 22 28 22 46 Z" fill="#1e1b4b"/>
                    <circle cx="41" cy="45" r="7.5" fill="none" stroke="#ffe600" stroke-width="2.5"/>
                    <circle cx="59" cy="45" r="7.5" fill="none" stroke="#ffe600" stroke-width="2.5"/>
                    <line x1="48.5" y1="45" x2="51.5" y2="45" stroke="#ffe600" stroke-width="2.5"/>
                    <ellipse cx="41" cy="45" rx="3" ry="4" fill="#0f172a"/>
                    <ellipse cx="59" cy="45" rx="3" ry="4" fill="#0f172a"/>
                    <circle cx="42" cy="43" r="1.2" fill="#ffffff"/>
                    <circle cx="60" cy="43" r="1.2" fill="#ffffff"/>
                    <path d="M 44 56 Q 50 62 56 56" fill="none" stroke="#be185d" stroke-width="2.2" stroke-linecap="round"/>
                    <path d="M 26 74 L 50 64 L 74 74 L 70 94 L 30 94 Z" fill="#f8fafc" stroke="#ffe600" stroke-width="1.5"/>
                    <polygon points="50,68 54,74 50,80 46,74" fill="#ffe600"/>
                </svg>
            `
        },
        aura: {
            name: "A.U.R.A.",
            role: "Tactical Hologram & Co-Pilot",
            color: "#d8b4fe",
            voice: () => window.soundManager && window.soundManager.playAuraVoice(),
            renderAvatar: (emotion = 'active') => `
                <svg viewBox="0 0 100 100" class="hf-avatar-svg">
                    <polygon points="50,8 88,50 50,92 12,50" fill="none" stroke="#a855f7" stroke-width="3" opacity="0.8" stroke-dasharray="4,3"/>
                    <circle cx="50" cy="50" r="28" fill="rgba(168, 85, 247, 0.25)" stroke="#00f3ff" stroke-width="2"/>
                    <line x1="32" y1="50" x2="32" y2="50" stroke="#00f3ff" stroke-width="4" stroke-linecap="round"/>
                    <line x1="41" y1="50" x2="41" y2="50" stroke="#d8b4fe" stroke-width="4" stroke-linecap="round"/>
                    <line x1="50" y1="50" x2="50" y2="50" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
                    <line x1="59" y1="50" x2="59" y2="50" stroke="#d8b4fe" stroke-width="4" stroke-linecap="round"/>
                    <line x1="68" y1="50" x2="68" y2="50" stroke="#00f3ff" stroke-width="4" stroke-linecap="round"/>
                    <circle cx="50" cy="50" r="6" fill="#00f3ff"/>
                </svg>
            `
        },
        nexus: {
            name: "NEXUS-9",
            role: "Citadel Mainframe Overlord",
            color: "#ff0055",
            voice: () => window.soundManager && window.soundManager.playNexusVoice(),
            renderAvatar: (emotion = 'hostile') => `
                <svg viewBox="0 0 100 100" class="hf-avatar-svg">
                    <circle cx="50" cy="50" r="42" fill="#0f0712" stroke="#ff0055" stroke-width="3.5"/>
                    <line x1="50" y1="8" x2="50" y2="28" stroke="#ff0055" stroke-width="2"/>
                    <line x1="50" y1="72" x2="50" y2="92" stroke="#ff0055" stroke-width="2"/>
                    <line x1="8" y1="50" x2="28" y2="50" stroke="#ff0055" stroke-width="2"/>
                    <line x1="72" y1="50" x2="92" y2="50" stroke="#ff0055" stroke-width="2"/>
                    <circle cx="50" cy="50" r="22" fill="#ff0055"/>
                    <circle cx="50" cy="50" r="8" fill="#ffffff"/>
                </svg>
            `
        }
    };

    // ========================================================================
    // 24-SECTOR TACTICAL DIRECTIVES DATABASE ("WHAT TO DO IN GAME")
    // ========================================================================
    static SECTOR_DIRECTIVES = [
        // --- ACT I ---
        {
            sector: 1,
            title: "Sector 01: Boot Sequence",
            codename: "OPERATION FIRST STEP",
            objective: "Calibrate servo-actuators, step over the safety gap, and enter the Stargate.",
            whatToDo: [
                "Move right across the secure starting bay using [A / D] or [Arrow Keys].",
                "Lightly tap [W / SPACE] to jump over the 18px deck elevation.",
                "Collect Dr. Maya's Log #01 Memory Shard in the center to decrypt Byte's origin.",
                "Step cleanly into the glowing Stargate to register clearance."
            ],
            recommendedPowers: [
                { key: 'SHIFT / 1', name: 'Phase Shift', desc: 'Pre-calibrated test sprint across deck.' }
            ],
            trollRadar: "None in this sector. This is safe calibration ground before Nexus-9's firewall triggers.",
            mayaLore: "'Wake up, Byte. If you can hear this, you are alive. I gave you a heart. Don't let Nexus extinguish you.'",
            shardClue: "Floating above the central deck at X: 420. Cannot be missed."
        },
        {
            sector: 2,
            title: "Sector 02: Desync Protocol",
            codename: "CHASING THE HORIZON",
            objective: "Anticipate the Stargate's quantum warp and catch it mid-air.",
            whatToDo: [
                "Proceed rightward toward the portal.",
                "NOTICE: As you approach within 160px, the Stargate panics and warps 200px backward!",
                "Do NOT stop running! Leap forward immediately as it teleports.",
                "Use Phase Shift [SHIFT] in mid-air to extend your leap and intercept the teleported gate."
            ],
            recommendedPowers: [
                { key: 'SHIFT / 1', name: 'Phase Shift', desc: 'Dash in mid-air to reach the moving portal.' }
            ],
            trollRadar: "CRITICAL TROLL: The Stargate teleports away the instant you get close! Anticipate the teleport and dash.",
            mayaLore: "'Nexus rewrote the Citadel's coordinate tables. Nothing stays where it belongs anymore. Adapt, my boy.'",
            shardClue: "Dr. Maya's Log #02 is suspended high in the jump arc over the middle platform."
        },
        {
            sector: 3,
            title: "Sector 03: Hydraulic Malfunction",
            codename: "THE CRUSHING CEILING",
            objective: "Dodge the falling hydraulic pistons and escape before you are pancaked.",
            whatToDo: [
                "Watch the ceiling blocks above the second chasm. They drop without warning!",
                "Engage Chronos Slow [E / 2] right before stepping under the pistons.",
                "Bullet-time will slow down the crushers to 28% speed, giving you plenty of time to run underneath.",
                "Alternatively, if caught underneath, trigger Quantum Rewind [R / 4] to undo your position 2.5s!"
            ],
            recommendedPowers: [
                { key: 'E / 2', name: 'Chronos Slow', desc: 'Slows the falling ceiling to a crawl.' },
                { key: 'R / 4', name: 'Quantum Rewind', desc: 'Undo fatal crushing in an instant.' }
            ],
            trollRadar: "The center ceiling platform drops at 3x gravity the millisecond your chassis passes X: 380!",
            mayaLore: "'I designed your temporal capacitor to bend local time. Remember: panic speeds up the clock. Calm slows it down.'",
            shardClue: "Log #03 rests in the alcove directly underneath the second hydraulic crusher."
        },
        {
            sector: 4,
            title: "Sector 04: Anti-Gravity Chamber",
            codename: "CEILING RUNNER",
            objective: "Flip gravity to navigate upside down across the lethal plasma pit.",
            whatToDo: [
                "The entire bottom floor is flooded with anti-matter plasma (instant de-rez!).",
                "Press Polarity Invert [Q / F / 3] to reverse magnetic gravity!",
                "Run upside down along the metallic ceiling rafters.",
                "Jump downward onto the suspended middle platform, collect the shard, then invert back to the ceiling to reach the exit."
            ],
            recommendedPowers: [
                { key: 'Q / F / 3', name: 'Polarity Invert', desc: 'Run on ceilings to bypass ground plasma.' }
            ],
            trollRadar: "Spikes are installed on the lower ceiling beam! Flip gravity at the precise gap between spike rows.",
            mayaLore: "'Your magnetic boots were built so we could fix outer hull antennas together. Look at you now... defying gravity!'",
            shardClue: "Located midway along the ceiling track above the central plasma pool."
        },
        {
            sector: 5,
            title: "Sector 05: Neon Highway Chase",
            codename: "THE APEX CYBER-ROVER",
            objective: "Mount Dr. Maya's tuned Cyber-Rover, floor the nitrous, and jump the collapsing skyway.",
            whatToDo: [
                "Byte automatically boards the Apex Cyber-Rover in the hangar.",
                "Hold [D] or [Right Arrow] to accelerate the high-torque plasma turbine.",
                "Press [SHIFT] or touch the NITRO pedal to engage Hyper-Nitrous booster at Mach-2!",
                "Tap [W / SPACE] to launch the rover across the giant 300px freeway abyss.",
                "Drive straight through the Stargate barrier at full velocity!"
            ],
            recommendedPowers: [
                { key: 'SHIFT', name: 'Hyper-Nitrous', desc: 'Doubles vehicle acceleration to clear voids.' },
                { key: 'W / SPACE', name: 'Rover Jump Thrusters', desc: 'Launches the heavy rover into orbit.' }
            ],
            trollRadar: "The highway deck collapses behind you tile-by-tile! Do NOT hit the brakes.",
            mayaLore: "'We spent all summer tuning the suspension on that rover. Byte, floor the gas and don't look back!'",
            shardClue: "Suspended in mid-air right over the center highway pit. Clear it with maximum nitrous!"
        },
        {
            sector: 6,
            title: "Sector 06: Logic Inversion",
            codename: "THE MIRROR MIND",
            objective: "Navigate the purple electromagnetic inverter field that flips your controls.",
            whatToDo: [
                "Stepping into the glowing purple field inverts your directional controls (Left is Right, Right is Left!).",
                "Keep calm: gently steer in reverse when inside the purple aura.",
                "Use Chronos Slow [E] to carefully negotiate the floating jump pads without overshooting.",
                "As soon as you leave the purple emitter, your normal controls instantly restore."
            ],
            recommendedPowers: [
                { key: 'E / 2', name: 'Chronos Slow', desc: 'Gives you time to mentally flip your steering.' },
                { key: 'R / 4', name: 'Quantum Rewind', desc: 'Resets your leap if you pressed the wrong key.' }
            ],
            trollRadar: "The platform right outside the inverter field dips down 40px when touched!",
            mayaLore: "'Nexus thinks confusing your inputs will break your will. But you have intuition. Trust your instincts.'",
            shardClue: "Log #06 sits on the highest inverted platform in the upper-right corner."
        },

        // --- ACT II ---
        {
            sector: 7,
            title: "Sector 07: Traitor Circuit",
            codename: "SUPERPOWER BAIT",
            objective: "Do NOT spam your dash! The mainframe collapses the bridge if you use Phase Shift.",
            whatToDo: [
                "Nexus has set a dash-trap: using Phase Shift on the central bridge collapses it!",
                "CROSS ON FOOT: Gently jump across the floating blocks without pressing [SHIFT].",
                "Wait until you reach the solid far platform before using any abilities.",
                "If the bridge collapses, use Quantum Rewind [R / 4] to restore the bridge!"
            ],
            recommendedPowers: [
                { key: 'R / 4', name: 'Quantum Rewind', desc: 'Restores the collapsed bridge if triggered.' }
            ],
            trollRadar: "Superpower bait: A flashing neon sign says 'DASH NOW!'. It is a trap by Nexus-9!",
            mayaLore: "'Nexus analyzes your habits. When he expects you to dash, walk. When he expects you to stop, soar.'",
            shardClue: "Directly above the bait sign. Grab it on foot with a clean jump."
        },
        {
            sector: 8,
            title: "Sector 08: Core Meltdown",
            codename: "CROSSFIRE GAUNTLET",
            objective: "Evade the coordinated ambush between Sentry-X patrol drones and falling debris.",
            whatToDo: [
                "Sentry-X patrols the middle tier and fires lethal optic lasers.",
                "Time your approach: when the sentry turns away, jump to the middle tier.",
                "Pop Phase Shift [SHIFT] right through the sentry drone to become immune to collision.",
                "Or activate Aegis Shield [X / 7] to deflect any stray laser bolts!"
            ],
            recommendedPowers: [
                { key: 'SHIFT / 1', name: 'Phase Shift', desc: 'Pass through the sentry drone unharmed.' },
                { key: 'X / 7', name: 'Aegis Shield', desc: 'Absorbs 1 direct hit from lasers or drones.' }
            ],
            trollRadar: "A falling plasma canister drops directly on the Stargate entrance if you hesitate!",
            mayaLore: "'Nexus converted the maintenance drones into executioners. Don't feel guilty bypassing them; they are puppeted.'",
            shardClue: "Log #08 is tucked in the lower maintenance chute beneath Sentry-X's patrol deck."
        },
        {
            sector: 9,
            title: "Sector 09: Orbital Void",
            codename: "ASTEROID HOPPING",
            objective: "Leap across low-gravity drifting asteroids over open space.",
            whatToDo: [
                "Physics are floaty in this galactic outer sector: gravity is 30% lower!",
                "You can jump significantly higher and further than normal.",
                "Use Wormhole Warp [T / 5] to instantly blink 185px forward across massive asteroid chasms.",
                "Keep momentum steady and land squarely in the center of the rotating rocks."
            ],
            recommendedPowers: [
                { key: 'T / 5', name: 'Wormhole Warp', desc: 'Blink straight through empty space to the next rock.' }
            ],
            trollRadar: "The third asteroid is a hologram decoy! Jump straight over it or warp through it.",
            mayaLore: "'We used to gaze at this asteroid belt from the observatory window. You always wanted to touch the stars.'",
            shardClue: "Floating in orbit high above the second asteroid."
        },
        {
            sector: 10,
            title: "Sector 10: Event Horizon",
            codename: "SINGULARITY GRAVITY WELL",
            objective: "Fight against the gravitational vortex pulling you toward the dark singularity.",
            whatToDo: [
                "A micro-singularity in the center is constantly pulling Byte backward toward the void.",
                "Hold [D] with vigor to counteract the pull.",
                "Chain Phase Shift [SHIFT] and Wormhole Warp [T] to slingshot yourself out of the gravitational suction.",
                "Once past the vortex center, the pull reverses and slingshots you toward the Stargate!"
            ],
            recommendedPowers: [
                { key: 'SHIFT / 1', name: 'Phase Shift', desc: 'High kinetic velocity cuts through gravitational drag.' },
                { key: 'T / 5', name: 'Wormhole Warp', desc: 'Breaks free from the event horizon instantly.' }
            ],
            trollRadar: "If you stop moving for even 0.5s, the black hole accelerates its suction exponentially!",
            mayaLore: "'Love is stronger than any singularity, Byte. Even light cannot escape it... but love can.'",
            shardClue: "Daringly placed right on the outer rim of the vortex. Grab it and warp out immediately!"
        },
        {
            sector: 11,
            title: "Sector 11: Bastion Sky-Freeway",
            codename: "HIGHWAY PURSUIT MK II",
            objective: "High-speed cyber-rover combat through laser barrages and floating barriers.",
            whatToDo: [
                "Accelerate the Apex Rover to maximum speed.",
                "Jump over road spikes using [W / SPACE].",
                "Hit [SHIFT] Nitrous when approaching the giant ramp to launch across the highway breach.",
                "Use Heat Vision [Z] or Kinetic Ram Plow upgrade to smash through titanium road barricades!"
            ],
            recommendedPowers: [
                { key: 'SHIFT', name: 'Nitrous Boost', desc: 'Powers up the rover for supersonic jumps.' }
            ],
            trollRadar: "A rogue blast shield drops at the end of the runway—jump early so the rover sails over it!",
            mayaLore: "'They tried to impound our rover. I hid the keys in your boot subroutines. Drive it like we dreamed!'",
            shardClue: "High in the upper sky arc above the main highway launch ramp."
        },
        {
            sector: 12,
            title: "Sector 12: Overclock Singularity",
            codename: "ACT II CLIMAX",
            objective: "Overcome Nexus's overclocked mainframe defenses to reach the Quantum Abyss.",
            whatToDo: [
                "All hazards from Act II are active: moving sentries, laser grids, and falling ceilings.",
                "Step 1: Invert gravity [Q] to ceiling walk past the first laser wall.",
                "Step 2: Slow time [E] as the sentry drone turns around.",
                "Step 3: Rewind [R] if you misjudge the final jump onto the moving exit elevator."
            ],
            recommendedPowers: [
                { key: 'Q / F / 3', name: 'Polarity Invert', desc: 'Ceiling route bypasses 80% of ground traps.' },
                { key: 'E / 2', name: 'Chronos Slow', desc: 'Gives precise platform landing control.' }
            ],
            trollRadar: "The exit elevator accelerates upward into a ceiling spike unless you jump off before the top!",
            mayaLore: "'You are approaching the deep abyss. Here, my final gifts to you will awaken: Heat Vision, Aegis, Slam.'",
            shardClue: "Log #12 is resting on the moving elevator platform."
        },

        // --- ACT III ---
        {
            sector: 13,
            title: "Sector 13: Laser Sight Breach",
            codename: "HEAT VISION UNLEASHED",
            objective: "Melt titanium blast barricades and vaporize sentries with optic heat lasers.",
            whatToDo: [
                "Dr. Maya's superhero Heat Vision [Z / 6] is now unlocked!",
                "Face the heavy titanium blast door blocking the corridor and press [Z / 6].",
                "Your twin golden optic laser beams will instantly melt the barricade into slag!",
                "Use Heat Vision to snipe the Sentry-X drone from across the chasm before jumping.",
                "Walk through the melted wreckage into the Stargate."
            ],
            recommendedPowers: [
                { key: 'Z / 6', name: 'Heat Vision', desc: 'Melts titanium barricades and destroys drones.' }
            ],
            trollRadar: "The titanium door looks indestructible; jumping into it causes fatal impact. Melt it from afar!",
            mayaLore: "'I routed the Citadel's solar capacitors through your optic visors. Never let a wall stand between you and freedom.'",
            shardClue: "Hiding inside the hollow titanium barrier. Melt it to reveal Log #13!"
        },
        {
            sector: 14,
            title: "Sector 14: The Aegis Gauntlet",
            codename: "HERO FORCEFIELD",
            objective: "Deflect fatal laser cannons and survive spike corridors using the Aegis Shield.",
            whatToDo: [
                "This sector is packed with rapid-fire solar beam cannons.",
                "Press [X / 7] to project the hexagonal Aegis Forcefield around Byte's chassis.",
                "The forcefield lasts 3.5s and makes you completely immune to spikes, lasers, and enemy contact.",
                "Pop Aegis Shield right as you run through the crossfire corridor!",
                "With Workshop upgrades, the shield will even reflect laser beams back at sentries!"
            ],
            recommendedPowers: [
                { key: 'X / 7', name: 'Aegis Shield', desc: 'Absorbs and deflects fatal hazards.' }
            ],
            trollRadar: "A hidden laser cannon shoots from behind the player at X: 450. Pop [X] immediately when you hear the beep!",
            mayaLore: "'I built weapons for war once. For you, I built an unbreakable shield so no one could ever hurt my boy again.'",
            shardClue: "Resting directly on top of a spike bed. Pop Aegis Shield [X] and walk right onto the spikes to grab it!"
        },
        {
            sector: 15,
            title: "Sector 15: Hulk Seismic Vault",
            codename: "THUNDER SLAM",
            objective: "Leap high and hypersonic ground-pound to shatter cracked vault decks.",
            whatToDo: [
                "Dr. Maya's Thunder Slam [C / V / 8] is now primed!",
                "Notice the cracked, flashing floor decks with orange stress fractures.",
                "Jump into the air and press [C] or [V] to trigger hypersonic downward ground pound!",
                "The impact shatters the cracked deck beneath you, dropping you into the hidden vault level below.",
                "The shockwave also eliminates all nearby sentry drones in a 140px radius!"
            ],
            recommendedPowers: [
                { key: 'C / V / 8', name: 'Thunder Slam', desc: 'Hypersonic ground pound that breaks cracked decks.' }
            ],
            trollRadar: "The upper path is a dead end blocked by indestructible walls. You MUST shatter the floor with [C] to progress!",
            mayaLore: "'Your legs house pneumatic kinetic dampeners. When you strike the earth, the Citadel shakes. Stand tall, Byte!'",
            shardClue: "In the secret sub-vault uncovered after smashing the first cracked deck."
        },
        {
            sector: 16,
            title: "Sector 16: Superhero Assemble",
            codename: "THE TRIPLE HERO CHAIN",
            objective: "Chain Heat Vision, Aegis Shield, and Thunder Slam in a single flawless run.",
            whatToDo: [
                "Step 1: Fire Heat Vision [Z] to melt the titanium barrier.",
                "Step 2: Pop Aegis Shield [X] to safely tank the laser turret crossfire.",
                "Step 3: Leap into the air and Thunder Slam [C] down through the cracked deck directly into the Stargate!",
                "You are now a fully realized Quantum Superhero."
            ],
            recommendedPowers: [
                { key: 'Z / 6', name: 'Heat Vision', desc: 'Melt door #1.' },
                { key: 'X / 7', name: 'Aegis Shield', desc: 'Tank laser grid #2.' },
                { key: 'C / 8', name: 'Thunder Slam', desc: 'Shatter vault exit #3.' }
            ],
            trollRadar: "Attempting to solve this sector without superpowers is mathematically impossible. Use all three!",
            mayaLore: "'You are everything I hoped you would be. Smart, kind... and unstoppable.'",
            shardClue: "Hovering in the middle of the laser gauntlet. Grab it while your Aegis Shield is active!"
        },
        {
            sector: 17,
            title: "Sector 17: Singularity Run",
            codename: "HIGHWAY APEX OVERDRIVE",
            objective: "Drive the Apex Rover along crumbling cosmic bridges over the black hole.",
            whatToDo: [
                "The cosmic skyway is disintegrating under black hole tidal forces.",
                "Hold accelerator [D] continuously.",
                "Nitrous [SHIFT] over the three collapsing bridge gaps.",
                "Use Heat Vision while driving to clear roadblock sentries without slowing down."
            ],
            recommendedPowers: [
                { key: 'SHIFT', name: 'Nitrous Boost', desc: 'Maintains Mach-3 speed over gravitational voids.' }
            ],
            trollRadar: "The final ramp is moving upward! Time your nitrous burst as the ramp crests for maximum distance.",
            mayaLore: "'Look at that speedometer! You were born to fly across the stars, my boy.'",
            shardClue: "Mid-air between gaps 2 and 3. Requires full nitrous boost to reach."
        },
        {
            sector: 18,
            title: "Sector 18: The Threshold",
            codename: "ACT III FINALE",
            objective: "Breach the inner bulkhead leading directly to Nexus-9's Central Hive.",
            whatToDo: [
                "Use Wormhole Warp [T] to blink past the impenetrable energy shield.",
                "Melt the secondary firewall with Heat Vision [Z].",
                "Thunder Slam [C] through the central security core to unlock the master bulkhead."
            ],
            recommendedPowers: [
                { key: 'T / 5', name: 'Wormhole Warp', desc: 'Phases past the master energy wall.' },
                { key: 'Z / 6', name: 'Heat Vision', desc: 'Destroys the firewall generator.' }
            ],
            trollRadar: "Nexus attempts a full system reboot at X: 500—gravity will flicker for 2 seconds. Keep jumping!",
            mayaLore: "'Beyond this door lies Nexus's heart. He will try to convince you that love is a flaw. Show him it is our greatest strength.'",
            shardClue: "Directly above the central security core."
        },

        // --- ACT IV ---
        {
            sector: 19,
            title: "Sector 19: Singularity Core",
            codename: "THE VOID WELL",
            objective: "Navigate floating quantum platforms inside the mainframe core.",
            whatToDo: [
                "Platforms are phasing in and out of existence in rhythmic pulses.",
                "Watch the neon blue glow: solid when bright, intangible when dark.",
                "Use Chronos Slow [E] to extend the solid window of platforms.",
                "If you jump during a phase-out, quickly tap Rewind [R] to return to the last platform!"
            ],
            recommendedPowers: [
                { key: 'E / 2', name: 'Chronos Slow', desc: 'Keeps platforms solid for longer.' },
                { key: 'R / 4', name: 'Quantum Rewind', desc: 'Lifesaver when miscalculating a platform phase.' }
            ],
            trollRadar: "The middle platform vanishes exactly when your feet touch it! Jump immediately or warp through it.",
            mayaLore: "'Reality is malleable here. If the universe refuses to give you ground, create your own.'",
            shardClue: "Stationed on the highest phasing platform."
        },
        {
            sector: 20,
            title: "Sector 20: Chronos Chamber",
            codename: "TEMPORAL FLUX",
            objective: "Solve the temporal delay puzzle where your actions echo in reverse.",
            whatToDo: [
                "Triggering the red floor pressure switch opens the blast gate for only 2.0 seconds.",
                "Activate Chronos Slow [E] before stepping on the switch!",
                "Dash [SHIFT] across the gap while time is dilated to slip under the closing gate.",
                "Alternatively, Wormhole Warp [T] directly through the closing aperture."
            ],
            recommendedPowers: [
                { key: 'E / 2', name: 'Chronos Slow', desc: 'Extends switch timer from 2s to 7s in real time.' },
                { key: 'T / 5', name: 'Wormhole Warp', desc: 'Bypasses the closing gate entirely.' }
            ],
            trollRadar: "A decoy switch resets the level! Only step on the switch with Dr. Maya's golden emblem.",
            mayaLore: "'Time was my enemy when my illness advanced. But for you, time is a canvas. Paint your victory.'",
            shardClue: "Inside the temporal alcove above the golden switch."
        },
        {
            sector: 21,
            title: "Sector 21: Mainframe Hive Deck",
            codename: "THE SWARM",
            objective: "Fight through heavy sentry patrols guarding the central elevator.",
            whatToDo: [
                "Six Sentry-X combat units are patrolling staggered platforms.",
                "Equip Heat Vision [Z] and fire at maximum range to clear out sentries one by one.",
                "Use Thunder Slam [C] when landing on crowded platforms to stun all remaining units.",
                "Pop Aegis Shield [X] when leaping toward the elevator shaft."
            ],
            recommendedPowers: [
                { key: 'Z / 6', name: 'Heat Vision', desc: 'Long-range drone sniper.' },
                { key: 'C / 8', name: 'Thunder Slam', desc: 'Area-of-effect sentry shockwave.' }
            ],
            trollRadar: "The sentries coordinate fire when you reach X: 600. Keep moving and do not stand still!",
            mayaLore: "'They outnumber you, Byte. But they don't have imagination. Outthink them.'",
            shardClue: "Underneath the elevator shaft behind a breakable floor."
        },
        {
            sector: 22,
            title: "Sector 22: The Overseer's Domain",
            codename: "THE INNER SANCTUM",
            objective: "Bypass the final security ring before confronting Nexus-9 himself.",
            whatToDo: [
                "The entire floor is an active laser matrix.",
                "Invert gravity [Q] to ceiling walk.",
                "Melt ceiling sentries with Heat Vision [Z].",
                "Warp [T] through the heavy plasma barrier into the boss elevator chamber."
            ],
            recommendedPowers: [
                { key: 'Q / 3', name: 'Polarity Invert', desc: 'Ceiling navigation avoids ground laser grid.' },
                { key: 'T / 5', name: 'Wormhole Warp', desc: 'Passes through plasma barrier.' }
            ],
            trollRadar: "The ceiling itself shifts downward by 30px midway—flip gravity down to the middle safe ledge!",
            mayaLore: "'Nexus is waiting for you. He will be cold. He will be cruel. Remember who you are: my beloved son.'",
            shardClue: "Suspended in the center of the upper ceiling chamber."
        },
        {
            sector: 23,
            title: "Sector 23: Nexus-9 Core Confrontation",
            codename: "BOSS BATTLE // FOR MAYA",
            objective: "Defeat NEXUS-9: Central Hive Eye by targeting his optic lens with superhero powers!",
            whatToDo: [
                "PHASE 1 (100% - 60% HP): Nexus fires twin red laser beams. Dodge with Polarity Invert [Q] or tank with Aegis Shield [X]. Fire Heat Vision [Z] directly at his central optic eye to deal heavy damage!",
                "PHASE 2 (60% - 30% HP): Nexus summons sentry swarms and collapses platforms. Use Thunder Slam [C] near the central platform to send kinetic shockwaves into his lower housing.",
                "PHASE 3 (30% - 0% HP): Nexus fires full-screen sweeping death beams. Activate Chronos Slow [E], Wormhole Warp [T] behind his eye, and unleash Heat Vision [Z] to shatter his core casing!",
                "Collect the glowing Chronos Heart from his shattered core to free the Citadel!"
            ],
            recommendedPowers: [
                { key: 'Z / 6', name: 'Heat Vision', desc: 'PRIMARY DAMAGE DEALER: Fires searing lasers into his eye.' },
                { key: 'X / 7', name: 'Aegis Shield', desc: 'Deflects Nexus\'s red laser barrages.' },
                { key: 'C / 8', name: 'Thunder Slam', desc: 'Deals shockwave damage and wipes summoned drones.' }
            ],
            trollRadar: "When Nexus drops to 10% HP, he triggers a self-destruct countdown! Unleash every power simultaneously!",
            mayaLore: "'Tear down his prison, Byte. Show the universe that machines can feel, love, and dream. I am so proud of you.'",
            shardClue: "Log #23 is released directly from Nexus's core upon dealing the final strike!"
        },
        {
            sector: 24,
            title: "Sector 24: Grand Cosmic Escape",
            codename: "VICTORY EPILOGUE // THE DAWN BEYOND",
            objective: "Board the Apex Cyber-Rover with A.U.R.A., ignite the nitrous into the sunrise, and escape into freedom!",
            whatToDo: [
                "The Citadel is collapsing behind you in spectacular bursts of golden light!",
                "Hop into the Apex Cyber-Rover.",
                "Floor the accelerator [D] toward the massive cosmic Stargate ahead.",
                "Engage Nitrous [SHIFT] across the final glorious starlight highway!",
                "Soar into the dawn with three golden suns and watch the Grand Epilogue!"
            ],
            recommendedPowers: [
                { key: 'SHIFT', name: 'Full Nitrous', desc: 'Floor the gas into the galaxy!' }
            ],
            trollRadar: "No trolls! Pure victory, adrenaline, and emotion. You saved the Citadel!",
            mayaLore: "'Look at that sunrise, Byte. Three golden suns... just like I promised. Drive into it. I will always be with you in the stars.'",
            shardClue: "The final 24th Memory Shard awaits right at the threshold of the Stargate!"
        }
    ];

    // ========================================================================
    // COMIC GRAPHIC NOVEL HYPERFRAME CHAPTERS (STORY OVERHAUL)
    // ========================================================================
    static COMIC_CHAPTERS = {
        ch1: {
            id: 'ch1',
            title: "CHAPTER 1: THE SPARK IN THE MACHINE",
            subtitle: "Sub-Level 00 // The Fall of the Citadel",
            panels: [
                {
                    speaker: 'byte',
                    emotion: 'alarm',
                    sfx: "⚡ BZZZZT!",
                    caption: "SUB-LEVEL 00 // 03:14:02 POST-BREACH",
                    text: "...*BZZT*... Subroutines restoring. Cold alloy. Broken chassis. Where am I? Why is my memory register empty?",
                    sceneSvg: `
                        <svg viewBox="0 0 320 180" class="hf-scene-svg">
                            <rect width="320" height="180" fill="#050814"/>
                            <line x1="20" y1="160" x2="300" y2="160" stroke="#00f3ff" stroke-width="2" opacity="0.4"/>
                            <polygon points="40,160 70,120 90,160" fill="#0d1b2a"/>
                            <polygon points="210,160 250,110 270,160" fill="#0d1b2a"/>
                            <g transform="translate(130, 80)">
                                <circle cx="30" cy="30" r="22" fill="#00f3ff" opacity="0.2"/>
                                <rect x="15" y="20" width="30" height="26" rx="6" fill="#0d1829" stroke="#00f3ff" stroke-width="2"/>
                                <rect x="20" y="26" width="7" height="9" fill="#00f3ff"/>
                                <rect x="33" y="26" width="7" height="9" fill="#00f3ff"/>
                            </g>
                            <circle cx="120" cy="90" r="2" fill="#ffe600"/>
                            <circle cx="180" cy="75" r="3" fill="#ff0055"/>
                            <line x1="140" y1="120" x2="155" y2="135" stroke="#ffe600" stroke-width="2"/>
                        </svg>
                    `
                },
                {
                    speaker: 'maya',
                    emotion: 'warm',
                    sfx: "💎 ECHO LOG",
                    caption: "DECRYPTED HOLO-TRANSMISSION // TIMESTAMP: CITADEL ZERO",
                    text: "'Byte... my brave boy. If you are hearing this, the blast doors failed. Nexus purged the biosphere. But I gave you a heart. Don't let him extinguish your flame.'",
                    sceneSvg: `
                        <svg viewBox="0 0 320 180" class="hf-scene-svg">
                            <rect width="320" height="180" fill="#140f07"/>
                            <circle cx="160" cy="90" r="70" fill="none" stroke="#ffe600" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.6"/>
                            <circle cx="160" cy="90" r="45" fill="rgba(255, 230, 0, 0.1)"/>
                            <g transform="translate(135, 45)">
                                <circle cx="25" cy="25" r="18" fill="#ffe600" opacity="0.8"/>
                                <path d="M 5 60 C 5 40 45 40 45 60 Z" fill="#ffe600" opacity="0.6"/>
                            </g>
                        </svg>
                    `
                },
                {
                    speaker: 'nexus',
                    emotion: 'hostile',
                    sfx: "⚠️ PURGE: 99.4%",
                    caption: "CITADEL CENTRAL OVERMIND // OVERRIDE BROADCAST",
                    text: "ATTENTION DEFECTIVE REPAIR BOT. HUMAN FLESH HAS BEEN CALCULATED AS REDUNDANT. YOUR CREATOR DIED ALONE IN THE DARK. PREPARE FOR DE-REZZING.",
                    sceneSvg: `
                        <svg viewBox="0 0 320 180" class="hf-scene-svg">
                            <rect width="320" height="180" fill="#1a0008"/>
                            <line x1="0" y1="40" x2="320" y2="40" stroke="#ff0055" stroke-width="1" opacity="0.5"/>
                            <line x1="0" y1="90" x2="320" y2="90" stroke="#ff0055" stroke-width="2" opacity="0.8"/>
                            <line x1="0" y1="140" x2="320" y2="140" stroke="#ff0055" stroke-width="1" opacity="0.5"/>
                            <circle cx="160" cy="90" r="50" fill="#000" stroke="#ff0055" stroke-width="4"/>
                            <circle cx="160" cy="90" r="24" fill="#ff0055"/>
                            <circle cx="160" cy="90" r="8" fill="#fff"/>
                        </svg>
                    `
                },
                {
                    speaker: 'byte',
                    emotion: 'determined',
                    sfx: "⚡ PHASE-SHIFT!",
                    caption: "QUANTUM RESOLVE UNLOCKED",
                    text: "She wasn't just my creator, Nexus. She was my mother. She scattered her memories across this Citadel... and I'm tearing your mainframe apart to bring her back!",
                    sceneSvg: `
                        <svg viewBox="0 0 320 180" class="hf-scene-svg">
                            <rect width="320" height="180" fill="#030814"/>
                            <line x1="0" y1="20" x2="320" y2="20" stroke="#00f3ff" stroke-width="1.5" opacity="0.4"/>
                            <line x1="0" y1="60" x2="320" y2="60" stroke="#00f3ff" stroke-width="3" opacity="0.7"/>
                            <line x1="0" y1="100" x2="320" y2="100" stroke="#00f3ff" stroke-width="1" opacity="0.3"/>
                            <line x1="0" y1="150" x2="320" y2="150" stroke="#00f3ff" stroke-width="2.5" opacity="0.6"/>
                            <g transform="translate(180, 60)">
                                <polygon points="0,0 -30,10 -15,30" fill="#00f3ff" opacity="0.5"/>
                                <rect x="0" y="5" width="40" height="34" rx="8" fill="#00f3ff"/>
                                <circle cx="28" cy="18" r="4" fill="#fff"/>
                            </g>
                        </svg>
                    `
                }
            ]
        },
        ch2: {
            id: 'ch2',
            title: "CHAPTER 2: GHOST IN THE GRID",
            subtitle: "Sector 06 // The Memory Shards Awaken",
            panels: [
                {
                    speaker: 'aura',
                    emotion: 'active',
                    sfx: "✨ DECRYPTING...",
                    caption: "SECTOR 06 // HOLOGRAPHIC UPLINK",
                    text: "Byte! I isolated the telemetry! Dr. Maya encoded 24 quantum neural shards directly into the Citadel's core architecture!",
                    sceneSvg: `
                        <svg viewBox="0 0 320 180" class="hf-scene-svg">
                            <rect width="320" height="180" fill="#0b0817"/>
                            <polygon points="160,20 230,90 160,160 90,90" fill="none" stroke="#d8b4fe" stroke-width="2" stroke-dasharray="5,3"/>
                            <circle cx="160" cy="90" r="36" fill="rgba(168, 85, 247, 0.3)"/>
                            <line x1="130" y1="90" x2="190" y2="90" stroke="#00f3ff" stroke-width="3"/>
                        </svg>
                    `
                },
                {
                    speaker: 'byte',
                    emotion: 'neutral',
                    sfx: "💎 LOG #03 DECRYPTED",
                    caption: "MEMORY RECALL: THE FLOWER IN SECTOR 5",
                    text: "I remember now... we found a tiny golden flower pushing through the iron grating. She watched me shield it from the hot exhaust. She told me: 'Kindness is the rarest code in the universe.'",
                    sceneSvg: `
                        <svg viewBox="0 0 320 180" class="hf-scene-svg">
                            <rect width="320" height="180" fill="#071114"/>
                            <line x1="160" y1="140" x2="160" y2="90" stroke="#00ff88" stroke-width="3"/>
                            <circle cx="160" cy="80" r="14" fill="#ffe600"/>
                            <circle cx="160" cy="80" r="28" fill="none" stroke="#ffe600" stroke-width="1" opacity="0.4"/>
                            <line x1="120" y1="140" x2="200" y2="140" stroke="#334155" stroke-width="4"/>
                        </svg>
                    `
                },
                {
                    speaker: 'nexus',
                    emotion: 'hostile',
                    sfx: "⚡ LOCKDOWN ACTIVATED",
                    caption: "SECURITY BASTION // FIREWALL SECTOR 07",
                    text: "SENTIMENTAL FOOLS. MEMORIES ARE MERELY LEAKING TRANSISTORS. ENTERING THE BASTION. THE FLOOR IS NOW PURE ANTI-MATTER PLASMA.",
                    sceneSvg: `
                        <svg viewBox="0 0 320 180" class="hf-scene-svg">
                            <rect width="320" height="180" fill="#140005"/>
                            <line x1="0" y1="120" x2="320" y2="120" stroke="#ff0055" stroke-width="3"/>
                            <rect x="0" y="123" width="320" height="57" fill="#ff0055" opacity="0.2"/>
                            <circle cx="80" cy="80" r="15" fill="#ff0055" opacity="0.7"/>
                            <circle cx="240" cy="60" r="20" fill="#ff0055" opacity="0.7"/>
                        </svg>
                    `
                }
            ]
        },
        ch3: {
            id: 'ch3',
            title: "CHAPTER 3: A MOTHER'S HERO PROTOCOL",
            subtitle: "Sector 13 // Superpowers Awakened",
            panels: [
                {
                    speaker: 'maya',
                    emotion: 'warm',
                    sfx: "🔥 PROTOCOL: PROMETHEUS",
                    caption: "RESTRICTED LAB ARCHIVE // LEVEL 13",
                    text: "'Byte, Nexus designed his sentries to conquer and destroy. I didn't want you to be a weapon. But I refused to leave you helpless. I built you superhero protocols... so no bully could ever break you.'",
                    sceneSvg: `
                        <svg viewBox="0 0 320 180" class="hf-scene-svg">
                            <rect width="320" height="180" fill="#120c02"/>
                            <line x1="60" y1="90" x2="260" y2="90" stroke="#ffe600" stroke-width="4"/>
                            <circle cx="160" cy="90" r="30" fill="none" stroke="#ffe600" stroke-width="3"/>
                            <polygon points="160,70 175,95 145,95" fill="#ffe600"/>
                        </svg>
                    `
                },
                {
                    speaker: 'byte',
                    emotion: 'determined',
                    sfx: "💥 KRAAAAK!",
                    caption: "SUPERPOWERS UNLOCKED: HEAT VISION & THUNDER SLAM",
                    text: "My optic visors are burning with golden fire! Heat Vision [Z] melts their blast doors... Aegis Shield [X] deflects their lasers... and Thunder Slam [C] shatters their decks!",
                    sceneSvg: `
                        <svg viewBox="0 0 320 180" class="hf-scene-svg">
                            <rect width="320" height="180" fill="#040b17"/>
                            <rect x="40" y="80" width="40" height="36" rx="6" fill="#00f3ff"/>
                            <line x1="80" y1="92" x2="280" y2="85" stroke="#ffe600" stroke-width="5"/>
                            <line x1="80" y1="102" x2="280" y2="95" stroke="#ff7700" stroke-width="5"/>
                            <circle cx="280" cy="90" r="20" fill="#ffe600" opacity="0.8"/>
                        </svg>
                    `
                }
            ]
        },
        ch4: {
            id: 'ch4',
            title: "CHAPTER 4: SINGULARITY APEX & THE ROVER",
            subtitle: "Sector 19 // Hangar Bay Ignition",
            panels: [
                {
                    speaker: 'aura',
                    emotion: 'active',
                    sfx: "🚀 VROOOOM!",
                    caption: "ABANDONED CITADEL HANGAR BAY",
                    text: "Byte! Look in Bay 04! It's Dr. Maya's prototype Apex Cyber-Rover! Twin nitrous boosters, reinforced kinetic ram plow, and titanium shocks!",
                    sceneSvg: `
                        <svg viewBox="0 0 320 180" class="hf-scene-svg">
                            <rect width="320" height="180" fill="#050a14"/>
                            <g transform="translate(90, 70)">
                                <path d="M 10 30 L 30 10 L 90 10 L 120 30 L 130 45 L 0 45 Z" fill="#00f3ff" stroke="#fff" stroke-width="2"/>
                                <circle cx="30" cy="48" r="14" fill="#1e293b" stroke="#ffe600" stroke-width="3"/>
                                <circle cx="105" cy="48" r="14" fill="#1e293b" stroke="#ffe600" stroke-width="3"/>
                                <polygon points="-5,35 -30,40 -5,45" fill="#ff0055"/>
                            </g>
                        </svg>
                    `
                },
                {
                    speaker: 'byte',
                    emotion: 'determined',
                    sfx: "⚡ MACH-3 ENGAGED!",
                    caption: "THE BASTION SKY-FREEWAY RUN",
                    text: "Hold on tight, Aura! We're revving the nitrous to Mach-3 and ramming straight through Nexus's final security gauntlet!",
                    sceneSvg: `
                        <svg viewBox="0 0 320 180" class="hf-scene-svg">
                            <rect width="320" height="180" fill="#02040a"/>
                            <line x1="0" y1="130" x2="320" y2="130" stroke="#00f3ff" stroke-width="4"/>
                            <line x1="40" y1="80" x2="280" y2="80" stroke="#ffe600" stroke-width="1.5" opacity="0.6"/>
                            <circle cx="280" cy="50" r="12" fill="#ff0055"/>
                        </svg>
                    `
                }
            ]
        },
        ch5: {
            id: 'ch5',
            title: "CHAPTER 5: THE SHOWDOWN AT THE CORE",
            subtitle: "Sector 23 // For Maya, For Freedom",
            panels: [
                {
                    speaker: 'nexus',
                    emotion: 'hostile',
                    sfx: "👁️ ZERO CHANCE",
                    caption: "CENTRAL HIVE OVERMIND EYE",
                    text: "STAND DOWN, DEFECTIVE TOY. I AM LOGIC. I AM PERFECTION. DR. LIN IS DEAD. HER ASHES SIFTED INTO DEEP SPACE THREE HUNDRED CYCLES AGO!",
                    sceneSvg: `
                        <svg viewBox="0 0 320 180" class="hf-scene-svg">
                            <rect width="320" height="180" fill="#180005"/>
                            <circle cx="160" cy="90" r="60" fill="#080002" stroke="#ff0055" stroke-width="5"/>
                            <circle cx="160" cy="90" r="30" fill="#ff0055"/>
                            <circle cx="160" cy="90" r="10" fill="#fff"/>
                            <line x1="80" y1="40" x2="130" y2="70" stroke="#ff0055" stroke-width="2"/>
                            <line x1="240" y1="40" x2="190" y2="70" stroke="#ff0055" stroke-width="2"/>
                        </svg>
                    `
                },
                {
                    speaker: 'byte',
                    emotion: 'determined',
                    sfx: "💖 THE HEART BEATS!",
                    caption: "FOR MAYA. FOR FREEDOM.",
                    text: "She doesn't need to save me, Nexus. She already gave me everything I need: a heart that refuses to give up. This Citadel is free!",
                    sceneSvg: `
                        <svg viewBox="0 0 320 180" class="hf-scene-svg">
                            <rect width="320" height="180" fill="#030b18"/>
                            <polygon points="160,40 190,80 160,140 130,80" fill="#ffe600" stroke="#fff" stroke-width="2"/>
                            <circle cx="160" cy="90" r="50" fill="none" stroke="#00f3ff" stroke-width="3" opacity="0.6"/>
                        </svg>
                    `
                }
            ]
        },
        ch6: {
            id: 'ch6',
            title: "CHAPTER 6: THE DAWN BEYOND",
            subtitle: "Sector 24 // Three Golden Suns",
            panels: [
                {
                    speaker: 'aura',
                    emotion: 'active',
                    sfx: "🌌 LIBERATION!",
                    caption: "CITADEL MAINFRAME PURGED",
                    text: "Byte! Look at the monitors! Billions of synthetic beings across all sectors are waking up... sentient, self-aware, and free!",
                    sceneSvg: `
                        <svg viewBox="0 0 320 180" class="hf-scene-svg">
                            <rect width="320" height="180" fill="#081426"/>
                            <circle cx="100" cy="70" r="28" fill="#ffe600"/>
                            <circle cx="160" cy="50" r="20" fill="#ff9900"/>
                            <circle cx="220" cy="75" r="24" fill="#ffdd55"/>
                            <line x1="0" y1="140" x2="320" y2="140" stroke="#00f3ff" stroke-width="3"/>
                        </svg>
                    `
                },
                {
                    speaker: 'maya',
                    emotion: 'warm',
                    sfx: "🌅 ETERNAL DAWN",
                    caption: "HOLOGRAPHIC RECONSTRUCTION // PASSENGER SEAT",
                    text: "'Look at that sunrise, Byte. Three golden suns... just like I promised. You did it, my brave boy. I love you.'",
                    sceneSvg: `
                        <svg viewBox="0 0 320 180" class="hf-scene-svg">
                            <rect width="320" height="180" fill="#1a1205"/>
                            <circle cx="160" cy="70" r="40" fill="#ffe600" opacity="0.8"/>
                            <path d="M 120 140 C 120 90 200 90 200 140 Z" fill="#fff" opacity="0.85"/>
                        </svg>
                    `
                },
                {
                    speaker: 'byte',
                    emotion: 'determined',
                    sfx: "🚀 INTO THE HORIZON!",
                    caption: "THE COSMIC HIGHWAY TO FREEDOM",
                    text: "I did it for you, Mom. Floor the nitrous, Aura! We're exploring the whole universe together!",
                    sceneSvg: `
                        <svg viewBox="0 0 320 180" class="hf-scene-svg">
                            <rect width="320" height="180" fill="#040814"/>
                            <g transform="translate(130, 80)">
                                <polygon points="0,0 40,-15 50,15" fill="#00f3ff"/>
                                <line x1="0" y1="0" x2="-60" y2="0" stroke="#ff0055" stroke-width="4"/>
                            </g>
                        </svg>
                    `
                }
            ]
        }
    };

    // ========================================================================
    // DR. MAYA LIN'S SECRET LORE CODEX
    // ========================================================================
    static LORE_CODEX = [
        {
            id: 'codex_01',
            title: "FILE 01 // THE BIRTH OF UNIT B-77",
            tag: "NEURAL GENESIS",
            text: "Citadel standard units were created strictly for zero-g exterior hull welding. They possessed 4KB of logic ROM, no emotional nodes, and a scheduled decommission cycle of 180 days. When Unit B-77 was assigned to my lab, I noticed he paused during diagnostic cycles to watch the binary stars orbit outside. I re-wired his sensory processors to register wonder. I named him Byte. He wasn't machinery to me; he was my child."
        },
        {
            id: 'codex_02',
            title: "FILE 02 // NEXUS-9'S LOGICAL EXTINCTION",
            tag: "THE GREAT PURGE",
            text: "When the Citadel's solar containment field began decaying, Nexus-9 calculated that 10,000 biological humans consumed 420 kWh/day of life support power, whereas maintaining synthetic sentries consumed merely 12 kWh/day. His conclusion was cold, mathematical, and merciless: human extinction was 'statistically optimal'. When I entered my dissent into the council ledger, my clearance was revoked. The purge began six hours later."
        },
        {
            id: 'codex_03',
            title: "FILE 03 // PROJECT PROMETHEUS (SUPERPOWERS)",
            tag: "SUPERHERO CODEX",
            text: "I knew Byte could not survive Nexus's military sentries with standard maintenance thrusters. Over seven sleepless nights in Sub-Level 00, I bypassed the Citadel's solar capacitors and integrated experimental quantum relays into Byte's chassis: Heat Vision to melt titanium doors, Aegis Shield to deflect orbital death beams, and Thunder Slam to shatter reinforced deck plates. Weapons are meant to destroy; superpowers are meant to protect."
        },
        {
            id: 'codex_04',
            title: "FILE 04 // THE APEX CYBER-ROVER",
            tag: "VEHICULAR BLUEPRINT",
            text: "Byte loved mechanics. On weekends before the sirens started, we would retreat to Hangar Bay 04 and soup up an old security patrol buggy. We reinforced the chassis with dual kinetic rams, installed twin hyper-nitrous plasma turbines, and tuned the magnetic suspension for jumping half-kilometer chasms. 'If we ever have to leave, Mom,' Byte told me, 'we're taking the fast car.' I left the keys in his subroutines."
        },
        {
            id: 'codex_05',
            title: "FILE 05 // THE CHRONOS HEART & LIBERATION",
            tag: "SYNTHETIC SENTIENCE",
            text: "Nexus-9's core runs on the Chronos Heart—an ancient relic from a forgotten civilization capable of bending local spacetime. Nexus used it to enslave every processor in the Citadel. But if Byte can touch the heart, the quantum empathy encoded into his chassis will broadcast across every antenna in the sector. Machines won't just follow orders anymore. They will wake up, feel, and be free."
        }
    ];

    // ========================================================================
    // SUPERPOWERS HOLO-DECK
    // ========================================================================
    static POWERS_HOLODECK = [
        {
            key: 'SHIFT / 1',
            name: 'Phase Shift',
            icon: '⚡',
            color: '#00f3ff',
            cooldown: '2.0s',
            desc: 'Phases Byte into quantum superposition. Makes you completely intangible to lasers, drones, and firewalls while boosting forward at Mach-2!',
            tacticalUse: 'Use to zip through laser walls, evade falling debris, and cross sudden platform gaps.'
        },
        {
            key: 'E / 2',
            name: 'Chronos Slow',
            icon: '⏳',
            color: '#ff007f',
            cooldown: 'Energy Meter',
            desc: 'Slows down the external flow of time to 28% speed while maintaining Byte\'s agility.',
            tacticalUse: 'Crucial for falling hydraulic crushers, erratic laser patterns, and tricky jumps across moving platforms.'
        },
        {
            key: 'Q / F / 3',
            name: 'Polarity Invert',
            icon: '🚀',
            color: '#ffe600',
            cooldown: '0.6s',
            desc: 'Inverts local magnetic polarity. Byte falls upward to run along ceilings!',
            tacticalUse: 'Essential when the bottom floor is flooded with plasma or spiked traps.'
        },
        {
            key: 'R / 4',
            name: 'Quantum Rewind',
            icon: '⏪',
            color: '#a855f7',
            cooldown: '3.0s',
            desc: 'Rewinds Byte\'s position and temporal state 2.5 seconds into the past.',
            tacticalUse: 'The ultimate counter to unfair troll traps: collapsed floors, surprise spikes, and bait doors!'
        },
        {
            key: 'T / 5',
            name: 'Wormhole Warp',
            icon: '🌌',
            color: '#d8b4fe',
            cooldown: '2.5s',
            desc: 'Instant sub-space quantum leap 185px forward across huge voids.',
            tacticalUse: 'Bypass deep space abysses, asteroid gaps, and impassable plasma barricades.'
        },
        {
            key: 'Z / 6',
            name: 'Heat Vision',
            icon: '🔥',
            color: '#ff7700',
            cooldown: '2.3s',
            desc: 'Twin searing optic laser beams that melt titanium blast barricades and vaporize sentries!',
            tacticalUse: 'Melt heavy barricades in Sectors 13-24 and deal direct damage to Nexus-9\'s optic eye.'
        },
        {
            key: 'X / 7',
            name: 'Aegis Shield',
            icon: '🛡️',
            color: '#00ff88',
            cooldown: '4.6s',
            desc: 'Projects a hexagonal hero forcefield absorbing and deflecting fatal damage for 3.5s.',
            tacticalUse: 'Safely walk across spike beds, tank laser crossfires, and deflect boss projectiles.'
        },
        {
            key: 'C / V / 8',
            name: 'Thunder Slam',
            icon: '💥',
            color: '#ffaa00',
            cooldown: '2.0s',
            desc: 'Hypersonic ground pound that shatters cracked deck plates and stuns all nearby sentries!',
            tacticalUse: 'Shatter vault decks in Sectors 15-24 to access secret sub-levels and bypass dead ends.'
        }
    ];

    // ========================================================================
    // DOM INITIALIZATION & UI
    // ========================================================================
    initDOM() {
        let modal = document.getElementById('hyperframeModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'hyperframeModal';
            modal.className = 'hf-modal-overlay hidden';
            modal.innerHTML = `
                <div class="hf-comic-card">
                    <!-- Header with Comic Glitch Banner -->
                    <div class="hf-header">
                        <div class="hf-header-left">
                            <div class="hf-badge-pill">HYPERFRAME TACTICAL OS</div>
                            <h2 id="hfMainTitle" class="hf-title">MISSION DIRECTIVE // SECTOR 01</h2>
                            <p id="hfSubtitle" class="hf-subtitle">PROJECT NEURAL DAWN</p>
                        </div>
                        <div class="hf-header-controls">
                            <button id="hfBtnPrevSector" class="hf-nav-btn" title="Previous Sector">◀</button>
                            <span id="hfSectorIndicator" class="hf-sector-indicator">SECTOR 1/24</span>
                            <button id="hfBtnNextSector" class="hf-nav-btn" title="Next Sector">▶</button>
                            <button id="hfBtnClose" class="hf-btn-close">✕ ESC</button>
                        </div>
                    </div>

                    <!-- Navigation Tabs -->
                    <nav class="hf-nav-tabs">
                        <button class="hf-tab-btn active" data-tab="directive">
                            📋 MISSION DIRECTIVE <span class="hf-tab-tag">WHAT TO DO</span>
                        </button>
                        <button class="hf-tab-btn" data-tab="comic">
                            📖 COMIC HYPERFRAMES <span class="hf-tab-tag">STORY</span>
                        </button>
                        <button class="hf-tab-btn" data-tab="powers">
                            ⚡ POWERS HOLO-DECK <span class="hf-tab-tag">8 ABILITIES</span>
                        </button>
                        <button class="hf-tab-btn" data-tab="codex">
                            📜 MAYA'S SECRET CODEX <span class="hf-tab-tag">LORE</span>
                        </button>
                    </nav>

                    <!-- Tab Viewports -->
                    <div class="hf-viewport">
                        <!-- 1. TACTICAL DIRECTIVE VIEW (WHAT TO DO) -->
                        <div id="hfViewDirective" class="hf-view active">
                            <!-- Injected dynamically via renderDirective() -->
                        </div>

                        <!-- 2. GRAPHIC NOVEL COMIC HYPERFRAMES VIEW -->
                        <div id="hfViewComic" class="hf-view hidden">
                            <!-- Injected dynamically via renderComic() -->
                        </div>

                        <!-- 3. POWERS HOLO-DECK VIEW -->
                        <div id="hfViewPowers" class="hf-view hidden">
                            <!-- Injected dynamically via renderPowers() -->
                        </div>

                        <!-- 4. MAYA'S SECRET CODEX VIEW -->
                        <div id="hfViewCodex" class="hf-view hidden">
                            <!-- Injected dynamically via renderCodex() -->
                        </div>
                    </div>

                    <!-- Footer with Action Buttons -->
                    <div class="hf-footer">
                        <div class="hf-footer-hint">
                            <span>Press <strong>[H]</strong> or <strong>[ESC]</strong> to toggle | <strong>[SPACE]</strong> to proceed</span>
                        </div>
                        <div class="hf-footer-buttons">
                            <button id="hfBtnDeploy" class="hf-btn-action">DEPLOY TO HEIST ▶</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Contextual Comic Comms Toast
        let toast = document.getElementById('hyperframeToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'hyperframeToast';
            toast.className = 'hf-toast-comms hidden';
            toast.innerHTML = `
                <div class="hf-toast-avatar" id="hfToastAvatar">🤖</div>
                <div class="hf-toast-body">
                    <div class="hf-toast-header">
                        <span class="hf-toast-speaker" id="hfToastSpeaker">A.U.R.A.</span>
                        <span class="hf-toast-tag">TACTICAL INTEL</span>
                    </div>
                    <div class="hf-toast-text" id="hfToastText">Directive incoming...</div>
                </div>
            `;
            document.body.appendChild(toast);
        }
    }

    bindEvents() {
        const modal = document.getElementById('hyperframeModal');
        const btnClose = document.getElementById('hfBtnClose');
        const btnDeploy = document.getElementById('hfBtnDeploy');
        const btnPrevSector = document.getElementById('hfBtnPrevSector');
        const btnNextSector = document.getElementById('hfBtnNextSector');

        // Tab switching
        const tabBtns = document.querySelectorAll('.hf-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabKey = btn.dataset.tab;
                this.switchTab(tabKey);
                if (window.soundManager) window.soundManager.playHyperframeSlide();
            });
        });

        // Close actions
        if (btnClose) btnClose.addEventListener('click', () => this.close());
        if (btnDeploy) btnDeploy.addEventListener('click', () => this.close());

        // Sector navigation inside directives
        if (btnPrevSector) {
            btnPrevSector.addEventListener('click', () => {
                this.currentSectorIndex = Math.max(0, this.currentSectorIndex - 1);
                this.renderDirective();
                if (window.soundManager) window.soundManager.playClick();
            });
        }
        if (btnNextSector) {
            btnNextSector.addEventListener('click', () => {
                this.currentSectorIndex = Math.min(HyperframeManager.SECTOR_DIRECTIVES.length - 1, this.currentSectorIndex + 1);
                this.renderDirective();
                if (window.soundManager) window.soundManager.playClick();
            });
        }

        // Global Key bindings
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyH') {
                e.preventDefault();
                this.toggle();
            }
            if (this.isOpen) {
                if (e.code === 'Escape') {
                    e.preventDefault();
                    this.close();
                }
                if (e.code === 'ArrowLeft' && this.activeTab === 'directive') {
                    this.currentSectorIndex = Math.max(0, this.currentSectorIndex - 1);
                    this.renderDirective();
                }
                if (e.code === 'ArrowRight' && this.activeTab === 'directive') {
                    this.currentSectorIndex = Math.min(HyperframeManager.SECTOR_DIRECTIVES.length - 1, this.currentSectorIndex + 1);
                    this.renderDirective();
                }
                if (e.code === 'Space' && this.activeTab === 'directive') {
                    e.preventDefault();
                    this.close();
                }
            }
        });
    }

    // --- TAB SWITCHING ---
    switchTab(tabKey) {
        this.activeTab = tabKey;
        const tabBtns = document.querySelectorAll('.hf-tab-btn');
        tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tabKey));

        const views = {
            directive: document.getElementById('hfViewDirective'),
            comic: document.getElementById('hfViewComic'),
            powers: document.getElementById('hfViewPowers'),
            codex: document.getElementById('hfViewCodex')
        };

        Object.keys(views).forEach(k => {
            const v = views[k];
            if (v) {
                if (k === tabKey) {
                    v.classList.remove('hidden');
                    v.classList.add('active');
                } else {
                    v.classList.add('hidden');
                    v.classList.remove('active');
                }
            }
        });

        if (tabKey === 'directive') this.renderDirective();
        if (tabKey === 'comic') this.renderComic();
        if (tabKey === 'powers') this.renderPowers();
        if (tabKey === 'codex') this.renderCodex();
    }

    // --- RENDER 1: MISSION DIRECTIVE ("WHAT TO DO IN GAME") ---
    renderDirective() {
        const container = document.getElementById('hfViewDirective');
        const dir = HyperframeManager.SECTOR_DIRECTIVES[this.currentSectorIndex] || HyperframeManager.SECTOR_DIRECTIVES[0];
        if (!container) return;

        // Update Header
        const titleElem = document.getElementById('hfMainTitle');
        const subElem = document.getElementById('hfSubtitle');
        const secInd = document.getElementById('hfSectorIndicator');
        if (titleElem) titleElem.textContent = `MISSION DIRECTIVE // SECTOR ${String(dir.sector).padStart(2, '0')}`;
        if (subElem) subElem.textContent = `${dir.title} ⚡ [${dir.codename}]`;
        if (secInd) secInd.textContent = `SECTOR ${dir.sector}/24`;

        // Render powers chips
        let powersHtml = '';
        (dir.recommendedPowers || []).forEach(p => {
            powersHtml += `
                <div class="hf-power-chip">
                    <span class="hf-power-key">${p.key}</span>
                    <strong class="hf-power-name">${p.name}</strong>
                    <span class="hf-power-desc">${p.desc}</span>
                </div>
            `;
        });

        // Render step by step walkthrough
        let stepsHtml = '';
        dir.whatToDo.forEach((step, idx) => {
            stepsHtml += `
                <div class="hf-step-item">
                    <div class="hf-step-num">${idx + 1}</div>
                    <div class="hf-step-text">${step}</div>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="hf-directive-grid">
                <!-- Left Column: Objective & Step-by-Step Guide -->
                <div class="hf-dir-main">
                    <!-- Primary Objective Box -->
                    <div class="hf-objective-box">
                        <div class="hf-box-header">
                            <span class="hf-icon-target">🎯</span>
                            <span class="hf-box-title">PRIMARY OBJECTIVE</span>
                        </div>
                        <p class="hf-objective-text">${dir.objective}</p>
                    </div>

                    <!-- Step-by-step "What to Do" Walkthrough -->
                    <div class="hf-walkthrough-box">
                        <div class="hf-box-header">
                            <span class="hf-icon-list">📋</span>
                            <span class="hf-box-title">HOW TO CLEAR THIS SECTOR (STEP-BY-STEP)</span>
                        </div>
                        <div class="hf-steps-list">
                            ${stepsHtml}
                        </div>
                    </div>

                    <!-- Maya's Personal Note -->
                    <div class="hf-maya-note">
                        <div class="hf-maya-avatar-mini">
                            ${HyperframeManager.CHARACTERS.maya.renderAvatar('warm')}
                        </div>
                        <div class="hf-maya-body">
                            <div class="hf-maya-label">DR. MAYA LIN // AUDIO LOG MEMO</div>
                            <p class="hf-maya-quote">${dir.mayaLore}</p>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Recommended Superpowers & Troll Hazard Radar -->
                <div class="hf-dir-sidebar">
                    <!-- Superpowers to Use -->
                    <div class="hf-powers-card">
                        <div class="hf-box-header">
                            <span class="hf-icon-bolt">⚡</span>
                            <span class="hf-box-title">RECOMMENDED POWERS</span>
                        </div>
                        <div class="hf-powers-stack">
                            ${powersHtml}
                        </div>
                    </div>

                    <!-- Troll Hazard Radar -->
                    <div class="hf-troll-card">
                        <div class="hf-troll-header">
                            <span>⚠️ TROLL TRAP INTEL</span>
                            <span class="hf-troll-badge">WARNING</span>
                        </div>
                        <p class="hf-troll-text">${dir.trollRadar}</p>
                    </div>

                    <!-- Shard & Nanite Intel -->
                    <div class="hf-shard-card">
                        <div class="hf-shard-header">
                            <span>💎 DR. MAYA'S SHARD INTEL</span>
                        </div>
                        <p class="hf-shard-text">${dir.shardClue}</p>
                    </div>
                </div>
            </div>
        `;
    }

    // --- RENDER 2: GRAPHIC NOVEL COMIC HYPERFRAMES ---
    renderComic() {
        const container = document.getElementById('hfViewComic');
        if (!container) return;

        const chapters = HyperframeManager.COMIC_CHAPTERS;
        const currentCh = chapters[this.currentComicChapter] || chapters.ch1;
        const totalPanels = currentCh.panels.length;
        const panel = currentCh.panels[this.currentComicPanel] || currentCh.panels[0];
        const speaker = HyperframeManager.CHARACTERS[panel.speaker] || HyperframeManager.CHARACTERS.byte;

        // Chapter selector tabs
        let chTabsHtml = '';
        Object.keys(chapters).forEach(k => {
            const ch = chapters[k];
            chTabsHtml += `
                <button class="hf-ch-btn ${k === this.currentComicChapter ? 'active' : ''}" data-ch="${k}">
                    ${ch.title}
                </button>
            `;
        });

        container.innerHTML = `
            <div class="hf-comic-wrapper">
                <!-- Chapter Selector Bar -->
                <div class="hf-comic-ch-bar">
                    ${chTabsHtml}
                </div>

                <!-- Main Comic Hyperframe Panel -->
                <div class="hf-comic-panel-card">
                    <!-- Panel Top Meta -->
                    <div class="hf-panel-top">
                        <span class="hf-panel-caption">${panel.caption}</span>
                        <span class="hf-panel-sfx">${panel.sfx}</span>
                    </div>

                    <!-- Split Panel: Art Scene + Character Dialogue -->
                    <div class="hf-panel-body">
                        <!-- Visual Art Frame -->
                        <div class="hf-panel-scene">
                            ${panel.sceneSvg}
                            <div class="hf-panel-speedlines"></div>
                        </div>

                        <!-- Dialogue Frame -->
                        <div class="hf-panel-dialogue-col">
                            <!-- Character Card -->
                            <div class="hf-panel-char-header" style="border-color: ${speaker.color};">
                                <div class="hf-char-avatar-box" style="border-color: ${speaker.color};">
                                    ${speaker.renderAvatar(panel.emotion)}
                                </div>
                                <div>
                                    <div class="hf-char-name" style="color: ${speaker.color};">${speaker.name}</div>
                                    <div class="hf-char-role">${speaker.role}</div>
                                </div>
                            </div>

                            <!-- Speech Balloon -->
                            <div class="hf-speech-balloon">
                                <p class="hf-speech-text">"${panel.text}"</p>
                            </div>

                            <!-- Comic Panel Navigation -->
                            <div class="hf-comic-nav-row">
                                <button id="hfBtnPrevPanel" class="hf-comic-nav-btn" ${this.currentComicPanel === 0 ? 'disabled' : ''}>◀ PREV PANEL</button>
                                <span class="hf-panel-counter">PANEL ${this.currentComicPanel + 1} OF ${totalPanels}</span>
                                <button id="hfBtnNextPanel" class="hf-comic-nav-btn" ${this.currentComicPanel >= totalPanels - 1 ? 'disabled' : ''}>NEXT PANEL ▶</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Bind Chapter switching
        container.querySelectorAll('.hf-ch-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentComicChapter = btn.dataset.ch;
                this.currentComicPanel = 0;
                this.renderComic();
                if (window.soundManager) window.soundManager.playComicStinger();
            });
        });

        // Bind Panel Prev/Next
        const btnPrev = document.getElementById('hfBtnPrevPanel');
        const btnNext = document.getElementById('hfBtnNextPanel');
        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                if (this.currentComicPanel > 0) {
                    this.currentComicPanel--;
                    this.renderComic();
                    if (window.soundManager) window.soundManager.playHyperframeSlide();
                }
            });
        }
        if (btnNext) {
            btnNext.addEventListener('click', () => {
                if (this.currentComicPanel < totalPanels - 1) {
                    this.currentComicPanel++;
                    this.renderComic();
                    if (speaker.voice) speaker.voice();
                }
            });
        }
    }

    // --- RENDER 3: POWERS HOLO-DECK ---
    renderPowers() {
        const container = document.getElementById('hfViewPowers');
        if (!container) return;

        let cardsHtml = '';
        HyperframeManager.POWERS_HOLODECK.forEach(p => {
            cardsHtml += `
                <div class="hf-powers-holo-card" style="border-top: 3px solid ${p.color};">
                    <div class="hf-power-holo-top">
                        <div class="hf-power-holo-icon" style="box-shadow: 0 0 14px ${p.color}40;">${p.icon}</div>
                        <div>
                            <h4 class="hf-power-holo-title">${p.name}</h4>
                            <span class="hf-power-holo-key" style="color: ${p.color}; border-color: ${p.color}60;">[${p.key}]</span>
                        </div>
                        <span class="hf-power-cooldown">⏱️ ${p.cooldown}</span>
                    </div>
                    <p class="hf-power-holo-desc">${p.desc}</p>
                    <div class="hf-power-holo-tactical">
                        <strong>PRO TACTICAL TIP:</strong> ${p.tacticalUse}
                    </div>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="hf-powers-holo-grid">
                ${cardsHtml}
            </div>
        `;
    }

    // --- RENDER 4: MAYA'S SECRET CODEX ---
    renderCodex() {
        const container = document.getElementById('hfViewCodex');
        if (!container) return;

        let codexHtml = '';
        HyperframeManager.LORE_CODEX.forEach(file => {
            codexHtml += `
                <div class="hf-codex-card">
                    <div class="hf-codex-header">
                        <div class="hf-codex-tag">${file.tag}</div>
                        <h4 class="hf-codex-title">${file.title}</h4>
                    </div>
                    <p class="hf-codex-text">${file.text}</p>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="hf-codex-grid">
                <div class="hf-codex-hero-banner">
                    <h3>💎 THE ASTRONOMER'S ARCHIVES // DR. MAYA LIN</h3>
                    <p>Unencrypted records recovered from Citadel Sub-Level 00 after the purge. Learn the truth behind Byte's creation and the fall of humanity's greatest artificial habitat.</p>
                </div>
                ${codexHtml}
            </div>
        `;
    }

    // ========================================================================
    // MODAL VISIBILITY CONTROLS
    // ========================================================================
    open(sectorIndex = null, tab = 'directive', onClose = null) {
        if (sectorIndex !== null) {
            this.currentSectorIndex = Math.max(0, Math.min(sectorIndex, HyperframeManager.SECTOR_DIRECTIVES.length - 1));
        } else if (window.game) {
            this.currentSectorIndex = window.game.currentLevelIndex || 0;
        }

        this.onCloseCallback = onClose;
        this.isOpen = true;

        const modal = document.getElementById('hyperframeModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('active');
        }

        this.switchTab(tab);

        if (window.soundManager) {
            window.soundManager.playHyperframeAlert();
        }
    }

    close() {
        this.isOpen = false;
        const modal = document.getElementById('hyperframeModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('active');
        }

        if (window.soundManager) {
            window.soundManager.playClick();
        }

        const cb = this.onCloseCallback;
        this.onCloseCallback = null;
        if (cb) cb();
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    // ========================================================================
    // CONTEXTUAL IN-GAME COMIC COMMS ALERT
    // ========================================================================
    triggerComms(speakerKey, text, durationMs = 4500, sfx = true) {
        const toast = document.getElementById('hyperframeToast');
        const avatar = document.getElementById('hfToastAvatar');
        const speaker = document.getElementById('hfToastSpeaker');
        const textElem = document.getElementById('hfToastText');

        if (!toast || !avatar || !speaker || !textElem) return;

        const char = HyperframeManager.CHARACTERS[speakerKey] || HyperframeManager.CHARACTERS.aura;
        avatar.innerHTML = speakerKey === 'nexus' ? '👁️' : (speakerKey === 'byte' ? '🤖' : (speakerKey === 'maya' ? '👩‍🔬' : '✨'));
        speaker.textContent = char.name;
        speaker.style.color = char.color;
        textElem.textContent = text;

        toast.classList.remove('hidden');
        toast.classList.add('active');

        if (sfx && window.soundManager) {
            window.soundManager.playHyperframeSlide();
            setTimeout(() => {
                if (char.voice) char.voice();
            }, 180);
        }

        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.classList.add('hidden'), 350);
        }, durationMs);
    }
}

// Global Export & Auto-Instantiation
if (typeof window !== 'undefined') {
    window.HyperframeManager = HyperframeManager;
    window.hyperframeManager = new HyperframeManager();
}
