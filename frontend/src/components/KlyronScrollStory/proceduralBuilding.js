import * as THREE from 'three';

// Lightweight presentation geometry for the guided scroll sequence. The shapes are
// deliberately simple: the detailed authored BIM is reserved for Explore mode.
export function buildProceduralBuilding(addElement) {
  const created = [];
  const addBox = (name, size, position, qty = {}) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size));
    mesh.name = name;
    mesh.position.set(...position);
    mesh.userData.qty = qty;
    created.push(addElement(mesh, true));
    return mesh;
  };
  const addPipe = (name, radius, length, position, axis = 'x') => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 8));
    mesh.name = name;
    mesh.position.set(...position);
    if (axis === 'x') mesh.rotation.z = Math.PI / 2;
    if (axis === 'z') mesh.rotation.x = Math.PI / 2;
    created.push(addElement(mesh, true));
    return mesh;
  };

  // Seven readable floor plates and a sparse frame communicate the building far more
  // cheaply than hundreds of exported BIM objects.
  for (let level = 0; level < 7; level += 1) {
    const y = level * 4;
    addBox(`str|${level}|slab`, [27, .42, 19], [0, y, 0], {conc: 92});
    if (level < 6) {
      for (const x of [-11.2, 0, 11.2]) for (const z of [-7.2, 7.2]) {
        addBox(`str|${level}|col`, [.48, 3.8, .48], [x, y + 2.05, z], {conc: 2.1});
      }
    }
  }

  // A clean glazed envelope: broad glass bands, dark mullions and pale end walls.
  for (let level = 0; level < 6; level += 1) {
    const y = level * 4 + 2.05;
    addBox(`arch|${level}|glass`, [25.8, 3.15, .16], [0, y, 9.42], {glass: 81});
    addBox(`arch|${level}|glass`, [25.8, 3.15, .16], [0, y, -9.42], {glass: 81});
    addBox(`arch|${level}|wall`, [.22, 3.35, 18.4], [-13.38, y, 0]);
    addBox(`arch|${level}|wall`, [.22, 3.35, 18.4], [13.38, y, 0]);
    for (const x of [-8.5, -4.25, 0, 4.25, 8.5]) {
      addBox(`arch|${level}|facade`, [.12, 3.45, .28], [x, y, 9.5]);
      addBox(`arch|${level}|facade`, [.12, 3.45, .28], [x, y, -9.5]);
    }
  }
  addBox('arch|6|wall', [28, 1.05, 20], [0, 24.65, 0]);

  // Discipline cues used by federation, coordination and quantity chapters.
  for (let level = 0; level < 6; level += 1) {
    const y = level * 4 + 3.25;
    addBox(`ele|${level}|tray`, [20, .18, .42], [0, y, 2.8], {tray: 20});
    addBox(`mech|${level}|duct`, [18, .58, .82], [0, y - .45, -2.1], {mep: 18});
    addPipe(`mech|${level}|pipe`, .12, 17, [0, y - .75, 4.8], 'x');
  }

  // Purpose-built demonstration objects align with the existing clash and COBie views.
  addBox('clash|2|c1', [8, .22, .45], [1.28, 10.78, 3], {tray: 8});
  addBox('clash|2|c2', [.45, .22, 8], [4.14, 10.78, -4.2], {tray: 8});
  addBox('clash|2|c3', [6, .22, .45], [2.42, 10.63, 1.6], {tray: 6});
  addBox('clashduct|2|duct', [14, .7, 1.25], [2.4, 10.72, 0.2]);
  addBox('asset|5|equip', [4.2, 2.4, 2.7], [5.1, 22.2, 3.7]);
  addBox('asset|5|equip', [1.4, .8, 1.4], [5.1, 23.75, 3.7]);

  return created;
}
