import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { getWorkout } from '@/lib/storage/workoutStore'
import { useWorkouts } from '@/hooks/useWorkouts'
import { WorkoutBuilder } from '@/components/workout/WorkoutBuilder'

export function WorkoutEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { add, update } = useWorkouts()
  const isNew = id === 'new'
  const existing = isNew ? undefined : getWorkout(id!)

  if (!isNew && !existing) {
    return (
      <div className="py-8 text-center text-muted">
        Workout niet gevonden.
        <button type="button" onClick={() => navigate('/workouts')} className="mt-4 block w-full text-solo-400">
          Terug
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      <button
        type="button"
        onClick={() => navigate('/workouts')}
        className="flex items-center gap-2 text-sm text-muted active:text-fg"
      >
        <ArrowLeft className="size-4" />
        Terug naar workouts
      </button>

      <h1 className="text-xl font-bold">{isNew ? 'Nieuwe workout' : 'Workout bewerken'}</h1>

      <WorkoutBuilder
        initial={existing}
        onSave={(data) => {
          if (isNew) {
            add(data)
          } else {
            update(id!, data)
          }
          navigate('/workouts')
        }}
        onCancel={() => navigate('/workouts')}
      />
    </div>
  )
}
