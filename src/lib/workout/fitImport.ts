import { Decoder, Stream } from '@garmin/fitsdk'
import type { EquipmentCategory } from '@/types/locker'
import type { SetMetric, WorkoutExercise, WorkoutTemplate } from '@/types/workout'
import { createId } from '@/lib/storage/localStore'
import { recalcWorkoutDuration } from './overloadPlanner'

export type FitImportResult = {
  workout: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>
  warnings: string[]
  fileType: 'workout' | 'activity' | 'unknown'
}

type FitMessages = ReturnType<Decoder['read']>['messages']

const DEFAULT_SETS = 3
const DEFAULT_REST_BETWEEN_SETS = 60

/**
 * Decode a Garmin FIT file using the official @garmin/fitsdk.
 * Supports workout plans (workoutStepMesgs) and completed strength activities (setMesgs).
 */
export function parseFitFile(buffer: ArrayBuffer): FitImportResult {
  const warnings: string[] = []

  try {
    const stream = Stream.fromArrayBuffer(buffer)
    if (!Decoder.isFIT(stream)) {
      warnings.push('Geen geldig FIT-bestand.')
      return emptyResult('Onbekende import', warnings)
    }

    const decoder = new Decoder(stream)
    if (!decoder.checkIntegrity()) {
      warnings.push('FIT CRC-check mislukt — bestand kan incompleet zijn.')
    }

    const { messages, errors } = decoder.read()
    for (const err of errors) {
      warnings.push(`Decode: ${err.message}`)
    }

    if (messages.workoutMesgs?.length || messages.workoutStepMesgs?.length) {
      return parseWorkoutFile(messages, warnings)
    }

    if (messages.setMesgs?.length) {
      return parseStrengthActivity(messages, warnings)
    }

    if (messages.sessionMesgs?.length) {
      return parseSessionActivity(messages, warnings)
    }

    warnings.push('Geen workout- of set-data gevonden in FIT-bestand.')
    return emptyResult('Garmin import', warnings)
  } catch (e) {
    warnings.push(e instanceof Error ? e.message : 'FIT decode mislukt')
    return emptyResult('Garmin import', warnings)
  }
}

function parseWorkoutFile(messages: FitMessages, warnings: string[]): FitImportResult {
  const workout = messages.workoutMesgs?.[0]
  const steps = messages.workoutStepMesgs ?? []
  const titles = messages.exerciseTitleMesgs ?? []

  const name = workout?.wktName ?? 'Garmin Workout'
  const description = workout?.wktDescription ?? 'Geïmporteerd van Garmin FIT workout'

  const titleMap = new Map<string, string>()
  for (const t of titles) {
    if (t.messageIndex != null && t.wktStepName) {
      titleMap.set(String(t.messageIndex), t.wktStepName)
    }
  }

  const exercises: WorkoutExercise[] = []
  let workoutSets = DEFAULT_SETS

  for (const step of steps) {
    const intensity = String(step.intensity ?? '')
    if (intensity === 'rest' || intensity === 'recovery') continue

    const stepName =
      step.wktStepName ??
      (step.messageIndex != null ? titleMap.get(String(step.messageIndex)) : undefined) ??
      step.notes ??
      `Stap ${messageIndexNumber(step.messageIndex, exercises.length) + 1}`

    const { metric, target } = parseDuration(step)
    const weightKg = step.exerciseWeight ?? 0
    const repeats = step.repeatSteps && step.repeatSteps > 0 ? step.repeatSteps : 1
    workoutSets = Math.max(workoutSets, repeats)

    exercises.push({
      id: createId(),
      name: stepName,
      metric,
      target,
      weightKg: typeof weightKg === 'number' ? Math.round(weightKg * 10) / 10 : 0,
      restSeconds: parseRestSeconds(step),
      equipment: mapFitEquipment(step.equipment),
      notes: step.notes,
    })
  }

  const merged = mergeConsecutiveExercises(exercises)

  if (merged.length === 0) {
    warnings.push('Workout bevat geen actieve stappen.')
  } else {
    warnings.push(`${merged.length} workout-stap(pen) gedecodeerd via FIT SDK.`)
  }

  return {
    fileType: 'workout',
    workout: {
      name,
      description,
      exercises: merged,
      sets: workoutSets,
      restBetweenSets: DEFAULT_REST_BETWEEN_SETS,
      favorite: false,
      source: 'garmin-fit',
      estimatedMinutes: recalcWorkoutDuration(merged, workoutSets),
      tags: ['garmin', 'fit', 'workout'],
    },
    warnings,
  }
}

