/**
 * 3D сцена на хотела (Three.js), управлявана от скрола.
 * Всичко е процедурно (без модели за сваляне) и статично — рисува се само когато камерата мръдне.
 *
 * Координати (метри): фасадата гледа към +Z (морето). Сградата е x −15..15, z −9..9.
 * Партер (рецепция) 0..6 м, етажи 1..10 по 3,6 м, покрив на 42 м.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const FLOORS = 10;
const LOBBY_H = 6;
const FH = 3.6;
const FRONT = 9;
export const levelY = (n: number) => (n === 0 ? 0 : LOBBY_H + (n - 1) * FH);
const ROOF = levelY(FLOORS) + FH; // 42

/* ------------------------------------------------------------------ */
/* Път на камерата                                                     */
/* ------------------------------------------------------------------ */
type V = [number, number, number];
type Key = { name: string; pos: V; look: V; w: number; label?: number };

/** label: 0 = рецепция, 1..10 = етаж, 11 = покрив */
const KEYS: Key[] = (() => {
  const k: Key[] = [
    { name: "outside", pos: [30, 12, 82], look: [0, 19, 0], w: 0 },
    { name: "approach", pos: [7, 4.5, 36], look: [0, 4, 0], w: 1.3 },
    { name: "door", pos: [0, 2.4, 16], look: [0, 2.6, 0], w: 1 },
    { name: "lobby", pos: [0, 2.3, 5.5], look: [0, 1.9, -3], w: 1, label: 0 },
    { name: "lobby-l", pos: [-6.5, 2.8, 3], look: [5, 2.4, -3], w: 0.9, label: 0 },
    { name: "lobby-r", pos: [6.5, 3.4, 2], look: [-5, 3.2, -2], w: 0.9, label: 0 },
    { name: "exit", pos: [0, 2.6, 5], look: [0, 3, 30], w: 0.8 },
    { name: "sea", pos: [3, 3.2, 17], look: [-2, 1.2, 50], w: 0.9 },
    { name: "turn", pos: [-5, 7.5, 27], look: [0, 8, 0], w: 1.1 },
  ];
  for (let n = 1; n <= FLOORS; n++) {
    const y = levelY(n) + 1.8;
    const side = n % 2 ? 1.6 : -1.6;
    k.push({ name: `f${n}`, pos: [side, y, 16.5], look: [-side * 0.4, y - 0.15, 2], w: 1, label: n });
  }
  k.push(
    { name: "over", pos: [26, ROOF + 9, 18], look: [-2, ROOF, -2], w: 1.3, label: 11 },
    { name: "final", pos: [-13, ROOF + 9, -28], look: [1, ROOF - 1, 30], w: 1.3, label: 11 },
  );
  return k;
})();

const CUM = (() => {
  const c: number[] = [];
  let s = 0;
  for (const k of KEYS) c.push((s += k.w));
  return c.map((v) => v / s);
})();

/** позиция 0..1 във времевата линия на даден ключов кадър */
export const tOfKey = (name: string) => CUM[KEYS.findIndex((k) => k.name === name)] ?? 0;

const ease = (x: number) => x * x * (3 - 2 * x);
const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();

function sample(t: number, pos: THREE.Vector3, look: THREE.Vector3) {
  t = Math.min(1, Math.max(0, t));
  let i = 0;
  while (i < CUM.length - 2 && t > CUM[i + 1]) i++;
  const span = CUM[i + 1] - CUM[i] || 1;
  const f = ease((t - CUM[i]) / span);
  const a = KEYS[i];
  const b = KEYS[i + 1];
  pos.copy(tmpA.fromArray(a.pos)).lerp(tmpB.fromArray(b.pos), f);
  look.copy(tmpA.fromArray(a.look)).lerp(tmpB.fromArray(b.look), f);
  const near = f < 0.5 ? a : b;
  return Math.abs(f - 0.5) > 0.12 ? near.label : undefined;
}

/* ------------------------------------------------------------------ */
/* Помощни функции за геометрия                                        */
/* ------------------------------------------------------------------ */
const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 24);
const SPH = new THREE.SphereGeometry(1, 20, 14);
const PLANE = new THREE.PlaneGeometry(1, 1);

const std = (color: string, o: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o });
const basic = (color: string) => new THREE.MeshBasicMaterial({ color });

