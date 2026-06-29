import type { LockerItem } from '@/types/locker'
import type { WorkoutFilters, WorkoutTemplate } from '@/types/workout'
import { getAvailableCategories, lockerCoversEquipment } from '@/lib/locker/equipmentCatalog'
import { isRecoveryCritical } from '@/lib/storage/recoveryStore'

export function filterWorkouts(
  workouts: WorkoutTemplate[],
  filters: WorkoutFilters,
  lockerItems: LockerItem[],
  recoveryScore: number,
): WorkoutTemplate[] {
  const lockerCats = getAvailableCategories(lockerItems)

  return workouts.filter((w) => {
    if (filters.favoritesOnly && !w.favorite) return false
    if (filters.maxMinutes != null && w.estimatedMinutes > filters.maxMinutes) return false

    if (filters.lockerOnly) {
      const allEquipment = w.exercises.flatMap((e) => e.equipment)
      if (!lockerCoversEquipment(allEquipment, lockerCats)) return false
    }

    if (isRecoveryCritical(recoveryScore) && filters.minRecovery > recoveryScore) {
      const hasHeavy = w.exercises.some((e) => e.weightKg >= 20)
      if (hasHeavy) return false
    }

    return true
  })
}

export function getWorkoutEquipment(workout: WorkoutTemplate) {
  const cats = new Set(workout.exercises.flatMap((e) => e.equipment))
  return [...cats]
}
