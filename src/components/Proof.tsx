import { Award, Star } from "lucide-react";
import { hotel, orX } from "@/config/hotel";
import type { Dict, Locale } from "@/i18n";
import { Reveal } from "./Reveal";
import { Stats } from "./Stats";
import { ReviewsCarousel } from "./ReviewsCarousel";
import { Gallery } from "./Gallery";

// Текстови знаци на платформите — замени с официалните им баджове/лога (виж условията им за ползване)
const platforms = [
  { key: "booking", label: <span className="font-bold text-[#003580]">Booking<span className="text-[#0071c2]">.com</span></span> },
  { key: "google", label: <span className="font-semibold"><span className="text-[#4285F4]">G</span><span className="text-[#EA4335]">o</span><span className="text-[#FBBC05]">o</span><span className="text-[#4285F4]">g</span><span className="text-[#34A853]">l</span><span className="text-[#EA4335]">e</span></span> },
  { key: "tripadvisor", label: <span className="font-bold text-[#00843D]">Tripadvisor</span> },
] as const;

export function Proof({ t, lang }: { t: Dict["proof"]; lang: Locale }) {
  return (
    <section id="reviews" aria-labelledby="reviews-title" className="section-y">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 id="reviews-title" className="heading-2">{t.title}</h2>
        </Reveal>

        {/* Оценки от платформите */}
        <ul className="mt-10 grid grid-cols-3 gap-2.5 sm:mt-12 sm:gap-6">
          {platforms.map((p, i) => {
            const r = hotel.ratings[p.key];
            const filled = r.score === null ? 0 : Math.round((r.score / r.max) * 5);
            return (
              <Reveal as="li" key={p.key} delay={i * 0.08}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="card flex h-full flex-col items-center px-2 py-5 text-center transition duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-7">
                  <span className="rounded-lg bg-white px-2.5 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-xl">{p.label}</span>
                  <p className="mt-3 font-serif text-3xl text-ink sm:mt-4 sm:text-5xl">
                    {orX(r.score)}<span className="text-base text-muted sm:text-2xl">/{r.max}</span>
                  </p>
                  <span className="mt-2 flex gap-0.5 sm:mt-3 sm:gap-1" aria-hidden="true">
                    {Array.from({ length: 5 }, (_, s) => (
                      <Star key={s} className={`size-3 sm:size-5 ${s < filled ? "fill-bronze text-bronze" : "text-bronze/50"}`} />
                    ))}
                  </span>
                  <p className="mt-2 text-xs text-muted sm:text-sm">{orX(r.count)} {t.reviewsOf}</p>
                </a>
              </Reveal>
            );
          })}
        </ul>

        <ReviewsCarousel lang={lang} />

        {/* Броячи */}
        <div className="mt-20 glass rounded-3xl px-6 py-12 sm:px-12">
          <Stats items={t.stats} lang={lang} dark />
        </div>

        {/* Награди */}
        <Reveal className="mt-16 text-center">
          <h3 className="font-sans text-sm font-semibold tracking-[0.2em] text-muted uppercase">{t.awardsTitle}</h3>
          <ul className="mt-6 flex flex-wrap justify-center gap-3">
            {t.awards.map((a) => (
              <li key={a} className="flex items-center gap-2 rounded-full glass px-5 py-2.5 text-sm text-ink">
                <Award className="size-4 text-bronze-dark" aria-hidden="true" />{a}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Галерия */}
        <Reveal className="mt-20">
          <h3 className="text-3xl sm:text-4xl">{t.galleryTitle}</h3>
        </Reveal>
        <Gallery lang={lang} />
      </div>
    </section>
  );
}