const M = {
  white: std("#f1eee8", { roughness: 0.55 }),
  concrete: std("#e6dfd5", { roughness: 0.8 }),
  wood: std("#8d705b", { roughness: 0.5 }),
  woodLight: std("#d6c3ad", { roughness: 0.5 }),
  marble: std("#f2eee7", { roughness: 0.22 }),
  gold: std("#a8876b", { metalness: 0.6, roughness: 0.35 }),
  glass: new THREE.MeshStandardMaterial({ color: "#9fcbe0", transparent: true, opacity: 0.3, roughness: 0.05, metalness: 0.3, depthWrite: false, side: THREE.DoubleSide }),
  rail: new THREE.MeshStandardMaterial({ color: "#dff1f7", transparent: true, opacity: 0.32, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide }),
  water: std("#38bfe0", { roughness: 0.08, metalness: 0.1, emissive: "#0b5f78", emissiveIntensity: 0.35 }),
  lamp: basic("#fff3d6"),
  cream: std("#e8dccd", { roughness: 0.9 }),
  linen: std("#fbfaf7", { roughness: 0.95 }),
  navy: std("#6e5544", { roughness: 0.85 }),
  sage: std("#8a9a7e", { roughness: 0.9 }),
  plant: std("#6f8463", { roughness: 0.9 }),
  pot: std("#d9d2c5", { roughness: 0.7 }),
  dark: std("#2a2f36", { roughness: 0.6 }),
  terracotta: std("#b8957a", { roughness: 0.8 }),
  stone: std("#cfc8bc", { roughness: 0.7 }),
  teal: std("#8fbfbf", { roughness: 0.7 }),
  mirror: std("#e3e9ed", { roughness: 0.25, metalness: 0.15 }),
  rubber: std("#4a4f57", { roughness: 0.95 }),
  sand: std("#f0e1c1", { roughness: 1 }),
  paving: std("#ece7de", { roughness: 0.95 }),
  lawn: std("#a3b08f", { roughness: 1 }),
  sea: std("#2f9fc8", { roughness: 0.18, metalness: 0.15 }),
  trunk: std("#9a7a5a", { roughness: 1 }),
};

type Parent = THREE.Object3D;

function mesh(geom: THREE.BufferGeometry, mat: THREE.Material, p: Parent, x: number, y: number, z: number, sx: number, sy: number, sz: number, ry = 0) {
  const m = new THREE.Mesh(geom, mat);
  m.position.set(x, y, z);
  m.scale.set(sx, sy, sz);
  m.rotation.y = ry;
  m.updateMatrix();
  m.matrixAutoUpdate = false;
  p.add(m);
  return m;
}
/** кутия, зададена с долна основа: (x, y0, z) център отдолу, размери w×h×d */
const bx = (mat: THREE.Material, p: Parent, x: number, y0: number, z: number, w: number, h: number, d: number, ry = 0) => mesh(BOX, mat, p, x, y0 + h / 2, z, w, h, d, ry);
const cyl = (mat: THREE.Material, p: Parent, x: number, y0: number, z: number, r: number, h: number) => mesh(CYL, mat, p, x, y0 + h / 2, z, r, h, r);
const sph = (mat: THREE.Material, p: Parent, x: number, y: number, z: number, r: number, sy = r) => mesh(SPH, mat, p, x, y, z, r, sy, r);

/** вертикална равнина в XY (гледа към +Z) */
function wallZ(mat: THREE.Material, p: Parent, x: number, y0: number, z: number, w: number, h: number) {
  return mesh(PLANE, mat, p, x, y0 + h / 2, z, w, h, 1);
}
/** вертикална равнина в ZY (гледа към +X) */
function wallX(mat: THREE.Material, p: Parent, x: number, y0: number, z: number, d: number, h: number) {
  const m = mesh(PLANE, mat, p, x, y0 + h / 2, z, d, h, 1, Math.PI / 2);
  return m;
}
function floorPlane(mat: THREE.Material, p: Parent, x: number, y: number, z: number, w: number, d: number) {
  const m = new THREE.Mesh(PLANE, mat);
  m.position.set(x, y, z);
  m.rotation.x = -Math.PI / 2;
  m.scale.set(w, d, 1);
  m.updateMatrix();
  m.matrixAutoUpdate = false;
  p.add(m);
  return m;
}

/** много еднакви обекти с един draw call */
function instanced(geom: THREE.BufferGeometry, mat: THREE.Material, p: Parent, items: { pos: V; scale: V; ry?: number; color?: string }[]) {
  const im = new THREE.InstancedMesh(geom, mat, items.length);
  const o = new THREE.Object3D();
  items.forEach((it, i) => {
    o.position.fromArray(it.pos);
    o.scale.fromArray(it.scale);
    o.rotation.set(0, it.ry ?? 0, 0);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
    if (it.color) im.setColorAt(i, new THREE.Color(it.color));
  });
  im.instanceMatrix.needsUpdate = true;
  if (im.instanceColor) im.instanceColor.needsUpdate = true;
  p.add(im);
  return im;
}

/* ------------------------------------------------------------------ */
/* Сцена                                                               */
/* ------------------------------------------------------------------ */
function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

