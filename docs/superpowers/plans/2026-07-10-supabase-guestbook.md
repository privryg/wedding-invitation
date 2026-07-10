# Supabase-Backed Guestbook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the wedding invitation's guestbook a genuinely shared, durable wall backed by Supabase, and remove the Telegram bot token from the client bundle.

**Architecture:** The browser reads and writes a single `public.wishes` table directly, protected by row-level security that permits only `select` and `insert`. A database webhook fires an Edge Function (`notify-wish`) on insert, which posts to Telegram. A second Edge Function (`notify-rsvp`) replaces the browser's direct Telegram call from the RSVP form. Both functions hold the bot token in Edge Function secrets; no Telegram credential exists in client code.

**Tech Stack:** React 18, Vite 5, `@supabase/supabase-js` v2, Supabase Postgres + Edge Functions (Deno), Vitest + Testing Library + jsdom.

**Spec:** `docs/superpowers/specs/2026-07-10-supabase-guestbook-design.md`

## Global Constraints

- Table name is `public.wishes`. Columns: `id uuid`, `name text`, `message text`, `created_at timestamptz`.
- Name limit is 1–80 characters after trimming. Message limit is 1–500 characters after trimming. These exact bounds are enforced in three places: the RLS insert policy, the Edge Function validators, and nowhere else. The client does not re-check lengths.
- Wishes are ordered `created_at desc` — newest first — everywhere they are read.
- Client env vars are exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Edge Function secrets are exactly `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `WISH_WEBHOOK_SECRET`.
- Both Edge Functions deploy with `verify_jwt: false`. See Task 3 for why this is correct rather than lax.
- Telegram message bodies must match today's output from `formatWishMessage` and `formatRsvpMessage` byte for byte, including the Indonesian labels and newlines.
- No Telegram token, chat id, or `sb_secret_*` key may appear in any file under `src/`, in `.env`, or in git history.
- Attendance values are the exact strings `Hadir` and `Tidak Hadir`.

## Amendments to the spec

The spec did not say how the Edge Functions authenticate callers. Two decisions, made during planning:

1. `notify-rsvp` deploys with `verify_jwt: false`. Requiring a JWT would mean requiring the publishable key, which is public and ships in the bundle — it would authenticate nobody. The function validates its inputs instead, so the worst an abuser can send is a well-formed fake RSVP.
2. `notify-wish` deploys with `verify_jwt: false` and requires a `x-webhook-secret` header matching `WISH_WEBHOOK_SECRET`. The database webhook is configured to send it. This is real authentication, because that secret is not public.

## Prerequisites (human, not agent)

These cannot be done through the Supabase MCP tools and must be done by Ryan. Tasks that depend on them say so.

- **P1.** ~~Project access.~~ **Done.** Project `pefbqujpyllvjvbcefaz` ("wedding-ryan-eci", org `nikplsvhrshirdqereal`, region `ap-southeast-1`) was created on 2026-07-10 and is `ACTIVE_HEALTHY`. The earlier `batbwvkeprnajgfaonfv` is unreachable from this MCP connection and is not used.
- **P2.** Rotate the leaked `sb_secret_*` key that was pasted into chat, at Settings → API Keys → Secret keys.
- **P3.** Rotate the Telegram bot token with BotFather (`/revoke`, then `/token`). The current token is recoverable from `src/infrastructure/telegram/telegramNotifier.js` and from any deployed `dist/` bundle.
- **P4.** After Task 3 deploys the functions, set three Edge Function secrets in Dashboard → Edge Functions → Secrets: `TELEGRAM_BOT_TOKEN` (the rotated one), `TELEGRAM_CHAT_ID` (`<your-telegram-chat-id>`), and `WISH_WEBHOOK_SECRET` (any long random string; generate with `openssl rand -hex 32`).
- **P5.** After Task 2 and Task 3, create the database webhook in Dashboard → Database → Webhooks: name `on_wish_insert`, table `public.wishes`, event `Insert`, type `Supabase Edge Functions`, function `notify-wish`, method `POST`, and one HTTP header `x-webhook-secret` set to the same value as `WISH_WEBHOOK_SECRET`.

Do not paste the bot token, the webhook secret, or any `sb_secret_*` key into the chat. The agent never needs them.

## File Structure

**Create:**
- `.env` (git-ignored) — the two `VITE_*` values.
- `.env.example` — the same two keys, empty.
- `src/infrastructure/supabase/client.js` — the single `createClient` call. Nothing else.
- `src/infrastructure/supabase/wishRepository.js` — `fetchWishes()`, `insertWish()`. The only module that knows how a wish is stored.
- `src/infrastructure/supabase/rsvpNotifier.js` — `notifyRsvp()`. The only module that knows how an RSVP is delivered.
- `supabase/functions/notify-wish/index.ts`, `supabase/functions/notify-wish/telegram.ts`
- `supabase/functions/notify-rsvp/index.ts`, `supabase/functions/notify-rsvp/telegram.ts`
- `src/infrastructure/supabase/wishRepository.test.js`
- `src/domains/guestbook/useGuestbook.test.jsx`
- `vitest.config.js`

**Modify:**
- `src/domains/guestbook/useGuestbook.js` — becomes async, gains `status`, gains optimistic rollback.
- `src/domains/guestbook/WishesSection.jsx` — loading/error states, in-flight button, keys by `wish.id`.
- `src/domains/guestbook/wish.js` — drop `formatWishMessage`.
- `src/domains/rsvp/rsvp.js` — drop `formatRsvpMessage` and `normalizeWhatsapp`.
- `src/domains/rsvp/submitRsvp.js` — call `notifyRsvp`.
- `.gitignore` — add `.env`.
- `package.json` — add dependency and dev dependencies, add `test` script.

**Delete:**
- `src/infrastructure/storage/localWishRepository.js`
- `src/infrastructure/telegram/telegramNotifier.js`

The two Deno `telegram.ts` files are byte-identical by design. Edge Functions deploy as isolated bundles; sharing a module across them would mean a build step this project does not have. Six duplicated lines is the cheaper trade.

---

### Task 1: Baseline commit and env plumbing

No Supabase access needed. Establishes version control before anything is deleted, so every later task is revertible.

**Files:**
- Modify: `.gitignore`
- Create: `.env.example`

- [ ] **Step 1: Add `.env` to `.gitignore`**

Append one line to `.gitignore` so it reads:

```
node_modules
dist
.DS_Store
*.log
.vite
.env
```

- [ ] **Step 2: Create `.env.example`**

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

- [ ] **Step 3: Verify the leaked token is about to enter history, and confirm P3 is done**

Run: `grep -c tgDecode src/infrastructure/telegram/telegramNotifier.js`
Expected: `1`

This file is committed in this task and deleted in Task 7. Deleting it later does **not** remove it from history. Confirm with Ryan that prerequisite P3 (token rotation) is complete before committing. If it is not, stop and wait.

- [ ] **Step 4: Verify the repo state**

Run: `git status --short | wc -l`
Expected: a nonzero count; the repo is initialized on `main` with everything staged and no commit yet.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: initial commit of wedding invitation, ignore .env"
```

