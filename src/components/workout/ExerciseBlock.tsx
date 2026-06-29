import { GripVertical, Mic, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import type { EquipmentCategory } from '@/types/locker'
import type { SetMetric, WorkoutExercise } from '@/types/workout'
import { EQUIPMENT_CATALOG } from '@/lib/locker/equipmentCatalog'
import { cn } from '@/lib/cn'

type ExerciseBlockProps = {
  exercise: WorkoutExercise
  index: number
  onChange: (exercise: WorkoutExercise) => void
  onRemove: () => void
}

export function ExerciseBlock({ exercise, index, onChange, onRemove }: ExerciseBlockProps) {
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  function patch(partial: Partial<WorkoutExercise>) {
    onChange({ ...exercise, ...partial })
  }

  function toggleEquipment(cat: EquipmentCategory) {
    const has = exercise.equipment.includes(cat)
    patch({
      equipment: has
        ? exercise.equipment.filter((c) => c !== cat)
        : [...exercise.equipment, cat],
    })
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        patch({ audioNote: URL.createObjectURL(blob) })
        stream.getTracks().forEach((t) => t.stop())
      }
      recorder.start()
      mediaRef.current = recorder
    } catch {
      const text = prompt('Microfoon niet beschikbaar. Typ je notitie:')
      if (text) patch({ audioNoteText: text })
    }
  }

  function stopRecording() {
    mediaRef.current?.stop()
    mediaRef.current = null
  }

  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <GripVertical className="size-4 text-faint" />
        <span className="label-mono text-faint">#{index + 1}</span>
        <input
          value={exercise.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Oefening"
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
        />
        <button type="button" onClick={onRemove} className="text-danger active:opacity-70">
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MiniField label="Sets">
          <input
            type="number"
            min={1}
            value={exercise.sets}
            onChange={(e) => patch({ sets: parseInt(e.target.value) || 1 })}
            className={inputClass}
          />
        </MiniField>
        <MiniField label="Type">
          <select
            value={exercise.metric}
            onChange={(e) => patch({ metric: e.target.value as SetMetric })}
            className={inputClass}
          >
            <option value="reps">Reps</option>
            <option value="time">Tijd (s)</option>
            <option value="distance">Afstand (m)</option>
          </select>
        </MiniField>
        <MiniField label="Doel">
          <input
            type="number"
            min={1}
            value={exercise.target}
            onChange={(e) => patch({ target: parseInt(e.target.value) || 1 })}
            className={inputClass}
          />
        </MiniField>
        <MiniField label="Gewicht (kg)">
          <input
            type="number"
            step="0.5"
            min={0}
            value={exercise.weightKg}
            onChange={(e) => patch({ weightKg: parseFloat(e.target.value) || 0 })}
            className={inputClass}
          />
        </MiniField>
        <MiniField label="Rust (s)">
          <input
            type="number"
            min={0}
            value={exercise.restSeconds}
            onChange={(e) => patch({ restSeconds: parseInt(e.target.value) || 0 })}
            className={inputClass}
          />
        </MiniField>
      </div>

      <div className="mt-3">
        <p className="label-mono mb-1.5 text-faint">Materiaal</p>
        <div className="flex flex-wrap gap-1.5">
          {EQUIPMENT_CATALOG.filter((e) => e.category !== 'other').map((e) => (
            <button
              key={e.category}
              type="button"
              onClick={() => toggleEquipment(e.category)}
              className={cn(
                'rounded-lg border px-2 py-1 text-[10px]',
                exercise.equipment.includes(e.category)
                  ? 'border-solo-400/50 bg-solo-400/10 text-solo-300'
                  : 'border-line text-faint',
              )}
            >
              {e.labelNl}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-muted active:bg-surface-2"
        >
          <Mic className="size-3.5" />
          {exercise.audioNote || exercise.audioNoteText ? 'Notitie ✓' : 'Audio notitie'}
        </button>
        {exercise.audioNote && (
          <audio src={exercise.audioNote} controls className="h-8 max-w-[140px]" />
        )}
        {exercise.audioNoteText && (
          <span className="text-xs text-muted italic">"{exercise.audioNoteText}"</span>
        )}
      </div>
    </div>
  )
}

function MiniField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="label-mono text-[9px] text-faint">{label}</span>
      {children}
    </label>
  )
}

const inputClass =
  'w-full rounded-lg border border-line bg-surface-2 px-2 py-1.5 text-sm outline-none focus:border-solo-400/50'
