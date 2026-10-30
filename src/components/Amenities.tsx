import { Baby, Car, ConciergeBell, Coffee, Dumbbell, Martini, Sparkles, UtensilsCrossed, Waves, Wifi, type LucideIcon } from "lucide-react";
import type { Dict } from "@/i18n";
import { Reveal } from "./Reveal";

const icons: Record<string, LucideIcon> = {
  pool: Waves, spa: Sparkles, restaurant: UtensilsCrossed, breakfast: Coffee, parking: Car,
  wifi: Wifi, gym: Dumbbell, bar: Martini, roomservice: ConciergeBell, kids: Baby,
};

export function Amenities({ t }: { t: Dict["amenities"] }) {
  return (
    <section id="amenities" aria-labelledby="amenities-title" className="section-y">
      <div className="container-x">
        <Reveal className="text-center">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 id="amenities-title" className="heading-2">{t.title}</h2>
          <p className="lead mx-auto">{t.lead}</p>
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
          {t.items.map((a, i) => {
            const Icon = icons[a.key] ?? Sparkles;
            return (
              <Reveal as="li" key={a.key} delay={(i % 5) * 0.06}>
                <div className="group h-full rounded-2xl glass p-5 transition duration-300 hover:-translate-y-1 hover:border-bronze/60 hover:shadow-card sm:p-6">
                  <span className="grid size-12 place-items-center rounded-xl bg-ink/5 text-bronze-dark transition duration-300 group-hover:bg-bronze group-hover:text-white">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-sans text-base font-semibold text-ink">{a.name}</h3>
                  <p className="mt-1 text-sm text-muted">{a.text}</p>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
