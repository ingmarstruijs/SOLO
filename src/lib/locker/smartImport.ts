import type { EquipmentCategory } from '@/types/locker'
import type { LockerItem } from '@/types/locker'
import { getEquipmentMeta } from './equipmentCatalog'

export type SmartImportDraft = {
  name: string
  brand: string
  category: EquipmentCategory
  weightKg?: number
  sourceUrl: string
  confidence: 'high' | 'medium' | 'low'
}

const BRAND_PATTERNS = [
  /rogue/i, /eleiko/i, /technogym/i, /bowflex/i, /rep fitness/i,
  /cap barbell/i, /yes4all/i, /amazon basics/i, /nordictrack/i,
]

const WEIGHT_PATTERN = /(\d+(?:[.,]\d+)?)\s*(?:kg|kilogram|lb|lbs|pound)/i

const CATEGORY_KEYWORDS: { category: EquipmentCategory; keywords: RegExp[] }[] = [
  { category: 'kettlebell', keywords: [/kettlebell/i, /kettle bell/i] },
  { category: 'dumbbell', keywords: [/dumbbell/i, /halter/i, /hex dumbbell/i] },
  { category: 'medicine_ball', keywords: [/medicine ball/i, /slam ball/i, /med ball/i] },
  { category: 'resistance_band', keywords: [/resistance band/i, /weerstandband/i, /elastic band/i, /power band/i] },
  { category: 'barbell', keywords: [/barbell/i, /olympic bar/i, /stang/i] },
  { category: 'weight_plate', keywords: [/weight plate/i, /bumper plate/i, /schijf/i, /plate set/i] },
  { category: 'pull_up_bar', keywords: [/pull[- ]?up bar/i, /chin[- ]?up/i, /optrekstang/i] },
  { category: 'bench', keywords: [/weight bench/i, /training bench/i, /flat bench/i, /adjustable bench/i] },
  { category: 'rower', keywords: [/rowing machine/i, /roeier/i, /concept2/i, /erg/i] },
  { category: 'jump_rope', keywords: [/jump rope/i, /springtouw/i, /speed rope/i] },
  { category: 'foam_roller', keywords: [/foam roller/i, /massage roller/i] },
]

function detectCategory(text: string): EquipmentCategory {
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((k) => k.test(text))) return category
  }
  return 'other'
}

function detectBrand(text: string): string {
  for (const pattern of BRAND_PATTERNS) {
    const match = text.match(pattern)
    if (match) return match[0]
  }
  const titleBrand = text.match(/^([A-Z][a-zA-Z]+)\s/)
  return titleBrand?.[1] ?? ''
}

function detectWeight(text: string): number | undefined {
  const match = text.match(WEIGHT_PATTERN)
  if (!match) return undefined
  let value = parseFloat(match[1].replace(',', '.'))
  if (/lb/i.test(match[0])) value = Math.round(value * 0.453592 * 10) / 10
  return value
}

function cleanName(raw: string): string {
  return raw
    .replace(/\s*[-|–]\s*.+$/, '')
    .replace(/\s*\|.*/, '')
    .trim()
    .slice(0, 80)
}

/**
 * Parse product page HTML or plain text pasted from a retailer.
 * Extracts name, brand, category and weight heuristically.
 */
export function parseSmartImport(input: string, sourceUrl = ''): SmartImportDraft {
  const text = input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

  const ogTitle = input.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1]
  const titleTag = input.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
  const h1 = input.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]

  const nameSource = ogTitle ?? h1 ?? titleTag ?? text.slice(0, 120)
  const name = cleanName(nameSource)
  const brand = detectBrand(text)
  const category = detectCategory(text)
  const meta = getEquipmentMeta(category)
  const weightKg = meta.hasWeight ? detectWeight(text) : undefined

  const confidence: SmartImportDraft['confidence'] =
    name && (brand || weightKg || category !== 'other') ? 'high' :
    name ? 'medium' : 'low'

  return { name: name || 'Onbekend item', brand, category, weightKg, sourceUrl, confidence }
}

export function draftToLockerItem(draft: SmartImportDraft): Omit<LockerItem, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: draft.name,
    brand: draft.brand,
    category: draft.category,
    weightKg: draft.weightKg,
    firstUsedAt: new Date().toISOString().slice(0, 10),
  }
}
