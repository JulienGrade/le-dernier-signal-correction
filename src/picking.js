import * as THREE from 'three';
import { RELAY_IDS } from './state.js';

export function createPicking(
    canvas,
    camera,
    model,
    onSelect,
    onHover
) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  let down = null;

  function getRelayId(event) {
    const rect = canvas.getBoundingClientRect();

    pointer.x =
        ((event.clientX - rect.left) / rect.width) * 2 - 1;

    pointer.y =
        -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObject(model, true);

    const hit = hits.find(({ object }) => {
      for (let parent = object; parent; parent = parent.parent) {
        if (!parent.visible) return false;
      }

      return true;
    });

    let object = hit?.object;

    while (object) {
      if (RELAY_IDS.includes(object.name)) {
        return object.name;
      }

      object = object.parent;
    }

    return null;
  }

  function handleMove(event) {
    if (event.buttons) return;

    const id = getRelayId(event);
    onHover(id, event);
  }

  function handleDown(event) {
    if (!event.isPrimary || event.button !== 0) return;

    down = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };

    onHover(null);
  }

  function handleUp(event) {
    if (!down || down.id !== event.pointerId) return;

    const distance = Math.hypot(
        event.clientX - down.x,
        event.clientY - down.y
    );

    down = null;

    if (distance >= 6) return;

    const id = getRelayId(event);

    if (id) {
      onSelect(id);
    }
  }

  function handleLeave() {
    down = null;
    onHover(null);
  }

  canvas.addEventListener('pointermove', handleMove);
  canvas.addEventListener('pointerdown', handleDown);
  canvas.addEventListener('pointerup', handleUp);
  canvas.addEventListener('pointerleave', handleLeave);
  canvas.addEventListener('pointercancel', handleLeave);

  return function disconnect() {
    canvas.removeEventListener('pointermove', handleMove);
    canvas.removeEventListener('pointerdown', handleDown);
    canvas.removeEventListener('pointerup', handleUp);
    canvas.removeEventListener('pointerleave', handleLeave);
    canvas.removeEventListener('pointercancel', handleLeave);

    onHover(null);
  };
}