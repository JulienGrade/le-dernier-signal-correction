import './style.css';
import { createWorld, loadOutpost, createEnvironment } from './world.js';

const canvas = document.querySelector('#scene');
const message = document.querySelector('#message');

async function boot() {
  message.textContent = 'Chargement de l’avant-poste…';

  try {
    const world = createWorld(canvas);

    const resetViewButton = document.querySelector('#view-reset');

    resetViewButton.addEventListener('click', () => {
      world.recenter();
    });

    createEnvironment(world.scene);

    world.renderer.setAnimationLoop(() => {
      world.controls.update();

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