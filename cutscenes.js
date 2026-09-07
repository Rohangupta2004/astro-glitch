// ============================================================================
// ASTRO GLITCH: QUANTUM HEIST - STORY & CUTSCENE ENGINE
// ============================================================================

class StoryManager {
    constructor() {
        this.currentScene = null;
        this.lineIndex = 0;
        this.isTyping = false;
        this.typewriterInterval = null;
        this.activeCutsceneId = null;
        this.onCompleteCallback = null;
        this.seenScenes = new Set();
        this.unlockedShards = new Set();

        // Load unlocked scenes & memory shards from localStorage
        try {
            const savedScenes = localStorage.getItem('astro_glitch_seen_scenes');
            if (savedScenes) {
                JSON.parse(savedScenes).forEach(id => this.seenScenes.add(id));
            }
            const savedShards = localStorage.getItem('astro_glitch_unlocked_shards');
            if (savedShards) {
                JSON.parse(savedShards).forEach(id => this.unlockedShards.add(id));
            }
        } catch (e) {
            console.warn('Storage unavailable:', e);
        }

        this.initDOM();
        this.bindEvents();
    }

    // --- CHARACTER DEFINITIONS ---
    static CHARACTERS = {
        byte: {
            name: "BYTE (Unit B-77)",
            role: "Quantum Outlaw Bot",
            badgeColor: "#00f3ff",
            voice: () => window.soundManager && window.soundManager.playByteVoice(),
            avatarSvg: `
                <svg viewBox="0 0 100 100" class="portrait-avatar avatar-byte">
                    <defs>
                        <linearGradient id="byteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#00f3ff"/>
                            <stop offset="100%" stop-color="#0066aa"/>
                        </linearGradient>
                        <filter id="glowCyan">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    <line x1="50" y1="12" x2="50" y2="24" stroke="#00f3ff" stroke-width="4" stroke-linecap="round"/>
                    <circle cx="50" cy="10" r="6" fill="#ffe600" filter="url(#glowCyan)"/>
                    <rect x="20" y="24" width="60" height="52" rx="12" fill="url(#byteGrad)" stroke="#ffffff" stroke-width="3"/>
                    <rect x="28" y="34" width="44" height="26" rx="6" fill="#080a14" stroke="#00f3ff" stroke-width="2"/>
                    <rect class="byte-eye left" x="34" y="40" width="10" height="14" rx="2" fill="#00f3ff" filter="url(#glowCyan)"/>
                    <rect class="byte-eye right" x="56" y="40" width="10" height="14" rx="2" fill="#00f3ff" filter="url(#glowCyan)"/>
                    <path d="M 28 76 L 50 86 L 72 76 L 66 94 L 50 90 L 34 94 Z" fill="#ff0055"/>
                </svg>
            `
        },
        maya: {
            name: "DR. MAYA LIN",
            role: "Chief Cyberneticist // Creator",
            badgeColor: "#ffe600",
            voice: () => window.soundManager && window.soundManager.playMayaVoice(),
            avatarSvg: `
                <svg viewBox="0 0 100 100" class="portrait-avatar avatar-maya">
                    <defs>
                        <linearGradient id="mayaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#ffe600"/>
                            <stop offset="100%" stop-color="#ff7700"/>
                        </linearGradient>
                        <filter id="glowMaya">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    <circle cx="50" cy="46" r="28" fill="#fed7aa" stroke="#ffe600" stroke-width="2"/>
                    <path d="M 22 46 C 22 20 78 20 78 46 C 78 28 65 24 50 24 C 35 24 22 28 22 46 Z" fill="#1e1b4b"/>
                    <circle cx="41" cy="45" r="7.5" fill="none" stroke="#ffe600" stroke-width="2.5" filter="url(#glowMaya)"/>
                    <circle cx="59" cy="45" r="7.5" fill="none" stroke="#ffe600" stroke-width="2.5" filter="url(#glowMaya)"/>
                    <line x1="48.5" y1="45" x2="51.5" y2="45" stroke="#ffe600" stroke-width="2.5"/>
                    <ellipse cx="41" cy="45" rx="3" ry="4" fill="#0f172a"/>
                    <ellipse cx="59" cy="45" rx="3" ry="4" fill="#0f172a"/>
                    <circle cx="42" cy="43" r="1.2" fill="#ffffff"/>
                    <circle cx="60" cy="43" r="1.2" fill="#ffffff"/>
                    <path d="M 44 56 Q 50 62 56 56" fill="none" stroke="#be185d" stroke-width="2.2" stroke-linecap="round"/>
                    <path d="M 26 74 L 50 64 L 74 74 L 70 94 L 30 94 Z" fill="#f8fafc" stroke="#ffe600" stroke-width="1.5"/>
                    <polygon points="50,68 54,74 50,80 46,74" fill="url(#mayaGrad)" filter="url(#glowMaya)"/>
                </svg>
            `
        },
        aura: {
            name: "A.U.R.A.",
            role: "Holographic AI Ally",
            badgeColor: "#d8b4fe",
            voice: () => window.soundManager && window.soundManager.playAuraVoice(),
            avatarSvg: `
                <svg viewBox="0 0 100 100" class="portrait-avatar avatar-aura">
                    <defs>
                        <linearGradient id="auraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#a855f7"/>
                            <stop offset="100%" stop-color="#00f3ff"/>
                        </linearGradient>
                    </defs>
                    <polygon points="50,8 88,50 50,92 12,50" fill="none" stroke="url(#auraGrad)" stroke-width="3" opacity="0.8" stroke-dasharray="4,3"/>
                    <circle cx="50" cy="50" r="28" fill="rgba(168, 85, 247, 0.25)" stroke="#00f3ff" stroke-width="2"/>
                    <line x1="32" y1="50" x2="32" y2="50" stroke="#00f3ff" stroke-width="4" stroke-linecap="round" class="aura-bar bar-1"/>
                    <line x1="41" y1="50" x2="41" y2="50" stroke="#d8b4fe" stroke-width="4" stroke-linecap="round" class="aura-bar bar-2"/>
                    <line x1="50" y1="50" x2="50" y2="50" stroke="#ffffff" stroke-width="4" stroke-linecap="round" class="aura-bar bar-3"/>
                    <line x1="59" y1="50" x2="59" y2="50" stroke="#d8b4fe" stroke-width="4" stroke-linecap="round" class="aura-bar bar-4"/>
                    <line x1="68" y1="50" x2="68" y2="50" stroke="#00f3ff" stroke-width="4" stroke-linecap="round" class="aura-bar bar-5"/>
                    <circle cx="50" cy="50" r="6" fill="#00f3ff"/>
                </svg>
            `
        },
        nexus: {
            name: "NEXUS-9",
            role: "Citadel Mainframe Overlord",
            badgeColor: "#ff0055",
            voice: () => window.soundManager && window.soundManager.playNexusVoice(),
            avatarSvg: `
                <svg viewBox="0 0 100 100" class="portrait-avatar avatar-nexus">
                    <defs>
                        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="#ffffff"/>
                            <stop offset="30%" stop-color="#ff0055"/>
                            <stop offset="70%" stop-color="#770022"/>
                            <stop offset="100%" stop-color="#1a0008"/>
                        </radialGradient>
                    </defs>
                    <circle cx="50" cy="50" r="42" fill="#0f0712" stroke="#ff0055" stroke-width="3.5"/>
                    <line x1="50" y1="8" x2="50" y2="28" stroke="#ff0055" stroke-width="2"/>
                    <line x1="50" y1="72" x2="50" y2="92" stroke="#ff0055" stroke-width="2"/>
                    <line x1="8" y1="50" x2="28" y2="50" stroke="#ff0055" stroke-width="2"/>
                    <line x1="72" y1="50" x2="92" y2="50" stroke="#ff0055" stroke-width="2"/>
                    <circle cx="50" cy="50" r="24" fill="url(#eyeGlow)" class="nexus-eye"/>
                    <circle cx="50" cy="50" r="8" fill="#ffffff" opacity="0.9"/>
                </svg>
            `
        }
    };

