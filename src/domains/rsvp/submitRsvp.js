import { insertRsvp } from '../../infrastructure/supabase/rsvpRepository.js'

/**
 * Application use case: record an RSVP to the couple's Supabase table.
 * Returns { ok: boolean }; never throws.
 */
export async function submitRsvp(rsvp) {
  try {
    await insertRsvp(rsvp)
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