---

### Task 2: Provision the database

**Blocked by P1.** Uses the Supabase MCP tools; no local files change. The project is `pefbqujpyllvjvbcefaz` ("wedding-ryan-eci").

**Interfaces:**
- Produces: table `public.wishes` with columns `id uuid`, `name text`, `message text`, `created_at timestamptz`; readable and insertable by role `anon`.

- [ ] **Step 1: Confirm the project is reachable**

Call `get_project` with the project id. Expected: status `ACTIVE_HEALTHY`. If it returns a permission error, stop — P1 is not done.

- [ ] **Step 2: Apply the migration**

Call `apply_migration` with name `create_wishes_table` and this query:

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
    char_length(trim(name)) between 1 and 80
    and char_length(trim(message)) between 1 and 500
  );

create index wishes_created_at_idx on public.wishes (created_at desc);
```

- [ ] **Step 3: Verify RLS is on and only two policies exist**

Call `execute_sql` with:

```sql
select relrowsecurity from pg_class where oid = 'public.wishes'::regclass;
select cmd from pg_policies where tablename = 'wishes' order by cmd;
```

Expected: `relrowsecurity` is `true`; exactly two rows, `INSERT` and `SELECT`. If `UPDATE` or `DELETE` appears, the migration is wrong — the publishable key would be able to edit or erase guests' wishes.

- [ ] **Step 4: Verify the length bound is enforced**

Call `execute_sql` with:

```sql
set local role anon;
insert into public.wishes (name, message) values ('   ', 'hello');
```

Expected: FAIL with `new row violates row-level security policy`. A whitespace-only name must not be insertable. Then `reset role;`.

- [ ] **Step 5: Check for advisories**

Call `get_advisors` with `type: "security"`. Expected: no error naming `public.wishes`. Record any warning in the task notes.

---

### Task 3: Deploy the Edge Functions

**Blocked by P1.** Deploys both functions. They will fail at runtime until P4 sets the secrets; that is expected and is verified in Task 8, not here.

Both deploy with `verify_jwt: false`. For `notify-rsvp` this grants no access that the public publishable key did not already grant. For `notify-wish` the real gate is the `x-webhook-secret` header.

**Interfaces:**
- Produces: `POST /functions/v1/notify-rsvp`, body `{ name, whatsapp, attendance, guestCount }`, returns `{ ok: boolean }`.
- Produces: `POST /functions/v1/notify-wish`, invoked only by the database webhook.

- [ ] **Step 1: Write the shared Telegram sender**

This exact content is used as `telegram.ts` in **both** function directories.

```ts
const TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')

