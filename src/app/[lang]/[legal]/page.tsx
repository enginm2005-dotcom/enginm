import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getDict, isLocale, locales } from "@/i18n";

const pages = ["cancellation", "terms", "privacy"] as const;
type Page = (typeof pages)[number];
const isPage = (v: string): v is Page => (pages as readonly string[]).includes(v);

export const dynamicParams = false;
export const generateStaticParams = () => locales.flatMap((lang) => pages.map((legal) => ({ lang, legal })));

type Props = { params: Promise<{ lang: string; legal: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, legal } = await params;
  if (!isLocale(lang) || !isPage(legal)) return {};
  return { title: getDict(lang).legal.pages[legal].title, alternates: { canonical: `/${lang}/${legal}` } };
}

export default async function LegalPage({ params }: Props) {
  const { lang, legal } = await params;
  if (!isLocale(lang) || !isPage(legal)) notFound();
  const t = getDict(lang).legal;
  const p = t.pages[legal];
  return (
    <main className="container-x max-w-3xl py-20">
      <Link href={`/${lang}`} className="inline-flex items-center gap-2 text-sm font-semibold text-gold-300 hover:text-white">
        <ArrowLeft className="size-4" aria-hidden="true" />{t.back}
      </Link>
      <h1 className="mt-8 text-4xl sm:text-5xl">{p.title}</h1>
      <p className="mt-8 text-lg leading-relaxed text-muted">{p.body}</p>
    </main>
  );
}
