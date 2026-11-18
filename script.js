
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

// ==========================================
// 1. 3D WORLD
// ==========================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030006);
scene.fog = new THREE.FogExp2(0x030006, 0.0015);

const camera = new THREE.PerspectiveCamera(
    65, window.innerWidth / window.innerHeight, 0.1, 500
);
camera.position.set(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.getElementById('universe').appendChild(renderer.domElement);

// ==========================================
// 2. LIGHTING
// ==========================================

scene.add(new THREE.AmbientLight(0xffffff, 1.2));

const pinkLight = new THREE.PointLight(0xff36c7, 100, 45);
pinkLight.position.set(-5, 4, -14);
scene.add(pinkLight);

const purpleLight = new THREE.PointLight(0x8d35ff, 100, 45);
purpleLight.position.set(5, 3, -18);
scene.add(purpleLight);

// ==========================================
// 3. BACKGROUND STARS
// ==========================================

const starPositions = [];

for (let i = 0; i < 1800; i++) {
    starPositions.push(
        (Math.random() - 0.5) * 220,
        (Math.random() - 0.5) * 140,
        -Math.random() * 180
    );
}

const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starPositions, 3)
);

const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
        color: 0xffc5ee,
        size: 0.12,
        transparent: true,
        opacity: 0.65
    })
);

scene.add(stars);

// ==========================================
// 4. FLOATING BIRTHDAY MESSAGES
// ==========================================

const messages = [
    'Happy Birthday', 'I love you', 'You are so special',
    'Forever and always', 'You mean so much to me',
    'Keep smiling', 'Stay beautiful', 'You deserve the world',
    'Make a wish', 'A day full of magic', 'Endless happiness',
    'Sending you love', 'You are amazing', 'Shine forever',
    'Dream big', 'So many beautiful memories',
    'The world is brighter with you', 'Wishing you endless joy',
    'You are one of a kind', 'A beautiful soul',
    'Lots of love', 'Stay magical', 'Keep shining',
    'Happy moments forever', 'Today is all about you'
];

const textGroup = new THREE.Group();
scene.add(textGroup);

const textObjects = [];
const textureCache = new Map();

function createMessageTexture(message) {
    if (textureCache.has(message)) return textureCache.get(message);

    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 300;

    const ctx = canvas.getContext('2d');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'italic 100px Georgia';
    ctx.shadowColor = '#ff35c8';
    ctx.shadowBlur = 35;

    const gradient = ctx.createLinearGradient(200, 0, 1400, 0);
    gradient.addColorStop(0, '#ff85d9');
    gradient.addColorStop(0.5, '#fff0fc');
    gradient.addColorStop(1, '#ff70d4');

    ctx.fillStyle = gradient;
    ctx.fillText(message, 800, 150);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textureCache.set(message, texture);

    return texture;
}

function createFloatingMessage(message, index) {
    const depth = 12 + Math.random() * 100;

    const halfHeight = Math.tan(
        THREE.MathUtils.degToRad(camera.fov / 2)
    ) * depth;

    const halfWidth = halfHeight * camera.aspect;

    const material = new THREE.MeshBasicMaterial({
        map: createMessageTexture(message),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false
    });

    const size = 0.65 + Math.random() * 2.1;
    const width = 11 * size;
    const height = width * (300 / 1600);

    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        material
    );

    const x = (Math.random() * 2 - 1) * halfWidth * 0.88;
    const y = (Math.random() * 2 - 1) * halfHeight * 0.88;

    mesh.position.set(x, y, -depth);
    mesh.rotation.z = (Math.random() - 0.5) * 0.55;
    mesh.rotation.y = (Math.random() - 0.5) * 0.22;
    mesh.rotation.x = (Math.random() - 0.5) * 0.15;

    textGroup.add(mesh);

    textObjects.push({
        mesh,
        originalX: x,
        originalY: y,
        originalZ: -depth,
        phase: Math.random() * Math.PI * 2,
        speed: 0.15 + Math.random() * 0.25,
        drift: 0.12 + Math.random() * 0.3,
        rotationSpeed: (Math.random() - 0.5) * 0.0008,
        delay: index * 18
    });
}

for (let i = 0; i < 130; i++) {
    const message = messages[Math.floor(Math.random() * messages.length)];
    createFloatingMessage(message, i);
}

// ==========================================
// 5. CAKE WORLD
// ==========================================

const cakeGroup = new THREE.Group();
cakeGroup.position.set(0, -1.5, -20);
cakeGroup.visible = false;
scene.add(cakeGroup);

