/**
 * Klyron Consulting - procedural city around the BIM model (Three.js)
 * Late-afternoon coastal city: office district around the site, high-rise towers further out and along the
 * beachfront, suburbs with pitched roofs, streets with moving traffic, trees, beach, sea with boats, hazy hills.
 * Generated from a fixed seed, so it looks the same on every visit. Plain ASCII on purpose.
 *
 * Usage:  const city = buildCity(scene, {renderer});
 *         each frame: city.update(seconds, dim, camera);   // dim 0 = daylight city, 1 = dark studio (inside views)
 *         city.dispose();
 * The sun direction is exported as SUN_DIR so the scene's real sun (and the building's real shadow) match the
 * painted shadows of the city.
 */
import * as THREE from 'three';

export const SUN_DIR = new THREE.Vector3(-0.45, 0.55, 0.7).normalize();   // late afternoon, from the side so facades read in light and shade
export const GROUND = -0.15;            // street level, just under the Level 00 floor of the model
const ROAD = 14;                        // carriageway incl. kerbs
const SITE = {x0: -64, x1: 86, z0: -104, z1: 112};   // the BIM block: an open plaza kept free for the exploded views
const CENTER = [11, 4];
const COAST = -330;                     // centre line of the beach road; beach and sea beyond
const EXT_X = 760, EXT_Z = 760;         // street grid extent

const HOR = new THREE.Color(0xd9d3c3), DARK = new THREE.Color(0x0a131c);

function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/* ---------- geometry batch: flat-shaded triangles with vertex colours (and optional uvs) ---------- */
class Batch {
  constructor(uv = false) { this.p = []; this.n = []; this.c = []; this.uv = uv ? [] : null; }
  tri(a, b, c, col, ta, tb, tc) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    this.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    for (let i = 0; i < 3; i++) { this.n.push(nx, ny, nz); this.c.push(col.r, col.g, col.b); }
    if (this.uv) this.uv.push(ta[0], ta[1], tb[0], tb[1], tc[0], tc[1]);
  }
  quad(a, b, c, d, col, t) { if (t) { this.tri(a, b, c, col, t[0], t[1], t[2]); this.tri(a, c, d, col, t[0], t[2], t[3]); } else { this.tri(a, b, c, col); this.tri(a, c, d, col); } }
  flat(x0, z0, x1, z1, y, col) { this.quad([x0, y, z1], [x1, y, z1], [x1, y, z0], [x0, y, z0], col); }
  box(x0, y0, z0, x1, y1, z1, col, bottom = false) {
    this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], col);
    this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], col);
    this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], col);
    this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], col);
    this.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], col);
    if (bottom) this.quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], col);
  }
  /** four textured walls; u runs continuously around the building, v counts storeys from street level */
  sides(x0, y0, z0, x1, y1, z1, col, tile, uo = 0) {
    const v0 = (y0 - GROUND) / tile.h, v1 = (y1 - GROUND) / tile.h;
    const faces = [
      [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], x1 - x0],
      [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], z1 - z0],
      [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], x1 - x0],
      [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], z1 - z0],
    ];
    let u = uo;
    for (const [a, b, c, d, w] of faces) {
      const u1 = u + w / tile.w;
      this.quad(a, b, c, d, col, [[u, v0], [u1, v0], [u1, v1], [u, v1]]);
      u = u1;
    }
  }
  /** pitched roof; ridge along x (alongX) or z */
  gable(x0, z0, x1, z1, yb, rh, col, alongX) {
    const yr = yb + rh;
    if (alongX) {
      const zm = (z0 + z1) / 2;
      this.quad([x0, yb, z1], [x1, yb, z1], [x1, yr, zm], [x0, yr, zm], col);
      this.quad([x1, yb, z0], [x0, yb, z0], [x0, yr, zm], [x1, yr, zm], col);
      this.tri([x1, yb, z1], [x1, yb, z0], [x1, yr, zm], col);
      this.tri([x0, yb, z0], [x0, yb, z1], [x0, yr, zm], col);
    } else {
      const xm = (x0 + x1) / 2;
      this.quad([x1, yb, z1], [x1, yb, z0], [xm, yr, z0], [xm, yr, z1], col);
      this.quad([x0, yb, z0], [x0, yb, z1], [xm, yr, z1], [xm, yr, z0], col);
      this.tri([x0, yb, z1], [x1, yb, z1], [xm, yr, z1], col);
      this.tri([x1, yb, z0], [x0, yb, z0], [xm, yr, z0], col);
    }
  }
  /** box with separate side and top colours (open bottom) */
  box2(x0, y0, z0, x1, y1, z1, side, top) {
    this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], side);
    this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], side);
    this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], side);
    this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], side);
    this.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], top);
  }
  /** append any BufferGeometry, transformed, as flat triangles in one colour (optional per-triangle shade jitter) */
  geo(geo, mtx, col, jitter = 0, rj = Math.random) {
    const g = geo.index ? geo.toNonIndexed() : geo, p = g.attributes.position, v = new THREE.Vector3(), c = new THREE.Color();
    for (let i = 0; i < p.count; i += 3) {
      const t = [];
      for (let k = 0; k < 3; k++) { v.fromBufferAttribute(p, i + k).applyMatrix4(mtx); t.push([v.x, v.y, v.z]); }
      c.copy(col); if (jitter) c.offsetHSL(0, 0, (rj() - .5) * jitter);
      this.tri(t[0], t[1], t[2], c);
    }
    if (g !== geo) g.dispose();
  }
  get empty() { return this.p.length === 0; }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    if (this.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.computeBoundingSphere();
    return g;
  }
}

/* ---------- facade textures (canvas, daylight) ---------- */
function canvasTex(W, H, draw) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; draw(c.getContext('2d'), W, H);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function noise(g, W, H, r, a, cols) { for (let i = 0; i < W * H / 6; i++) { g.globalAlpha = a * r(); g.fillStyle = cols[(r() * cols.length) | 0]; g.fillRect((r() * W) | 0, (r() * H) | 0, 2, 1); } g.globalAlpha = 1; }
function glassPanel(g, x, y, w, h, top, bottom, r) {
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, top); gr.addColorStop(1, bottom);
  g.fillStyle = gr; g.fillRect(x, y, w, h);
  g.globalAlpha = .05 + r() * .12; g.fillStyle = r() < .5 ? '#ffffff' : '#0b1720'; g.fillRect(x, y, w, h); g.globalAlpha = 1;
}
function facadeTextures(r) {
  const T = {};
  // curtain-wall office: 1.6 m bays, 3.9 m floors
  T.glass = {w: 8 * 1.6, h: 16 * 3.9, map: canvasTex(256, 512, (g, W, H) => {
    g.fillStyle = '#56646d'; g.fillRect(0, 0, W, H);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) {
      const px = x * 32, py = y * 32;
      if (r() < .12) { g.fillStyle = '#6a7880'; g.fillRect(px, py, 32, 23); }
      else glassPanel(g, px, py, 32, 23, '#b6cbd6', '#6f8a99', r);
    }
    g.fillStyle = '#dfe4e7'; for (let x = 0; x < 8; x++) g.fillRect(x * 32, 0, 2, H); for (let y = 0; y < 16; y++) { g.fillRect(0, y * 32 + 23, W, 2); g.fillRect(0, y * 32, W, 1); }
  })};
  // residential tower: 2.6 m bays, 3.1 m floors, full-height sliding doors behind balconies
  T.residential = {w: 8 * 2.6, h: 16 * 3.1, map: canvasTex(256, 512, (g, W, H) => {
    g.fillStyle = '#f5f1ea'; g.fillRect(0, 0, W, H); noise(g, W, H, r, .08, ['#d9d2c4', '#ffffff']);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) {
      const px = x * 32, py = y * 32;
      if (x % 4 === 3) { g.fillStyle = '#e4ddd0'; g.fillRect(px + 10, py + 9, 12, 14); continue; }
      glassPanel(g, px + 3, py + 6, 26, 24, '#9fb3c0', '#4c5d69', r);
      if (r() < .3) { g.fillStyle = '#efe6d6'; g.fillRect(px + 3, py + 6, 8 + r() * 10, 24); }
      g.fillStyle = '#ffffff'; g.fillRect(px + 15, py + 6, 2, 24);
    }
    g.fillStyle = '#ffffff'; for (let y = 0; y < 16; y++) g.fillRect(0, y * 32 + 30, W, 2);
  })};
  // stone office: 3.0 m bays, 3.9 m floors, punched windows
  T.stone = {w: 8 * 3, h: 16 * 3.9, map: canvasTex(256, 512, (g, W, H) => {
    g.fillStyle = '#ddd1bb'; g.fillRect(0, 0, W, H); noise(g, W, H, r, .12, ['#cbbda4', '#efe5d2']);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) {
      const px = x * 32, py = y * 32;
      glassPanel(g, px + 8, py + 6, 16, 19, '#7e95a6', '#3c4b58', r);
      g.fillStyle = '#f3ecdf'; g.fillRect(px + 6, py + 25, 20, 2);
    }
    g.fillStyle = '#cbbfa8'; for (let y = 0; y < 16; y++) g.fillRect(0, y * 32, W, 1);
  })};
  // brick mid-rise: 2.7 m bays, 3.3 m floors
  T.brick = {w: 8 * 2.7, h: 16 * 3.3, map: canvasTex(256, 512, (g, W, H) => {
    g.fillStyle = '#b4644a'; g.fillRect(0, 0, W, H); noise(g, W, H, r, .25, ['#9b5038', '#c87a5c', '#a85a40']);
    g.globalAlpha = .18; g.fillStyle = '#6e3626'; for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 1); g.globalAlpha = 1;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) {
      const px = x * 32, py = y * 32;
      g.fillStyle = '#f1ede6'; g.fillRect(px + 7, py + 5, 18, 21);
      glassPanel(g, px + 9, py + 7, 14, 17, '#8ea3b2', '#3f4d59', r);
      g.fillStyle = '#f1ede6'; g.fillRect(px + 15, py + 7, 2, 17);
    }
  })};
  // house: 3.2 m bays, 3.2 m floors (wall is white; each house is tinted by its vertex colour)
  T.house = {w: 2 * 3.2, h: 2 * 3.2, map: canvasTex(64, 64, (g, W, H) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
    for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
      const px = x * 32, py = y * 32;
      g.fillStyle = '#f7f7f7'; g.fillRect(px + 8, py + 9, 16, 14);
      glassPanel(g, px + 10, py + 11, 12, 10, '#9db1bf', '#4a5966', r);
    }
  })};
  return T;
}

