import * as THREE from "three";
import "./style.css";

// --- Setup Scene, Camera, Renderer ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1030); // Deep night sky
scene.fog = new THREE.FogExp2(0x0a1030, 0.008); // Atmospheric fog

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  500,
);
camera.position.set(0, 5, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// --- Lighting ---
// Ambient
const ambientLight = new THREE.AmbientLight(0x404060, 0.6);
scene.add(ambientLight);

// Main directional light (moon/sun)
const mainLight = new THREE.DirectionalLight(0xfff5e6, 1.0);
mainLight.position.set(15, 25, 5);
mainLight.castShadow = true;
mainLight.receiveShadow = true;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
mainLight.shadow.camera.near = 0.5;
mainLight.shadow.camera.far = 60;
mainLight.shadow.camera.left = -15;
mainLight.shadow.camera.right = 15;
mainLight.shadow.camera.top = 15;
mainLight.shadow.camera.bottom = -15;
scene.add(mainLight);

// Fill light from below (city glow)
const fillLight = new THREE.PointLight(0x88aaff, 0.3);
fillLight.position.set(0, -2, 0);
scene.add(fillLight);

// Warm accent lights for buildings
const warmLight = new THREE.PointLight(0xffaa66, 0.4);
warmLight.position.set(0, 4, 0);
scene.add(warmLight);

// --- Helper Grid (for reference, can remove later) ---
const gridHelper = new THREE.GridHelper(80, 30, 0x88aaff, 0x335588);
gridHelper.position.y = -0.1;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.3;
scene.add(gridHelper);

// --- Ground (dark asphalt/street base) ---
const groundGeometry = new THREE.PlaneGeometry(90, 90);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x1a1a2e,
  roughness: 0.7,
  metalness: 0.1,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.15;
ground.receiveShadow = true;
scene.add(ground);

// --- Player: Simple, no face, just a silhouette ---
const player = new THREE.Group();

// Body (sleek, modern silhouette)
const bodyGeo = new THREE.CylinderGeometry(0.45, 0.5, 1.2, 8);
const bodyMat = new THREE.MeshStandardMaterial({
  color: 0x4a6a8a,
  metalness: 0.3,
  roughness: 0.4,
});
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.castShadow = true;
body.position.y = 0.6;
player.add(body);

// Head (simple sphere, no features)
const headGeo = new THREE.SphereGeometry(0.45, 24, 24);
const headMat = new THREE.MeshStandardMaterial({
  color: 0xc9b6a0,
  metalness: 0.1,
  roughness: 0.3,
});
const head = new THREE.Mesh(headGeo, headMat);
head.castShadow = true;
head.position.y = 1.25;
player.add(head);

// Simple shoulders/arms suggestion (just small spheres)
const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x3a5a7a });
const leftShoulder = new THREE.Mesh(
  new THREE.SphereGeometry(0.2, 6, 6),
  shoulderMat,
);
leftShoulder.position.set(-0.45, 1.0, 0);
player.add(leftShoulder);
const rightShoulder = new THREE.Mesh(
  new THREE.SphereGeometry(0.2, 6, 6),
  shoulderMat,
);
rightShoulder.position.set(0.45, 1.0, 0);
player.add(rightShoulder);

player.position.y = 0;
player.castShadow = true;
scene.add(player);

// --- City Generation: BGC-Inspired Grid ---

// Colors for different building types
const colors = {
  glassBlue: 0x4a7db4,
  glassTeal: 0x5c9c8c,
  glassSilver: 0x9aaebf,
  warmBeige: 0xc9b6a0,
  terracotta: 0xb87c4f,
  darkBrick: 0x8b5a2b,
  modernGray: 0x7c8a9e,
  accentGold: 0xc9a03d,
};

// Store building data for collision
const buildings = [];

