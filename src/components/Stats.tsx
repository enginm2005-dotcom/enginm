import { Counter } from "./Counter";
import { Reveal } from "./Reveal";
import type { Dict, Locale } from "@/i18n";

export function Stats({ items, lang, dark }: { items: Dict["stats"]; lang: Locale; dark?: boolean }) {
  return (
    <dl className="grid grid-cols-3 gap-4 text-center sm:gap-8">
      {items.map((s, i) => (
        <Reveal key={s.label} delay={i * 0.1}>
          <dt className="sr-only">{s.label}</dt>
          <dd className={`font-serif text-4xl sm:text-6xl ${dark ? "text-gold-300" : "text-navy-900"}`}>
            <Counter value={s.value} suffix={s.suffix} locale={lang} />
          </dd>
          <dd aria-hidden="true" className={`mt-2 text-sm sm:text-base ${dark ? "text-white/75" : "text-muted"}`}>{s.label}</dd>
        </Reveal>
      ))}
    </dl>
  );
}
