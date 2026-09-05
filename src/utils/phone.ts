/** Digits only — strips spaces, symbols, and leading + */
export function cleanPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** US leads: 10-digit numbers get country code 1 */
export function normalizePhoneDigits(phone: string): string {
  const digits = cleanPhoneDigits(phone);
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

/** Opens WhatsApp chat — works in app (mobile) and WhatsApp Web (desktop) */
export function whatsAppChatUrl(phone: string): string {
  return `https://wa.me/${normalizePhoneDigits(phone)}`;
}

/** Opens Telegram chat/contact — may resolve even when API lookup is hidden */
export function telegramChatUrl(phone: string): string {
  return `https://t.me/+${normalizePhoneDigits(phone)}`;
}

export function isValidPhoneForVerification(
  phone: string | null | undefined,
): boolean {
  if (!phone?.trim()) return false;
  const digits = cleanPhoneDigits(phone);
  return digits.length >= 10 && digits.length <= 15;
}