function createBuilding(
  x,
  z,
  width,
  height,
  depth,
  color,
  hasRoofDetail = false,
) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.2,
    metalness: 0.7,
  });
  const building = new THREE.Mesh(geometry, material);
  building.position.set(x, height / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  scene.add(building);

  // Add simple window details (just emissive lines later, for now a subtle edge)
  if (height > 3) {
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0xeedd99,
      emissive: 0x442200,
      emissiveIntensity: 0.2,
    });
    const edgeGeo = new THREE.BoxGeometry(width + 0.05, height, 0.05);
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.set(x, height / 2, z + depth / 2 + 0.02);
    edge.castShadow = false;
    scene.add(edge);

    const edgeBack = new THREE.Mesh(edgeGeo, edgeMat);
    edgeBack.position.set(x, height / 2, z - depth / 2 - 0.02);
    edgeBack.castShadow = false;
    scene.add(edgeBack);
  }

  // Roof detail for some buildings
  if (hasRoofDetail && height > 4) {
    const roofGeo = new THREE.BoxGeometry(width + 0.2, 0.3, depth + 0.2);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0xccaa77,
      metalness: 0.1,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(x, height + 0.15, z);
    roof.castShadow = true;
    scene.add(roof);
  }

  // Store for collision
  buildings.push({
    x,
    z,
    width,
    depth,
    minX: x - width / 2,
    maxX: x + width / 2,
    minZ: z - depth / 2,
    maxZ: z + depth / 2,
  });

  return building;
}

// Create BGC-style grid layout
// Main avenues (north-south) and streets (east-west)
// Let's build a 7x7 block area with varied buildings

const blockSize = 5.5;
const roadWidth = 2.5;
const totalSpacing = blockSize + roadWidth;

// Building positions grid (rows and columns)
const buildingSpots = [
  // Row 1 (south side)
  {
    x: -12,
    z: -12,
    w: 2.2,
    h: 5.5,
    d: 2.2,
    color: colors.glassBlue,
    detail: true,
  },
  {
    x: -6,
    z: -12,
    w: 2.2,
    h: 7.2,
    d: 2.2,
    color: colors.glassTeal,
    detail: true,
  },
  {
    x: 0,
    z: -12,
    w: 2.5,
    h: 4.8,
    d: 2.5,
    color: colors.warmBeige,
    detail: false,
  },
  {
    x: 6,
    z: -12,
    w: 2.2,
    h: 6.5,
    d: 2.2,
    color: colors.modernGray,
    detail: true,
  },
  {
    x: 12,
    z: -12,
    w: 2.2,
    h: 8.0,
    d: 2.2,
    color: colors.glassSilver,
    detail: true,
  },

  // Row 2
  {
    x: -12,
    z: -6,
    w: 2.5,
    h: 6.2,
    d: 2.5,
    color: colors.terracotta,
    detail: true,
  },
  {
    x: -6,
    z: -6,
    w: 2.2,
    h: 9.0,
    d: 2.2,
    color: colors.glassBlue,
    detail: true,
  },
  {
    x: 0,
    z: -6,
    w: 2.8,
    h: 4.2,
    d: 2.8,
    color: colors.warmBeige,
    detail: false,
  },
  {
    x: 6,
    z: -6,
    w: 2.2,
    h: 7.5,
    d: 2.2,
    color: colors.modernGray,
    detail: true,
  },
  {
    x: 12,
    z: -6,
    w: 2.2,
    h: 5.8,
    d: 2.2,
    color: colors.accentGold,
    detail: true,
  },

  // Row 3 (center area - High Street)
  {
    x: -12,
    z: 0,
    w: 2.5,
    h: 4.5,
    d: 2.5,
    color: colors.warmBeige,
    detail: false,
  },
  {
    x: -6,
    z: 0,
    w: 2.2,
    h: 6.0,
    d: 2.2,
    color: colors.glassTeal,
    detail: true,
  },
  { x: 0, z: 0, w: 3.0, h: 3.5, d: 3.0, color: 0xd4b88a, detail: false }, // Low plaza building
  { x: 6, z: 0, w: 2.2, h: 6.8, d: 2.2, color: colors.glassBlue, detail: true },
  {
    x: 12,
    z: 0,
    w: 2.5,
    h: 5.2,
    d: 2.5,
    color: colors.modernGray,
    detail: true,
  },

  // Row 4
  {
    x: -12,
    z: 6,
    w: 2.2,
    h: 7.0,
    d: 2.2,
    color: colors.glassSilver,
    detail: true,
  },
  {
    x: -6,
    z: 6,
    w: 2.2,
    h: 5.5,
    d: 2.2,
    color: colors.terracotta,
    detail: true,
  },
  {
    x: 0,
    z: 6,
    w: 2.5,
    h: 4.2,
    d: 2.5,
    color: colors.warmBeige,
    detail: false,
  },
  { x: 6, z: 6, w: 2.2, h: 8.2, d: 2.2, color: colors.glassBlue, detail: true },
  {
    x: 12,
    z: 6,
    w: 2.2,
    h: 6.0,
    d: 2.2,
    color: colors.accentGold,
    detail: true,
  },

  // Row 5 (north side)
  {
    x: -12,
    z: 12,
    w: 2.5,
    h: 5.0,
    d: 2.5,
    color: colors.modernGray,
    detail: true,
  },
  {
    x: -6,
    z: 12,
    w: 2.2,
    h: 7.5,
    d: 2.2,
    color: colors.glassTeal,
    detail: true,
  },
  {
    x: 0,
    z: 12,
    w: 2.2,
    h: 9.0,
    d: 2.2,
    color: colors.glassBlue,
    detail: true,
  },
  {
    x: 6,
    z: 12,
    w: 2.5,
    h: 4.8,
    d: 2.5,
    color: colors.warmBeige,
    detail: false,
  },
  {
    x: 12,
    z: 12,
    w: 2.2,
    h: 6.5,
    d: 2.2,
    color: colors.modernGray,
    detail: true,
  },
];