/* convex hull of 2D points (monotone chain) */
function hull(pts) {
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of pts) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

export function buildCity(scene, {seed = 11, renderer = null} = {}) {
  const r = rng(seed), group = new THREE.Group(); group.name = 'city'; scene.add(group);
  const rd = rng(seed * 7 + 3), rs = rng(seed * 13 + 5), rv = rng(seed * 17 + 9);   // separate streams: facade detail, site design, vegetation
  const disposables = [];
  const keep = (o) => { disposables.push(o); return o; };
  const C = (h) => new THREE.Color(h);
  const pick = (a) => a[(r() * a.length) | 0];
  const SH = [-SUN_DIR.x / SUN_DIR.y, -SUN_DIR.z / SUN_DIR.y];   // ground shadow offset per metre of height

  /* ---------- sky dome (follows the camera) ---------- */
  const skyGeo = keep(new THREE.SphereGeometry(2500, 40, 20));
  const skyMat = keep(new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      top: {value: C(0x86a9c9)}, mid: {value: C(0xb8cbd8)}, hor: {value: HOR.clone()}, sunDir: {value: SUN_DIR.clone()},
      sunCol: {value: C(0xffd9a6)}, dark: {value: DARK.clone()}, dim: {value: 0},
    },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top, mid, hor, sunCol, dark, sunDir; uniform float dim; varying vec3 vP;
      void main(){
        float h = vP.y;
        vec3 c = mix(hor, mid, smoothstep(0.0, 0.2, h)); c = mix(c, top, smoothstep(0.2, 0.85, h));
        float s = max(dot(vP, sunDir), 0.0);
        c += sunCol * (pow(s, 5.0) * 0.32 + pow(s, 700.0) * 2.5);
        c = mix(c, hor, 1.0 - smoothstep(-0.02, 0.02, h));
        vec3 studio = mix(dark * 2.6, dark, smoothstep(-0.05, 0.6, h));
        c = mix(c, studio, dim);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  const sky = new THREE.Mesh(skyGeo, skyMat); sky.renderOrder = -10; sky.frustumCulled = false; group.add(sky);
  let envTex = null;
  if (renderer) {
    const envScene = new THREE.Scene(); envScene.add(new THREE.Mesh(skyGeo, skyMat));
    const pm = new THREE.PMREMGenerator(renderer); envTex = keep(pm.fromScene(envScene, 0, 1, 6000).texture); pm.dispose();
  }

  /* ---------- materials ---------- */
  // coplanar ground layers are separated with polygon offset (works at any distance, unlike small y offsets)
  const layerMat = (i, extra = {}) => keep(new THREE.MeshStandardMaterial(Object.assign({vertexColors: true, roughness: .95, metalness: 0, polygonOffset: true, polygonOffsetFactor: -i, polygonOffsetUnits: -4 * i}, extra)));
  const kerbMat = layerMat(1), roadMat = layerMat(2, {roughness: .9}), markMat = layerMat(3, {roughness: .8});
  const shadowMat = keep(new THREE.MeshBasicMaterial({color: 0x1c2a36, transparent: true, opacity: .34, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -16}));
  const genMat = keep(new THREE.MeshStandardMaterial({vertexColors: true, roughness: .8, metalness: .05}));
  const tex = facadeTextures(r); Object.values(tex).forEach((t) => keep(t.map));
  const facadeMat = {
    glass: keep(new THREE.MeshStandardMaterial({vertexColors: true, map: tex.glass.map, roughness: .16, metalness: .55, envMap: envTex, envMapIntensity: 1.25})),
    residential: keep(new THREE.MeshStandardMaterial({vertexColors: true, map: tex.residential.map, roughness: .55, metalness: .05, envMap: envTex, envMapIntensity: .6})),
    stone: keep(new THREE.MeshStandardMaterial({vertexColors: true, map: tex.stone.map, roughness: .8, metalness: 0, envMap: envTex, envMapIntensity: .5})),
    brick: keep(new THREE.MeshStandardMaterial({vertexColors: true, map: tex.brick.map, roughness: .9, metalness: 0})),
    house: keep(new THREE.MeshStandardMaterial({vertexColors: true, map: tex.house.map, roughness: .9, metalness: 0})),
  };

  /* ---------- land, beach, sea, hills ---------- */
  const landShape = new THREE.Shape([[-3000, -(COAST - 9)], [3000, -(COAST - 9)], [3000, -(COAST - 9 + 3400)], [-3000, -(COAST - 9 + 3400)]].map(([x, y]) => new THREE.Vector2(x, y)));
  landShape.holes.push(new THREE.Path([[SITE.x0, -SITE.z0], [SITE.x0, -SITE.z1], [SITE.x1, -SITE.z1], [SITE.x1, -SITE.z0]].map(([x, y]) => new THREE.Vector2(x, y))));
  const land = new THREE.Mesh(keep(new THREE.ShapeGeometry(landShape).rotateX(-Math.PI / 2).translate(0, GROUND, 0)), keep(new THREE.MeshStandardMaterial({color: 0x6e8a4a, roughness: 1})));
  land.receiveShadow = true; group.add(land);
  const sea = new THREE.Mesh(keep(new THREE.PlaneGeometry(9000, 4000).rotateX(-Math.PI / 2).translate(0, GROUND - .6, COAST - 9 - 2000)),
    keep(new THREE.MeshStandardMaterial({color: 0x2b7591, roughness: .14, metalness: .25, envMap: envTex, envMapIntensity: 1.1})));
  group.add(sea);
  const gb = new Batch(), kerb = new Batch(), road = new Batch(), mark = new Batch(), shade = new Batch();
  const tb = {glass: new Batch(true), residential: new Batch(true), stone: new Batch(true), brick: new Batch(true), house: new Batch(true)};
  const beach0 = COAST - ROAD / 2 - 2.5, beach1 = beach0 - 34, shallow1 = beach1 - 40;
  kerb.flat(-3000, beach1, 3000, beach0, GROUND, C(0xe4d4ad));                 // sand
  gb.flat(-4500, shallow1, 4500, beach1, GROUND - .45, C(0x5fb0bb));            // shallow water
  gb.flat(-4500, beach1 - 1.2, 4500, beach1, GROUND - .4, C(0xf4f6f2));         // foam line
  // hazy hills on the land side
  for (let a = -Math.PI * .95; a < Math.PI * .02; a += .035) {
    const a2 = a + .035, R1 = 1500 + 120 * Math.sin(a * 7), R2 = 1500 + 120 * Math.sin(a2 * 7);
    const h1 = 70 + 110 * Math.abs(Math.sin(a * 3.1) * Math.cos(a * 1.7)), h2 = 70 + 110 * Math.abs(Math.sin(a2 * 3.1) * Math.cos(a2 * 1.7));
    const p = (R, t, y) => [Math.cos(t) * R + CENTER[0], y, -Math.sin(t) * R + CENTER[1] + 300];
    gb.quad(p(R1, a, GROUND), p(R2, a2, GROUND), p(R2 + 40, a2, GROUND + h2), p(R1 + 40, a, GROUND + h1), C(0x7f949c));
  }

  /* ---------- street grid ---------- */
  const xRoads = [SITE.x0 - ROAD / 2, SITE.x1 + ROAD / 2];
  for (let x = SITE.x1 + ROAD / 2; (x += 88 + r() * 24) < EXT_X;) xRoads.push(x);
  for (let x = SITE.x0 - ROAD / 2; (x -= 88 + r() * 24) > -EXT_X;) xRoads.push(x);
  const zRoads = [SITE.z0 - ROAD / 2, SITE.z1 + ROAD / 2, COAST];
  for (let z = SITE.z1 + ROAD / 2; (z += 68 + r() * 20) < EXT_Z;) zRoads.push(z);
  for (let z = SITE.z0 - ROAD / 2; (z -= 68 + r() * 20) > COAST + 55;) zRoads.push(z);
  xRoads.sort((a, b) => a - b); zRoads.sort((a, b) => a - b);
  const xMin = xRoads[0], xMax = xRoads[xRoads.length - 1], zMax = zRoads[zRoads.length - 1];
  const hw = ROAD / 2, KERB = C(0xaaa59a), ASPH = C(0x3f4448), LINE = C(0xe6e4dc), YEL = C(0xd9b04a);
  for (const x of xRoads) {
    kerb.flat(x - hw - 2.5, COAST, x + hw + 2.5, zMax, GROUND, KERB);
    road.flat(x - hw + 1.5, COAST, x + hw - 1.5, zMax, GROUND, ASPH);
    for (let z = COAST + 4; z < zMax - 4; z += 11) mark.flat(x - .1, z, x + .1, z + 4, GROUND, LINE);
  }
  for (const z of zRoads) {
    kerb.flat(xMin - 30, z - hw - 2.5, xMax + 30, z + hw + 2.5, GROUND, KERB);
    road.flat(xMin - 30, z - hw + 1.5, xMax + 30, z + hw - 1.5, GROUND, ASPH);
    for (let x = xMin; x < xMax; x += 11) mark.flat(x, z - .1, x + 4, z + .1, GROUND, z === COAST ? YEL : LINE);
  }
  // zebra crossings at every intersection
  for (const x of xRoads) for (const z of zRoads) {
    for (const s of [-1, 1]) {
      const zc = z + s * (hw + 3.2);
      if (zc > COAST && zc < zMax) for (let k = x - hw + 2.2; k < x + hw - 2; k += 1.3) mark.flat(k, zc - 1.6, k + .65, zc + 1.6, GROUND, LINE);
      const xc = x + s * (hw + 3.2);
      for (let k = z - hw + 2.2; k < z + hw - 2; k += 1.3) mark.flat(xc - 1.6, k, xc + 1.6, k + .65, GROUND, LINE);
    }
  }

  /* ---------- buildings ---------- */
  const shadowBox = (x0, z0, x1, z1, h) => {
    const s0 = SH[0] * h, s1 = SH[1] * h;
    const P = hull([[x0, z0], [x1, z0], [x1, z1], [x0, z1], [x0 + s0, z0 + s1], [x1 + s0, z0 + s1], [x1 + s0, z1 + s1], [x0 + s0, z1 + s1]]);
    for (let i = 1; i < P.length - 1; i++) shade.tri([P[0][0], GROUND, P[0][1]], [P[i][0], GROUND, P[i][1]], [P[i + 1][0], GROUND, P[i + 1][1]], KERB);
  };
  const TINT = {
    glass: [C(0xdcefff), C(0xd2fff4), C(0xffecd2), C(0xf2f6ff), C(0xc4d6ea), C(0xb9e3e0)],
    residential: [C(0xffffff), C(0xfff6e6), C(0xfbecdc), C(0xfff1e2), C(0xeef3f6), C(0xfff9ee)],
    stone: [C(0xffffff), C(0xfff2df), C(0xeee8e0), C(0xf6e4cf)],
    brick: [C(0xffffff), C(0xf0ddd2), C(0xffe9d9)],
  };
  const HOUSE_WALL = [0xf6f1e7, 0xf2e6cf, 0xece5d8, 0xf6e9d2, 0xe2e8ea, 0xf4ddc8, 0xeee6d3, 0xfbefe0].map(C);
  const HOUSE_ROOF = [0xb4553b, 0xc4663f, 0x9c4a35, 0xcf7a4a, 0x6b7076, 0x5b6168, 0x8a5a44, 0xa9583f].map(C);
  const CAP = C(0x8f969b), PLANT = C(0x7c858c), PLATE = C(0xeeebe4);
  let towers = 0, houses = 0;

  const obstacles = [];   // [x0, z0, x1, z1, top] of every building, for camera-path checks
  const FIN = C(0xd5d9dc), CORNICE = C(0xe9e1d2), BASEDARK = C(0x2f3a42), CANOPY = C(0xc9cdd0), UNIT = C(0xb7bec4), TANK = C(0xdfe3e6);
  /** extra geometry for buildings the camera sees closely: fins, cornices, a darker shopfront base, canopy, roof plant */
  function nearDetail(style, x0, z0, x1, z1, base, y1, floorH) {
    const w = x1 - x0, d = z1 - z0;
    if (style === 'glass') {        // vertical aluminium fins give the curtain wall depth
      const fd = .45;
      for (let x = x0 + 1.6; x < x1 - .5; x += 3.2) { gb.box(x - .06, base, z1, x + .06, y1, z1 + fd, FIN); gb.box(x - .06, base, z0 - fd, x + .06, y1, z0, FIN); }
      for (let z = z0 + 1.6; z < z1 - .5; z += 3.2) { gb.box(x1, base, z - .06, x1 + fd, y1, z + .06, FIN); gb.box(x0 - fd, base, z - .06, x0, y1, z + .06, FIN); }
    } else if (style === 'stone') { // cornice bands every second floor
      for (let y = base + floorH * 2; y < y1 - 1; y += floorH * 2) gb.box(x0 - .3, y - .18, z0 - .3, x1 + .3, y + .18, z1 + .3, CORNICE, true);
    } else if (style === 'brick') { // pale string course at each floor line
      for (let y = base + floorH; y < y1 - 1; y += floorH) gb.box(x0 - .12, y - .1, z0 - .12, x1 + .12, y + .1, z1 + .12, CORNICE, true);
    }
    // darker shopfront base and an entrance canopy on the longest street face
    gb.box(x0 - .04, GROUND, z0 - .04, x1 + .04, GROUND + 4.2, z1 + .04, BASEDARK);
    gb.box(x0 - .3, GROUND + 4.2, z0 - .3, x1 + .3, GROUND + 4.6, z1 + .3, CANOPY, true);
    if (w >= d) gb.box(x0 + w * .3, GROUND + 3.6, z1, x0 + w * .55, GROUND + 3.9, z1 + 2.6, CANOPY, true);
    else gb.box(x1, GROUND + 3.6, z0 + d * .3, x1 + 2.6, GROUND + 3.9, z0 + d * .55, CANOPY, true);
    // roof plant: a louvred enclosure, rows of condenser units, a water tank
    const ry = y1 + .9, ew = Math.min(9, w * .35), ed = Math.min(7, d * .35), ex = x0 + w * (.25 + rd() * .3), ez = z0 + d * (.25 + rd() * .3);
    gb.box2(ex - ew / 2, ry, ez - ed / 2, ex + ew / 2, ry + 2.4, ez + ed / 2, C(0x6f787f), C(0x5c656c));
    for (let i = 0; i < 2 + (rd() * 4 | 0); i++) { const ux = x0 + 2 + rd() * (w - 4), uz = z0 + 2 + rd() * (d - 4); gb.box(ux - .6, ry, uz - .5, ux + .6, ry + 1, uz + .5, UNIT); }
    if (rd() < .6) gb.geo(TANK_GEO, new THREE.Matrix4().makeTranslation(x1 - 2.5, ry + 1.3, z1 - 2.5), TANK);
  }
  const TANK_GEO = keep(new THREE.CylinderGeometry(1.2, 1.2, 2.6, 10));

  function tower(style, x, z, w, d, h, opts = {}) {
    const x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2;
    const tint = opts.tint || pick(TINT[style]), y1 = GROUND + h;
    const near = Math.hypot(x - CENTER[0], z - CENTER[1]) < 240;
    obstacles.push([x0 - (opts.podium || 0), z0 - (opts.podium || 0), x1 + (opts.podium || 0), z1 + (opts.podium || 0), y1 + (opts.crown ? 34 : 4)]);
    let base = GROUND;
    if (opts.podium) {   // two-storey podium with shopfronts
      const px0 = x0 - opts.podium, px1 = x1 + opts.podium, pz0 = z0 - opts.podium, pz1 = z1 + opts.podium;
      tb.stone.sides(px0, GROUND, pz0, px1, GROUND + 7.8, pz1, pick(TINT.stone), tex.stone, r() * 4);
      gb.flat(px0, pz0, px1, pz1, GROUND + 7.8, CAP);
      shadowBox(px0, pz0, px1, pz1, 7.8); base = GROUND + 7.8;
    }
    const uo = (r() * 8 | 0) * .125, floorH = tex[style].h / 16;
    if (near && style !== 'residential' && h > 14 && rd() < .45) {   // stepped massing: top floor(s) set back behind a roof terrace
      const yb = y1 - floorH * (1 + (rd() < .4 ? 1 : 0)), sb = 3;
      tb[style].sides(x0, base, z0, x1, yb, z1, tint, tex[style], uo);
      gb.flat(x0, z0, x1, z1, yb, C(0xa59d90));
      gb.box(x0 - .1, yb, z0 - .1, x1 + .1, yb + 1.1, z0 + .15, C(0xdfe2e4)); gb.box(x0 - .1, yb, z1 - .15, x1 + .1, yb + 1.1, z1 + .1, C(0xdfe2e4));
      tb[style].sides(x0 + sb, yb, z0 + sb, x1 - sb, y1, z1 - sb, tint, tex[style], uo);
      if (near) nearDetail(style, x0 + sb, z0 + sb, x1 - sb, z1 - sb, yb, y1, floorH);
    } else {
      tb[style].sides(x0, base, z0, x1, y1, z1, tint, tex[style], uo);
      if (near) nearDetail(style, x0, z0, x1, z1, base, y1, floorH);
    }
    gb.box(x0 - .25, y1, z0 - .25, x1 + .25, y1 + .9, z1 + .25, CAP);
    if (style === 'residential') {   // wrap-around balconies every floor
      const ext = 1.1 + r() * .6;
      for (let y = base + 3.1; y < y1 - 1; y += 3.1) gb.box(x0 - ext, y - .11, z0 - ext, x1 + ext, y + .11, z1 + ext, PLATE, true);
    }
    if (opts.crown) {      // glass crown + spire on landmark towers
      const cw = w * .7, cd = d * .7;
      tb.glass.sides(x - cw / 2, y1 + .9, z - cd / 2, x + cw / 2, y1 + 12, z + cd / 2, tint, tex.glass, .5);
      gb.flat(x - cw / 2, z - cd / 2, x + cw / 2, z + cd / 2, y1 + 12, CAP);
      gb.box(x - .4, y1 + 12, z - .4, x + .4, y1 + 34, z + .4, CAP);
    } else if (w > 12 && d > 12) {
      const pw = w * (.3 + r() * .25), pd = d * (.3 + r() * .25), ox = (r() - .5) * (w - pw) * .6, oz = (r() - .5) * (d - pd) * .6;
      gb.box(x + ox - pw / 2, y1 + .9, z + oz - pd / 2, x + ox + pw / 2, y1 + 3.6, z + oz + pd / 2, PLANT);
    }
    shadowBox(x0, z0, x1, z1, h + (opts.crown ? 12 : .9));
    towers++;
  }
  function house(x, z, w, d, alongX) {
    const x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2, h = (r() < .55 ? 2 : 1) * 3.2;
    tb.house.sides(x0, GROUND, z0, x1, GROUND + h, z1, pick(HOUSE_WALL), tex.house, (r() * 2 | 0) * .5);
    const rh = Math.min(w, d) * (.28 + r() * .12);
    gb.gable(x0 - .6, z0 - .6, x1 + .6, z1 + .6, GROUND + h, rh, pick(HOUSE_ROOF), alongX);
    if (r() < .12) gb.flat(x1 + 1.5, z0, x1 + 6, z0 + 4, GROUND + .02, C(0x58b7d0));   // the odd pool
    shadowBox(x0, z0, x1, z1, h + rh * .5); houses++; obstacles.push([x0 - .6, z0 - .6, x1 + .6, z1 + .6, GROUND + h + rh]);
  }

  const trees = [], parked = [];   // trees: [x, z, kind, scale]; parked cars: [x, z]
  let SB = null, oldParked = 0;    // site block rectangle [x0, z0, x1, z1]
  const tree = (x, z, kind) => trees.push([x, z, kind, .8 + r() * .5]);
  for (let i = 0; i < xRoads.length - 1; i++) for (let j = 0; j < zRoads.length - 1; j++) {
    const bx0 = xRoads[i] + hw + 3, bx1 = xRoads[i + 1] - hw - 3, bz0 = zRoads[j] + hw + 3, bz1 = zRoads[j + 1] - hw - 3;
    if (bx1 - bx0 < 14 || bz1 - bz0 < 14) continue;
    const cx = (bx0 + bx1) / 2, cz = (bz0 + bz1) / 2;
    const isSite = bx0 < SITE.x1 && bx1 > SITE.x0 && bz0 < SITE.z1 && bz1 > SITE.z0;
    const d = Math.hypot(cx - CENTER[0], (cz - CENTER[1]) * 1.15);
    // beachfront towers on the coast, a mid-rise band between the site and the sea (keeps the sea and the
    // beachfront skyline visible behind the building), low offices around the site, high-rises inland, suburbs beyond
    const zone = isSite ? 'site' : zRoads[j] === COAST ? 'beach' : (cz > 330 || Math.abs(cx) > 600) ? 'suburb' : cz < -60 ? 'mid' : d < 330 ? 'low' : 'cbd';   // cameras fly over the low zone
    const park = !isSite && zone !== 'beach' && r() < .08;
    const paved = zone !== 'suburb';
    if (paved && !park && !isSite) kerb.flat(bx0 - 3, bz0 - 3, bx1 + 3, bz1 + 3, GROUND, C(0xb3ada1));
    if (isSite) {   // the site itself is designed separately (buildSite); consume the same random numbers as before
      SB = [bx0 - 3, bz0 - 3, bx1 + 3, bz1 + 3];
      for (let z = -39; z < 43; z += 2.7) for (let q = 0; q < 2; q++) if (r() < .7) oldParked++;
    }
    if (park) gb.flat(bx0, bz0, bx1, bz1, GROUND + .01, C(0x739a4f));
    // street trees (none on the site's open plaza where the exploded models stand)
    const kind = () => zone === 'beach' ? (r() < .7 ? 'palm' : 'pine') : r() < .18 ? 'palm' : r() < .12 ? 'pine' : 'round';
    const clear = (x, z) => !isSite || ((x < -46 || x > 58 || Math.abs(z - CENTER[1]) > 92) && !(x < -46 && Math.abs(z) < 48));
    for (let x = bx0 + 3; x < bx1 - 3; x += 12) for (const z of [bz0 - 1.2, bz1 + 1.2]) if (r() < .75 && clear(x, z)) tree(x, z, kind());
    for (let z = bz0 + 3; z < bz1 - 3; z += 12) for (const x of [bx0 - 1.2, bx1 + 1.2]) if (r() < .75 && clear(x, z)) tree(x, z, kind());
    if (isSite) continue;
    if (park) { for (let k = 0; k < (bx1 - bx0) * (bz1 - bz0) / 140; k++) tree(bx0 + 4 + r() * (bx1 - bx0 - 8), bz0 + 4 + r() * (bz1 - bz0 - 8), r() < .35 ? 'pine' : 'round'); continue; }

    if (zone === 'suburb') {
      // houses facing the street on all four sides, gardens behind
      const lot = () => 15 + r() * 4;
      for (let x = bx0 + 3; x < bx1 - 12; x += lot()) {
        const w = 9 + r() * 3, dd = 8 + r() * 3;
        house(x + w / 2, bz0 + 4 + dd / 2, w, dd, true); house(x + w / 2, bz1 - 4 - dd / 2, w, dd, true);
        if (r() < .5) tree(x + w / 2 + (r() - .5) * 6, bz0 + 4 + dd + 5 + r() * 4, r() < .3 ? 'palm' : 'round');
        if (r() < .5) tree(x + w / 2 + (r() - .5) * 6, bz1 - 4 - dd - 5 - r() * 4, 'round');
      }
      if (bz1 - bz0 > 60) for (let z = bz0 + 24; z < bz1 - 32; z += lot()) {
        const w = 8 + r() * 3, dd = 9 + r() * 3;
        house(bx0 + 4 + w / 2, z + dd / 2, w, dd, false); house(bx1 - 4 - w / 2, z + dd / 2, w, dd, false);
      }
      continue;
    }
    // office / tower blocks: split into lots
    const nx = bx1 - bx0 > 52 ? 2 : 1, nz = bz1 - bz0 > 46 ? 2 : 1;
    for (let a = 0; a < nx; a++) for (let b = 0; b < nz; b++) {
      if (r() < .08) continue;
      const lx0 = bx0 + (bx1 - bx0) * a / nx, lx1 = bx0 + (bx1 - bx0) * (a + 1) / nx;
      const lz0 = bz0 + (bz1 - bz0) * b / nz, lz1 = bz0 + (bz1 - bz0) * (b + 1) / nz;
      const lw = lx1 - lx0, ld = lz1 - lz0, x = (lx0 + lx1) / 2, z = (lz0 + lz1) / 2;
      if (zone === 'low' || zone === 'mid') {   // offices next to the site (3-7 storeys), mid-rise mix towards the sea (5-12)
        const style = zone === 'mid' ? pick(['residential', 'residential', 'stone', 'brick', 'glass']) : pick(['glass', 'glass', 'stone', 'brick']);
        const fl = zone === 'mid' ? 5 + (r() * 8 | 0) : 3 + (r() * 5 | 0), h = fl * tex[style].h / 16;
        tower(style, x + (r() - .5) * 3, z + (r() - .5) * 3, Math.max(12, Math.min(34, lw - 8 - r() * 8)), Math.max(12, Math.min(30, ld - 8 - r() * 8)), h);
      } else if (zone === 'beach') {   // beachfront residential towers
        const style = r() < .8 ? 'residential' : 'glass';
        const h = (14 + (r() * 24 | 0)) * tex[style].h / 16;
        tower(style, x, z + (r() - .5) * 4, Math.min(30, lw - 8), Math.min(24, ld - 8), h, {podium: r() < .5 ? 3 : 0});
      } else {                     // city centre: towers rise with distance from the site
        const tall = Math.min(1, Math.max(0, (d - 330) / 250));
        const style = r() < .5 ? 'glass' : r() < .65 ? 'residential' : 'stone';
        let h = 22 + r() * 30 + tall * (30 + r() * 110);
        const landmark = style === 'glass' && r() < .1 * (.4 + tall);
        if (landmark) h += 50 + r() * 60;
        h = Math.round(h / (tex[style].h / 16)) * (tex[style].h / 16);
        const slender = h > 60 ? Math.min(32, Math.max(18, h * .22)) : 40;
        tower(style, x, z, Math.min(slender, lw - 8), Math.min(slender, ld - 8), h, {podium: h > 60 && r() < .55 ? 4 : 0, crown: landmark});
      }
    }
  }
  // palms along the beach promenade, a few on the sand
  for (let x = xMin; x < xMax; x += 14 + r() * 8) { tree(x, beach0 - 2.5, 'palm'); if (r() < .25) tree(x + 5, beach0 - 10 - r() * 14, 'palm'); }

  /* ---------- the project site: forecourt, podium terrace, planted bank, plazas, car park ---------- */
  // Measured from the model: the building occupies x -33.8..33.6, z -9.7..9.7. Its north entrance level and the
  // south walkway sit at +3.75 m (the original site sloped), so a terrace and a planted bank carry those levels.
  // The ground-floor doors at the east and west ends open at street level.
  const PT = 3.75;                                          // podium / upper-entrance level
  const PIT = {x0: -38, x1: 38, z0: -14, z1: 14};          // excavation outline (building + working space)
  const landscape = new THREE.Group(); landscape.name = 'site-landscape'; group.add(landscape);
  const sLawn = new Batch(), sPave = new Batch(), sMark = new Batch(), sBuilt = new Batch(), sLid = new Batch();
  const LAWN = C(0x77954f), PAVE = C(0xcdc5b5), PAVE2 = C(0xb9b0a0), STONE = C(0x9a9387), COPING = C(0xe2dccf), ASPH2 = C(0x4a4f53);
  const [sx0, sz0, sx1, sz1] = [SITE.x0, SITE.z0, SITE.x1, SITE.z1];
  // lawn everywhere except the excavation outline (the lid covers that)
  sLawn.flat(sx0, sz0, sx1, PIT.z0, GROUND, LAWN); sLawn.flat(sx0, PIT.z1, sx1, sz1, GROUND, LAWN);
  sLawn.flat(sx0, PIT.z0, PIT.x0, PIT.z1, GROUND, LAWN); sLawn.flat(PIT.x1, PIT.z0, sx1, PIT.z1, GROUND, LAWN);
  sLid.flat(PIT.x0, PIT.z0, PIT.x1, PIT.z1, GROUND, PAVE);                       // apron around the building
  // plazas north and south: paving with darker bands every 6 m (the exploded models float above these)
  const plaza = (x0, z0, x1, z1) => { sPave.flat(x0, z0, x1, z1, GROUND, PAVE); for (let x = x0 + 6; x < x1 - 1; x += 6) sMark.flat(x - .35, z0, x + .35, z1, GROUND, PAVE2); };
  plaza(-44, 23.5, 56, 46); plaza(-44, -46, 56, -22);
  sPave.flat(PIT.x1, -22, 56, 23.5, GROUND, PAVE); sPave.flat(-44, -22, PIT.x0, 23.5, GROUND, PAVE);   // east and west aprons
  sPave.flat(-5, 46, 5, sz1, GROUND, PAVE); sPave.flat(-5, sz0, 5, -46, GROUND, PAVE); sPave.flat(56, -3, sx1, 7, GROUND, PAVE);   // paths to the streets
  // podium terrace on the north side, with broad steps down to the plaza and a planter edge
  sBuilt.box2(-27, GROUND, 9.7, 33.2, PT, 23.5, STONE, PAVE);
  sBuilt.box(-27, PT, 23.1, -9, PT + .55, 23.5, COPING); sBuilt.box(9, PT, 23.1, 33.2, PT + .55, 23.5, COPING);
  for (let i = 0; i < 10; i++) { const top = PT - (i + 1) * (PT - GROUND) / 10; sBuilt.box2(-9, GROUND, 23.5 + i * .45, 9, top, 23.5 + (i + 1) * .45, STONE, PAVE); }
  for (const x0 of [-25, -15, 13, 23]) sBuilt.box2(x0, PT, 19.5, x0 + 6, PT + .6, 22, STONE, C(0x5e4a36));   // planters
  // planted bank under the south walkway
  const bank = (x0, x1) => {
    sBuilt.quad([x0, PT, -12.35], [x1, PT, -12.35], [x1, GROUND, -21.5], [x0, GROUND, -21.5], LAWN);
    sBuilt.tri([x0, GROUND, -21.5], [x0, GROUND, -12.35], [x0, PT, -12.35], C(0x6d8a47));
    sBuilt.tri([x1, GROUND, -12.35], [x1, GROUND, -21.5], [x1, PT, -12.35], C(0x6d8a47));
    sBuilt.box(x0, GROUND, -12.35, x1, PT, -9.7, STONE);
  };
  bank(-34, 24);
  sBuilt.box(-39.3, GROUND, -9, -33.8, .7, 15.9, STONE);     // plinth under the west deck in the model
  // car park at the west end: two rows of 5.5 m bays either side of a 6 m aisle, with a driveway to the south street
  sPave.flat(-61, -64, -44, 64, GROUND, ASPH2); sPave.flat(-55.5, sz0, -49.5, -64, GROUND, ASPH2);
  const parkedSite = [];
  for (let z = -62; z < 61; z += 2.6) {
    sMark.flat(-61, z, -55.5, z + .12, GROUND, LINE); sMark.flat(-49.5, z, -44, z + .12, GROUND, LINE);
    if (rs() < .7) parkedSite.push([-58.2, z + 1.3, rs() < .5]); if (rs() < .7) parkedSite.push([-46.8, z + 1.3, rs() < .5]);
  }
  for (const z of [-30, 0, 30]) sBuilt.box2(-61, GROUND, z - 1.2, -55.5, GROUND + .18, z + 1.2, COPING, LAWN), sBuilt.box2(-49.5, GROUND, z - 1.2, -44, GROUND + .18, z + 1.2, COPING, LAWN);
  // benches and bollard lights on the plazas
  for (const [x, z] of [[-30, 36], [-14, 36], [16, 36], [32, 36], [-30, -36], [-14, -36], [16, -36], [32, -36]]) sBuilt.box2(x - 1.2, GROUND, z - .3, x + 1.2, GROUND + .45, z + .3, C(0x8b6f52), C(0xa3866a));
  for (let x = -40; x <= 52; x += 8) for (const z of [24.5, 45, -23, -45]) sBuilt.box(x - .1, GROUND, z - .1, x + .1, GROUND + .9, z + .1, C(0x3c444b));
  // site trees: rows along the plaza edges and car park islands, planter trees on the terrace, shrubs on the bank
  const siteTrees = [];
  const st = (x, z, kind, s, y0 = GROUND) => siteTrees.push({x, z, kind, s, y0, near: true, rot: rs() * 6.28, sj: 1 + rs() * .2, v: .88 + rs() * .24});
  for (let z = -92; z <= 96; z += 9) { st(64, z, rs() < .25 ? 'palm' : 'round', .95 + rs() * .3); }
  for (let x = -40; x <= 52; x += 10) { const a = rs() * .3, b = rs() * .3, c = rs(); if (x < -38 || x > 40) { st(x, 50, 'round', .9 + a); st(x, -50, c < .3 ? 'palm' : 'round', .9 + b); } }
  for (const x of [-38, -26, 26, 38, 50]) for (const z of [100, -96]) st(x, z, 'round', 1 + rs() * .2);   // lawn trees beyond the floating models
  for (const z of [-30, 0, 30]) { st(-58.2, z, 'round', .8); st(-46.8, z, 'round', .8); }
  for (const x0 of [-25, -15, 13, 23]) { rs(); for (const dx of [1.3, 3, 4.7]) st(x0 + dx, 20.75, 'shrub', .75 + rs() * .3, PT + .45); }
  for (let x = -31; x < 22; x += 3.4) { const z = -15 - rs() * 4.5; st(x + rs() * 1.5, z, 'shrub', .8 + rs() * .5, PT - (-12.35 - z) / 9.15 * (PT - GROUND) - .2); }
  for (const [x, z] of [[-30, 82], [-18, 90], [22, 86], [36, 94], [-34, -84], [30, -88], [44, -80]]) st(x, z, rs() < .4 ? 'pine' : 'round', 1 + rs() * .3);

  /* ---------- construction works (shown by the 4D chapter) ---------- */
  const works = new THREE.Group(); works.name = 'site-works'; works.visible = false; group.add(works);
  const wGround = new Batch(), wLid = new Batch(), wBuilt = new Batch();
  const EARTH = C(0x8a7457), GRAVEL = C(0x9b927f);
  wGround.flat(sx0, sz0, sx1, PIT.z0, GROUND, EARTH); wGround.flat(sx0, PIT.z1, sx1, sz1, GROUND, EARTH);
  wGround.flat(sx0, PIT.z0, PIT.x0, PIT.z1, GROUND, EARTH); wGround.flat(PIT.x1, PIT.z0, sx1, PIT.z1, GROUND, EARTH);
  wLid.flat(PIT.x0, PIT.z0, PIT.x1, PIT.z1, GROUND, EARTH);
  const wTrack = new Batch(); wTrack.flat(-5, PIT.z1, 5, sz1, GROUND, GRAVEL); wTrack.flat(PIT.x1, -4, sx1, 6, GROUND, GRAVEL); wTrack.flat(-61, -64, -44, 64, GROUND, GRAVEL);
  // hoarding round the site with gates at the north path, east path and car park
  const HOARD = C(0x2e3c45), HTOP = C(0xf2f2ee), hy = GROUND + 2.4, inset = 2;
  const hoard = (x0, z0, x1, z1) => { wBuilt.box(x0, GROUND, z0, x1, hy, z1, HOARD); wBuilt.box(x0, hy - .25, z0 - .02, x1, hy, z1 + .02, HTOP); };
  hoard(sx0 + inset, sz1 - inset - .1, -8, sz1 - inset); hoard(8, sz1 - inset - .1, sx1 - inset, sz1 - inset);
  hoard(sx0 + inset, sz0 + inset, sx1 - inset, sz0 + inset + .1);
  hoard(sx1 - inset - .1, sz0 + inset, sx1 - inset, -8); hoard(sx1 - inset - .1, 10, sx1 - inset, sz1 - inset);
  hoard(sx0 + inset, sz0 + inset, sx0 + inset + .1, sz1 - inset);
  // site cabins in the car park
  for (const [x, z, y] of [[-57, 30, 0], [-57, 37, 0], [-57, 30, 2.7], [-48, 34, 0]]) { wBuilt.box(x - 3.1, GROUND + y, z - 1.25, x + 3.1, GROUND + y + 2.6, z + 1.25, C(0xf1f1ee)); wBuilt.box(x - 2.4, GROUND + y + 1, z + 1.26, x + 2.4, GROUND + y + 1.9, z + 1.3, C(0x31404b)); }
  // material stacks near the crane
  for (let i = 0; i < 5; i++) wBuilt.box(-38 + i * 3.2, GROUND, -36, -36 + i * 3.2, GROUND + .8 + (i % 2) * .5, -33, i % 2 ? C(0x9da3a8) : C(0xb08a5a));
  const earthMat = keep(new THREE.MeshStandardMaterial({vertexColors: true, roughness: 1, side: THREE.DoubleSide}));
  const addTo = (parent, batch, mat, receive = true) => { if (batch.empty) return null; const m = new THREE.Mesh(keep(batch.geometry()), mat); m.receiveShadow = receive; parent.add(m); return m; };
  addTo(works, wGround, earthMat); addTo(works, wTrack, kerbMat); addTo(works, wBuilt, genMat);
  const lidWorks = addTo(works, wLid, earthMat);
  // excavation pit: unit depth, scaled in y; battered sides
  const pitB = new Batch(), ins = 1.4, P0 = PIT, Py = [0, -1];
  const top = [[P0.x0, 0, P0.z0], [P0.x1, 0, P0.z0], [P0.x1, 0, P0.z1], [P0.x0, 0, P0.z1]];
  const bot = [[P0.x0 + ins, -1, P0.z0 + ins], [P0.x1 - ins, -1, P0.z0 + ins], [P0.x1 - ins, -1, P0.z1 - ins], [P0.x0 + ins, -1, P0.z1 - ins]];
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; pitB.quad(top[i], top[j], bot[j], bot[i], i % 2 ? C(0x7a6249) : C(0x6e5841)); }
  pitB.quad(bot[0], bot[1], bot[2], bot[3], C(0x8f877a));
  const pit = new THREE.Mesh(keep(pitB.geometry()), earthMat); pit.position.y = GROUND; pit.receiveShadow = true; works.add(pit);
  const spoil = new THREE.Mesh(keep(new THREE.ConeGeometry(9, 5, 9, 1).translate(0, 2.5, 0)), keep(new THREE.MeshStandardMaterial({color: 0x7d6a50, roughness: 1, flatShading: true})));
  spoil.position.set(62, GROUND, 40); works.add(spoil);
  // excavator: tracks, slewing body with cab, boom, stick and bucket
  const CYEL = C(0xf0b400), YM = keep(new THREE.MeshStandardMaterial({color: 0xf0b400, roughness: .5, metalness: .2})), DM = keep(new THREE.MeshStandardMaterial({color: 0x2b2f33, roughness: .7}));
  const bx = (w, h, d, x, y, z, m) => { const o = new THREE.Mesh(keep(new THREE.BoxGeometry(w, h, d)), m); o.position.set(x, y, z); o.castShadow = true; return o; };
  const excavator = new THREE.Group(); excavator.position.set(6, GROUND, 18.5); excavator.rotation.y = Math.PI / 2;
  excavator.add(bx(4.6, .9, .8, 0, .45, -1.4, DM), bx(4.6, .9, .8, 0, .45, 1.4, DM));
  const exUpper = new THREE.Group(); exUpper.position.y = 1; excavator.add(exUpper);
  exUpper.add(bx(3.6, 1.3, 2.6, -.3, .65, 0, YM), bx(1.4, 1.5, 1.2, .7, 2, .6, DM), bx(1, 1.2, 2.4, -1.9, .7, 0, DM));
  const exBoom = new THREE.Group(); exBoom.position.set(1.4, 1.2, -.4); exUpper.add(exBoom);
  exBoom.add(bx(5.4, .55, .55, 2.7, 0, 0, YM));
  const exStick = new THREE.Group(); exStick.position.set(5.4, 0, 0); exBoom.add(exStick);
  exStick.add(bx(3.2, .4, .4, 1.6, 0, 0, YM), bx(1, 1, 1.2, 3.3, -.3, 0, DM));
  works.add(excavator);
  // tipper truck waiting for spoil
  const truck = new THREE.Group(); truck.position.set(50, GROUND, 28); truck.rotation.y = .3;
  truck.add(bx(7, 1, 2.4, 0, .9, 0, DM), bx(2, 2, 2.4, 3, 2, 0, keep(new THREE.MeshStandardMaterial({color: 0xd8dde1, roughness: .5}))), bx(4.6, 1.6, 2.4, -1, 2.2, 0, YM));
  works.add(truck);
  // tower crane on the south plaza: lattice mast, slewing jib, counter-jib with counterweight, trolley and hook
  const crane = new THREE.Group(); crane.position.set(-20, GROUND, -27); works.add(crane);
  const cB = new Batch(), MH = 48;
  cB.box(-2.5, 0, -2.5, 2.5, 1.2, 2.5, C(0x8d9399));
  for (const [x, z] of [[-.8, -.8], [.8, -.8], [.8, .8], [-.8, .8]]) cB.box(x - .09, 1.2, z - .09, x + .09, MH, z + .09, CYEL);
  for (let y = 3; y < MH; y += 2.6) { cB.box(-.8, y, -.86, .8, y + .1, -.74, CYEL); cB.box(-.8, y, .74, .8, y + .1, .86, CYEL); cB.box(-.86, y, -.8, -.74, y + .1, .8, CYEL); cB.box(.74, y, -.8, .86, y + .1, .8, CYEL); }
  crane.add(new THREE.Mesh(keep(cB.geometry()), genMat));
  const slew = new THREE.Group(); slew.position.y = MH; crane.add(slew);
  const jB = new Batch();
  jB.box(-14, 0, -.7, 52, .25, -.55, CYEL); jB.box(-14, 0, .55, 52, .25, .7, CYEL); jB.box(-14, 2, -.1, 52, 2.2, .1, CYEL);
  for (let x = -14; x < 52; x += 3) { jB.box(x - .06, .2, -.6, x + .06, 2, -.5, CYEL); jB.box(x - .06, .2, .5, x + .06, 2, .6, CYEL); }
  jB.box(-1, 2, -.2, 1, 7, .2, CYEL); jB.box(-13.5, -2.6, -1.4, -9, 0, 1.4, C(0x9aa0a5)); jB.box(-.2, -2.2, -1.6, 2.2, .2, -.6, C(0xdfe3e6));
  slew.add(new THREE.Mesh(keep(jB.geometry()), genMat));
  const trolley = new THREE.Group(); trolley.position.set(30, 0, 0); slew.add(trolley);
  const cable = bx(.05, 1, .05, 0, -.5, 0, DM); trolley.add(cable);
  const hook = bx(.7, .9, .7, 0, -20, 0, DM); trolley.add(hook);
  addTo(landscape, sLawn, layerMat(0)); addTo(landscape, sPave, kerbMat); addTo(landscape, sMark, markMat); addTo(landscape, sBuilt, genMat);
  const lidFinished = addTo(landscape, sLid, kerbMat);
  landscape.children.forEach((m) => { m.castShadow = false; });
  const terraceMesh = landscape.children[landscape.children.length - 2];   // podium terrace/bank: receives the building's real shadow
  if (terraceMesh) terraceMesh.receiveShadow = true;

  /* ---------- trees (instanced; detailed forms near the project, simple forms far away) ---------- */
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3(), E = new THREE.Euler(), Cc = new THREE.Color();
  const KINDS = {
    round: {geo: keep(new THREE.IcosahedronGeometry(2.7, 0)), trunk: 3.2, crownY: 5.1, r: 2.7, colors: [[.29, .42, .2], [.25, .4, .18], [.33, .46, .22], [.22, .36, .17]]},
    pine: {geo: keep(new THREE.ConeGeometry(2.6, 10, 7)), trunk: 2.2, crownY: 7, r: 2.4, colors: [[.18, .3, .17], [.2, .33, .19]]},
    palm: {geo: keep(new THREE.OctahedronGeometry(1, 0)), trunk: 9.5, crownY: 9.8, r: 3.3, flat: [3.4, .9, 3.4], colors: [[.31, .45, .2], [.36, .5, .22]]},
  };
  // the original per-tree random numbers, drawn in the original order (keeps the rest of the city identical)
  for (const kind of Object.keys(KINDS)) {
    const k = KINDS[kind];
    trees.forEach((t) => { if (t[2] !== kind) return; t.rot = r() * 6.28; t.sj = k.flat ? 1 : 1 + r() * .25; const c = pick(k.colors), v = .85 + r() * .3; t.col = [c[0] * v, c[1] * v, c[2] * v]; });
  }
  const NEAR_R = 175;   // detailed tree forms only where the camera sees them closely
  const cityTrees = trees.map((t) => ({x: t[0], z: t[1], kind: t[2], s: t[3], y0: GROUND, rot: t.rot, sj: t.sj, col: t.col, v: 1, near: Math.hypot(t[0] - CENTER[0], t[1] - CENTER[1]) < NEAR_R}));

  // detailed forms, built once in local units (base at y = 0) with vertex colours
  const leaf = (h, s2, l) => new THREE.Color().setHSL(h, s2, l, THREE.SRGBColorSpace);
  const IC1 = keep(new THREE.IcosahedronGeometry(1, 1)), IC0 = keep(new THREE.IcosahedronGeometry(1, 0));
  const T = (x, y, z, sx = 1, sy = 1, sz = 1, ry = 0) => new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), new THREE.Vector3(sx, sy, sz));
  const BARK = C(0x6b5844), BARK2 = C(0x7d6a52);
  function trunkB(b, h, r0, r1, lean = 0, segs = 4, col = BARK) {
    let prev = null;
    for (let i = 0; i <= segs; i++) {
      const t = i / segs, y = h * t, rr = r0 + (r1 - r0) * t, lx = lean * t * t, ring = [];
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; ring.push([lx + Math.cos(a) * rr, y, Math.sin(a) * rr]); }
      if (prev) for (let k = 0; k < 6; k++) b.quad(prev[k], prev[(k + 1) % 6], ring[(k + 1) % 6], ring[k], i % 2 ? col : BARK2);
      prev = ring;
    }
  }
  const NV = {};
  { // palm: curved ringed trunk, 11 drooping fronds with a V-shaped section
    const b = new Batch(), H = 9.6, lean = .9; trunkB(b, H, .25, .17, lean, 7, C(0x8b765c));
    const top = [lean, H, 0];
    for (let f = 0; f < 11; f++) {
      const a = f / 11 * Math.PI * 2 + rv() * .3, len = 4.4 + rv() * .8, segs = 5, W = [.08, .55, .7, .6, .38, .02];
      let p = top.slice(), e = .75 - rv() * .25;
      const sx = -Math.sin(a), sz = Math.cos(a);
      for (let i = 0; i < segs; i++) {
        const q = [p[0] + Math.cos(a) * Math.cos(e) * len / segs, p[1] + Math.sin(e) * len / segs, p[2] + Math.sin(a) * Math.cos(e) * len / segs];
        const w0 = W[i], w1 = W[i + 1], dn0 = -w0 * .35, dn1 = -w1 * .35, col = leaf(.27 - i * .012, .45, .3 + i * .03);
        b.quad(p, q, [q[0] + sx * w1, q[1] + dn1, q[2] + sz * w1], [p[0] + sx * w0, p[1] + dn0, p[2] + sz * w0], col);
        b.quad(p, [p[0] - sx * w0, p[1] + dn0, p[2] - sz * w0], [q[0] - sx * w1, q[1] + dn1, q[2] - sz * w1], q, col);
        p = q; e -= .32;
      }
    }
    b.geo(IC0, T(lean, H - .2, 0, .45, .4, .45), C(0x5a4632));
    NV.palmN = {b, crownY: 9.6, r: 4.6, side: THREE.DoubleSide};
  }
  { // pine: six layered tiers with darker undersides
    const b = new Batch(); trunkB(b, 3, .3, .18);
    for (let i = 0; i < 6; i++) {
      const y0 = 1.8 + i * 1.5, rad = 3.1 * (1 - i * .14), hgt = 3, col = leaf(.33 + i * .006, .38, .2 + i * .015), und = leaf(.33, .35, .14), n = 9, ring = [];
      for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + i * .3, rr = rad * (.86 + rv() * .2); ring.push([Math.cos(a) * rr, y0 - .25 * rv(), Math.sin(a) * rr]); }
      for (let k = 0; k < n; k++) { b.tri([0, y0 + hgt, 0], ring[k], ring[(k + 1) % n], col); b.tri([0, y0 + .5, 0], ring[(k + 1) % n], ring[k], und); }
    }
    NV.pineN = {b, crownY: 6.5, r: 3.2};
  }
  { // broadleaf A: lumpy cluster crown
    const b = new Batch(); trunkB(b, 3.4, .26, .16); b.box(-.08, 2.6, -.08, 1.2, 2.75, .08, BARK);
    [[0, 5.3, 0, 2.3], [1.5, 4.8, .6, 1.8], [-1.3, 4.9, -.7, 1.9], [.3, 6.4, -.6, 1.6], [-.5, 5, 1.4, 1.6]].forEach(([x, y, z, rr], i) => b.geo(i ? IC0 : IC1, T(x, y, z, rr, rr * .9, rr), leaf(.25 + i * .01, .42, .27 + (i % 2) * .04), .08, rv));
    NV.broadA = {b, crownY: 5.3, r: 3.6};
  }
  { // broadleaf B: tall oval crown
    const b = new Batch(); trunkB(b, 3.8, .24, .15);
    b.geo(IC1, T(0, 6.3, 0, 2.2, 3.1, 2.2), leaf(.28, .4, .26), .07, rv); b.geo(IC0, T(.6, 8.2, .3, 1.3, 1.4, 1.3), leaf(.27, .42, .3), .07, rv);
    NV.broadB = {b, crownY: 6.4, r: 2.8};
  }
  const umbrella = (crown) => { // broadleaf C: spreading umbrella crown on a forked trunk (acacia / flamboyant)
    const b = new Batch(); trunkB(b, 2.6, .3, .2);
    for (const a of [0, 2.1, 4.2]) { const m = new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a) * .7, 3.5, Math.sin(a) * .7), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(a) * .5, 0, -Math.cos(a) * .5)), new THREE.Vector3(.18, 2.2, .18)); b.geo(keep(new THREE.CylinderGeometry(1, 1.3, 1, 5)), m, BARK); }
    [[0, 5.2, 0, 3.3], [1.8, 4.9, .8, 2.2], [-1.7, 5, -.6, 2.3], [.2, 5.1, -1.9, 2.1]].forEach(([x, y, z, rr], i) => b.geo(i ? IC0 : IC1, T(x, y, z, rr, rr * .38, rr), crown(i), .08, rv));
    return b;
  };
  NV.broadC = {b: umbrella((i) => leaf(.24 + i * .01, .45, .27 + (i % 2) * .03)), crownY: 5.2, r: 4.8};
  NV.broadF = {b: umbrella((i) => i === 0 ? leaf(.03, .62, .44) : leaf(.025 + i * .006, .58, .42)), crownY: 5.2, r: 4.8};   // flowering flamboyant
  { const b = new Batch(); b.geo(IC0, T(0, .7, 0, 1.3, .85, 1.3), leaf(.27, .38, .27), .1, rv); b.geo(IC0, T(.8, .5, .3, .8, .6, .8), leaf(.25, .4, .3), .1, rv); NV.shrub = {b, crownY: .7, r: 1.5}; }
  const nearMats = {single: keep(new THREE.MeshStandardMaterial({vertexColors: true, roughness: .9, flatShading: true})), double: keep(new THREE.MeshStandardMaterial({vertexColors: true, roughness: .85, flatShading: true, side: THREE.DoubleSide}))};
  for (const k of Object.keys(NV)) NV[k].geo = keep(NV[k].b.geometry());
  const nearKind = (t) => t.kind === 'palm' ? 'palmN' : t.kind === 'pine' ? 'pineN' : t.kind === 'shrub' ? 'shrub' : t.kind === 'broadC' ? 'broadC' :
    ['broadA', 'broadB', 'broadC', 'broadA', 'broadF', 'broadB'][Math.abs(Math.floor(t.x * 7.31 + t.z * 3.17)) % 6];

  const trunkGeo = keep(new THREE.CylinderGeometry(.16, .26, 1, 5).translate(0, .5, 0));
  const trunkMat = keep(new THREE.MeshStandardMaterial({color: 0x6b5a48, roughness: 1}));
  const crownMat = keep(new THREE.MeshStandardMaterial({roughness: .95, flatShading: true}));
  const blobGeo = keep(new THREE.CircleGeometry(1, 12).rotateX(-Math.PI / 2));
  const shAng = -Math.atan2(SH[1], SH[0]), shLen = Math.hypot(SH[0], SH[1]);
  const treeRefs = [];
  function makeTrees(list, parent) {
    const far = list.filter((t) => !t.near), near = list.filter((t) => t.near);
    const blobs = new THREE.InstancedMesh(blobGeo, shadowMat, list.length); blobs.renderOrder = 1; parent.add(blobs);
    list.forEach((t, i) => {
      const k = t.near ? NV[nearKind(t)] : KINDS[t.kind], hc = k.crownY * t.s + (t.y0 - GROUND);
      P.set(t.x + SH[0] * hc * .8, t.y0 > GROUND + .5 ? t.y0 : GROUND, t.z + SH[1] * hc * .8); E.set(0, shAng, 0); Q.setFromEuler(E);
      S.set(k.r * t.s * (1 + shLen * .5) * .85, 1, k.r * t.s * .8); M4.compose(P, Q, S); blobs.setMatrixAt(i, M4);
      t.refs = [[blobs, i]]; t.cy = t.y0 + k.crownY * t.s; t.cr = k.r * t.s; treeRefs.push(t);
    });
    if (far.length) {
      const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, far.length); parent.add(trunks);
      far.forEach((t, i) => { P.set(t.x, t.y0, t.z); S.set(t.s, KINDS[t.kind].trunk * t.s, t.s); M4.compose(P, Q.identity(), S); trunks.setMatrixAt(i, M4); t.refs.push([trunks, i]); });
      for (const kind of Object.keys(KINDS)) {
        const k = KINDS[kind], sub = far.filter((t) => t.kind === kind); if (!sub.length) continue;
        const m = new THREE.InstancedMesh(k.geo, crownMat, sub.length); parent.add(m);
        sub.forEach((t, i) => {
          P.set(t.x, t.y0 + k.crownY * t.s, t.z); E.set(0, t.rot, 0); Q.setFromEuler(E);
          if (k.flat) S.set(k.flat[0] * t.s, k.flat[1] * t.s, k.flat[2] * t.s); else S.set(t.s, t.s * t.sj, t.s);
          M4.compose(P, Q, S); m.setMatrixAt(i, M4); m.setColorAt(i, Cc.setRGB(...t.col, THREE.SRGBColorSpace)); t.refs.push([m, i]);
        });
      }
    }
    for (const nk of Object.keys(NV)) {
      const sub = near.filter((t) => nearKind(t) === nk); if (!sub.length) continue;
      const m = new THREE.InstancedMesh(NV[nk].geo, NV[nk].side ? nearMats.double : nearMats.single, sub.length); m.castShadow = false; parent.add(m);
      sub.forEach((t, i) => {
        P.set(t.x, t.y0, t.z); E.set(0, t.rot, 0); Q.setFromEuler(E); S.set(t.s, t.s * (t.sj || 1), t.s); M4.compose(P, Q, S); m.setMatrixAt(i, M4);
        const v = t.col ? .9 + (t.col[1] - .4) * .8 : (t.v || 1); m.setColorAt(i, Cc.setRGB(v, v, v)); t.refs.push([m, i]);
      });
    }
  }
  makeTrees(cityTrees, group);
  makeTrees(siteTrees, landscape);

  /* ---------- street lights ---------- */
  const lamps = [];
  for (const x of xRoads) for (let z = COAST + 12; z < zMax; z += 40) { lamps.push([x - hw - 1.2, z]); lamps.push([x + hw + 1.2, z + 20]); }
  for (const z of zRoads) for (let x = xMin; x < xMax; x += 40) { lamps.push([x, z - hw - 1.2]); if (z !== COAST) lamps.push([x + 20, z + hw + 1.2]); }
  const poleB = new Batch(); poleB.box(-.09, 0, -.09, .09, 7.5, .09, C(0x8a9399)); poleB.box(-.09, 7.3, -.09, 1.6, 7.5, .09, C(0x8a9399));
  for (let i = lamps.length - 1; i >= 0; i--) if (Math.hypot(lamps[i][0] - CENTER[0], lamps[i][1] - CENTER[1]) > 430) lamps.splice(i, 1);   // too small to see further out
  const poles = new THREE.InstancedMesh(keep(poleB.geometry()), genMat, lamps.length);
  lamps.forEach(([x, z], i) => { P.set(x, GROUND, z); M4.compose(P, Q.identity(), S.set(1, 1, 1)); poles.setMatrixAt(i, M4); });
  group.add(poles);

  /* ---------- traffic ---------- */
  const lanes = [];
  for (const x of xRoads) { lanes.push(['z', x + 2.3, 1, COAST, zMax]); lanes.push(['z', x - 2.3, -1, COAST, zMax]); }
  for (const z of zRoads) { lanes.push(['x', z - 2.3, 1, xMin - 30, xMax + 30]); lanes.push(['x', z + 2.3, -1, xMin - 30, xMax + 30]); }
  const cars = [];
  lanes.forEach((ln) => { const len = ln[4] - ln[3], n = Math.max(3, Math.round(len / 80)); for (let k = 0; k < n; k++) cars.push({ln, s: r() * len, len, v: 8 + r() * 7}); });
  const carB = new Batch();
  carB.box(-2.2, .3, -.92, 2.2, 1.05, .92, C(0xffffff)); carB.box(-1.3, 1.05, -.82, 1.05, 1.62, .82, C(0x26323d));
  const carMesh = new THREE.InstancedMesh(keep(carB.geometry()), keep(new THREE.MeshStandardMaterial({vertexColors: true, roughness: .3, metalness: .5, envMap: envTex})), cars.length);
  carMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); carMesh.frustumCulled = false;
  const paints = [0xf2f2ef, 0xe9e9e6, 0x1c2128, 0x5c6772, 0xa3adb5, 0xb8202a, 0x1f4a7a, 0xd8c9a8, 0x2f6b4f, 0xe0a030];
  cars.forEach((c, i) => carMesh.setColorAt(i, Cc.setHex(pick(paints))));
  const carShadow = new THREE.InstancedMesh(blobGeo, shadowMat, cars.length); carShadow.instanceMatrix.setUsage(THREE.DynamicDrawUsage); carShadow.frustumCulled = false;
  group.add(carMesh, carShadow);
  for (let i = 0; i < oldParked; i++) { r(); r(); }   // keep the original random sequence for the boats below
  const parkedMesh = new THREE.InstancedMesh(carMesh.geometry, carMesh.material, parkedSite.length);
  parkedSite.forEach(([x, z, flip], i) => { E.set(0, flip ? Math.PI : 0, 0); Q.setFromEuler(E); P.set(x, GROUND, z); M4.compose(P, Q, S.set(1, 1, 1)); parkedMesh.setMatrixAt(i, M4); parkedMesh.setColorAt(i, Cc.setHex(paints[(rs() * paints.length) | 0])); });
  landscape.add(parkedMesh);
  function placeCars(dt) {
    cars.forEach((c, i) => {
      c.s = (c.s + c.v * dt) % c.len;
      const [ax, fixed, dir, a0] = c.ln, along = a0 + (dir > 0 ? c.s : c.len - c.s);
      const x = ax === 'x' ? along : fixed, z = ax === 'x' ? fixed : along;
      const fx = ax === 'x' ? dir : 0, fz = ax === 'z' ? dir : 0;
      E.set(0, Math.atan2(-fz, fx), 0); Q.setFromEuler(E);
      P.set(x, GROUND, z); M4.compose(P, Q, S.set(1, 1, 1)); carMesh.setMatrixAt(i, M4);
      P.set(x + SH[0] * .6, GROUND, z + SH[1] * .6); M4.compose(P, Q, S.set(2.6, 1, 1.2)); carShadow.setMatrixAt(i, M4);
    });
    carMesh.instanceMatrix.needsUpdate = true; carShadow.instanceMatrix.needsUpdate = true;
  }
  placeCars(0);

  /* ---------- boats ---------- */
  const boatB = new Batch(), W = C(0xffffff);
  boatB.box(-3.5, -.4, -1.2, 3.5, .8, 1.2, W); boatB.box(-1.6, .8, -.8, .8, 1.7, .8, C(0xe8eef2));
  boatB.tri([.4, 1.7, 0], [3.2, 1.7, 0], [.4, 10, 0], W); boatB.tri([.4, 1.7, 0], [.4, 10, 0], [3.2, 1.7, 0], W);
  const boats = Array.from({length: 14}, () => ({x: (r() - .5) * 1600, z: shallow1 - 40 - r() * 520, v: (r() < .5 ? -1 : 1) * (2 + r() * 3)}));
  const boatMesh = new THREE.InstancedMesh(keep(boatB.geometry()), genMat, boats.length); boatMesh.frustumCulled = false; boatMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(boatMesh);
  function placeBoats(dt, t) {
    boats.forEach((b, i) => {
      b.x += b.v * dt; if (b.x > 900) b.x = -900; if (b.x < -900) b.x = 900;
      E.set(Math.sin(t * .9 + i) * .03, b.v > 0 ? 0 : Math.PI, Math.sin(t * .7 + i * 2) * .04); Q.setFromEuler(E);
      P.set(b.x, GROUND - .55 + Math.sin(t * 1.3 + i) * .12, b.z); M4.compose(P, Q, S.set(1, 1, 1)); boatMesh.setMatrixAt(i, M4);
    });
    boatMesh.instanceMatrix.needsUpdate = true;
  }
  placeBoats(0, 0);

  /* ---------- assemble ---------- */
  const addMesh = (batch, mat, receive = true) => { if (batch.empty) return null; const m = new THREE.Mesh(keep(batch.geometry()), mat); m.receiveShadow = receive; m.matrixAutoUpdate = false; group.add(m); return m; };
  addMesh(kerb, kerbMat); addMesh(road, roadMat); addMesh(mark, markMat); addMesh(gb, genMat);
  const sh = addMesh(shade, shadowMat, false); if (sh) sh.renderOrder = 1;
  carShadow.renderOrder = 1;
  for (const k of Object.keys(tb)) addMesh(tb[k], facadeMat[k]);

  let last = null, worksOn = false;
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  const hideTree = (t) => { if (t.hidden) return; t.hidden = true; for (const [m, i] of t.refs) { m.setMatrixAt(i, ZERO); m.instanceMatrix.needsUpdate = true; } };
  const STUDIO_FOG = C(0x172532);
  return {
    group, obstacles, envMap: envTex, pit: PIT,
    stats: {towers, houses, trees: trees.length + siteTrees.length, cars: cars.length, boats: boats.length},
    /** Hide every tree whose crown would come between the camera and what it looks at, anywhere along the camera path.
     *  samples: [[px, py, pz, tx, ty, tz], ...]; only the first `reach` of each sight line is checked. Returns the count. */
    clearAlong(samples, margin = 1.5, reach = .92) {
      const lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
      for (const s of samples) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], s[k], s[k + 3]); hi[k] = Math.max(hi[k], s[k], s[k + 3]); }
      let n = 0;
      for (const t of treeRefs) {
        if (t.hidden || t.kind === 'shrub') continue;   // low planting never blocks the view
        const rr = t.cr + margin, c = [t.x, t.cy, t.z];
        if (c[0] < lo[0] - rr || c[0] > hi[0] + rr || c[2] < lo[2] - rr || c[2] > hi[2] + rr || c[1] - rr > hi[1]) continue;
        for (const s of samples) {
          const dx = s[3] - s[0], dy = s[4] - s[1], dz = s[5] - s[2], L = dx * dx + dy * dy + dz * dz || 1;
          const u = Math.min(reach, Math.max(0, ((c[0] - s[0]) * dx + (c[1] - s[1]) * dy + (c[2] - s[2]) * dz) / L));
          const ex = s[0] + dx * u - c[0], ey = s[1] + dy * u - c[1], ez = s[2] + dz * u - c[2];
          if (ex * ex + ey * ey + ez * ez < rr * rr) { hideTree(t); n++; break; }
        }
      }
      return n;
    },
    /** Construction state for the 4D chapter. on: works visible; dig/fill 0..1; crane: bool; landscape 0..1 (1 = finished setting) */
    setWorks({on = false, dig = 0, fill = 0, crane: craneOn = false, landscape: land2 = 1} = {}) {
      worksOn = on; works.visible = on;
      landscape.visible = !on || land2 >= 1;
      const depth = 2.8 * dig * (1 - fill);
      pit.visible = on && depth > .02; pit.scale.y = Math.max(depth, .001); lidWorks.visible = on && !pit.visible;
      spoil.visible = on && dig > .01; spoil.scale.setScalar(.08 + .92 * dig * (1 - .75 * fill));
      excavator.visible = truck.visible = on && fill < 1;
      crane.visible = on && craneOn;
    },
    /** t: seconds; dim: 0 = daylight city, 1 = studio around the model (camera inside the building); cam: the camera */
    update(t, dim = 0, cam = null) {
      const dt = last == null ? 0 : Math.min(.1, t - last); last = t;
      if (dt > 0 && dim < .98) { placeCars(dt); placeBoats(dt, t); }
      if (worksOn) {
        const c = t * .55, sw = .5 - .5 * Math.cos(c);                 // dig, lift, swing to the truck, dump, swing back
        exUpper.rotation.y = sw * 1.9;
        exBoom.rotation.z = -.35 + .55 * Math.sin(c * 2 + .5) * (1 - sw * .3);
        exStick.rotation.z = -1.25 + .45 * Math.sin(c * 2);
        slew.rotation.y = t * .09 + Math.sin(t * .13) * .6;
        trolley.position.x = 20 + 14 * (.5 + .5 * Math.sin(t * .23));
        const hy = -6 - 16 * (.5 + .5 * Math.sin(t * .17 + 1)); hook.position.y = hy; cable.scale.y = -hy; cable.position.y = hy / 2;
      }
      if (cam) sky.position.copy(cam.position);
      skyMat.uniforms.dim.value = dim;
      const fog = scene.fog;
      if (fog) {
        const k = cam && cam.aspect < 1 ? 1.35 : 1;
        fog.color.copy(HOR).lerp(STUDIO_FOG, dim);
        fog.near = THREE.MathUtils.lerp(380 * k, 34, dim);
        fog.far = THREE.MathUtils.lerp(2300 * k, 190, dim);
      }
    },
    dispose() { disposables.forEach((d) => d.dispose && d.dispose()); scene.remove(group); },
  };
}
