import { Plus } from 'lucide-react'
import { useState } from 'react'
import type { WorkoutExercise, WorkoutTemplate } from '@/types/workout'
import { createId } from '@/lib/storage/localStore'
import { recalcWorkoutDuration } from '@/lib/workout/overloadPlanner'
import { LabActionButton } from '@/components/lab/LabPrimitives'
import { ExerciseBlock } from './ExerciseBlock'

type WorkoutBuilderProps = {
  initial?: WorkoutTemplate
  onSave: (data: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export function WorkoutBuilder({ initial, onSave, onCancel }: WorkoutBuilderProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [exercises, setExercises] = useState<WorkoutExercise[]>(
    initial?.exercises ?? [emptyExercise()],
  )

  function updateExercise(idx: number, ex: WorkoutExercise) {
    setExercises((prev) => prev.map((e, i) => (i === idx ? ex : e)))
  }

  function removeExercise(idx: number) {
    setExercises((prev) => prev.filter((_, i) => i !== idx))
  }

  function addExercise() {
    setExercises((prev) => [...prev, emptyExercise()])
  }

  function handleSave() {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      exercises,
      favorite: initial?.favorite ?? false,
      source: initial?.source ?? 'manual',
      estimatedMinutes: recalcWorkoutDuration(exercises),
      tags: initial?.tags ?? [],
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="label-mono text-faint">Workout naam</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bijv. Upper Push"
          className={inputClass}
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="label-mono text-faint">Beschrijving</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={inputClass}
          placeholder="Optioneel"
        />
      </label>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold">Oefeningen</p>
        {exercises.map((ex, i) => (
          <ExerciseBlock
            key={ex.id}
            exercise={ex}
            index={i}
            onChange={(updated) => updateExercise(i, updated)}
            onRemove={() => removeExercise(i)}
          />
        ))}
        <button
          type="button"
          onClick={addExercise}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-line py-3 text-sm text-muted active:bg-surface-2"
        >
          <Plus className="size-4" />
          Oefening toevoegen
        </button>
      </div>

      <div className="flex gap-2">
        <LabActionButton variant="secondary" onClick={onCancel}>
          Annuleren
        </LabActionButton>
        <LabActionButton variant="primary" onClick={handleSave}>
          Opslaan
        </LabActionButton>
      </div>
    </div>
  )
}

function emptyExercise(): WorkoutExercise {
  return {
    id: createId(),
    name: '',
    sets: 3,
    metric: 'reps',
    target: 10,
    weightKg: 0,
    restSeconds: 60,
    equipment: [],
  }
}

const inputClass =
  'w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm text-fg outline-none focus:border-solo-400/50'
