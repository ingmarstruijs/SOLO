import type { EquipmentCategory } from './locker'

export type PlateConfig = {
  mode: 'barbell' | 'dumbbell' | 'kettlebell' | 'bodyweight'
  targetKg: number
  barWeightKg: number
  platesPerSide: number[]
  totalKg: number
  achievable: boolean
  note?: string
}

/** How a set is measured — reps, time, or distance. */
export type SetMetric = 'reps' | 'time' | 'distance'

export type WorkoutExercise = {
  id: string
  name: string
  /** Wger or free-exercise-db reference id when sourced externally. */
  externalId?: string
  sets: number
  metric: SetMetric
  /** Target reps, seconds, or metres depending on metric. */
  target: number
  /** Target weight in kg — 0 for bodyweight. */
  weightKg: number
  restSeconds: number
  /** Audio note blob URL or text fallback. */
  audioNote?: string
  audioNoteText?: string
  equipment: EquipmentCategory[]
  notes?: string
}

export type WorkoutSource = 'manual' | 'wger' | 'garmin-fit' | 'imported'

export type WorkoutTemplate = {
  id: string
  name: string
  description?: string
  exercises: WorkoutExercise[]
  favorite: boolean
  source: WorkoutSource
  /** Estimated total duration in minutes. */
  estimatedMinutes: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type WorkoutExport = {
  version: 1
  exportedAt: string
  workouts: WorkoutTemplate[]
}

export type WorkoutFilters = {
  maxMinutes?: number
  /** Only show workouts whose equipment is fully covered by locker inventory. */
  lockerOnly: boolean
  /** Minimum recovery score (0–100) required — hides heavy sessions when low. */
  minRecovery: number
  favoritesOnly: boolean
}

export type OverloadTarget = {
  exerciseId: string
  originalWeightKg: number
  adjustedWeightKg: number
  adjustmentPercent: number
  reason?: string
  plateConfig?: PlateConfig
}
