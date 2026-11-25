import './style.css';

import {
  createWorld,
  loadOutpost,
  createEnvironment,
} from './world.js';

import { createPicking } from './picking.js';
import { createRelays } from './relays.js';

import {
  createMission,
  activateRelay,
  resetMission,
  RELAY_IDS,
} from './state.js';

const canvas = document.querySelector('#scene');
const message = document.querySelector('#message');
const tooltip = document.querySelector('#tooltip');

const relayButtons = [
  ...document.querySelectorAll('[data-relay]'),
];

const relayLabels = {
  Relay_01: 'Relais Alpha',
  Relay_02: 'Relais Bêta',
  Relay_03: 'Relais Gamma',
};

const state = createMission();

let ready = false;
let relays = null;

function updateInterface() {
  document.querySelector('#power').textContent =
      `${state.active.size} / 3`;

  document.querySelectorAll('.power-track i').forEach((bar, index) => {
    bar.classList.toggle('on', index < state.active.size);
  });

  for (const button of relayButtons) {
    const id = button.dataset.relay;
    const active = state.active.has(id);

    button.disabled =
        !ready || active || state.phase !== 'collecting';

    button.classList.toggle('on', active);

    button.querySelector('.relay-state').textContent =
        active ? 'Actif' : 'Éteint';

    button.setAttribute(
        'aria-label',
        `${active ? 'Actif' : 'Activer'} : ${relayLabels[id]}`
    );
  }

  document.querySelector('#transmit').disabled =
      !ready || state.phase !== 'ready';

  document.querySelector('#restart').disabled = !ready;

  document.querySelector('#status-tag').textContent =
      state.phase === 'ready' ? 'PRÊT' : 'HORS LIGNE';

  if (ready) {
    message.textContent = state.phase === 'ready'
        ? 'Énergie rétablie. L’antenne est prête à transmettre.'
        : 'Sélectionnez les relais dans la scène ou dans la liste.';
  }
}

function requestActivation(id) {
  if (!ready) return;

  const activated = activateRelay(state, id);

  if (!activated) return;

  relays.setActive(id, true);
  updateInterface();
}

async function boot() {
  message.textContent = 'Chargement de l’avant-poste…';

  try {
    const world = createWorld(canvas);

    createEnvironment(world.scene);

    document.querySelector('#view-reset').addEventListener(
        'click',
        () => world.recenter()
    );

    world.renderer.setAnimationLoop((now) => {
      world.controls.update();

      if (relays) {
        relays.update(now / 1000);
      }

      world.renderer.render(world.scene, world.camera);
    });

    const model = await loadOutpost(world.scene);

    relays = createRelays(model);

    const disconnectPicking = createPicking(
        canvas,
        world.camera,
        model,
        requestActivation,

        (id, event) => {
          relays.hover(id);

          tooltip.hidden = !id;
          canvas.style.cursor = id ? 'pointer' : 'grab';

          if (!id || !event) return;

          const rect = canvas.getBoundingClientRect();

          tooltip.textContent =
              relayLabels[id] +
              (state.active.has(id) ? ' · actif' : '');

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

    for (const button of relayButtons) {
      button.addEventListener('click', () => {
        requestActivation(button.dataset.relay);
      });
    }

    document.querySelector('#restart').addEventListener('click', () => {
      resetMission(state);

      for (const id of RELAY_IDS) {
        relays.setActive(id, false);
      }

      relays.hover(null);
      tooltip.hidden = true;

      world.recenter();
      updateInterface();
    });

    window.addEventListener('pagehide', (event) => {
      if (!event.persisted) {
        disconnectPicking();
      }
    });

    ready = true;
    updateInterface();
  } catch (error) {
    console.error('Échec du chargement de la scène :', error);

    message.textContent =
        `Impossible de préparer l’avant-poste : ${error.message}`;
  }
}

boot();