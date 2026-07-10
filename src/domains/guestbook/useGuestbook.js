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
