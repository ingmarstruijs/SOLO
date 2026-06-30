import type { WorkoutExercise, WorkoutTemplate } from '@/types/workout'

type LegacyExercise = WorkoutExercise & {
  sets?: number
  audioNote?: string
  audioNoteText?: string
}

export type LegacyWorkout = Omit<WorkoutTemplate, 'exercises' | 'sets' | 'restBetweenSets'> & {
  exercises: LegacyExercise[]
  sets?: number
  restBetweenSets?: number
}

/** Migrate legacy workouts where sets lived on each exercise. */
export function migrateWorkout(raw: LegacyWorkout): WorkoutTemplate {
  const hasWorkoutSets = typeof raw.sets === 'number'
  const legacySets = raw.exercises.map((e) => e.sets ?? 0).filter((s) => s > 0)
  const sets = hasWorkoutSets ? raw.sets! : legacySets.length > 0 ? Math.max(...legacySets) : 3

  const exercises: WorkoutExercise[] = raw.exercises.map((e) => {
    const { sets: _s, audioNote: _a, audioNoteText: _t, ...ex } = e
    return ex
  })

  return {
    ...raw,
    sets,
    restBetweenSets: raw.restBetweenSets ?? 60,
    exercises,
  }
}
