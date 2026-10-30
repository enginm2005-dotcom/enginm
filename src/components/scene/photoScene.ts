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

type Key = { name: string; f: [number, number]; s?: [number, number]; h: number; w: number; label?: number };

/** label: 0 = рецепция, 1..FLOORS = етаж */
const KEYS: Key[] = [
  { name: "outside", f: [0.5, 0.47], s: [0.78, 0.5], h: 0.92, w: 0 }, // целият хотел, вдясно (отляво е текстът)
  { name: "approach", f: [0.585, 0.66], s: [0.62, 0.5], h: 0.5, w: 1.3 },
  { name: "door", f: [0.585, 0.72], h: 0.3, w: 1 },
  { name: "lobby", f: [0.585, 0.71], h: 0.2, w: 1, label: 0 }, //      осветената рецепция
  { name: "lobby-l", f: [0.47, 0.715], h: 0.19, w: 0.9, label: 0 },
  { name: "lobby-r", f: [0.7, 0.705], h: 0.19, w: 0.9, label: 0 },
  { name: "exit", f: [0.5, 0.76], h: 0.32, w: 0.8 },
  { name: "sea", f: [0.25, 0.77], h: 0.26, w: 0.9 }, //               водната стена и колата
  { name: "turn", f: [0.55, 0.6], h: 0.45, w: 1.1 },
  { name: "f1", f: [0.62, 0.567], h: 0.18, w: 1, label: 1 }, //       ресторантът
  { name: "f2", f: [0.6, 0.453], h: 0.17, w: 1, label: 2 }, //        редове балкони
  { name: "f3", f: [0.64, 0.376], h: 0.17, w: 1, label: 3 },
  { name: "f4", f: [0.6, 0.294], h: 0.17, w: 1, label: 4 },
  { name: "f5", f: [0.64, 0.215], h: 0.17, w: 1, label: 5 },
  { name: "over", f: [0.42, 0.25], h: 0.36, w: 1.2 }, //             козирката и надписът HOTEL
  { name: "final", f: [0.5, 0.47], s: [0.78, 0.5], h: 0.92, w: 1.3 },
];

const CUM = (() => {
  const c: number[] = [];
  let s = 0;
  for (const k of KEYS) c.push((s += k.w));
  return c.map((v) => v / s);
})();

/** позиция 0..1 във времевата линия на даден ключов кадър */
export const tOfKey = (name: string) => CUM[KEYS.findIndex((k) => k.name === name)] ?? 0;

const ease = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type View = { fx: number; fy: number; sx: number; sy: number; h: number; label?: number };

function sample(t: number): View {
  t = Math.min(1, Math.max(0, t));
  let i = 0;
  while (i < CUM.length - 2 && t > CUM[i + 1]) i++;
  const f = ease((t - CUM[i]) / (CUM[i + 1] - CUM[i] || 1));
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const as = a.s ?? [0.5, 0.5];
  const bs = b.s ?? [0.5, 0.5];
  const near = f < 0.5 ? a : b;
  return {
    fx: lerp(a.f[0], b.f[0], f),
    fy: lerp(a.f[1], b.f[1], f),
    sx: lerp(as[0], bs[0], f),
    sy: lerp(as[1], bs[1], f),
    h: Math.exp(lerp(Math.log(a.h), Math.log(b.h), f)), // мащабът се интерполира логаритмично — равномерно приближение
    label: Math.abs(f - 0.5) > 0.12 ? near.label : undefined,
  };
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
  blur.width = 24;
  blur.height = Math.round((24 * IH) / IW);
  blur.getContext("2d")!.drawImage(img, 0, 0, blur.width, blur.height);

  const ctx = canvas.getContext("2d", { alpha: false })!;
  let W = 1;
  let H = 1;
  let portrait = false;

  return {
    render(t) {
      const v = sample(t);
      const aspect = W / H;
      // на тесен екран не приближаваме толкова, че сградата да излезе от кадъра
      const h = portrait ? Math.max(v.h, (0.42 * IW) / (IH * aspect)) : v.h;
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
      return v.label;
    },
    resize(w, h) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.round(w * dpr);
      H = Math.round(h * dpr);
      canvas.width = W;
      canvas.height = H;
      portrait = w / h < 0.9;
    },
    dispose() {
      img.src = "";
    },
  };
}
