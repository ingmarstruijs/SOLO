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

export type ExercisePage = {
  results: WgerExerciseInfo[]
  count: number
  /** Offset to use for the next page, or null when there are no more. */
  nextOffset: number | null
}

/**
 * Search exercises via the combined exerciseinfo endpoint, with pagination.
 *
 * The legacy `/exercise/search/` endpoint and the generic `search`/`name__icontains`
 * query params no longer filter on wger.de. The current API exposes full-text name
 * (and alias) search through `name__search`, optionally scoped with `language__code`.
 */
export async function searchExercises(
  query: string,
  languageCode?: string,
  limit = 50,
  offset = 0,
): Promise<ExercisePage> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })
  if (query.trim()) {
    params.set('name__search', query.trim())
    if (languageCode) params.set('language__code', languageCode)
  }

  const data = await wgerFetch<WgerPaginated<WgerExerciseInfo>>(
    `/exerciseinfo/?${params}`,
  )

  return {
    results: data.results,
    count: data.count,
    nextOffset: data.next ? offset + data.results.length : null,
  }
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
