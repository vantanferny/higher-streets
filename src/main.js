import * as THREE from "three";
import "./style.css";
import { World } from "./game/World.js";
import { Player } from "./game/Player.js";
import { GameCamera } from "./game/Camera.js";
import { Input } from "./game/Input.js";

// --- Setup Three.js ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1030);
scene.fog = new THREE.FogExp2(0x0a1030, 0.008);

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
document.body.appendChild(renderer.domElement);

// --- Game Systems ---
const world = new World(scene);
const player = new Player(scene, 0, 0);
const gameCamera = new GameCamera(camera, player);
const input = new Input();

// --- Animation Loop ---
let lastTime = performance.now();

function animate() {
  const now = performance.now();
  let delta = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;

  // Get input and move player
  const move = input.getMoveDirection();
  player.move(delta, move.x, move.z, world);

  // Update camera
  gameCamera.update();

  // Render
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// --- Handle Window Resize ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log("Higher Streets — Refactored");
console.log("Controls: WASD to move");