function buildSky(scene: THREE.Scene) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    toneMapped: false,
    uniforms: {
      top: { value: new THREE.Color("#5fa8e6") },
      horizon: { value: new THREE.Color("#f4ece2") },
      bottom: { value: new THREE.Color("#eef3f5") },
    },
    vertexShader: "varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }",
    fragmentShader:
      "uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; varying vec3 vW;" +
      "void main(){ float h = normalize(vW - cameraPosition).y;" +
      "vec3 c = h > 0. ? mix(horizon, top, pow(min(1., h * 1.6), 0.7)) : mix(horizon, bottom, min(1., -h * 6.));" +
      "gl_FragColor = vec4(c, 1.);\n#include <colorspace_fragment>\n}",
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), mat);
  sky.renderOrder = -1;
  scene.add(sky);
  return sky;
}

function buildGround(p: Parent) {
  floorPlane(M.paving, p, 0, 0, -11, 160, 98);
  floorPlane(M.lawn, p, -32, 0.02, 14, 26, 40);
  floorPlane(M.lawn, p, 32, 0.02, 14, 26, 40);
  floorPlane(M.sand, p, 0, 0.01, 52, 1400, 30);
  floorPlane(M.sea, p, 0, 0.03, 424, 1800, 720);
  floorPlane(M.paving, p, 0, 0.005, -260, 1800, 400);

  // басейн с шезлонги между хотела и плажа
  bx(M.white, p, 0, 0, 24, 22, 0.5, 9);
  bx(M.water, p, 0, 0.5, 24, 21, 0.03, 8);
  floorPlane(M.woodLight, p, 0, 0.04, 31.5, 26, 4);
  const beds: { pos: V; scale: V }[] = [];
  for (let x = -11; x <= 11; x += 2.4) beds.push({ pos: [x, 0.25, 31.5], scale: [0.8, 0.35, 2] });
  instanced(BOX, M.linen, p, beds);
  const umbrellas: { pos: V; scale: V }[] = [];
  for (let x = -9.8; x <= 11; x += 4.8) umbrellas.push({ pos: [x, 2.3, 31.5], scale: [1.4, 0.18, 1.4] });
  instanced(CYL, M.cream, p, umbrellas);
  instanced(CYL, M.white, p, umbrellas.map((u) => ({ pos: [u.pos[0], 1.15, u.pos[2]] as V, scale: [0.05, 2.3, 0.05] as V })));

  // палми
  const r = rng(7);
  const trunks: { pos: V; scale: V }[] = [];
  const crowns: { pos: V; scale: V; color?: string }[] = [];
  for (const sx of [-1, 1])
    for (let z = 12; z <= 44; z += 6.5) {
      const x = sx * (19.5 + r() * 4);
      const h = 6 + r() * 3;
      trunks.push({ pos: [x, h / 2, z], scale: [0.22, h, 0.22] });
      crowns.push({ pos: [x, h + 0.4, z], scale: [2.3, 0.9, 2.3], color: r() > 0.5 ? "#6f8463" : "#7d8f6e" });
    }
  instanced(CYL, M.trunk, p, trunks);
  instanced(SPH, M.plant, p, crowns);

  // съседни сгради в далечината
  const blocks: { pos: V; scale: V; color?: string }[] = [];
  for (let i = 0; i < 22; i++) {
    const x = (r() > 0.5 ? 1 : -1) * (45 + r() * 160);
    const z = -30 - r() * 220;
    const h = 8 + r() * 26;
    blocks.push({ pos: [x, h / 2, z], scale: [14 + r() * 16, h, 12 + r() * 14], color: r() > 0.5 ? "#f1eee8" : "#e2e6e9" });
  }
  instanced(BOX, std("#ffffff", { roughness: 0.85 }), p, blocks);
}

