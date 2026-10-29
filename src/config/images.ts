/**
 * Всички снимки на сайта. Сега са placeholder-и от Unsplash.
 * За да сложиш истинските: копирай ги в /public/images/ и смени src, напр. "/images/hero.webp".
 */
const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export type Img = { src: string; w: number; h: number };

export const images = {
  hero: { src: u("photo-1566073771259-6a8506099945", 2000), w: 2000, h: 1333 },
  ctaSunset: { src: u("photo-1507525428034-b723cf961d3e", 2000), w: 2000, h: 1333 },
  floorView: { src: u("photo-1505228395891-9a51e7e86bf6", 1600), w: 1600, h: 2000 },

  rooms: {
    standard: { src: u("photo-1611892440504-42a792e24d32", 900), w: 900, h: 640 },
    deluxe: { src: u("photo-1590490360182-c33d57733427", 900), w: 900, h: 640 },
    suite: { src: u("photo-1578683010236-d716f9a3f461", 900), w: 900, h: 640 },
    penthouse: { src: u("photo-1582719478250-c89cae4dc85b", 900), w: 900, h: 640 },
  },

  day: {
    breakfast: { src: u("photo-1525351484163-7529414344d8", 700), w: 700, h: 500 },
    pool: { src: u("photo-1571896349842-33c89424de2d", 700), w: 700, h: 500 },
    dinner: { src: u("photo-1414235077428-338989a2e8c0", 700), w: 700, h: 500 },
    sunset: { src: u("photo-1514933651103-005eec06c04b", 700), w: 700, h: 500 },
  },

  gallery: [
    { src: u("photo-1542314831-068cd1dbfeeb", 900), w: 900, h: 1200 },
    { src: u("photo-1520250497591-112f2f40a3f4", 900), w: 900, h: 600 },
    { src: u("photo-1544161515-4ab6ce6db874", 900), w: 900, h: 1100 },
    { src: u("photo-1631049307264-da0ec9d70304", 900), w: 900, h: 600 },
    { src: u("photo-1540541338287-41700207dee6", 900), w: 900, h: 600 },
    { src: u("photo-1551882547-ff40c63fe5fa", 900), w: 900, h: 1200 },
    { src: u("photo-1519046904884-53103b34b206", 900), w: 900, h: 600 },
    { src: u("photo-1414235077428-338989a2e8c0", 900), w: 900, h: 700 },
  ] satisfies Img[],

  og: u("photo-1566073771259-6a8506099945", 1200),
};
