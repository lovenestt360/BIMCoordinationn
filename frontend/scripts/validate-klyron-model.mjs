import fs from 'node:fs/promises';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

globalThis.ProgressEvent ??= class ProgressEvent {
  constructor(type, init = {}) { this.type = type; Object.assign(this, init); }
};

const files = [
  'klyron-story-shell.glb',
  'klyron-story-architecture.glb',
  'klyron-story-structure.glb',
  'klyron-story-systems.glb',
  'klyron-detail-architecture.glb',
  'klyron-detail-mechanical-core.glb',
  'klyron-detail-mechanical-upper.glb',
];
const names = new Set();
const delivered = new Map();
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

async function readMeshes(path) {
  const data = await fs.readFile(path);
  const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  const gltf = await new Promise((resolve, reject) => loader.parse(arrayBuffer, '', resolve, reject));
  const meshes = new Map();
  gltf.scene.traverse((object) => {
    if (!object.isMesh) return;
    if (!object.geometry?.attributes?.position) throw new Error(`${object.name} has no positions`);
    object.geometry.computeBoundingBox();
    meshes.set(object.name, {
      vertices: object.geometry.attributes.position.count,
      min: object.geometry.boundingBox.min.toArray(),
      max: object.geometry.boundingBox.max.toArray(),
    });
  });
  return meshes;
}

for (const file of files) {
  const path = new URL(`../public/models/${file}`, import.meta.url);
  const meshes = await readMeshes(path);
  for (const [name, metrics] of meshes) {
    names.add(name);
    delivered.set(name, metrics);
  }
  console.log(`${file}: ${meshes.size} meshes decoded`);
}

for (const required of ['arch|0|wall', 'str|0|col', 'ele|1|device', 'clash|2|c1', 'clashduct|2|d', 'asset|5|ahu']) {
  if (!names.has(required)) throw new Error(`Missing interactive mesh: ${required}`);
}
if (names.size !== 151) throw new Error(`Expected 151 unique meshes, decoded ${names.size}`);

const source = await readMeshes(new URL('../model-source/klyron-model.glb', import.meta.url));
const close = (a, b) => Math.abs(a - b) < 1e-4;
for (const [name, output] of delivered) {
  const original = source.get(name);
  if (!original) throw new Error(`Delivered mesh is absent from master: ${name}`);
  if (output.vertices !== original.vertices) throw new Error(`${name}: vertex count changed (${original.vertices} -> ${output.vertices})`);
  if (![...output.min, ...output.max].every((value, index) => close(value, [...original.min, ...original.max][index]))) {
    throw new Error(`${name}: geometry bounds changed`);
  }
}
if (source.size !== delivered.size) throw new Error(`Master has ${source.size} meshes but packages deliver ${delivered.size}`);
console.log('Progressive model is lossless: all 151 meshes retain their original vertices and bounds.');
