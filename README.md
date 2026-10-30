# Сайт на хотел [ИМЕ НА ХОТЕЛА]

Next.js 15 · React 19 · Tailwind CSS 4 · Framer Motion 12 · BG/EN

## Стартиране

```bash
npm install
npm run dev        # http://localhost:3000 → пренасочва към /bg или /en
npm run build && npm start   # production
```

Деплой: най-лесно е във Vercel (import на репото → Deploy). `/` пренасочва по езика на браузъра.

## Къде да попълниш информацията

| Какво | Файл |
|---|---|
| Име, адрес, телефон, WhatsApp, имейл, цени, оценки, броячи, часове, booking engine | `src/config/hotel.ts` |
| Снимки | `src/config/images.ts` |
| Всички текстове (BG / EN) | `src/i18n/bg.ts`, `src/i18n/en.ts` |
| Политика за отмяна, Общи условия, GDPR | `legal.pages` в двата речника |
| 3D анимация | `src/components/scene/hotelScene.ts`, `ANCHORS` в `ScrollScene.tsx`, етикети `scene` в речниците |
| Лого | `Logo` в `src/components/Header.tsx` + `src/app/[lang]/icon.svg` + `public/favicon.ico` |

**Правило:** числата в `hotel.ts`, които са `null`, се показват на сайта като `[X]` и **не** влизат в schema.org разметката.
Така нищо измислено не излиза публично. Броячите се анимират, когато сложиш истинско число.

### Чеклист преди пускане
- [ ] `hotel.ts`: име, `siteUrl`, адрес + `lat/lng`, телефон, WhatsApp, имейл, социални мрежи
- [ ] Цени „от“ (в €; от 01.01.2026 г. България е в еврозоната)
- [ ] Оценки от Booking / Google / TripAdvisor + брой отзиви + линкове
- [ ] Броячи: стаи, доволни гости, години, гости годишно, % връщащи се
- [ ] Безплатна отмяна (дни), асансьори, смяна на бельо, инфо преди пристигане
- [ ] `peakSeason` — само ако е вярно; иначе `showPeakSeason: false`
- [ ] Всички `[...]` в `bg.ts` / `en.ts` (търси `[`)
- [ ] **Отзиви:** замени 5-те placeholder-а в `proof.reviews` с истински (дословно, с разрешение)
- [ ] Награди/сертификати — или изтрий блока в `Proof.tsx`
- [ ] Снимки: копирай в `public/images/` и смени пътищата в `images.ts`; после махни `remotePatterns` от `next.config.ts`
- [ ] Лога на платформите: в момента са текстови знаци — смени ги с официалните баджове
- [ ] Правните текстове (отмяна, условия, GDPR)

## 3D фон, управляван от скрола

`src/components/scene/hotelScene.ts` — процедурна 3D сцена (Three.js): модерна светла сграда, рецепция, 10 етажа с различно помещение, покрив с басейн и бар.
`src/components/ScrollScene.tsx` — фиксиран canvas на целия екран; скролът движи камерата.

- **Път на камерата:** масивът `KEYS` в `hotelScene.ts` (позиция, точка, към която гледа, тежест/продължителност, етикет).
- **Връзка със секциите:** `ANCHORS` в `ScrollScene.tsx` (id на секция → ключов кадър).
- **Какво има на всеки етаж:** функцията `buildFloor()` в `hotelScene.ts`.
- **Етикетите** („Етаж 5 · Стандартни стаи“) са в `scene` в `bg.ts` / `en.ts`. Сега са примерни, смени ги според реалния хотел.
- **Постерът** (`public/scene/poster-{d,m}.webp`) е първият кадър. Вижда се веднага, а 3D сцената се строи при първото действие на госта (или след 6 s).
- **Производителност:** рисува се само когато камерата мръдне. Статичните обекти са слети по материал (~70 draw calls), пикселите са с таван ~2.4 MP, и над canvas-а няма `backdrop-blur`.
- `prefers-reduced-motion` → сцената остава на първия кадър. Без WebGL остава постерът.

## Формата за резервация

`bookingEngineUrl` в `hotel.ts`:
- **празно** → формата отваря имейл до рецепцията с попълнени дати и брой гости;
- **попълнено** → отваря booking engine-а в нов таб. Плейсхолдъри: `{checkin} {checkout} {guests} {lang}`, напр.
  `https://booking.example.com/?arrival={checkin}&departure={checkout}&adults={guests}&lang={lang}`

## Бисквитки и аналитика

Банерът пази избора в `localStorage` (`cookie-consent` = `all` | `necessary`) и пуска събитие `cookie-consent`.
Аналитиката (GA4 / Plausible) я зареждай само при `all` (виж коментара в `CookieBanner.tsx`).
Google картата във футъра се зарежда чак след клик — по-бързо е и не слага бисквитки на Google без действие от госта.

## Структура

```
src/
├─ app/[lang]/        layout (SEO, шрифтове), page, [legal] страници, icon
├─ app/robots.ts, sitemap.ts
├─ middleware.ts      / → /bg или /en
├─ config/            hotel.ts, images.ts
├─ i18n/              bg.ts, en.ts
├─ lib/links.ts       tel:, mailto:, wa.me
└─ components/        Header, Hero, Stats, Rooms, FloorView, Amenities, DayTimeline,
                      Worries + Accordion, Proof + ReviewsCarousel + Gallery,
                      AfterBooking, FinalCta + BookingForm, Footer + MapEmbed,
                      StickyBook, CookieBanner, JsonLd, Reveal/RevealObserver, Counter
```

## Палитра

| Токен | Цвят | Употреба |
|---|---|---|
| `cream` | `#F1EEE8` | меко бяло — основен фон, карти, меню |
| `beige` | `#D6C3AD` | топъл бежов — рамки, повърхности, акценти във футъра |
| `bronze` | `#8D705B` | бронзово кафяво — бутони (с бял текст) |
| `bronze-dark` | `#6E5544` | бронз за текст и икони (AA контраст) |
| `sage` | `#8A9A7E` | приглушено зелено — **[ПРОВЕРИ кода]** |
| `sage-dark` | `#5F6E55` | зелено за малките надписи над заглавията |
| `ink` | `#3A2E26` | основен текст |
| `muted` | `#6B5D52` | второстепенен текст |
| `espresso` | `#2E241E` | футър, cookie банер, lightbox |

Цветовете се сменят на едно място: `@theme` в `src/app/[lang]/globals.css`. Материалите в 3D сцената са в `M` в `hotelScene.ts`.

Шрифтове: Playfair Display (заглавия) + Inter (текст), с кирилица.
