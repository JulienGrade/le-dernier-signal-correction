export const RELAY_IDS = ['Relay_01', 'Relay_02', 'Relay_03'];

export function createMission() {
  return { active: new Set(), phase: 'collecting' };
}
export function activateRelay(state, id) {
  // TODO : vérifier phase, identifiant et doublon ; ajouter puis compter.
  return false;
}
export function startTransmission(state) {
  // TODO : passer de ready à transmitting si autorisé.
  return false;
}
export function finishTransmission(state) {
  // TODO : passer de transmitting à sent si autorisé.
  return false;
}
export function resetMission(state) {
  // TODO : vider active et restaurer collecting.
}
