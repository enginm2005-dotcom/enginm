"use client";
import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDict, type Locale } from "@/i18n";

const KEY = "cookie-consent"; // "all" | "necessary"
export const OPEN_COOKIE_SETTINGS = "open-cookie-settings";

export function CookieBanner({ lang }: { lang: Locale }) {
  const t = getDict(lang).cookies;
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      setShow(true);
    }
    const open = () => setShow(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS, open);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS, open);
  }, []);

  const save = (v: "all" | "necessary") => {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    // Тук зареди аналитиката (GA4 / Plausible) само ако v === "all"
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: v }));
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <m.div
          role="region"
          aria-label="Cookies"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-2xl bg-navy-950/95 p-4 text-xs text-white/85 shadow-lift backdrop-blur sm:inset-x-6 sm:bottom-6 sm:p-5 sm:text-sm"
        >
          <p>
            {t.text}{" "}
            <Link href={`/${lang}/privacy`} className="font-semibold text-gold-300 underline underline-offset-2">{t.policy}</Link>.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <button type="button" onClick={() => save("necessary")} className="btn min-h-11 border border-white/30 px-3 text-sm text-white hover:bg-white/10">{t.necessary}</button>
            <button type="button" onClick={() => save("all")} className="btn-gold min-h-11 px-3 text-sm">{t.accept}</button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS))} className="text-left hover:text-gold-300">
      {label}
    </button>
  );
}
