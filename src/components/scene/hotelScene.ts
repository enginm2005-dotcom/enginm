/**
 * 3D сцена на хотела (Three.js), управлявана от скрола. Сградата следва референтната снимка:
 *  - партер: висока остъклена рецепция със стъпала;
 *  - етаж 1: изцяло остъклен ресторант над дебел светъл пояс;
 *  - етажи 2–5: по два балкона със стъклени парапети, каменна облицовка, тъмна метална ивица с аплици по средата;
 *  - голяма козирка с осветление над последния етаж;
 *  - вляво: кула с декоративна решетка и светещ надпис HOTEL, водна стена в тъмния каменен цокъл.
 * Отпред: тротоар, улица, дървета, лампи, кола; отвъд улицата — алея, плаж и море.
 *
 * Координати (метри): фасадата гледа към +Z. Основен корпус x −8.5..15, z −8..6.
 * Всичко е статично и се рисува само когато камерата мръдне.
 */
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const FLOORS = 5; // етажи над партера

/** кота на пода: 0 = рецепция (над стъпалата), 1 = ресторант, 2..5 = етажи със стаи */
export const levelY = (n: number) => (n === 0 ? 0.6 : n === 1 ? 6.6 : 11 + (n - 2) * 3.4);
const floorH = (n: number) => (n === 0 ? 4.9 : n === 1 ? 3.8 : 3.4);
const TOP = levelY(FLOORS) + floorH(FLOORS); // 24.6
const X0 = -8.5; // ляв ръб на основния корпус
const X1 = 15; // десен ръб
const CX = (X0 + X1) / 2; // 3.25 — оста на основния корпус
const GLASS_Z = 5.8; // стъклото на етажите
const BALC_Z = 7.6; // ръб на балконите

/* ------------------------------------------------------------------ */
/* Път на камерата                                                     */
/* ------------------------------------------------------------------ */
type V = [number, number, number];
type Key = { name: string; pos: V; look: V; w: number; label?: number };

