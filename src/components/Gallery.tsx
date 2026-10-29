"use client";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { images } from "@/config/images";
import { getDict, type Locale } from "@/i18n";

export function Gallery({ lang }: { lang: Locale }) {
  const t = getDict(lang).proof;
  const list = images.gallery;
  const [open, setOpen] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + list.length) % list.length)), [list.length]);
  const close = useCallback(() => {
    setOpen(null);
    lastTrigger.current?.focus();
  }, []);

  useEffect(() => {
    if (open === null) return;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "Tab") {
        // фокусът циклира само между бутоните на lightbox-а
        const btns = Array.from(dialogRef.current?.querySelectorAll("button") ?? []);
        const idx = btns.indexOf(document.activeElement as HTMLButtonElement);
        e.preventDefault();
        btns[(idx + (e.shiftKey ? -1 : 1) + btns.length) % btns.length]?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  return (
    <>
      <ul className="mt-8 columns-2 gap-3 sm:gap-5 lg:columns-3">
        {list.map((img, i) => (
          <li key={img.src} className="mb-3 break-inside-avoid sm:mb-5">
            <button
              type="button"
              onClick={(e) => { lastTrigger.current = e.currentTarget; setOpen(i); }}
              aria-label={`${t.openPhoto}: ${t.galleryAlts[i] ?? ""}`}
              className="group relative block w-full overflow-hidden rounded-2xl"
            >
              <Image
                src={img.src}
                alt={t.galleryAlts[i] ?? ""}
                width={img.w}
                height={img.h}
                sizes="(min-width:1024px) 33vw, 50vw"
                className="h-auto w-full transition duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-navy-950/0 transition group-hover:bg-navy-950/20" />
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {open !== null && (
          <m.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.galleryAlts[open]}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-950/95 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <m.div key={open} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <Image src={list[open].src} alt={t.galleryAlts[open] ?? ""} fill sizes="100vw" className="object-contain" />
            </m.div>
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/80">{t.galleryAlts[open]} · {open + 1}/{list.length}</p>
            <button ref={closeRef} type="button" onClick={close} aria-label={t.closePhoto} className="absolute top-4 right-4 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <X className="size-6" aria-hidden="true" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label={t.prevPhoto} className="absolute left-3 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <ChevronLeft className="size-6" aria-hidden="true" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label={t.nextPhoto} className="absolute right-3 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <ChevronRight className="size-6" aria-hidden="true" />
            </button>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
