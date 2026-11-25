import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const MODEL_URL = new URL('../assets/outpost.glb', import.meta.url).href;

export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
      37,
      1,
      0.1,
      150
  );

  camera.position.set(10.8, 8, 13.5);
  camera.lookAt(0, 0.25, 0);

  function resize() {
    const { width, height } = canvas.getBoundingClientRect();

    if (width === 0 || height === 0) return;

    renderer.setSize(width, height, false);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  resize();

  return {
    renderer,
    scene,
    camera,

    dispose() {
      observer.disconnect();
      renderer.dispose();
    },
  };
}

export async function loadOutpost(scene) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(MODEL_URL);

  const model = gltf.scene;

  const requiredNames = [
    'Relay_01',
    'Relay_02',
    'Relay_03',
    'Pivot_Antenna',
  ];

  for (const name of requiredNames) {
    const object = model.getObjectByName(name);

    if (!object) {
      throw new Error(`Objet requis absent du GLB : ${name}`);
    }
  }

  model.traverse((object) => {
    if (!object.isMesh) return;

    object.castShadow = true;
    object.receiveShadow = true;
  });

  scene.add(model);

  return model;
}

export function createEnvironment(scene) {
  const ambient = new THREE.HemisphereLight(
      0xa9cfff,
      0x172030,
      2.3
  );

  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffe5c5, 4.5);
  sun.position.set(5, 9, 7);
  sun.castShadow = true;

  sun.shadow.mapSize.set(2048, 2048);

  Object.assign(sun.shadow.camera, {
    left: -7,
    right: 7,
    top: 7,
    bottom: -7,
    near: 0.5,
    far: 30,
  });

  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.normalBias = 0.035;

  scene.add(sun);

  const rim = new THREE.DirectionalLight(0x57bfff, 3.4);
  rim.position.set(-7, 4, -6);

  scene.add(rim);

  const count = 1800;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const y = Math.random() * 2 - 1;
    const radius = 40 + Math.random() * 25;

    const horizontal = Math.sqrt(1 - y * y);

    positions[i * 3] =
        Math.cos(angle) * horizontal * radius;

    positions[i * 3 + 1] = y * radius;

    positions[i * 3 + 2] =
        Math.sin(angle) * horizontal * radius;
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xc4dcff,
    size: 0.085,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });

  const stars = new THREE.Points(geometry, material);

  scene.add(stars);

  return { stars };
}
