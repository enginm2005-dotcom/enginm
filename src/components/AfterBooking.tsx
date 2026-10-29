"use client";
import { m, useScroll, useSpring } from "framer-motion";
import { BedDouble, CalendarCheck, KeyRound, MailCheck, Send, type LucideIcon } from "lucide-react";
import { useRef } from "react";
import type { Dict } from "@/i18n";
import { whatsappHref } from "@/lib/links";
import { Reveal } from "./Reveal";
import { WhatsAppIcon } from "./SocialIcons";

const icons: LucideIcon[] = [CalendarCheck, MailCheck, Send, KeyRound, BedDouble];

export function AfterBooking({ t }: { t: Dict["after"] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="how" aria-labelledby="how-title" className="section-y">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 id="how-title" className="heading-2">{t.title}</h2>
          <p className="lead">{t.lead}</p>
          <div className="mt-8 hidden rounded-3xl glass p-6 lg:block">
            <p className="font-serif text-xl text-white">{t.question}</p>
            <a href={whatsappHref(t.whatsappText)} target="_blank" rel="noopener noreferrer" className="btn mt-4 bg-[#1f7a4d] text-white hover:-translate-y-0.5 hover:bg-[#186640]">
              <WhatsAppIcon className="size-5" />{t.whatsapp}
            </a>
          </div>
        </Reveal>

        <ol ref={ref} className="relative">
          <span aria-hidden="true" className="absolute top-6 bottom-6 left-6 w-0.5 bg-white/20" />
          <m.span aria-hidden="true" style={{ scaleY }} className="absolute top-6 bottom-6 left-6 w-0.5 origin-top bg-gold-500" />
          {t.steps.map((s, i) => {
            const Icon = icons[i];
            return (
              <Reveal as="li" key={s.title} delay={0.05} className="relative flex gap-6 pb-10 last:pb-0">
                <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-navy-900 text-gold-300 ring-8 ring-navy-950/70">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="card flex-1 p-6 transition duration-300 hover:shadow-lift">
                  <p className="text-xs font-bold tracking-[0.2em] text-gold-300 uppercase">0{i + 1}</p>
                  <h3 className="mt-1 text-xl sm:text-2xl">{s.title}</h3>
                  <p className="mt-2 text-muted">{s.text}</p>
                </div>
              </Reveal>
            );
          })}
        </ol>

        <div className="rounded-3xl glass p-6 text-center lg:hidden">
          <p className="font-serif text-xl text-white">{t.question}</p>
          <a href={whatsappHref(t.whatsappText)} target="_blank" rel="noopener noreferrer" className="btn mt-4 w-full bg-[#1f7a4d] text-white hover:bg-[#186640]">
            <WhatsAppIcon className="size-5" />{t.whatsapp}
          </a>
        </div>
      </div>
    </section>
  );
}
