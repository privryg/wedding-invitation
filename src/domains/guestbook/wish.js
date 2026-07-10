/**
 * Guestbook domain: a Wish (name + message), its validation, and the Telegram
 * message format. Storage and transport live in adapters, not here.
 */

export function isValidWish(name, message) {
  return name.trim().length > 0 && message.trim().length > 0
}

export function formatWishMessage(name, message) {
  return 'Ucapan & Doa - Wedding Ryan & Eci\n' + 'Nama: ' + name + '\n' + 'Pesan: ' + message
}