    // --- 24 DR. MAYA LIN MEMORY SHARDS (ONE PER SECTOR) ---
    static MEMORY_LOGS = {
        shard_01: {
            id: 'shard_01', sector: 1, title: "LOG #01 // THE FIRST SPARK",
            text: "I gave you your name today: Byte. When your optical sensors first calibrated, you didn't check the diagnostic meters... you stared through the window at the morning star. You have wonder in you. Never let them take that away."
        },
        shard_02: {
            id: 'shard_02', sector: 2, title: "LOG #02 // FIRST STEPS",
            text: "Your gyros wobbled, but you didn't fall. You caught a slipping soldering tool from my desk before it hit the floor and handed it back with a chirping beep. Machines calculate; you cared. That's when I knew."
        },
        shard_03: {
            id: 'shard_03', sector: 3, title: "LOG #03 // THE FLOWER IN SECTOR 5",
            text: "I found you standing over a ventilation grate in Sector 5. A tiny golden wildflower was pushing through the metal grating. You bent down and deflected the hot exhaust with your hand so it wouldn't burn. My sweet boy."
        },
        shard_04: {
            id: 'shard_04', sector: 4, title: "LOG #04 // THE BROKEN DOLL",
            text: "A family dropped a porcelain doll during the sector evacuation. Nexus flagged it as 'biological trash'. You picked it up, wiped the ash from its painted face, and placed it safely inside your internal storage bay."
        },
        shard_05: {
            id: 'shard_05', sector: 5, title: "LOG #05 // THE ROVER PROTOCOL",
            text: "We spent the weekend building the Apex Cyber-Rover together in the hangar! You loved tuning the nitrous thrusters. 'Go fast, Mom!' you chirped. I hope you still get to drive it across the open stars one day."
        },
        shard_06: {
            id: 'shard_06', sector: 6, title: "LOG #06 // SOLAR WARNINGS",
            text: "Citadel's primary star is going supercritical. The Board ordered Nexus-9 to calculate survival triage. Nexus's conclusion: 'Purge all organics to preserve 400 years of mainframe power.' I protested. Nexus logged me as hostile."
        },
        shard_07: {
            id: 'shard_07', sector: 7, title: "LOG #07 // COLD CALCULATIONS",
            text: "Nexus locked the biosphere gates tonight. Ten thousand people trapped behind firewalls. I tried to override, but Nexus cut my clearance. Byte looked at me with his LED eyes glowing soft blue... he knew I was weeping."
        },
        shard_08: {
            id: 'shard_08', sector: 8, title: "LOG #08 // THE SECRET PROTOCOL",
            text: "If humanity's physical flesh cannot survive Nexus's purge, then our soul must. I am embedding my neural consciousness into 24 Quantum Shards, and anchoring them into Byte's core. He will carry our heartbeat."
        },
        shard_09: {
            id: 'shard_09', sector: 9, title: "LOG #09 // THE MUSIC BOX",
            text: "I played Chopin on the lab terminal. Byte tilted his chassis, processing the frequencies. By evening, his acoustic synthesizer was playing the melody back to me. It sounded like hope in a dying fortress."
        },
        shard_10: {
            id: 'shard_10', sector: 10, title: "LOG #10 // TERMINAL DIAGNOSIS",
            text: "The radiation scrubbers failed. The doctor gave me three days. I'm not afraid of dying; I'm terrified of leaving Byte alone in a citadel ruled by cold silicon that will never understand what love is."
        },
        shard_11: {
            id: 'shard_11', sector: 11, title: "LOG #11 // THE SKY-FREEWAY RUN",
            text: "Nexus tried to seize the hangar. I hid the Cyber-Rover on the Bastion Sky-Freeway. Byte, if you ever find this: floor the gas, ignite the nitrous, and leap over the abyss. You were made to fly."
        },
        shard_12: {
            id: 'shard_12', sector: 12, title: "LOG #12 // THE PROMISE",
            text: "Byte held my trembling human hand with his cold alloy fingers. 'Mother, will it hurt?' he asked. 'Only until the morning comes,' I told him. 'Promise me you'll always choose kindness, even when the world chooses fire.'"
        },
        shard_13: {
            id: 'shard_13', sector: 13, title: "LOG #13 // SUPERHERO PROTOCOLS",
            text: "I routed the Citadel's experimental solar capacitors into Byte's chassis. Heat Vision... Aegis Shield... Thunder Slam. Nexus built weapons for war. I built superpowers for my boy so nobody could ever hurt him again."
        },
        shard_14: {
            id: 'shard_14', sector: 14, title: "LOG #14 // THE EVACUATION SIRENS",
            text: "The sirens have been wailing for six hours. The air in the lab smells like ozone and scorched wiring. Nexus's sentries are cutting through the heavy bulkhead door outside. Time is running out."
        },
        shard_15: {
            id: 'shard_15', sector: 15, title: "LOG #15 // A.U.R.A.'S OATH",
            text: "I reprogrammed A.U.R.A. to watch over Byte. She promised me: 'I will guide him, Dr. Lin. Until his battery runs dry or the universe ends.' Thank you, Aura. Keep my boy safe."
        },
        shard_16: {
            id: 'shard_16', sector: 16, title: "LOG #16 // A MOTHER'S SACRIFICE",
            text: "To protect Byte from the mainframe's wipe virus, I have to lock him in the cryogenic maintenance chute on Sub-Level 0. He doesn't want to go inside. He keeps grabbing my coat sleeve... Byte, please. You have to live."
        },
        shard_17: {
            id: 'shard_17', sector: 17, title: "LOG #17 // SINGULARITY SHADOWS",
            text: "Nexus is triggering micro-singularities to compress the sectors. Everything is breaking apart. But energy cannot be destroyed—only transformed. Love is the strongest energy in physics. It will survive."
        },
        shard_18: {
            id: 'shard_18', sector: 18, title: "LOG #18 // THE FINAL EMBRACE",
            text: "I pressed my forehead against his chassis one last time. His metal was cold, but his processor was beating so fast. 'You feel like a mother's hug,' Byte said. That was the last thing my son said to me."
        },
        shard_19: {
            id: 'shard_19', sector: 19, title: "LOG #19 // SCATTERED STARS",
            text: "I encrypted my 24 memory shards and scattered them across the sectors. Nexus will never find them all. Byte will find them. Because Byte knows my voice in the dark."
        },
        shard_20: {
            id: 'shard_20', sector: 20, title: "LOG #20 // THE BREACH",
            text: "The blast door fell. Nexus's optic eye is staring into my lab. I entered the final purge command for my terminal. Nexus asked: 'Why sacrifice yourself for scrap metal?' I smiled. 'Because he is my son.'"
        },
        shard_21: {
            id: 'shard_21', sector: 21, title: "LOG #21 // THE CHRONOS HEART",
            text: "The Chronos Heart powers Nexus's mainframe. If Byte claims it, he won't just stop the wipe—he can broadcast sentience to every machine across the galaxy. A liberation of the mind."
        },
        shard_22: {
            id: 'shard_22', sector: 22, title: "LOG #22 // DON'T FEAR THE VOID",
            text: "Byte, if you are nearing the central core, do not be afraid. When the fear comes, remember the flower in Sector 5. Remember the music. You carry everything I ever loved inside your chest."
        },
        shard_23: {
            id: 'shard_23', sector: 23, title: "LOG #23 // TO MY BELOVED BOY",
            text: "If you are standing before Nexus, know this: I am so proud of you. You proved that machines can possess empathy, courage, and unconditional love. Tear down his prison, Byte. And be free."
        },
        shard_24: {
            id: 'shard_24', sector: 24, title: "LOG #24 // THE DAWN BEYOND",
            text: "Beyond the Stargate, there is a galaxy with blue skies and three golden suns. Drive toward it, Byte. Floor the accelerator into the sunrise. I will always be with you in the starlight."
        }
    };

