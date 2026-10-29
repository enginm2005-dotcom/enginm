import { hotel } from "@/config/hotel";
import { images } from "@/config/images";
import { getDict, type Locale } from "@/i18n";

/** schema.org Hotel — оценките се добавят само когато са попълнени (без фалшиви данни) */
export function JsonLd({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const a = hotel.address;
  const b = hotel.ratings.booking;
  const data = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: lang === "en" ? hotel.nameEn : hotel.name,
    description: t.meta.description,
    url: `${hotel.siteUrl}/${lang}`,
    image: [images.hero.src, ...images.gallery.slice(0, 3).map((g) => g.src)],
    telephone: hotel.contact.phone,
    email: hotel.contact.email,
    address: { "@type": "PostalAddress", streetAddress: a.street, addressLocality: a.city, addressRegion: a.region, postalCode: a.postalCode, addressCountry: a.country },
    ...(a.lat !== null && a.lng !== null && { geo: { "@type": "GeoCoordinates", latitude: a.lat, longitude: a.lng } }),
    ...(hotel.stars && { starRating: { "@type": "Rating", ratingValue: hotel.stars } }),
    ...(hotel.rooms && { numberOfRooms: hotel.rooms }),
    checkinTime: hotel.checkIn,
    checkoutTime: hotel.checkOut,
    priceRange: hotel.prices.standard ? `${hotel.prices.standard}+ EUR` : undefined,
    currenciesAccepted: "EUR",
    amenityFeature: t.amenities.items.map((i) => ({ "@type": "LocationFeatureSpecification", name: i.name, value: true })),
    sameAs: Object.values(hotel.social).filter(Boolean),
    ...(b.score !== null && b.count !== null && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: b.score, bestRating: b.max, reviewCount: b.count },
    }),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
