import { Clock, Dumbbell, Star } from 'lucide-react'
import type { WorkoutTemplate } from '@/types/workout'
import { getWorkoutEquipment } from '@/lib/workout/filters'
import { EquipmentIcon } from '@/components/locker/EquipmentIcon'
import { cn } from '@/lib/cn'

type WorkoutCardProps = {
  workout: WorkoutTemplate
  selected?: boolean
  onSelect: (workout: WorkoutTemplate) => void
  onToggleFavorite: (id: string) => void
  onEdit: (id: string) => void
}

export function WorkoutCard({
  workout,
  selected,
  onSelect,
  onToggleFavorite,
  onEdit,
}: WorkoutCardProps) {
  const equipment = getWorkoutEquipment(workout)

  return (
    <article
      className={cn(
        'rounded-card border bg-surface p-4 transition-colors',
        selected ? 'border-solo-400 bg-solo-400/5' : 'border-line',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={() => onSelect(workout)} className="min-w-0 flex-1 text-left">
          <p className="font-semibold">{workout.name}</p>
          {workout.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted">{workout.description}</p>
          )}
        </button>
        <button
          type="button"
          onClick={() => onToggleFavorite(workout.id)}
          className="shrink-0 p-1"
          aria-label={workout.favorite ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
        >
          <Star
            className={cn('size-5', workout.favorite ? 'fill-warn text-warn' : 'text-faint')}
          />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {workout.estimatedMinutes} min
        </span>
        <span className="flex items-center gap-1">
          <Dumbbell className="size-3.5" />
          {workout.exercises.length} oefeningen
        </span>
        {workout.source !== 'manual' && (
          <span className="label-mono text-faint">{workout.source}</span>
        )}
      </div>

      {equipment.length > 0 && (
        <div className="mt-3 flex gap-1.5">
          {equipment.map((cat) => (
            <span key={cat} className="grid size-8 place-items-center rounded-lg bg-surface-2" title={cat}>
              <EquipmentIcon category={cat} size={20} />
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onEdit(workout.id)}
        className="label-mono mt-3 text-[10px] text-solo-400 active:opacity-70"
      >
        Bewerken →
      </button>
    </article>
  )
}
