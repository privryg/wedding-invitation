# Supabase-backed guestbook

Date: 2026-07-10
Status: Approved, not yet implemented

## Problem

The wedding invitation has two data paths, and both are broken in ways that only show up in production.

The guestbook wall (`src/domains/guestbook/`) persists wishes to `localStorage`. Every visitor therefore sees only the wishes they wrote themselves, prepended to two hardcoded seed entries attributed to "Rina" and "Bagus." No guest has ever seen another guest's wish. The wall presents itself as shared and is not.

Separately, `src/infrastructure/telegram/telegramNotifier.js` embeds a Telegram bot token in the client bundle, XOR-obfuscated against a fixed key. Obfuscation is not encryption: the key sits in the same file, and anyone reading the shipped JavaScript can recover the token and use it to post to the couple's chat, read the bot's messages, or repoint the bot. Both the guestbook and the RSVP form call it from the browser.

## Goals

Make the wishes wall genuinely shared and durable, and remove the Telegram bot token from the browser bundle entirely.

## Non-goals

RSVPs are **not** stored in a database. `submitRsvp` keeps its current contract — deliver a message, return `{ ok }` — and only changes where it delivers to. There is no guest list table, no personalized-invite tracking, and no admin UI. Wish moderation is not built; wishes appear the moment they are submitted, and removal happens through the Supabase dashboard.

## Design

### Data model

A new Supabase project in region `ap-southeast-1`, holding one table.

```sql
create table public.wishes (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  message    text not null,
  created_at timestamptz not null default now()
);

alter table public.wishes enable row level security;

create policy "wishes are readable by everyone"
  on public.wishes for select
  to anon
  using (true);

create policy "anyone may post a wish"
  on public.wishes for insert
  to anon
  with check (
    char_length(trim(name))    between 1 and 80
    and char_length(trim(message)) between 1 and 500
  );

create index wishes_created_at_idx on public.wishes (created_at desc);
```

Length limits live in the insert policy rather than in column `check` constraints. An oversized write then fails as a policy violation, which surfaces to the client as a permission error, rather than as a raw Postgres constraint message.

There is deliberately no `update` and no `delete` policy. The publishable key ships in the bundle and is public by construction; without those policies it cannot be used to edit or erase anyone's wish. Deletion happens through the Supabase dashboard, whose service role bypasses RLS.

The wall is ordered `created_at desc`, newest wish first, matching the current prepend behavior.

### Notification

Two Edge Functions, each reading `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` from Edge Function secrets. Neither token nor chat id appears in any client-side file.

`notify-wish` is invoked by a Supabase **database webhook** on `insert` into `public.wishes`. The insert does not wait on it, so a Telegram outage cannot fail a guest's submission.

`notify-rsvp` is invoked directly by the browser from `submitRsvp`, replacing the current call to the Telegram API. It accepts the RSVP fields, formats the message using the same text produced today by `formatRsvpMessage`, and relays it. It returns `{ ok }`.

Both functions accept **structured fields and format the message themselves**, rather than accepting a pre-formatted string. This is what prevents either function from being used to relay arbitrary text to the couple's chat. Message formatting therefore moves out of the client and into the Edge Functions; the wording produced is byte-for-byte what `formatWishMessage` and `formatRsvpMessage` produce today. `notify-rsvp` also takes over `normalizeWhatsapp`, since the number it prints must be normalized and it cannot trust the client to have done so.

Both functions are callable by anyone holding the publishable key, which is public. An attacker can therefore still cause the bot to send messages to the couple's chat. What they can no longer do is possess the token: they cannot read the bot's chats, rename it, or point it at another chat. That is the security boundary this design buys, and it is stated here so nobody later mistakes it for a stronger one.

### Token rotation

The existing token has shipped inside `dist/`. It must be treated as compromised. **Rotate it with BotFather before storing it in Edge Function secrets.** Migrating a leaked token accomplishes nothing.

### Client

New:

- `src/infrastructure/supabase/client.js` — a single `createClient(...)` from `@supabase/supabase-js`, reading `import.meta.env`.
- `src/infrastructure/supabase/wishRepository.js` — `fetchWishes()` returning wishes newest-first, and `insertWish({ name, message })` returning the created wish. This is the port `localWishRepository.js` occupied, with the same responsibility: it is the only module that knows how wishes are stored or shaped.
- `src/infrastructure/supabase/rsvpNotifier.js` — `notifyRsvp(rsvp)`, invoking the `notify-rsvp` Edge Function. Returns `{ ok }`.

Deleted:

- `src/infrastructure/storage/localWishRepository.js`, including the Rina and Bagus seed wishes. The wall starts empty.
- `src/infrastructure/telegram/telegramNotifier.js`, and with it the obfuscated token and the `tgDecode` helper.

Changed:

- `src/domains/guestbook/useGuestbook.js` becomes asynchronous. It exposes `wishes`, a `status` of `loading | ready | error`, and an `addWish(name, message)` returning a promise. `addWish` prepends the wish optimistically, awaits the insert, and removes the wish from the wall again if the insert is rejected. It no longer calls Telegram; the database webhook does that.
- `src/domains/guestbook/WishesSection.jsx` renders the loading and error states, and disables the send button while a submit is in flight. On a failed submit it reports the failure rather than the current unconditional "Terima kasih."
- `src/domains/rsvp/submitRsvp.js` calls `notifyRsvp(rsvp)` instead of `sendTelegramMessage(formatRsvpMessage(rsvp))`. Its signature and return value are unchanged.
- `src/domains/guestbook/wish.js` loses `formatWishMessage`, which moves into `notify-wish`. `isValidWish` remains.
- `src/domains/rsvp/rsvp.js` loses `formatRsvpMessage` and `normalizeWhatsapp`, both of which move into `notify-rsvp`. `ATTENDANCE`, `isValidName`, `isValidWhatsapp`, and `isValidRsvp` remain — validation stays in the client, because it drives the form's error states.

The validation halves of both domain modules are untouched, and the fact that swapping the entire persistence and transport layer leaves them alone is the existing design working as intended. The formatting halves move only because message construction turned out to be a server-side concern once the transport stopped being trusted.

### Configuration

`.env`, git-ignored:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

A committed `.env.example` documents both keys with empty values. `.env` is added to `.gitignore`.

Both values are compiled into the production bundle. This is correct and expected. The publishable key is a public project identifier; row-level security, not key secrecy, is what protects the table. The Telegram token is categorically different, which is precisely why it lives in Edge Function secrets and never in `.env`.

### Testing

Vitest is added as a dev dependency; the project currently has no test framework.

Covered:

- `wishRepository` maps rows to the shape the guestbook expects, and orders newest-first, against a stubbed Supabase client.
- `useGuestbook` prepends optimistically on `addWish`, and — the case that regresses silently — **removes the optimistic wish when the insert rejects**, restoring the prior wall.
- `useGuestbook` surfaces `status: 'error'` when the initial fetch fails.

Not covered: the Edge Functions and the database webhook. They are verified once, by hand, by submitting a wish and confirming the Telegram message arrives.

### Version control

`/Users/ryan/personal/wedding` is not currently a git repository. It is initialized as one as part of this work, before any code changes land.

## Risks accepted

Anyone who finds the invitation URL can post a wish, and it appears immediately. There is no rate limiting and no moderation queue. The mitigation is deletion through the dashboard after the fact. This was chosen knowingly over an approval workflow.

The Edge Functions can be invoked by anyone with the publishable key, so the couple's Telegram chat can be spammed. The token itself is not exposed.
