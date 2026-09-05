// ============================================================================
// ASTRO GLITCH: QUANTUM HEIST - CORE ENGINE
// ============================================================================

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    createSparks(x, y, color = '#00f3ff', count = 12, speedMult = 1) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 4 + 1.5) * speedMult;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                color,
                alpha: 1,
                decay: Math.random() * 0.03 + 0.02,
                shape: Math.random() > 0.5 ? 'square' : 'circle'
            });
        }
    }

    createDeathBurst(x, y, color = '#00f3ff') {
        // Player shatter effect
        for (let i = 0; i < 24; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 7 + 2;
            this.particles.push({
                x: x + (Math.random() * 20 - 10),
                y: y + (Math.random() * 20 - 10),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                gravity: 0.25,
                size: Math.random() * 6 + 3,
                color: i % 2 === 0 ? color : '#ff0055',
                alpha: 1,
                decay: 0.018,
                rotation: Math.random() * Math.PI,
                vRot: (Math.random() - 0.5) * 0.2,
                shape: 'square'
            });
        }
    }

    createConfetti(x, y) {
        const colors = ['#00f3ff', '#ff007f', '#ffe600', '#00ff66', '#a855f7'];
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 9 + 3;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 4,
                gravity: 0.18,
                size: Math.random() * 7 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: 0.012,
                rotation: Math.random() * Math.PI,
                vRot: (Math.random() - 0.5) * 0.3,
                shape: 'square'
            });
        }
    }

    createGhostTrail(x, y, width, height, faceDir, color = 'rgba(0, 243, 255, 0.4)') {
        this.particles.push({
            isGhost: true,
            x, y, width, height, faceDir,
            alpha: 0.5,
            decay: 0.045,
            color
        });
    }

    update(dt = 1) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.alpha -= p.decay * dt;
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            if (!p.isGhost) {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                if (p.gravity) p.vy += p.gravity * dt;
                if (p.rotation !== undefined) p.rotation += p.vRot * dt;
            }
        }
    }

    draw(ctx) {
        for (const p of this.particles) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);

            if (p.isGhost) {
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.width, p.height);
                // Draw eyes on ghost
                ctx.fillStyle = '#ffffff';
                const eyeOffX = p.faceDir > 0 ? 14 : 4;
                ctx.fillRect(p.x + eyeOffX, p.y + 6, 4, 6);
                ctx.fillRect(p.x + eyeOffX + 6, p.y + 6, 4, 6);
            } else {
                ctx.translate(p.x, p.y);
                if (p.rotation) ctx.rotate(p.rotation);
                ctx.fillStyle = p.color;
                if (p.shape === 'square') {
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();
        }
    }

    clear() {
        this.particles = [];
    }
}

class Camera {
    constructor() {
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    shake(intensity = 10, duration = 15) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    update() {
        if (this.shakeDuration > 0) {
            this.offsetX = (Math.random() * 2 - 1) * this.shakeIntensity;
            this.offsetY = (Math.random() * 2 - 1) * this.shakeIntensity;
            this.shakeDuration--;
            this.shakeIntensity *= 0.9;
        } else {
            this.offsetX = 0;
            this.offsetY = 0;
        }
    }
}

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Logical game dimensions (16:9)
        this.width = 960;
        this.height = 540;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.particles = new ParticleSystem();
        this.camera = new Camera();

        // Game State
        this.currentLevelIndex = 0;
        this.level = null;
        this.deaths = 0;
        this.totalDeaths = 0;
        this.isDead = false;
        this.respawnTimer = 0;
        this.levelWon = false;
        this.winTimer = 0;

        // Player properties
        this.player = {
            x: 80,
            y: 380,
            width: 28,
            height: 28,
            vx: 0,
            vy: 0,
            speed: 5.2,
            jumpForce: 11.5,
            gravity: 0.58,
            grounded: false,
            gravityDir: 1, // 1: normal, -1: upside down
            faceDir: 1,
            isPhasing: false,
            phaseTimer: 0,
            phaseCooldown: 0,
            phaseDuration: 28, // ~0.45s dash
            controlsInverted: false,
            scaleX: 1,
            scaleY: 1,
            blinkTimer: 100,
            isBlinking: false
        };

        // Superpowers State
        this.powers = {
            dashCooldown: 0,
            dashMaxCooldown: 120, // 2 seconds

            slowmoActive: false,
            slowmoEnergy: 100,
            slowmoMaxEnergy: 100,

            gravityCooldown: 0,
            gravityMaxCooldown: 40,

            rewindCooldown: 0,
            rewindMaxCooldown: 180,
            isRewinding: false,
            rewindIndex: 0,

            wormholeCooldown: 0,
            wormholeMaxCooldown: 150, // 2.5 seconds

            // Superhero Abilities
            heatVisionCooldown: 0,
            heatVisionMaxCooldown: 140, // 2.3 seconds
            heatVisionActive: false,
            heatVisionTimer: 0,

            shieldCooldown: 0,
            shieldMaxCooldown: 280, // 4.6 seconds
            shieldActive: false,
            shieldTimer: 0,

            slamCooldown: 0,
            slamMaxCooldown: 120, // 2.0 seconds
            isSlamming: false
        };