function buildShell(p: Parent) {
  // плочи
  for (let n = 1; n <= FLOORS; n++) bx(M.white, p, 0, levelY(n) - 0.45, 0, 31, 0.45, 19.4);
  bx(M.white, p, 0, ROOF - 0.5, 0, 31.4, 0.6, 19.8);
  bx(M.concrete, p, 0, -0.2, 0, 32, 0.25, 21); // цокъл

  // странични и задна фасада
  wallX(M.concrete, p, 15, 0, 0, 18.6, ROOF).material = M.concrete;
  wallX(M.concrete, p, -15, 0, 0, 18.6, ROOF);
  const back = wallZ(M.concrete, p, 0, 0, -9.2, 30, ROOF);
  back.rotation.y = Math.PI;
  back.updateMatrix();
  for (const m of p.children.slice(-3)) ((m as THREE.Mesh).material as THREE.Material).side = THREE.DoubleSide;

  // прозорци по страните и отзад (един draw call)
  const r = rng(3);
  const tint = () => {
    const v = r();
    return v < 0.35 ? "#f6dcb0" : v < 0.85 ? "#a8c8dc" : "#7f9fb6";
  };
  const wins: { pos: V; scale: V; ry?: number; color?: string }[] = [];
  for (let n = 1; n <= FLOORS; n++) {
    const y = levelY(n) + FH / 2 - 0.1;
    for (let z = -7.5; z <= 7.5; z += 3) {
      wins.push({ pos: [15.03, y, z], scale: [2.5, 2.7, 1], ry: Math.PI / 2, color: tint() });
      wins.push({ pos: [-15.03, y, z], scale: [2.5, 2.7, 1], ry: -Math.PI / 2, color: tint() });
    }
    for (let x = -13.5; x <= 13.5; x += 3) wins.push({ pos: [x, y, -9.23], scale: [2.5, 2.7, 1], ry: Math.PI, color: tint() });
  }
  instanced(PLANE, new THREE.MeshBasicMaterial({ color: "#ffffff" }), p, wins);

  // предна фасада: стъкло
  wallZ(M.glass, p, -8.5, 0, FRONT - 0.2, 13, LOBBY_H);
  wallZ(M.glass, p, 8.5, 0, FRONT - 0.2, 13, LOBBY_H);
  wallZ(M.glass, p, 0, 3.4, FRONT - 0.2, 4, LOBBY_H - 3.4);
  wallZ(M.glass, p, 0, LOBBY_H, FRONT - 0.2, 30, ROOF - LOBBY_H - 0.5);

  // зад стъклото: "завеси/светлина" за всички отсеци освен централния (там са стаите-витрини)
  const bays: { pos: V; scale: V; color?: string }[] = [];
  for (let n = 1; n <= FLOORS; n++)
    for (const x of [-13.5, -10.5, -7.6, 7.6, 10.5, 13.5])
      bays.push({ pos: [x, levelY(n) + FH / 2 - 0.15, FRONT - 0.75], scale: [2.8, 3.1, 1], color: r() < 0.4 ? "#f4d29f" : r() < 0.75 ? "#e8dccb" : "#b9d3e2" });
  instanced(PLANE, new THREE.MeshBasicMaterial({ color: "#ffffff" }), p, bays);

  // тънки рамки по стъклото
  const mull: { pos: V; scale: V }[] = [];
  for (let x = -13.5; x <= 13.5; x += 1.5) if (Math.abs(x) > 6.3) mull.push({ pos: [x, (LOBBY_H + ROOF) / 2, FRONT - 0.15], scale: [0.06, ROOF - LOBBY_H, 0.08] });
  for (const x of [-13, -10, -7.4, 7.4, 10, 13]) mull.push({ pos: [x, LOBBY_H / 2, FRONT - 0.15], scale: [0.08, LOBBY_H, 0.1] });
  instanced(BOX, M.white, p, mull);

  // вертикални бели ребра
  const fins: { pos: V; scale: V }[] = [];
  for (const x of [-15.2, -12, -9.1, -6.2, 6.2, 9.1, 12, 15.2]) fins.push({ pos: [x, (LOBBY_H + ROOF) / 2, FRONT + 0.25], scale: [0.3, ROOF - LOBBY_H, 0.9] });
  instanced(BOX, M.white, p, fins);

  // балкони (етажи 5–10) със стъклени парапети
  const slabs: { pos: V; scale: V }[] = [];
  const rails: { pos: V; scale: V; ry?: number }[] = [];
  for (let n = 5; n <= FLOORS; n++) {
    const y = levelY(n);
    for (const sx of [-1, 1]) {
      const cx = sx * 10.8;
      slabs.push({ pos: [cx, y - 0.12, FRONT + 1.6], scale: [8.6, 0.24, 1.8] });
      rails.push({ pos: [cx, y + 0.55, FRONT + 2.5], scale: [8.6, 1.1, 1] });
    }
  }
  instanced(BOX, M.white, p, slabs);
  instanced(PLANE, M.rail, p, rails);

  // козирка над входа
  bx(M.white, p, 0, 4.1, FRONT + 2.6, 10, 0.35, 5.2);
  bx(M.wood, p, 0, 3.95, FRONT + 2.6, 9.4, 0.15, 4.8);
  // табела
  bx(M.gold, p, 0, 4.5, FRONT + 5.25, 4, 0.5, 0.08);
}

