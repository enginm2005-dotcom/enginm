import Image from "next/image";
import { AirVent, ArrowRight, Bath, BedDouble, Coffee, DoorOpen, Eye, Maximize2, ShowerHead, Sun, Users, Wifi, type LucideIcon } from "lucide-react";
import { hotel } from "@/config/hotel";
import { images } from "@/config/images";
import type { Dict } from "@/i18n";
import { Reveal } from "./Reveal";

// Икони за удобствата във всяка стая — в същия ред като `features` в речника
const featureIcons: Record<string, LucideIcon[]> = {
  standard: [Wifi, AirVent, ShowerHead, Sun],
  deluxe: [Eye, Wifi, Bath, Sun],
  suite: [DoorOpen, Eye, Bath, Coffee],
  penthouse: [Sun, Eye, Bath, Coffee],
};

export function Rooms({ t }: { t: Dict["rooms"] }) {
  return (
    <section id="rooms" aria-labelledby="rooms-title" className="section-y">
      <div className="container-x">
        <Reveal className="scrim">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 id="rooms-title" className="heading-2">{t.title}</h2>
          <p className="lead">{t.lead}</p>
        </Reveal>
      </div>

      {/* мобилно: хоризонтален скрол със snap; десктоп: решетка */}
      <ul className="container-x mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 [scrollbar-width:none] lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
        {t.items.map((r, i) => {
          const img = images.rooms[r.key as keyof typeof images.rooms];
          const icons = featureIcons[r.key] ?? [];
          return (
            <Reveal as="li" key={r.key} delay={i * 0.08} className="w-[82%] shrink-0 snap-center sm:w-[46%] lg:w-auto">
              <article className="card group flex h-full flex-col overflow-hidden transition duration-500 hover:-translate-y-1.5 hover:shadow-lift">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={img.src}
                    alt={r.alt}
                    fill
                    sizes="(min-width:1024px) 25vw, (min-width:640px) 46vw, 82vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  {r.key === "penthouse" && (
                    <span className="absolute top-4 left-4 rounded-full bg-bronze px-3 py-1 text-xs font-bold tracking-wide text-white">{hotel.floors}F</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-0 p-6 [&>ul]:mb-6">
                  <h3 className="text-2xl">{r.name}</h3>
                  <p className="mt-2 text-muted">{r.desc}</p>

                  <div className="mt-4 flex gap-5 text-sm text-ink">
                    <span className="flex items-center gap-1.5"><Maximize2 className="size-4 text-bronze-dark" aria-hidden="true" />{r.size} {t.m2}</span>
                    <span className="flex items-center gap-1.5"><Users className="size-4 text-bronze-dark" aria-hidden="true" />{t.upTo} {r.guests} {t.guests}</span>
                  </div>

                  <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-muted">
                    {r.features.map((f, j) => {
                      const Icon = icons[j] ?? BedDouble;
                      return (
                        <li key={f} className="flex items-center gap-2">
                          <Icon className="size-4 shrink-0 text-bronze-dark" aria-hidden="true" />{f}
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-ink/15 pt-5">
                    <p className="font-serif text-lg whitespace-nowrap text-ink">{r.price}</p>
                    <a href="#book" className="group/link flex items-center gap-1 text-sm font-semibold whitespace-nowrap text-bronze-dark hover:text-ink">
                      {t.cta}
                      <ArrowRight className="size-4 transition group-hover/link:translate-x-1" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
