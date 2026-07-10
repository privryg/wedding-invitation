import { notifyRsvp } from '../../infrastructure/supabase/rsvpNotifier.js'

/**
 * Application use case: deliver an RSVP to the couple.
 * Returns { ok: boolean }; never throws.
 */
export async function submitRsvp(rsvp) {
  return notifyRsvp(rsvp)
}
