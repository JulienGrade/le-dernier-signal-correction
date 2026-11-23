import * as THREE from 'three';
import { RELAY_IDS } from './state.js';

export function createRelays(model) {
  // TODO : retrouver les coeurs, cloner les matériaux et créer les lumières.
  return {
    roots: [],
    setActive(id, active) { /* TODO */ },
    hover(id) { /* TODO */ },
    update(time) { /* TODO : facultatif, pulsation discrète */ }
  };
}