/* ---------- рецепция ---------- */
function buildLobby(p: Parent) {
  floorPlane(M.marble, p, 0, 0.06, 0, 29.8, 18);
  // задна стена: дървени ламели
  wallZ(M.cream, p, 0, 0, -4.1, 29.8, LOBBY_H);
  const slats: { pos: V; scale: V }[] = [];
  for (let x = -9; x <= 9; x += 0.45) slats.push({ pos: [x, LOBBY_H / 2, -3.95], scale: [0.18, LOBBY_H, 0.2] });
  instanced(BOX, M.wood, p, slats);
  bx(M.gold, p, 0, 3.4, -3.8, 5, 0.9, 0.08); // лого
  // рецепция
  bx(M.woodLight, p, 0, 0, -1.4, 7.5, 1.05, 1.2);
  bx(M.white, p, 0, 1.05, -1.4, 7.8, 0.08, 1.4);
  bx(M.gold, p, 0, 0.1, -0.78, 7.5, 0.06, 0.04);
  // колони
  for (const x of [-10.5, -4.5, 4.5, 10.5]) for (const z of [-1, 5]) if (!(Math.abs(x) < 5 && z === -1)) cyl(M.white, p, x, 0, z, 0.35, LOBBY_H);
  // висящи кръгли лампи
  for (const [x, z, r] of [[0, 1.5, 2.2], [-7, 2.5, 1.4], [7, 2.5, 1.4]] as const) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.07, 10, 48), M.lamp);
    ring.position.set(x, 4.6, z);
    ring.rotation.x = Math.PI / 2;
    ring.updateMatrix();
    ring.matrixAutoUpdate = false;
    p.add(ring);
    for (let a = 0; a < 3; a++) bx(M.dark, p, x + Math.cos((a * Math.PI * 2) / 3) * r, 4.6, z + Math.sin((a * Math.PI * 2) / 3) * r, 0.02, LOBBY_H - 4.6, 0.02);
  }
  // кътове за сядане
  for (const sx of [-1, 1]) {
    const x = sx * 8.5;
    bx(M.cream, p, x, 0, 3.6, 4, 0.45, 1.1);
    bx(M.cream, p, x, 0.45, 4.05, 4, 0.5, 0.25);
    bx(M.navy, p, x - sx * 2.6, 0, 2.4, 1.1, 0.45, 1.1);
    cyl(M.marble, p, x, 0, 2.2, 0.7, 0.4);
    // растения
    cyl(M.pot, p, sx * 13.5, 0, -2.6, 0.55, 0.9);
    sph(M.plant, p, sx * 13.5, 1.9, -2.6, 0.9, 1.4);
    cyl(M.pot, p, sx * 13.5, 0, 6.8, 0.45, 0.7);
    sph(M.plant, p, sx * 13.5, 1.5, 6.8, 0.7, 1.1);
  }
  // килим
  floorPlane(M.sage, p, 0, 0.07, 3, 6, 4);
}

/* ---------- помещение-витрина за всеки етаж ---------- */
const ROOM = { x0: -6, x1: 6, z0: 1, z1: FRONT - 0.3 };

function roomShell(p: Parent, n: number, wall: THREE.Material, floor: THREE.Material) {
  const y = levelY(n);
  const h = FH - 0.45;
  floorPlane(floor, p, 0, y + 0.01, (ROOM.z0 + ROOM.z1) / 2, 12, ROOM.z1 - ROOM.z0);
  wallZ(wall, p, 0, y, ROOM.z0, 12, h);
  const l = wallX(M.cream, p, ROOM.x0, y, (ROOM.z0 + ROOM.z1) / 2, ROOM.z1 - ROOM.z0, h);
  const r = wallX(M.cream, p, ROOM.x1, y, (ROOM.z0 + ROOM.z1) / 2, ROOM.z1 - ROOM.z0, h);
  r.rotation.y = -Math.PI / 2;
  r.updateMatrix();
  void l;
  // светлинна линия на тавана
  bx(M.lamp, p, 0, y + h - 0.05, 3.4, 9, 0.05, 0.25);
  return { y, h };
}

function bed(p: Parent, x: number, y: number, z: number, w = 2, head: THREE.Material = M.wood) {
  bx(M.woodLight, p, x, y, z, w, 0.35, 2.1);
  bx(M.linen, p, x, y + 0.35, z + 0.05, w - 0.05, 0.25, 2);
  bx(M.navy, p, x, y + 0.6, z + 0.6, w - 0.05, 0.05, 0.6); // плед
  bx(M.linen, p, x - w / 4, y + 0.6, z - 0.75, w / 2 - 0.15, 0.18, 0.4);
  bx(M.linen, p, x + w / 4, y + 0.6, z - 0.75, w / 2 - 0.15, 0.18, 0.4);
  bx(head, p, x, y, z - 1.1, w + 0.4, 1.3, 0.12);
  for (const s of [-1, 1]) {
    bx(M.woodLight, p, x + s * (w / 2 + 0.45), y, z - 0.8, 0.5, 0.5, 0.45);
    sph(M.lamp, p, x + s * (w / 2 + 0.45), y + 0.75, z - 0.8, 0.14);
  }
}
const sofa = (p: Parent, x: number, y: number, z: number, w: number, mat = M.cream, ry = 0) => {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  bx(mat, g, 0, 0, 0, w, 0.42, 0.9);
  bx(mat, g, 0, 0.42, -0.35, w, 0.45, 0.22);
  g.updateMatrixWorld();
  p.add(g);
};
const plant = (p: Parent, x: number, y: number, z: number, s = 1) => {
  cyl(M.pot, p, x, y, z, 0.3 * s, 0.5 * s);
  sph(M.plant, p, x, y + 1 * s, z, 0.5 * s, 0.75 * s);
};

