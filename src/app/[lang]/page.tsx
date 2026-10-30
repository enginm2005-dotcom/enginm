import { notFound } from "next/navigation";
import { getDict, isLocale } from "@/i18n";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Rooms } from "@/components/Rooms";
import { FloorView } from "@/components/FloorView";
import { Amenities } from "@/components/Amenities";
import { DayTimeline } from "@/components/DayTimeline";
import { Worries } from "@/components/Worries";
import { Proof } from "@/components/Proof";
import { AfterBooking } from "@/components/AfterBooking";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";
import { StickyBook } from "@/components/StickyBook";
import { CookieBanner } from "@/components/CookieBanner";
import { JsonLd } from "@/components/JsonLd";
import { ScrollScene } from "@/components/ScrollScene";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  return (
    <>
      <a href="#main" className="sr-only z-[100] rounded-full bg-bronze px-5 py-3 font-semibold text-cream focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        {t.skip}
      </a>
      <ScrollScene labels={t.scene} />
      <JsonLd lang={lang} />
      <Header lang={lang} nav={t.nav} />
      <main id="main">
        <Hero t={t.hero} />
        <div id="stats" className="glass border-x-0 py-12 sm:py-16">
          <div className="container-x"><Stats items={t.stats} lang={lang} dark /></div>
        </div>
        {/* 1 — Какво получават гостите */}
        <Rooms t={t.rooms} />
        <FloorView t={t.floors} />
        <Amenities t={t.amenities} />
        <DayTimeline t={t.day} />
        {/* 2 — Без притеснения */}
        <Worries t={t.worries} />
        {/* 3 — Доказателство */}
        <Proof t={t.proof} lang={lang} />
        {/* 4 — Какво следва след резервацията */}
        <AfterBooking t={t.after} />
        {/* 5 — Призив за действие */}
        <FinalCta t={t.cta} lang={lang} waText={t.after.whatsappText} />
      </main>
      <Footer t={t.footer} lang={lang} />
      <StickyBook t={t.sticky} waText={t.after.whatsappText} />
      <CookieBanner lang={lang} />
    </>
  );
}
