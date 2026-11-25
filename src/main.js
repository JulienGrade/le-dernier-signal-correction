import './style.css';
import { createWorld, loadOutpost, createEnvironment } from './world.js';
import { createPicking } from './picking.js';

const canvas = document.querySelector('#scene');
const message = document.querySelector('#message');
const tooltip = document.querySelector('#tooltip');

const relayLabels = {
  Relay_01: 'Relais Alpha',
  Relay_02: 'Relais Bêta',
  Relay_03: 'Relais Gamma',
};

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

    const disconnectPicking = createPicking(
        canvas,
        world.camera,
        model,

        (id) => {
          console.log('Relais sélectionné :', id);

          message.textContent =
              `Relais sélectionné : ${relayLabels[id]}`;
        },

        (id, event) => {
          tooltip.hidden = !id;
          canvas.style.cursor = id ? 'pointer' : 'grab';

          if (!id || !event) return;

          const rect = canvas.getBoundingClientRect();

          tooltip.textContent = relayLabels[id];

          const left = Math.max(
              8,
              Math.min(
                  event.clientX - rect.left + 15,
                  rect.width - 160
              )
          );

          const top = Math.max(
              70,
              event.clientY - rect.top - 35
          );

          tooltip.style.left = `${left}px`;
          tooltip.style.top = `${top}px`;
        }
    );

    window.addEventListener('pagehide', (event) => {
      if (!event.persisted) {
        disconnectPicking();
      }
    });
  } catch (error) {
    console.error('Échec du chargement de la scène :', error);

    message.textContent =
        `Impossible de préparer l’avant-poste : ${error.message}`;
  }
}

boot();