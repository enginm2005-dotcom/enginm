/**
 * ЕДИНСТВЕНОТО МЯСТО С ФАКТИ ЗА ХОТЕЛА.
 * Всичко в [КВАДРАТНИ СКОБИ] или със стойност `null` е placeholder — попълни го.
 * `null` числа се показват на сайта като "[X]", за да не се публикуват измислени данни.
 */

export const hotel = {
  name: "[ИМЕ НА ХОТЕЛА]",
  nameEn: "[HOTEL NAME]",
  siteUrl: "https://www.example.com", // [ДОМЕЙН] — без наклонена черта накрая
  floors: 5, // етажи над партера (рецепцията); 3D моделът е по референтната снимка
  stars: null as number | null, // [X] звезди — за schema.org
  rooms: null as number | null, // [X] стаи
  happyGuests: null as number | null, // [X]+ доволни гости
  yearsOpen: null as number | null, // [X] години опит
  guestsPerYear: null as number | null, // [X] гости годишно
  returningPercent: null as number | null, // [X]% връщащи се гости
  elevators: null as number | null, // [X] бързи асансьора
  freeCancellationDays: null as number | null, // безплатна отмяна до [X] дни
  preArrivalInfoDays: null as number | null, // [X] дни преди пристигане пращаме инфо
  linenChangeDays: null as number | null, // смяна на бельо на всеки [X] дни
  photosYear: "[ГОДИНА]",
  checkIn: "14:00", // [ПРОВЕРИ]
  checkOut: "12:00", // [ПРОВЕРИ]
  currency: "€", // от 01.01.2026 г. България е в еврозоната
  peakSeason: { bg: "[МЕСЕЦИ]", en: "[MONTHS]" }, // покажи само ако е вярно; null скрива реда
  showPeakSeason: true,

  address: {
    street: "[УЛИЦА И НОМЕР]",
    city: "[ГРАД]",
    region: "[ОБЛАСТ]",
    postalCode: "[ПК]",
    country: "BG",
    // за schema.org и картата
    lat: null as number | null,
    lng: null as number | null,
  },
  beachDistance: { bg: "[X] м", en: "[X] m" }, // разстояние до плажа/центъра
  areaLabel: { bg: "[ГРАД / РАЙОН]", en: "[CITY / AREA]" },

  contact: {
    phone: "+359000000000", // [ТЕЛЕФОН] в международен формат
    phoneDisplay: "+359 [XX XXX XXXX]",
    whatsapp: "359000000000", // [WHATSAPP] само цифри
    email: "reservations@example.com", // [ИМЕЙЛ]
  },
  social: {
    instagram: "https://instagram.com/[ПРОФИЛ]",
    facebook: "https://facebook.com/[СТРАНИЦА]",
    tiktok: "", // празно = скрито
  },

  /** Booking engine. Ако е празно, формата отваря имейл с попълнени дати.
   *  Плейсхолдъри в URL-а: {checkin} {checkout} {guests} {lang} */
  bookingEngineUrl: "",

  ratings: {
    booking: { score: null as number | null, max: 10, count: null as number | null, url: "#" },
    google: { score: null as number | null, max: 5, count: null as number | null, url: "#" },
    tripadvisor: { score: null as number | null, max: 5, count: null as number | null, url: "#" },
  },

  /** Цени „от“ за нощ. null → "[X]" */
  prices: {
    standard: null as number | null,
    deluxe: null as number | null,
    suite: null as number | null,
    penthouse: null as number | null,
  },

  has360Tour: false,
  tour360Url: "",
};

export type Hotel = typeof hotel;

/** Показва число или "[X]" ако липсва */
export const orX = (v: number | null | undefined, suffix = "") =>
  v === null || v === undefined ? `[X]${suffix}` : `${v}${suffix}`;
