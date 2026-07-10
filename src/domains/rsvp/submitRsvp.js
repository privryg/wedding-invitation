import { formatRsvpMessage } from './rsvp.js'
import { sendTelegramMessage } from '../../infrastructure/telegram/telegramNotifier.js'

/**
 * Application use case: deliver an RSVP to the couple.
 * Returns { ok: boolean }; throws on network failure (caller handles it).
 */
export async function submitRsvp(rsvp) {
  const data = await sendTelegramMessage(formatRsvpMessage(rsvp))
  return { ok: !!(data && data.ok) }
}
