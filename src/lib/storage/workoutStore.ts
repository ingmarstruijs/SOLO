import type { WorkoutExport, WorkoutTemplate } from '@/types/workout'
import { createId, readStore, subscribeStore, writeStore } from './localStore'

const KEY = 'solo-workouts'

const SEED_WORKOUTS: WorkoutTemplate[] = [
  {
    id: 'seed-upper-push',
    name: 'Upper Push',
    description: 'Dumbbell bench, overhead press en triceps — thuisvriendelijk.',
    favorite: true,
    source: 'manual',
    estimatedMinutes: 35,
    tags: ['push', 'upper'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    exercises: [
      {
        id: 'ex-1',
        name: 'Dumbbell Bench Press',
        sets: 4,
        metric: 'reps',
        target: 10,
        weightKg: 20,
        restSeconds: 90,
        equipment: ['dumbbell', 'bench'],
      },
      {
        id: 'ex-2',
        name: 'Overhead Press',
        sets: 3,
        metric: 'reps',
        target: 12,
        weightKg: 14,
        restSeconds: 75,
        equipment: ['dumbbell'],
      },
      {
        id: 'ex-3',
        name: 'Triceps Extension',
        sets: 3,
        metric: 'reps',
        target: 15,
        weightKg: 10,
        restSeconds: 60,
        equipment: ['dumbbell'],
      },
    ],
  },
  {
    id: 'seed-full-body',
    name: 'Full Body Circuit',
    description: 'Korte circuit met kettlebell, band en bodyweight.',
    favorite: false,
    source: 'manual',
    estimatedMinutes: 25,
    tags: ['circuit', 'full-body'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    exercises: [
      {
        id: 'ex-4',
        name: 'Kettlebell Swing',
        sets: 4,
        metric: 'reps',
        target: 15,
        weightKg: 16,
        restSeconds: 45,
        equipment: ['kettlebell'],
      },
      {
        id: 'ex-5',
        name: 'Band Row',
        sets: 3,
        metric: 'reps',
        target: 20,
        weightKg: 0,
        restSeconds: 45,
        equipment: ['resistance_band'],
      },
      {
        id: 'ex-6',
        name: 'Goblet Squat',
        sets: 3,
        metric: 'reps',
        target: 12,
        weightKg: 16,
        restSeconds: 60,
        equipment: ['kettlebell'],
      },
    ],
  },
]

function ensureSeed(): WorkoutTemplate[] {
  const existing = readStore<WorkoutTemplate[]>(KEY, [])
  if (existing.length === 0) {
    writeStore(KEY, SEED_WORKOUTS)
    // Re-read so we return the cached (stable) reference rather than the seed constant.
    return readStore<WorkoutTemplate[]>(KEY, [])
  }
  return existing
}

export function getWorkouts(): WorkoutTemplate[] {
  return ensureSeed()
}

export function getWorkout(id: string): WorkoutTemplate | undefined {
  return getWorkouts().find((w) => w.id === id)
}

export function saveWorkouts(workouts: WorkoutTemplate[]): void {
  writeStore(KEY, workouts)
}

export function addWorkout(
  partial: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>,
): WorkoutTemplate {
  const now = new Date().toISOString()
  const workout: WorkoutTemplate = { ...partial, id: createId(), createdAt: now, updatedAt: now }
  saveWorkouts([...getWorkouts(), workout])
  return workout
}

export function updateWorkout(id: string, patch: Partial<WorkoutTemplate>): WorkoutTemplate | null {
  const workouts = getWorkouts()
  const idx = workouts.findIndex((w) => w.id === id)
  if (idx === -1) return null
  const updated = { ...workouts[idx], ...patch, updatedAt: new Date().toISOString() }
  workouts[idx] = updated
  saveWorkouts(workouts)
  return updated
}

export function removeWorkout(id: string): void {
  saveWorkouts(getWorkouts().filter((w) => w.id !== id))
}

export function toggleFavorite(id: string): void {
  const workout = getWorkout(id)
  if (workout) updateWorkout(id, { favorite: !workout.favorite })
}

export function exportWorkouts(): WorkoutExport {
  return { version: 1, exportedAt: new Date().toISOString(), workouts: getWorkouts() }
}

export function importWorkouts(data: WorkoutExport): number {
  const existing = getWorkouts()
  const merged = [...existing]
  let added = 0
  for (const workout of data.workouts) {
    if (!merged.some((e) => e.id === workout.id)) {
      merged.push(workout)
      added++
    }
  }
  saveWorkouts(merged)
  return added
}

export function subscribeWorkouts(onChange: () => void): () => void {
  return subscribeStore(KEY, onChange)
}
