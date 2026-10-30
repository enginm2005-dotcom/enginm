"use client";
import { useEffect, useRef } from "react";

/**
 * Фиксиран 3D фон (Three.js), чиято камера се движи със скрола:
 * отвън → в рецепцията → обратно навън → етаж по етаж → покрива.
 * Самата сцена е в ./scene/hotelScene.ts и се зарежда отложено, за да не бави първото показване.
 *
 * ANCHORS връзва секции от страницата с ключови кадри от пътя на камерата.
 */
const ANCHORS: [id: string | null, key: string][] = [
  [null, "outside"],
  ["stats", "approach"],
  ["rooms", "lobby"],
  ["floors", "turn"],
  ["amenities", "f1"],
  ["day", "f2"],
  ["faq", "f3"],
  ["reviews", "f4"],
  ["how", "f5"],
  ["book", "final"],
];

export type SceneLabels = { floor: string; names: string[] }; // names[0] = рецепция, [1..N] = етажи, [N+1] = покрив

export function ScrollScene({ labels }: { labels: SceneLabels }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const box = canvas.parentElement!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;
    let alive = true;
    let raf = 0;
    let cleanup = () => {};

    const start = async () => {
      const mod = await import("./scene/hotelScene");
      if (!alive) return;
      let scene: Awaited<ReturnType<typeof mod.createHotelScene>>;
      try {
        scene = await mod.createHotelScene(canvas, { mobile });
      } catch {
        return; // без WebGL остава постерът
      }
      if (!alive) return scene.dispose();

      let anchors: [number, number][] = [[0, 0]];
      const measure = () => {
        const sy = window.scrollY;
        const list: [number, number][] = [];
        for (const [id, key] of ANCHORS) {
          const el = id ? document.getElementById(id) : null;
          if (id && !el) continue;
          list.push([el ? el.getBoundingClientRect().top + sy : 0, mod.tOfKey(key)]);
        }
        anchors = list.sort((a, b) => a[0] - b[0]);
      };
      const progress = () => {
        const doc = document.documentElement;
        if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) return 1;
        const y = window.scrollY + window.innerHeight * 0.35;
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

      measure();
      let current = reduce ? 0 : progress();
      let target = current;
      let shown: number | undefined = -1;

      const updateChip = (label: number | undefined) => {
        if (label === shown) return;
        shown = label;
        const chip = chipRef.current;
        if (!chip) return;
        if (label === undefined) {
          chip.dataset.show = "0";
          return;
        }
        numRef.current!.textContent = label >= 1 && label <= labels.names.length - 2 ? `${labels.floor} ${label}` : "";
        nameRef.current!.textContent = labels.names[label] ?? "";
        chip.dataset.show = "1";
      };

      const draw = () => updateChip(scene.render(current));
      const tick = () => {
        raf = 0;
        current += (target - current) * 0.12;
        if (Math.abs(target - current) < 0.00005) current = target;
        draw();
        if (current !== target) raf = requestAnimationFrame(tick);
      };
      const kick = () => {
        if (reduce) return;
        target = progress();
        if (!raf) raf = requestAnimationFrame(tick);
      };
      const resize = () => {
        scene.resize(box.clientWidth, box.clientHeight);
        measure();
        target = reduce ? 0 : progress();
        draw();
      };

      resize();
      canvas.dataset.ready = "1";
      window.addEventListener("scroll", kick, { passive: true });
      window.addEventListener("resize", resize);
      const ro = new ResizeObserver(() => {
        measure();
        kick();
      });
      ro.observe(document.body);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("scroll", kick);
        window.removeEventListener("resize", resize);
        ro.disconnect();
        scene.dispose();
      };
    };

    // Сцената се строи при първото действие на госта (или след 6 s). Дотогава се вижда постерът,
    // който е точно първият кадър — подмяната е невидима, а първото зареждане остава леко.
    let started = false;
    const events = ["scroll", "pointermove", "pointerdown", "touchstart", "keydown", "wheel"] as const;
    const go = () => {
      if (started) return;
      started = true;
      events.forEach((e) => window.removeEventListener(e, go));
      clearTimeout(timer);
      start();
    };
    events.forEach((e) => window.addEventListener(e, go, { passive: true, once: true }));
    const timer = window.setTimeout(go, 6000);
    if (window.scrollY > 0) go();

    return () => {
      alive = false;
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, go));
      cleanup();
    };
  }, [labels]);

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed top-0 left-0 -z-10 h-[100lvh] w-full overflow-hidden bg-cream">
        {/* постер: първият кадър, докато 3D сцената се зареди */}
        <picture>
          <source media="(max-width: 767px)" srcSet="/scene/poster-m.webp" />
          <img src="/scene/poster-d.webp" alt="" fetchPriority="high" decoding="async" className="absolute inset-0 size-full object-cover" />
        </picture>
        <canvas ref={canvasRef} className="absolute inset-0 size-full opacity-0 transition-opacity duration-500 data-[ready]:opacity-100" />
        {/* затъмняване за четимост на белия текст */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream/45 via-cream/55 to-cream/70" />
      </div>

      {/* индикатор на етажа */}
      <div
        ref={chipRef}
        aria-hidden="true"
        data-show="0"
        className="pointer-events-none fixed top-[4.5rem] right-3 z-30 flex items-baseline gap-2 rounded-full border border-ink/15 bg-cream/80 px-3 py-1.5 text-ink opacity-0 shadow-lift transition-opacity duration-500 data-[show=1]:opacity-100 sm:top-24 lg:top-1/2 lg:right-6 lg:-translate-y-1/2 lg:flex-col lg:items-end lg:gap-0 lg:rounded-2xl lg:px-5 lg:py-4"
      >
        <span ref={numRef} className="text-[10px] font-semibold tracking-[0.18em] text-bronze-dark uppercase empty:hidden lg:text-xs lg:tracking-[0.2em]" />
        <span ref={nameRef} className="font-serif text-sm leading-tight lg:text-2xl" />
      </div>
    </>
  );
}