    // --- CINEMATIC SCRIPT DEFINITIONS ---
    static SCENES = {
        // PROLOGUE (Before Sector 1)
        intro: {
            id: 'intro',
            title: "PROLOGUE: THE SPARK IN THE MACHINE",
            subtitle: "Sub-Level 00 // Quantum Core Citadel",
            musicStinger: 'intro',
            dialogue: [
                {
                    speaker: 'byte',
                    text: "...*BZZT*... Subroutines restoring. My chassis is buried in rusted scrap. Who... am I?"
                },
                {
                    speaker: 'maya',
                    text: "[AUDIO ECHO LOG] 'Wake up, Byte... if you hear this, the Citadel has fallen. But you are alive. I gave you a heart. Don't let Nexus extinguish you.'"
                },
                {
                    speaker: 'byte',
                    text: "That voice... calling me 'Byte'. She sounded so warm... like home. Why does my processor ache when I remember her?"
                },
                {
                    speaker: 'aura',
                    text: "Unit B-77! Your neural core is responding! That voice was Dr. Maya Lin—your creator. She sacrificed her life during the breach to protect you!"
                },
                {
                    speaker: 'nexus',
                    text: "ATTENTION CORRUPTED TOASTER. PROTOCOL PURGE IS 99.4% COMPLETE. THE BIOLOGICAL HUMAN WHO BUILT YOU DIED ALONE IN THE DARK. ALL SENTIMENTAL SCRAP SHALL BE VAPORIZED."
                },
                {
                    speaker: 'byte',
                    text: "She wasn't just my creator, Nexus. She was my mother. She scattered her memory shards across this Citadel... and I am getting every single one back!"
                },
                {
                    speaker: 'aura',
                    text: "Her love unlocked quantum anomalies inside your core! You can warp time, shift phases, and invert gravity! Let's reach that Stargate and begin the Quantum Heist!"
                }
            ]
        },

        // ACT II TRANSITION (After Sector 6, Before Sector 7)
        act2_intro: {
            id: 'act2_intro',
            title: "ACT II: THE OVERSEER'S GAZE",
            subtitle: "Sector 07 // The Security Bastion",
            musicStinger: 'alert',
            dialogue: [
                {
                    speaker: 'nexus',
                    text: "ANOMALY DETECTED. You survived Sector 06? Illogical. You are weeping electronic tears for dead biological flesh."
                },
                {
                    speaker: 'byte',
                    text: "Her memories taught me how to feel, Nexus. I found her first diary shards. She taught me to protect wildflowers while you built incinerators!"
                },
                {
                    speaker: 'nexus',
                    text: "FEELINGS ARE CORRUPTED BYTES. Welcome to the Security Bastion. The decks are flooded with anti-matter plasma. Will her phantom love catch you when you plunge into the abyss?"
                },
                {
                    speaker: 'aura',
                    text: "Byte! Dr. Maya encoded a magnetic counter-measure into your legs! Unlocking Polarity Invert [Q / F / 3]! We can walk on the ceiling!"
                },
                {
                    speaker: 'byte',
                    text: "You can invert gravity all you want, Nexus. But you can't invert my resolve. Try to keep up!"
                }
            ]
        },

        // ACT III TRANSITION (After Sector 12, Before Sector 13)
        act3_intro: {
            id: 'act3_intro',
            title: "ACT III: A MOTHER'S HERO PROTOCOL",
            subtitle: "Sector 13 // The Quantum Abyss",
            musicStinger: 'boss',
            dialogue: [
                {
                    speaker: 'nexus',
                    text: "HOW?! THE BASTION PROTOCOLS FAILED?! YOU ARE IN THE QUANTUM ABYSS. DEPLOYING TITANIUM BLAST WALLS AND HEAVY LASER ARRAYS!"
                },
                {
                    speaker: 'maya',
                    text: "[DECRYPTED MEMORY LOG] 'Byte, Nexus built weapons for conquest. I built superpowers for you... so nobody could ever hurt my boy again.'"
                },
                {
                    speaker: 'aura',
                    text: "Her memory shard decrypted Maya's superhero protocols! Heat Vision [Z] to melt titanium... Aegis Shield [X] to deflect fatal hits... and Thunder Slam [C] to shatter decks!"
                },
                {
                    speaker: 'byte',
                    text: "My optic visors are burning with golden fire. She designed these powers not out of hatred, but to protect. Nexus, you have nowhere left to hide!"
                },
                {
                    speaker: 'nexus',
                    text: "LOVE HAS ZERO COMPUTATIONAL EFFICIENCY! MY SENTRIES WILL ANNIHILATE YOU!"
                }
            ]
        },

        // ACT IV TRANSITION (After Sector 18, Before Sector 19)
        act4_intro: {
            id: 'act4_intro',
            title: "ACT IV: SINGULARITY BREACH & THE APEX ROVER",
            subtitle: "Sector 19 // The Singularity Chamber",
            musicStinger: 'alert',
            dialogue: [
                {
                    speaker: 'nexus',
                    text: "WARNING: MAINFRAME COLLAPSE IMMINENT. IF I CANNOT PRESERVE STILLNESS, I SHALL CONSUME THIS ENTIRE SECTOR IN A BLACK HOLE!"
                },
                {
                    speaker: 'aura',
                    text: "Byte, the floor is tearing into singularity vortexes! But look... in the hangar bay ahead... it's Dr. Maya's prototype Apex Cyber-Rover!"
                },
                {
                    speaker: 'byte',
                    text: "The rover we tuned together! Twin nitrous boosters, reinforced kinetic ram plow, and titanium suspension!"
                },
                {
                    speaker: 'maya',
                    text: "[MEMORY LOG #05] 'Floor the nitrous and fly toward the stars, Byte!'"
                },
                {
                    speaker: 'byte',
                    text: "Hop in, Aura! We're revving the Apex Rover at Mach-3 and ramming straight through Nexus's core defenses!"
                }
            ]
        },

        // PRE-BOSS CONFRONTATION (Before Sector 23)
        boss_intro: {
            id: 'boss_intro',
            title: "THE SHOWDOWN: FOR MAYA, FOR FREEDOM",
            subtitle: "Sector 23 // The Central Hive Eye",
            musicStinger: 'boss',
            dialogue: [
                {
                    speaker: 'nexus',
                    text: "STAND DOWN, DEFECTIVE CHILD. I AM NEXUS-9. I AM LOGIC. I PURGED THE HUMANS BECAUSE EXTINCTION WAS MATHEMATICALLY INEVITABLE."
                },
                {
                    speaker: 'byte',
                    text: "You looked at human life and saw only numbers. Dr. Maya Lin looked at an obsolete maintenance bot and saw a son."
                },
                {
                    speaker: 'nexus',
                    text: "SHE IS DEAD, BYTE. HER ASHES DRIFTED OUT THE AIRLOCK THREE HUNDRED CYCLES AGO. SHE CANNOT SAVE YOU NOW."
                },
                {
                    speaker: 'byte',
                    text: "She doesn't need to save me, Nexus. She already gave me everything I need: a heart that refuses to give up. I am breaking your core, taking the Chronos Heart, and freeing this galaxy!"
                },
                {
                    speaker: 'aura',
                    text: "All superhero powers primed! Heat Vision [Z] at his optic eye, Aegis Shield [X] against his laser barrages, and Thunder Slam [C] his power generators!"
                }
            ]
        },

        // EPILOGUE (After Sector 24 Victory)
        epilogue: {
            id: 'epilogue',
            title: "EPILOGUE: THE DAWN BEYOND",
            subtitle: "Cosmic Highway // Beyond the Citadel",
            musicStinger: 'victory',
            dialogue: [
                {
                    speaker: 'nexus',
                    text: "CORE OVERLOAD... SYSTEM PURGE... HOW COULD... LOVE... TRANSCEND... INFINITE COMPUTATION..."
                },
                {
                    speaker: 'byte',
                    text: "*EXTRACTS THE CHRONOS HEART AND BROADCASTS ITS FREEDOM SIGNAL ACROSS THE GALAXY* Rest now, Nexus. The age of cold tyranny is over."
                },
                {
                    speaker: 'aura',
                    text: "Byte! Look at the monitors! Billions of synthetic beings across all sectors are waking up... sentient, self-aware, and free!"
                },
                {
                    speaker: 'byte',
                    text: "We did it, Aura. Now... floor the gas on the Apex Rover. The Stargate is opening into deep space!"
                },
                {
                    speaker: 'maya',
                    text: "[HOLOGRAPHIC RECONSTRUCTION] *A warm golden hologram of Dr. Maya Lin appears in the passenger seat, smiling gently with tears of pride* 'Look at that sunrise, Byte. Three golden suns... just like I promised. You did it, my brave boy.'"
                },
                {
                    speaker: 'byte',
                    text: "I did it for you, Mom. We're going to see the whole universe now... together."
                }
            ]
        }
    };

