import { bg, type Dict } from "./bg";
import { en } from "./en";

export const locales = ["bg", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "bg";

export const isLocale = (v: string): v is Locale => (locales as readonly string[]).includes(v);

export const getDict = (lang: Locale): Dict => (lang === "en" ? en : bg);

export type { Dict };
