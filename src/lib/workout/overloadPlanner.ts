import type { LockerItem } from '@/types/locker'
import type { OverloadTarget, WorkoutExercise, WorkoutTemplate } from '@/types/workout'
import { findClosestWeight } from '@/lib/locker/equipmentCatalog'
import { isRecoveryCritical } from '@/lib/storage/recoveryStore'
import { configurePlates } from './plateConfigurator'
const RECOVERY_REDUCTION_MIN = 0.05
const RECOVERY_REDUCTION_MAX = 0.10

function recoveryReductionPercent(score: number): number {
  if (score >= 50) return 0
  const severity = (50 - score) / 50
  return RECOVERY_REDUCTION_MIN + severity * (RECOVERY_REDUCTION_MAX - RECOVERY_REDUCTION_MIN)
}

export function planOverloadTargets(
  workout: WorkoutTemplate,
  lockerItems: LockerItem[],
  recoveryScore: number,
): OverloadTarget[] {
  const critical = isRecoveryCritical(recoveryScore)
  const reduction = recoveryReductionPercent(recoveryScore)

  return workout.exercises.map((ex) => {
    let adjusted = ex.weightKg

    if (ex.weightKg > 0 && ex.equipment.length > 0) {
      const primary = ex.equipment[0]
      const closest = findClosestWeight(lockerItems, primary, ex.weightKg)
      if (closest != null) adjusted = closest
    }

    if (critical && adjusted > 0) {
      adjusted = Math.round(adjusted * (1 - reduction) * 2) / 2
    }

    const adjustmentPercent =
      ex.weightKg > 0 ? Math.round(((adjusted - ex.weightKg) / ex.weightKg) * 100) : 0

    const reasons: string[] = []
    if (critical) reasons.push(`Recovery ${recoveryScore}% — gewicht −${Math.round(reduction * 100)}%`)
    if (adjusted !== ex.weightKg && !critical) reasons.push('Aangepast aan locker inventaris')

    return {
      exerciseId: ex.id,
      originalWeightKg: ex.weightKg,
      adjustedWeightKg: adjusted,
      adjustmentPercent,
      reason: reasons.join(' · ') || undefined,
      plateConfig:
        adjusted > 0 ? configurePlates(adjusted, lockerItems, ex.equipment) : undefined,
    }  })
}

export function estimateExerciseMinutes(ex: WorkoutExercise): number {
  const workSeconds = ex.metric === 'time' ? ex.target * ex.sets : ex.sets * ex.target * 3
  const restSeconds = ex.restSeconds * Math.max(0, ex.sets - 1)
  return Math.ceil((workSeconds + restSeconds) / 60)
}

export function recalcWorkoutDuration(exercises: WorkoutExercise[]): number {
  return exercises.reduce((sum, ex) => sum + estimateExerciseMinutes(ex), 0)
}