function buildFloor(p: Parent, n: number) {
  switch (n) {
    case 1: {
      // ресторант
      const { y } = roomShell(p, n, M.terracotta, M.wood);
      const tables: { pos: V; scale: V }[] = [];
      const chairs: { pos: V; scale: V; ry?: number }[] = [];
      const lamps: { pos: V; scale: V }[] = [];
      for (const tx of [-3.8, 0, 3.8])
        for (const tz of [3, 6.2]) {
          tables.push({ pos: [tx, y + 0.75, tz], scale: [0.6, 0.06, 0.6] });
          tables.push({ pos: [tx, y + 0.37, tz], scale: [0.06, 0.74, 0.06] });
          for (const [dx, dz] of [[0.9, 0], [-0.9, 0], [0, 0.9], [0, -0.9]]) chairs.push({ pos: [tx + dx, y + 0.25, tz + dz], scale: [0.45, 0.5, 0.45] });
          lamps.push({ pos: [tx, y + 2.3, tz], scale: [0.25, 0.25, 0.25] });
        }
      instanced(CYL, M.linen, p, tables);
      instanced(BOX, M.woodLight, p, chairs);
      instanced(SPH, M.lamp, p, lamps);
      bx(M.wood, p, 0, y, 1.35, 8, 1, 0.6); // бар/шведска маса
      break;
    }
    case 2: {
      // спа и закрит басейн
      const { y } = roomShell(p, n, M.teal, M.stone);
      bx(M.water, p, -1, y, 4.6, 8, 0.12, 3.6);
      bx(M.white, p, -1, y, 2.6, 8.4, 0.18, 0.3);
      for (const x of [-4, -1.5, 1]) bx(M.linen, p, x, y, 7.6, 1.6, 0.35, 0.7);
      plant(p, 4.8, y, 2, 1.2);
      plant(p, 4.8, y, 7.6, 1);
      bx(M.woodLight, p, 4.6, y, 4.6, 1.4, 2.4, 2.2); // сауна
      break;
    }
    case 3: {
      // фитнес
      const { y } = roomShell(p, n, M.mirror, M.rubber);
      for (const x of [-4.2, -2.1, 0, 2.1, 4.2]) {
        bx(M.dark, p, x, y, 3.1, 0.8, 0.25, 1.8);
        bx(M.dark, p, x, y, 2.3, 0.08, 1.2, 0.08);
        bx(M.dark, p, x, y + 1.2, 2.3, 0.7, 0.3, 0.12);
      }
      bx(M.dark, p, 0, y, 6.5, 4.5, 0.9, 0.5); // стойка с гири
      for (let i = 0; i < 8; i++) sph(M.gold, p, -2 + i * 0.57, y + 1.05, 6.5, 0.16);
      floorPlane(M.navy, p, 3.5, y + 0.02, 6.6, 2.5, 1.5);
      break;
    }
    case 4: {
      // детски клуб
      const { y } = roomShell(p, n, std("#bfe0f0"), std("#f3d9a6"));
      const r = rng(11);
      const cols = ["#f28b82", "#fbbc04", "#34a853", "#4285f4", "#ff8ab3"];
      instanced(SPH, std("#ffffff"), p, Array.from({ length: 36 }, () => ({ pos: [-4 + r() * 3.5, y + 0.2, 5 + r() * 2.5] as V, scale: [0.2, 0.2, 0.2] as V, color: cols[Math.floor(r() * cols.length)] })));
      instanced(BOX, std("#ffffff"), p, Array.from({ length: 10 }, (_, i) => ({ pos: [1 + (i % 4) * 0.7, y + 0.25 + Math.floor(i / 4) * 0.5, 3 + (i % 2) * 0.2] as V, scale: [0.5, 0.5, 0.5] as V, color: cols[i % cols.length] })));
      const slide = bx(std("#fbbc04"), p, 3.6, y + 0.6, 6, 0.9, 0.1, 3);
      slide.rotation.x = 0.45;
      slide.updateMatrix();
      bx(std("#4285f4"), p, 3.6, y, 4.6, 1, 1.5, 1);
      break;
    }
    case 5: {
      // стандартна стая
      const { y } = roomShell(p, n, M.cream, M.woodLight);
      bed(p, -1.5, y, 3.1, 1.8);
      bx(M.wood, p, 3.5, y, 1.4, 2.4, 0.75, 0.5);
      bx(M.dark, p, 3.5, y + 1.2, 1.1, 1.6, 0.9, 0.05);
      sofa(p, 3.3, y, 6.4, 1.6, M.sage, Math.PI);
      break;
    }
    case 6: {
      // делукс
      const { y } = roomShell(p, n, std("#d8c6ad"), M.wood);
      bed(p, -2.4, y, 3.1, 2.2, M.navy);
      // свободностояща вана
      const tub = mesh(CYL, M.linen, p, 3.2, y + 0.3, 3.2, 0.9, 0.6, 0.55);
      void tub;
      sofa(p, 0.4, y, 7, 2.4, M.cream, Math.PI);
      plant(p, 5.2, y, 7.4);
      break;
    }
    case 7: {
      // апартамент: спалня + хол
      const { y, h } = roomShell(p, n, M.cream, M.woodLight);
      bx(M.woodLight, p, 0, y, 3.5, 0.15, h, 5);
      bed(p, -3, y, 3.2, 2);
      sofa(p, 3, y, 4.2, 2.6, M.navy);
      bx(M.marble, p, 3, y, 5.6, 1.4, 0.4, 0.8);
      bx(M.dark, p, 3, y + 1, 1.12, 2, 1.1, 0.06);
      break;
    }
    case 8: {
      // лаунж и библиотека
      const { y } = roomShell(p, n, M.wood, M.wood);
      const books: { pos: V; scale: V; color?: string }[] = [];
      const r = rng(5);
      const bc = ["#8a3b2f", "#2c4c6e", "#d0a85c", "#5d8f55", "#efe5d3", "#3a3a3a"];
      for (let row = 0; row < 4; row++) {
        bx(M.woodLight, p, 0, y + 0.3 + row * 0.7, 1.2, 10, 0.05, 0.35);
        for (let x = -4.8; x < 4.8; x += 0.13 + r() * 0.05) books.push({ pos: [x, y + 0.55 + row * 0.7, 1.22], scale: [0.1, 0.38 + r() * 0.12, 0.28], color: bc[Math.floor(r() * bc.length)] });
      }
      instanced(BOX, std("#ffffff"), p, books);
      sofa(p, -2.6, y, 5.2, 1.1, M.terracotta, 0.4);
      sofa(p, 2.6, y, 5.2, 1.1, M.terracotta, -0.4);
      floorPlane(M.cream, p, 0, y + 0.02, 5.6, 4, 3);
      cyl(M.marble, p, 0, y, 5.6, 0.5, 0.45);
      break;
    }
    case 9: {
      // конферентна зала
      const { y } = roomShell(p, n, std("#e6e1d8"), std("#9aa3ad"));
      bx(M.wood, p, 0, y, 4.8, 7, 0.75, 1.6);
      const chairs: { pos: V; scale: V }[] = [];
      for (let x = -3; x <= 3; x += 1.2) for (const z of [3.5, 6.1]) chairs.push({ pos: [x, y + 0.45, z], scale: [0.5, 0.9, 0.5] });
      instanced(BOX, M.dark, p, chairs);
      bx(std("#f8fbff", { emissive: "#dbe9ff", emissiveIntensity: 0.6 }), p, 0, y + 0.8, 1.06, 5, 2, 0.04);
      break;
    }
    case 10: {
      // пентхаус
      const { y } = roomShell(p, n, std("#1f3247"), M.marble);
      bed(p, -2.8, y, 3.2, 2.4, M.gold);
      sofa(p, 2.6, y, 5.2, 3, M.cream, Math.PI * 0.95);
      bx(M.dark, p, 3.4, y, 2.2, 1.6, 1, 1.1); // пиано
      bx(M.gold, p, 3.4, y + 1, 2.2, 1.6, 0.04, 1.1);
      plant(p, 5.3, y, 7.6, 1.2);
      plant(p, -5.3, y, 7.6, 1.2);
      break;
    }
  }
}

