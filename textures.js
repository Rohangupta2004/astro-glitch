// ============================================================================
// ASTRO GLITCH: QUANTUM HEIST - PROCEDURAL TEXTURE LIBRARY
// ----------------------------------------------------------------------------
// Every surface map in the 3D renderer is generated here at runtime on a 2D
// canvas, so the game ships no binary art assets and stays offline-friendly.
// Each factory returns a set of maps ready to hand to a MeshStandardMaterial:
//   { map, bumpMap, roughnessMap, emissiveMap }
// Generation is deterministic (seeded PRNG) so a level looks the same on every
// load, and results are cached by key because these are not cheap to build.
// ============================================================================

(function () {
    const CACHE = {};

    // --- Core helpers -------------------------------------------------------

    function makeCanvas(size) {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        return c;
    }

    // Mulberry32 - small deterministic PRNG so textures are reproducible.
    function seeded(seed) {
        let a = seed >>> 0;
        return function () {
            a |= 0;
            a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function toTexture(canvas, repeatX, repeatY, srgb) {
        const t = new THREE.CanvasTexture(canvas);
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(repeatX || 1, repeatY || 1);
        t.anisotropy = 8;
        if (srgb && THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
        return t;
    }

    // Speckled grain used to break up flat fills on every material.
    function grain(ctx, size, rng, amount, alpha) {
        const img = ctx.getImageData(0, 0, size, size);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
            const n = (rng() - 0.5) * amount;
            d[i] = Math.max(0, Math.min(255, d[i] + n));
            d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
            d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
            if (alpha !== undefined) d[i + 3] = alpha;
        }
        ctx.putImageData(img, 0, 0);
    }

    // Fine horizontal brushing, sells "machined metal" more than noise alone.
    function brush(ctx, size, rng, strength, color) {
        ctx.save();
        ctx.globalAlpha = strength;
        ctx.strokeStyle = color || '#ffffff';
        ctx.lineWidth = 1;
        for (let i = 0; i < size * 1.5; i++) {
            const y = rng() * size;
            const x0 = rng() * size;
            const len = 20 + rng() * (size * 0.6);
            ctx.globalAlpha = strength * (0.25 + rng() * 0.75);
            ctx.beginPath();
            ctx.moveTo(x0, y);
            ctx.lineTo(x0 + len, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    function scratches(ctx, size, rng, count, color, alpha) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        for (let i = 0; i < count; i++) {
            ctx.globalAlpha = alpha * (0.3 + rng() * 0.7);
            ctx.lineWidth = 0.6 + rng() * 1.4;
            const x = rng() * size;
            const y = rng() * size;
            const ang = rng() * Math.PI * 2;
            const len = 8 + rng() * 60;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
            ctx.stroke();
        }
        ctx.restore();
    }

    // Dark grime pooling in corners/edges - the main "not plastic" cue.
    function grime(ctx, size, rng, blobs, alpha) {
        ctx.save();
        for (let i = 0; i < blobs; i++) {
            const x = rng() * size;
            const y = rng() * size;
            const r = size * (0.05 + rng() * 0.22);
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, 'rgba(0,0,0,' + (alpha * (0.4 + rng() * 0.6)).toFixed(3) + ')');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
        ctx.restore();
    }

    function rivet(ctx, x, y, r, light, dark) {
        const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
        g.addColorStop(0, light);
        g.addColorStop(1, dark);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // ------------------------------------------------------------------------
    // 1. METAL HULL PANEL - the default platform surface
    // ------------------------------------------------------------------------
    function metalPanel(opts) {
        const o = opts || {};
        const size = o.size || 512;
        const seed = o.seed || 1337;
        const base = o.base || '#33445f';
        const dark = o.dark || '#1b2434';
        const accent = o.accent || '#00f3ff';
        const cells = o.cells || 4;

        const rng = seeded(seed);
        const a = makeCanvas(size), ac = a.getContext('2d');
        const b = makeCanvas(size), bc = b.getContext('2d');
        const r = makeCanvas(size), rc = r.getContext('2d');
        const e = makeCanvas(size), ec = e.getContext('2d');

        // Albedo base with a soft vertical lighting ramp baked in.
        const grad = ac.createLinearGradient(0, 0, 0, size);
        grad.addColorStop(0, base);
        grad.addColorStop(1, dark);
        ac.fillStyle = grad;
        ac.fillRect(0, 0, size, size);

        bc.fillStyle = '#808080';
        bc.fillRect(0, 0, size, size);
        rc.fillStyle = '#5a5a5a'; // fairly glossy by default
        rc.fillRect(0, 0, size, size);
        ec.fillStyle = '#000000';
        ec.fillRect(0, 0, size, size);

        brush(ac, size, rng, 0.05, '#9fb6d9');
        grain(ac, size, rng, 26);

        // Panel seam grid.
        const step = size / cells;
        ac.save();
        for (let i = 0; i <= cells; i++) {
            const p = Math.round(i * step);

            // Dark recess + bright highlight lip on each seam.
            ac.strokeStyle = 'rgba(0,0,0,0.75)';
            ac.lineWidth = 3;
            ac.beginPath(); ac.moveTo(p, 0); ac.lineTo(p, size);
            ac.moveTo(0, p); ac.lineTo(size, p); ac.stroke();

            ac.strokeStyle = 'rgba(190,215,255,0.10)';
            ac.lineWidth = 1;
            ac.beginPath(); ac.moveTo(p + 2, 0); ac.lineTo(p + 2, size);
            ac.moveTo(0, p + 2); ac.lineTo(size, p + 2); ac.stroke();

            bc.strokeStyle = '#2a2a2a';
            bc.lineWidth = 3;
            bc.beginPath(); bc.moveTo(p, 0); bc.lineTo(p, size);
            bc.moveTo(0, p); bc.lineTo(size, p); bc.stroke();

            rc.strokeStyle = '#8a8a8a'; // seams read rougher than the plate
            rc.lineWidth = 4;
            rc.beginPath(); rc.moveTo(p, 0); rc.lineTo(p, size);
            rc.moveTo(0, p); rc.lineTo(size, p); rc.stroke();
        }
        ac.restore();

        // Rivets inset from every panel corner.
        for (let ix = 0; ix < cells; ix++) {
            for (let iy = 0; iy < cells; iy++) {
                const cx = ix * step, cy = iy * step;
                const inset = step * 0.13;
                const rr = Math.max(2, step * 0.035);
                const pts = [
                    [cx + inset, cy + inset],
                    [cx + step - inset, cy + inset],
                    [cx + inset, cy + step - inset],
                    [cx + step - inset, cy + step - inset]
                ];
                for (const pt of pts) {
                    rivet(ac, pt[0], pt[1], rr, 'rgba(200,222,255,0.55)', 'rgba(0,0,0,0.6)');
                    rivet(bc, pt[0], pt[1], rr, '#e8e8e8', '#5a5a5a');
                    rc.fillStyle = '#3a3a3a';
                    rc.beginPath(); rc.arc(pt[0], pt[1], rr, 0, Math.PI * 2); rc.fill();
                }
            }
        }

        // A few panels get a lit accent strip / hazard marking.
        for (let ix = 0; ix < cells; ix++) {
            for (let iy = 0; iy < cells; iy++) {
                if (rng() > 0.12) continue;
                const cx = ix * step, cy = iy * step;
                const sw = step * 0.5, sh = Math.max(3, step * 0.07);
                const sx = cx + step * 0.25, sy = cy + step * 0.72;
                ac.fillStyle = accent;
                ac.globalAlpha = 0.6;
                ac.fillRect(sx, sy, sw, sh);
                ac.globalAlpha = 1;
                ec.fillStyle = accent;
                ec.fillRect(sx, sy, sw, sh);
                rc.fillStyle = '#202020';
                rc.fillRect(sx, sy, sw, sh);
            }
        }

        scratches(ac, size, rng, 90, '#c7d9f2', 0.10);
        scratches(rc, size, rng, 90, '#b0b0b0', 0.20);
        grime(ac, size, rng, 14, 0.5);
        grime(rc, size, rng, 10, 0.3);
        grain(rc, size, rng, 18);

        return {
            map: toTexture(a, o.rx, o.ry, true),
            bumpMap: toTexture(b, o.rx, o.ry),
            roughnessMap: toTexture(r, o.rx, o.ry),
            emissiveMap: toTexture(e, o.rx, o.ry, true)
        };
    }

    // ------------------------------------------------------------------------
    // 2. HAZARD PLATE - destructible / warning platforms
    // ------------------------------------------------------------------------
    function hazardPlate(opts) {
        const o = opts || {};
        const size = o.size || 512;
        const rng = seeded(o.seed || 907);
        const stripeA = o.stripeA || '#d97706';
        const stripeB = o.stripeB || '#12161f';

        const a = makeCanvas(size), ac = a.getContext('2d');
        const b = makeCanvas(size), bc = b.getContext('2d');
        const r = makeCanvas(size), rc = r.getContext('2d');
        const e = makeCanvas(size), ec = e.getContext('2d');

        ac.fillStyle = stripeB; ac.fillRect(0, 0, size, size);
        bc.fillStyle = '#808080'; bc.fillRect(0, 0, size, size);
        rc.fillStyle = '#6a6a6a'; rc.fillRect(0, 0, size, size);
        ec.fillStyle = '#000000'; ec.fillRect(0, 0, size, size);

        // 45-degree hazard chevrons.
        const bandW = size / 8;
        ac.save(); ec.save();
        ac.translate(size / 2, size / 2); ac.rotate(-Math.PI / 4); ac.translate(-size, -size);
        ec.translate(size / 2, size / 2); ec.rotate(-Math.PI / 4); ec.translate(-size, -size);
        for (let i = 0; i < 16; i++) {
            if (i % 2 === 0) continue;
            ac.fillStyle = stripeA;
            ac.fillRect(i * bandW, 0, bandW, size * 2);
            ec.fillStyle = 'rgba(217,119,6,0.55)';
            ec.fillRect(i * bandW, 0, bandW, size * 2);
        }
        ac.restore(); ec.restore();

        brush(ac, size, rng, 0.06, '#ffd9a0');
        grain(ac, size, rng, 30);

        // Bolted border frame.
        ac.strokeStyle = 'rgba(0,0,0,0.8)'; ac.lineWidth = 10;
        ac.strokeRect(5, 5, size - 10, size - 10);
        bc.strokeStyle = '#3a3a3a'; bc.lineWidth = 10;
        bc.strokeRect(5, 5, size - 10, size - 10);
        for (let i = 0; i < 8; i++) {
            const t = (i + 0.5) / 8 * size;
            for (const pt of [[t, 16], [t, size - 16], [16, t], [size - 16, t]]) {
                rivet(ac, pt[0], pt[1], 5, 'rgba(255,235,200,0.6)', 'rgba(0,0,0,0.7)');
                rivet(bc, pt[0], pt[1], 5, '#f0f0f0', '#555555');
            }
        }

        scratches(ac, size, rng, 140, '#2b2b2b', 0.35);
        grime(ac, size, rng, 18, 0.55);
        grain(rc, size, rng, 22);

        return {
            map: toTexture(a, o.rx, o.ry, true),
            bumpMap: toTexture(b, o.rx, o.ry),
            roughnessMap: toTexture(r, o.rx, o.ry),
            emissiveMap: toTexture(e, o.rx, o.ry, true)
        };
    }

    // ------------------------------------------------------------------------
    // 3. FRACTURED PLATE - collapsing platforms
    // ------------------------------------------------------------------------
    function crackedPlate(opts) {
        const o = opts || {};
        const size = o.size || 512;
        const rng = seeded(o.seed || 5521);
        const base = o.base || '#241926';
        const glow = o.glow || '#ff0055';

        const a = makeCanvas(size), ac = a.getContext('2d');
        const b = makeCanvas(size), bc = b.getContext('2d');
        const r = makeCanvas(size), rc = r.getContext('2d');
        const e = makeCanvas(size), ec = e.getContext('2d');

        ac.fillStyle = base; ac.fillRect(0, 0, size, size);
        bc.fillStyle = '#909090'; bc.fillRect(0, 0, size, size);
        rc.fillStyle = '#7a7a7a'; rc.fillRect(0, 0, size, size);
        ec.fillStyle = '#000000'; ec.fillRect(0, 0, size, size);

        brush(ac, size, rng, 0.04, '#d2a8c8');
        grain(ac, size, rng, 32);

        // Branching fracture network, drawn into albedo, bump and emissive.
        function crack(x, y, ang, len, depth) {
            if (depth <= 0 || len < 4) return;
            const nx = x + Math.cos(ang) * len;
            const ny = y + Math.sin(ang) * len;
            const w = Math.max(0.8, depth * 1.1);

            ac.strokeStyle = 'rgba(0,0,0,0.85)'; ac.lineWidth = w + 1.5;
            ac.beginPath(); ac.moveTo(x, y); ac.lineTo(nx, ny); ac.stroke();

            bc.strokeStyle = '#141414'; bc.lineWidth = w + 1.5;
            bc.beginPath(); bc.moveTo(x, y); bc.lineTo(nx, ny); bc.stroke();

            rc.strokeStyle = '#c8c8c8'; rc.lineWidth = w + 2;
            rc.beginPath(); rc.moveTo(x, y); rc.lineTo(nx, ny); rc.stroke();

            ec.strokeStyle = glow; ec.globalAlpha = 0.5;
            ec.lineWidth = Math.max(0.5, w - 0.6);
            ec.beginPath(); ec.moveTo(x, y); ec.lineTo(nx, ny); ec.stroke();
            ec.globalAlpha = 1;

            crack(nx, ny, ang + (rng() - 0.5) * 1.1, len * (0.6 + rng() * 0.25), depth - 1);
            if (rng() > 0.55) {
                crack(nx, ny, ang + (rng() - 0.5) * 2.2, len * (0.45 + rng() * 0.3), depth - 1);
            }
        }
        for (let i = 0; i < 6; i++) {
            crack(rng() * size, rng() * size, rng() * Math.PI * 2, size * 0.16, 5);
        }

        grime(ac, size, rng, 16, 0.6);
        grain(rc, size, rng, 20);

        return {
            map: toTexture(a, o.rx, o.ry, true),
            bumpMap: toTexture(b, o.rx, o.ry),
            roughnessMap: toTexture(r, o.rx, o.ry),
            emissiveMap: toTexture(e, o.rx, o.ry, true)
        };
    }

    // ------------------------------------------------------------------------
    // 4. CIRCUIT CHASSIS - the player bot and enemy shells
    // ------------------------------------------------------------------------
    function circuitChassis(opts) {
        const o = opts || {};
        const size = o.size || 512;
        const rng = seeded(o.seed || 4242);
        const base = o.base || '#0c1e33';
        const trace = o.trace || '#00f3ff';

        const a = makeCanvas(size), ac = a.getContext('2d');
        const b = makeCanvas(size), bc = b.getContext('2d');
        const r = makeCanvas(size), rc = r.getContext('2d');
        const e = makeCanvas(size), ec = e.getContext('2d');

        const g = ac.createLinearGradient(0, 0, size, size);
        g.addColorStop(0, base);
        g.addColorStop(0.5, '#123049');
        g.addColorStop(1, '#050d18');
        ac.fillStyle = g; ac.fillRect(0, 0, size, size);
        bc.fillStyle = '#808080'; bc.fillRect(0, 0, size, size);
        rc.fillStyle = '#3c3c3c'; rc.fillRect(0, 0, size, size); // glossy armour
        ec.fillStyle = '#000000'; ec.fillRect(0, 0, size, size);

        brush(ac, size, rng, 0.07, '#8fd6ff');
        grain(ac, size, rng, 22);

        // Right-angle PCB traces with solder pads at the ends.
        const gridN = 16;
        const cell = size / gridN;
        for (let i = 0; i < 46; i++) {
            let cx = Math.floor(rng() * gridN) * cell + cell / 2;
            let cy = Math.floor(rng() * gridN) * cell + cell / 2;
            const segs = 2 + Math.floor(rng() * 4);
            const lw = 1.5 + rng() * 2;

            ac.strokeStyle = trace; ac.globalAlpha = 0.5; ac.lineWidth = lw;
            ec.strokeStyle = trace; ec.globalAlpha = 0.9; ec.lineWidth = lw;
            bc.strokeStyle = '#d0d0d0'; bc.lineWidth = lw;
            rc.strokeStyle = '#1e1e1e'; rc.lineWidth = lw + 1;

            ac.beginPath(); ec.beginPath(); bc.beginPath(); rc.beginPath();
            ac.moveTo(cx, cy); ec.moveTo(cx, cy); bc.moveTo(cx, cy); rc.moveTo(cx, cy);
            for (let s = 0; s < segs; s++) {
                const horiz = rng() > 0.5;
                const dist = (1 + Math.floor(rng() * 3)) * cell * (rng() > 0.5 ? 1 : -1);
                if (horiz) cx += dist; else cy += dist;
                ac.lineTo(cx, cy); ec.lineTo(cx, cy); bc.lineTo(cx, cy); rc.lineTo(cx, cy);
            }
            ac.stroke(); ec.stroke(); bc.stroke(); rc.stroke();
            ac.globalAlpha = 1; ec.globalAlpha = 1;

            for (const ctx2 of [ac, ec]) {
                ctx2.fillStyle = trace;
                ctx2.beginPath(); ctx2.arc(cx, cy, lw * 1.8, 0, Math.PI * 2); ctx2.fill();
            }
            bc.fillStyle = '#ffffff';
            bc.beginPath(); bc.arc(cx, cy, lw * 1.8, 0, Math.PI * 2); bc.fill();
        }

        // Armour plate seams over the top of the circuitry.
        ac.strokeStyle = 'rgba(0,0,0,0.7)'; ac.lineWidth = 4;
        bc.strokeStyle = '#303030'; bc.lineWidth = 4;
        for (let i = 1; i < 3; i++) {
            const p = (i / 3) * size;
            ac.beginPath(); ac.moveTo(0, p); ac.lineTo(size, p); ac.stroke();
            bc.beginPath(); bc.moveTo(0, p); bc.lineTo(size, p); bc.stroke();
        }

        scratches(ac, size, rng, 70, '#bde6ff', 0.12);
        grime(ac, size, rng, 10, 0.4);

        return {
            map: toTexture(a, o.rx, o.ry, true),
            bumpMap: toTexture(b, o.rx, o.ry),
            roughnessMap: toTexture(r, o.rx, o.ry),
            emissiveMap: toTexture(e, o.rx, o.ry, true)
        };
    }

    // ------------------------------------------------------------------------
    // 5. PLASMA - spikes, lasers, stargate vortex (emissive energy)
    // ------------------------------------------------------------------------
    function plasma(opts) {
        const o = opts || {};
        const size = o.size || 256;
        const rng = seeded(o.seed || 77);
        const hot = o.hot || '#fff066';
        const cool = o.cool || '#ff0055';

        const a = makeCanvas(size), ac = a.getContext('2d');

        const g = ac.createLinearGradient(0, size, 0, 0);
        g.addColorStop(0, cool);
        g.addColorStop(0.45, cool);
        g.addColorStop(0.8, hot);
        g.addColorStop(1, '#ffffff');
        ac.fillStyle = g;
        ac.fillRect(0, 0, size, size);

        // Vertical energy filaments.
        for (let i = 0; i < 70; i++) {
            ac.globalAlpha = 0.05 + rng() * 0.2;
            ac.strokeStyle = rng() > 0.5 ? '#ffffff' : hot;
            ac.lineWidth = 0.5 + rng() * 2.5;
            const x = rng() * size;
            ac.beginPath();
            ac.moveTo(x, size);
            ac.lineTo(x + (rng() - 0.5) * 30, 0);
            ac.stroke();
        }
        ac.globalAlpha = 1;
        grain(ac, size, rng, 26);

        return { map: toTexture(a, o.rx, o.ry, true) };
    }

    // ------------------------------------------------------------------------
    // 6. HOLO GRID - fake walls / inversion fields
    // ------------------------------------------------------------------------
    function holoGrid(opts) {
        const o = opts || {};
        const size = o.size || 256;
        const rng = seeded(o.seed || 313);
        const line = o.line || '#00f3ff';

        const a = makeCanvas(size), ac = a.getContext('2d');
        ac.fillStyle = '#000814';
        ac.fillRect(0, 0, size, size);

        const cells = 8, step = size / cells;
        ac.strokeStyle = line;
        ac.lineWidth = 2;
        for (let i = 0; i <= cells; i++) {
            const p = i * step;
            ac.globalAlpha = 0.35 + rng() * 0.5;
            ac.beginPath(); ac.moveTo(p, 0); ac.lineTo(p, size); ac.stroke();
            ac.beginPath(); ac.moveTo(0, p); ac.lineTo(size, p); ac.stroke();
        }

        // Horizontal scanline banding.
        ac.globalAlpha = 0.18;
        ac.fillStyle = line;
        for (let y = 0; y < size; y += 4) ac.fillRect(0, y, size, 1);
        ac.globalAlpha = 1;

        return { map: toTexture(a, o.rx, o.ry, true) };
    }

    // ------------------------------------------------------------------------
    // 7. NEBULA - equirectangular scene backdrop
    // ------------------------------------------------------------------------
    function nebula(opts) {
        const o = opts || {};
        const w = o.width || 2048;
        const h = o.height || 1024;
        const rng = seeded(o.seed || 20260906);

        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');

        ctx.fillStyle = '#02040a';
        ctx.fillRect(0, 0, w, h);

        // Broad coloured gas clouds.
        const clouds = ['#1b2a6b', '#4c1d95', '#0e7490', '#831843', '#0f172a'];
        for (let i = 0; i < 46; i++) {
            const x = rng() * w, y = rng() * h;
            const r = (0.06 + rng() * 0.26) * h;
            const col = clouds[Math.floor(rng() * clouds.length)];
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, col);
            g.addColorStop(1, 'rgba(2,4,10,0)');
            ctx.globalAlpha = 0.16 + rng() * 0.22;
            ctx.fillStyle = g;
            ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
        ctx.globalAlpha = 1;

        // Star field with a few bright flares.
        for (let i = 0; i < 2600; i++) {
            const x = rng() * w, y = rng() * h;
            const s = rng();
            const r = s > 0.985 ? 1.6 + rng() * 1.8 : 0.4 + rng() * 0.9;
            ctx.globalAlpha = 0.35 + rng() * 0.65;
            ctx.fillStyle = s > 0.9 ? '#bae6fd' : (s > 0.8 ? '#fde68a' : '#ffffff');
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

            if (r > 1.6) {
                ctx.globalAlpha = 0.25;
                const g = ctx.createRadialGradient(x, y, 0, x, y, r * 7);
                g.addColorStop(0, '#ffffff');
                g.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = g;
                ctx.fillRect(x - r * 7, y - r * 7, r * 14, r * 14);
            }
        }
        ctx.globalAlpha = 1;

        const t = new THREE.CanvasTexture(c);
        t.mapping = THREE.EquirectangularReflectionMapping;
        if (THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding;
        return t;
    }

    // --- Cached public API --------------------------------------------------

    function cached(key, fn, opts) {
        if (!CACHE[key]) CACHE[key] = fn(opts);
        return CACHE[key];
    }

    window.GlitchTextures = {
        metalPanel: (key, opts) => cached('metal:' + key, metalPanel, opts),
        hazardPlate: (key, opts) => cached('hazard:' + key, hazardPlate, opts),
        crackedPlate: (key, opts) => cached('cracked:' + key, crackedPlate, opts),
        circuitChassis: (key, opts) => cached('chassis:' + key, circuitChassis, opts),
        plasma: (key, opts) => cached('plasma:' + key, plasma, opts),
        holoGrid: (key, opts) => cached('holo:' + key, holoGrid, opts),
        nebula: (key, opts) => cached('nebula:' + key, nebula, opts),
        clear: () => { for (const k in CACHE) delete CACHE[k]; }
    };
})();
