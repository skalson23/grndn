const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

export function isValidWaitlistEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim())
}
