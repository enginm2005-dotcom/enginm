import { ArrowUpDown, Baby, CalendarCheck, Camera, Clock, Receipt, SprayCan, SquareParking, VolumeX, type LucideIcon } from "lucide-react";
import type { Dict } from "@/i18n";
import { Reveal } from "./Reveal";
import { Accordion } from "./Accordion";

const icons: Record<string, LucideIcon> = {
  photos: Camera, fees: Receipt, cancel: CalendarCheck, noise: VolumeX, clean: SprayCan,
  parking: SquareParking, elevator: ArrowUpDown, late: Clock, kids: Baby,
};

export function Worries({ t }: { t: Dict["worries"] }) {
  return (
    <section id="faq" aria-labelledby="worries-title" className="section-y">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 id="worries-title" className="heading-2">{t.title}</h2>
          <p className="lead">{t.lead}</p>
        </Reveal>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {t.items.map((w, i) => {
            const Icon = icons[w.key] ?? Camera;
            return (
              <Reveal as="li" key={w.key} delay={(i % 3) * 0.08}>
                <div className="card group flex h-full gap-4 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold-500/20 text-gold-300 transition group-hover:bg-gold-500 group-hover:text-navy-950">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-sans text-base leading-snug font-semibold text-white">{w.q}</h3>
                    <p className="mt-2 text-muted">{w.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>

        <div className="mx-auto mt-20 max-w-3xl">
          <Reveal>
            <h3 className="text-center text-3xl">{t.faqTitle}</h3>
          </Reveal>
          <Accordion items={t.faq} className="mt-8" />
        </div>
      </div>
    </section>
  );
}
