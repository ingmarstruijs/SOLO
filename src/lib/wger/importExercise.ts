import type { EquipmentCategory } from '@/types/locker'
import type { WorkoutExercise } from '@/types/workout'
import type { WgerExerciseInfo } from '@/types/wger'
import { createId } from '@/lib/storage/localStore'
import { recalcWorkoutDuration } from '@/lib/workout/overloadPlanner'
import type { WorkoutTemplate } from '@/types/workout'
import { exerciseDisplayName, stripHtml } from './client'
import { mapWgerEquipment } from './mapEquipment'

export function wgerExerciseToWorkoutExercise(
  info: WgerExerciseInfo,
  language?: number,
): WorkoutExercise {
  const equipment = mapWgerEquipment(info.equipment)
  return {
    id: createId(),
    name: exerciseDisplayName(info, language),
    externalId: String(info.id),
    sets: 3,
    metric: 'reps',
    target: 10,
    weightKg: guessDefaultWeight(equipment),
    restSeconds: 75,
    equipment,
    notes: stripHtml(
      info.translations.find((t) => t.language === (language ?? 6))?.description ??
        info.translations[0]?.description ??
        '',
    ).slice(0, 200) || undefined,
  }
}

function guessDefaultWeight(equipment: EquipmentCategory[]): number {
  if (equipment.includes('barbell')) return 40
  if (equipment.includes('dumbbell')) return 14
  if (equipment.includes('kettlebell')) return 16
  return 0
}

export function buildWorkoutFromWgerExercises(
  name: string,
  exercises: WorkoutExercise[],
): Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name,
    description: 'Geïmporteerd uit Wger open-source database',
    exercises,
    favorite: false,
    source: 'wger',
    estimatedMinutes: recalcWorkoutDuration(exercises),
    tags: ['wger', 'imported'],
  }
}
