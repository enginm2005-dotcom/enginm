/**
 * Фон, управляван от скрола: „камера“ върху истинската снимка на хотела (public/scene/hotel.webp).
 * Камерата се приближава, влиза в рецепцията, излиза към улицата, качва се етаж по етаж до козирката
 * и накрая показва целия хотел. Рисува се на canvas само когато камерата мръдне.
 *
 * Ключовите кадри са в координати на снимката (0..1): f = точка от снимката, s = къде на екрана да застане,
 * h = каква част от височината на снимката се вижда (по-малко = по-голямо приближение).
 * Ако смениш снимката, нагласи KEYS по нея (виж README).
 */

export const FLOORS = 5;

type Key = { name: string; f: [number, number]; s?: [number, number]; h: number; w: number; label?: number; hold?: boolean };

/**
 * Пътят на камерата. hold = мек спиране в кадъра (етажи, лобито); между тях движението е непрекъснато.
 * label: 0 = рецепция, 1..FLOORS = етаж.
 */
const KEYS: Key[] = [
  { name: "outside", f: [0.5, 0.47], s: [0.78, 0.5], h: 0.92, w: 0, hold: true }, // целият хотел, вдясно от текста
  { name: "approach", f: [0.58, 0.68], s: [0.6, 0.52], h: 0.46, w: 1.4 }, //         към входа
  { name: "door", f: [0.585, 0.72], h: 0.26, w: 1 }, //                             стъпалата и стъклото
  { name: "lobby", f: [0.585, 0.705], h: 0.15, w: 1.1, label: 0, hold: true }, //   вътре в лобито
  { name: "lobby-l", f: [0.48, 0.71], h: 0.14, w: 1, label: 0 }, //                 бавна панорама
  { name: "lobby-r", f: [0.69, 0.7], h: 0.14, w: 1.2, label: 0 },
  { name: "rise", f: [0.6, 0.64], h: 0.17, w: 0.9 }, //                             тръгва нагоре
  { name: "f1", f: [0.615, 0.567], h: 0.19, w: 1, label: 1, hold: true }, //        ресторантът
  { name: "f2", f: [0.615, 0.452], h: 0.19, w: 1, label: 2, hold: true }, //        етажите с балконите
  { name: "f3", f: [0.615, 0.375], h: 0.19, w: 1, label: 3, hold: true },
  { name: "f4", f: [0.615, 0.294], h: 0.19, w: 1, label: 4, hold: true },
  { name: "f5", f: [0.615, 0.214], h: 0.19, w: 1, label: 5, hold: true },
  { name: "canopy", f: [0.5, 0.17], h: 0.3, w: 1 }, //                              козирката и надписът
  { name: "final", f: [0.5, 0.47], s: [0.78, 0.5], h: 0.92, w: 1.4, hold: true }, // обратно целият хотел
];

const CUM = (() => {
  const c: number[] = [];
  let s = 0;
  for (const k of KEYS) c.push((s += k.w));
  return c.map((v) => v / s);
})();

/** позиция 0..1 във времевата линия на даден ключов кадър */
export const tOfKey = (name: string) => CUM[KEYS.findIndex((k) => k.name === name)] ?? 0;

type Vec = [number, number, number, number, number]; // fx, fy, log h, sx, sy
const vec = (k: Key): Vec => [k.f[0], k.f[1], Math.log(k.h), (k.s ?? [0.5, 0.5])[0], (k.s ?? [0.5, 0.5])[1]];

/** Catmull-Rom: гладка крива през ключовите кадри, без „чупки“ в движението */
const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);

/**
 * Време вътре в отсечката: камерата спира меко само в кадрите с hold.
 * Скоростта в останалите краища е 1, за да се съединява гладко със съседните отсечки.
 */
function shape(u: number, holdA: boolean, holdB: boolean) {
  if (holdA && holdB) return u * u * u * (u * (u * 6 - 15) + 10); // smootherstep: тръгва и спира от покой
  if (holdA) return u * u * (2 - u); //                            тръгва от покой
  if (holdB) return 1 - (1 - u) * (1 - u) * (1 + u); //            спира в покой
  return u;
}

