export type WgerEquipment = {
  id: number
  name: string
}

export type WgerTranslation = {
  id: number
  name: string
  description: string
  language: number
  exercise: number
}

export type WgerExerciseInfo = {
  id: number
  uuid: string
  category: { id: number; name: string }
  equipment: WgerEquipment[]
  translations: WgerTranslation[]
  muscles: { id: number; name: string; name_en: string }[]
}

export type WgerPaginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type WgerPublicTemplate = {
  id: number
  name: string
  description: string
  days: number
  slots: number
}
