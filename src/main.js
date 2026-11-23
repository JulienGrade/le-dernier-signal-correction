import './style.css';
import { createWorld, loadOutpost, createEnvironment } from './world.js';
import { createMission, activateRelay, startTransmission,
  finishTransmission, resetMission, RELAY_IDS } from './state.js';
import { createRelays } from './relays.js';
import { createPicking } from './picking.js';
import { createTransmission } from './transmission.js';

const canvas = document.querySelector('#scene');
const state = createMission();
document.querySelector('#message').textContent =
  'Étape 1 : créez votre scène dans src/world.js et src/main.js.';

async function boot() {
  // TODO 1 : créer le monde et une seule boucle de rendu.
  // TODO 2 : attendre le GLB ; gérer chargement et erreur.
  // TODO 3 : créer l'environnement.
  // TODO 4 : mettre à jour les contrôles et relier le recentrage.
  // TODO 5 : brancher sélection et survol sur le modèle.
  // TODO 6 : relier état, apparence et commandes HTML.
  // TODO 7 : créer et piloter la transmission.
  // TODO 8 : pause, réduction des animations et nettoyage.
}

boot();