const cakePink = new THREE.MeshStandardMaterial({
    color: 0xff80ce, roughness: 0.27, metalness: 0.08
});

const cakeLight = new THREE.MeshStandardMaterial({
    color: 0xffd9f1, roughness: 0.25
});

const cakePurple = new THREE.MeshStandardMaterial({
    color: 0x9c55dc, roughness: 0.3
});

const gold = new THREE.MeshStandardMaterial({
    color: 0xffd77a, metalness: 0.8, roughness: 0.2
});

function addCylinder(radius, height, y, material) {
    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, height, 96),
        material
    );
    mesh.position.set(0, y, 0);
    cakeGroup.add(mesh);
    return mesh;
}

function addTorus(radius, tube, y, material) {
    const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 12, 100),
        material
    );
    mesh.rotation.x = Math.PI / 2;
    mesh.position.y = y;
    cakeGroup.add(mesh);
    return mesh;
}

addCylinder(3.3, 1.1, -3.65, cakePink);
addCylinder(2.45, 1.0, -2.6, cakeLight);
addCylinder(1.65, 0.9, -1.65, cakePink);

addTorus(3.28, 0.12, -3.08, cakeLight);
addTorus(2.43, 0.11, -2.1, cakePurple);
addTorus(1.63, 0.1, -1.2, cakeLight);
addTorus(3.35, 0.09, -4.18, gold);

for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const pearl = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 16, 16),
        gold
    );
    pearl.position.set(
        Math.cos(angle) * 2.85,
        -3.05,
        Math.sin(angle) * 2.85
    );
    cakeGroup.add(pearl);
}

for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const decoration = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 20, 20),
        cakePurple
    );
    decoration.position.set(
        Math.cos(angle) * 2.05,
        -2.05,
        Math.sin(angle) * 2.05
    );
    cakeGroup.add(decoration);
}

// ==========================================
// 6. CANDLES
// ==========================================

const candleGroup = new THREE.Group();
cakeGroup.add(candleGroup);

const candleColors = [
    0xff70c8, 0xb78aff, 0xffd66e, 0xffffff, 0xff75a8
];

const candles = [];

for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.55;

    const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.85, 24),
        new THREE.MeshStandardMaterial({
            color: candleColors[i],
            roughness: 0.3
        })
    );

    candle.position.set(x, -0.35, 0);
    candleGroup.add(candle);

    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.15, 0.06, 24),
        gold
    );

    base.position.set(x, -0.78, 0);
    candleGroup.add(base);

    const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 20, 20),
        new THREE.MeshBasicMaterial({
            color: 0xffc14d,
            transparent: true
        })
    );

    flame.scale.set(0.75, 1.6, 0.75);
    flame.position.set(x, 0.18, 0);
    candleGroup.add(flame);

    const glow = new THREE.PointLight(0xff9d38, 2, 4);
    glow.position.set(x, 0.25, 0);
    candleGroup.add(glow);

    candles.push({ flame, glow, extinguished: false });
}

// ==========================================
// 7. BALLOONS
// ==========================================

const balloonGroup = new THREE.Group();
cakeGroup.add(balloonGroup);

const balloonColors = [
    0xff65c7, 0xa96aff, 0xffd1ed,
    0xff9cbb, 0xc18aff, 0xffd77a
];

const balloons = [];

function createBalloon(x, y, z, color, scale = 1) {
    const group = new THREE.Group();

    const balloon = new THREE.Mesh(
        new THREE.SphereGeometry(0.65, 32, 32),
        new THREE.MeshStandardMaterial({
            color, metalness: 0.25, roughness: 0.2
        })
    );

    balloon.scale.set(0.82, 1.12, 0.82);
    group.add(balloon);

    const knot = new THREE.Mesh(
        new THREE.ConeGeometry(0.13, 0.23, 16),
        new THREE.MeshStandardMaterial({ color })
    );

    knot.position.y = -0.75;
    knot.rotation.x = Math.PI;
    group.add(knot);

    const string = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 1.4, 8),
        cakeLight
    );

    string.position.y = -1.45;
    group.add(string);

    group.position.set(x, y, z);
    group.scale.setScalar(scale);
    balloonGroup.add(group);

    balloons.push({
        group,
        phase: Math.random() * Math.PI * 2,
        burst: false
    });
}

for (let i = 0; i < 6; i++) {
    const side = i % 2 === 0 ? -1 : 1;

    createBalloon(
        side * (4.1 + Math.random() * 1.3),
        -0.4 + Math.random() * 2.4,
        -0.5 + Math.random() * 1.2,
        balloonColors[i],
        0.8 + Math.random() * 0.35
    );
}

