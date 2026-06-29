import { Loader2, Search, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { WgerExerciseInfo } from '@/types/wger'
import { searchExercises, exerciseDisplayName, stripHtml } from '@/lib/wger/client'
import {
  buildWorkoutFromWgerExercises,
  wgerExerciseToWorkoutExercise,
} from '@/lib/wger/importExercise'
import { mapWgerEquipment } from '@/lib/wger/mapEquipment'
import { LabActionButton } from '@/components/lab/LabPrimitives'
import { cn } from '@/lib/cn'

type WgerBrowserProps = {
  open: boolean
  onClose: () => void
  onImportWorkout: (workout: ReturnType<typeof buildWorkoutFromWgerExercises>) => void
}

export function WgerBrowser({ open, onClose, onImportWorkout }: WgerBrowserProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<WgerExerciseInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const search = useCallback(async (q: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await searchExercises(q)
      setResults(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Wger API niet bereikbaar')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => search(query), 350)
    return () => clearTimeout(timer)
  }, [query, open, search])

  useEffect(() => {
    if (open && results.length === 0 && !query) search('')
  }, [open, query, results.length, search])

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleImportSelected() {
    const exercises = results
      .filter((r) => selected.has(r.id))
      .map((r) => wgerExerciseToWorkoutExercise(r))

    if (exercises.length === 0) return

    const name =
      exercises.length === 1
        ? exercises[0].name
        : `Wger workout (${exercises.length} oefeningen)`

    onImportWorkout(buildWorkoutFromWgerExercises(name, exercises))
    setSelected(new Set())
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/80 sm:items-center">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Sluiten" />
      <div className="relative z-10 flex max-h-[90dvh] w-full max-w-screen-sm flex-col rounded-t-card border border-line bg-surface sm:rounded-card">
        <header className="flex items-center justify-between border-b border-line p-4">
          <div>
            <p className="label-mono text-faint">Open-source</p>
            <h2 className="text-lg font-bold">Wger database</h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg text-muted active:bg-surface-2">
            <X className="size-5" />
          </button>
        </header>

        <div className="border-b border-line p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Zoek oefeningen…"
              className="w-full rounded-xl border border-line bg-surface-2 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-solo-400/50"
              autoFocus
            />
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto p-2">
          {loading && (
            <li className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
              <Loader2 className="size-4 animate-spin" />
              Laden…
            </li>
          )}
          {error && (
            <li className="p-4 text-center text-sm text-danger">{error}</li>
          )}
          {!loading && !error && results.length === 0 && (
            <li className="p-4 text-center text-sm text-muted">Geen oefeningen gevonden.</li>
          )}
          {results.map((info) => {
            const name = exerciseDisplayName(info)
            const desc = stripHtml(info.translations[0]?.description ?? '').slice(0, 100)
            const equipment = mapWgerEquipment(info.equipment)
            const isSelected = selected.has(info.id)

            return (
              <li key={info.id}>
                <button
                  type="button"
                  onClick={() => toggleSelect(info.id)}
                  className={cn(
                    'w-full rounded-xl border p-3 text-left transition-colors active:bg-surface-2',
                    isSelected ? 'border-solo-400/50 bg-solo-400/5' : 'border-transparent',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'mt-0.5 grid size-5 shrink-0 place-items-center rounded border',
                        isSelected ? 'border-solo-400 bg-solo-400 text-ink' : 'border-line',
                      )}
                    >
                      {isSelected && '✓'}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold">{name}</p>
                      <p className="text-xs text-muted">{info.category.name}</p>
                      {desc && <p className="mt-1 line-clamp-2 text-xs text-faint">{desc}</p>}
                      {equipment.length > 0 && (
                        <p className="label-mono mt-1 text-[9px] text-faint">
                          {equipment.join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>

        <footer className="border-t border-line p-4">
          <LabActionButton
            variant="primary"
            onClick={handleImportSelected}
            disabled={selected.size === 0}
            className="w-full"
          >
            Importeer {selected.size > 0 ? `${selected.size} oefening(en)` : 'selectie'} als workout
          </LabActionButton>
        </footer>
      </div>
    </div>
  )
}
