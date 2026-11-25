import './style.css';

import {
  createWorld,
  loadOutpost,
  createEnvironment,
  disposeResources,
} from './world.js';

import { createPicking } from './picking.js';
import { createRelays } from './relays.js';
import { createTransmission } from './transmission.js';

import {
  createMission,
  activateRelay,
  resetMission,
  startTransmission,
  finishTransmission,
  RELAY_IDS,
} from './state.js';

const canvas = document.querySelector('#scene');
const message = document.querySelector('#message');
const tooltip = document.querySelector('#tooltip');

const powerReadout = document.querySelector('#power');
const statusTag = document.querySelector('#status-tag');

const transmitButton = document.querySelector('#transmit');
const restartButton = document.querySelector('#restart');
const motionButton = document.querySelector('#motion');
const viewResetButton = document.querySelector('#view-reset');

const powerBars = [
  ...document.querySelectorAll('.power-track i'),
];

const relayButtons = [
  ...document.querySelectorAll('[data-relay]'),
];

const relayLabels = {
  Relay_01: 'Relais Alpha',
  Relay_02: 'Relais Bêta',
  Relay_03: 'Relais Gamma',
};

const statuses = {
  collecting: 'HORS LIGNE',
  ready: 'PRÊT',
  transmitting: 'TRANSMISSION',
  sent: 'SIGNAL ENVOYÉ',
};

const messages = {
  collecting:
      'Sélectionnez les relais dans la scène ou dans la liste.',
  ready:
      'Énergie rétablie. L’antenne est prête à transmettre.',
  transmitting:
      'Alignement de l’antenne… Transmission en cours.',
  sent:
      'Signal transmis. Notre position voyage parmi les étoiles.',
};

const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
);

const state = createMission();
const removeListeners = [];

let world = null;
let relays = null;
let transmission = null;
let disconnectPicking = null;

let ready = false;
let paused = false;
let disposed = false;

let previous = performance.now();
let elapsed = 0;

function listen(target, type, handler, options) {
  target.addEventListener(type, handler, options);

  removeListeners.push(() => {
    target.removeEventListener(type, handler, options);
  });
}

function updateInterface() {
  powerReadout.textContent =
      `${state.active.size} / 3`;

  powerBars.forEach((bar, index) => {
    bar.classList.toggle(
        'on',
        index < state.active.size
    );
  });

  for (const button of relayButtons) {
    const id = button.dataset.relay;
    const active = state.active.has(id);

    button.disabled =
        !ready ||
        active ||
        state.phase !== 'collecting';

    button.classList.toggle('on', active);

    button.querySelector('.relay-state').textContent =
        active ? 'Actif' : 'Éteint';

    button.setAttribute(
        'aria-label',
        `${active ? 'Actif' : 'Activer'} : ${relayLabels[id]}`
    );
  }

  transmitButton.disabled =
      !ready || state.phase !== 'ready';

  restartButton.disabled = !ready;
  motionButton.disabled = !ready;
  viewResetButton.disabled = !ready;

  motionButton.setAttribute(
      'aria-pressed',
      String(paused)
  );

  motionButton.textContent = paused
      ? 'Reprendre'
      : 'Mettre en pause';

  statusTag.textContent = statuses[state.phase];

  if (ready) {
    message.textContent =
        messages[state.phase] +
        (paused ? ' Animations en pause.' : '');
  }
}

function requestActivation(id) {
  if (!ready || disposed) return;
  if (!activateRelay(state, id)) return;

  relays.setActive(id, true);
  updateInterface();
}

function requestTransmission() {
  if (!ready || disposed) return;
  if (!startTransmission(state)) return;

  transmission.start();

  if (reducedMotion.matches) {
    transmission.update(0, true);
  }

  updateInterface();
}

function restartMission() {
  if (!ready || disposed) return;

  resetMission(state);
  transmission.reset();

  for (const id of RELAY_IDS) {
    relays.setActive(id, false);
  }

  relays.hover(null);

  tooltip.hidden = true;
  canvas.style.cursor = 'grab';

  paused = false;
  elapsed = 0;
  previous = performance.now();

  world.recenter();
  updateInterface();
}

function togglePause() {
  if (!ready || disposed) return;

  paused = !paused;
  previous = performance.now();

  updateInterface();
}

function recenterView() {
  if (!ready || disposed) return;

  world.recenter();
}

function applyMotionPreference() {
  if (!relays || disposed) return;

  if (reducedMotion.matches) {
    for (const id of RELAY_IDS) {
      relays.setActive(id, state.active.has(id));
    }

    relays.hover(null);
    transmission?.update(0, true);
  }
}

function handleHover(id, event) {
  if (disposed) return;

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

function renderFrame(now) {
  if (disposed || !world) return;

  const delta = Math.min(
      Math.max((now - previous) / 1000, 0),
      0.05
  );

  previous = now;

  if (!paused && !document.hidden) {
    elapsed += delta;

    if (relays && !reducedMotion.matches) {
      relays.update(elapsed);
    }

    transmission?.update(
        delta,
        reducedMotion.matches
    );
  }

  world.controls.update();

  world.renderer.render(
      world.scene,
      world.camera
  );
}

function dispose() {
  if (disposed) return;

  disposed = true;
  ready = false;

  updateInterface();

  tooltip.hidden = true;
  canvas.style.cursor = 'default';

  world?.renderer.setAnimationLoop(null);

  disconnectPicking?.();
  disconnectPicking = null;

  for (const remove of removeListeners.splice(0)) {
    remove();
  }

  world?.dispose();
}

function handleError(error) {
  if (disposed) return;

  console.error(
      'Échec du chargement de la scène :',
      error
  );

  dispose();

  message.textContent =
      `Impossible de préparer l’avant-poste : ${error.message}. ` +
      'Rechargez la page pour réessayer.';
}

async function boot() {
  message.textContent =
      'Chargement de l’avant-poste…';

  updateInterface();

  for (const button of relayButtons) {
    listen(button, 'click', () => {
      requestActivation(button.dataset.relay);
    });
  }

  listen(
      transmitButton,
      'click',
      requestTransmission
  );

  listen(
      restartButton,
      'click',
      restartMission
  );

  listen(
      motionButton,
      'click',
      togglePause
  );

  listen(
      viewResetButton,
      'click',
      recenterView
  );

  listen(
      reducedMotion,
      'change',
      applyMotionPreference
  );

  listen(document, 'visibilitychange', () => {
    previous = performance.now();
  });

  listen(window, 'pageshow', () => {
    previous = performance.now();
  });

  listen(window, 'pagehide', (event) => {
    if (!event.persisted) {
      dispose();
    }
  });

  try {
    world = createWorld(canvas);

    createEnvironment(world.scene);

    previous = performance.now();

    world.renderer.setAnimationLoop(renderFrame);

    const model = await loadOutpost(world.scene);

    if (disposed) {
      world.scene.remove(model);
      disposeResources(model);
      return;
    }

    relays = createRelays(model);

    transmission = createTransmission(
        world.scene,
        model,
        () => {
          if (disposed) return;

          if (finishTransmission(state)) {
            updateInterface();
          }
        }
    );

    disconnectPicking = createPicking(
        canvas,
        world.camera,
        model,
        requestActivation,
        handleHover
    );

    ready = true;

    applyMotionPreference();
    updateInterface();
  } catch (error) {
    handleError(error);
  }
}

boot();