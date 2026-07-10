import { useCallback, useState } from 'react'
import { loadWishes, saveWishes } from '../../infrastructure/storage/localWishRepository.js'
import { sendTelegramMessage } from '../../infrastructure/telegram/telegramNotifier.js'
import { formatWishMessage } from './wish.js'

/**
 * Guestbook application service (as a hook): holds the persisted wishes and
 * exposes addWish, which prepends the new wish, persists it, and best-effort
 * notifies the couple via Telegram.
 */
export function useGuestbook() {
  const [wishes, setWishes] = useState(() => loadWishes())

  const addWish = useCallback((name, message) => {
    const next = [{ name, message }, ...wishes]
    setWishes(next)
    saveWishes(next)
    // fire-and-forget notification; never blocks or fails the UX
    try {
      sendTelegramMessage(formatWishMessage(name, message)).catch(() => {})
    } catch {
      /* ignore */
    }
  }, [wishes])

  return { wishes, addWish }
}
