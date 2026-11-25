import './style.css';
import * as THREE from 'three';
import { createWorld, loadOutpost } from './world.js';

const canvas = document.querySelector('#scene');
const message = document.querySelector('#message');

async function boot() {
  message.textContent = 'Chargement de l’avant-poste…';

  try {
    const world = createWorld(canvas);

    const temporaryLight = new THREE.HemisphereLight(
        0xd4e9ff,
        0x242733,
        3
    );

    world.scene.add(temporaryLight);

    world.renderer.setAnimationLoop(() => {
      world.renderer.render(world.scene, world.camera);
    });

    const model = await loadOutpost(world.scene);

    console.log('Avant-poste chargé :', model);

    message.textContent = 'Avant-poste chargé.';
  } catch (error) {
    console.error('Échec du chargement de la scène :', error);

    message.textContent =
        `Impossible de préparer l’avant-poste : ${error.message}`;
  }
}

boot();