// main.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ------------------
// DOM
// ------------------
const fadeOverlay = document.getElementById('fade-overlay');

// ------------------
// GLOBALS
// ------------------
let flavorData = [];
let music;

// ------------------
// SCENE SETUP
// ------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 1;
controls.maxDistance = 3;
controls.target.set(0, 1, 0);
controls.update();

// Position camera INSIDE shop
camera.position.set(0, 1.6, 3); 
controls.target.set(0, 1.4, -2); 
controls.update();

// ------------------
// LOAD DATA
// ------------------
fetch('./data/flavors.json')
  .then(res => res.json())
  .then(data => {
    flavorData = data;
    console.log("DATA LOADED", data);
  });

// ------------------
// AUDIO (UNCHANGED, JUST CLEANED)
// ------------------
music = new Tone.Player({
  url: './assets/audio/music.mp3',
  loop: true,
  autostart: false
}).toDestination();

Tone.loaded().then(() => {
  console.log("Music loaded");
});

// Start audio ONCE on first click
window.addEventListener('click', async () => {
  await Tone.start();

  if (music.state !== "started") {
    await Tone.loaded();
    music.start();
  }
}, { once: true });

// ------------------
// MODEL LOADING
// ------------------
const loader = new GLTFLoader();

// LOAD SHOP (BACKGROUND)
loader.load('./assets/models/Shop.glb', (gltf) => {
  const shop = gltf.scene;

  // 🚨 SCALE UP A LOT
  shop.scale.set(5, 5, 5); // try 5–10 depending on model

  // Move floor to y = 0
  const box = new THREE.Box3().setFromObject(shop);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  shop.position.sub(center);
  shop.position.y += size.y / 2;

  scene.add(shop);

  console.log("SHOP LOADED", size);
});
// ------------------
// LIGHTING
// ------------------
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 1.2);
fillLight.position.set(0, 5, 5);
scene.add(fillLight);

// ------------------
// ANIMATION LOOP
// ------------------
function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
}

animate();

// ------------------
// RESPONSIVE
// ------------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.6;
});