import { Dumbbell } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { WorkoutFilters, WorkoutTemplate } from '@/types/workout'
import { filterWorkouts } from '@/lib/workout/filters'
import { parseFitFile } from '@/lib/workout/fitImport'
import { planOverloadTargets } from '@/lib/workout/overloadPlanner'
import { useLocker } from '@/hooks/useLocker'
import { useRecoveryScore } from '@/hooks/useRecoveryScore'
import { useWorkouts } from '@/hooks/useWorkouts'
import { WorkoutPrepFlow } from '@/components/workout/WorkoutPrepFlow'
import { WgerBrowser } from '@/components/workout/WgerBrowser'
import { WorkoutCard } from '@/components/workout/WorkoutCard'
import { WorkoutFiltersPanel } from '@/components/workout/WorkoutFiltersPanel'
import { WorkoutToolbar } from '@/components/workout/WorkoutToolbar'

const DEFAULT_FILTERS: WorkoutFilters = {
  lockerOnly: false,
  favoritesOnly: false,
  minRecovery: 50,
}

export function WorkoutsPage() {
  const navigate = useNavigate()
  const { workouts, add, toggleFav, exportData, importData } = useWorkouts()
  const { items: lockerItems } = useLocker()
  const { score: recoveryScore } = useRecoveryScore()
  const [filters, setFilters] = useState<WorkoutFilters>(DEFAULT_FILTERS)
  const [selected, setSelected] = useState<WorkoutTemplate | null>(null)
  const [multiSelect, setMultiSelect] = useState<Set<string>>(new Set())
  const [wgerOpen, setWgerOpen] = useState(false)

  const filtered = useMemo(
    () => filterWorkouts(workouts, filters, lockerItems, recoveryScore),
    [workouts, filters, lockerItems, recoveryScore],
  )

  const targets = useMemo(
    () => (selected ? planOverloadTargets(selected, lockerItems, recoveryScore) : []),
    [selected, lockerItems, recoveryScore],
  )

  function handleExport() {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `solo-workouts-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFitImport(buffer: ArrayBuffer) {
    const { workout, warnings, fileType } = parseFitFile(buffer)
    add(workout)
    alert(`FIT ${fileType} "${workout.name}" geïmporteerd.\n\n${warnings.join('\n')}`)
  }

  function toggleMulti(id: string) {
    setMultiSelect((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSelect(workout: WorkoutTemplate) {
    setSelected(workout)
  }

  function handleStartSession() {
    if (!selected) return
    sessionStorage.setItem('solo-active-workout', JSON.stringify(selected))
    sessionStorage.setItem('solo-overload-targets', JSON.stringify(targets))
    navigate('/session')
  }

  return (
    <div className="flex flex-col gap-5 py-2">
      <header className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-surface-2 text-solo-400">
          <Dumbbell className="size-6" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Workouts</h1>
          <p className="text-xs text-muted">
            {filtered.length} van {workouts.length} · selecteer en train
          </p>
        </div>
      </header>

      <WorkoutToolbar
        onNew={() => navigate('/workouts/new')}
        onExport={handleExport}
        onImportJson={importData}
        onImportFit={handleFitImport}
        onBrowseWger={() => setWgerOpen(true)}
      />

      <WorkoutFiltersPanel
        filters={filters}
        recoveryScore={recoveryScore}
        onChange={setFilters}
      />

      {multiSelect.size > 0 && (
        <p className="label-mono text-solo-300">
          {multiSelect.size} workout(s) geselecteerd voor multi-training
        </p>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((workout) => (
          <div key={workout.id} className="flex gap-2">
            <input
              type="checkbox"
              checked={multiSelect.has(workout.id)}
              onChange={() => toggleMulti(workout.id)}
              className="mt-5 size-4 shrink-0 accent-solo-400"
              aria-label={`Selecteer ${workout.name}`}
            />
            <div className="min-w-0 flex-1">
              <WorkoutCard
                workout={workout}
                selected={selected?.id === workout.id}
                onSelect={handleSelect}
                onToggleFavorite={toggleFav}
                onEdit={(id) => navigate(`/workouts/${id}/edit`)}
              />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="rounded-card border border-dashed border-line p-6 text-center text-sm text-muted">
            Geen workouts gevonden met deze filters. Pas filters aan of maak een nieuwe workout.
          </p>
        )}
      </div>

      {selected && (
        <WorkoutPrepFlow
          workout={selected}
          recoveryScore={recoveryScore}
          targets={targets}
          onStartSession={handleStartSession}
        />
      )}

      <WgerBrowser
        open={wgerOpen}
        onClose={() => setWgerOpen(false)}
        onImportWorkout={(workout) => {
          add(workout)
        }}
      />
    </div>
  )
}
