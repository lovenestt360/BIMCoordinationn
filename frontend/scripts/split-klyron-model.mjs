import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt, prune } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

// The master BIM stays outside /public so production builds do not deploy the 96 MB source file.
const input = new URL('../model-source/klyron-model.glb', import.meta.url).pathname.replace(/^\/(.:)/, '$1');
const storyArchitecture = new Set(['facade', 'glass', 'wall', 'slab', 'col', 'railing', 'door']);
const firstPaintArchitecture = new Set(['facade', 'glass', 'wall']);
const category = (name) => name.split('|')[2] || '';
const outputs = [
  {
    name: 'story-shell',
    accepts: (name) => name.startsWith('site|')
      || (name.startsWith('arch|') && firstPaintArchitecture.has(category(name))),
  },
  {
    name: 'story-architecture',
    accepts: (name) => name.startsWith('arch|') && storyArchitecture.has(category(name))
      && !firstPaintArchitecture.has(category(name)),
  },
  {
    name: 'story-structure',
    accepts: (name) => name.startsWith('str|'),
  },
  {
    name: 'story-systems',
    accepts: (name) => name.startsWith('ele|') || name.startsWith('clash|')
      || name.startsWith('clashduct|') || name.startsWith('asset|'),
  },
  {
    name: 'detail-architecture',
    accepts: (name) => name.startsWith('arch|') && !storyArchitecture.has(category(name)),
  },
  {
    name: 'detail-mechanical-core',
    accepts: (name) => name.startsWith('mech|') && Number(name.split('|')[1]) <= 2,
  },
  {
    name: 'detail-mechanical-upper',
    accepts: (name) => name.startsWith('mech|') && Number(name.split('|')[1]) > 2,
  },
];

await MeshoptDecoder.ready;
await MeshoptEncoder.ready;

for (const output of outputs) {
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      'meshopt.decoder': MeshoptDecoder,
      'meshopt.encoder': MeshoptEncoder,
    });
  const document = await io.read(input);
  const nodes = [...document.getRoot().listNodes()];
  let kept = 0;

  for (const node of nodes) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    if (output.accepts(mesh.getName() || node.getName() || '')) kept += 1;
    else node.dispose();
  }

  await document.transform(prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  const target = new URL(`../public/models/klyron-${output.name}.glb`, import.meta.url).pathname.replace(/^\/(.:)/, '$1');
  await io.write(target, document);
  console.log(`${output.name}: ${kept} named meshes`);
}