// ==========================================
// 8. PARTICLES
// ==========================================

const particleGroup = new THREE.Group();
cakeGroup.add(particleGroup);

const particles = [];

function createBurst(position, color, amount = 45) {
    for (let i = 0; i < amount; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(
                0.035 + Math.random() * 0.055, 8, 8
            ),
            new THREE.MeshBasicMaterial({
                color, transparent: true
            })
        );

        particle.position.copy(position);

        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.22,
            Math.random() * 0.2,
            (Math.random() - 0.5) * 0.22
        );

        particleGroup.add(particle);
        particles.push({ mesh: particle, velocity, life: 1 });
    }
}

// ==========================================
// 9. CINEMATIC FLOATING GLASS ORB GALLERY
// ==========================================

const galleryGroup = new THREE.Group();
galleryGroup.visible = false;
scene.add(galleryGroup);

const photoCards = [];
const textureLoader = new THREE.TextureLoader();

let selectedOrb = null;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Randomised scattered positions
const galleryPositions = [];

for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 3; column++) {
        galleryPositions.push({
            x: (column - 1) * 5.4 + (Math.random() - 0.5) * 1.2,
            y: (1 - row) * 4.0 + (Math.random() - 0.5) * 1.0
        });
    }
}

galleryPositions.sort(() => Math.random() - 0.5);

function createPhotoCard(index) {

    const orb = new THREE.Group();

    const depth = 17 + Math.random() * 4;

    const halfHeight = Math.tan(
        THREE.MathUtils.degToRad(camera.fov / 2)
    ) * depth;

    const halfWidth = halfHeight * camera.aspect;

    const targetX = THREE.MathUtils.clamp(
        galleryPositions[index].x,
        -halfWidth * 0.68,
        halfWidth * 0.68
    );

    const targetY = THREE.MathUtils.clamp(
        galleryPositions[index].y,
        -halfHeight * 0.58,
        halfHeight * 0.58
    );

    orb.position.set(
        targetX + (Math.random() - 0.5) * 2,
        targetY + 5,
        -depth
    );

    orb.scale.setScalar(0.001);
    galleryGroup.add(orb);

    // Glass sphere
    const glass = new THREE.Mesh(
        new THREE.SphereGeometry(1.72, 48, 48),
        new THREE.MeshPhysicalMaterial({
            color: 0xf5dfff,
            roughness: 0.08,
            metalness: 0.12,
            transmission: 0.25,
            thickness: 0.6,
            transparent: true,
            opacity: 0.22,
            depthWrite: false,
            clearcoat: 1
        })
    );

    orb.add(glass);

    // Large photo
    const photoMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const photo = new THREE.Mesh(
        new THREE.PlaneGeometry(2.55, 1.85),
        photoMaterial
    );

    photo.position.z = 0.15;
    orb.add(photo);

    const imagePath = `photo${index + 1}.jpeg`;

    textureLoader.load(
        imagePath,
        (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;

            const imageAspect =
                texture.image.width / texture.image.height;

            const photoAspect = 2.55 / 1.85;

            if (imageAspect > photoAspect) {
                photo.scale.y = photoAspect / imageAspect;
            } else {
                photo.scale.x = imageAspect / photoAspect;
            }

            photoMaterial.map = texture;
            photoMaterial.opacity = 1;
            photoMaterial.needsUpdate = true;
        },
        undefined,
        (error) => console.error(`Photo loading failed: ${imagePath}`, error)
    );

    // Glowing outer ring
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.76, 0.025, 12, 100),
        new THREE.MeshBasicMaterial({
            color: 0xe8aaff,
            transparent: true,
            opacity: 0.85
        })
    );

    orb.add(ring);

    // Second orbit ring
    const secondRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.9, 0.012, 8, 100),
        new THREE.MeshBasicMaterial({
            color: 0x9e8bff,
            transparent: true,
            opacity: 0.55
        })
    );

    secondRing.rotation.x = Math.PI / 2.8;
    orb.add(secondRing);

    // Glow light
    const glow = new THREE.PointLight(0xdba5ff, 1.8, 6);
    glow.position.set(0, 0, 1.5);
    orb.add(glow);

    // Magical sparkles
    const sparkles = [];

    for (let i = 0; i < 12; i++) {

        const sparkle = new THREE.Mesh(
            new THREE.SphereGeometry(0.035, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0xffffff
            })
        );

        const angle = Math.random() * Math.PI * 2;
        const radius = 1.85 + Math.random() * 0.3;

        sparkle.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            (Math.random() - 0.5) * 0.4
        );

        orb.add(sparkle);
        sparkles.push(sparkle);
    }

    photoCards.push({
        card: orb,
        photo,
        ring,
        secondRing,
        sparkles,
        targetX,
        targetY,
        targetZ: -depth,
        delay: index * 350,
        phase: Math.random() * Math.PI * 2,
        floatSpeed: 0.5 + Math.random() * 0.5,
        rotationSpeed: (Math.random() - 0.5) * 0.25
    });
}

