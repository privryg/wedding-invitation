/**
 * RSVP domain: the attendance-confirmation value object plus its validation and
 * message formatting rules. No framework or transport concerns here.
 */

export const ATTENDANCE = {
  YES: 'Hadir',
  NO: 'Tidak Hadir',
}

/** A confirmation needs a non-empty name. */
export function isValidName(name) {
  return name.trim().length > 0
}

/**
 * WhatsApp number: digits only once separators are stripped. Indonesian mobile
 * numbers run 10–13 digits; we allow 9–15 so international guests still pass.
 */
export function isValidWhatsapp(value) {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 9 && digits.length <= 15
}

/** Normalize to E.164-ish: a leading 0 becomes Indonesia's 62 country code. */
export function normalizeWhatsapp(value) {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('0')) digits = '62' + digits.slice(1)
  return '+' + digits
}

/** Both fields must pass before the guest can confirm. */
export function isValidRsvp({ name, whatsapp }) {
  return isValidName(name) && isValidWhatsapp(whatsapp)
}

/** Formats the Telegram message body sent to the couple. */
export function formatRsvpMessage({ name, whatsapp, attendance, guestCount }) {
  return (
    'Konfirmasi Kehadiran - Wedding Ryan & Eci\n' +
    'Nama: ' + name + '\n' +
    'WhatsApp: ' + normalizeWhatsapp(whatsapp) + '\n' +
    'Kehadiran: ' + attendance + '\n' +
    'Jumlah tamu: ' + guestCount + ' orang'
  )
}