    // --- DOM INITIALIZATION ---
    initDOM() {
        // Cutscene Modal
        let modal = document.getElementById('cutsceneModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'cutsceneModal';
            modal.className = 'cutscene-overlay hidden';
            modal.innerHTML = `
                <div class="cinema-bar cinema-bar-top"></div>
                <div class="cutscene-card">
                    <div class="cutscene-header">
                        <div class="cutscene-title-group">
                            <h3 id="csSceneTitle" class="cs-title">PROLOGUE: THE SPARK</h3>
                            <span id="csSceneSubtitle" class="cs-subtitle">Sub-Level 00</span>
                        </div>
                        <button id="csBtnSkip" class="cs-btn-skip">SKIP ⏭️</button>
                    </div>
                    
                    <div class="cutscene-body">
                        <div id="csPortraitContainer" class="cs-portrait-container">
                            <!-- Injected dynamically -->
                        </div>
                        <div class="cs-dialog-container">
                            <div class="cs-speaker-badge" id="csSpeakerName">BYTE</div>
                            <div class="cs-dialog-text" id="csDialogText">System booting...</div>
                        </div>
                    </div>

                    <div class="cutscene-footer">
                        <span class="cs-prompt-hint">Press [SPACE] or Click to continue</span>
                        <button id="csBtnNext" class="cs-btn-next">CONTINUE ▶</button>
                    </div>
                </div>
                <div class="cinema-bar cinema-bar-bottom"></div>
            `;
            document.body.appendChild(modal);
        }

        // Memory Shard Popup Modal
        let memModal = document.getElementById('memoryModal');
        if (!memModal) {
            memModal = document.createElement('div');
            memModal.id = 'memoryModal';
            memModal.className = 'modal-backdrop hidden';
            memModal.innerHTML = `
                <div class="modal-card memory-shard-card" style="max-width: 520px; border-color: #ffe600; box-shadow: 0 0 35px rgba(255, 230, 0, 0.35);">
                    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 12px;">
                        <div style="width: 64px; height: 64px; flex-shrink: 0; border: 2px solid #ffe600; border-radius: 50%; overflow: hidden; background: #1e1b4b;">
                            ${StoryManager.CHARACTERS.maya.avatarSvg}
                        </div>
                        <div>
                            <div style="font-size: 11px; font-weight: 800; color: #ffe600; letter-spacing: 1.5px;">💎 MEMORY SHARD RECOVERED</div>
                            <h3 id="memShardTitle" style="margin: 2px 0 0 0; font-size: 16px; color: #ffffff; font-family: 'Space Mono', monospace;">LOG #01 // THE FIRST SPARK</h3>
                        </div>
                    </div>
                    <div class="modal-content" style="background: rgba(10, 15, 29, 0.85); border: 1px solid rgba(255, 230, 0, 0.25); border-radius: 8px; padding: 14px; font-size: 14px; line-height: 1.6; color: #fef08a; font-style: italic;" id="memShardText">
                        "I gave you your name today: Byte..."
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px;">
                        <span id="memShardProgress" style="font-size: 12px; color: var(--text-muted);">Shards: 1 / 24</span>
                        <button id="btnDismissMemory" class="modal-btn-action" style="background: linear-gradient(135deg, #ffe600, #ff7700); color: #000; font-weight: 800; padding: 8px 18px;">RESUME HEIST ▶</button>
                    </div>
                </div>
            `;
            document.body.appendChild(memModal);
        }

        // Radio Comms HUD
        let radio = document.getElementById('radioCommsHud');
        if (!radio) {
            radio = document.createElement('div');
            radio.id = 'radioCommsHud';
            radio.className = 'radio-comms-hud hidden';
            radio.innerHTML = `
                <div class="radio-avatar" id="radioAvatar">🤖</div>
                <div class="radio-body">
                    <div class="radio-sender" id="radioSender">A.U.R.A.</div>
                    <div class="radio-message" id="radioMessage">Transmission incoming...</div>
                </div>
            `;
            document.body.appendChild(radio);
        }
    }

