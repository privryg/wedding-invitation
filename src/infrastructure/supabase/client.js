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
