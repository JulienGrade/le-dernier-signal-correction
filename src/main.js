import './style.css';
import * as THREE from 'three';
import { createWorld } from './world.js';

const canvas = document.querySelector('#scene');
const world = createWorld(canvas);

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshNormalMaterial()
);

cube.position.y = 1;
world.scene.add(cube);

const helper = new THREE.AxesHelper(3);
world.scene.add(helper);

world.renderer.setAnimationLoop(() => {
  world.renderer.render(world.scene, world.camera);
});

document.querySelector('#message').textContent =
    'Première scène prête.';