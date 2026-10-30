"use client";
import { AnimatePresence, m } from "framer-motion";
import { Phone } from "lucide-react";
import { useEffect, useState } from "react";
import type { Dict } from "@/i18n";
import { telHref, whatsappHref } from "@/lib/links";
import { WhatsAppIcon } from "./SocialIcons";

/** Мобилна лента долу: появява се след hero и се скрива, когато формата за резервация е на екрана */
export function StickyBook({ t, waText }: { t: Dict["sticky"]; waText: string }) {
  const [pastHero, setPastHero] = useState(false);
  const [atForm, setAtForm] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const form = document.getElementById("book");
    const io = form ? new IntersectionObserver(([e]) => setAtForm(e.isIntersecting), { threshold: 0.25 }) : null;
    if (form && io) io.observe(form);
    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

  const visible = pastHero && !atForm;
  return (
    <AnimatePresence>
      {visible && (
        <m.aside
          aria-label={t.book}
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-cream/92 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
        >
          <div className="flex gap-2">
            <a href={telHref} aria-label={t.call} className="grid size-12 shrink-0 place-items-center rounded-full border border-ink/25 text-ink">
              <Phone className="size-5" aria-hidden="true" />
            </a>
            <a href={whatsappHref(waText)} target="_blank" rel="noopener noreferrer" aria-label={t.whatsapp} className="grid size-12 shrink-0 place-items-center rounded-full bg-[#1f7a4d] text-white">
              <WhatsAppIcon className="size-5" />
            </a>
            <a href="#book" className="btn-gold flex-1 text-lg">{t.book}</a>
          </div>
        </m.aside>
      )}
    </AnimatePresence>
  );
}
