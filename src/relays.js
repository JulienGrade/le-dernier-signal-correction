import * as THREE from 'three';
import { RELAY_IDS } from './state.js';

export function createRelays(model) {
  const relays = new Map();

  for (const id of RELAY_IDS) {
    const root = model.getObjectByName(id);
    const core = model.getObjectByName(`${id}_Core`);

    if (!root || !core?.isMesh) {
      throw new Error(`Relais incomplet dans le modèle : ${id}`);
    }

    core.material = core.material.clone();
    core.material.emissive.set(0x46dce8);
    core.material.emissiveIntensity = 0.1;

    const light = new THREE.PointLight(
        0x56e5ec,
        0,
        4,
        2
    );

    light.position.set(0, 0.6, 0);
    root.add(light);

    relays.set(id, {
      root,
      core,
      light,
      active: false,
    });
  }

  function setActive(id, active) {
    const relay = relays.get(id);

    if (!relay) return;

    relay.active = active;

    relay.core.material.emissiveIntensity = active ? 3 : 0.1;
    relay.light.intensity = active ? 5 : 0;
  }

  function hover(id) {
    for (const [key, relay] of relays) {
      relay.core.material.emissiveIntensity = relay.active
          ? 3
          : key === id
              ? 0.6
              : 0.1;
    }
  }

  function update(time) {
    for (const relay of relays.values()) {
      if (relay.active) {
        relay.light.intensity =
            5 + Math.sin(time * 2) * 0.45;
      }
    }
  }

  return {
    roots: [...relays.values()].map((relay) => relay.root),
    setActive,
    hover,
    update,
  };
}