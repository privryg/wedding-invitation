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

function formatRsvpMessage(
  name: string,
  whatsapp: string,
  attendance: string,
  guestCount: number,
): string {
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
