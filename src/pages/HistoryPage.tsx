import { BarChart3, ChevronRight, Clock, Dumbbell, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useHistory } from '@/hooks/useHistory'
import { formatDuration } from '@/lib/workout/sessionSummary'

function formatWhen(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (sameDay) {
    return `Vandaag · ${date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`
  }

  return date.toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function HistoryPage() {
  const navigate = useNavigate()
  const { history, stats, remove, clearAll } = useHistory()

  function handleClearAll() {
    if (!confirm('Alle sessies uit je historie verwijderen?')) return
    clearAll()
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" uit je historie verwijderen?`)) return
    remove(id)
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-surface-2 text-solo-400">
            <BarChart3 className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Historie</h1>
            <p className="text-xs text-muted">
              {stats.totalSessions} sessie{stats.totalSessions !== 1 && 's'} · {stats.totalMinutes} min totaal
            </p>
          </div>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="shrink-0 rounded-lg border border-danger/40 px-2.5 py-1.5 text-xs font-medium text-danger active:bg-danger/10"
          >
            Alles wissen
          </button>
        )}
      </header>

      {history.length === 0 ? (
        <p className="rounded-card border border-dashed border-line p-6 text-center text-sm text-muted">
          Nog geen afgeronde sessies. Rond een workout af om je samenvatting hier te bewaren.
        </p>
      ) : (
        <div className="flex flex-col gap-2 pb-20">
          {history.map((record) => (
            <article
              key={record.id}
              className="flex items-center gap-2 rounded-card border border-line bg-surface p-2"
            >
              <button
                type="button"
                onClick={() => navigate(`/history/${record.id}`)}
                className="flex min-w-0 flex-1 items-center gap-3 p-1 text-left active:bg-surface-2"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-solo-400">
                  <BarChart3 className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{record.workoutName}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{formatWhen(record.completedAt)}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-faint">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatDuration(record.summary.totalDurationSeconds)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell className="size-3" />
                      {record.exerciseCount} oefeningen
                    </span>
                    {record.summary.stats.totalSets > 0 && (
                      <span>{record.summary.stats.totalSets} sets</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="size-5 shrink-0 text-faint" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(record.id, record.workoutName)}
                className="grid size-9 shrink-0 place-items-center rounded-lg text-faint active:bg-danger/10 active:text-danger"
                aria-label={`${record.workoutName} verwijderen`}
              >
                <Trash2 className="size-4" />
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
