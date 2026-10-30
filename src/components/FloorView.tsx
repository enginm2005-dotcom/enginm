"use client";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import { useRef, useState } from "react";
import clsx from "clsx";
import { images } from "@/config/images";
import type { Dict } from "@/i18n";
import { Reveal } from "./Reveal";


export function FloorView({ t }: { t: Dict["floors"] }) {
  const FLOORS = Math.max(...t.groups.map((g) => g.to));
  const [floor, setFloor] = useState(FLOORS - 1);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const group = t.groups.find((g) => floor >= g.from && floor <= g.to)!;
  const k = (floor - 1) / (FLOORS - 1); // 0 → 1

  // Стрелки нагоре/надолу сменят етажа (radiogroup модел)
  const onKey = (e: React.KeyboardEvent) => {
    const d = e.key === "ArrowUp" || e.key === "ArrowRight" ? 1 : e.key === "ArrowDown" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = Math.min(FLOORS, Math.max(1, floor + d));
    setFloor(next);
    btns.current[next]?.focus();
  };

  return (
    <section id="floors" aria-labelledby="floors-title" className="section-y overflow-hidden text-ink">
      <div className="container-x">
        <Reveal className="scrim max-w-2xl">
          <p className="eyebrow !text-bronze-dark">{t.eyebrow}</p>
          <h2 id="floors-title" className="heading-2 !text-ink">{t.title}</h2>
          <p className="lead !text-muted">{t.lead}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-[4.5rem_1fr] gap-4 sm:grid-cols-[7rem_1fr] sm:gap-8 lg:grid-cols-[9rem_1fr_20rem] lg:items-center">
          {/* Сградата */}
          <div role="radiogroup" aria-label={t.pick} onKeyDown={onKey} className="flex flex-col">
            <div className="mx-auto h-2 w-3/4 rounded-t-md bg-sage/80" aria-hidden="true" />
            <div className="flex flex-col-reverse gap-1 rounded-t-lg border border-ink/15 bg-cream/60 p-1.5">
              {Array.from({ length: FLOORS }, (_, i) => i + 1).map((f) => {
                const active = f === floor;
                return (
                  <button
                    key={f}
                    ref={(el) => { btns.current[f] = el; }}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={`${f} ${t.floorLabel}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setFloor(f)}
                    onMouseEnter={() => setFloor(f)}
                    className={clsx(
                      "relative flex h-8 items-center justify-between rounded-md px-2 text-xs font-semibold transition-all duration-300 sm:h-10 sm:px-3 sm:text-sm",
                      active ? "scale-[1.04] bg-bronze text-white shadow-[0_0_24px_rgb(141_112_91/0.45)]" : "bg-ink/4 text-muted hover:bg-ink/7 hover:text-ink",
                    )}
                  >
                    <span>{f}</span>
                    <span className="hidden gap-1 sm:flex" aria-hidden="true">
                      {[0, 1, 2].map((w) => (
                        <span key={w} className={clsx("h-3 w-2 rounded-[2px]", active ? "bg-cream/40" : "bg-beige")} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="h-2 rounded-b-md bg-ink/5" aria-hidden="true" />
          </div>

          {/* „Прозорецът“ */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl ring-1 ring-ink/15 sm:aspect-[4/3]">
            <m.div className="absolute inset-x-0 -top-[10%] h-[130%]" animate={{ y: `${-k * 18}%` }} transition={{ type: "spring", stiffness: 60, damping: 18 }}>
              <Image src={images.floorView.src} alt={`${t.alt} ${floor}`} fill sizes="(min-width:1024px) 50vw, 70vw" className="object-cover" />
            </m.div>
            {/* Препятствия (дървета/покриви), които „потъват“ с изкачването */}
            <m.svg
              viewBox="0 0 400 200"
              preserveAspectRatio="none"
              className="absolute inset-x-0 bottom-0 h-3/5 w-full text-sage-dark"
              animate={{ y: `${k * 100}%`, opacity: floor === FLOORS ? 0 : 1 }}
              transition={{ type: "spring", stiffness: 60, damping: 18 }}
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M0 120 Q20 70 45 100 Q60 60 85 95 L85 80 L130 80 L130 70 L175 70 L175 100 Q200 55 230 95 Q250 65 270 98 L270 75 L330 75 L330 105 Q360 60 400 100 L400 200 L0 200Z"
              />
            </m.svg>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-200/10 via-transparent to-espresso/30" />
            {/* рамка на прозорец */}
            <div className="pointer-events-none absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 bg-cream/80 shadow" aria-hidden="true" />
            <AnimatePresence mode="popLayout">
              <m.span
                key={floor}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-4 left-4 rounded-full bg-cream/70 px-4 py-1.5 text-sm font-semibold text-ink"
              >
                {floor} {t.floorLabel}
              </m.span>
            </AnimatePresence>
          </div>

          {/* Описание */}
          <div className="scrim col-span-2 lg:col-span-1" aria-live="polite">
            <AnimatePresence mode="wait">
              <m.div key={group.from} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <h3 className="text-2xl !text-ink sm:text-3xl">{group.title}</h3>
                <p className="mt-3 text-muted">{group.text}</p>
                <p className="mt-4 inline-block rounded-full border border-bronze/40 px-4 py-1.5 text-sm text-bronze-dark">{group.rooms}</p>
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
