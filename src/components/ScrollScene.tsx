"use client";
import { useEffect, useRef } from "react";

/**
 * Фиксиран фон, чиято анимация се "върти" със скрола.
 * Кадрите са извадени от видеото (public/scene/{d,m}/fNNN.webp) и се рисуват на canvas —
 * гладко е и на iOS, където video.currentTime е накъсано.
 *
 * Кадрите се свързват със секциите чрез ANCHORS: [id на секцията, позиция във видеото 0..1].
 */
const ANCHORS: [id: string | null, progress: number][] = [
  [null, 0], //            най-горе: кулата в здрача
  ["stats", 0.05],
  ["rooms", 0.15], //      лобито
  ["floors", 0.4], //      изкачване по фасадата ("колкото по-високо…")
  ["amenities", 0.62],
  ["faq", 0.72],
  ["reviews", 0.8], //     покривът
  ["how", 0.9],
  ["book", 1], //          кулата нощем
];

const SETS = {
  d: { dir: "/scene/d", count: 65, w: 720, h: 1280 },
  m: { dir: "/scene/m", count: 49, w: 480, h: 854 },
} as const;

const pad = (n: number) => String(n).padStart(3, "0");
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function ScrollScene() {
  const fgRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const fg = fgRef.current!;
    const bg = bgRef.current!;
    const poster = posterRef.current;
    const fgCtx = fg.getContext("2d")!;
    const bgCtx = bg.getContext("2d")!;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const set = window.innerWidth < 768 ? SETS.m : SETS.d;
    const N = set.count;
    const frames: (HTMLImageElement | undefined)[] = new Array(N);

    let vw = 0;
    let vh = 0;
    let cover = true; // телефон/портрет → cover; широк екран → рязка колона + размазан фон
    let anchors: [number, number][] = [[0, 0]];
    let current = 0; // изгладена позиция 0..1
    let target = 0;
    let raf = 0;
    let drawn = false;

    /* ---------- размери ---------- */
    const resize = () => {
      const box = fg.parentElement!;
      vw = box.clientWidth;
      vh = box.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cover = vw / vh <= 0.8;
      const fgW = cover ? vw : Math.round(vh * (set.w / set.h));
      fg.style.width = `${fgW}px`;
      fg.style.left = `${(vw - fgW) / 2}px`;
      fg.width = Math.round(fgW * dpr);
      fg.height = Math.round(vh * dpr);
      bg.style.display = cover ? "none" : "block";
      bg.width = 64; // много малко: разтегнато става естествено размазано и струва почти нищо
      bg.height = Math.max(36, Math.round(64 * (vh / vw)));
      measureAnchors();
      draw();
    };

    /* ---------- връзка скрол → кадър ---------- */
    function measureAnchors() {
      const sy = window.scrollY;
      const list: [number, number][] = [];
      for (const [id, p] of ANCHORS) {
        const y = id === null ? 0 : document.getElementById(id)?.getBoundingClientRect().top;
        if (y === undefined) continue;
        list.push([id === null ? 0 : y + sy, p]);
      }
      list.sort((a, b) => a[0] - b[0]);
      anchors = list.length ? list : [[0, 0]];
    }

    const progressAt = () => {
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) return 1;
      const y = window.scrollY + window.innerHeight * 0.35; // "линия на четене"
      if (y <= anchors[0][0]) return anchors[0][1];
      for (let i = 1; i < anchors.length; i++) {
        const [y1, p1] = anchors[i];
        if (y <= y1) {
          const [y0, p0] = anchors[i - 1];
          return p0 + ((y - y0) / Math.max(1, y1 - y0)) * (p1 - p0);
        }
      }
      return anchors[anchors.length - 1][1];
    };

    /* ---------- рисуване ---------- */
    const nearest = (i: number) => {
      for (let d = 0; d < N; d++) {
        const a = frames[i - d];
        if (a) return a;
        const b = frames[i + d];
        if (b) return b;
      }
      return undefined;
    };

    const paint = (ctx: CanvasRenderingContext2D, cw: number, ch: number, img: HTMLImageElement, alpha: number, mode: "cover" | "contain") => {
      const s = (mode === "cover" ? Math.max : Math.min)(cw / set.w, ch / set.h);
      const dw = set.w * s;
      const dh = set.h * s;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    function draw() {
      const f = clamp01(current) * (N - 1);
      const i = Math.floor(f);
      const t = f - i;
      const a = nearest(i);
      if (!a) return;
      const b = t > 0.02 ? nearest(Math.min(i + 1, N - 1)) : undefined;

      const layers: [CanvasRenderingContext2D, HTMLCanvasElement, "cover" | "contain"][] = [[fgCtx, fg, cover ? "cover" : "contain"]];
      if (!cover) layers.push([bgCtx, bg, "cover"]);
      for (const [ctx, cv, mode] of layers) {
        ctx.globalAlpha = 1;
        paint(ctx, cv.width, cv.height, a, 1, mode);
        if (b && b !== a) paint(ctx, cv.width, cv.height, b, t, mode); // плавно преливане между съседни кадри
        ctx.globalAlpha = 1;
      }
      if (!drawn) {
        drawn = true;
        fg.dataset.ready = "1";
        bg.dataset.ready = "1";
        if (poster) poster.style.opacity = "0";
      }
    }

    const tick = () => {
      raf = 0;
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.0004) current = target;
      draw();
      if (current !== target) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (reduce) return;
      target = progressAt();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    /* ---------- зареждане: първо груби кадри, после се допълват ---------- */
    const order = (() => {
      const seen = new Set<number>();
      const out: number[] = [];
      for (const step of [16, 8, 4, 2, 1]) {
        for (let i = 0; i < N; i += step) if (!seen.has(i)) (seen.add(i), out.push(i));
        if (!seen.has(N - 1)) (seen.add(N - 1), out.push(N - 1));
      }
      return out;
    })();
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const queue = reduce ? [0] : saveData ? order.filter((i) => i % 4 === 0 || i === N - 1) : order;
    let qi = 1; // queue[0] (кадър 0) се зарежда веднага по-долу
    let alive = true;

    const loadFrame = (i: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          frames[i] = img;
          if (!reduce) target = progressAt();
          if (!raf) draw();
          resolve();
        };
        img.onerror = () => resolve();
        img.src = `${set.dir}/f${pad(i)}.webp`;
      });

    const worker = async () => {
      while (alive && qi < queue.length) await loadFrame(queue[qi++]);
    };

    // кадър 0 веднага; останалите — когато браузърът е свободен, на няколко потока
    loadFrame(queue[0]);
    const startRest = () => {
      for (let k = 0; k < 4; k++) worker();
    };
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const startTimer = window.setTimeout(() => (idle ? idle(startRest, { timeout: 2500 }) : startRest()), 400);

    resize();
    target = current = reduce ? 0 : progressAt();

    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", resize);
    const ro = new ResizeObserver(() => {
      measureAnchors();
      kick();
    });
    ro.observe(document.body);

    return () => {
      alive = false;
      clearTimeout(startTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", resize);
      ro.disconnect();
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed top-0 left-0 -z-10 h-[100lvh] w-full overflow-hidden bg-navy-950">
      {/* размазан фон за широки екрани */}
      <canvas ref={bgRef} className="absolute inset-0 hidden size-full scale-110 opacity-0 brightness-75 transition-opacity duration-700 data-[ready]:opacity-100" />
      {/* постер: първият кадър, докато канвасът се подготви (само телефон) */}
      <picture>
        <source media="(max-width: 767px)" srcSet="/scene/m/f000.webp" />
        <img
          ref={posterRef}
          src="/scene/d/f000.webp"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 size-full object-cover transition-opacity duration-700 md:hidden"
        />
      </picture>
      <canvas
        ref={fgRef}
        className="absolute top-0 h-full opacity-0 transition-opacity duration-700 data-[ready]:opacity-100 md:[mask-image:linear-gradient(to_right,transparent,#000_16%,#000_84%,transparent)]"
      />
      {/* затъмняване — текстът трябва да се чете върху светлото лоби */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/40 via-navy-950/50 to-navy-950/70" />
    </div>
  );
}
