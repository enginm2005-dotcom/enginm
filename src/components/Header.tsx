"use client";
import { AnimatePresence, m } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { hotel } from "@/config/hotel";
import type { Dict, Locale } from "@/i18n";

export function Logo({ light, lang }: { light?: boolean; lang: Locale }) {
  return (
    <span className="flex items-center gap-2.5">
      {/* Знак: сградата (партер + етажи) — замени с истинското лого (/public/logo.svg) */}
      <svg viewBox="0 0 28 32" className="h-8 w-7 shrink-0" aria-hidden="true">
        <rect x="4" y="1" width="20" height="30" rx="2" className={light ? "fill-cream/15" : "fill-ink/10"} />
        {Array.from({ length: hotel.floors + 1 }, (_, i) => (
          <rect key={i} x="8" y={4 + i * (26 / (hotel.floors + 1))} width="12" height={13 / (hotel.floors + 1)} rx=".6" className={i === 0 ? "fill-bronze" : light ? "fill-cream" : "fill-ink"} />
        ))}
      </svg>
      <span className={clsx("font-serif text-lg leading-none font-semibold sm:text-xl", light ? "text-cream" : "text-ink")}>
        {lang === "en" ? hotel.nameEn : hotel.name}
      </span>
    </span>
  );
}

export function Header({ lang, nav }: { lang: Locale; nav: Dict["nav"] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    ["#rooms", nav.rooms],
    ["#amenities", nav.amenities],
    ["#reviews", nav.reviews],
    ["#how", nav.how],
    ["#contact", nav.contact],
  ] as const;
  const other: Locale = lang === "bg" ? "en" : "bg";
  const light = false; // светла тема: тъмен текст

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "border-b border-beige/70 bg-cream/92 shadow-[0_4px_30px_-14px_rgb(58_46_38/0.35)]" : "bg-transparent",
      )}
    >
      <nav aria-label="Main" className="container-x flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link href={`/${lang}`} className="relative z-10" aria-label={lang === "en" ? hotel.nameEn : hotel.name}>
          <Logo light={light} lang={lang} />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map(([href, label]) => (
            <li key={href}>
              <a
                href={href}
                className={clsx(
                  "rounded-full px-4 py-2 text-[15px] font-medium transition-colors",
                  light ? "text-white/90 hover:bg-white/10 hover:text-white" : "text-ink/80 hover:bg-ink/5 hover:text-ink",
                )}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="relative z-10 flex items-center gap-2 sm:gap-3">
          <Link
            href={`/${other}`}
            hrefLang={other}
            lang={other}
            className={clsx(
              "flex min-h-11 items-center rounded-full px-3 text-sm font-semibold tracking-wide transition-colors",
              light ? "text-white hover:bg-white/10" : "text-ink hover:bg-ink/5",
            )}
          >
            <span className={lang === "bg" ? "" : "opacity-75"}>BG</span>
            <span className="mx-1 opacity-60" aria-hidden="true">/</span>
            <span className={lang === "en" ? "" : "opacity-75"}>EN</span>
            <span className="sr-only">— {nav.switchTo}</span>
          </Link>
          <a href="#book" className="btn-gold hidden min-h-11 px-5 text-[15px] sm:inline-flex">
            {nav.book}
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? nav.close : nav.menu}
            className={clsx("grid size-11 place-items-center rounded-full lg:hidden", light ? "text-white hover:bg-white/10" : "text-ink hover:bg-ink/5")}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-16 bottom-0 overflow-y-auto bg-cream sm:top-20 lg:hidden"
          >
            <ul className="container-x flex flex-col py-6">
              {links.map(([href, label], i) => (
                <m.li key={href} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i }}>
                  <a href={href} onClick={() => setOpen(false)} className="block border-b border-beige py-4 font-serif text-2xl text-ink">
                    {label}
                  </a>
                </m.li>
              ))}
            </ul>
            <div className="container-x">
              <a href="#book" onClick={() => setOpen(false)} className="btn-gold w-full">
                {nav.book}
              </a>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