function parseStrengthActivity(messages: FitMessages, warnings: string[]): FitImportResult {
  const session = messages.sessionMesgs?.[0]
  const sets = messages.setMesgs ?? []
  const sport = session?.sport ?? 'training'

  const grouped = new Map<string, WorkoutExercise & { setCount: number }>()

  for (const set of sets) {
    const reps = set.repetitions ?? 10
    const weight = set.weight ?? 0
    const key = `${set.category?.[0] ?? 'x'}-${set.categorySubtype?.[0] ?? 'y'}`

    const existing = grouped.get(key)
    if (existing) {
      existing.setCount += 1
      existing.target = Math.max(existing.target, reps)
      existing.weightKg = Math.max(existing.weightKg, weight)
    } else {
      grouped.set(key, {
        id: createId(),
        name: `Oefening ${grouped.size + 1}`,
        setCount: 1,
        metric: 'reps',
        target: reps,
        weightKg: weight,
        restSeconds: 60,
        equipment: ['barbell'],
      })
    }
  }

  const entries = [...grouped.values()]
  const workoutSets = entries.length > 0 ? Math.max(...entries.map((e) => e.setCount)) : DEFAULT_SETS
  const exercises: WorkoutExercise[] = entries.map(({ setCount: _c, ...ex }) => ex)

  warnings.push(`${sets.length} set(s) uit strength-activiteit geïmporteerd.`)

  return {
    fileType: 'activity',
    workout: {
      name: `Garmin ${sport}`,
      description: 'Geïmporteerd uit Garmin strength-activiteit (setMesgs)',
      exercises,
      sets: workoutSets,
      restBetweenSets: DEFAULT_REST_BETWEEN_SETS,
      favorite: false,
      source: 'garmin-fit',
      estimatedMinutes: recalcWorkoutDuration(exercises, workoutSets),
      tags: ['garmin', 'fit', 'activity'],
    },
    warnings,
  }
}

function parseSessionActivity(messages: FitMessages, warnings: string[]): FitImportResult {
  const session = messages.sessionMesgs?.[0]
  const name = `Garmin ${session?.sport ?? 'sessie'}`
  warnings.push('Alleen sessie-metadata gevonden — geen sets of workout-stappen.')

  return {
    fileType: 'activity',
    workout: {
      name,
      description: 'Geïmporteerd FIT-sessie (beperkte data)',
      exercises: [],
      sets: DEFAULT_SETS,
      restBetweenSets: DEFAULT_REST_BETWEEN_SETS,
      favorite: false,
      source: 'garmin-fit',
      estimatedMinutes: 0,
      tags: ['garmin', 'fit'],
    },
    warnings,
  }
}

function parseDuration(step: {
  durationType?: unknown
  durationTime?: number
  durationReps?: number
  durationValue?: number
  durationDistance?: number
}): { metric: SetMetric; target: number } {
  const type = String(step.durationType ?? '')

  if (type.includes('rep') || step.durationReps) {
    return { metric: 'reps', target: step.durationReps ?? step.durationValue ?? 10 }
  }
  if (type.includes('time') || step.durationTime) {
    return { metric: 'time', target: Math.round(step.durationTime ?? step.durationValue ?? 60) }
  }
  if (type.includes('distance') || step.durationDistance) {
    return { metric: 'distance', target: Math.round(step.durationDistance ?? 0) }
  }
  return { metric: 'reps', target: step.durationValue ?? 10 }
}

function parseRestSeconds(step: { durationType?: unknown; durationTime?: number }): number {
  if (String(step.durationType ?? '').includes('rest')) {
    return Math.round(step.durationTime ?? 60)
  }
  return 60
}

function mapFitEquipment(equipment?: unknown): EquipmentCategory[] {
  const map: Record<string, EquipmentCategory> = {
    dumbbell: 'dumbbell',
    barbell: 'barbell',
    kettlebell: 'kettlebell',
    bands: 'resistance_band',
    bench: 'bench',
  }
  const cat = map[String(equipment ?? '').toLowerCase()]
  return cat ? [cat] : []
}

function messageIndexNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback
}

/** Merge identical consecutive exercises into one entry. */
function mergeConsecutiveExercises(exercises: WorkoutExercise[]): WorkoutExercise[] {
  const merged: WorkoutExercise[] = []
  for (const ex of exercises) {
    const prev = merged.at(-1)
    if (prev && prev.name === ex.name && prev.weightKg === ex.weightKg) continue
    merged.push({ ...ex })
  }
  return merged
}

function emptyResult(name: string, warnings: string[]): FitImportResult {
  return {
    fileType: 'unknown',
    workout: {
      name,
      exercises: [],
      sets: DEFAULT_SETS,
      restBetweenSets: DEFAULT_REST_BETWEEN_SETS,
      favorite: false,
      source: 'garmin-fit',
      estimatedMinutes: 0,
      tags: ['garmin'],
    },
    warnings,
  }
}

export function parseWorkoutJson(text: string): Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'> | null {
  try {
    const data = JSON.parse(text)
    if (data.workouts?.[0]) return data.workouts[0]
    if (data.name && data.exercises) return data
    return null
  } catch {
    return null
  }
}
