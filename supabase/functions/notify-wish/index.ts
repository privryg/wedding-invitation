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
