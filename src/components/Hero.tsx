import { ChevronDown } from "lucide-react";
import type { Dict } from "@/i18n";

export function Hero({ t }: { t: Dict["hero"] }) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] items-end overflow-hidden pb-28 sm:items-center sm:pb-0">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-cream/95 via-cream/80 via-60% to-cream/10 to-95% sm:bg-gradient-to-r sm:from-cream/95 sm:via-cream/75 sm:via-35% sm:to-transparent sm:to-60%" />
      <div className="container-x pt-28">
        <div className="max-w-2xl">
          <p className="animate-rise text-xs font-semibold tracking-[0.22em] text-bronze-dark uppercase sm:text-sm">{t.eyebrow}</p>
          <h1 id="hero-title" className="animate-rise-soft mt-4 text-[2.6rem] leading-[1.05] text-ink [animation-delay:120ms] sm:text-6xl lg:text-7xl">
            {t.title}
          </h1>
          <p className="animate-rise-soft mt-5 max-w-xl text-lg text-ink [animation-delay:240ms] sm:text-xl">{t.subtitle}</p>

          <div className="animate-rise mt-8 flex flex-col gap-3 [animation-delay:360ms] sm:flex-row">
            <a href="#book" className="btn-gold min-h-14 px-8 text-lg">{t.primary}</a>
            <a href="#rooms" className="btn-ghost-light min-h-14 px-8 text-lg">{t.secondary}</a>
          </div>

          <ul className="animate-rise mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink [animation-delay:480ms] sm:text-base">
            {t.trust.map((item, i) => (
              <li key={item} className="flex items-center gap-4">
                {i > 0 && <span className="size-1 rounded-full bg-bronze-dark" aria-hidden="true" />}
                <span className={i === 0 ? "font-semibold text-bronze-dark" : ""}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <a href="#stats" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs tracking-widest text-muted uppercase transition hover:text-ink sm:flex">
        {t.scroll}
        <ChevronDown className="size-5 animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
