import * as THREE from 'three';

export const TRANSMISSION_DURATION = 4.5;

export function createTransmission(scene, model, onComplete) {
  const pivot = model.getObjectByName('Pivot_Antenna');

  if (!pivot) {
    throw new Error('Pivot_Antenna absent du modèle.');
  }

  const initialRotation = pivot.rotation.y;

  const origin = new THREE.Vector3();
  pivot.getWorldPosition(origin);

  const geometry = new THREE.TorusGeometry(
      1,
      0.025,
      8,
      96
  );

  const rings = [];

  for (let i = 0; i < 3; i++) {
    const material = new THREE.MeshBasicMaterial({
      color: 0x7ae9fa,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });

    const ring = new THREE.Mesh(geometry, material);

    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(origin);
    ring.visible = false;

    scene.add(ring);
    rings.push(ring);
  }

  let elapsed = 0;
  let running = false;

  function reset() {
    running = false;
    elapsed = 0;

    pivot.rotation.y = initialRotation;

    for (const ring of rings) {
      ring.visible = false;
      ring.material.opacity = 0;
      ring.scale.setScalar(1);
      ring.position.copy(origin);
    }
  }

  function start() {
    if (running) return;

    reset();
    running = true;
  }

  function update(delta, reducedMotion = false) {
    if (!running) return;

    elapsed = Math.min(
        elapsed + delta,
        TRANSMISSION_DURATION
    );

    const progress = Math.min(elapsed / 1.5, 1);

    const eased =
        progress * progress * (3 - 2 * progress);

    pivot.rotation.y =
        initialRotation +
        Math.PI * 0.65 * (reducedMotion ? 1 : eased);

    rings.forEach((ring, index) => {
      const delay = 1.5 + index * 0.45;
      const waveProgress = (elapsed - delay) / 2;

      ring.visible =
          !reducedMotion &&
          waveProgress >= 0 &&
          waveProgress < 1;

      if (!ring.visible) return;

      ring.scale.setScalar(1 + waveProgress * 8);

      ring.position.y =
          origin.y + waveProgress * 3;

      ring.material.opacity =
          (1 - waveProgress) * 0.8;
    });

    if (elapsed >= TRANSMISSION_DURATION) {
      running = false;

      for (const ring of rings) {
        ring.visible = false;
      }

      onComplete();
    }
  }

  return {
    start,
    update,
    reset,
  };
}