for (let i = 0; i < 9; i++) {
    createPhotoCard(i);
}

// Click a photo to enlarge it
renderer.domElement.addEventListener('pointerdown', (event) => {

    if (phase !== 'gallery') return;

    const rect = renderer.domElement.getBoundingClientRect();

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(
        photoCards.map(item => item.card),
        true
    );

    if (intersects.length > 0) {

        let object = intersects[0].object;

        while (
            object.parent &&
            !photoCards.some(item => item.card === object)
        ) {
            object = object.parent;
        }

        const clicked = photoCards.find(
            item => item.card === object
        );

        if (clicked) {
            selectedOrb = selectedOrb === clicked ? null : clicked;
        }
    }
});

// ==========================================
// 10. DOM ELEMENTS AND PHASES
// ==========================================

const countdown = document.getElementById('countdown');
const label = document.getElementById('count-label');
const overlay = document.getElementById('cinematic-overlay');
const loading = document.getElementById('loading');
const birthdayReveal = document.getElementById('birthday-reveal');
const galleryTitle = document.getElementById('gallery-title');

const letterScene = document.getElementById('letter-scene');
const letterEnvelope = document.getElementById('letter-envelope');

let phase = 'loading';

let startTime = 0;
let universeStart = 0;
let cakeStart = 0;
let finalStart = 0;
let galleryStart = 0;
let letterStart = 0;

let currentNumber = 3;

function showNumber(number) {
    currentNumber = number;
    countdown.textContent = number;

    countdown.animate([
        { opacity: 0, transform: 'scale(2.5) rotate(-12deg)' },
        { opacity: 1, transform: 'scale(1) rotate(0deg)', offset: 0.35 },
        { opacity: 0, transform: 'scale(0.15) rotate(12deg)' }
    ], {
        duration: 1200,
        easing: 'ease-in-out',
        fill: 'forwards'
    });
}

function startCountdown() {
    loading.style.opacity = '0';

    setTimeout(() => {
        loading.style.display = 'none';
    }, 1000);

    phase = 'countdown';
    startTime = performance.now();

    showNumber(3);

    label.animate([
        { opacity: 0 },
        { opacity: 1 }
    ], {
        duration: 800,
        fill: 'forwards'
    });
}

// ==========================================
// 11. FLOATING UNIVERSE REVEAL
// ==========================================

function revealUniverse() {
    phase = 'universe';
    universeStart = performance.now();

    overlay.style.display = 'none';

    textObjects.forEach((item) => {
        setTimeout(() => {
            item.mesh.material.opacity = 0.88;
        }, item.delay);
    });
}

// ==========================================
// 12. CAKE ENTRANCE
// ==========================================

function enterCakeWorld() {
    phase = 'cake-enter';
    cakeStart = performance.now();

    cakeGroup.visible = true;
    cakeGroup.scale.setScalar(0.01);
    cakeGroup.rotation.y = 0;

    textObjects.forEach((item) => {
        item.mesh.material.opacity = 0.88;
    });
}

function revealCake() {
    phase = 'cake';
    cakeStart = performance.now();
}

// ==========================================
// 13. EXTINGUISH CANDLES
// ==========================================

function extinguishCandles() {
    phase = 'candles';
    cakeStart = performance.now();

    candles.forEach((candle, index) => {
        setTimeout(() => {
            if (candle.extinguished) return;

            candle.extinguished = true;

            createBurst(
                candle.flame.position.clone(),
                0xffc5e9,
                18
            );

            candle.flame.visible = false;
            candle.glow.intensity = 0;
        }, index * 450);
    });
}

// ==========================================
// 14. BALLOON BURST
// ==========================================

