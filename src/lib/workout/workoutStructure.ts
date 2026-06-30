import type { WorkoutTemplate } from '@/types/workout'

export type WorkoutStructure = 'strength' | 'circuit'

export function getWorkoutStructure(
  workout: Pick<WorkoutTemplate, 'circuitRounds'>,
): WorkoutStructure {
  return (workout.circuitRounds ?? 1) > 1 ? 'circuit' : 'strength'
}

export function getPhaseInfo(workout: WorkoutTemplate): { label: string; total: number } {
  if (getWorkoutStructure(workout) === 'circuit') {
    return { label: 'Ronde', total: workout.circuitRounds ?? 1 }
  }
  return { label: 'Set', total: workout.sets }
}

export function getPhaseRestSeconds(workout: WorkoutTemplate): number {
  if (getWorkoutStructure(workout) === 'circuit') {
    return workout.restBetweenRounds ?? 0
  }
  return workout.restBetweenSets ?? 0
}

export function structureSummary(workout: WorkoutTemplate): string {
  if (getWorkoutStructure(workout) === 'circuit') {
    const rest = workout.restBetweenRounds ? ` · rust tussen rondes ${workout.restBetweenRounds}s` : ''
    return `${workout.circuitRounds} rondes${rest}`
  }
  return `${workout.sets} sets · rust tussen sets ${workout.restBetweenSets}s`
}

export type WorkoutProgress = {
  phaseLabel: string
  currentPhase: number
  totalPhases: number
  completedInPhase: number
  totalExercises: number
  completedSlots: number
  totalSlots: number
  percent: number
}

/** Progress across all sets/rounds, not just the current phase. */
export function computeWorkoutProgress(
  currentPhase: number,
  totalPhases: number,
  phaseLabel: string,
  completedInPhase: number,
  exerciseCount: number,
): WorkoutProgress {
  const completedSlots = (currentPhase - 1) * exerciseCount + completedInPhase
  const totalSlots = totalPhases * exerciseCount
  const percent =
    totalSlots > 0 ? Math.min(100, Math.round((completedSlots / totalSlots) * 100)) : 0

  return {
    phaseLabel,
    currentPhase,
    totalPhases,
    completedInPhase,
    totalExercises: exerciseCount,
    completedSlots,
    totalSlots,
    percent,
  }
}
