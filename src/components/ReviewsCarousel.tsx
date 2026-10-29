"use client";
import { AnimatePresence, m } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { getDict, type Locale } from "@/i18n";

export function ReviewsCarousel({ lang }: { lang: Locale }) {
  const t = getDict(lang).proof;
  const n = t.reviews.length;
  const [[i, dir], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);
  const go = useCallback((d: number) => setState(([cur]) => [(cur + d + n) % n, d]), [n]);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => go(1), 6500);
    return () => clearInterval(id);
  }, [paused, go]);

  const r = t.reviews[i];
  return (
    <div
      className="relative mx-auto mt-16 max-w-3xl"
      role="region"
      aria-roledescription="carousel"
      aria-label={t.reviewsLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative min-h-[19rem] overflow-hidden sm:min-h-[16rem]">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <m.figure
            key={i}
            custom={dir}
            variants={{ enter: (d: number) => ({ x: d * 60, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (d: number) => ({ x: d * -60, opacity: 0 }) }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 60) go(info.offset.x < 0 ? 1 : -1); }}
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${n}`}
            className="card cursor-grab p-8 active:cursor-grabbing sm:p-10"
          >
            <Quote className="size-9 text-gold-400" aria-hidden="true" />
            <blockquote className="mt-4 font-serif text-xl leading-relaxed text-white sm:text-2xl">{r.text}</blockquote>
            <figcaption className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span>
                <span className="block font-semibold text-white">{r.name}</span>
                <span className="text-muted">{r.country} · {r.date} · {r.source}</span>
              </span>
              <span className="flex items-center gap-1 text-gold-300">
                {Array.from({ length: 5 }, (_, s) => (
                  <Star key={s} className={clsx("size-4", r.rating !== null && s < Math.round(r.rating / 2) ? "fill-gold-500 text-gold-500" : "text-gold-500/60")} aria-hidden="true" />
                ))}
                <span className="ml-1 font-semibold">{r.rating ?? "[X]"}/10</span>
              </span>
            </figcaption>
          </m.figure>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button type="button" onClick={() => go(-1)} aria-label={t.prev} className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition hover:border-gold-500 hover:bg-gold-500 hover:text-navy-950">
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <div className="flex gap-1">
          {t.reviews.map((_, d) => (
            <button
              key={d}
              type="button"
              onClick={() => setState([d, d > i ? 1 : -1])}
              aria-label={`${t.goTo} ${d + 1}`}
              aria-current={d === i}
              className="grid size-6 place-items-center"
            >
              <span className={clsx("block h-2 rounded-full transition-all duration-300", d === i ? "w-6 bg-gold-400" : "w-2 bg-white/35")} />
            </button>
          ))}
        </div>
        <button type="button" onClick={() => go(1)} aria-label={t.next} className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition hover:border-gold-500 hover:bg-gold-500 hover:text-navy-950">
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