function burstBalloons() {
    phase = 'balloons';
    cakeStart = performance.now();

    balloons.forEach((item, index) => {
        setTimeout(() => {
            if (item.burst) return;

            item.burst = true;

            const position = new THREE.Vector3();
            item.group.getWorldPosition(position);

            const localPosition = cakeGroup.worldToLocal(position);

            createBurst(localPosition, balloonColors[index], 65);
            item.group.visible = false;
        }, index * 250);
    });

    setTimeout(() => {
        for (let i = 0; i < 8; i++) {
            createBurst(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 6,
                    Math.random() * 3,
                    0
                ),
                0xffa9e8,
                25
            );
        }
    }, 1700);
}

// ==========================================
// 15. BIRTHDAY REVEAL
// ==========================================

function showBirthday() {
    phase = 'final';
    finalStart = performance.now();

    birthdayReveal.classList.add('visible');

    pinkLight.intensity = 160;
    purpleLight.intensity = 130;
}

// ==========================================
// 16. START MEMORY GALLERY
// ==========================================

function startGallery() {
    phase = 'gallery';
    galleryStart = performance.now();

    selectedOrb = null;

    cakeGroup.visible = false;
    birthdayReveal.classList.remove('visible');

    galleryTitle.classList.add('visible');
    galleryGroup.visible = true;

    camera.position.set(0, 0, 0);
    camera.rotation.set(0, 0, 0);
    camera.lookAt(0, 0, -15);

    pinkLight.position.set(-5, 5, -12);
    purpleLight.position.set(5, 4, -14);

    pinkLight.intensity = 90;
    purpleLight.intensity = 90;
}


// ==========================================
// 17. MAGICAL LETTER SCENE
// ==========================================

function startLetterScene() {

    if (phase !== 'constellation') return;

    phase = 'letter';
    letterStart = performance.now();

    galleryTitle.classList.remove('visible');

    // First show the letter background
    letterScene.classList.add('visible');

    // Keep the stars during the letter's fade-in
    setTimeout(() => {
        constellationGroup.visible = false;
    }, 2200);

    // Open envelope after the transition
    setTimeout(() => {
        letterEnvelope.classList.add('opened');
    }, 2800);

    // Reveal the message
    setTimeout(() => {
        letterScene.classList.add('message-visible');
    }, 5200);

    pinkLight.position.set(-4, 3, -8);
    purpleLight.position.set(4, 2, -10);

    pinkLight.intensity = 130;
    purpleLight.intensity = 75;
}

// ==========================================
// 17.5 WISH CONSTELLATION - RAASHMI PRIYA
// ==========================================

const constellationGroup = new THREE.Group();
constellationGroup.visible = false;
scene.add(constellationGroup);

let constellationStart = 0;
let constellationPoints = null;
let constellationLines = null;
let constellationMessage = null;

let constellationStartPositions = [];
let constellationTargetPositions = [];
let constellationConnections = [];

constellationGroup.position.set(0, 0, 0);

// Create the name using actual star positions
function createNameConstellation() {

    const canvas = document.createElement('canvas');
    canvas.width = 2400;
    canvas.height = 600;

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 2400, 600);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let fontSize = 250;

ctx.font = `bold ${fontSize}px Georgia`;

