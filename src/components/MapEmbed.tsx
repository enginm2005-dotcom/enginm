"use client";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { hotel } from "@/config/hotel";

/** Google картата се зарежда чак след клик: по-бързо зареждане и без бисквитки на Google преди съгласие */
export function MapEmbed({ label, note, title }: { label: string; note: string; title: string }) {
  const [show, setShow] = useState(false);
  const a = hotel.address;
  const q = a.lat !== null && a.lng !== null ? `${a.lat},${a.lng}` : `${hotel.name}, ${a.street}, ${a.city}`;
  if (show)
    return (
      <iframe
        title={title}
        src={`https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`}
        className="h-56 w-full rounded-2xl border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    );
  return (
    <button
      type="button"
      onClick={() => setShow(true)}
      className="group relative flex h-56 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-cream/10 bg-[radial-gradient(circle_at_30%_40%,rgb(141_112_91/0.45),transparent_60%),linear-gradient(135deg,#4a3a2f,#2e241e)] text-cream transition hover:border-beige"
    >
      <span className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgb(255_255_255/0.15)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.15)_1px,transparent_1px)] [background-size:28px_28px]" aria-hidden="true" />
      <MapPin className="relative size-8 text-beige transition group-hover:-translate-y-1" aria-hidden="true" />
      <span className="relative font-semibold">{label}</span>
      <span className="relative text-xs text-cream/70">{note}</span>
    </button>
  );
}