buildingSpots.forEach((spot) => {
  createBuilding(
    spot.x,
    spot.z,
    spot.w,
    spot.h,
    spot.d,
    spot.color,
    spot.detail,
  );
});

// Add some taller landmark buildings (like W City Center)
createBuilding(-3, -9, 3.2, 12, 3.2, colors.glassSilver, true);
createBuilding(4, 8, 3.0, 10, 3.0, colors.accentGold, true);
createBuilding(-8, 4, 2.8, 11, 2.8, colors.glassBlue, true);
createBuilding(9, -3, 2.8, 9, 2.8, colors.modernGray, true);

// --- Roads (asphalt with subtle variations) ---
function createRoad(x, z, width, length, rotation = 0) {
  const roadGeometry = new THREE.PlaneGeometry(width, length);
  const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.85,
    metalness: 0.05,
  });
  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.rotation.x = -Math.PI / 2;
  road.position.set(x, -0.08, z);
  road.rotation.z = rotation;
  road.receiveShadow = true;
  scene.add(road);

  // Add subtle lane markings
  const markingMat = new THREE.MeshStandardMaterial({
    color: 0xeebb66,
    emissive: 0x442200,
  });
  if (rotation === 0 && length > 3) {
    for (let i = -length / 2 + 1; i < length / 2; i += 2) {
      const markingGeo = new THREE.PlaneGeometry(0.2, 0.8);
      const marking = new THREE.Mesh(markingGeo, markingMat);
      marking.rotation.x = -Math.PI / 2;
      marking.position.set(x, -0.05, z + i);
      marking.receiveShadow = false;
      scene.add(marking);
    }
  } else if (width > 3) {
    for (let i = -width / 2 + 1; i < width / 2; i += 2) {
      const markingGeo = new THREE.PlaneGeometry(0.8, 0.2);
      const marking = new THREE.Mesh(markingGeo, markingMat);
      marking.rotation.x = -Math.PI / 2;
      marking.position.set(x + i, -0.05, z);
      marking.receiveShadow = false;
      scene.add(marking);
    }
  }
}

// Main roads (grid)
const roadPositions = [
  // Horizontal
  { x: 0, z: -9, w: 32, l: 2.2 },
  { x: 0, z: -3, w: 32, l: 2.2 },
  { x: 0, z: 3, w: 32, l: 2.2 },
  { x: 0, z: 9, w: 32, l: 2.2 },
  // Vertical
  { x: -9, z: 0, w: 2.2, l: 32 },
  { x: -3, z: 0, w: 2.2, l: 32 },
  { x: 3, z: 0, w: 2.2, l: 32 },
  { x: 9, z: 0, w: 2.2, l: 32 },
];

roadPositions.forEach((r) => {
  createRoad(r.x, r.z, r.w, r.l, r.rot || 0);
});

// --- Sidewalks and Street Trees ---
const treeMatTrunk = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
const treeMatLeaves = new THREE.MeshStandardMaterial({ color: 0x5c9c5c });

function createTree(x, z) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.4, 1.2, 5),
    treeMatTrunk,
  );
  trunk.position.y = 0.6;
  trunk.castShadow = true;
  group.add(trunk);

  const leaves1 = new THREE.Mesh(
    new THREE.ConeGeometry(0.6, 0.8, 6),
    treeMatLeaves,
  );
  leaves1.position.y = 1.2;
  leaves1.castShadow = true;
  group.add(leaves1);

  const leaves2 = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 0.7, 6),
    treeMatLeaves,
  );
  leaves2.position.y = 1.7;
  leaves2.castShadow = true;
  group.add(leaves2);

  group.position.set(x, 0, z);
  scene.add(group);
}