while (ctx.measureText('RAASHMI PRIYA').width > 2150) {
    fontSize -= 5;
    ctx.font = `bold ${fontSize}px Georgia`;
}

    ctx.shadowColor = '#ffd36b';
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';

    ctx.fillText('RAASHMI PRIYA', 1200, 300);

    const imageData = ctx.getImageData(
        0, 0, canvas.width, canvas.height
    );

    const step = 7;
    const grid = new Map();

    constellationStartPositions = [];
    constellationTargetPositions = [];
    constellationConnections = [];

    // Sample individual pixels to create star targets
    for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {

            const pixel = (y * canvas.width + x) * 4;
            const alpha = imageData.data[pixel + 3];

            if (alpha > 200) {

                const index = constellationTargetPositions.length;

                const targetX = (x - 1200) * 0.0095;
                const targetY = (300 - y) * 0.016;

                constellationTargetPositions.push(
                    targetX, targetY, -22
                );

                // Stars begin scattered throughout space
                constellationStartPositions.push(
                    (Math.random() - 0.5) * 36,
                    (Math.random() - 0.5) * 22,
                    -12 - Math.random() * 28
                );

                grid.set(`${x},${y}`, index);
            }
        }
    }

    // Connect neighboring stars to form the letters
    for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {

            const current = grid.get(`${x},${y}`);

            if (current === undefined) continue;

            const right = grid.get(`${x + step},${y}`);
            const below = grid.get(`${x},${y + step}`);

            if (right !== undefined) {
                constellationConnections.push(current, right);
            }

            if (below !== undefined) {
                constellationConnections.push(current, below);
            }
        }
    }

    // Create star particles
    const starGeometry = new THREE.BufferGeometry();

    starGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
            constellationStartPositions, 3
        )
    );

    constellationPoints = new THREE.Points(
        starGeometry,
        new THREE.PointsMaterial({
            color: 0xffd77a,
            size: 0.055,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        })
    );

    constellationGroup.add(constellationPoints);

    // Create connecting light lines
    const linePositions = new Float32Array(
        constellationConnections.length * 3
    );

    const lineGeometry = new THREE.BufferGeometry();

    lineGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(linePositions, 3)
    );

    constellationLines = new THREE.LineSegments(
        lineGeometry,
        new THREE.LineBasicMaterial({
            color: 0xffd77a,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    );

    constellationGroup.add(constellationLines);

    // Create Make a Wish message
    const messageCanvas = document.createElement('canvas');
    messageCanvas.width = 1200;
    messageCanvas.height = 180;

    const messageCtx = messageCanvas.getContext('2d');

    messageCtx.font = 'italic 75px Georgia';
    messageCtx.textAlign = 'center';
    messageCtx.textBaseline = 'middle';
    messageCtx.fillStyle = '#ffe7b0';
    messageCtx.shadowColor = '#ffbb55';
    messageCtx.shadowBlur = 25;

    messageCtx.fillText(
        'MAKE A WISH...',
        600,
        90
    );

    const messageTexture = new THREE.CanvasTexture(messageCanvas);
    messageTexture.colorSpace = THREE.SRGBColorSpace;

    constellationMessage = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 1.8),
        new THREE.MeshBasicMaterial({
            map: messageTexture,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            toneMapped: false
        })
    );

    constellationMessage.position.set(0, -5, -21);
    constellationGroup.add(constellationMessage);
}

// Start constellation after photo gallery
function startConstellationScene() {

    phase = 'constellation';
    constellationStart = performance.now();

    galleryGroup.visible = false;
    galleryTitle.classList.remove('visible');

    constellationGroup.visible = true;

    camera.position.set(0, 0, 0);
    camera.rotation.set(0, 0, 0);
    camera.lookAt(0, 0, -22);

    pinkLight.position.set(-7, 5, -17);
    purpleLight.position.set(7, 4, -20);

    pinkLight.intensity = 130;
    purpleLight.intensity = 110;

    createNameConstellation();
}

// Animate the stars into the name
function animateConstellation(elapsedTime) {

   
// First let the scattered stars shine for 2 seconds
const formationElapsed = Math.max(0, elapsedTime - 2);

// Stars slowly gather and form the name
const progress = THREE.MathUtils.clamp(
    formationElapsed / 7.5, 0, 1
);

    // Smooth cinematic formation
    const eased = 1 - Math.pow(1 - progress, 4);

    const positions =
        constellationPoints.geometry.attributes.position;

    for (let i = 0; i < constellationTargetPositions.length / 3; i++) {

        const index = i * 3;

        const sx = constellationStartPositions[index];
        const sy = constellationStartPositions[index + 1];
        const sz = constellationStartPositions[index + 2];

        const tx = constellationTargetPositions[index];
        const ty = constellationTargetPositions[index + 1];
        const tz = constellationTargetPositions[index + 2];

        const sparkle = Math.sin(
            elapsedTime * 3 + i * 0.17
        ) * 0.025;

        positions.array[index] =
            THREE.MathUtils.lerp(sx, tx, eased) + sparkle;

        positions.array[index + 1] =
            THREE.MathUtils.lerp(sy, ty, eased) + sparkle;

        positions.array[index + 2] =
            THREE.MathUtils.lerp(sz, tz, eased);
    }

    positions.needsUpdate = true;

    // Update connecting lines as stars move
    const linePositions =
        constellationLines.geometry.attributes.position;

    for (let i = 0; i < constellationConnections.length; i += 2) {

        const a = constellationConnections[i] * 3;
        const b = constellationConnections[i + 1] * 3;

        const target = i * 3;

        linePositions.array[target] = positions.array[a];
        linePositions.array[target + 1] = positions.array[a + 1];
        linePositions.array[target + 2] = positions.array[a + 2];

        linePositions.array[target + 3] = positions.array[b];
        linePositions.array[target + 4] = positions.array[b + 1];
        linePositions.array[target + 5] = positions.array[b + 2];
    }

    linePositions.needsUpdate = true;

    // Lines become visible as the name forms
    constellationLines.material.opacity = 0;

    // Make a Wish appears after name formation
    if (progress > 0.88) {

        constellationMessage.material.opacity =
            THREE.MathUtils.clamp((progress - 0.88) * 8, 0, 1);
    }

    // Cinematic camera movement
    camera.position.x = Math.sin(elapsedTime * 0.22) * 0.25;
    camera.position.y = Math.cos(elapsedTime * 0.2) * 0.12;

    camera.lookAt(0, 0, -22);

    constellationGroup.rotation.y =
        Math.sin(elapsedTime * 0.2) * 0.025;

    pinkLight.intensity =
        120 + Math.sin(elapsedTime * 1.5) * 25;

    purpleLight.intensity =
        100 + Math.cos(elapsedTime * 1.2) * 20;
}