/* ---------- покрив ---------- */
function buildRoof(p: Parent) {
  const y = ROOF + 0.1;
  floorPlane(M.woodLight, p, 0, y + 0.01, 0, 30.6, 19);
  // инфинити басейн
  bx(M.white, p, -6, y, 4, 15, 0.45, 7.4);
  bx(M.water, p, -6, y + 0.45, 4, 14.4, 0.04, 6.8);
  // шезлонги
  const loungers: { pos: V; scale: V }[] = [];
  for (let x = -13; x <= 0; x += 2.2) loungers.push({ pos: [x, y + 0.2, -1.2], scale: [0.75, 0.3, 1.9] });
  instanced(BOX, M.linen, p, loungers);
  // бар + перголa
  bx(M.wood, p, 9, y, -5, 7, 1.1, 0.9);
  bx(M.white, p, 9, y + 1.1, -5, 7.2, 0.06, 1.1);
  const posts: { pos: V; scale: V }[] = [];
  for (const x of [4, 14.5]) for (const z of [-8.8, 1]) posts.push({ pos: [x, y + 1.9, z], scale: [0.2, 3.8, 0.2] });
  instanced(BOX, M.white, p, posts);
  bx(M.white, p, 9.25, y + 3.8, -3.9, 11, 0.3, 10.4);
  const bulbs: { pos: V; scale: V }[] = [];
  for (let x = 4.5; x <= 14; x += 0.8) for (const z of [-7, -3.5, 0]) bulbs.push({ pos: [x, y + 3.45, z], scale: [0.08, 0.08, 0.08] });
  instanced(SPH, M.lamp, p, bulbs);
  for (const [x, z] of [[6, -1.5], [9, -1.5], [12, -1.5]]) {
    cyl(M.white, p, x, y, z, 0.45, 0.75);
    bx(M.cream, p, x - 0.7, y, z, 0.45, 0.45, 0.45);
    bx(M.cream, p, x + 0.7, y, z, 0.45, 0.45, 0.45);
  }
  plant(p, 14, y, 7.5, 1.3);
  plant(p, 2.5, y, 7.5, 1.1);
  // стъклен парапет по периметъра
  wallZ(M.rail, p, 0, y, 9.7, 31, 1.1);
  wallZ(M.rail, p, 0, y, -9.7, 31, 1.1);
  wallX(M.rail, p, 15.5, y, 0, 19.4, 1.1);
  wallX(M.rail, p, -15.5, y, 0, 19.4, 1.1);
}