        // Starfield for Galactic theme
        this.stars = [];
        for (let i = 0; i < 90; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2.2 + 0.8,
                speed: Math.random() * 0.4 + 0.1,
                alpha: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.04 + 0.01,
                color: ['#ffffff', '#00f3ff', '#d8b4fe', '#ffe600'][Math.floor(Math.random() * 4)]
            });
        }
        this.shootingStar = null;

        // Rewind History Buffer (~180 frames = 3 seconds)
        this.historyBuffer = [];
        this.maxHistory = 180;

        // Input state
        this.keys = {};
        this.touchKeys = {};

        // Banner toast
        this.bannerText = "";
        this.bannerTimer = 0;

        this.lastTime = 0;
        this.bindEvents();
        this.loadLevel(this.currentLevelIndex);
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            window.soundManager.ensureContext();
            this.keys[e.code] = true;

            // Shortcut keys for instant actions
            if (e.code === 'KeyR' && !this.isDead && !this.levelWon) {
                this.triggerRewind();
            }
            if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyJ' || e.code === 'Digit1') && !this.isDead && !this.levelWon) {
                this.triggerDash();
            }
            if ((e.code === 'KeyQ' || e.code === 'KeyF' || e.code === 'Digit3') && !this.isDead && !this.levelWon) {
                this.triggerGravityFlip();
            }
            if ((e.code === 'KeyE' || e.code === 'KeyK' || e.code === 'Digit2') && !this.isDead && !this.levelWon) {
                this.toggleSlowMo();
            }
            if ((e.code === 'KeyT' || e.code === 'Digit5') && !this.isDead && !this.levelWon) {
                this.triggerWormhole();
            }

            // Superhero Powers Shortcuts
            if ((e.code === 'KeyZ' || e.code === 'Digit6') && !this.isDead && !this.levelWon) {
                this.fireHeatVision();
            }
            if ((e.code === 'KeyX' || e.code === 'Digit7') && !this.isDead && !this.levelWon) {
                this.activateShield();
            }
            if ((e.code === 'KeyC' || e.code === 'KeyV' || e.code === 'Digit8') && !this.isDead && !this.levelWon) {
                this.triggerThunderSlam();
            }

            if (e.code === 'KeyM') {
                this.toggleSound();
            }

            // Prevent scroll on arrow keys and space
            if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Touch / UI buttons
        this.setupTouchControls();
    }

    setupTouchControls() {
        const bindBtn = (id, actionDown, actionUp) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const startHandler = (e) => {
                e.preventDefault();
                window.soundManager.ensureContext();
                actionDown();
            };
            const endHandler = (e) => {
                e.preventDefault();
                if (actionUp) actionUp();
            };
            btn.addEventListener('pointerdown', startHandler);
            btn.addEventListener('pointerup', endHandler);
            btn.addEventListener('pointercancel', endHandler);
            btn.addEventListener('pointerleave', endHandler);
        };

        bindBtn('btnLeft', () => { this.touchKeys.left = true; }, () => { this.touchKeys.left = false; });
        bindBtn('btnRight', () => { this.touchKeys.right = true; }, () => { this.touchKeys.right = false; });
        bindBtn('btnJump', () => { this.touchKeys.jump = true; }, () => { this.touchKeys.jump = false; });

        bindBtn('btnDash', () => { this.triggerDash(); });
        bindBtn('btnSlowmo', () => { this.toggleSlowMo(); });
        bindBtn('btnGravity', () => { this.triggerGravityFlip(); });
        bindBtn('btnRewind', () => { this.triggerRewind(); });
        bindBtn('btnWormhole', () => { this.triggerWormhole(); });

        // Superhero mobile buttons
        bindBtn('btnLaser', () => { this.fireHeatVision(); });
        bindBtn('btnShield', () => { this.activateShield(); });
        bindBtn('btnSlam', () => { this.triggerThunderSlam(); });

        // Mobile Power Slots (4 contextual power buttons)
        this.setupMobilePowerSlots();
    }

    setupMobilePowerSlots() {
        const POWER_CONFIG = {
            dash:     { icon: '\u26a1', label: 'PHASE', action: () => this.triggerDash(),        color: '#00f3ff' },
            slowmo:   { icon: '\u23f3', label: 'SLOW',  action: () => this.toggleSlowMo(),       color: '#ff007f' },
            gravity:  { icon: '\ud83d\ude80', label: 'FLIP',  action: () => this.triggerGravityFlip(), color: '#a855f7' },
            rewind:   { icon: '\u23ea', label: 'REWIND',action: () => this.triggerRewind(),       color: '#ffe600' },
            wormhole: { icon: '\ud83c\udf0c', label: 'WARP',  action: () => this.triggerWormhole(),    color: '#8b5cf6' },
            laser:    { icon: '\ud83d\udd25', label: 'LASER', action: () => this.fireHeatVision(),    color: '#ff0055' },
            shield:   { icon: '\ud83d\udee1\ufe0f', label: 'SHIELD',action: () => this.activateShield(),   color: '#22d3ee' },
            slam:     { icon: '\ud83d\udca5', label: 'SLAM',  action: () => this.triggerThunderSlam(), color: '#fbbf24' }
        };

        this.powerSlotConfig = POWER_CONFIG;
        this.powerSlotButtons = [];

        for (let i = 1; i <= 4; i++) {
            const btn = document.getElementById('btnPower' + i);
            if (btn) {
                this.powerSlotButtons.push(btn);
                btn.addEventListener('pointerdown', (e) => {
                    e.preventDefault();
                    window.soundManager.ensureContext();
                    const pName = btn.dataset.power;
                    if (pName && POWER_CONFIG[pName]) {
                        POWER_CONFIG[pName].action();
                    }
                });
            }
        }
    }

    updateMobilePowerSlots(powerNames) {
        if (!this.powerSlotButtons || this.powerSlotButtons.length < 4) return;
        const cfg = this.powerSlotConfig;
        for (let i = 0; i < 4; i++) {
            const btn = this.powerSlotButtons[i];
            const name = powerNames[i] || 'dash';
            const p = cfg[name] || cfg.dash;
            btn.dataset.power = name;
            btn.title = p.label;
            btn.innerHTML = p.icon + '<span class="power-label">' + p.label + '</span>';
            btn.style.borderColor = p.color;
        }
    }

    loadLevel(index) {
        if (index < 0 || index >= window.LEVELS.length) {
            index = 0;
        }
        this.currentLevelIndex = index;
        const levelData = window.LEVELS[index];

        // Deep copy level objects so state resets cleanly
        this.level = JSON.parse(JSON.stringify(levelData));

        // Re-attach executable troll events from original level
        this.level.trollEvents = levelData.trollEvents.map(te => ({ ...te, triggered: false }));
        this.level.enemies = (levelData.enemies || []).map(e => ({ ...e }));

        this.resetPlayerPosition();

        // Galactic Low-G floaty physics adaptation
        this.player.gravity = this.level.isGalactic ? 0.44 : 0.58;
        this.player.jumpForce = this.level.isGalactic ? 12.0 : 11.5;

        this.historyBuffer = [];
        this.particles.clear();
        this.isDead = false;
        this.levelWon = false;
        this.powers.slowmoActive = false;
        this.powers.isRewinding = false;

        this.updateHUD();
        this.showBanner(`${this.level.title}: ${this.level.subtitle}`, 2200);

        // Run onStart troll events if any
        for (const evt of this.level.trollEvents) {
            if (evt.type === 'onStart') {
                evt.run(this);
            }
        }

        // Update mobile power slots based on level's featured powers
        this.setLevelPowerSlots();
    }

    setLevelPowerSlots() {
        // Pick 4 best powers for this level
        // Default order: dash, slowmo, gravity, rewind (first 4 sectors)
        // Later sectors unlock wormhole, laser, shield, slam
        const lvlIdx = this.currentLevelIndex;
        const featured = this.level.featuredPower || 'dash';

        // Power pool — later levels get more superhero powers
        const allPowers = ['dash', 'slowmo', 'gravity', 'rewind', 'wormhole', 'laser', 'shield', 'slam'];
        // Featured goes first, then fill from unlocked pool (up to level index)
        const unlocked = allPowers.slice(0, Math.min(allPowers.length, 4 + Math.floor(lvlIdx / 2)));
        const selected = [featured];
        for (const p of unlocked) {
            if (selected.length >= 4) break;
            if (!selected.includes(p)) selected.push(p);
        }
        while (selected.length < 4) selected.push('dash');
        this.updateMobilePowerSlots(selected);
    }

    resetPlayerPosition() {
        this.player.x = this.level.playerStart.x;
        this.player.y = this.level.playerStart.y;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.grounded = false;
        this.player.gravityDir = 1;
        this.player.faceDir = 1;
        this.player.isPhasing = false;
        this.player.phaseTimer = 0;
        this.player.controlsInverted = false;
        this.player.scaleX = 1;
        this.player.scaleY = 1;
    }

    // --- SUPERPOWER TRIGGERS ---

    triggerDash() {
        if (this.powers.dashCooldown > 0 || this.player.isPhasing || this.isDead || this.levelWon) return;

        this.player.isPhasing = true;
        this.player.phaseTimer = this.player.phaseDuration;
        this.powers.dashCooldown = this.powers.dashMaxCooldown;

        // Give instant high horizontal velocity
        const dir = this.player.faceDir !== 0 ? this.player.faceDir : 1;
        this.player.vx = dir * 14;
        this.player.vy = 0;

        window.soundManager.playDash();
        this.camera.shake(5, 10);
        this.particles.createSparks(this.player.x + 14, this.player.y + 14, '#00f3ff', 16, 1.8);
    }

    toggleSlowMo() {
        if (this.isDead || this.levelWon) return;
        if (this.powers.slowmoActive) {
            this.powers.slowmoActive = false;
            window.soundManager.playTimeSlow(false);
        } else if (this.powers.slowmoEnergy > 20) {
            this.powers.slowmoActive = true;
            window.soundManager.playTimeSlow(true);
            this.camera.shake(4, 8);
        }
    }

    triggerGravityFlip() {
        if (this.powers.gravityCooldown > 0 || this.isDead || this.levelWon) return;

        this.player.gravityDir *= -1;
        this.player.vy = this.player.gravityDir * 4;
        this.player.grounded = false;
        this.powers.gravityCooldown = this.powers.gravityMaxCooldown;

        window.soundManager.playGravityFlip();
        this.camera.shake(6, 12);
        this.particles.createSparks(this.player.x + 14, this.player.y + 14, '#ffe600', 16);
    }

    triggerRewind() {
        if (this.powers.rewindCooldown > 0 || this.historyBuffer.length < 15 || this.powers.isRewinding) return;

        this.powers.isRewinding = true;
        this.powers.rewindIndex = this.historyBuffer.length - 1;
        this.powers.rewindCooldown = this.powers.rewindMaxCooldown;
        window.soundManager.playRewind();
        this.camera.shake(8, 16);
        this.showBanner("REWINDING TIME! ⏪", 1000);
    }

    triggerWormhole() {
        if (this.powers.wormholeCooldown > 0 || this.isDead || this.levelWon) return;

        const dir = this.player.faceDir !== 0 ? this.player.faceDir : 1;
        const startX = this.player.x;
        const startY = this.player.y;

        // Teleport forward 185px across void
        let targetX = this.player.x + dir * 185;
        targetX = Math.max(30, Math.min(this.width - 60, targetX));

        // Cosmic origin implosion
        this.particles.createSparks(startX + 14, startY + 14, '#a855f7', 16, 1.8);
        this.particles.createGhostTrail(startX, startY, this.player.width, this.player.height, this.player.faceDir, 'rgba(168, 85, 247, 0.6)');

        // Warp player
        this.player.x = targetX;
        this.player.vx = dir * 4;
        this.player.vy = 0;
        this.powers.wormholeCooldown = this.powers.wormholeMaxCooldown;

        window.soundManager.playWormhole();
        this.camera.shake(7, 14);
        this.particles.createSparks(this.player.x + 14, this.player.y + 14, '#00f3ff', 18, 2.0);
        this.showBanner("WORMHOLE WARP! 🌌", 900);
    }

    fireHeatVision() {
        if (this.powers.heatVisionCooldown > 0 || this.isDead || this.levelWon) return;

        this.powers.heatVisionActive = true;
        this.powers.heatVisionTimer = 18; // ~0.3s duration of beam
        this.powers.heatVisionCooldown = this.powers.heatVisionMaxCooldown;

        window.soundManager.playHeatVision();
        this.camera.shake(8, 14);

        const p = this.player;
        const dir = p.faceDir !== 0 ? p.faceDir : 1;
        const startX = p.x + (dir > 0 ? p.width : 0);
        const startY = p.y + 10;
        const beamLength = 900;
        const endX = startX + dir * beamLength;

        // Laser raycast check against destructible blocks, enemies, falling spikes, and fake doors
        // 1. Destructible platforms
        if (this.level && this.level.platforms) {
            for (const plat of this.level.platforms) {
                if (plat.type === 'destructible' && !plat.isBroken) {
                    const inY = startY >= plat.y && startY <= plat.y + plat.height;
                    const inX = dir > 0 ? (plat.x >= startX && plat.x <= endX) : (plat.x + plat.width <= startX && plat.x + plat.width >= endX);
                    if (inY && inX) {
                        plat.isBroken = true;
                        plat.opacity = 0;
                        this.particles.createSparks(plat.x + plat.width / 2, plat.y + plat.height / 2, '#ff3300', 22, 2.2);
                        this.showBanner("HEAT VISION MELTED TITANIUM BLOCK! 🔥", 1200);
                    }
                }
            }
        }

        // 2. Enemies
        if (this.level && this.level.enemies) {
            for (let i = this.level.enemies.length - 1; i >= 0; i--) {
                const en = this.level.enemies[i];
                const inY = Math.abs((en.y + en.height / 2) - startY) < 28;
                const inX = dir > 0 ? (en.x >= startX && en.x <= endX) : (en.x + en.width <= startX && en.x + en.width >= endX);
                if (inY && inX) {
                    this.particles.createDeathBurst(en.x + en.width / 2, en.y + en.height / 2, '#ff0055');
                    this.level.enemies.splice(i, 1);
                    this.showBanner("SENTRY VAPORIZED BY HEAT VISION! 🔥🤖", 1200);
                }
            }
        }

        // 3. Falling spikes in path
        if (this.level && this.level.spikes) {
            for (let i = this.level.spikes.length - 1; i >= 0; i--) {
                const sp = this.level.spikes[i];
                if (sp.isFalling && !sp.isHidden) {
                    const inY = Math.abs((sp.y + sp.height / 2) - startY) < 32;
                    const inX = dir > 0 ? (sp.x >= startX && sp.x <= endX) : (sp.x + sp.width <= startX && sp.x + sp.width >= endX);
                    if (inY && inX) {
                        this.particles.createSparks(sp.x + sp.width / 2, sp.y + sp.height / 2, '#ffe600', 16, 2.0);
                        this.level.spikes.splice(i, 1);
                    }
                }
            }
        }

        // 4. Fake troll door
        if (this.level && this.level.door && this.level.door.isFakeTroll) {
            const d = this.level.door;
            const inY = startY >= d.y && startY <= d.y + d.height;
            const inX = dir > 0 ? (d.x >= startX && d.x <= endX) : (d.x + d.width <= startX && d.x + d.width >= endX);
            if (inY && inX) {
                this.particles.createDeathBurst(d.x + d.width / 2, d.y + d.height / 2, '#ff0055');
                d.opacity = 0;
                this.showBanner("FAKE DOOR INCINERATED FROM AFAR! 🔥🚪", 1400);
            }
        }
    }

    activateShield() {
        if (this.powers.shieldCooldown > 0 || this.isDead || this.levelWon) return;

        this.powers.shieldActive = true;
        this.powers.shieldTimer = 210; // 3.5 seconds
        this.powers.shieldCooldown = this.powers.shieldMaxCooldown;

        window.soundManager.playShieldActivate();
        this.camera.shake(4, 10);
        this.showBanner("AEGIS FORCEFIELD ONLINE! 🛡️", 1000);
    }

    triggerThunderSlam() {
        if (this.powers.slamCooldown > 0 || this.isDead || this.levelWon) return;

        if (this.player.isGrounded) {
            // Hop up slightly so the slam can gain downward momentum
            this.player.vy = -6 * this.player.gravityDir;
            this.player.isGrounded = false;
        }

        this.powers.isSlamming = true;
        this.powers.slamCooldown = this.powers.slamMaxCooldown;
        this.player.vy = 22 * this.player.gravityDir; // Hypersonic slam downward

        window.soundManager.playThunderSlam();
        this.camera.shake(6, 12);
        this.showBanner("THUNDER SLAM! 💥", 800);
    }

    // --- GAME LOOP & UPDATES ---

    update(dt) {
        this.camera.update();
        this.particles.update(dt);

        if (this.bannerTimer > 0) {
            this.bannerTimer--;
        }

        // Win state handling
        if (this.levelWon) {
            this.winTimer--;
            if (this.winTimer <= 0) {
                if (this.currentLevelIndex + 1 < window.LEVELS.length) {
                    this.loadLevel(this.currentLevelIndex + 1);
                } else {
                    this.showVictoryModal();
                }
            }
            return;
        }

        // Dead state handling
        if (this.isDead) {
            this.respawnTimer--;
            if (this.respawnTimer <= 0) {
                this.loadLevel(this.currentLevelIndex);
            }
            return;
        }

        // Rewind mode execution
        if (this.powers.isRewinding) {
            this.processRewind();
            return;
        }

        // Determine effective time scale
        const timeScale = this.powers.slowmoActive ? 0.28 : 1.0;

        // Superpower cooldowns & energy
        if (this.powers.dashCooldown > 0) this.powers.dashCooldown--;
        if (this.powers.gravityCooldown > 0) this.powers.gravityCooldown--;
        if (this.powers.rewindCooldown > 0) this.powers.rewindCooldown--;
        if (this.powers.wormholeCooldown > 0) this.powers.wormholeCooldown--;

        // Superhero cooldowns
        if (this.powers.heatVisionCooldown > 0) this.powers.heatVisionCooldown--;
        if (this.powers.heatVisionTimer > 0) this.powers.heatVisionTimer--;

        if (this.powers.shieldCooldown > 0) this.powers.shieldCooldown--;
        if (this.powers.shieldTimer > 0) {
            this.powers.shieldTimer--;
            if (this.powers.shieldTimer <= 0) {
                this.powers.shieldActive = false;
            }
        }

        if (this.powers.slamCooldown > 0) this.powers.slamCooldown--;

        // Thunder slam ground detection & impact
        if (this.powers.isSlamming && this.player.isGrounded) {
            this.powers.isSlamming = false;
            window.soundManager.playSlamImpact();
            this.camera.shake(16, 24);
            this.particles.createSparks(this.player.x + 14, this.player.y + (this.player.gravityDir > 0 ? this.player.height : 0), '#ffaa00', 30, 3.0);

            // Shatter breakable floor right under player!
            if (this.level && this.level.platforms) {
                for (const plat of this.level.platforms) {
                    if (plat.type === 'destructible' && !plat.isBroken) {
                        const pBottom = this.player.gravityDir > 0 ? this.player.y + this.player.height : this.player.y;
                        const touching = Math.abs(pBottom - plat.y) < 26 &&
                                         this.player.x + this.player.width > plat.x &&
                                         this.player.x < plat.x + plat.width;
                        if (touching) {
                            plat.isBroken = true;
                            plat.opacity = 0;
                            this.particles.createSparks(plat.x + plat.width / 2, plat.y + plat.height / 2, '#ffaa00', 25, 2.5);
                            this.showBanner("VAULT DECK SHATTERED! 💥", 1200);
                        }
                    }
                }
            }

            // Stun / eliminate nearby enemies within 140px
            if (this.level && this.level.enemies) {
                for (let i = this.level.enemies.length - 1; i >= 0; i--) {
                    const en = this.level.enemies[i];
                    const dist = Math.hypot(en.x - this.player.x, en.y - this.player.y);
                    if (dist < 140) {
                        this.particles.createDeathBurst(en.x + en.width / 2, en.y + en.height / 2, '#ffe600');
                        this.level.enemies.splice(i, 1);
                    }
                }
            }
        }

        // Update Stars for Galactic Parallax
        if (this.level && this.level.isGalactic) {
            for (const s of this.stars) {
                s.x -= s.speed * timeScale;
                if (s.x < 0) s.x = this.width;
                s.alpha += s.twinkleSpeed;
                if (s.alpha > 1 || s.alpha < 0.2) s.twinkleSpeed *= -1;
            }

            // Occasional shooting star
            if (!this.shootingStar && Math.random() < 0.008) {
                this.shootingStar = {
                    x: Math.random() * this.width * 0.8 + 100,
                    y: Math.random() * (this.height * 0.4),
                    vx: -(Math.random() * 8 + 6),
                    vy: Math.random() * 4 + 2,
                    length: Math.random() * 50 + 30,
                    life: 25
                };
            }
            if (this.shootingStar) {
                this.shootingStar.x += this.shootingStar.vx * timeScale;
                this.shootingStar.y += this.shootingStar.vy * timeScale;
                this.shootingStar.life -= timeScale;
                if (this.shootingStar.life <= 0) this.shootingStar = null;
            }
        }

        if (this.powers.slowmoActive) {
            this.powers.slowmoEnergy -= 0.6;
            if (this.powers.slowmoEnergy <= 0) {
                this.powers.slowmoActive = false;
                window.soundManager.playTimeSlow(false);
            }
        } else {
            this.powers.slowmoEnergy = Math.min(this.powers.slowmoMaxEnergy, this.powers.slowmoEnergy + 0.35);
        }

        // Record history snapshot for Quantum Rewind
        this.recordHistory();

        // Update player movement & physics
        this.updatePlayer(timeScale);

        // Update dynamic level entities (moving platforms, collapsing blocks, fleeing doors)
        this.updateLevelEntities(timeScale);

        // Check troll triggers
        this.checkTrollTriggers();

        // Hazard & Door collisions
        this.checkCollisions();

        // Update HUD
        this.updateHUD();
    }

    recordHistory() {
        this.historyBuffer.push({
            x: this.player.x,
            y: this.player.y,
            vx: this.player.vx,
            vy: this.player.vy,
            gravityDir: this.player.gravityDir,
            faceDir: this.player.faceDir,
            isPhasing: this.player.isPhasing
        });
        if (this.historyBuffer.length > this.maxHistory) {
            this.historyBuffer.shift();
        }
    }

    processRewind() {
        if (this.powers.rewindIndex >= 0 && this.historyBuffer.length > 0) {
            // Rewind 3 steps per frame for snappy tape-rewind feel
            const step = Math.min(3, this.powers.rewindIndex + 1);
            this.powers.rewindIndex -= step;

            const state = this.historyBuffer[Math.max(0, this.powers.rewindIndex)];
            if (state) {
                this.player.x = state.x;
                this.player.y = state.y;
                this.player.vx = -state.vx * 0.5;
                this.player.vy = -state.vy * 0.5;
                this.player.gravityDir = state.gravityDir;
                this.player.faceDir = state.faceDir;
                this.player.isPhasing = false;

                // Leave rewind cyan echo
                this.particles.createGhostTrail(state.x, state.y, this.player.width, this.player.height, state.faceDir, 'rgba(0, 243, 255, 0.45)');
            }
        } else {
            this.powers.isRewinding = false;
            this.historyBuffer = [];
            this.player.vx = 0;
            this.player.vy = 0;
        }
    }

    updatePlayer(timeScale) {
        const p = this.player;

        // Squeeze & Stretch recovery
        p.scaleX += (1 - p.scaleX) * 0.2;
        p.scaleY += (1 - p.scaleY) * 0.2;

        // Eye blinking animation
        p.blinkTimer--;
        if (p.blinkTimer <= 0) {
            p.isBlinking = true;
            if (p.blinkTimer <= -8) {
                p.isBlinking = false;
                p.blinkTimer = Math.random() * 120 + 80;
            }
        }

        // Phase dash timer
        if (p.isPhasing) {
            p.phaseTimer--;
            this.particles.createGhostTrail(p.x, p.y, p.width, p.height, p.faceDir, 'rgba(0, 243, 255, 0.35)');
            if (p.phaseTimer <= 0) {
                p.isPhasing = false;
                p.vx *= 0.4;
            }
        }

        // Controls
        let moveX = 0;
        const leftPressed = this.keys['KeyA'] || this.keys['ArrowLeft'] || this.touchKeys.left;
        const rightPressed = this.keys['KeyD'] || this.keys['ArrowRight'] || this.touchKeys.right;
        const jumpPressed = this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['Space'] || this.touchKeys.jump;

        if (leftPressed) moveX -= 1;
        if (rightPressed) moveX += 1;

        if (p.controlsInverted && !p.isPhasing) {
            moveX *= -1;
        }

        if (!p.isPhasing) {
            if (moveX !== 0) {
                p.faceDir = moveX > 0 ? 1 : -1;
                p.vx += moveX * 0.95 * timeScale;
                const maxSpd = p.speed * (this.powers.slowmoActive ? 0.75 : 1.0);
                p.vx = Math.max(-maxSpd, Math.min(maxSpd, p.vx));
            } else {
                p.vx *= 0.78;
            }

            // Gravity
            p.vy += p.gravity * p.gravityDir * timeScale;
            p.vy = Math.max(-14, Math.min(14, p.vy));

            // Jump
            if (jumpPressed && p.grounded) {
                p.vy = -p.jumpForce * p.gravityDir;
                p.grounded = false;
                p.scaleX = 0.75;
                p.scaleY = 1.35;
                window.soundManager.playJump();
                this.particles.createSparks(p.x + 14, p.gravityDir === 1 ? p.y + 28 : p.y, '#ffffff', 8);
            }
        }

        // Apply movement with AABB Collision against solid platforms
        const nextX = p.x + p.vx * timeScale;
        const nextY = p.y + p.vy * timeScale;

        // Horizontal collision
        p.x = nextX;
        for (const plat of this.level.platforms) {
            if (plat.type === "fake_wall" && p.isPhasing) continue;
            if (plat.type === "inversion_zone") continue;
            if (plat.opacity === 0) continue;

            if (this.checkAABB(p, plat)) {
                if (p.vx > 0) {
                    p.x = plat.x - p.width;
                } else if (p.vx < 0) {
                    p.x = plat.x + plat.width;
                }
                p.vx = 0;
            }
        }

        // Vertical collision
        p.grounded = false;
        p.y = nextY;
        for (const plat of this.level.platforms) {
            if (plat.type === "fake_wall" && p.isPhasing) continue;
            if (plat.type === "inversion_zone") continue;
            if (plat.opacity === 0) continue;

            if (this.checkAABB(p, plat)) {
                if (p.gravityDir === 1) {
                    if (p.vy > 0) { // Landing on floor
                        p.y = plat.y - p.height;
                        p.vy = 0;
                        if (!p.grounded) {
                            p.scaleX = 1.3;
                            p.scaleY = 0.75;
                            window.soundManager.playLand();
                        }
                        p.grounded = true;

                        // Trigger collapsing blocks
                        if (plat.type === 'collapse' && !plat.isTriggered) {
                            plat.isTriggered = true;
                            plat.timer = plat.delay || 120;
                        }
                        if (plat.type === 'sinker') {
                            plat.y += plat.sinkSpeed || 6;
                        }
                    } else if (p.vy < 0) { // Hit ceiling
                        p.y = plat.y + plat.height;
                        p.vy = 0;
                    }
                } else { // Inverted gravity
                    if (p.vy < 0) { // Landing on ceiling
                        p.y = plat.y + plat.height;
                        p.vy = 0;
                        if (!p.grounded) {
                            p.scaleX = 1.3;
                            p.scaleY = 0.75;
                            window.soundManager.playLand();
                        }
                        p.grounded = true;

                        if (plat.type === 'collapse' && !plat.isTriggered) {
                            plat.isTriggered = true;
                            plat.timer = plat.delay || 120;
                        }
                    } else if (p.vy > 0) { // Hit floor
                        p.y = plat.y - p.height;
                        p.vy = 0;
                    }
                }
            }
        }

        // Boundaries & Abyss Fall
        if (p.x < 0) p.x = 0;
        if (p.x + p.width > this.width) p.x = this.width - p.width;

        if (p.y > this.height + 60 || p.y < -80) {
            this.killPlayer("Fell into the boundless void!");
        }
    }

    updateLevelEntities(timeScale) {
        // Collapsing platforms
        for (const plat of this.level.platforms) {
            if (plat.type === 'collapse' && plat.isTriggered && !plat.collapsed) {
                plat.timer -= timeScale * 16;
                // Tremble effect
                plat.offsetX = (Math.random() * 4 - 2);
                if (plat.timer <= 0) {
                    plat.collapsed = true;
                    plat.y += 400; // Drop into pit
                    this.particles.createSparks(plat.x + plat.width / 2, plat.y - 380, '#556688', 12);
                    window.soundManager.playLand();
                }
            }

            // Moving horizontal platforms
            if (plat.type === 'moving_h') {
                if (!plat.dir) plat.dir = 1;
                plat.x += plat.dir * plat.speed * timeScale;
                if (plat.x >= plat.maxX) {
                    plat.x = plat.maxX;
                    plat.dir = -1;
                } else if (plat.x <= plat.minX) {
                    plat.x = plat.minX;
                    plat.dir = 1;
                }
            }

            // Crushing ceiling
            if (plat.type === 'crusher' && plat.triggered) {
                if (plat.y < plat.targetY) {
                    plat.y += plat.speed * timeScale;
                }
            }
        }

        // Falling spikes
        for (const s of this.level.spikes) {
            if (s.isFalling && s.velocityY) {
                s.y += s.velocityY * timeScale;
            }
            if (s.attachedToCrusher) {
                const crusher = this.level.platforms.find(p => p.type === 'crusher');
                if (crusher) {
                    s.y = crusher.y + crusher.height;
                }
            }
        }

        // Moving / Fleeing Door
        const door = this.level.door;
        if (door && door.isMoving) {
            door.x += (door.targetX - door.x) * 0.09 * timeScale;
            door.y += (door.targetY - door.y) * 0.09 * timeScale;
            if (Math.abs(door.x - door.targetX) < 2 && Math.abs(door.y - door.targetY) < 2) {
                door.isMoving = false;
            }
        }

        // Black Hole Singularity Gravity Pull
        if (this.level.blackHoles) {
            const p = this.player;
            const px = p.x + p.width / 2;
            const py = p.y + p.height / 2;

            for (const bh of this.level.blackHoles) {
                const dx = bh.x - px;
                const dy = bh.y - py;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < bh.radius) {
                    const pullFactor = (1 - dist / bh.radius);
                    const force = pullFactor * bh.pullStrength * (this.powers.slowmoActive ? 0.35 : 1.0);

                    // Pull player inward unless phasing
                    if (!p.isPhasing) {
                        p.vx += (dx / dist) * force * 5.4;
                        p.vy += (dy / dist) * force * 5.4;
                    }

                    // Accretion swirl particles
                    if (Math.random() < 0.4) {
                        const angle = Math.random() * Math.PI * 2;
                        const r = Math.random() * (bh.radius * 0.6) + 15;
                        this.particles.particles.push({
                            x: bh.x + Math.cos(angle) * r,
                            y: bh.y + Math.sin(angle) * r,
                            vx: -Math.sin(angle) * 3 - (Math.cos(angle) * 1.5),
                            vy: Math.cos(angle) * 3 - (Math.sin(angle) * 1.5),
                            size: 2.5,
                            color: '#d8b4fe',
                            alpha: 0.8,
                            decay: 0.045
                        });
                    }

                    // Lethal singularity event horizon
                    if (dist < 22 && !p.isPhasing) {
                        this.killPlayer("Swallowed by a Black Hole!");
                        return;
                    }
                }
            }
        }

        // Solar Laser Beams
        if (this.level.lasers) {
            const p = this.player;
            for (const laser of this.level.lasers) {
                laser.timer = (laser.timer + timeScale) % laser.cycleTime;
                laser.active = laser.timer < laser.onDuration;

                if (laser.active) {
                    const laserRect = { x: laser.x, y: laser.y, width: laser.width, height: laser.height };
                    if (this.checkAABB(p, laserRect)) {
                        if (p.isPhasing) {
                            this.particles.createSparks(p.x + 14, p.y + 14, '#00f3ff', 3);
                        } else if (this.powers.shieldActive) {
                            this.powers.shieldActive = false;
                            this.powers.shieldTimer = 0;
                            this.player.vx = -this.player.faceDir * 6;
                            window.soundManager.playShieldDeflect();
                            this.camera.shake(12, 16);
                            this.particles.createSparks(p.x + 14, p.y + 14, '#00ffcc', 24, 2.2);
                            this.showBanner("HERO SHIELD ABSORBED LASER CANNON! 🛡️", 1200);
                        } else {
                            window.soundManager.playLaser();
                            this.killPlayer("Vaporized by Solar Laser!");
                            return;
                        }
                    }
                }
            }
        }

        // Update Enemies (Smolly Villain & Ghost)
        if (this.level.enemies) {
            const p = this.player;
            for (const enemy of this.level.enemies) {
                if (enemy.type === 'smolly') {
                    if (!enemy.dir) enemy.dir = 1;

                    // Smolly moves back and forth with cute bounce
                    const distToPlayer = Math.hypot((p.x + 14) - (enemy.x + enemy.width / 2), (p.y + 14) - (enemy.y + enemy.height / 2));
                    const currentSpd = (distToPlayer < 150 ? enemy.speed * 1.3 : enemy.speed) * timeScale;

                    enemy.x += enemy.dir * currentSpd;
                    if (enemy.x >= enemy.maxX) {
                        enemy.x = enemy.maxX;
                        enemy.dir = -1;
                    } else if (enemy.x <= enemy.minX) {
                        enemy.x = enemy.minX;
                        enemy.dir = 1;
                    }
                    enemy.hop = Math.abs(Math.sin(Date.now() * 0.012)) * 3.5;
                } else if (enemy.type === 'ghost') {
                    if (enemy.startY === undefined) enemy.startY = enemy.y;
                    enemy.floatAnim = (enemy.floatAnim || 0) + 0.035 * timeScale;
                    enemy.y = enemy.startY + Math.sin(enemy.floatAnim) * (enemy.floatRange || 35);

                    // Ghost drifts toward player slowly
                    const dx = (p.x + 14) - (enemy.x + enemy.width / 2);
                    if (Math.abs(dx) > 8) {
                        enemy.faceDir = dx > 0 ? 1 : -1;
                        enemy.x += enemy.faceDir * enemy.speed * 0.7 * timeScale;
                    }
                }
            }
        }
    }

    checkTrollTriggers() {
        for (const evt of this.level.trollEvents) {
            if (evt.triggered) continue;

            if (evt.type === 'proximity') {
                const dx = Math.abs((this.player.x + 14) - evt.targetX);
                if (dx <= evt.dist) {
                    evt.triggered = true;
                    evt.run(this);
                }
            } else if (evt.type === 'custom' || evt.type === 'inversion_check') {
                evt.run(this);
            }
        }
    }

    checkCollisions() {
        const p = this.player;

        // Hazard spikes check
        for (const spike of this.level.spikes) {
            if (spike.isHidden) continue;

            // Spikes have slightly forgiving hitbox
            const spikeHitbox = {
                x: spike.x + 3,
                y: spike.y + 3,
                width: spike.width - 6,
                height: spike.height - 6
            };

            if (this.checkAABB(p, spikeHitbox)) {
                // If phasing, player is ethereal and survives!
                if (p.isPhasing) {
                    this.particles.createSparks(p.x + 14, p.y + 14, '#00f3ff', 4);
                } else if (this.powers.shieldActive) {
                    this.powers.shieldActive = false;
                    this.powers.shieldTimer = 0;
                    this.player.vy = -7 * this.player.gravityDir;
                    window.soundManager.playShieldDeflect();
                    this.camera.shake(12, 16);
                    this.particles.createSparks(p.x + 14, p.y + 14, '#00ffcc', 24, 2.2);
                    this.showBanner("HERO SHIELD DEFLECTED FATAL HIT! 🛡️", 1200);
                    continue;
                } else {
                    this.killPlayer();
                    return;
                }
            }
        }

        // Enemy collisions (Smolly Villain & Ghost)
        if (this.level.enemies) {
            for (const enemy of this.level.enemies) {
                const enemyHitbox = {
                    x: enemy.x + 2,
                    y: enemy.y - (enemy.hop || 0) + 2,
                    width: enemy.width - 4,
                    height: enemy.height - 4
                };

                if (this.checkAABB(p, enemyHitbox)) {
                    if (p.isPhasing) {
                        this.particles.createSparks(p.x + 14, p.y + 14, '#00f3ff', 5);
                    } else if (this.powers.shieldActive) {
                        this.powers.shieldActive = false;
                        this.powers.shieldTimer = 0;
                        this.player.vx = -this.player.faceDir * 6;
                        window.soundManager.playShieldDeflect();
                        this.camera.shake(12, 16);
                        this.particles.createSparks(p.x + 14, p.y + 14, '#00ffcc', 24, 2.2);
                        this.showBanner("HERO SHIELD REPELLED ENEMY! 🛡️", 1200);
                        continue;
                    } else {
                        if (enemy.type === 'smolly') {
                            window.soundManager.playSqueak();
                            this.killPlayer("Zapped by Sentry-X stun pincer! ⚡🤖");
                        } else if (enemy.type === 'ghost') {
                            window.soundManager.playGhostBoo();
                            this.killPlayer("Annihilated by Quantum Phantasm! 🌌👾");
                        }
                        return;
                    }
                }
            }
        }

        // Door collision (Exit)
        const checkExit = (door) => {
            if (!door) return false;
            return this.checkAABB(p, door);
        };

        if (checkExit(this.level.door)) {
            if (this.level.door.isFakeTroll) {
                // Stepped on fake door!
                this.killPlayer("That door was an impostor!");
                return;
            }
            this.winLevel();
            return;
        }

        if (this.level.realDoor && this.level.realDoor.isRevealed && checkExit(this.level.realDoor)) {
            this.winLevel();
            return;
        }
    }

    killPlayer(customReason = null) {
        if (this.isDead || this.levelWon) return;

        this.isDead = true;
        this.deaths++;
        this.totalDeaths++;
        this.respawnTimer = 34; // ~0.55s

        window.soundManager.playDeath();
        this.camera.shake(16, 22);
        this.particles.createDeathBurst(this.player.x + 14, this.player.y + 14, '#00f3ff');

        const quote = customReason || window.TROLL_DEATH_QUOTES[Math.floor(Math.random() * window.TROLL_DEATH_QUOTES.length)];
        this.showDeathOverlay(quote);
    }

    winLevel() {
        if (this.levelWon || this.isDead) return;

        this.levelWon = true;
        this.winTimer = 50;

        window.soundManager.playWin();
        this.camera.shake(6, 15);
        this.particles.createConfetti(this.player.x + 14, this.player.y + 14);
        this.showBanner("SECTOR SECURED! 🎉 QUANTUM SYSTEM CLEARED!", 2000);
    }

    checkAABB(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    showBanner(text, durationMs = 2000) {
        this.bannerText = text;
        this.bannerTimer = Math.floor(durationMs / 16.6);

        const bannerElem = document.getElementById('toastBanner');
        if (bannerElem) {
            bannerElem.textContent = text;
            bannerElem.classList.add('show');
            clearTimeout(this.bannerHideTimeout);
            this.bannerHideTimeout = setTimeout(() => {
                bannerElem.classList.remove('show');
            }, durationMs);
        }
    }

    showDeathOverlay(quote) {
        const quoteElem = document.getElementById('deathQuote');
        const overlay = document.getElementById('deathOverlay');
        if (quoteElem) quoteElem.textContent = `"${quote}"`;
        if (overlay) {
            overlay.classList.add('active');
            setTimeout(() => {
                overlay.classList.remove('active');
            }, 600);
        }
    }

    showVictoryModal() {
        const modal = document.getElementById('victoryModal');
        const deathStat = document.getElementById('finalDeaths');
        if (deathStat) deathStat.textContent = this.totalDeaths;
        if (modal) modal.classList.remove('hidden');
    }

    updateHUD() {
        // Level info
        const lvlTitle = document.getElementById('hudLevelTitle');
        const lvlNum = document.getElementById('hudLevelNum');
        const deathCount = document.getElementById('hudDeaths');
        const hintElem = document.getElementById('hudHint');

        if (lvlTitle) lvlTitle.textContent = this.level ? this.level.title : "";
        if (lvlNum) lvlNum.textContent = `LEVEL ${this.currentLevelIndex + 1}/${window.LEVELS.length}`;
        if (deathCount) deathCount.textContent = `DEATHS: ${this.totalDeaths}`;
        if (hintElem && this.level) hintElem.textContent = this.level.hint || "";

        // Superpower Meters
        const dashMeter = document.getElementById('dashMeter');
        if (dashMeter) {
            const pct = Math.max(0, 100 - (this.powers.dashCooldown / this.powers.dashMaxCooldown) * 100);
            dashMeter.style.width = `${pct}%`;
        }

        const slowmoMeter = document.getElementById('slowmoMeter');
        if (slowmoMeter) {
            const pct = (this.powers.slowmoEnergy / this.powers.slowmoMaxEnergy) * 100;
            slowmoMeter.style.width = `${pct}%`;
        }

        const wormholeMeter = document.getElementById('wormholeMeter');
        if (wormholeMeter) {
            const pct = Math.max(0, 100 - (this.powers.wormholeCooldown / this.powers.wormholeMaxCooldown) * 100);
            wormholeMeter.style.width = `${pct}%`;
        }

        // Superhero meters
        const laserMeter = document.getElementById('laserMeter');
        if (laserMeter) {
            const pct = Math.max(0, 100 - (this.powers.heatVisionCooldown / this.powers.heatVisionMaxCooldown) * 100);
            laserMeter.style.width = `${pct}%`;
        }

        const shieldMeter = document.getElementById('shieldMeter');
        if (shieldMeter) {
            const pct = Math.max(0, 100 - (this.powers.shieldCooldown / this.powers.shieldMaxCooldown) * 100);
            shieldMeter.style.width = `${pct}%`;
        }

        const slamMeter = document.getElementById('slamMeter');
        if (slamMeter) {
            const pct = Math.max(0, 100 - (this.powers.slamCooldown / this.powers.slamMaxCooldown) * 100);
            slamMeter.style.width = `${pct}%`;
        }

        const rewindBtn = document.getElementById('btnRewind');
        if (rewindBtn) {
            rewindBtn.classList.toggle('disabled', this.powers.rewindCooldown > 0 || this.historyBuffer.length < 15);
        }
    }

    toggleSound() {
        const isMuted = window.soundManager.toggleMute();
        const soundBtn = document.getElementById('btnSound');
        if (soundBtn) {
            soundBtn.textContent = isMuted ? "🔇 SOUND OFF" : "🔊 SOUND ON";
        }
    }

    // --- RENDERING ---

    render() {
        const ctx = this.ctx;
        ctx.save();
        ctx.clearRect(0, 0, this.width, this.height);

        // Apply camera shake
        ctx.translate(this.camera.offsetX, this.camera.offsetY);

        // Draw Background
        this.renderBackground(ctx);

        // Draw Black Holes
        this.renderBlackHoles(ctx);

        // Draw Lasers
        this.renderLasers(ctx);

        // Draw Platforms
        this.renderPlatforms(ctx);

        // Draw Spikes
        this.renderSpikes(ctx);

        // Draw Doors
        this.renderDoors(ctx);

        // Draw Particles & Trails
        this.particles.draw(ctx);

        // Draw Enemies (Smolly Villain & Ghost)
        this.renderEnemies(ctx);

        // Draw Player (if alive)
        if (!this.isDead) {
            this.renderPlayer(ctx);

            // Draw Superhero Effects
            if (this.powers.heatVisionTimer > 0) {
                this.renderHeatVision(ctx);
            }
            if (this.powers.shieldActive) {
                this.renderHeroShield(ctx);
            }
            if (this.powers.isSlamming) {
                this.renderThunderSlam(ctx);
            }
        }

        // Post-processing FX (Time-slow vignette / chromatic shift)
        if (this.powers.slowmoActive) {
            this.renderSlowMoFilter(ctx);
        }

        ctx.restore();
    }

    renderBackground(ctx) {
        if (this.level && this.level.isGalactic) {
            // Deep Cosmic Space Gradient
            const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
            bgGrad.addColorStop(0, '#04020a');
            bgGrad.addColorStop(0.6, '#080514');
            bgGrad.addColorStop(1, '#020108');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, this.width, this.height);

            // Cosmic Nebulae
            ctx.save();
            const neb1 = ctx.createRadialGradient(260, 180, 20, 260, 180, 300);
            neb1.addColorStop(0, 'rgba(168, 85, 247, 0.22)');
            neb1.addColorStop(1, 'rgba(168, 85, 247, 0)');
            ctx.fillStyle = neb1;
            ctx.fillRect(0, 0, this.width, this.height);

            const neb2 = ctx.createRadialGradient(700, 340, 20, 700, 340, 320);
            neb2.addColorStop(0, 'rgba(0, 243, 255, 0.16)');
            neb2.addColorStop(1, 'rgba(0, 243, 255, 0)');
            ctx.fillStyle = neb2;
            ctx.fillRect(0, 0, this.width, this.height);

            // Parallax Twinkling Stars
            for (const s of this.stars) {
                ctx.save();
                ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            // Shooting Star
            if (this.shootingStar) {
                ctx.save();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.shootingStar.x, this.shootingStar.y);
                ctx.lineTo(this.shootingStar.x - this.shootingStar.vx * 3, this.shootingStar.y - this.shootingStar.vy * 3);
                ctx.stroke();
                ctx.restore();
            }
            ctx.restore();
        } else {
            // Standard Cyber Grid
            const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
            bgGrad.addColorStop(0, '#0a0d16');
            bgGrad.addColorStop(1, '#05070b');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, this.width, this.height);

            ctx.strokeStyle = 'rgba(0, 243, 255, 0.04)';
            ctx.lineWidth = 1;
            const gridSize = 40;
            for (let x = 0; x < this.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, this.height);
                ctx.stroke();
            }
            for (let y = 0; y < this.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(this.width, y);
                ctx.stroke();
            }
        }
    }

    renderBlackHoles(ctx) {
        if (!this.level || !this.level.blackHoles) return;

        const time = Date.now() * 0.003;
        for (const bh of this.level.blackHoles) {
            ctx.save();
            ctx.translate(bh.x, bh.y);

            // Outer gravitational distortion ring
            const outerGlow = ctx.createRadialGradient(0, 0, 20, 0, 0, bh.radius);
            outerGlow.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
            outerGlow.addColorStop(0.5, 'rgba(0, 243, 255, 0.15)');
            outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(0, 0, bh.radius, 0, Math.PI * 2);
            ctx.fill();

            // Swirling Accretion Disk
            ctx.rotate(time);
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 12]);
            ctx.beginPath();
            ctx.arc(0, 0, bh.radius * 0.45, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = '#00f3ff';
            ctx.lineWidth = 2;
            ctx.setLineDash([12, 16]);
            ctx.beginPath();
            ctx.arc(0, 0, bh.radius * 0.7, 0, Math.PI * 2);
            ctx.stroke();

            // Pitch Black Singularity Core
            ctx.rotate(-time);
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();

            // Sharp Event Horizon Ring
            ctx.strokeStyle = '#ff007f';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        }
    }

    renderLasers(ctx) {
        if (!this.level || !this.level.lasers) return;

        for (const laser of this.level.lasers) {
            ctx.save();
            if (laser.active) {
                // Lethal Laser Beam
                const beamGlow = ctx.createLinearGradient(laser.x, 0, laser.x + laser.width, 0);
                beamGlow.addColorStop(0, 'rgba(255, 0, 85, 0.3)');
                beamGlow.addColorStop(0.5, 'rgba(255, 0, 85, 0.95)');
                beamGlow.addColorStop(1, 'rgba(255, 0, 85, 0.3)');

                ctx.fillStyle = beamGlow;
                ctx.fillRect(laser.x - 4, laser.y, laser.width + 8, laser.height);

                // Intense White Laser Core
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(laser.x + laser.width / 2 - 1.5, laser.y, 3, laser.height);

                // Laser Emitter Nodes
                ctx.fillStyle = '#ff0055';
                ctx.fillRect(laser.x - 3, laser.y - 6, laser.width + 6, 6);
                ctx.fillRect(laser.x - 3, laser.y + laser.height, laser.width + 6, 6);
            } else if (laser.timer > laser.onDuration - 30) {
                // Pre-fire flicker warning laser
                ctx.strokeStyle = 'rgba(255, 0, 85, 0.45)';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.moveTo(laser.x + laser.width / 2, laser.y);
                ctx.lineTo(laser.x + laser.width / 2, laser.y + laser.height);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    renderPlatforms(ctx) {
        for (const plat of this.level.platforms) {
            if (plat.opacity === 0) continue;

            const px = plat.x + (plat.offsetX || 0);
            const py = plat.y;

            if (plat.type === 'inversion_zone') {
                // Purple glitch inversion field
                ctx.save();
                ctx.fillStyle = 'rgba(168, 85, 247, 0.18)';
                ctx.fillRect(px, py, plat.width, plat.height);
                ctx.strokeStyle = '#a855f7';
                ctx.setLineDash([6, 6]);
                ctx.lineWidth = 2;
                ctx.strokeRect(px, py, plat.width, plat.height);

                ctx.fillStyle = '#d8b4fe';
                ctx.font = '12px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText("INVERSION FIELD", px + plat.width / 2, py + plat.height / 2);
                ctx.restore();
                continue;
            }

            if (plat.type === 'fake_wall') {
                // Phase-through wall with holographic shimmer
                ctx.save();
                ctx.fillStyle = 'rgba(0, 243, 255, 0.25)';
                ctx.fillRect(px, py, plat.width, plat.height);
                ctx.strokeStyle = '#00f3ff';
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                ctx.strokeRect(px, py, plat.width, plat.height);

                ctx.save();
                ctx.translate(px + plat.width / 2, py + plat.height / 2);
                ctx.rotate(-Math.PI / 2);
                ctx.fillStyle = '#00f3ff';
                ctx.font = '10px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText("PHASE", 0, 4);
                ctx.restore();

                ctx.restore();
                continue;
            }

            if (plat.type === 'destructible') {
                if (plat.isBroken) continue;
                ctx.save();
                // Reinforced titanium blast wall / hatch
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(px, py, plat.width, plat.height);
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 2;
                ctx.strokeRect(px, py, plat.width, plat.height);

                // Warning hazard diagonal stripes
                ctx.save();
                ctx.beginPath();
                ctx.rect(px, py, plat.width, plat.height);
                ctx.clip();
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
                ctx.lineWidth = 4;
                for (let x = -plat.height; x < plat.width + plat.height; x += 14) {
                    ctx.beginPath();
                    ctx.moveTo(px + x, py);
                    ctx.lineTo(px + x + plat.height, py + plat.height);
                    ctx.stroke();
                }
                ctx.restore();

                // Holo warning badge
                ctx.fillStyle = '#fbbf24';
                ctx.font = '7px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(plat.isFloor ? "CRACKED" : "TITANIUM", px + plat.width / 2, py + plat.height / 2 + 3);
                ctx.restore();
                continue;
            }

            // Normal Solid / Collapsing / Moving Platform
            ctx.save();
            let platColor = '#181e2b';
            let borderColor = '#2d374d';

            if (plat.type === 'collapse') {
                platColor = plat.isTriggered ? '#3b1c24' : '#222330';
                borderColor = plat.isTriggered ? '#ff0055' : '#493644';
            } else if (plat.type === 'moving_h') {
                borderColor = '#ffe600';
            } else if (plat.type === 'crusher') {
                platColor = '#2d1822';
                borderColor = '#ff0055';
            } else if (plat.type === 'asteroid') {
                platColor = '#18142b';
                borderColor = '#a855f7';
            }

            // Base platform fill
            ctx.fillStyle = platColor;
            ctx.fillRect(px, py, plat.width, plat.height);

            // Glowing top highlight edge
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(px, py, plat.width, plat.height);

            // Tech bevel lines
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.fillRect(px, py, plat.width, 3);

            ctx.restore();
        }
    }

    renderSpikes(ctx) {
        const time = Date.now() * 0.005;
        for (const spike of this.level.spikes) {
            if (spike.isHidden) continue;

            ctx.save();
            // Draw anti-matter plasma emitters along the hazard zone
            const count = Math.max(1, Math.round(spike.width / 18));
            const nodeW = spike.width / count;

            for (let i = 0; i < count; i++) {
                const sx = spike.x + i * nodeW;
                const isDown = spike.dir === 'down';
                const baseY = isDown ? spike.y : spike.y + spike.height;
                const tipY = isDown ? spike.y + spike.height : spike.y;
                const pulse = Math.sin(time + i * 1.5) * 0.2 + 0.8;

                // 1. Tech Mount Base (Emitter chassis)
                ctx.fillStyle = '#111827';
                ctx.strokeStyle = '#ff0055';
                ctx.lineWidth = 1;
                const mountH = 4;
                if (isDown) {
                    ctx.fillRect(sx + 1, baseY, nodeW - 2, mountH);
                    ctx.strokeRect(sx + 1, baseY, nodeW - 2, mountH);
                } else {
                    ctx.fillRect(sx + 1, baseY - mountH, nodeW - 2, mountH);
                    ctx.strokeRect(sx + 1, baseY - mountH, nodeW - 2, mountH);
                }

                // 2. Anti-Matter Plasma Energy Blade
                ctx.save();
                ctx.shadowColor = '#ff0055';
                ctx.shadowBlur = 8 * pulse;

                // Gradient from plasma magenta to electric yellow core
                const grad = ctx.createLinearGradient(sx + nodeW / 2, baseY, sx + nodeW / 2, tipY);
                grad.addColorStop(0, '#990033');
                grad.addColorStop(0.6, '#ff0055');
                grad.addColorStop(1, '#ffe600');

                ctx.fillStyle = grad;
                ctx.beginPath();
                if (isDown) {
                    ctx.moveTo(sx + 2, baseY + mountH);
                    ctx.lineTo(sx + nodeW / 2, tipY);
                    ctx.lineTo(sx + nodeW - 2, baseY + mountH);
                } else {
                    ctx.moveTo(sx + 2, baseY - mountH);
                    ctx.lineTo(sx + nodeW / 2, tipY);
                    ctx.lineTo(sx + nodeW - 2, baseY - mountH);
                }
                ctx.closePath();
                ctx.fill();

                // 3. Electric Lightning Core
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(sx + nodeW / 2, isDown ? baseY + mountH : baseY - mountH);
                ctx.lineTo(sx + nodeW / 2, tipY);
                ctx.stroke();

                ctx.restore();
            }

            ctx.restore();
        }
    }

    renderDoors(ctx) {
        const drawSingleDoor = (door, isReal = true) => {
            if (!door || door.opacity === 0) return;

            const dx = door.x;
            const dy = door.y;
            const dw = door.width;
            const dh = door.height;
            const time = Date.now() * 0.003;

            ctx.save();

            // 1. Heavy Sci-Fi Stargate Pylons (Outer Frame)
            ctx.fillStyle = isReal ? '#0b1626' : '#260b16';
            ctx.strokeStyle = isReal ? '#00f3ff' : '#ff0055';
            ctx.lineWidth = 2.5;

            // Outer chamfered portal pod
            ctx.beginPath();
            const cut = 6;
            ctx.moveTo(dx + cut, dy);
            ctx.lineTo(dx + dw - cut, dy);
            ctx.lineTo(dx + dw, dy + cut);
            ctx.lineTo(dx + dw, dy + dh - cut);
            ctx.lineTo(dx + dw - cut, dy + dh);
            ctx.lineTo(dx + cut, dy + dh);
            ctx.lineTo(dx, dy + dh - cut);
            ctx.lineTo(dx, dy + cut);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Corner energy emitter diodes
            const diodeColor = isReal ? '#00ffcc' : '#ff3366';
            ctx.fillStyle = diodeColor;
            ctx.fillRect(dx + 2, dy + 2, 3, 3);
            ctx.fillRect(dx + dw - 5, dy + 2, 3, 3);
            ctx.fillRect(dx + 2, dy + dh - 5, 3, 3);
            ctx.fillRect(dx + dw - 5, dy + dh - 5, 3, 3);

            // 2. Swirling Event-Horizon Vortex (Inner Field)
            const cx = dx + dw / 2;
            const cy = dy + dh / 2;
            const radius = Math.min(dw, dh) * 0.42;

            const riftGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius);
            if (isReal) {
                riftGrad.addColorStop(0, '#ffffff');
                riftGrad.addColorStop(0.3, '#00f3ff');
                riftGrad.addColorStop(0.7, '#004488');
                riftGrad.addColorStop(1, '#020b18');
            } else {
                riftGrad.addColorStop(0, '#ffe600');
                riftGrad.addColorStop(0.4, '#ff0055');
                riftGrad.addColorStop(0.8, '#440022');
                riftGrad.addColorStop(1, '#110008');
            }

            ctx.fillStyle = riftGrad;
            ctx.beginPath();
            ctx.ellipse(cx, cy, dw * 0.38, dh * 0.42, 0, 0, Math.PI * 2);
            ctx.fill();

            // 3. Rotating Gyroscopic Quantum Rings
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(isReal ? time : -time * 1.5);
            ctx.strokeStyle = isReal ? 'rgba(0, 243, 255, 0.7)' : 'rgba(255, 0, 85, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, dw * 0.32, dh * 0.18, 0, 0, Math.PI * 2);
            ctx.stroke();

            ctx.rotate(Math.PI / 2 + time * 0.5);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.ellipse(0, 0, dw * 0.22, dh * 0.12, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // 4. Holographic Stargate HUD Tag
            ctx.fillStyle = isReal ? '#00f3ff' : '#ff0055';
            ctx.font = '7px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.shadowColor = isReal ? '#00f3ff' : '#ff0055';
            ctx.shadowBlur = 6;
            ctx.fillText(isReal ? "GATE" : "ERROR", cx, dy - 6);

            ctx.restore();
        };

        drawSingleDoor(this.level.door, !this.level.door.isFakeTroll);
        if (this.level.realDoor && this.level.realDoor.isRevealed) {
            drawSingleDoor(this.level.realDoor, true);
        }
    }

    renderEnemies(ctx) {
        if (!this.level || !this.level.enemies) return;

        for (const enemy of this.level.enemies) {
            ctx.save();

            if (enemy.type === 'smolly') {
                const ex = enemy.x;
                const ey = enemy.y - (enemy.hop || 0);
                const ew = enemy.width;
                const eh = enemy.height;
                const dir = enemy.dir || 1;

                // Security Droid Shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.beginPath();
                ctx.ellipse(ex + ew / 2, enemy.y + eh + 2, ew / 2, 3, 0, 0, Math.PI * 2);
                ctx.fill();

                // Glowing Alert Aura
                ctx.shadowColor = 'rgba(255, 0, 85, 0.8)';
                ctx.shadowBlur = 10;

                // Armored Chassis (Crimson Mecha Pod)
                ctx.fillStyle = '#2b0c16';
                ctx.fillRect(ex, ey, ew, eh);

                ctx.strokeStyle = '#ff0055';
                ctx.lineWidth = 1.8;
                ctx.strokeRect(ex, ey, ew, eh);

                // Twin Sensor Fins (Antennas)
                ctx.fillStyle = '#ff0055';
                ctx.beginPath();
                ctx.moveTo(ex + 3, ey);
                ctx.lineTo(ex + 5, ey - 6);
                ctx.lineTo(ex + 8, ey);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(ex + ew - 8, ey);
                ctx.lineTo(ex + ew - 5, ey - 6);
                ctx.lineTo(ex + ew - 3, ey);
                ctx.closePath();
                ctx.fill();

                // Robotic Cyclops Optic Visor (Menacing Target Scanner)
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#0d0006';
                const visorY = ey + 5;
                ctx.fillRect(ex + 2, visorY, ew - 4, 7);

                // Scanning Laser Eye
                ctx.fillStyle = '#ff0055';
                const eyeX = dir > 0 ? ex + ew - 9 : ex + 4;
                ctx.fillRect(eyeX, visorY + 1, 5, 5);

                ctx.fillStyle = '#ffe600';
                ctx.fillRect(eyeX + (dir > 0 ? 2 : 1), visorY + 2, 2, 2);

                // Twin Electro-Cutters / Plasma Stunner Pincer
                ctx.strokeStyle = '#ffe600';
                ctx.fillStyle = '#ff0055';
                ctx.lineWidth = 2;
                const pincerX = dir > 0 ? ex + ew + 4 : ex - 4;
                ctx.beginPath();
                ctx.moveTo(ex + (dir > 0 ? ew - 2 : 2), ey + eh / 2);
                ctx.lineTo(pincerX, ey + eh / 2);
                ctx.stroke();

                // Sparking Pincer Jaws
                ctx.beginPath();
                ctx.moveTo(pincerX, ey + eh / 2 - 4);
                ctx.lineTo(pincerX + dir * 5, ey + eh / 2 - 2);
                ctx.moveTo(pincerX, ey + eh / 2 + 4);
                ctx.lineTo(pincerX + dir * 5, ey + eh / 2 + 2);
                ctx.stroke();

                // Thruster Jet Exhaust underneath
                const flameH = (enemy.hop || 0) > 0 ? 5 : 2;
                ctx.fillStyle = '#ff6600';
                ctx.fillRect(ex + ew / 2 - 2, ey + eh, 4, flameH);

            } else if (enemy.type === 'ghost') {
                const gx = enemy.x;
                const gy = enemy.y;
                const gw = enemy.width;
                const gh = enemy.height;
                const dir = enemy.faceDir || 1;

                // Quantum Glitch Phantasm
                ctx.shadowColor = 'rgba(0, 243, 255, 0.8)';
                ctx.shadowBlur = 14;

                // Translucent holographic matrix body
                ctx.fillStyle = 'rgba(12, 35, 60, 0.75)';
                ctx.beginPath();
                // Rounded dome head
                ctx.arc(gx + gw / 2, gy + gw / 2, gw / 2, Math.PI, 0);
                // Right side down
                ctx.lineTo(gx + gw, gy + gh - 4);
                // Digital sawtooth / glitch ruffles
                ctx.lineTo(gx + gw * 0.75, gy + gh);
                ctx.lineTo(gx + gw * 0.5, gy + gh - 4);
                ctx.lineTo(gx + gw * 0.25, gy + gh);
                ctx.lineTo(gx, gy + gh - 4);
                ctx.closePath();
                ctx.fill();

                // Outer holographic wireframe rim
                ctx.strokeStyle = '#00f3ff';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Glitch Scanlines
                ctx.shadowBlur = 0;
                ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
                ctx.lineWidth = 1;
                for (let y = gy + 6; y < gy + gh - 6; y += 4) {
                    ctx.beginPath();
                    ctx.moveTo(gx + 3, y);
                    ctx.lineTo(gx + gw - 3, y);
                    ctx.stroke();
                }

                // Cyber Optic Nodes
                ctx.fillStyle = '#00f3ff';
                const eyeOffset = dir > 0 ? 3 : -3;
                ctx.fillRect(gx + gw / 2 - 5 + eyeOffset, gy + 10, 3, 3);
                ctx.fillRect(gx + gw / 2 + 2 + eyeOffset, gy + 10, 3, 3);

                ctx.fillStyle = '#ffffff';
                ctx.fillRect(gx + gw / 2 - 4 + eyeOffset, gy + 11, 1.5, 1.5);
                ctx.fillRect(gx + gw / 2 + 3 + eyeOffset, gy + 11, 1.5, 1.5);
            }

            ctx.restore();
        }
    }

    renderPlayer(ctx) {
        const p = this.player;
        ctx.save();
        ctx.translate(p.x + p.width / 2, p.y + p.height / 2);

        // Squeeze & stretch + upside-down flip
        ctx.scale(p.scaleX, p.scaleY * p.gravityDir);

        const w = p.width;
        const h = p.height;
        const halfW = w / 2;
        const halfH = h / 2;
        const dir = p.faceDir || 1;

        // 1. Quantum / Phase Shift Aura
        if (p.isPhasing) {
            ctx.shadowColor = '#00f3ff';
            ctx.shadowBlur = 18;
        } else {
            ctx.shadowColor = 'rgba(0, 243, 255, 0.4)';
            ctx.shadowBlur = 6;
        }

        // 2. Head Antenna with pulsing comms beacon
        const antY = -halfH;
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, antY);
        ctx.lineTo(0, antY - 5);
        ctx.stroke();

        const beaconPulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5;
        ctx.fillStyle = p.isPhasing ? '#ffffff' : (beaconPulse > 0.5 ? '#00f3ff' : '#ffe600');
        ctx.beginPath();
        ctx.arc(0, antY - 6, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 3. Cyber-Bot Chassis (Rounded high-tech metallic body)
        ctx.fillStyle = p.isPhasing ? 'rgba(0, 243, 255, 0.5)' : '#0d1829';
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2;

        const rad = 4;
        ctx.beginPath();
        ctx.moveTo(-halfW + rad, -halfH);
        ctx.lineTo(halfW - rad, -halfH);
        ctx.quadraticCurveTo(halfW, -halfH, halfW, -halfH + rad);
        ctx.lineTo(halfW, halfH - rad);
        ctx.quadraticCurveTo(halfW, halfH, halfW - rad, halfH);
        ctx.lineTo(-halfW + rad, halfH);
        ctx.quadraticCurveTo(-halfW, halfH, -halfW, halfH - rad);
        ctx.lineTo(-halfW, -halfH + rad);
        ctx.quadraticCurveTo(-halfW, -halfH, -halfW + rad, -halfH);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 4. Circuit Inlay Lines
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-halfW + 3, 0);
        ctx.lineTo(-halfW + 7, 0);
        ctx.moveTo(halfW - 7, 0);
        ctx.lineTo(halfW - 3, 0);
        ctx.stroke();

        // 5. Digital Visor Screen
        const visorW = w - 8;
        const visorH = 10;
        const visorX = -halfW + 4 + (dir > 0 ? 1 : -1);
        const visorY = -halfH + 5;

        ctx.fillStyle = '#030814';
        ctx.fillRect(visorX, visorY, visorW, visorH);
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(visorX, visorY, visorW, visorH);

        // 6. Expressive LED Matrix Eyes
        ctx.shadowBlur = 0;
        ctx.fillStyle = p.isPhasing ? '#ffffff' : '#00f3ff';

        const eyeW = 3;
        const eyeH = p.isBlinking ? 1 : 5;
        const eyeY = visorY + (p.isBlinking ? 4 : 2);
        const baseEyeX = visorX + (dir > 0 ? 5 : 2);

        // Twin LED eyes
        ctx.fillRect(baseEyeX, eyeY, eyeW, eyeH);
        ctx.fillRect(baseEyeX + 5, eyeY, eyeW, eyeH);

        // Eye glint
        if (!p.isBlinking) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(baseEyeX + 1, eyeY + 1, 1.5, 1.5);
            ctx.fillRect(baseEyeX + 6, eyeY + 1, 1.5, 1.5);
        }

        // 7. Base Micro-Thrusters
        if (p.isGrounded && Math.abs(p.vx) > 0.5) {
            // Thruster flame when rolling/running
            ctx.fillStyle = '#ff9900';
            ctx.beginPath();
            const flameDir = -dir;
            ctx.moveTo(flameDir * 4, halfH);
            ctx.lineTo(flameDir * 8, halfH + 3);
            ctx.lineTo(flameDir * 2, halfH);
            ctx.fill();
        }

        ctx.restore();
    }

    renderSlowMoFilter(ctx) {
        ctx.save();
        // Cyan-magenta chromatic vignette
        const grad = ctx.createRadialGradient(
            this.width / 2, this.height / 2, this.height * 0.35,
            this.width / 2, this.height / 2, this.width * 0.65
        );
        grad.addColorStop(0, 'rgba(0, 243, 255, 0.0)');
        grad.addColorStop(1, 'rgba(255, 0, 128, 0.22)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Slow-mo banner badge
        ctx.fillStyle = '#ff007f';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText("⏳ MATRIX TIME ACTIVE", 24, this.height - 24);
        ctx.restore();
    }

    renderHeatVision(ctx) {
        const p = this.player;
        const dir = p.faceDir !== 0 ? p.faceDir : 1;
        const startX = p.x + (dir > 0 ? p.width - 2 : 2);
        const startY = p.y + (p.height / 2 - 2);
        const endX = startX + dir * 900;

        ctx.save();
        // Searing Heat Beam Outer Glow
        ctx.shadowColor = '#ff0033';
        ctx.shadowBlur = 18;

        // Twin optic beams
        [-2, 2].forEach(offsetY => {
            const y = startY + offsetY;
            // Outer wide thermal beam
            ctx.strokeStyle = 'rgba(255, 50, 0, 0.7)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();

            // Inner searing white/yellow core
            ctx.strokeStyle = '#ffe600';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        });

        // Flash at eye emitter
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(startX, startY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    renderHeroShield(ctx) {
        const p = this.player;
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        const radius = Math.max(p.width, p.height) * 0.95;
        const time = Date.now() * 0.004;

        ctx.save();
        ctx.translate(cx, cy);

        // Hexagonal / Circular Forcefield Glow
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 16;

        const shieldGrad = ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius);
        shieldGrad.addColorStop(0, 'rgba(0, 243, 255, 0.1)');
        shieldGrad.addColorStop(0.7, 'rgba(0, 243, 255, 0.25)');
        shieldGrad.addColorStop(1, 'rgba(255, 230, 0, 0.45)');

        ctx.fillStyle = shieldGrad;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Rotating Hexagon shield perimeter
        ctx.rotate(time);
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const hx = Math.cos(angle) * radius;
            const hy = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();

        // Counter-rotating inner energy crest
        ctx.rotate(-time * 2);
        ctx.strokeStyle = 'rgba(255, 230, 0, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 1.6);
        ctx.stroke();

        ctx.restore();
    }

    renderThunderSlam(ctx) {
        const p = this.player;
        const cx = p.x + p.width / 2;

        ctx.save();
        // Hypersonic re-entry fire streak above player
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 20;

        const flameGrad = ctx.createLinearGradient(cx, p.y - 45, cx, p.y);
        flameGrad.addColorStop(0, 'rgba(255, 200, 0, 0)');
        flameGrad.addColorStop(0.6, 'rgba(255, 100, 0, 0.8)');
        flameGrad.addColorStop(1, '#ffffff');

        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(p.x + 2, p.y + 4);
        ctx.lineTo(cx, p.y - 45);
        ctx.lineTo(p.x + p.width - 2, p.y + 4);
        ctx.closePath();
        ctx.fill();

        // Electric shock sparks trailing
        ctx.strokeStyle = '#ffe600';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 8, p.y - 15);
        ctx.lineTo(cx + 6, p.y - 28);
        ctx.lineTo(cx - 4, p.y - 40);
        ctx.stroke();

        ctx.restore();
    }

    loop(timestamp) {
        const dt = (timestamp - this.lastTime) / 16.6 || 1;
        this.lastTime = timestamp;

        this.update(Math.min(dt, 2.0));
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
    window.game.start();
});
