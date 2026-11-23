import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const MODEL_URL = new URL('../assets/outpost.glb', import.meta.url).href;

export function createWorld(canvas) {
  // TODO : renderer, scene, camera, resize, controls, recenter, dispose.
  // Retour attendu décrit dans le PDF.
  return null;
}

export async function loadOutpost(scene) {
  // TODO : charger, vérifier, ajouter et retourner le modèle.
  return null;
}

export function createEnvironment(scene) {
  // TODO : lumières, ombres et ciel étoilé.
  return null;
}