// Add trees along sidewalks
const treeSpots = [
  [-15, -11],
  [-11, -11],
  [-7, -11],
  [-3, -11],
  [1, -11],
  [5, -11],
  [9, -11],
  [13, -11],
  [-15, -5],
  [13, -5],
  [-15, 1],
  [13, 1],
  [-15, 7],
  [13, 7],
  [-15, 13],
  [13, 13],
  [-11, 15],
  [-7, 15],
  [-3, 15],
  [1, 15],
  [5, 15],
  [9, 15],
];
treeSpots.forEach((pos) => createTree(pos[0], pos[1]));

// --- Simple Streetlamps ---
const lampMat = new THREE.MeshStandardMaterial({ color: 0x778899 });
const lampLightMat = new THREE.MeshStandardMaterial({
  color: 0xffaa66,
  emissive: 0xff4411,
  emissiveIntensity: 0.4,
});

function createLamp(x, z) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.3, 3.2, 5),
    lampMat,
  );
  pole.position.set(x, 1.6, z);
  pole.castShadow = true;
  scene.add(pole);

  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 6, 6),
    lampLightMat,
  );
  lamp.position.set(x, 3.2, z);
  lamp.castShadow = true;
  scene.add(lamp);
}

const lampSpots = [
  [-14, -14],
  [-10, -14],
  [-6, -14],
  [-2, -14],
  [2, -14],
  [6, -14],
  [10, -14],
  [14, -14],
  [-14, -8],
  [14, -8],
  [-14, -2],
  [14, -2],
  [-14, 4],
  [14, 4],
  [-14, 10],
  [14, 10],
  [-14, 16],
  [14, 16],
];
lampSpots.forEach((pos) => createLamp(pos[0], pos[1]));

// --- Movement System ---
const keyState = { w: false, s: false, a: false, d: false };

window.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "KeyW":
      keyState.w = true;
      break;
    case "KeyS":
      keyState.s = true;
      break;
    case "KeyA":
      keyState.a = true;
      break;
    case "KeyD":
      keyState.d = true;
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.code) {
    case "KeyW":
      keyState.w = false;
      break;
    case "KeyS":
      keyState.s = false;
      break;
    case "KeyA":
      keyState.a = false;
      break;
    case "KeyD":
      keyState.d = false;
      break;
  }
});

const moveSpeed = 6.2;
let cameraOffset = new THREE.Vector3(-5.5, 4.2, 7.5);

// Collision detection
function checkCollision(x, z, radius = 0.55) {
  for (let b of buildings) {
    if (
      x + radius > b.minX &&
      x - radius < b.maxX &&
      z + radius > b.minZ &&
      z - radius < b.maxZ
    ) {
      return true;
    }
  }
  // Keep within city bounds
  if (Math.abs(x) > 19 || Math.abs(z) > 19) return true;
  return false;
}

// --- Animation Loop ---
let lastTime = performance.now();

function animate() {
  const now = performance.now();
  let delta = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;

  let moveX = 0,
    moveZ = 0;
  if (keyState.w) moveZ -= 1;
  if (keyState.s) moveZ += 1;
  if (keyState.a) moveX -= 1;
  if (keyState.d) moveX += 1;

  if (moveX !== 0 || moveZ !== 0) {
    const len = Math.hypot(moveX, moveZ);
    moveX /= len;
    moveZ /= len;
  }

  let newX = player.position.x + moveX * moveSpeed * delta;
  let newZ = player.position.z + moveZ * moveSpeed * delta;

  if (!checkCollision(newX, player.position.z)) player.position.x = newX;
  if (!checkCollision(player.position.x, newZ)) player.position.z = newZ;

  if (moveX !== 0 || moveZ !== 0) {
    const angle = Math.atan2(moveX, moveZ);
    player.rotation.y = angle;
  }

  const desiredCameraPos = new THREE.Vector3(
    player.position.x + cameraOffset.x,
    player.position.y + cameraOffset.y + 0.8,
    player.position.z + cameraOffset.z,
  );
  camera.position.lerp(desiredCameraPos, 0.08);
  camera.lookAt(player.position);

  // Animate warm light for ambiance
  const time = Date.now() * 0.002;
  warmLight.intensity = 0.4 + Math.sin(time) * 0.1;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log("Higher Streets — BGC Open World");
console.log("Controls: WASD to move");
