import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { notFound } from "next/navigation";
import { hotel } from "@/config/hotel";
import { images } from "@/config/images";
import { getDict, isLocale, locales } from "@/i18n";
import { MotionProvider } from "@/components/MotionProvider";
import { RevealObserver } from "@/components/RevealObserver";
import "./globals.css";

// `subsets` определя кои файлове се предзареждат; останалите (латиница) се теглят при нужда.
// Предзареждаме само кирилицата на Playfair — тя е в hero заглавието (LCP елемента).
const inter = Inter({ subsets: ["cyrillic"], variable: "--font-inter", display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["cyrillic"], variable: "--font-playfair", display: "swap" });

export const generateStaticParams = () => locales.map((lang) => ({ lang }));
export const dynamicParams = false;

export const viewport: Viewport = { themeColor: "#f1eee8", width: "device-width", initialScale: 1 };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return {
    metadataBase: new URL(hotel.siteUrl),
    title: { default: t.meta.title, template: `%s · ${lang === "en" ? hotel.nameEn : hotel.name}` },
    description: t.meta.description,
    alternates: { canonical: `/${lang}`, languages: { bg: "/bg", en: "/en", "x-default": "/bg" } },
    openGraph: {
      type: "website",
      locale: t.locale,
      alternateLocale: lang === "bg" ? "en_US" : "bg_BG",
      url: `/${lang}`,
      siteName: lang === "en" ? hotel.nameEn : hotel.name,
      title: t.meta.title,
      description: t.meta.description,
      images: [{ url: images.og, width: 1200, height: 630, alt: t.meta.title }],
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description, images: [images.og] },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang} className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* reveal анимациите се активират само ако има JS */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
        <RevealObserver />
      </body>
    </html>
  );
}
