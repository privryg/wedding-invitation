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
