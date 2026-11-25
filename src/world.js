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

  scene.add(model);

  return model;
}

export function createEnvironment(scene) {
  // TODO : lumières, ombres et ciel étoilé.
  return null;
}