// ==========================================
// 18. MAIN ANIMATION
// ==========================================

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();
    const now = performance.now();

    // COUNTDOWN

    if (phase === 'countdown') {
        const progress = now - startTime;

        if (progress > 1400 && currentNumber === 3) {
            showNumber(2);
        }

        if (progress > 2800 && currentNumber === 2) {
            showNumber(1);
        }

        if (progress > 4200 && currentNumber === 1) {
            revealUniverse();
        }
    }

    // FLOATING UNIVERSE

    if (phase === 'universe') {
        camera.position.x = Math.sin(elapsed * 0.12) * 1.5;
        camera.position.y = Math.cos(elapsed * 0.10) * 0.8;

        camera.lookAt(
            Math.sin(elapsed * 0.12) * 1.5,
            Math.cos(elapsed * 0.10) * 0.8,
            -30
        );

        textObjects.forEach((item) => {
            const mesh = item.mesh;

            mesh.position.x =
                item.originalX +
                Math.sin(elapsed * item.speed + item.phase) * item.drift;

            mesh.position.y =
                item.originalY +
                Math.cos(elapsed * item.speed + item.phase) * item.drift;

            mesh.position.z =
                item.originalZ +
                Math.sin(elapsed * 0.18 + item.phase) * 0.4;

            mesh.rotation.z += item.rotationSpeed;
            mesh.rotation.y =
                Math.sin(elapsed * 0.2 + item.phase) * 0.08;
        });

        if (now - universeStart > 10500) {
            enterCakeWorld();
        }
    }

    // CAKE ENTRANCE

    if (phase === 'cake-enter') {
        const progress = Math.min((now - cakeStart) / 3500, 1);
        const eased = 1 - Math.pow(1 - progress, 4);

        cakeGroup.scale.setScalar(
            THREE.MathUtils.lerp(0.01, 1, eased)
        );

        camera.position.set(
            0,
            0,
            THREE.MathUtils.lerp(0, 1.5, eased)
        );

        camera.lookAt(0, -1.5, -20);

        textObjects.forEach((item) => {
            item.mesh.material.opacity = Math.max(
                0, 0.88 - progress * 0.88
            );
        });

        if (progress >= 1) {
            revealCake();
        }
    }

    // CAKE MOVEMENT

    if (
        phase === 'cake' ||
        phase === 'candles' ||
        phase === 'balloons' ||
        phase === 'final'
    ) {
        cakeGroup.position.y =
            -1.5 + Math.sin(elapsed * 0.8) * 0.07;

        cakeGroup.rotation.y =
            Math.sin(elapsed * 0.25) * 0.07;

        candles.forEach((candle, index) => {
            if (!candle.extinguished) {
                candle.flame.scale.y =
                    1.6 + Math.sin(elapsed * 12 + index) * 0.25;

                candle.flame.rotation.z =
                    Math.sin(elapsed * 8 + index) * 0.12;
            }
        });

        balloons.forEach((item) => {
            if (!item.burst) {
                item.group.position.y +=
                    Math.sin(elapsed * 1.5 + item.phase) * 0.002;

                item.group.rotation.z =
                    Math.sin(elapsed + item.phase) * 0.05;
            }
        });
    }

    // CAKE EVENT TIMING

    if (phase === 'cake' && now - cakeStart > 3500) {
        extinguishCandles();
    }

    if (phase === 'candles' && now - cakeStart > 3300) {
        burstBalloons();
    }

    if (phase === 'balloons' && now - cakeStart > 4000) {
        showBirthday();
    }

    if (phase === 'final' && now - finalStart > 5500) {
        startGallery();
    }

    // FLOATING PHOTO GALLERY

    if (phase === 'gallery') {

        const galleryElapsed = (now - galleryStart) / 1000;

        photoCards.forEach((item) => {

            const localTime =
                now - galleryStart - item.delay;

            const progress = THREE.MathUtils.clamp(
                localTime / 1600, 0, 1
            );

            const eased = 1 - Math.pow(1 - progress, 4);

            const card = item.card;

            const t =
                galleryElapsed * item.floatSpeed + item.phase;

            if (progress < 1) {

                card.position.x = THREE.MathUtils.lerp(
                    item.targetX + 2,
                    item.targetX,
                    eased
                );

                card.position.y = THREE.MathUtils.lerp(
                    item.targetY + 5,
                    item.targetY,
                    eased
                );

                card.scale.setScalar(
                    THREE.MathUtils.lerp(0.001, 0.9, eased)
                );

                card.rotation.y = THREE.MathUtils.lerp(
                    1.2, 0, eased
                );

                card.rotation.x = THREE.MathUtils.lerp(
                    -0.35, 0, eased
                );

            } else if (item === selectedOrb) {

                // Selected photo comes forward

                card.position.x +=
                    (0 - card.position.x) * 0.055;

                card.position.y +=
                    (0 - card.position.y) * 0.055;

                card.position.z +=
                    (-9 - card.position.z) * 0.055;

                card.scale.lerp(
                    new THREE.Vector3(1.5, 1.5, 1.5),
                    0.055
                );

            } else {

                // Independent balloon-like floating

                const floatingX =
                    item.targetX +
                    Math.sin(t * 0.55) * 0.55;

                const floatingY =
                    item.targetY +
                    Math.cos(t * 0.48) * 0.45;

                const floatingZ =
                    item.targetZ +
                    Math.sin(t * 0.35) * 0.4;

                card.position.x +=
                    (floatingX - card.position.x) * 0.025;

                card.position.y +=
                    (floatingY - card.position.y) * 0.025;

                card.position.z +=
                    (floatingZ - card.position.z) * 0.025;

                card.scale.lerp(
                    new THREE.Vector3(0.9, 0.9, 0.9),
                    0.035
                );
            }

            card.rotation.z =
                Math.sin(t * 0.5) * 0.06;

            card.rotation.y +=
                item.rotationSpeed * 0.008;

            item.ring.rotation.z += 0.003;
            item.secondRing.rotation.x += 0.002;
            item.secondRing.rotation.z -= 0.002;

            item.sparkles.forEach((sparkle, i) => {
                sparkle.position.y +=
                    Math.sin(t * 2 + i) * 0.002;
            });
        });

        camera.lookAt(0, 0, -15);

        stars.rotation.z =
            Math.sin(elapsed * 0.025) * 0.015;

        camera.position.x =
            Math.sin(elapsed * 0.12) * 0.12;

        pinkLight.position.x =
            Math.sin(elapsed * 0.4) * 5;

        purpleLight.position.x =
            Math.cos(elapsed * 0.3) * 5;

        // Gallery display time: 18 seconds

       if (now - galleryStart > 20000) {
    startConstellationScene();
}
    }


    // WISH CONSTELLATION ANIMATION

    if (phase === 'constellation') {

        const constellationElapsed =
            (now - constellationStart) / 1000;

        animateConstellation(constellationElapsed);

        // Show the name before transitioning to the letter
        if (constellationElapsed > 13) {
            startLetterScene();
        }
    }


    // LETTER SCENE AMBIENT MOVEMENT

    if (phase === 'letter') {
        camera.position.x = Math.sin(elapsed * 0.18) * 0.12;
        camera.position.y = Math.cos(elapsed * 0.16) * 0.07;
        camera.lookAt(0, 0, -15);

        pinkLight.intensity =
            120 + Math.sin(elapsed * 1.2) * 18;

        purpleLight.intensity =
            70 + Math.cos(elapsed * 0.9) * 12;

        stars.rotation.z =
            Math.sin(elapsed * 0.025) * 0.02;
    }

    // PARTICLE PHYSICS

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.mesh.position.add(p.velocity);
        p.velocity.y -= 0.002;
        p.life -= 0.012;

        p.mesh.scale.multiplyScalar(0.985);
        p.mesh.material.opacity = Math.max(0, p.life);

        if (p.life <= 0) {
            particleGroup.remove(p.mesh);
            p.mesh.geometry.dispose();
            p.mesh.material.dispose();
            particles.splice(i, 1);
        }
    }

    renderer.render(scene, camera);
}

// ==========================================
// 19. RESPONSIVE
// ==========================================

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );
});

// ==========================================
// 20. START
// ==========================================

animate();

setTimeout(startCountdown, 1200);
