/**
 * Guestbook domain: a Wish (name + message) and its validation. Storage lives in
 * an adapter; the Telegram message is formatted server-side, in notify-wish.
 */

export function isValidWish(name, message) {
  return name.trim().length > 0 && message.trim().length > 0
}
