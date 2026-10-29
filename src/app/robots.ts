import type { MetadataRoute } from "next";
import { hotel } from "@/config/hotel";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${hotel.siteUrl}/sitemap.xml` };
}
