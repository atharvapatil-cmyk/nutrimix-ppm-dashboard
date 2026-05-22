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

  // Check keywords in order
  for (const rule of RULES) {
    for (const kw of rule.kw) {
      if (voc.includes(kw)) return rule.name
    }
  }

  return 'Product Quality Issue'
}

export function extractProductInfo(rawText: string): {
  product: string
  packaging: string
  flavour: string
} {
  const text = rawText.toLowerCase()

  // Detect product (2+, 7+, 13+, MamaMix)
  let product = 'Unknown'
  if (text.includes('2+')) product = '2+'
  else if (text.includes('7+')) product = '7+'
  else if (text.includes('13+')) product = '13+'
  else if (text.includes('mamamix')) product = 'MamaMix'

  // Detect packaging
  let packaging = 'Other'
  if (text.includes('350g jar')) packaging = '350g Jar'
  else if (text.includes('350g pouch')) packaging = '350g Pouch'
  else if (text.includes('700g pouch')) packaging = '700g Pouch'
  else if (text.includes('1kg pouch')) packaging = '1kg Pouch'
  else if (text.includes('400g pouch')) packaging = '400g Pouch'
  else if (text.includes('mini')) packaging = 'Mini'
  else if (text.includes('pack')) packaging = 'Pack'

  // Detect flavour
  let flavour = 'Unflavored'
  if (text.includes('chocolate')) flavour = 'Chocolate'
  else if (text.includes('vanilla')) flavour = 'Vanilla'
  else if (text.includes('strawberry')) flavour = 'Strawberry'
  else if (text.includes('mango')) flavour = 'Mango'
  else if (text.includes('cookies')) flavour = 'Cookies & Cream'
  else if (text.includes('caramel')) flavour = 'Caramel'
  else if (text.includes('unflavored')) flavour = 'Unflavored'
  else if (text.includes('plain')) flavour = 'Unflavored'

  return { product, packaging, flavour }
}
