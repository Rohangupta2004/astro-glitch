// ============================================================================
// ASTRO GLITCH: QUANTUM HEIST - 3D WEBGL RENDERER (THREE.JS)
// ============================================================================

class ThreeRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 960;
        this.height = 540;
        this.SCALE = 0.05; // 1 2D unit = 0.05 3D world units
        this.DEPTH = 52 * this.SCALE; // Chunky extrusion so platforms read as solid volumes, not slabs

        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Visual Groups
        this.levelGroup = null;
        this.playerGroup = null;
        this.enemiesGroup = null;
        this.powersGroup = null;
        this.starfield = null;

        // Dynamic Elements Map for Fast Frame Updates
        this.platformMeshes = [];
        this.spikeMeshes = [];
        this.doorMesh = null;
        this.realDoorMesh = null;
        this.laserMeshes = [];
        this.blackHoleMeshes = [];
        this.enemyMeshes = [];

        // Lights
        this.playerLight = null;
        this.doorLight = null;
        this.ambientLight = null;
        this.dirLight = null;

        // FX Objects
        this.heatVisionMesh = null;
        this.shieldMesh = null;
        this.slamRingMesh = null;

        // Materials Cache (for performance)
        this.materials = {};

        this.currentGravityRoll = 0;

        this.init();
    }

    init() {
        if (!window.THREE) {
            console.error("Three.js not loaded!");
            return;
        }

        // 1. Scene - textured nebula backdrop instead of a flat clear colour
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x02040a, 0.008);

        if (window.GlitchTextures) {
            this.nebulaTex = GlitchTextures.nebula('sky');
            this.scene.background = this.nebulaTex;
        } else {
            this.scene.background = new THREE.Color(0x02040a);
        }

        // 2. Camera (Perspective for rich 2.5D/3D depth)
        const aspect = this.width / this.height;
        this.camera = new THREE.PerspectiveCamera(46, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 26);
        this.camera.lookAt(0, 0, 0);

        // 3. WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.width, this.height, false);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;

        // Correct colour pipeline so the sRGB texture maps are not washed out.
        if (THREE.sRGBEncoding) this.renderer.outputEncoding = THREE.sRGBEncoding;

        // Real shadows - the single biggest "this is 3D" cue.
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Image-based lighting from the nebula, so metal surfaces reflect the
        // environment instead of reading as flat shaded blocks.
        if (this.nebulaTex && THREE.PMREMGenerator) {
            const pmrem = new THREE.PMREMGenerator(this.renderer);
            pmrem.compileEquirectangularShader();
            this.envMap = pmrem.fromEquirectangular(this.nebulaTex).texture;
            this.scene.environment = this.envMap;
            pmrem.dispose();
        }

        // 4. Lighting Rig - ambient is kept low because the environment map
        // now supplies most of the soft fill.
        this.ambientLight = new THREE.AmbientLight(0x2b3a52, 1.5);
        this.scene.add(this.ambientLight);

        this.dirLight = new THREE.DirectionalLight(0xa5f3fc, 1.8);
        this.dirLight.position.set(15, 25, 20);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.set(2048, 2048);
        this.dirLight.shadow.camera.near = 1;
        this.dirLight.shadow.camera.far = 90;
        this.dirLight.shadow.camera.left = -30;
        this.dirLight.shadow.camera.right = 30;
        this.dirLight.shadow.camera.top = 22;
        this.dirLight.shadow.camera.bottom = -22;
        this.dirLight.shadow.bias = -0.0008;
        this.dirLight.shadow.normalBias = 0.02;
        this.scene.add(this.dirLight);

        const fillLight = new THREE.DirectionalLight(0xd946ef, 0.8);
        fillLight.position.set(-20, -10, 10);
        this.scene.add(fillLight);

        // Rim light from behind. This separates each platform's silhouette from
        // the backdrop and stops the scene reading as flat cutouts.
        const rimLight = new THREE.DirectionalLight(0x7dd3fc, 1.5);
        rimLight.position.set(-8, 6, -20);
        this.scene.add(rimLight);

        // Player point light (dynamic follower)
        this.playerLight = new THREE.PointLight(0x00f3ff, 2.0, 12);
        this.playerLight.position.set(0, 0, 2);
        this.scene.add(this.playerLight);

        // Stargate point light
        this.doorLight = new THREE.PointLight(0x00f3ff, 3.5, 18);
        this.doorLight.position.set(0, 0, 2);
        this.scene.add(this.doorLight);

        // 5. Build Reusable Materials
        this.createMaterials();

        // 6. Groups
        this.levelGroup = new THREE.Group();
        this.scene.add(this.levelGroup);

        this.playerGroup = new THREE.Group();
        this.scene.add(this.playerGroup);

        this.enemiesGroup = new THREE.Group();
        this.scene.add(this.enemiesGroup);

        this.powersGroup = new THREE.Group();
        this.scene.add(this.powersGroup);

        // 7. Background Starfield & Galactic Nebulae
        this.createStarfield();

        // 8. Build Player 3D Character ("Byte")
        this.buildPlayerModel();

        // 9. Build Superpower 3D FX
        this.buildPowerFX();
    }

    // Rescale a BoxGeometry's UVs so a tiling texture keeps a constant
    // real-world size regardless of how wide or tall the box is. Face order in
    // a BoxGeometry is +X, -X, +Y, -Y, +Z, -Z (4 verts each), and each face
    // needs a different pair of dimensions mapped to U and V.
    tileUVs(geo, w, h, tileSize) {
        const uv = geo.attributes.uv;
        if (!uv) return;

        const d = this.DEPTH;
        const su = [d, d, w, w, w, w];
        const sv = [h, h, d, d, h, h];

        for (let face = 0; face < 6; face++) {
            const ru = Math.max(0.25, su[face] / tileSize);
            const rv = Math.max(0.25, sv[face] / tileSize);
            for (let i = 0; i < 4; i++) {
                const idx = face * 4 + i;
                uv.setXY(idx, uv.getX(idx) * ru, uv.getY(idx) * rv);
            }
        }
        uv.needsUpdate = true;
    }

    createMaterials() {
        const T = window.GlitchTextures;

        // Platform Standard - textured hull plating (albedo + bump + roughness
        // + emissive accent strips). Falls back to flat shading if the texture
        // library failed to load.
        const hull = T && T.metalPanel('hull', { seed: 1337, cells: 4, base: '#33425c', dark: '#1b2537' });
        this.materials.platSolid = new THREE.MeshStandardMaterial(Object.assign({
            color: 0xffffff,
            // Fully metallic surfaces go black without strong reflections, so
            // this sits mid-range and leans on the env map for its highlights.
            metalness: 0.55,
            roughness: 0.45,
            envMapIntensity: 1.5,
            emissive: 0x00f3ff,
            emissiveIntensity: 0.6,
            bumpScale: 0.035
        }, hull || { color: 0x161d2b, metalness: 0.85, roughness: 0.25 }));

        // Platform Highlight Top Trim. Kept deliberately dim: this strip runs
        // the full width of every platform, and at full emissive ACES tone
        // mapping clipped it to solid white, hiding the hull texture below.
        this.materials.platEdge = new THREE.MeshStandardMaterial({
            color: 0x0b7c8c,
            emissive: 0x00f3ff,
            emissiveIntensity: 0.35,
            metalness: 0.9,
            roughness: 0.3
        });

        // Collapsing Platform - fractured plating with glowing stress cracks
        const cracked = T && T.crackedPlate('collapse', { seed: 5521 });
        this.materials.platCollapse = new THREE.MeshStandardMaterial(Object.assign({
            color: 0xffffff,
            metalness: 0.7,
            roughness: 0.55,
            emissive: 0xff0055,
            emissiveIntensity: 0.55,
            bumpScale: 0.045
        }, cracked || { color: 0x241926, metalness: 0.7, roughness: 0.35 }));

        this.materials.platCollapseTriggered = new THREE.MeshStandardMaterial(Object.assign({
            color: 0xff6688,
            metalness: 0.7,
            roughness: 0.5,
            emissive: 0xff0055,
            emissiveIntensity: 2.4,
            bumpScale: 0.045
        }, cracked || { color: 0xff0055 }));

        // Destructible Platform - bolted hazard plating
        const hazard = T && T.hazardPlate('destruct', { seed: 907 });
        this.materials.platDestruct = new THREE.MeshStandardMaterial(Object.assign({
            color: 0xffffff,
            metalness: 0.8,
            roughness: 0.5,
            emissive: 0xd97706,
            emissiveIntensity: 0.7,
            bumpScale: 0.04
        }, hazard || { color: 0x1e293b, metalness: 0.8, roughness: 0.3 }));

        // Inversion Field (Translucent glitch purple holo-grid)
        const invGrid = T && T.holoGrid('inversion', { seed: 606, line: '#a855f7' });
        this.materials.inversionZone = new THREE.MeshStandardMaterial({
            map: invGrid ? invGrid.map : null,
            color: 0xa855f7,
            emissive: 0xa855f7,
            emissiveMap: invGrid ? invGrid.map : null,
            emissiveIntensity: 0.9,
            transparent: true,
            opacity: 0.4,
            roughness: 0.1,
            metalness: 0.1
        });

        // Fake Wall (Holographic Cyan scanline grid)
        const holo = T && T.holoGrid('fakewall', { seed: 313, line: '#00f3ff' });
        this.materials.fakeWall = new THREE.MeshStandardMaterial({
            map: holo ? holo.map : null,
            color: 0x00f3ff,
            emissive: 0x00f3ff,
            emissiveMap: holo ? holo.map : null,
            emissiveIntensity: 1.0,
            transparent: true,
            opacity: 0.38
        });

        // Plasma Spike Material (Hot magenta-yellow energy blade)
        const plasmaTex = T && T.plasma('spike', { seed: 77 });
        this.materials.spikePlasma = new THREE.MeshStandardMaterial({
            map: plasmaTex ? plasmaTex.map : null,
            emissiveMap: plasmaTex ? plasmaTex.map : null,
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 2.4,
            roughness: 0.25,
            metalness: 0.4
        });

        this.materials.spikeCore = new THREE.MeshBasicMaterial({
            color: 0xfff066
        });

        // Spike Base - same hull plating, tighter tiling
        const baseTex = T && T.metalPanel('spikebase', { seed: 4801, cells: 2, base: '#0f172a', dark: '#060b14' });
        this.materials.spikeBase = new THREE.MeshStandardMaterial(Object.assign({
            color: 0xffffff,
            metalness: 0.9,
            roughness: 0.4,
            bumpScale: 0.03
        }, baseTex || { color: 0x0f172a, metalness: 0.9, roughness: 0.2 }));

        // Player / enemy chassis - PCB traces under armour plating
        const chassis = T && T.circuitChassis('bot', { seed: 4242 });
        this.materials.chassis = new THREE.MeshStandardMaterial(Object.assign({
            color: 0xffffff,
            metalness: 0.88,
            roughness: 0.35,
            emissive: 0x00f3ff,
            emissiveIntensity: 0.9,
            bumpScale: 0.03
        }, chassis || { color: 0x0c1e33, metalness: 0.85, roughness: 0.2 }));
    }

    createStarfield() {
        // Thousands of glowing 3D stars distributed in depth
        const starGeo = new THREE.BufferGeometry();
        const count = 1200;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const palette = [
            new THREE.Color(0xffffff),
            new THREE.Color(0xdbeafe),
            new THREE.Color(0x93c5fd),
            new THREE.Color(0xfde68a),
            new THREE.Color(0xa5f3fc)
        ];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 2] = -15 - Math.random() * 45;

            const col = palette[Math.floor(Math.random() * palette.length)];
            colors[i * 3] = col.r;
            colors[i * 3 + 1] = col.g;
            colors[i * 3 + 2] = col.b;
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const starMat = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            fog: false
        });

        this.starfield = new THREE.Points(starGeo, starMat);
        this.scene.add(this.starfield);

        // Backdrop: a real textured hull wall well behind the play plane.
        // (A wireframe GridHelper used to live here - it read as a 90s OpenGL
        // demo and flattened the whole scene, so it is gone.)
        const T = window.GlitchTextures;
        const wallTex = T && T.metalPanel('backwall', {
            seed: 8821, cells: 3, base: '#0d1420', dark: '#05080f', rx: 14, ry: 8
        });
        const wallMat = new THREE.MeshStandardMaterial(Object.assign({
            color: 0xffffff,
            metalness: 0.75,
            roughness: 0.62,
            bumpScale: 0.06,
            emissiveIntensity: 0.35
        }, wallTex || { color: 0x0d1420 }));
        wallMat.emissive = new THREE.Color(0x00f3ff);

        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(150, 80), wallMat);
        backWall.position.set(0, 0, -34);
        backWall.receiveShadow = true;
        this.scene.add(backWall);

        // Deck plate running under the play plane, catching the key light so
        // platforms cast visible shadows onto something.
        const deckTex = T && T.metalPanel('deck', {
            seed: 3312, cells: 3, base: '#0a1018', dark: '#04070c', rx: 18, ry: 6
        });
        const deckMat = new THREE.MeshStandardMaterial(Object.assign({
            color: 0xffffff,
            metalness: 0.85,
            roughness: 0.45,
            bumpScale: 0.05
        }, deckTex || { color: 0x0a1018 }));

        const deck = new THREE.Mesh(new THREE.PlaneGeometry(160, 60), deckMat);
        deck.rotation.x = -Math.PI / 2;
        deck.position.set(0, -19, -10);
        deck.receiveShadow = true;
        this.scene.add(deck);
    }

    // --- PROCEDURAL 3D PLAYER MODEL ("BYTE") ---

    buildPlayerModel() {
        this.playerMesh = new THREE.Group();

        // 1. Torso Chassis (Chamfered Cyber Cube)
        const bodyGeo = new THREE.BoxGeometry(1.4, 1.4, 1.1);
        this.playerBodyMat = this.materials.chassis.clone();
        this.playerBodyMat.emissiveIntensity = 0.7;
        const bodyMesh = new THREE.Mesh(bodyGeo, this.playerBodyMat);
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        this.playerMesh.add(bodyMesh);

        // Body Neon Edge Trim
        const edgeGeo = new THREE.EdgesGeometry(bodyGeo);
        this.playerEdgeMat = new THREE.LineBasicMaterial({ color: 0x00f3ff, linewidth: 2 });
        const edgeLines = new THREE.LineSegments(edgeGeo, this.playerEdgeMat);
        this.playerMesh.add(edgeLines);

        // 2. Front Optic Visor
        const visorGeo = new THREE.BoxGeometry(1.05, 0.48, 0.2);
        const visorMat = new THREE.MeshStandardMaterial({
            color: 0x020712,
            metalness: 0.95,
            roughness: 0.1,
            emissive: 0x01050d
        });
        const visorMesh = new THREE.Mesh(visorGeo, visorMat);
        visorMesh.position.set(0, 0.12, 0.54);
        this.playerMesh.add(visorMesh);

        // 3. LED Eyes
        const eyeGeo = new THREE.BoxGeometry(0.18, 0.22, 0.08);
        this.playerEyeMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });

        this.leftEye = new THREE.Mesh(eyeGeo, this.playerEyeMat);
        this.leftEye.position.set(-0.25, 0.12, 0.62);
        this.playerMesh.add(this.leftEye);

        this.rightEye = new THREE.Mesh(eyeGeo, this.playerEyeMat);
        this.rightEye.position.set(0.25, 0.12, 0.62);
        this.playerMesh.add(this.rightEye);

        // 4. Comms Antenna with Pulsing Beacon
        const antStemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
        const antStemMat = new THREE.MeshStandardMaterial({ color: 0x00f3ff, metalness: 0.9 });
        const antStem = new THREE.Mesh(antStemGeo, antStemMat);
        antStem.position.set(0, 0.95, 0);
        this.playerMesh.add(antStem);

        const beaconGeo = new THREE.SphereGeometry(0.14, 16, 16);
        this.beaconMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
        this.beaconMesh = new THREE.Mesh(beaconGeo, this.beaconMat);
        this.beaconMesh.position.set(0, 1.25, 0);
        this.playerMesh.add(this.beaconMesh);

        // 5. Thruster Jet Cone at bottom
        const thrusterGeo = new THREE.ConeGeometry(0.22, 0.35, 12);
        thrusterGeo.rotateX(Math.PI);
        this.thrusterFlameMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
        this.thrusterMesh = new THREE.Mesh(thrusterGeo, this.thrusterFlameMat);
        this.thrusterMesh.position.set(0, -0.85, 0);
        this.playerMesh.add(this.thrusterMesh);

        this.playerGroup.add(this.playerMesh);
    }

    // --- SUPERHERO 3D FX ---

    buildPowerFX() {
        // 1. Heat Vision Laser Beams (Twin Cylinders extending forward)
        const laserGeo = new THREE.CylinderGeometry(0.09, 0.09, 45, 12);
        laserGeo.rotateZ(Math.PI / 2);
        const laserMat = new THREE.MeshBasicMaterial({
            color: 0xff0055,
            transparent: true,
            opacity: 0.95
        });
        this.heatVisionMesh = new THREE.Mesh(laserGeo, laserMat);
        this.heatVisionMesh.visible = false;
        this.powersGroup.add(this.heatVisionMesh);

        // Heat Vision Core White Beam
        const laserCoreGeo = new THREE.CylinderGeometry(0.04, 0.04, 45, 8);
        laserCoreGeo.rotateZ(Math.PI / 2);
        const laserCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.heatVisionCore = new THREE.Mesh(laserCoreGeo, laserCoreMat);
        this.heatVisionMesh.add(this.heatVisionCore);

        // 2. Aegis Shield (Pulsing Geodesic Forcefield Sphere)
        const shieldGeo = new THREE.IcosahedronGeometry(1.6, 2);
        this.shieldMat = new THREE.MeshStandardMaterial({
            color: 0x00f3ff,
            emissive: 0x00f3ff,
            emissiveIntensity: 1.5,
            transparent: true,
            opacity: 0.45,
            wireframe: true,
            roughness: 0.1
        });
        this.shieldMesh = new THREE.Mesh(shieldGeo, this.shieldMat);
        this.shieldMesh.visible = false;
        this.powersGroup.add(this.shieldMesh);

        // Inner translucent shell for shield
        const shieldInnerGeo = new THREE.SphereGeometry(1.4, 24, 24);
        const shieldInnerMat = new THREE.MeshBasicMaterial({
            color: 0x00f3ff,
            transparent: true,
            opacity: 0.22,
            side: THREE.BackSide
        });
        this.shieldInnerMesh = new THREE.Mesh(shieldInnerGeo, shieldInnerMat);
        this.shieldMesh.add(this.shieldInnerMesh);

        // 3. Thunder Slam Shockwave (Expanding 3D Ground Ring)
        const slamGeo = new THREE.RingGeometry(0.3, 0.8, 32);
        slamGeo.rotateX(-Math.PI / 2);
        this.slamMat = new THREE.MeshBasicMaterial({
            color: 0xffe600,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        this.slamRingMesh = new THREE.Mesh(slamGeo, this.slamMat);
        this.slamRingMesh.visible = false;
        this.powersGroup.add(this.slamRingMesh);
    }

    // --- BUILD LEVEL GEOMETRY ---

    buildLevel(levelData) {
        if (!levelData) return;

        // Clear existing level meshes
        while (this.levelGroup.children.length > 0) {
            const obj = this.levelGroup.children[0];
            this.levelGroup.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
        }

        while (this.enemiesGroup.children.length > 0) {
            const obj = this.enemiesGroup.children[0];
            this.enemiesGroup.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
        }

        this.platformMeshes = [];
        this.spikeMeshes = [];
        this.doorMesh = null;
        this.realDoorMesh = null;
        this.laserMeshes = [];
        this.blackHoleMeshes = [];
        this.enemyMeshes = [];

        // 1. Build Platforms
        for (let i = 0; i < levelData.platforms.length; i++) {
            const plat = levelData.platforms[i];
            const w = plat.width * this.SCALE;
            const h = plat.height * this.SCALE;
            const d = this.DEPTH;

            const boxGeo = new THREE.BoxGeometry(w, h, d);

            // Tile the texture by world size rather than stretching one copy
            // across the whole platform. Materials are shared, so the repeat
            // has to live in the geometry's UVs.
            this.tileUVs(boxGeo, w, h, 0.85);

            let mat = this.materials.platSolid;

            if (plat.type === 'collapse') {
                mat = this.materials.platCollapse;
            } else if (plat.type === 'destructible') {
                mat = this.materials.platDestruct;
            } else if (plat.type === 'inversion_zone') {
                mat = this.materials.inversionZone;
            } else if (plat.type === 'fake_wall') {
                mat = this.materials.fakeWall;
            }

            const mesh = new THREE.Mesh(boxGeo, mat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            const x3d = (plat.x + plat.width / 2 - 480) * this.SCALE;
            const y3d = -(plat.y + plat.height / 2 - 270) * this.SCALE;
            mesh.position.set(x3d, y3d, 0);

            // Add top beveled glowing trim line to normal platforms
            if (plat.type === 'solid' || plat.type === 'moving_h') {
                // Inset from the front face so it reads as a recessed light
                // channel in the plating, not a glowing bar laid on top.
                const trimGeo = new THREE.BoxGeometry(w * 0.97, 0.05, d * 0.55);
                const trimMesh = new THREE.Mesh(trimGeo, this.materials.platEdge);
                trimMesh.position.set(0, h / 2 - 0.025, 0);
                mesh.add(trimMesh);
            }

            this.levelGroup.add(mesh);
            this.platformMeshes.push({ mesh, data: plat });
        }

        // 2. Build Spikes (Anti-Matter Plasma Nodes)
        for (let i = 0; i < levelData.spikes.length; i++) {
            const spike = levelData.spikes[i];
            const isDown = spike.dir === 'down';
            const count = Math.max(1, Math.round(spike.width / 20));
            const nodeW = spike.width / count;
            const spikeGroup = new THREE.Group();

            for (let c = 0; c < count; c++) {
                const coneH = spike.height * this.SCALE;
                const coneRadius = (nodeW * 0.45) * this.SCALE;

                // Glowing Plasma Blade (Cone)
                const coneGeo = new THREE.ConeGeometry(coneRadius, coneH, 4);
                if (isDown) coneGeo.rotateX(Math.PI);
                const coneMesh = new THREE.Mesh(coneGeo, this.materials.spikePlasma);

                const offX = (c * nodeW + nodeW / 2) * this.SCALE;
                coneMesh.position.set(offX, isDown ? -coneH / 2 : coneH / 2, 0);
                spikeGroup.add(coneMesh);

                // Base Tech Emitter Box
                const baseGeo = new THREE.BoxGeometry(nodeW * 0.9 * this.SCALE, 0.18, this.DEPTH);
                const baseMesh = new THREE.Mesh(baseGeo, this.materials.spikeBase);
                baseMesh.position.set(offX, isDown ? 0.09 : -0.09, 0);
                spikeGroup.add(baseMesh);
            }

            const x3d = (spike.x - 480) * this.SCALE;
            const y3d = -(spike.y + (isDown ? 0 : spike.height) - 270) * this.SCALE;
            spikeGroup.position.set(x3d, y3d, 0);

            if (spike.isHidden) {
                spikeGroup.visible = false;
            }

            this.levelGroup.add(spikeGroup);
            this.spikeMeshes.push({ group: spikeGroup, data: spike });
        }

        // 3. Build Stargate (The Door)
        if (levelData.door) {
            this.doorMesh = this.createStargateMesh(levelData.door, !levelData.door.isFakeTroll);
            this.levelGroup.add(this.doorMesh);
        }

        if (levelData.realDoor) {
            this.realDoorMesh = this.createStargateMesh(levelData.realDoor, true);
            this.realDoorMesh.visible = !!levelData.realDoor.isRevealed;
            this.levelGroup.add(this.realDoorMesh);
        }

        // 4. Build Black Holes
        if (levelData.blackHoles) {
            for (const bh of levelData.blackHoles) {
                const bhGroup = new THREE.Group();
                const radius3D = bh.radius * this.SCALE;

                // Event Horizon Singularity (Jet Black Sphere)
                const singGeo = new THREE.SphereGeometry(radius3D * 0.35, 24, 24);
                const singMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
                const singMesh = new THREE.Mesh(singGeo, singMat);
                bhGroup.add(singMesh);

                // Swirling Accretion Disk (Two Concentric Glowing Rings)
                const disk1Geo = new THREE.RingGeometry(radius3D * 0.45, radius3D * 0.65, 32);
                const disk1Mat = new THREE.MeshBasicMaterial({
                    color: 0xd946ef,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.85
                });
                const disk1 = new THREE.Mesh(disk1Geo, disk1Mat);
                bhGroup.add(disk1);

                const disk2Geo = new THREE.RingGeometry(radius3D * 0.72, radius3D * 0.95, 32);
                const disk2Mat = new THREE.MeshBasicMaterial({
                    color: 0x00f3ff,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.65
                });
                const disk2 = new THREE.Mesh(disk2Geo, disk2Mat);
                bhGroup.add(disk2);

                const x3d = (bh.x - 480) * this.SCALE;
                const y3d = -(bh.y - 270) * this.SCALE;
                bhGroup.position.set(x3d, y3d, 0);

                this.levelGroup.add(bhGroup);
                this.blackHoleMeshes.push({ group: bhGroup, disk1, disk2, data: bh });
            }
        }

        // 5. Build Lasers
        if (levelData.lasers) {
            for (const laser of levelData.lasers) {
                const lGroup = new THREE.Group();
                const beamW = (laser.width || 6) * this.SCALE;
                const beamH = (laser.height || 400) * this.SCALE;

                const beamGeo = new THREE.BoxGeometry(beamW, beamH, this.DEPTH * 0.8);
                const beamMat = new THREE.MeshBasicMaterial({
                    color: 0xff0055,
                    transparent: true,
                    opacity: 0.9
                });
                const beamMesh = new THREE.Mesh(beamGeo, beamMat);

                // White Core
                const coreGeo = new THREE.BoxGeometry(beamW * 0.35, beamH, this.DEPTH * 0.9);
                const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
                const coreMesh = new THREE.Mesh(coreGeo, coreMat);
                beamMesh.add(coreMesh);

                lGroup.add(beamMesh);

                const x3d = (laser.x + laser.width / 2 - 480) * this.SCALE;
                const y3d = -(laser.y + laser.height / 2 - 270) * this.SCALE;
                lGroup.position.set(x3d, y3d, 0);

                this.levelGroup.add(lGroup);
                this.laserMeshes.push({ group: lGroup, mesh: beamMesh, data: laser });
            }
        }

        // 6. Build Enemies (Smolly & Ghost)
        if (levelData.enemies) {
            for (const enemy of levelData.enemies) {
                const eMesh = this.createEnemyMesh(enemy);
                this.enemiesGroup.add(eMesh);
                this.enemyMeshes.push({ group: eMesh, data: enemy });
            }
        }
    }

    createStargateMesh(doorData, isReal = true) {
        const group = new THREE.Group();
        const dw = doorData.width * this.SCALE;
        const dh = doorData.height * this.SCALE;

        // 1. Metallic Arch Frame (Pylons)
        const frameColor = isReal ? 0x00f3ff : 0xff0055;
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            metalness: 0.9,
            roughness: 0.2,
            emissive: frameColor,
            emissiveIntensity: 0.5
        });

        const leftPylonGeo = new THREE.BoxGeometry(0.35, dh, this.DEPTH * 1.2);
        const leftPylon = new THREE.Mesh(leftPylonGeo, frameMat);
        leftPylon.position.set(-dw / 2, 0, 0);
        group.add(leftPylon);

        const rightPylonGeo = new THREE.BoxGeometry(0.35, dh, this.DEPTH * 1.2);
        const rightPylon = new THREE.Mesh(rightPylonGeo, frameMat);
        rightPylon.position.set(dw / 2, 0, 0);
        group.add(rightPylon);

        const topArchGeo = new THREE.BoxGeometry(dw + 0.35, 0.45, this.DEPTH * 1.2);
        const topArch = new THREE.Mesh(topArchGeo, frameMat);
        topArch.position.set(0, dh / 2, 0);
        group.add(topArch);

        // 2. Swirling Event Horizon Disc
        const vortexGeo = new THREE.CircleGeometry(Math.min(dw, dh) * 0.44, 32);
        const vortexMat = new THREE.MeshBasicMaterial({
            color: isReal ? 0x00f3ff : 0xff0055,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide
        });
        const vortex = new THREE.Mesh(vortexGeo, vortexMat);
        vortex.position.set(0, 0, 0.05);
        group.add(vortex);
        group.userData.vortex = vortex;

        // Inner White Core
        const coreGeo = new THREE.CircleGeometry(Math.min(dw, dh) * 0.2, 24);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(0, 0, 0.08);
        group.add(core);

        // Rotating Gyro Ring
        const ringGeo = new THREE.TorusGeometry(Math.min(dw, dh) * 0.38, 0.06, 12, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: isReal ? 0x38bdf8 : 0xffa0c0 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(0, 0, 0.1);
        group.add(ring);
        group.userData.ring = ring;

        const x3d = (doorData.x + doorData.width / 2 - 480) * this.SCALE;
        const y3d = -(doorData.y + doorData.height / 2 - 270) * this.SCALE;
        group.position.set(x3d, y3d, 0);

        return group;
    }

    createEnemyMesh(enemyData) {
        const group = new THREE.Group();
        const ew = enemyData.width * this.SCALE;
        const eh = enemyData.height * this.SCALE;

        if (enemyData.type === 'smolly') {
            // Sentry-X Mecha Orb (Red armored drone)
            const hullGeo = new THREE.SphereGeometry(ew * 0.6, 20, 20);
            const hullMat = new THREE.MeshStandardMaterial({
                color: 0x450a1b,
                metalness: 0.85,
                roughness: 0.25,
                emissive: 0x831843,
                emissiveIntensity: 0.6
            });
            const hull = new THREE.Mesh(hullGeo, hullMat);
            group.add(hull);

            // Red Optic Scanner Eye
            const eyeGeo = new THREE.SphereGeometry(ew * 0.25, 16, 16);
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(0, 0, ew * 0.48);
            group.add(eye);

            // Sparking Pincers (Side metallic horns)
            const pincerGeo = new THREE.ConeGeometry(0.12, 0.45, 8);
            pincerGeo.rotateZ(-Math.PI / 2);
            const pincerMat = new THREE.MeshStandardMaterial({ color: 0xffe600, metalness: 0.9 });

            const leftPincer = new THREE.Mesh(pincerGeo, pincerMat);
            leftPincer.position.set(-ew * 0.7, 0, 0);
            group.add(leftPincer);

            const rightPincer = new THREE.Mesh(pincerGeo, pincerMat);
            rightPincer.rotation.y = Math.PI;
            rightPincer.position.set(ew * 0.7, 0, 0);
            group.add(rightPincer);

        } else if (enemyData.type === 'ghost') {
            // Quantum Phantasm (Holographic glitch dome with ripples)
            const domeGeo = new THREE.SphereGeometry(ew * 0.55, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
            const domeMat = new THREE.MeshStandardMaterial({
                color: 0x00f3ff,
                emissive: 0x00f3ff,
                emissiveIntensity: 0.9,
                transparent: true,
                opacity: 0.45,
                wireframe: true
            });
            const dome = new THREE.Mesh(domeGeo, domeMat);
            dome.position.set(0, eh * 0.1, 0);
            group.add(dome);

            // Glowing blue eyes
            const gEyeGeo = new THREE.SphereGeometry(0.1, 12, 12);
            const gEyeMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
            const leftGEye = new THREE.Mesh(gEyeGeo, gEyeMat);
            leftGEye.position.set(-0.2, 0.1, ew * 0.45);
            group.add(leftGEye);

            const rightGEye = new THREE.Mesh(gEyeGeo, gEyeMat);
            rightGEye.position.set(0.2, 0.1, ew * 0.45);
            group.add(rightGEye);
        }

        const x3d = (enemyData.x + enemyData.width / 2 - 480) * this.SCALE;
        const y3d = -(enemyData.y + enemyData.height / 2 - 270) * this.SCALE;
        group.position.set(x3d, y3d, 0);

        return group;
    }

    // --- MAIN RENDER FRAME ---

    render(game) {
        if (!this.renderer || !this.scene || !this.camera) return;

        const time = Date.now() * 0.003;
        const p = game.player;

        // 1. Update Player 3D Position & Pose
        if (!game.isDead && p) {
            this.playerMesh.visible = true;

            const px = (p.x + p.width / 2 - 480) * this.SCALE;
            const py = -(p.y + p.height / 2 - 270) * this.SCALE;

            this.playerMesh.position.set(px, py, 0);

            // Dynamic Tilt & Squash/Stretch
            const tilt = Math.max(-0.25, Math.min(0.25, -p.vx * 0.025));
            this.playerMesh.rotation.z = tilt;

            // Upside Down Gravity Inversion
            this.playerMesh.rotation.x = p.gravityDir === -1 ? Math.PI : 0;

            // Facing Direction
            const faceRotY = (p.faceDir || 1) < 0 ? Math.PI : 0;
            this.playerMesh.rotation.y = faceRotY;

            this.playerMesh.scale.set(p.scaleX || 1, p.scaleY || 1, 1);

            // Antenna beacon pulse
            const pulse = (Math.sin(time * 6) + 1) * 0.5;
            this.beaconMat.color.setHex(pulse > 0.5 ? 0x00f3ff : 0xffe600);

            // Eye Blink
            const eyeH = p.isBlinking ? 0.04 : 0.22;
            this.leftEye.scale.set(1, eyeH / 0.22, 1);
            this.rightEye.scale.set(1, eyeH / 0.22, 1);

            // Phase Shift FX (Hologram Mode)
            if (p.isPhasing) {
                this.playerBodyMat.wireframe = true;
                this.playerBodyMat.emissive.setHex(0x00f3ff);
                this.playerBodyMat.emissiveIntensity = 2.0;
            } else {
                this.playerBodyMat.wireframe = false;
                // Restore the chassis circuit glow, not the old flat tint.
                this.playerBodyMat.emissive.setHex(0x00f3ff);
                this.playerBodyMat.emissiveIntensity = 0.7;
            }

            // Thruster flame visibility
            this.thrusterMesh.visible = p.grounded && Math.abs(p.vx) > 0.4;

            // Point light follows player
            this.playerLight.position.set(px, py, 2.5);
            this.playerLight.color.setHex(p.isPhasing ? 0xffffff : 0x00f3ff);

            // --- Superhero 3D Effects ---

            // A. Heat Vision Beams
            if (game.powers.heatVisionTimer > 0) {
                this.heatVisionMesh.visible = true;
                const dir = (p.faceDir || 1);
                const beamX = px + dir * 22.5;
                this.heatVisionMesh.position.set(beamX, py + 0.1, 0.6);
            } else {
                this.heatVisionMesh.visible = false;
            }

            // B. Aegis Shield Bubble
            if (game.powers.shieldActive) {
                this.shieldMesh.visible = true;
                this.shieldMesh.position.set(px, py, 0);
                this.shieldMesh.rotation.y = time * 2;
                this.shieldMesh.rotation.x = time * 1.5;
            } else {
                this.shieldMesh.visible = false;
            }

            // C. Thunder Slam Ring
            if (game.powers.isSlamming) {
                this.slamRingMesh.visible = true;
                this.slamRingMesh.position.set(px, py - 0.7, 0.2);
                this.slamRingMesh.scale.set(1.5, 1.5, 1.5);
            } else {
                this.slamRingMesh.visible = false;
            }

        } else {
            this.playerMesh.visible = false;
        }

        // 2. Update Stargate Portals (Spinning vortex)
        if (this.doorMesh) {
            const doorData = game.level.door;
            if (doorData) {
                const dx = (doorData.x + doorData.width / 2 - 480) * this.SCALE;
                const dy = -(doorData.y + doorData.height / 2 - 270) * this.SCALE;
                this.doorMesh.position.set(dx, dy, 0);

                if (this.doorMesh.userData.vortex) {
                    this.doorMesh.userData.vortex.rotation.z = time * 2;
                }
                if (this.doorMesh.userData.ring) {
                    this.doorMesh.userData.ring.rotation.x = time * 3;
                    this.doorMesh.userData.ring.rotation.y = time * 1.5;
                }

                this.doorLight.position.set(dx, dy, 2.5);
            }
        }

        if (this.realDoorMesh && game.level.realDoor) {
            this.realDoorMesh.visible = !!game.level.realDoor.isRevealed;
            if (this.realDoorMesh.visible) {
                const rdx = (game.level.realDoor.x + game.level.realDoor.width / 2 - 480) * this.SCALE;
                const rdy = -(game.level.realDoor.y + game.level.realDoor.height / 2 - 270) * this.SCALE;
                this.realDoorMesh.position.set(rdx, rdy, 0);
                if (this.realDoorMesh.userData.vortex) {
                    this.realDoorMesh.userData.vortex.rotation.z = time * 2;
                }
            }
        }

        // 3. Update Platforms (Positions, Collapsing, Destructible)
        for (const item of this.platformMeshes) {
            const plat = item.data;
            const px = (plat.x + (plat.offsetX || 0) + plat.width / 2 - 480) * this.SCALE;
            const py = -(plat.y + plat.height / 2 - 270) * this.SCALE;
            item.mesh.position.set(px, py, 0);

            if (plat.opacity === 0 || (plat.type === 'destructible' && plat.isBroken)) {
                item.mesh.visible = false;
            } else {
                item.mesh.visible = true;
                if (plat.type === 'collapse') {
                    item.mesh.material = plat.isTriggered ? this.materials.platCollapseTriggered : this.materials.platCollapse;
                }
            }
        }

        // 4. Update Spikes (Popups)
        for (const item of this.spikeMeshes) {
            const spike = item.data;
            if (spike.isHidden) {
                item.group.visible = false;
            } else {
                item.group.visible = true;
                const isDown = spike.dir === 'down';
                const sx = (spike.x - 480) * this.SCALE;
                const sy = -(spike.y + (isDown ? 0 : spike.height) - 270) * this.SCALE;
                item.group.position.set(sx, sy, 0);
            }
        }

        // 5. Update Black Holes (Spinning Accretion Disks)
        for (const item of this.blackHoleMeshes) {
            if (item.disk1) item.disk1.rotation.z = time * 1.8;
            if (item.disk2) item.disk2.rotation.z = -time * 1.2;
        }

        // 6. Update Lasers (Pulse / Flicker / Active State)
        for (const item of this.laserMeshes) {
            const laser = item.data;
            item.group.visible = !!laser.active;
            if (laser.active) {
                const pulse = (Math.sin(time * 20) + 1) * 0.15 + 0.85;
                item.mesh.scale.set(pulse, 1, pulse);
            }
        }

        // 7. Update Enemies (Smolly Patrol & Ghost Floating)
        for (const item of this.enemyMeshes) {
            const enemy = item.data;
            const ew = enemy.width * this.SCALE;
            const eh = enemy.height * this.SCALE;
            const ex = (enemy.x + enemy.width / 2 - 480) * this.SCALE;
            const ey = -(enemy.y - (enemy.hop || 0) + enemy.height / 2 - 270) * this.SCALE;
            item.group.position.set(ex, ey, 0.3);

            if (enemy.type === 'smolly') {
                item.group.rotation.y = (enemy.dir || 1) > 0 ? 0 : Math.PI;
                item.group.rotation.z = Math.sin(time * 10) * 0.1;
            } else if (enemy.type === 'ghost') {
                item.group.position.y += Math.sin(time * 4) * 0.2;
                item.group.rotation.y = (enemy.faceDir || 1) > 0 ? 0 : Math.PI;
            }
        }

        // 8. Slowly Rotate Galactic Starfield
        if (this.starfield) {
            this.starfield.rotation.y = time * 0.02;
            this.starfield.rotation.x = time * 0.01;
        }

        // 9. Camera Tracking with 2.5D Isometric Tilt & Zero-G Gravity Roll
        const targetCamX = (p.x + p.width / 2 - 480) * this.SCALE * 0.35 + (game.camera.offsetX * this.SCALE);
        const targetCamY = -(p.y + p.height / 2 - 270) * this.SCALE * 0.35 + 1.2 + (game.camera.offsetY * this.SCALE);

        // Smooth camera lerp
        this.camera.position.x += (targetCamX - this.camera.position.x) * 0.1;
        this.camera.position.y += (targetCamY - this.camera.position.y) * 0.1;
        this.camera.position.z = 22.5;

        // Smooth Gravity Inversion Roll (180° roll when upside down)
        const targetRoll = p.gravityDir === -1 ? Math.PI : 0;
        this.currentGravityRoll += (targetRoll - this.currentGravityRoll) * 0.12;
        this.camera.rotation.z = this.currentGravityRoll;

        // Slight downward pitch. Dead-on the boxes only ever show their front
        // face and the scene reads as 2D cutouts; a few degrees reveals the top
        // and side faces, which is what actually sells the extrusion.
        this.camera.rotation.x = -0.085;

        // 10. Execute WebGL Render Call
        this.renderer.render(this.scene, this.camera);
    }
}

window.ThreeRenderer = ThreeRenderer;
