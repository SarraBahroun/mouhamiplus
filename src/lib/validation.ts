const TN_PHONE_RE = /^(?:\+216|00216)?[2-9]\d{7}$/
const TN_TAX_ID_RE = /^\d{7}\/[A-Za-z]\/[A-Za-z]\/\d{3}$/

export function isValidTunisianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s.-]/g, '')
  return TN_PHONE_RE.test(cleaned)
}

export function isValidTunisianTaxId(taxId: string): boolean {
  return TN_TAX_ID_RE.test(taxId.trim())
}
