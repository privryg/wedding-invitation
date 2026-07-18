import { supabase } from './client.js'

/**
 * Persistence adapter for RSVPs. The only module that knows a confirmation is a
 * row in `public.rsvps`. The couple reads these in the Supabase dashboard; the
 * anon key can insert but not select, so nothing reads them back in the app.
 *
 * `guestCount` arrives as a string from the <select>; it is stored as an int.
 */
export async function insertRsvp({ name, whatsapp, attendance, guestCount }) {
  const { error } = await supabase
    .from('rsvps')
    .insert({ name, whatsapp, attendance, guest_count: Number(guestCount) })

  if (error) throw new Error(error.message)
}