export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!TOKEN || !CHAT_ID) {
    console.error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set')
    return false
  }
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text }),
  })
  const data = await res.json().catch(() => null)
  return !!(data && data.ok)
}
```

- [ ] **Step 2: Write `notify-wish/index.ts`**

The webhook payload shape is `{ type, table, schema, record, old_record }`. Only `record` is used.

```ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { sendTelegramMessage } from './telegram.ts'

const WEBHOOK_SECRET = Deno.env.get('WISH_WEBHOOK_SECRET')

function formatWishMessage(name: string, message: string): string {
  return 'Ucapan & Doa - Wedding Ryan & Eci\n' + 'Nama: ' + name + '\n' + 'Pesan: ' + message
}

Deno.serve(async (req: Request) => {
  if (!WEBHOOK_SECRET || req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('forbidden', { status: 403 })
  }
  const payload = await req.json().catch(() => null)
  const record = payload?.record
  if (!record?.name || !record?.message) {
    return new Response('bad request', { status: 400 })
  }
  const ok = await sendTelegramMessage(formatWishMessage(record.name, record.message))
  return new Response(JSON.stringify({ ok }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
```

Note the comparison against `WEBHOOK_SECRET` returns 403 when the secret is unset, rather than allowing the call through. An unconfigured function must be closed, not open.

- [ ] **Step 3: Write `notify-rsvp/index.ts`**

`normalizeWhatsapp` moves here from `rsvp.js`. The function re-derives the message from fields; it never accepts a pre-formatted string, so it cannot be used to relay arbitrary text into the chat.

```ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { sendTelegramMessage } from './telegram.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const ATTENDANCE = ['Hadir', 'Tidak Hadir']

function normalizeWhatsapp(value: string): string {
  let digits = String(value).replace(/\D/g, '')
  if (digits.startsWith('0')) digits = '62' + digits.slice(1)
  return '+' + digits
}

function formatRsvpMessage(name: string, whatsapp: string, attendance: string, guestCount: number): string {
  return (
    'Konfirmasi Kehadiran - Wedding Ryan & Eci\n' +
    'Nama: ' + name + '\n' +
    'WhatsApp: ' + normalizeWhatsapp(whatsapp) + '\n' +
    'Kehadiran: ' + attendance + '\n' +
    'Jumlah tamu: ' + guestCount + ' orang'
  )
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const body = await req.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const whatsapp = typeof body?.whatsapp === 'string' ? body.whatsapp : ''
  const attendance = body?.attendance
  const guestCount = Number(body?.guestCount)
  const digits = whatsapp.replace(/\D/g, '')

  const valid =
    name.length >= 1 && name.length <= 80 &&
    digits.length >= 9 && digits.length <= 15 &&
    ATTENDANCE.includes(attendance) &&
    Number.isInteger(guestCount) && guestCount >= 1 && guestCount <= 20

  if (!valid) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid rsvp' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const ok = await sendTelegramMessage(formatRsvpMessage(name, whatsapp, attendance, guestCount))
  return new Response(JSON.stringify({ ok }), {
    status: ok ? 200 : 502,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
})
```

- [ ] **Step 4: Deploy both functions**

Call `deploy_edge_function` twice, each with `entrypoint_path: "index.ts"`, `verify_jwt: false`, and `files` containing both `index.ts` and `telegram.ts` with the content above.

- [ ] **Step 5: Verify the wish function rejects an unauthenticated call**

```bash
curl -s -o /dev/null -w '%{http_code}' -X POST \
  "https://pefbqujpyllvjvbcefaz.supabase.co/functions/v1/notify-wish" \
  -H 'Content-Type: application/json' -d '{"record":{"name":"x","message":"y"}}'
```

Expected: `403`. If it returns `200`, the secret check is not wired and the function is open — stop and fix before continuing.

- [ ] **Step 6: Verify the RSVP function rejects a malformed body**

```bash
curl -s -X POST "https://pefbqujpyllvjvbcefaz.supabase.co/functions/v1/notify-rsvp" \
  -H 'Content-Type: application/json' -d '{"name":"","whatsapp":"1"}'
```

Expected: `{"ok":false,"error":"invalid rsvp"}` with status 400.

- [ ] **Step 7: Commit the function sources**

```bash
git add supabase/
git commit -m "feat: add notify-wish and notify-rsvp edge functions"
```

- [ ] **Step 8: Hand P4 and P5 to Ryan**

Tell Ryan the functions are deployed and the secrets and webhook are now unblocked. Nothing further in this plan works until they are set.

---

### Task 4: Supabase client and wish repository

**Blocked by Task 2** (needs the table) **and P1** (needs the URL and publishable key, fetched via `get_project_url` and `get_publishable_keys`). Adds the test framework, because this is the first task with anything to test.

**Files:**
- Modify: `package.json`
- Create: `vitest.config.js`, `.env`
- Create: `src/infrastructure/supabase/client.js`, `src/infrastructure/supabase/wishRepository.js`
- Test: `src/infrastructure/supabase/wishRepository.test.js`

**Interfaces:**
- Produces: `fetchWishes(): Promise<Array<{id, name, message}>>`, newest first, throws on failure.
- Produces: `insertWish({name, message}): Promise<{id, name, message}>`, throws on failure.

- [ ] **Step 1: Install dependencies**

```bash
npm install @supabase/supabase-js
npm install -D vitest jsdom @testing-library/react
```

- [ ] **Step 2: Add the test script to `package.json`**

In `"scripts"`, alongside the existing entries:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.js`**

`test.env` supplies `import.meta.env` values to the test run. Without them `client.js` calls `createClient(undefined, undefined)` at import time and throws, which would break any test that transitively imports it.

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    env: {
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'test-publishable-key',
    },
  },
})
```

- [ ] **Step 4: Write the failing test**

Create `src/infrastructure/supabase/wishRepository.test.js`. The Supabase client is mocked, so this asserts our mapping and ordering contract, not Supabase's behavior.

```js
import { describe, it, expect, vi, beforeEach } from 'vitest'

const order = vi.fn()
const select = vi.fn(() => ({ order }))
const single = vi.fn()
const insertSelect = vi.fn(() => ({ single }))
const insert = vi.fn(() => ({ select: insertSelect }))
const from = vi.fn(() => ({ select, insert }))

vi.mock('./client.js', () => ({ supabase: { from: (...a) => from(...a) } }))

const { fetchWishes, insertWish } = await import('./wishRepository.js')

beforeEach(() => vi.clearAllMocks())

describe('fetchWishes', () => {
  it('returns wishes newest first, stripped to id/name/message', async () => {
    order.mockResolvedValue({
      data: [
        { id: 'b', name: 'Bagus', message: 'kedua', created_at: '2026-07-02' },
        { id: 'a', name: 'Rina', message: 'pertama', created_at: '2026-07-01' },
      ],
      error: null,
    })

    const wishes = await fetchWishes()

    expect(from).toHaveBeenCalledWith('wishes')
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(wishes).toEqual([
      { id: 'b', name: 'Bagus', message: 'kedua' },
      { id: 'a', name: 'Rina', message: 'pertama' },
    ])
  })

  it('throws when supabase returns an error', async () => {
    order.mockResolvedValue({ data: null, error: { message: 'boom' } })
    await expect(fetchWishes()).rejects.toThrow('boom')
  })
})

describe('insertWish', () => {
  it('returns the created wish', async () => {
    single.mockResolvedValue({ data: { id: 'c', name: 'Sri', message: 'selamat' }, error: null })
    const wish = await insertWish({ name: 'Sri', message: 'selamat' })
    expect(insert).toHaveBeenCalledWith({ name: 'Sri', message: 'selamat' })
    expect(wish).toEqual({ id: 'c', name: 'Sri', message: 'selamat' })
  })

  it('throws when the insert is rejected by RLS', async () => {
    single.mockResolvedValue({ data: null, error: { message: 'violates row-level security policy' } })
    await expect(insertWish({ name: '', message: '' })).rejects.toThrow('row-level security')
  })
})
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npx vitest run src/infrastructure/supabase/wishRepository.test.js`
Expected: FAIL — `Failed to resolve import "./wishRepository.js"`.

- [ ] **Step 6: Create `src/infrastructure/supabase/client.js`**

```js
import { createClient } from '@supabase/supabase-js'

/**
 * The one Supabase client for the invitation. The publishable key is public by
 * design and ships in the bundle; row-level security, not key secrecy, is what
 * protects the wishes table.
 */
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
)
```

- [ ] **Step 7: Create `src/infrastructure/supabase/wishRepository.js`**

```js
import { supabase } from './client.js'

/**
 * Persistence adapter for the guestbook. The only module that knows a wish is a
 * row in `public.wishes`. The guestbook domain talks to this interface.
 */

export async function fetchWishes() {
  const { data, error } = await supabase
    .from('wishes')
    .select('id, name, message, created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data.map(({ id, name, message }) => ({ id, name, message }))
}

export async function insertWish({ name, message }) {
  const { data, error } = await supabase
    .from('wishes')
    .insert({ name, message })
    .select('id, name, message')
    .single()

  if (error) throw new Error(error.message)
  return data
}
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npx vitest run src/infrastructure/supabase/wishRepository.test.js`
Expected: PASS, 4 tests.

- [ ] **Step 9: Create `.env` with the real values**

Fetch them with `get_project_url` and `get_publishable_keys` (use the key where `disabled` is false, preferring the `sb_publishable_...` form). Write:

```
VITE_SUPABASE_URL=https://pefbqujpyllvjvbcefaz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

- [ ] **Step 10: Verify `.env` is not tracked**

Run: `git check-ignore -v .env`
Expected: a line naming `.gitignore` and `.env`. If it prints nothing, `.env` is tracked — stop and fix Task 1 Step 1.

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json vitest.config.js src/infrastructure/supabase .env.example
git commit -m "feat: add supabase client and wish repository"
```

---

### Task 5: Make the guestbook hook async, with optimistic rollback

**Blocked by Task 4.** The rollback path is the behavior that regresses silently and is never noticed in manual testing, so it is tested first.

**Files:**
- Modify: `src/domains/guestbook/useGuestbook.js`
- Modify: `src/domains/guestbook/wish.js`
- Delete: `src/infrastructure/storage/localWishRepository.js`
- Test: `src/domains/guestbook/useGuestbook.test.jsx`

**Interfaces:**
- Consumes: `fetchWishes()`, `insertWish()` from Task 4.
- Produces: `useGuestbook()` returning `{ wishes, status, addWish }` where `status` is `'loading' | 'ready' | 'error'` and `addWish(name, message)` resolves to `{ ok: boolean }`.

- [ ] **Step 1: Write the failing test**

Create `src/domains/guestbook/useGuestbook.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

const fetchWishes = vi.fn()
const insertWish = vi.fn()

vi.mock('../../infrastructure/supabase/wishRepository.js', () => ({
  fetchWishes: (...a) => fetchWishes(...a),
  insertWish: (...a) => insertWish(...a),
}))

const { useGuestbook } = await import('./useGuestbook.js')

beforeEach(() => vi.clearAllMocks())

describe('useGuestbook', () => {
  it('loads wishes and reports ready', async () => {
    fetchWishes.mockResolvedValue([{ id: 'a', name: 'Rina', message: 'selamat' }])
    const { result } = renderHook(() => useGuestbook())

    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.wishes).toHaveLength(1)
  })

  it('reports error when the initial fetch fails', async () => {
    fetchWishes.mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => useGuestbook())
    await waitFor(() => expect(result.current.status).toBe('error'))
    expect(result.current.wishes).toEqual([])
  })

  it('prepends the saved wish on success', async () => {
    fetchWishes.mockResolvedValue([{ id: 'a', name: 'Rina', message: 'selamat' }])
    insertWish.mockResolvedValue({ id: 'b', name: 'Sri', message: 'bahagia' })

    const { result } = renderHook(() => useGuestbook())
    await waitFor(() => expect(result.current.status).toBe('ready'))

    let outcome
    await act(async () => {
      outcome = await result.current.addWish('Sri', 'bahagia')
    })

    expect(outcome).toEqual({ ok: true })
    expect(result.current.wishes.map((w) => w.id)).toEqual(['b', 'a'])
  })

  it('rolls the optimistic wish back off the wall when the insert fails', async () => {
    fetchWishes.mockResolvedValue([{ id: 'a', name: 'Rina', message: 'selamat' }])
    insertWish.mockRejectedValue(new Error('violates row-level security policy'))

    const { result } = renderHook(() => useGuestbook())
    await waitFor(() => expect(result.current.status).toBe('ready'))

    let outcome
    await act(async () => {
      outcome = await result.current.addWish('Sri', 'bahagia')
    })

    expect(outcome).toEqual({ ok: false })
    expect(result.current.wishes.map((w) => w.id)).toEqual(['a'])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/domains/guestbook/useGuestbook.test.jsx`
Expected: FAIL — the current hook has no `status` and its `addWish` returns `undefined`.

- [ ] **Step 3: Rewrite `src/domains/guestbook/useGuestbook.js`**

```js
import { useCallback, useEffect, useState } from 'react'
import { fetchWishes, insertWish } from '../../infrastructure/supabase/wishRepository.js'

/**
 * Guestbook application service (as a hook): loads the shared wishes wall and
 * exposes addWish, which shows the wish immediately and takes it back down if
 * the write is rejected. The Telegram notification is a database webhook now,
 * not this hook's problem.
 */
export function useGuestbook() {
  const [wishes, setWishes] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    fetchWishes()
      .then((loaded) => {
        if (cancelled) return
        setWishes(loaded)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const addWish = useCallback(async (name, message) => {
    const optimistic = { id: `pending-${crypto.randomUUID()}`, name, message }
    setWishes((prev) => [optimistic, ...prev])

    try {
      const saved = await insertWish({ name, message })
      setWishes((prev) => prev.map((w) => (w.id === optimistic.id ? saved : w)))
      return { ok: true }
    } catch {
      setWishes((prev) => prev.filter((w) => w.id !== optimistic.id))
      return { ok: false }
    }
  }, [])

  return { wishes, status, addWish }
}
```

The functional `setWishes` updaters matter: the old hook closed over `wishes` and listed it as a dependency, so two quick submissions could drop one. These updaters cannot.

- [ ] **Step 4: Drop `formatWishMessage` from `src/domains/guestbook/wish.js`**

The file becomes:

```js
/**
 * Guestbook domain: a Wish (name + message) and its validation. Storage lives in
 * an adapter; the Telegram message is formatted server-side, in notify-wish.
 */

export function isValidWish(name, message) {
  return name.trim().length > 0 && message.trim().length > 0
}
```

- [ ] **Step 5: Delete the localStorage adapter**

```bash
git rm src/infrastructure/storage/localWishRepository.js
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run src/domains/guestbook/useGuestbook.test.jsx`
Expected: PASS, 4 tests.

- [ ] **Step 7: Verify nothing still imports the deleted module**

Run: `grep -rn "localWishRepository\|formatWishMessage" src/ || echo CLEAN`
Expected: `CLEAN`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: back the guestbook with supabase, with optimistic rollback"
```

---

### Task 6: Render loading, error, and in-flight states

**Blocked by Task 5.** Purely presentational. Verified by running the app, not by a test — the states are trivial and a test here would assert React's behavior, not ours.

**Files:**
- Modify: `src/domains/guestbook/WishesSection.jsx`

**Interfaces:**
- Consumes: `useGuestbook()` from Task 5.

- [ ] **Step 1: Rewrite the component**

Three changes from today: `send` awaits and reports real failure instead of unconditional thanks; the wall renders `status`; the list keys by `wish.id` rather than array index.

```jsx
import { useState } from 'react'
import Reveal from '../../shared/components/Reveal.jsx'
import OrnDivider from '../../shared/components/OrnDivider.jsx'
import { isValidWish } from './wish.js'
import { useGuestbook } from './useGuestbook.js'
import './guestbook.css'

/** "Ucapan & Doa" — the guestbook: leave a wish, see the wishes wall. */
export default function WishesSection() {
  const { wishes, status, addWish } = useGuestbook()
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState(null) // { text, ok }

  const send = async () => {
    if (!isValidWish(name, message)) {
      setFeedback({ text: 'Mohon isi nama dan ucapan.', ok: false })
      return
    }
    setSending(true)
    const { ok } = await addWish(name.trim(), message.trim())
    setSending(false)

    if (ok) {
      setName('')
      setMessage('')
      setFeedback({ text: 'Terima kasih atas ucapan & doanya.', ok: true })
    } else {
      setFeedback({ text: 'Ucapan gagal terkirim. Silakan coba lagi.', ok: false })
    }
  }

  return (
    <section>
      <Reveal>
        <OrnDivider />
        <div className="kicker">Ucapan &amp; Doa</div>
        <div className="serif-lg">Untuk Kedua Mempelai</div>
        <div className="wish-box">
          <input
            type="text"
            placeholder="Nama Anda"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            placeholder="Tulis ucapan & doa terbaik Anda..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="send-btn"
            style={{ marginTop: 12 }}
            onClick={send}
            disabled={sending}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
            {sending ? 'Mengirim...' : 'Kirim Ucapan'}
          </button>
          {feedback && (
            <div className="rsvp-err" style={{ color: feedback.ok ? '#a7d3a7' : '#e2a3a3' }}>
              {feedback.text}
            </div>
          )}
        </div>
        <div className="wishes">
          {status === 'loading' && <div className="wish-msg">Memuat ucapan...</div>}
          {status === 'error' && (
            <div className="wish-msg">Ucapan tidak dapat dimuat saat ini.</div>
          )}
          {status === 'ready' &&
            wishes.map((w) => (
              <div className="wish" key={w.id}>
                <div className="wish-name">{w.name}</div>
                <div className="wish-msg">{w.message}</div>
              </div>
            ))}
        </div>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 2: Verify the existing tests still pass**

Run: `npm test`
Expected: PASS, 8 tests across two files.

- [ ] **Step 3: Verify the app builds**

Run: `npm run build`
Expected: exit 0, `dist/` written.

- [ ] **Step 4: Commit**

```bash
git add src/domains/guestbook/WishesSection.jsx
git commit -m "feat: render guestbook loading, error, and in-flight states"
```

---

### Task 7: Route RSVP through the Edge Function and delete the token

**Blocked by Task 3.** This is the task that removes the Telegram token from the bundle.

**Files:**
- Create: `src/infrastructure/supabase/rsvpNotifier.js`
- Modify: `src/domains/rsvp/submitRsvp.js`, `src/domains/rsvp/rsvp.js`
- Delete: `src/infrastructure/telegram/telegramNotifier.js`

**Interfaces:**
- Consumes: `supabase` from Task 4; `notify-rsvp` from Task 3.
- Produces: `notifyRsvp(rsvp): Promise<{ok: boolean}>`.

- [ ] **Step 1: Create `src/infrastructure/supabase/rsvpNotifier.js`**

```js
import { supabase } from './client.js'

/**
 * Delivers an RSVP to the couple via the notify-rsvp Edge Function, which holds
 * the Telegram credentials and formats the message. Nothing about Telegram is
 * knowable from the browser.
 */
export async function notifyRsvp({ name, whatsapp, attendance, guestCount }) {
  const { data, error } = await supabase.functions.invoke('notify-rsvp', {
    body: { name, whatsapp, attendance, guestCount },
  })
  if (error) return { ok: false }
  return { ok: !!(data && data.ok) }
}
```

- [ ] **Step 2: Rewrite `src/domains/rsvp/submitRsvp.js`**

```js
import { notifyRsvp } from '../../infrastructure/supabase/rsvpNotifier.js'

/**
 * Application use case: deliver an RSVP to the couple.
 * Returns { ok: boolean }; never throws.
 */
export async function submitRsvp(rsvp) {
  return notifyRsvp(rsvp)
}
```

The old version threw on network failure; `notifyRsvp` folds transport errors into `{ ok: false }`. **`src/domains/rsvp/RsvpSection.jsx` needs no change.** Its `try`/`catch` at lines 39–53 already branches on `ok` and its `catch` becomes a backstop that should stay — `supabase.functions.invoke` can still throw on a malformed response, and the `finally` block that clears `sending` is load-bearing either way.

- [ ] **Step 3: Strip formatting from `src/domains/rsvp/rsvp.js`**

`formatRsvpMessage` and `normalizeWhatsapp` move to `notify-rsvp/index.ts`. Validation stays here, because it drives the form's error states. The file becomes exactly:

```js
/**
 * RSVP domain: the attendance-confirmation value object plus its validation
 * rules. No framework or transport concerns here, and no message formatting —
 * that happens server-side, in the notify-rsvp Edge Function.
 */

export const ATTENDANCE = {
  YES: 'Hadir',
  NO: 'Tidak Hadir',
}

/** A confirmation needs a non-empty name. */
export function isValidName(name) {
  return name.trim().length > 0
}

/**
 * WhatsApp number: digits only once separators are stripped. Indonesian mobile
 * numbers run 10–13 digits; we allow 9–15 so international guests still pass.
 */
export function isValidWhatsapp(value) {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 9 && digits.length <= 15
}

/** Both fields must pass before the guest can confirm. */
export function isValidRsvp({ name, whatsapp }) {
  return isValidName(name) && isValidWhatsapp(whatsapp)
}
```

Note that `normalizeWhatsapp` leaving the client means the guest never sees the `+62`-normalized form before submitting. That is unchanged from today — it was only ever used to build the Telegram message.

- [ ] **Step 4: Delete the Telegram adapter**

```bash
git rm src/infrastructure/telegram/telegramNotifier.js
```

- [ ] **Step 5: Verify no Telegram credential survives anywhere in the source**

Run:

```bash
grep -rniE "telegram|tgdecode|<your-telegram-chat-id>|api\.telegram\.org" src/ || echo CLEAN
```

Expected: `CLEAN`.

- [ ] **Step 6: Verify no Telegram credential survives in a production build**

Run:

```bash
npm run build && grep -rniE "telegram|<your-telegram-chat-id>" dist/ || echo CLEAN
```

Expected: `CLEAN`. This is the check that proves the goal was met. If it prints a match, the token or chat id is still shipping — do not proceed.

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: PASS, 8 tests.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: route rsvp through edge function, remove telegram token from bundle"
```

---

### Task 8: End-to-end verification

**Blocked by P4, P5, and Task 7.** Nothing here is automated; the webhook and the Telegram delivery have no test double worth building.

- [ ] **Step 1: Confirm the secrets and webhook exist**

Ask Ryan to confirm P4 and P5 are done. Then call `list_edge_functions` and confirm both `notify-wish` and `notify-rsvp` appear.

- [ ] **Step 2: Run the app**

Run: `npm run dev`
Open `http://localhost:6969`.

- [ ] **Step 3: Verify the wall loads from the database**

Expected: the wishes section shows "Memuat ucapan..." briefly, then an empty wall. The seed wishes from Rina and Bagus must **not** appear — they were fake and are gone.

- [ ] **Step 4: Submit a wish and verify the full path**

Type a name and message, click "Kirim Ucapan". Expected, in order: the wish appears on the wall immediately; the button shows "Mengirim..." and is disabled; the thank-you message appears; a Telegram message arrives in the couple's chat within a few seconds.

Then reload the page. The wish must still be there, which is the whole point — it is in Postgres, not `localStorage`.

- [ ] **Step 5: Verify the row landed**

Call `execute_sql` with `select id, name, message, created_at from public.wishes order by created_at desc limit 5;`
Expected: the wish just submitted, newest first.

- [ ] **Step 6: Verify a second browser sees the same wish**

Open the site in a private window. The wish must appear. This is the behavior that never worked before, and no unit test can prove it.

- [ ] **Step 7: Verify RSVP still delivers**

Submit the RSVP form. Expected: the form reports success and a correctly formatted `Konfirmasi Kehadiran` message arrives in Telegram, with the WhatsApp number normalized to `+62...`.

- [ ] **Step 8: Verify the webhook logs are clean**

Call `get_logs` with `service: "edge-function"`. Expected: a 200 from `notify-wish` and a 200 from `notify-rsvp`, no 403s and no "TELEGRAM_BOT_TOKEN is not set".

- [ ] **Step 9: Confirm the leaked credentials are dead**

Ask Ryan to confirm the old `sb_secret_*` key (P2) and the old bot token (P3) are both revoked. Until then the project remains exposed regardless of anything in this plan.

---

## Rollback

Every task commits independently and the app builds at every commit. To abandon the work: `git revert` the range, restore `localWishRepository.js` and `telegramNotifier.js` from history, and drop the `wishes` table. The Edge Functions can be left deployed; nothing calls them.
