import type { LockerItem } from '@/types/locker'
import type { WorkoutFilters, WorkoutTemplate } from '@/types/workout'
import { filterWorkouts } from '@/lib/workout/filters'
import { isRecoveryCritical } from '@/lib/storage/recoveryStore'

export function suggestWorkout(
  workouts: WorkoutTemplate[],
  lockerItems: LockerItem[],
  recoveryScore: number,
): WorkoutTemplate | null {
  if (workouts.length === 0) return null

  const filters: WorkoutFilters = {
    lockerOnly: true,
    favoritesOnly: false,
    minRecovery: 50,
  }

  const critical = isRecoveryCritical(recoveryScore)
  const eligible = filterWorkouts(workouts, filters, lockerItems, recoveryScore)

  const pool = eligible.length > 0 ? eligible : workouts
  const favorites = pool.filter((w) => w.favorite)
  const candidates = favorites.length > 0 ? favorites : pool

  if (critical) {
    return (
      candidates
        .filter((w) => !w.exercises.some((e) => e.weightKg >= 20))
        .sort((a, b) => a.estimatedMinutes - b.estimatedMinutes)[0] ?? candidates[0]
    )
  }

  return candidates.sort((a, b) => a.estimatedMinutes - b.estimatedMinutes)[0] ?? null
}
