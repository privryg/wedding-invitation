# The Wedding of Ryan & Eci — React (DDD)

React + Vite migration of the original single-file HTML invitation
(`undangan-ryan-eci (33).html`), restructured with **Domain-Driven Design**.

## Run locally

```bash
npm install
npm run dev      # http://localhost:6969
```

Other scripts: `npm run build` (production bundle → `dist/`), `npm run preview`
(serve the build on port 6969).

> Guest personalization works via the `?to=` query param, e.g.
> `http://localhost:6969/?to=Keluarga%20Budi`.

## Architecture

The code is organized by **bounded context** (business domain) rather than by
technical file type. Each domain owns its UI, styles, and — where there is real
logic — a `domain` (pure rules), an `application` use case, and talks to shared
`infrastructure` adapters.

```
src/
├── config/
│   └── invitation.config.js     Single source of truth for all content
│                                (couple, event, story, gifts, families…)
├── domains/                     Bounded contexts
│   ├── envelope/                Page 1: the sealed envelope + open animation
│   ├── cover/                   Full-screen cover (photo, names, guest)
│   ├── guest/                   Resolves the invited guest from ?to=
│   ├── greeting/                Salam + Ar-Rum:21 verse
│   ├── couple/                  Mempelai (the two families)
│   ├── story/                   "Perjalanan Kami" love-story timeline
│   ├── countdown/               Live countdown  (countdown.js = pure domain,
│   │                            useCountdown.js = hook, CountdownSection.jsx)
│   ├── gallery/                 Photo slider
│   ├── event/                   Save-the-date card + calendar/maps (calendar.js)
│   ├── gift/                    Amplop digital (bank / e-wallet)
│   ├── families/                Turut mengundang
│   ├── rsvp/                    RSVP:   rsvp.js (domain) → submitRsvp.js (use
│   │                            case) → Telegram infrastructure
│   ├── guestbook/               Ucapan & doa: wish.js (domain) → useGuestbook.js
│   │                            (use case) → localStorage + Telegram
│   └── closing/                 Closing blessing + footer
├── infrastructure/              Adapters to the outside world
│   ├── telegram/telegramNotifier.js   Bot API delivery (obfuscated token)
│   └── storage/localWishRepository.js localStorage persistence for wishes
├── shared/                      Cross-cutting UI, hooks, utils, global styles
│   ├── components/              Reveal, OrnDivider, CopyButton, BackToTop,
│   │                            CosmicBackground, ShootingStars
│   ├── hooks/useBacksound.js
│   ├── utils/                   fields.js (star generators), clipboard.js
│   └── styles/                  base.css, background.css (global)
├── App.jsx                      Composition root (envelope → cover → content)
└── main.jsx                     Entry point
```

### Layering (for domains with logic)

- **domain** — pure business rules, no framework (`rsvp.js`, `wish.js`,
  `countdown.js`). Validation and message formatting live here.
- **application** — use cases that orchestrate domain + infrastructure
  (`submitRsvp.js`, `useGuestbook.js`).
- **infrastructure** — replaceable adapters (Telegram, localStorage).
- **presentation** — React components (`*Section.jsx`).

Swapping the couple's details is a single-file edit: `config/invitation.config.js`.

## Assets

The original inlined everything as base64. Those were extracted to real files
under `public/assets/` (`song.mp3`, `cover.jpg`, `gallery-1..3.jpg`); the
envelope's decorative SVG lives at `src/domains/envelope/envDeco.svg`.
