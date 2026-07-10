/**
 * RSVP domain: the attendance-confirmation value object plus its validation
 * rules. No framework or transport concerns here, and no message formatting —
 * that happens server-side, in the notify-rsvp Edge Function.
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

/** Both fields must pass before the guest can confirm. */
export function isValidRsvp({ name, whatsapp }) {
  return isValidName(name) && isValidWhatsapp(whatsapp)
}