/** label: 0 = рецепция, 1..FLOORS = етаж, FLOORS+1 = покрив */
const KEYS: Key[] = (() => {
  const k: Key[] = [
    { name: "outside", pos: [6, 8, 64], look: [-20, 12.5, 0], w: 0 }, // сградата вдясно, отляво остава място за текста
    { name: "approach", pos: [6, 3.2, 27], look: [CX, 4, 0], w: 1.3 },
    { name: "door", pos: [CX, 2.4, 11.5], look: [CX, 2.6, 0], w: 1 },
    { name: "lobby", pos: [CX, 2.4, 3.2], look: [CX, 2, -4], w: 1, label: 0 },
    { name: "lobby-l", pos: [-3.5, 2.8, 1.8], look: [9, 2.5, -3], w: 0.9, label: 0 },
    { name: "lobby-r", pos: [10.5, 3.2, 1.5], look: [-2, 3.1, -2], w: 0.9, label: 0 },
    { name: "exit", pos: [CX, 2.6, 3.5], look: [CX, 2.6, 30], w: 0.8 },
    { name: "sea", pos: [5, 3, 10.5], look: [-1, 1.2, 50], w: 0.9 },
    { name: "turn", pos: [-3, 6.5, 25], look: [CX, 7.5, 0], w: 1.1 },
  ];
  for (let n = 1; n <= FLOORS; n++) {
    const y = levelY(n) + floorH(n) / 2 + 0.1;
    const side = n % 2 ? 1.4 : -1.4;
    k.push({ name: `f${n}`, pos: [CX + side, y, 16.5], look: [CX - side * 0.4, y - 0.2, 0], w: 1, label: n });
  }
  k.push(
    { name: "over", pos: [CX + 20, TOP + 10, 18], look: [CX, TOP, -1], w: 1.3, label: FLOORS + 1 },
    { name: "final", pos: [CX - 12, TOP + 8, -26], look: [CX, TOP - 2, 30], w: 1.3, label: FLOORS + 1 },
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
  stone: std("#d9d0c4", { roughness: 0.85 }), //       светъл камък (рамки, пояс)
  stoneWarm: std("#c9b9a5", { roughness: 0.8 }), //    топла каменна облицовка на балконите
  stoneDark: std("#4a423b", { roughness: 0.7 }), //    тъмен цокъл/рамки
  bronze: std("#5b4a3c", { roughness: 0.45, metalness: 0.5 }), // метална ивица, козирка
  slab: std("#ebe6de", { roughness: 0.7 }),
  darkGlass: std("#2f3c4a", { roughness: 0.15, metalness: 0.4 }),
  frame: std("#3b342e", { roughness: 0.5, metalness: 0.3 }),
  wood: std("#8d705b", { roughness: 0.5 }),
  woodLight: std("#d6c3ad", { roughness: 0.5 }),
  marble: std("#efeae2", { roughness: 0.22 }),
  gold: std("#b39168", { metalness: 0.6, roughness: 0.35 }),
  glass: new THREE.MeshStandardMaterial({ color: "#c7dbe4", transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.3, depthWrite: false, side: THREE.DoubleSide }),
  rail: new THREE.MeshStandardMaterial({ color: "#d9ecf2", transparent: true, opacity: 0.35, roughness: 0.05, depthWrite: false, side: THREE.DoubleSide }),
  water: std("#38bfe0", { roughness: 0.08, metalness: 0.1, emissive: "#0b5f78", emissiveIntensity: 0.35 }),
  lamp: basic("#fff1d2"),
  lampWarm: basic("#ffd9a0"),
  cream: std("#e8dccd", { roughness: 0.9 }),
  linen: std("#fbfaf7", { roughness: 0.95 }),
  brown: std("#6e5544", { roughness: 0.85 }),
  sage: std("#8a9a7e", { roughness: 0.9 }),
  plant: std("#5f7656", { roughness: 0.9 }),
  pot: std("#d9d2c5", { roughness: 0.7 }),
  dark: std("#2a2f36", { roughness: 0.6 }),
  asphalt: std("#4b4e53", { roughness: 0.95 }),
  paving: std("#d9d3c9", { roughness: 0.95 }),
  sand: std("#eadbbd", { roughness: 1 }),
  sea: std("#3a93b8", { roughness: 0.18, metalness: 0.15 }),
  trunk: std("#6e5a48", { roughness: 1 }),
  carPaint: std("#c9a46b", { roughness: 0.25, metalness: 0.6 }),
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
/** кутия с долна основа: (x, y0, z) — център отдолу, размери w×h×d */
const bx = (mat: THREE.Material, p: Parent, x: number, y0: number, z: number, w: number, h: number, d: number, ry = 0) => mesh(BOX, mat, p, x, y0 + h / 2, z, w, h, d, ry);
/** кутия по ръбове: x0..x1, y0..y1, z0..z1 */
const bb = (mat: THREE.Material, p: Parent, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => mesh(BOX, mat, p, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0);
const cyl = (mat: THREE.Material, p: Parent, x: number, y0: number, z: number, r: number, h: number) => mesh(CYL, mat, p, x, y0 + h / 2, z, r, h, r);
const sph = (mat: THREE.Material, p: Parent, x: number, y: number, z: number, r: number, sy = r) => mesh(SPH, mat, p, x, y, z, r, sy, r);

/** вертикална равнина в XY (гледа към +Z) */
const wallZ = (mat: THREE.Material, p: Parent, x: number, y0: number, z: number, w: number, h: number) => mesh(PLANE, mat, p, x, y0 + h / 2, z, w, h, 1);
/** вертикална равнина в ZY; ry = ±π/2 определя накъде гледа */
const wallX = (mat: THREE.Material, p: Parent, x: number, y0: number, z: number, d: number, h: number, ry = Math.PI / 2) => mesh(PLANE, mat, p, x, y0 + h / 2, z, d, h, 1, ry);
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
/** таванна плоскост (гледа надолу) */
function ceilPlane(mat: THREE.Material, p: Parent, x: number, y: number, z: number, w: number, d: number) {
  const m = floorPlane(mat, p, x, y, z, w, d);
  m.rotation.x = Math.PI / 2;
  m.updateMatrix();
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

function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

/* ------------------------------------------------------------------ */
/* Текстури, рисувани в браузъра (без файлове)                         */
/* ------------------------------------------------------------------ */
function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d")!);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** декоративна решетка на кулата + вертикален надпис HOTEL */
const signTexture = () =>
  canvasTex(256, 1024, (c) => {
    c.fillStyle = "#3a2c20";
    c.fillRect(0, 0, 256, 1024);
    // решетка: повтарящ се геометричен мотив
    c.strokeStyle = "rgba(231,190,128,0.85)";
    c.lineWidth = 2.2;
    const s = 32;
    for (let y = 0; y < 1024; y += s)
      for (let x = 0; x < 256; x += s) {
        c.beginPath();
        c.moveTo(x + s / 2, y);
        c.lineTo(x + s, y + s / 2);
        c.lineTo(x + s / 2, y + s);
        c.lineTo(x, y + s / 2);
        c.closePath();
        c.stroke();
        c.beginPath();
        c.arc(x + s / 2, y + s / 2, s / 5, 0, Math.PI * 2);
        c.stroke();
      }
    // мек ореол около буквите
    const g = c.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, "rgba(58,44,32,0)");
    g.addColorStop(0.5, "rgba(58,44,32,0.75)");
    g.addColorStop(1, "rgba(58,44,32,0)");
    c.fillStyle = g;
    c.fillRect(50, 120, 156, 640);
    c.fillStyle = "#fff4dc";
    c.shadowColor = "rgba(255,214,150,0.95)";
    c.shadowBlur = 22;
    c.font = "600 104px Georgia, 'Times New Roman', serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    "HOTEL".split("").forEach((ch, i) => c.fillText(ch, 128, 190 + i * 125));
  });

/** водна стена: светли вертикални струи */
const waterTexture = () =>
  canvasTex(256, 256, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#f6efe4");
    g.addColorStop(1, "#cfd8dc");
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
    const r = rng(9);
    for (let i = 0; i < 90; i++) {
      c.strokeStyle = `rgba(255,255,255,${0.35 + r() * 0.5})`;
      c.lineWidth = 0.6 + r() * 1.6;
      const x = r() * 256;
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x + (r() - 0.5) * 6, 256);
      c.stroke();
    }
  });

/* ------------------------------------------------------------------ */
/* Сцена                                                               */
/* ------------------------------------------------------------------ */
function buildSky(scene: THREE.Scene) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    toneMapped: false,
    uniforms: {
      top: { value: new THREE.Color("#7aa6d6") },
      horizon: { value: new THREE.Color("#f6dcc2") },
      bottom: { value: new THREE.Color("#e9e2d8") },
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

type Item = { pos: V; scale: V; color?: string };

function tree(trunks: Item[], crowns: Item[], x: number, z: number, h: number, r: () => number) {
  trunks.push({ pos: [x, h / 2, z], scale: [0.18, h, 0.18] });
  const g = ["#5f7656", "#6b7f5d", "#56704f"];
  for (let i = 0; i < 3; i++)
    crowns.push({ pos: [x + (r() - 0.5) * 1.4, h + 0.6 + i * 0.9, z + (r() - 0.5) * 1.4], scale: [2 - i * 0.35, 1.5 - i * 0.2, 2 - i * 0.35], color: g[i % 3] });
}

function buildStreet(p: Parent) {
  // тротоар, бордюр, улица, отсрещна алея, плаж, море
  floorPlane(M.paving, p, 0, 0, -40, 200, 96); // зад и под сградата
  floorPlane(M.paving, p, 0, 0.01, 9, 200, 6); //  тротоар z 6..12
  bb(M.stone, p, -100, 100, 0, 0.15, 11.85, 12.05); // бордюр
  floorPlane(M.asphalt, p, 0, 0.005, 16.5, 400, 9); // улица z 12..21
  const dashes: Item[] = [];
  for (let x = -60; x <= 60; x += 6) dashes.push({ pos: [x, 0.02, 16.5], scale: [3, 0.01, 0.18] });
  instanced(BOX, basic("#f3efe6"), p, dashes);
  floorPlane(M.paving, p, 0, 0.01, 23, 400, 4); // алея
  floorPlane(M.sand, p, 0, 0.008, 34, 1400, 18);
  floorPlane(M.sea, p, 0, 0.03, 404, 1800, 724);

  // дървета, жив плет, лампи
  const r = rng(7);
  const trunks: Item[] = [];
  const crowns: Item[] = [];
  for (const x of [-26, -21, 20, 25, 30]) tree(trunks, crowns, x, 4 + r() * 3, 5.5 + r() * 2.5, r);
  for (const x of [-34, -20, 20, 34]) tree(trunks, crowns, x, 10.8, 4.5 + r() * 1.5, r);
  for (let x = -50; x <= 50; x += 12) tree(trunks, crowns, x + 3, 23.5, 3.5 + r(), r); // по алеята
  instanced(CYL, M.trunk, p, trunks);
  instanced(SPH, std("#ffffff", { roughness: 0.95 }), p, crowns);

  instanced(BOX, M.plant, p, [
    { pos: [-19.5, 0.5, 6.5], scale: [4, 1, 1.2] },
    { pos: [18, 0.5, 6.5], scale: [5, 1, 1.2] },
    { pos: [24, 0.5, 6.5], scale: [5, 1, 1.2] },
  ]);

  for (const x of [-22.5, 17.5]) {
    cyl(M.frame, p, x, 0, 11.3, 0.07, 4.2);
    sph(M.lampWarm, p, x, 4.35, 11.3, 0.22, 0.3);
  }

  // паркирана кола (като на снимката)
  const car = new THREE.Group();
  car.position.set(-17, 0, 10.6);
  bx(M.carPaint, car, 0, 0.35, 0, 4.4, 0.7, 1.8);
  bx(M.darkGlass, car, -0.2, 1.05, 0, 2.4, 0.55, 1.6);
  for (const [wx, wz] of [[-1.4, 0.85], [1.4, 0.85], [-1.4, -0.85], [1.4, -0.85]]) {
    const w = mesh(CYL, M.dark, car, wx, 0.36, wz, 0.36, 0.25, 0.36);
    w.rotation.x = Math.PI / 2;
    w.updateMatrix();
  }
  sph(M.lamp, car, 2.2, 0.75, 0.6, 0.08);
  sph(M.lamp, car, 2.2, 0.75, -0.6, 0.08);
  car.updateMatrixWorld();
  p.add(car);

  // съседни сгради в далечината
  const blocks: Item[] = [];
  for (let i = 0; i < 22; i++) {
    const x = (r() > 0.5 ? 1 : -1) * (40 + r() * 150);
    const z = -25 - r() * 200;
    const h = 8 + r() * 20;
    blocks.push({ pos: [x, h / 2, z], scale: [14 + r() * 16, h, 12 + r() * 14], color: r() > 0.5 ? "#ece6dd" : "#dcd8d2" });
  }
  instanced(BOX, std("#ffffff", { roughness: 0.85 }), p, blocks);
}

/* ---------- кулата с надписа ---------- */
function buildTower(p: Parent) {
  const tx0 = -17;
  const tx1 = -11.5;
  // тъмен каменен цокъл с водна стена
  bb(M.stoneDark, p, tx0, X0, 0, 6.6, -4, 6.4);
  wallZ(new THREE.MeshBasicMaterial({ map: waterTexture() }), p, (tx0 + tx1) / 2, 1.1, 6.42, 4.3, 4.6);
  bb(M.lamp, p, tx0 + 0.55, tx1 - 0.55, 5.75, 5.85, 6.3, 6.42); // светлина над водата
  // растения върху цокъла
  instanced(SPH, M.plant, p, [-16, -14.6, -13.2, -11.8, -10.2, -9].map((x, i) => ({ pos: [x, 6.9, 5.7] as V, scale: [0.65, 0.5 + (i % 2) * 0.15, 0.55] as V })));

  // висока част: рамка от светъл камък и вдлъбната решетка с надписа
  bb(M.stone, p, tx0, tx1, 6.6, TOP + 1.2, -4, 6);
  wallZ(new THREE.MeshBasicMaterial({ map: signTexture() }), p, (tx0 + tx1) / 2, 7.4, 6.02, 4.2, TOP - 6.6);
  bb(M.lampWarm, p, tx0 + 0.45, tx0 + 0.6, 7.4, TOP + 0.8, 5.95, 6.05); // светлинни ивици отстрани
  bb(M.lampWarm, p, tx1 - 0.6, tx1 - 0.45, 7.4, TOP + 0.8, 5.95, 6.05);
  bb(M.stoneDark, p, tx0 - 0.1, tx1 + 0.1, TOP + 1.2, TOP + 1.55, -4.1, 6.15); // корниз

  // тясна ивица тъмно стъкло между кулата и корпуса
  bb(M.darkGlass, p, tx1, X0, 6.6, TOP, -4, 5.2);
  const lit: Item[] = [];
  for (let n = 1; n <= FLOORS; n++) lit.push({ pos: [(tx1 + X0) / 2, levelY(n) + 1.6, 5.22], scale: [1.4, 0.35, 1] });
  instanced(PLANE, M.lampWarm, p, lit);
}

/* ---------- основният корпус ---------- */
function buildBody(p: Parent) {
  // задна и странични стени
  const back = wallZ(M.stone, p, CX, 0, -8, X1 - X0, TOP);
  back.rotation.y = Math.PI;
  back.updateMatrix();
  wallX(M.stone, p, X1, 0, -1, 14, TOP);
  wallX(M.stone, p, X0, 0, -1, 14, TOP, -Math.PI / 2);

  // ПАРТЕР: каменни пиластри, стъкло, стъпала
  bb(M.stoneDark, p, X0, X0 + 1.2, 0, 5.5, -8, 6.2);
  bb(M.stoneDark, p, X1 - 1.5, X1, 0, 5.5, -8, 6.2);
  wallZ(M.glass, p, CX - 0.15, 0.6, 5, X1 - X0 - 2.7, 4.9);
  const mull: Item[] = [];
  for (let x = X0 + 3.4; x < X1 - 1.6; x += 2.4) mull.push({ pos: [x, 3.05, 5.02], scale: [0.07, 4.9, 0.08] });
  instanced(BOX, M.frame, p, mull);
  for (let i = 0; i < 3; i++) bb(M.stone, p, X0 + 1.2, X1 - 1.5, 0, 0.2 * (i + 1), 5 + (2 - i) * 0.55, 5 + (3 - i) * 0.55); // стъпала
  bb(M.stoneDark, p, X0 + 1.2, X1 - 1.5, 0, 0.6, -6, 5); // подиум на рецепцията

  // ДЕБЕЛ СВЕТЪЛ ПОЯС над рецепцията (конзолен)
  bb(M.stone, p, -11.5, X1 + 0.3, 5.5, 6.6, -8, 7);
  const down: Item[] = [];
  for (let x = X0 + 2; x < X1 - 1; x += 2.2) down.push({ pos: [x, 5.49, 6.2], scale: [0.16, 0.01, 0.16] });
  instanced(CYL, M.lamp, p, down);

  // ЕТАЖ 1: остъклен ресторант в тъмна рамка
  bb(M.stoneDark, p, X0, X0 + 1.2, 6.6, 11, -8, 6.1);
  bb(M.stoneDark, p, X1 - 1.5, X1, 6.6, 11, -8, 6.1);
  bb(M.stoneDark, p, X0, X1, 10.4, 11, -8, 6.3); // тъмен пояс отгоре
  wallZ(M.glass, p, CX - 0.15, 6.6, GLASS_Z, X1 - X0 - 2.7, 3.8);
  const mull1: Item[] = [];
  for (let x = X0 + 4; x < X1 - 1.6; x += 3) mull1.push({ pos: [x, 8.5, GLASS_Z + 0.02], scale: [0.06, 3.8, 0.07] });
  instanced(BOX, M.frame, p, mull1);

  // ЕТАЖИ 2..5: балкони
  const slabs: Item[] = [];
  const rails: { pos: V; scale: V; ry?: number }[] = [];
  const sconces: Item[] = [];
  const soffit: Item[] = [];
  const doorsMull: Item[] = [];
  const bays: [number, number][] = [
    [X0 + 1.0, 1.6],
    [4.9, X1 - 1.0],
  ];
  for (let n = 2; n <= FLOORS + 1; n++) {
    const y = n <= FLOORS ? levelY(n) : TOP;
    // плоча с балкони (светъл дебел ръб)
    slabs.push({ pos: [CX, y - 0.22, (-8 + BALC_Z) / 2], scale: [X1 - X0, 0.45, BALC_Z + 8] });
    if (n > FLOORS) continue;
    const top = y + floorH(n);
    for (const [a, b] of bays) {
      rails.push({ pos: [(a + b) / 2, y + 0.55, BALC_Z - 0.05], scale: [b - a, 1.1, 1] });
      rails.push({ pos: [a, y + 0.55, (GLASS_Z + BALC_Z) / 2], scale: [BALC_Z - GLASS_Z, 1.1, 1], ry: Math.PI / 2 });
      rails.push({ pos: [b, y + 0.55, (GLASS_Z + BALC_Z) / 2], scale: [BALC_Z - GLASS_Z, 1.1, 1], ry: Math.PI / 2 });
      for (let x = a + 1.5; x < b - 0.5; x += 2.6) soffit.push({ pos: [x, top - 0.47, 6.8], scale: [0.13, 0.01, 0.13] });
      for (let x = a + 1.8; x < b - 0.3; x += 1.8) doorsMull.push({ pos: [x, y + 1.5, GLASS_Z + 0.02], scale: [0.06, 3, 0.07] });
    }
    sconces.push({ pos: [CX, y + 2.1, 6.62], scale: [0.18, 0.32, 0.12] });
  }
  instanced(BOX, M.slab, p, slabs);
  instanced(PLANE, M.rail, p, rails);
  instanced(BOX, M.lampWarm, p, sconces);
  instanced(CYL, M.lamp, p, soffit);
  instanced(BOX, M.frame, p, doorsMull);

  // стъклени врати към балконите
  for (let n = 2; n <= FLOORS; n++) for (const [a, b] of bays) wallZ(M.glass, p, (a + b) / 2, levelY(n), GLASS_Z, b - a, floorH(n) - 0.45);
  // каменни пиластри по краищата и тъмна метална ивица по средата
  bb(M.stoneWarm, p, X0, X0 + 1.0, 11, TOP, -8, 6.3);
  bb(M.stoneWarm, p, X1 - 1.0, X1, 11, TOP, -8, 6.3);
  bb(M.bronze, p, 1.6, 4.9, 11, TOP, -8, 6.5);
  const grooves: Item[] = [];
  for (let x = 1.9; x < 4.7; x += 0.42) grooves.push({ pos: [x, (11 + TOP) / 2, 6.52], scale: [0.05, TOP - 11, 0.04] });
  instanced(BOX, M.dark, p, grooves);

  // КОЗИРКА над последния етаж с осветен ръб
  bb(M.bronze, p, X0 - 0.4, X1 + 0.6, TOP, TOP + 0.75, -8.4, 9.2);
  bb(M.lamp, p, X0 - 0.3, X1 + 0.5, TOP - 0.02, TOP + 0.02, 8.9, 9.05);
  const cdown: Item[] = [];
  for (let x = X0 + 1; x < X1; x += 2.3) cdown.push({ pos: [x, TOP - 0.01, 8.1], scale: [0.15, 0.01, 0.15] });
  instanced(CYL, M.lamp, p, cdown);
}

/* ---------- рецепция ---------- */
function buildLobby(p: Parent) {
  const y = levelY(0);
  floorPlane(M.marble, p, CX, y + 0.01, -0.5, X1 - X0 - 2.7, 11);
  ceilPlane(M.cream, p, CX, 5.48, -1, X1 - X0, 14);
  // задна стена: дървени ламели
  wallZ(M.cream, p, CX, y, -6, X1 - X0, 4.9);
  const slats: Item[] = [];
  for (let x = -4; x <= 10.5; x += 0.45) slats.push({ pos: [x, y + 2.45, -5.85], scale: [0.18, 4.9, 0.2] });
  instanced(BOX, M.wood, p, slats);
  bb(M.gold, p, CX - 2.5, CX + 2.5, y + 3, y + 3.8, -5.75, -5.68); // лого
  // рецепция
  bb(M.woodLight, p, CX - 3.6, CX + 3.6, y, y + 1.05, -3.9, -2.7);
  bb(M.marble, p, CX - 3.8, CX + 3.8, y + 1.05, y + 1.13, -4, -2.6);
  bb(M.gold, p, CX - 3.6, CX + 3.6, y + 0.1, y + 0.16, -2.69, -2.66);
  // полилеи
  const lights: Item[] = [];
  for (const [lx, lz] of [[CX, -0.5], [CX - 6, 1], [CX + 6, 1]])
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      lights.push({ pos: [lx + Math.cos(a) * 0.8, 4.2 - (i % 3) * 0.25, lz + Math.sin(a) * 0.8], scale: [0.12, 0.12, 0.12] });
    }
  instanced(SPH, M.lampWarm, p, lights);
  // таванни лунички
  const dl: Item[] = [];
  for (let x = X0 + 2.5; x < X1 - 2; x += 2.5) for (const z of [-4, 2.5]) dl.push({ pos: [x, 5.46, z], scale: [0.14, 0.01, 0.14] });
  instanced(CYL, M.lamp, p, dl);
  // колони
  for (const x of [X0 + 3.4, X1 - 3.4]) cyl(M.marble, p, x, y, 0.5, 0.35, 4.9);
  // кътове за сядане
  for (const sx of [-1, 1]) {
    const x = CX + sx * 7;
    sofa(p, x, y, 2.6, 3.6, M.cream);
    bx(M.brown, p, x - sx * 2.4, y, 1.6, 1, 0.45, 1);
    cyl(M.marble, p, x, y, 1.3, 0.6, 0.4);
    plant(p, x + sx * 2.6, y, -4.6, 1.4);
  }
  floorPlane(M.sage, p, CX, y + 0.02, 1.8, 5, 3.4);
}

/* ---------- помещения на етажите ---------- */
function bed(p: Parent, x: number, y: number, z: number, w = 2, head: THREE.Material = M.wood) {
  bx(M.woodLight, p, x, y, z, w, 0.35, 2.1);
  bx(M.linen, p, x, y + 0.35, z + 0.05, w - 0.05, 0.25, 2);
  bx(M.brown, p, x, y + 0.6, z + 0.6, w - 0.05, 0.05, 0.6);
  bx(M.linen, p, x - w / 4, y + 0.6, z - 0.75, w / 2 - 0.15, 0.18, 0.4);
  bx(M.linen, p, x + w / 4, y + 0.6, z - 0.75, w / 2 - 0.15, 0.18, 0.4);
  bx(head, p, x, y, z - 1.1, w + 0.4, 1.3, 0.12);
  for (const s of [-1, 1]) {
    bx(M.woodLight, p, x + s * (w / 2 + 0.45), y, z - 0.8, 0.5, 0.5, 0.45);
    sph(M.lampWarm, p, x + s * (w / 2 + 0.45), y + 0.75, z - 0.8, 0.14);
  }
}
function sofa(p: Parent, x: number, y: number, z: number, w: number, mat: THREE.Material = M.cream, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  bx(mat, g, 0, 0, 0, w, 0.42, 0.9);
  bx(mat, g, 0, 0.42, -0.35, w, 0.45, 0.22);
  g.updateMatrixWorld();
  p.add(g);
}
function plant(p: Parent, x: number, y: number, z: number, s = 1) {
  cyl(M.pot, p, x, y, z, 0.3 * s, 0.5 * s);
  sph(M.plant, p, x, y + 1 * s, z, 0.5 * s, 0.75 * s);
}

const ROOM_Z0 = -2.5; // задна стена на стаите

/** черупка на етажа: под, таван, задна стена, странични стени, преграда по средата */
function roomShell(p: Parent, n: number, wall: THREE.Material, floor: THREE.Material, partition = true) {
  const y = levelY(n);
  const h = floorH(n) - 0.45;
  const zMid = (ROOM_Z0 + GLASS_Z) / 2;
  const d = GLASS_Z - ROOM_Z0;
  floorPlane(floor, p, CX, y + 0.01, zMid, X1 - X0 - 2, d);
  ceilPlane(M.cream, p, CX, y + h - 0.01, zMid, X1 - X0 - 2, d);
  wallZ(wall, p, CX, y, ROOM_Z0, X1 - X0 - 2, h);
  wallX(M.cream, p, X0 + 1, y, zMid, d, h, Math.PI / 2);
  wallX(M.cream, p, X1 - 1, y, zMid, d, h, -Math.PI / 2);
  if (partition) bb(M.cream, p, 1.6, 4.9, y, y + h, ROOM_Z0, GLASS_Z - 0.05);
  // светлинна линия на тавана във всяка половина
  bb(M.lamp, p, -5, 0, y + h - 0.06, y + h - 0.02, 1.5, 1.75);
  bb(M.lamp, p, 6.5, 11.5, y + h - 0.06, y + h - 0.02, 1.5, 1.75);
  return { y, h };
}

/** центровете на лявата и дясната стая на етажа */
const LEFT = (X0 + 1 + 1.6) / 2; // ≈ −2.95
const RIGHT = (4.9 + X1 - 1) / 2; // ≈ 9.45

function buildFloor(p: Parent, n: number) {
  switch (n) {
    case 1: {
      // ресторант (целият етаж)
      const { y } = roomShell(p, n, M.stoneWarm, M.wood, false);
      const tables: Item[] = [];
      const chairs: Item[] = [];
      const lamps: Item[] = [];
      for (let tx = -5; tx <= 12; tx += 3.4)
        for (const tz of [0.4, 3.6]) {
          tables.push({ pos: [tx, y + 0.75, tz], scale: [0.6, 0.06, 0.6] });
          tables.push({ pos: [tx, y + 0.37, tz], scale: [0.06, 0.74, 0.06] });
          for (const [dx, dz] of [[0.9, 0], [-0.9, 0], [0, 0.9], [0, -0.9]]) chairs.push({ pos: [tx + dx, y + 0.25, tz + dz], scale: [0.45, 0.5, 0.45] });
          lamps.push({ pos: [tx, y + 2.6, tz], scale: [0.25, 0.25, 0.25] });
        }
      instanced(CYL, M.linen, p, tables);
      instanced(BOX, M.woodLight, p, chairs);
      instanced(SPH, M.lampWarm, p, lamps);
      bb(M.wood, p, -4, 10, y, y + 1, ROOM_Z0 + 0.1, ROOM_Z0 + 0.8); // бар/шведска маса
      bb(M.gold, p, -4, 10, y + 1, y + 1.05, ROOM_Z0 + 0.05, ROOM_Z0 + 0.85);
      break;
    }
    case 2: {
      // стандартни стаи (две, огледални)
      const { y } = roomShell(p, n, M.cream, M.woodLight);
      for (const cx of [LEFT, RIGHT]) {
        bed(p, cx - 1, y, ROOM_Z0 + 1.6, 1.8);
        bx(M.wood, p, cx + 2.4, y, ROOM_Z0 + 0.35, 1.6, 0.75, 0.5);
        bx(M.dark, p, cx + 2.4, y + 1.2, ROOM_Z0 + 0.06, 1.2, 0.7, 0.05);
        sofa(p, cx + 2, y, 4.2, 1.5, M.sage, Math.PI);
      }
      break;
    }
    case 3: {
      // делукс: голямо легло + свободностояща вана
      const { y } = roomShell(p, n, std("#d8c6ad"), M.wood);
      for (const cx of [LEFT, RIGHT]) {
        bed(p, cx - 1.2, y, ROOM_Z0 + 1.6, 2.2, M.brown);
        mesh(CYL, M.linen, p, cx + 2.4, y + 0.3, ROOM_Z0 + 1.8, 0.85, 0.6, 0.5);
        plant(p, cx + 3, y, 4.6);
      }
      break;
    }
    case 4: {
      // апартаменти: хол вляво, спалня вдясно
      const { y } = roomShell(p, n, M.cream, M.woodLight);
      sofa(p, LEFT, y, 1.2, 2.8, M.brown);
      bx(M.marble, p, LEFT, y, 2.7, 1.4, 0.4, 0.8);
      bx(M.dark, p, LEFT, y + 1.1, ROOM_Z0 + 0.06, 2, 1.1, 0.06);
      plant(p, LEFT - 3, y, 4.6, 1.1);
      bed(p, RIGHT - 0.5, y, ROOM_Z0 + 1.6, 2);
      sofa(p, RIGHT + 2.4, y, 4.3, 1.4, M.sage, Math.PI);
      break;
    }
    case 5: {
      // пентхаус: целият етаж
      const { y } = roomShell(p, n, std("#5b4a3c"), M.marble, false);
      bed(p, LEFT, y, ROOM_Z0 + 1.6, 2.4, M.gold);
      sofa(p, RIGHT, y, 2.2, 3.2, M.cream, Math.PI * 0.97);
      bx(M.dark, p, CX, y, 0.5, 1.6, 1, 1.1); // пиано
      bx(M.gold, p, CX, y + 1, 0.5, 1.6, 0.04, 1.1);
      plant(p, -6.2, y, 4.8, 1.2);
      plant(p, 12.8, y, 4.8, 1.2);
      break;
    }
  }
}

/* ---------- тераса на покрива ---------- */
function buildRoof(p: Parent) {
  const y = TOP + 0.75;
  floorPlane(M.woodLight, p, CX, y + 0.01, -0.5, X1 - X0, 15);
  // басейн
  bb(M.slab, p, X0 + 1, CX + 2, y, y + 0.45, -6.5, -1);
  bb(M.water, p, X0 + 1.3, CX + 1.7, y + 0.45, y + 0.49, -6.2, -1.3);
  const loungers: Item[] = [];
  for (let x = X0 + 1.8; x <= CX + 1; x += 2.1) loungers.push({ pos: [x, y + 0.2, 1.4], scale: [0.75, 0.3, 1.9] });
  instanced(BOX, M.linen, p, loungers);
  // бар под пергола
  bb(M.wood, p, 7.5, 13.5, y, y + 1.1, -6, -5.1);
  bb(M.marble, p, 7.4, 13.6, y + 1.1, y + 1.16, -6.1, -5);
  const posts: Item[] = [];
  for (const x of [6.8, 14.2]) for (const z of [-7.4, 3]) posts.push({ pos: [x, y + 1.6, z], scale: [0.18, 3.2, 0.18] });
  instanced(BOX, M.bronze, p, posts);
  bb(M.bronze, p, 6.6, 14.4, y + 3.2, y + 3.45, -7.6, 3.2);
  const bulbs: Item[] = [];
  for (let x = 7.2; x <= 14; x += 0.75) for (const z of [-5, -1.5, 2]) bulbs.push({ pos: [x, y + 2.95, z], scale: [0.08, 0.08, 0.08] });
  instanced(SPH, M.lampWarm, p, bulbs);
  for (const z of [-2.5, 1]) {
    cyl(M.marble, p, 10.5, y, z, 0.45, 0.75);
    bx(M.cream, p, 9.8, y, z, 0.45, 0.45, 0.45);
    bx(M.cream, p, 11.2, y, z, 0.45, 0.45, 0.45);
  }
  plant(p, X0 + 1.2, y, 5.8, 1.2);
  plant(p, X1 - 1.2, y, 5.8, 1.2);
  // стъклен парапет
  wallZ(M.rail, p, CX, y, 9.1, X1 - X0 + 1, 1.1);
  wallZ(M.rail, p, CX, y, -8.3, X1 - X0 + 1, 1.1);
  wallX(M.rail, p, X1 + 0.5, y, 0.4, 17.4, 1.1);
  wallX(M.rail, p, X0 - 0.3, y, 0.4, 17.4, 1.1);
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
  scene.fog = new THREE.Fog("#efe3d6", 130, 620);
  const sky = buildSky(scene);

  // топъл залез: ниско слънце отпред-ляво
  scene.add(new THREE.HemisphereLight("#dfe9f5", "#e6d6c2", 1.45));
  const sun = new THREE.DirectionalLight("#ffdcb4", 2.1);
  sun.position.set(-60, 45, 80);
  scene.add(sun);
  const fill = new THREE.DirectionalLight("#cfe0ff", 0.55);
  fill.position.set(60, 30, -40);
  scene.add(fill);

  const root = new THREE.Group();
  scene.add(root);
  const steps: (() => void)[] = [
    () => buildStreet(root),
    () => buildTower(root),
    () => buildBody(root),
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
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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
        (m.material as THREE.MeshBasicMaterial | undefined)?.map?.dispose();
      });
    },
  };
}
