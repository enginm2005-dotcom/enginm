import { Check, Flame, Mail, Phone } from "lucide-react";
import { hotel } from "@/config/hotel";
import type { Dict, Locale } from "@/i18n";
import { mailHref, telHref, whatsappHref } from "@/lib/links";
import { BookingForm } from "./BookingForm";
import { Reveal } from "./Reveal";
import { WhatsAppIcon } from "./SocialIcons";

export function FinalCta({ t, lang, waText }: { t: Dict["cta"]; lang: Locale; waText: string }) {
  return (
    <section id="book" aria-labelledby="book-title" className="relative isolate flex min-h-[100svh] items-center overflow-hidden py-24">

      <div className="container-x">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 id="book-title" className="text-4xl leading-tight !text-ink sm:text-6xl">{t.title}</h2>
          <p className="mt-4 text-lg text-ink sm:text-xl">{t.lead}</p>
        </Reveal>

        <Reveal delay={0.15} className="mx-auto mt-10 max-w-4xl">
          <BookingForm lang={lang} />

          <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink sm:text-base">
            {t.guarantees.map((g) => (
              <li key={g} className="flex items-center gap-2">
                <Check className="size-4 text-bronze-dark" aria-hidden="true" />{g}
              </li>
            ))}
          </ul>

          {hotel.showPeakSeason && (
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-bronze-dark">
              <Flame className="size-4" aria-hidden="true" />{t.peak}
            </p>
          )}
        </Reveal>

        <Reveal delay={0.25} className="mx-auto mt-12 max-w-2xl text-center">
          <p className="text-muted">{t.alt}</p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <a href={telHref} className="btn-ghost-light flex-col gap-1 rounded-2xl px-2 py-2.5 text-sm sm:flex-row sm:gap-2 sm:rounded-full sm:text-base"><Phone className="size-5" aria-hidden="true" /><span>{t.call}</span></a>
            <a href={whatsappHref(waText)} target="_blank" rel="noopener noreferrer" className="btn-ghost-light flex-col gap-1 rounded-2xl px-2 py-2.5 text-sm sm:flex-row sm:gap-2 sm:rounded-full sm:text-base"><WhatsAppIcon className="size-5" /><span>WhatsApp</span></a>
            <a href={mailHref(t.mailSubject)} className="btn-ghost-light flex-col gap-1 rounded-2xl px-2 py-2.5 text-sm sm:flex-row sm:gap-2 sm:rounded-full sm:text-base"><Mail className="size-5" aria-hidden="true" /><span>{t.email}</span></a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
