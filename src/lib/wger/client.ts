import type { WgerExerciseInfo, WgerPaginated } from '@/types/wger'

const BASE = 'https://wger.de/api/v2'
export const WGER_LANG_NL = 6
export const WGER_LANG_EN = 2

async function wgerFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Wger API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

/** Search exercises via the combined exerciseinfo endpoint. */
export async function searchExercises(
  query: string,
  language = WGER_LANG_NL,
  limit = 20,
): Promise<WgerExerciseInfo[]> {
  const params = new URLSearchParams({
    language: String(language),
    limit: String(limit),
  })
  if (query.trim()) params.set('search', query.trim())

  const data = await wgerFetch<WgerPaginated<WgerExerciseInfo>>(
    `/exerciseinfo/?${params}`,
  )
  return data.results
}

export async function getExercise(id: number, language = WGER_LANG_NL): Promise<WgerExerciseInfo> {
  const data = await wgerFetch<WgerPaginated<WgerExerciseInfo>>(
    `/exerciseinfo/?language=${language}&id=${id}`,
  )
  const hit = data.results.find((e) => e.id === id)
  if (!hit) throw new Error(`Oefening ${id} niet gevonden`)
  return hit
}

export function exerciseDisplayName(info: WgerExerciseInfo, language = WGER_LANG_NL): string {
  const nl = info.translations.find((t) => t.language === language)
  const en = info.translations.find((t) => t.language === WGER_LANG_EN)
  return nl?.name ?? en?.name ?? info.translations[0]?.name ?? `Oefening ${info.id}`
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
