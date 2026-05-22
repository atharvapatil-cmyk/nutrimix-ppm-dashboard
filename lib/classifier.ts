import { RULES } from './constants'

export function isValidImageLink(s: string): boolean {
  return /drive\.google\.com|docs\.google\.com|\/d\/|google\.com\/file/i.test(s)
}

export function isValidBatchNumber(s: string): boolean {
  const trimmed = s.trim()
  return trimmed.length >= 4 && /^[A-Za-z]+\d/.test(trimmed)
}

export function classifyByKeywords(vocText: string): string {
  if (!vocText) return 'Product Quality Issue'
  const voc = vocText.toLowerCase()

  // Special case: near expiry + redelivery = Delivery Issue
  if (
    (voc.includes('near expiry') || voc.includes('expiry')) &&
    (voc.includes('redeliver') || voc.includes('redelivery') || voc.includes('re-deliver'))
  ) {
    return 'Delivery Issue'
  }

  for (const rule of RULES) {
    for (const kw of rule.kw) {
      if (voc.includes(kw)) return rule.name
    }
  }

  return 'Product Quality Issue'
}

/**
 * Extracts product, packaging, and flavour from a product name string.
 * Mirrors the original App Script extractProductInfo_ function exactly.
 */
export function extractProductInfo(rawText: string): {
  product: string
  packaging: string
  flavour: string
} {
  // Strip pipe-separated prefix (e.g. "SKU | Little Joys Nutrimix 2+ ...")
  let slug = String(rawText)
  if (slug.includes('|')) slug = slug.split('|').pop()!.trim()
  const s = slug.toLowerCase()

  // ── PRODUCT (default: 2+) ────────────────────────────────────────────
  let product = '2+'
  if (s.includes('13+') || s.includes('13-plus')) product = '13+'
  else if (s.includes('7+') || s.includes('7-plus')) product = '7+'
  else if (s.includes('mom') || s.includes('mama')) product = 'MamaMix'

  // ── PACKAGING (default: 350g Jar) ───────────────────────────────────
  let packaging = '350g Jar'
  if (s.includes('mini') || s.includes('20g') || s.includes('20 g') || s.includes('30g') || s.includes('30 g')) {
    packaging = 'Mini'
  } else if (s.includes('700')) {
    packaging = '700g Pouch'
  } else if (s.includes('1 kg') || s.includes('1kg')) {
    packaging = '1kg Pouch'
  } else if (/pack of [36]|csv|combo/i.test(s)) {
    packaging = 'Pack'
  } else if (s.includes('400')) {
    packaging = '400g Pouch'
  } else if ((s.includes('350') && s.includes('pouch')) || s.includes('350g pouch')) {
    packaging = '350g Pouch'
  } else if (s.includes('pouch')) {
    packaging = '350g Pouch'
  } else if (s.includes('350') || s.includes('jar')) {
    packaging = '350g Jar'
  }

  // ── FLAVOUR (default: Chocolate) ────────────────────────────────────
  let flavour = 'Chocolate'
  if ((s.includes('hazelnut') && s.includes('chocolate')) || s.includes('chocolate hazelnut')) {
    flavour = 'Chocolate Hazelnut'
  } else if (s.includes('belgian')) {
    flavour = 'Belgian Chocolate'
  } else if (s.includes('cookies') && s.includes('cream')) {
    flavour = 'Cookies & Cream'
  } else if (s.includes('kulfi')) {
    flavour = 'Kulfi Almond'
  } else if (s.includes('strawberry')) {
    flavour = 'Strawberry'
  } else if (s.includes('vanilla')) {
    flavour = 'Vanilla'
  } else if (s.includes('mango')) {
    flavour = 'Mango'
  } else if (s.includes('unsweetened')) {
    flavour = 'Unsweetened'
  } else if (s.includes('lite')) {
    flavour = 'Lite'
  }

  return { product, packaging, flavour }
}
