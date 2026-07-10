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
