import { Boxes, ChevronDown, Heart, Info, Scale, X } from 'lucide-react'
import { useState } from 'react'
import type { OverloadTarget, WorkoutTemplate } from '@/types/workout'
import { isRecoveryCritical } from '@/lib/storage/recoveryStore'
import { WeightAssistant } from './WeightAssistant'
import { cn } from '@/lib/cn'

type PrepInsightsPanelProps = {
  recoveryScore: number
  lockerCount: number
  workout: WorkoutTemplate
  targets: OverloadTarget[]
  showRecoverySummary?: boolean
}

export function PrepInsightsPanel({
  recoveryScore,
  lockerCount,
  workout,
  targets,
  showRecoverySummary = true,
}: PrepInsightsPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [weightFor, setWeightFor] = useState<string | null>(null)
  const critical = isRecoveryCritical(recoveryScore)
  const adjustedCount = targets.filter((t) => t.adjustedWeightKg !== t.originalWeightKg).length

  const weightTarget = weightFor
    ? targets.find((t) => t.exerciseId === weightFor)
    : null
  const weightExercise = weightFor
    ? workout.exercises.find((e) => e.id === weightFor)
    : null

  return (
    <>
      <section className="rounded-card border border-line bg-surface">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center gap-3 p-3 text-left active:bg-surface-2"
        >
          <Heart className={cn('size-4 shrink-0', critical ? 'text-warn' : 'text-success')} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {showRecoverySummary ? 'Recovery & Overload' : 'Overload planner'}
            </p>
            <p className="truncate text-xs text-muted">
              {showRecoverySummary && `${recoveryScore}% recovery`}
              {showRecoverySummary && adjustedCount > 0 && ' · '}
              {adjustedCount > 0 && `${adjustedCount} gewichten aangepast`}
              {!showRecoverySummary && adjustedCount === 0 && 'Geen aanpassingen'}
            </p>
          </div>
          <ChevronDown
            className={cn('size-4 shrink-0 text-faint transition-transform', expanded && 'rotate-180')}
          />
        </button>

        {expanded && (
          <div className="border-t border-line px-3 pb-3 pt-2">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 size-3.5 shrink-0 text-solo-400" />
              <p className="text-xs leading-relaxed text-muted">
                Doelgewichten op basis van je locker en recovery. Bij lage recovery worden zware
                targets 5–10% verlaagd.
              </p>
            </div>
            {critical && (
              <p className="mt-2 text-xs text-warn">
                Recovery kritiek — gewichten verlaagd met 5–10%
              </p>
            )}
            <div className="mt-2 flex items-center gap-2 text-xs text-muted">
              <Boxes className="size-3.5 text-solo-400" />
              {lockerCount} items in locker
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {workout.exercises.map((ex) => {
                const target = targets.find((t) => t.exerciseId === ex.id)
                if (!target) return null
                const changed = target.adjustedWeightKg !== target.originalWeightKg
                return (
                  <li
                    key={ex.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface-2 px-2.5 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{ex.name}</p>
                      <p className="text-[10px] text-muted">
                        {target.adjustedWeightKg > 0 ? `${target.adjustedWeightKg} kg` : 'BW'}
                        {changed && target.reason && ` · ${target.reason}`}
                      </p>
                    </div>
                    {target.plateConfig && target.adjustedWeightKg > 0 && (
                      <button
                        type="button"
                        onClick={() => setWeightFor(ex.id)}
                        className="grid size-8 shrink-0 place-items-center rounded-lg border border-line text-solo-400 active:bg-surface"
                        aria-label={`Gewichten voor ${ex.name}`}
                      >
                        <Scale className="size-3.5" />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </section>

      {weightTarget?.plateConfig && weightExercise && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-4"
          onClick={() => setWeightFor(null)}
          role="presentation"
        >
          <div
            className="w-full max-w-lg rounded-card border border-line bg-surface p-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Weight Assistant"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">{weightExercise.name}</h3>
              <button
                type="button"
                onClick={() => setWeightFor(null)}
                className="text-muted active:text-fg"
              >
                <X className="size-5" />
              </button>
            </div>
            <WeightAssistant exerciseName={weightExercise.name} config={weightTarget.plateConfig} />
          </div>
        </div>
      )}
    </>
  )
}