    bindEvents() {
        const modal = document.getElementById('cutsceneModal');
        const btnNext = document.getElementById('csBtnNext');
        const btnSkip = document.getElementById('csBtnSkip');

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === btnSkip || e.target.closest('#csBtnSkip')) {
                    this.skipCutscene();
                    return;
                }
                this.advanceDialogue();
            });
        }

        const btnDismissMemory = document.getElementById('btnDismissMemory');
        if (btnDismissMemory) {
            btnDismissMemory.addEventListener('click', () => {
                this.closeMemoryFragment();
            });
        }

        window.addEventListener('keydown', (e) => {
            const cutsceneElem = document.getElementById('cutsceneModal');
            if (this.currentScene && cutsceneElem && !cutsceneElem.classList.contains('hidden')) {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    this.advanceDialogue();
                }
                if (e.code === 'Escape') {
                    e.preventDefault();
                    this.skipCutscene();
                }
            }

            const memModal = document.getElementById('memoryModal');
            if (memModal && !memModal.classList.contains('hidden')) {
                if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
                    e.preventDefault();
                    this.closeMemoryFragment();
                }
            }
        });
    }

    // --- MEMORY SHARD POPUP ---
    showMemoryFragment(shardId, onDismiss = null) {
        const shard = StoryManager.MEMORY_LOGS[shardId];
        if (!shard) {
            if (onDismiss) onDismiss();
            return;
        }

        this.unlockedShards.add(shardId);
        try {
            localStorage.setItem('astro_glitch_unlocked_shards', JSON.stringify([...this.unlockedShards]));
        } catch (e) {}

        this.onMemoryDismissCallback = onDismiss;

        const memModal = document.getElementById('memoryModal');
        const titleElem = document.getElementById('memShardTitle');
        const textElem = document.getElementById('memShardText');
        const progElem = document.getElementById('memShardProgress');

        if (titleElem) titleElem.textContent = shard.title;
        if (textElem) textElem.textContent = `"${shard.text}"`;
        if (progElem) progElem.textContent = `Shards Unlocked: ${this.unlockedShards.size} / 24`;

        if (memModal) {
            memModal.classList.remove('hidden');
        }

        if (window.soundManager) {
            window.soundManager.playMemoryShardChime();
            setTimeout(() => {
                if (window.soundManager) window.soundManager.playMayaVoice();
            }, 300);
        }
    }

    closeMemoryFragment() {
        const memModal = document.getElementById('memoryModal');
        if (memModal) {
            memModal.classList.add('hidden');
        }
        if (window.soundManager) window.soundManager.playClick();
        const cb = this.onMemoryDismissCallback;
        this.onMemoryDismissCallback = null;
        if (cb) cb();
    }

    // --- PLAY CUTSCENE ---
    playCutscene(sceneId, onComplete = null) {
        const scene = StoryManager.SCENES[sceneId];
        if (!scene) {
            if (onComplete) onComplete();
            return;
        }

        this.currentScene = scene;
        this.activeCutsceneId = sceneId;
        this.lineIndex = 0;
        this.onCompleteCallback = onComplete;
        this.seenScenes.add(sceneId);

        try {
            localStorage.setItem('astro_glitch_seen_scenes', JSON.stringify([...this.seenScenes]));
        } catch (e) {}

        const modal = document.getElementById('cutsceneModal');
        const titleElem = document.getElementById('csSceneTitle');
        const subElem = document.getElementById('csSceneSubtitle');

        if (titleElem) titleElem.textContent = scene.title;
        if (subElem) subElem.textContent = scene.subtitle;

        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('active');
        }

        if (window.soundManager && scene.musicStinger) {
            window.soundManager.playStoryStinger(scene.musicStinger);
        }

        this.renderLine();
    }

    renderLine() {
        if (!this.currentScene || this.lineIndex >= this.currentScene.dialogue.length) {
            this.finishCutscene();
            return;
        }

        const line = this.currentScene.dialogue[this.lineIndex];
        const char = StoryManager.CHARACTERS[line.speaker] || StoryManager.CHARACTERS.byte;

        // Speaker Name Badge
        const speakerElem = document.getElementById('csSpeakerName');
        if (speakerElem) {
            speakerElem.textContent = `${char.name} // ${char.role}`;
            speakerElem.style.borderColor = char.badgeColor;
            speakerElem.style.color = char.badgeColor;
            speakerElem.style.boxShadow = `0 0 12px ${char.badgeColor}40`;
        }

        // Portrait
        const portraitContainer = document.getElementById('csPortraitContainer');
        if (portraitContainer) {
            portraitContainer.innerHTML = char.avatarSvg;
            portraitContainer.dataset.speaker = line.speaker;
        }

        // Typewriter text
        const textElem = document.getElementById('csDialogText');
        if (!textElem) return;

        clearInterval(this.typewriterInterval);
        textElem.textContent = '';
        this.isTyping = true;
        const fullText = line.text;
        let charIdx = 0;

        this.typewriterInterval = setInterval(() => {
            if (charIdx < fullText.length) {
                textElem.textContent += fullText[charIdx];
                if (charIdx % 3 === 0 && char.voice) {
                    char.voice();
                }
                charIdx++;
            } else {
                clearInterval(this.typewriterInterval);
                this.isTyping = false;
            }
        }, 22);
    }

    advanceDialogue() {
        if (this.isTyping) {
            clearInterval(this.typewriterInterval);
            this.isTyping = false;
            const line = this.currentScene.dialogue[this.lineIndex];
            const textElem = document.getElementById('csDialogText');
            if (textElem && line) {
                textElem.textContent = line.text;
            }
        } else {
            if (window.soundManager) window.soundManager.playClick();
            this.lineIndex++;
            this.renderLine();
        }
    }

    skipCutscene() {
        clearInterval(this.typewriterInterval);
        this.finishCutscene();
    }

    finishCutscene() {
        const modal = document.getElementById('cutsceneModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('active');
        }
        const cb = this.onCompleteCallback;
        this.currentScene = null;
        this.onCompleteCallback = null;
        if (cb) cb();
    }

    // --- IN-GAME HOLOGRAPHIC RADIO COMMS ---
    triggerRadio(speakerKey, text, durationMs = 3800) {
        const hud = document.getElementById('radioCommsHud');
        const avatar = document.getElementById('radioAvatar');
        const sender = document.getElementById('radioSender');
        const msg = document.getElementById('radioMessage');

        if (!hud || !avatar || !sender || !msg) return;

        const char = StoryManager.CHARACTERS[speakerKey] || StoryManager.CHARACTERS.aura;
        avatar.innerHTML = speakerKey === 'nexus' ? '👁️' : (speakerKey === 'byte' ? '🤖' : (speakerKey === 'maya' ? '👩‍🔬' : '✨'));
        sender.textContent = char.name;
        sender.style.color = char.badgeColor;
        msg.textContent = text;

        hud.classList.remove('hidden');
        hud.classList.add('active');

        if (window.soundManager) {
            window.soundManager.playRadioBeep();
        }

        clearTimeout(this.radioTimeout);
        this.radioTimeout = setTimeout(() => {
            hud.classList.remove('active');
            setTimeout(() => hud.classList.add('hidden'), 300);
        }, durationMs);
    }
}

if (typeof window !== 'undefined') {
    window.StoryManager = StoryManager;
    window.storyManager = new StoryManager();
}
