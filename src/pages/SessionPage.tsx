import { Play } from 'lucide-react'
import { useMemo } from 'react'
import type { OverloadTarget, WorkoutTemplate } from '@/types/workout'
import { useRecoveryScore } from '@/hooks/useRecoveryScore'
import { WeightAssistant } from '@/components/workout/WeightAssistant'

export function SessionPage() {
  const { score: recoveryScore } = useRecoveryScore()

  const workout = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('solo-active-workout')
      return raw ? (JSON.parse(raw) as WorkoutTemplate) : null
    } catch {
      return null
    }
  }, [])

  const targets = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('solo-overload-targets')
      return raw ? (JSON.parse(raw) as OverloadTarget[]) : []
    } catch {
      return []
    }
  }, [])

  if (!workout) {
    return (
      <section className="flex flex-col gap-5 py-2">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-surface-2 text-solo-400">
            <Play className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Sessie</h1>
            <p className="text-xs text-muted">Geen actieve workout</p>
          </div>
        </div>
        <p className="text-sm text-muted">
          Selecteer eerst een workout op de Workouts-pagina en start via Workout Prep.
        </p>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-5 py-2">
      <header>
        <p className="label-mono text-faint">Actieve sessie</p>
        <h1 className="text-xl font-bold">{workout.name}</h1>
        <p className="text-xs text-muted">
          Recovery {recoveryScore}% · {workout.exercises.length} oefeningen · {workout.estimatedMinutes} min
        </p>
      </header>

      <ol className="flex flex-col gap-3">
        {workout.exercises.map((ex, i) => {
          const target = targets.find((t) => t.exerciseId === ex.id)
          const weight = target?.adjustedWeightKg ?? ex.weightKg
          return (
            <li key={ex.id} className="rounded-card border border-line bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="label-mono text-faint">Set {i + 1}</span>
                <span className="text-xs text-muted">
                  {ex.sets}× {ex.target} {metricLabel(ex.metric)}
                  {weight > 0 && ` · ${weight} kg`}
                </span>
              </div>
              <p className="mt-1 font-semibold">{ex.name}</p>
              {target?.reason && (
                <p className="mt-1 text-xs text-warn">{target.reason}</p>
              )}
              {ex.audioNote && (
                <audio src={ex.audioNote} controls className="mt-2 h-8 w-full" />
              )}
              {ex.audioNoteText && (
                <p className="mt-1 text-xs italic text-muted">"{ex.audioNoteText}"</p>
              )}
              {target?.plateConfig && weight > 0 && (
                <div className="mt-3">
                  <WeightAssistant exerciseName={ex.name} config={target.plateConfig} />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function metricLabel(metric: string): string {
  if (metric === 'time') return 'sec'
  if (metric === 'distance') return 'm'
  return 'reps'
}
