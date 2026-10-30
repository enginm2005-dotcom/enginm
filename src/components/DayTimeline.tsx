import Image from "next/image";
import { Coffee, Moon, Sun, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { images } from "@/config/images";
import type { Dict } from "@/i18n";
import { Reveal } from "./Reveal";

const icons: Record<string, LucideIcon> = { breakfast: Coffee, pool: Sun, dinner: UtensilsCrossed, sunset: Moon };

export function DayTimeline({ t }: { t: Dict["day"] }) {
  return (
    <section id="day" aria-labelledby="day-title" className="section-y">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 id="day-title" className="heading-2 max-w-3xl">{t.title}</h2>
        </Reveal>

        <ol className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
          {/* линия: вертикална на мобилен, хоризонтална на десктоп; градиент от сутрин към залез */}
          <span aria-hidden="true" className="absolute top-2 bottom-2 left-[1.15rem] w-0.5 bg-gradient-to-b from-beige via-bronze to-sage md:top-[1.15rem] md:right-0 md:bottom-auto md:left-0 md:h-0.5 md:w-full md:bg-gradient-to-r" />
          {t.items.map((d, i) => {
            const Icon = icons[d.img];
            const img = images.day[d.img as keyof typeof images.day];
            return (
              <Reveal as="li" key={d.time} delay={i * 0.12} className="relative pl-14 md:pl-0 md:pt-14">
                <span className="absolute top-0 left-0 grid size-10 place-items-center rounded-full bg-bronze text-white ring-4 ring-cream/90">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold tracking-wider text-bronze-dark">{d.time}</p>
                <h3 className="mt-1 text-xl sm:text-2xl">{d.title}</h3>
                <p className="mt-2 text-muted">{d.text}</p>
                <div className="relative mt-4 aspect-[7/5] overflow-hidden rounded-2xl">
                  <Image src={img.src} alt={d.alt} fill sizes="(min-width:768px) 25vw, 85vw" className="object-cover transition duration-700 hover:scale-105" />
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
