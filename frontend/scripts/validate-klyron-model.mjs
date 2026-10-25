import fs from 'node:fs/promises';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

globalThis.ProgressEvent ??= class ProgressEvent {
  constructor(type, init = {}) { this.type = type; Object.assign(this, init); }
};

const files = [
  'klyron-story.glb',
  'klyron-detail-architecture.glb',
  'klyron-detail-mechanical-core.glb',
  'klyron-detail-mechanical-upper.glb',
];
const names = new Set();
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

for (const file of files) {
  const path = new URL(`../public/models/${file}`, import.meta.url);
  const data = await fs.readFile(path);
  const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  const gltf = await new Promise((resolve, reject) => loader.parse(arrayBuffer, '', resolve, reject));
  let count = 0;
  gltf.scene.traverse((object) => {
    if (!object.isMesh) return;
    count += 1;
    names.add(object.name);
    if (!object.geometry?.attributes?.position) throw new Error(`${file}: ${object.name} has no positions`);
  });
  console.log(`${file}: ${count} meshes decoded`);
}

for (const required of ['arch|0|wall', 'str|0|col', 'ele|1|device', 'clash|2|c1', 'clashduct|2|d', 'asset|5|ahu']) {
  if (!names.has(required)) throw new Error(`Missing interactive mesh: ${required}`);
}
if (names.size !== 151) throw new Error(`Expected 151 unique meshes, decoded ${names.size}`);
console.log('Progressive model is valid: all 151 interactive meshes preserved.');
