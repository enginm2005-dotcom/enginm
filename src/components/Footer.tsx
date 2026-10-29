import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { hotel } from "@/config/hotel";
import type { Dict, Locale } from "@/i18n";
import { mailHref, telHref } from "@/lib/links";
import { Logo } from "./Header";
import { MapEmbed } from "./MapEmbed";
import { CookieSettingsButton } from "./CookieBanner";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "./SocialIcons";

export function Footer({ t, lang }: { t: Dict["footer"]; lang: Locale }) {
  const a = hotel.address;
  const social = [
    { href: hotel.social.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: hotel.social.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: hotel.social.tiktok, label: "TikTok", Icon: TikTokIcon },
  ].filter((s) => s.href);
  const h4 = "font-sans text-xs font-semibold tracking-[0.2em] text-gold-300 uppercase";

  return (
    <footer id="contact" className="bg-navy-950 pt-20 pb-28 text-white/75 lg:pb-10">
      <div className="container-x grid gap-12 md:grid-cols-2 lg:grid-cols-[1.2fr_1.4fr_1fr]">
        <div>
          <Logo light lang={lang} />
          <p className="mt-4 max-w-xs">{t.tagline}</p>
          <h2 className={`${h4} mt-8`}>{t.follow}</h2>
          <ul className="mt-4 flex gap-3">
            {social.map(({ href, label, Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-11 place-items-center rounded-full border border-white/15 text-white transition hover:border-gold-400 hover:bg-gold-500 hover:text-navy-950">
                  <Icon className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={h4}>{t.address}</h2>
          <address className="mt-4 flex gap-3 not-italic">
            <MapPin className="mt-0.5 size-5 shrink-0 text-gold-400" aria-hidden="true" />
            <span>{a.street}, {a.postalCode} {a.city}, {a.region}</span>
          </address>
          <div className="mt-5">
            <MapEmbed label={t.showMap} note={t.mapNote} title={t.mapTitle} />
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className={h4}>{t.contact}</h2>
            <ul className="mt-4 space-y-3">
              <li><a href={telHref} className="flex items-center gap-3 hover:text-gold-300"><Phone className="size-5 text-gold-400" aria-hidden="true" />{hotel.contact.phoneDisplay}</a></li>
              <li><a href={mailHref()} className="flex items-center gap-3 break-all hover:text-gold-300"><Mail className="size-5 shrink-0 text-gold-400" aria-hidden="true" />{hotel.contact.email}</a></li>
            </ul>
          </div>
          <div>
            <h2 className={h4}>{t.reception}</h2>
            <p className="mt-4 flex items-center gap-3"><Clock className="size-5 text-gold-400" aria-hidden="true" />{t.receptionHours}</p>
          </div>
        </div>
      </div>

      <div className="container-x mt-16 flex flex-col gap-6 border-t border-white/10 pt-8 text-sm lg:flex-row lg:items-center lg:justify-between">
        <ul className="flex flex-wrap gap-x-6 gap-y-3">
          <li><Link href={`/${lang}/cancellation`} className="hover:text-gold-300">{t.links.cancellation}</Link></li>
          <li><Link href={`/${lang}/terms`} className="hover:text-gold-300">{t.links.terms}</Link></li>
          <li><Link href={`/${lang}/privacy`} className="hover:text-gold-300">{t.links.privacy}</Link></li>
          <li><CookieSettingsButton label={t.links.cookies} /></li>
        </ul>
        <p>© {new Date().getFullYear()} {lang === "en" ? hotel.nameEn : hotel.name}. {t.rights}</p>
      </div>
    </footer>
  );
}
