import type { MetadataRoute } from "next";
import { hotel } from "@/config/hotel";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string) => `${hotel.siteUrl}${p}`;
  return [
    { url: u("/bg"), changeFrequency: "monthly", priority: 1, alternates: { languages: { bg: u("/bg"), en: u("/en") } } },
    { url: u("/en"), changeFrequency: "monthly", priority: 0.9, alternates: { languages: { bg: u("/bg"), en: u("/en") } } },
  ];
}