/** Слива всички статични обекти с еднакъв материал в един — стотици draw calls стават десетки */
function mergeStatic(root: THREE.Group) {
  root.updateMatrixWorld(true);
  const groups = new Map<THREE.Material, THREE.BufferGeometry[]>();
  const victims: THREE.Mesh[] = [];
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || (m as THREE.InstancedMesh).isInstancedMesh || Array.isArray(m.material)) return;
    const g = m.geometry.clone();
    g.applyMatrix4(m.matrixWorld);
    for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(k)) g.deleteAttribute(k);
    const list = groups.get(m.material) ?? [];
    list.push(g);
    groups.set(m.material, list);
    victims.push(m);
  });
  for (const v of victims) v.parent?.remove(v);
  for (const [mat, geoms] of groups) {
    const merged = mergeGeometries(geoms, false);
    geoms.forEach((g) => g.dispose());
    if (!merged) continue;
    const mesh = new THREE.Mesh(merged, mat);
    mesh.matrixAutoUpdate = false;
    root.add(mesh);
  }
}

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */
export type HotelScene = {
  render: (t: number) => number | undefined;
  resize: (w: number, h: number) => void;
  dispose: () => void;
};

/** пауза, за да диша основната нишка между стъпките на строежа */
const yieldToMain = () => new Promise<void>((r) => setTimeout(r, 0));

export async function createHotelScene(canvas: HTMLCanvasElement, opts: { mobile: boolean }): Promise<HotelScene> {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !opts.mobile, powerPreference: "high-performance", alpha: false });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog("#f1eee8", 140, 650);
  const sky = buildSky(scene);

  scene.add(new THREE.HemisphereLight("#e4f1ff", "#e9dcc6", 1.6));
  const sun = new THREE.DirectionalLight("#fff4e2", 2.4);
  sun.position.set(-50, 90, 70);
  scene.add(sun);
  const fill = new THREE.DirectionalLight("#cfe3ff", 0.6);
  fill.position.set(60, 30, -40);
  scene.add(fill);

  const root = new THREE.Group();
  scene.add(root);
  const steps: (() => void)[] = [
    () => buildGround(root),
    () => buildShell(root),
    () => buildLobby(root),
    ...Array.from({ length: FLOORS }, (_, i) => () => buildFloor(root, i + 1)),
    () => buildRoof(root),
    () => mergeStatic(root),
  ];
  for (const step of steps) {
    step();
    await yieldToMain();
  }
  root.updateMatrixWorld(true);
  root.matrixWorldAutoUpdate = false; // всичко е статично

  const camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.3, 2000);
  const pos = new THREE.Vector3();
  const look = new THREE.Vector3();
  // шейдърите се компилират предварително, за да не "засече" първият скрол
  await (renderer.compileAsync ? renderer.compileAsync(scene, camera) : Promise.resolve(renderer.compile(scene, camera)));

  return {
    render(t) {
      const label = sample(t, pos, look);
      camera.position.copy(pos);
      camera.lookAt(look);
      sky.position.copy(pos);
      renderer.render(scene, camera);
      return label;
    },
    resize(w, h) {
      const dpr = Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.5 : 1.5);
      // таван за пикселите: ~2.4 MP, за да е гладко и на 4K/Retina лаптопи
      const scale = Math.min(dpr, Math.sqrt(2_400_000 / (w * h)));
      renderer.setPixelRatio(scale);
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.aspect = aspect;
      // портрет: пазим хоризонталния ъгъл, за да не се "сплесква" сградата
      camera.fov = aspect >= 1 ? 48 : Math.min(80, (2 * Math.atan(Math.tan((62 * Math.PI) / 360) / aspect) * 180) / Math.PI);
      camera.updateProjectionMatrix();
    },
    dispose() {
      renderer.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry && ![BOX, CYL, SPH, PLANE].includes(m.geometry as never)) m.geometry.dispose();
      });
    },
  };
}
