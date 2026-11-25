export const RELAY_IDS = ['Relay_01', 'Relay_02', 'Relay_03'];

export function createMission() {
  return {
    active: new Set(),
    phase: 'collecting',
  };
}

export function activateRelay(state, id) {
  if (state.phase !== 'collecting') return false;
  if (!RELAY_IDS.includes(id)) return false;
  if (state.active.has(id)) return false;

  state.active.add(id);

  if (state.active.size === RELAY_IDS.length) {
    state.phase = 'ready';
  }

  return true;
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
  state.active.clear();
  state.phase = 'collecting';
}
