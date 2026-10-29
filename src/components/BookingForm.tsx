"use client";
import { CalendarDays, Search, Users } from "lucide-react";
import { useState } from "react";
import { hotel } from "@/config/hotel";
import { getDict, type Locale } from "@/i18n";
import { mailHref } from "@/lib/links";

const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const addDays = (s: string, n: number) => {
  const d = new Date(`${s}T12:00:00`);
  d.setDate(d.getDate() + n);
  return iso(d);
};

export function BookingForm({ lang }: { lang: Locale }) {
  const t = getDict(lang).cta;
  const today = iso(new Date());
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkin || !checkout) return setError(t.errMissing);
    if (checkout <= checkin) return setError(t.errDates);
    setError("");
    if (hotel.bookingEngineUrl) {
      const url = hotel.bookingEngineUrl
        .replace("{checkin}", checkin)
        .replace("{checkout}", checkout)
        .replace("{guests}", String(guests))
        .replace("{lang}", lang);
      window.open(url, "_blank", "noopener");
    } else {
      // Няма booking engine → отваря имейл с попълнено запитване
      window.location.href = mailHref(t.mailSubject, t.mailBody(checkin, checkout, guests));
    }
  };

  const field = "mt-1.5 block h-12 w-full rounded-xl border border-navy-900/15 bg-white px-4 text-base text-navy-900 transition focus:border-gold-500 focus:ring-4 focus:ring-gold-500/25 focus:outline-none";
  const label = "flex items-center gap-1.5 text-sm font-medium text-navy-800";

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 rounded-3xl bg-sand-50/95 p-5 shadow-lift backdrop-blur sm:grid-cols-2 sm:p-6 lg:grid-cols-[1fr_1fr_0.8fr_auto] lg:items-end">
      <div>
        <label htmlFor="checkin" className={label}><CalendarDays className="size-4 text-gold-700" aria-hidden="true" />{t.checkin}</label>
        <input
          id="checkin"
          type="date"
          required
          min={today}
          value={checkin}
          onChange={(e) => {
            setCheckin(e.target.value);
            if (e.target.value && (!checkout || checkout <= e.target.value)) setCheckout(addDays(e.target.value, 1));
          }}
          className={field}
          aria-describedby={error ? "booking-error" : undefined}
        />
      </div>
      <div>
        <label htmlFor="checkout" className={label}><CalendarDays className="size-4 text-gold-700" aria-hidden="true" />{t.checkout}</label>
        <input
          id="checkout"
          type="date"
          required
          min={checkin ? addDays(checkin, 1) : today}
          value={checkout}
          onChange={(e) => setCheckout(e.target.value)}
          className={field}
          aria-describedby={error ? "booking-error" : undefined}
        />
      </div>
      <div>
        <label htmlFor="guests" className={label}><Users className="size-4 text-gold-700" aria-hidden="true" />{t.guests}</label>
        <select id="guests" value={guests} onChange={(e) => setGuests(Number(e.target.value))} className={field}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{t.guestUnit(n)}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-gold h-12 min-h-12 sm:col-span-2 lg:col-span-1">
        <Search className="size-5" aria-hidden="true" />{t.submit}
      </button>
      <p id="booking-error" role="alert" className="text-sm font-medium text-red-700 empty:hidden sm:col-span-2 lg:col-span-4">{error}</p>
    </form>
  );
}