type View = { fx: number; fy: number; sx: number; sy: number; h: number; label?: number };

function sample(t: number): View {
  t = Math.min(1, Math.max(0, t));
  let i = 0;
  while (i < CUM.length - 2 && t > CUM[i + 1]) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const u = shape((t - CUM[i]) / (CUM[i + 1] - CUM[i] || 1), !!a.hold, !!b.hold);
  const P0 = vec(KEYS[Math.max(0, i - 1)]);
  const P1 = vec(a);
  const P2 = vec(b);
  const P3 = vec(KEYS[Math.min(KEYS.length - 1, i + 2)]);
  const v = P1.map((_, j) => cr(P0[j], P1[j], P2[j], P3[j], u));
  const near = u < 0.5 ? a : b;
  return { fx: v[0], fy: v[1], h: Math.exp(v[2]), sx: v[3], sy: v[4], label: Math.abs(u - 0.5) > 0.15 ? near.label : undefined };
}

export type PhotoScene = {
  render: (t: number) => number | undefined;
  resize: (w: number, h: number) => void;
  dispose: () => void;
};

export async function createPhotoScene(canvas: HTMLCanvasElement, opts: { src: string }): Promise<PhotoScene> {
  const img = new Image();
  img.decoding = "async";
  img.src = opts.src;
  await img.decode();
  const IW = img.naturalWidth;
  const IH = img.naturalHeight;

  // размазан фон: снимката, смалена до няколко десетки пиксела и разтеглена — естествено размито и евтино
  const blur = document.createElement("canvas");
  blur.width = 12;
  blur.height = Math.round((12 * IH) / IW);
  const bctx = blur.getContext("2d")!;
  bctx.drawImage(img, 0, 0, blur.width, blur.height);
  bctx.fillStyle = "rgba(24,17,12,0.38)"; // по-тъмно и спокойно, за да не отвлича от снимката
  bctx.fillRect(0, 0, blur.width, blur.height);

  const ctx = canvas.getContext("2d", { alpha: false })!;
  let W = 1;
  let H = 1;
  let portrait = false;
  let vignette: CanvasGradient | string = "transparent";

  return {
    render(t) {
      const v = sample(t);
      const aspect = W / H;
      // на тесен екран не приближаваме толкова, че сградата да излезе от кадъра
      const h = portrait ? Math.max(v.h, (0.34 * IW) / (IH * aspect)) : v.h;
      const sx = portrait ? 0.5 : v.sx;
      const vh = h * IH; // видима височина в пиксели на снимката
      const vw = vh * aspect;
      let x0 = v.fx * IW - sx * vw;
      let y0 = v.fy * IH - v.sy * vh;
      if (vw <= IW) x0 = Math.min(Math.max(x0, 0), IW - vw);
      if (vh <= IH) y0 = Math.min(Math.max(y0, 0), IH - vh);
      const k = W / vw; // пиксели на екрана за пиксел от снимката

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      if (vw > IW || vh > IH) {
        // извън снимката: размазано продължение
        const s = Math.max(W / blur.width, H / blur.height);
        ctx.drawImage(blur, (W - blur.width * s) / 2, (H - blur.height * s) / 2, blur.width * s, blur.height * s);
      }
      // видимата част от снимката
      const ix0 = Math.max(0, x0);
      const iy0 = Math.max(0, y0);
      const ix1 = Math.min(IW, x0 + vw);
      const iy1 = Math.min(IH, y0 + vh);
      ctx.drawImage(img, ix0, iy0, ix1 - ix0, iy1 - iy0, (ix0 - x0) * k, (iy0 - y0) * k, (ix1 - ix0) * k, (iy1 - iy0) * k);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);
      return v.label;
    },
    resize(w, h) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.round(w * dpr);
      H = Math.round(h * dpr);
      canvas.width = W;
      canvas.height = H;
      portrait = w / h < 0.9;
      // мека кинематографична винетка по краищата
      const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) * 0.6);
      g.addColorStop(0, "rgba(20,14,10,0)");
      g.addColorStop(1, "rgba(20,14,10,0.32)");
      vignette = g;
    },
    dispose() {
      img.src = "";
    },
  };
}
