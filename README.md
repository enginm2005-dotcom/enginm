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
| Фонова анимация | `public/scene/`, `ANCHORS` в `ScrollScene.tsx` |
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

## Фон, който се върти със скрола

`src/components/ScrollScene.tsx` — фиксиран фон от кадри на видео (`public/scene/{d,m}/`), рисуван на canvas според скрола.
- Кои секции към кой момент от видеото са вързани: масивът `ANCHORS` в началото на файла (id на секция → 0..1).
- Телефон: кадърът запълва екрана. Широк екран: рязка колона по средата + размазан фон отстрани (видеото е вертикално).
- Затъмняването за четимост е последният `div` в компонента. Картите са „стъкло“ (`.card` / `.glass` в `globals.css`).
- `prefers-reduced-motion` → показва се само първият кадър. `saveData` → зареждат се по-малко кадри.
- Ново видео: `scripts/make-frames.sh видео.mp4`, после обнови `count` в `SETS`.

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
| `navy-950` | `#0A1B2C` | основен фон, затъмняване |
| `navy-900` | `#0F2A44` | тъмни повърхности |
| `sand-50` | `#FBF8F3` | светъл панел на формата |
| `gold-500` | `#C9A15A` | бутони, акценти |
| `gold-300` | `#E6CF9C` | златен текст върху тъмния фон |
| `muted` | `#56616D` | второстепенен текст |

Шрифтове: Playfair Display (заглавия) + Inter (текст), с кирилица.
