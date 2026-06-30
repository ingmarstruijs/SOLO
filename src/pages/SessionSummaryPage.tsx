import { ChevronRight } from 'lucide-react'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { WorkoutSummary } from '@/components/session/WorkoutSummary'
import { useHistory } from '@/hooks/useHistory'
import { useSessionActions } from '@/hooks/useSessionActions'
import { useTheme } from '@/hooks/useTheme'
import { getSessionRecord } from '@/lib/storage/historyStore'
import { buildSummaryTvState } from '@/lib/tv/broadcast'
import { publishToTvTransport, publishTvIdle } from '@/lib/tv/transport'
import { loadWorkoutQueue, popNextQueuedWorkout } from '@/lib/workout/sessionPrep'
import {
  clearLastSummary,
  loadLastSummary,
  normalizeSummary,
  type SessionSummary,
} from '@/lib/workout/sessionSummary'

type SummaryLocationState = {
  summary?: SessionSummary
  hasNextWorkout?: boolean
}

export function SessionSummaryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sessionId } = useParams<{ sessionId?: string }>()
  const { theme } = useTheme()
  const { startNextWorkout } = useSessionActions()
  const { remove: removeHistory } = useHistory()
  const isHistoryView = Boolean(sessionId)

  const state = location.state as SummaryLocationState | null
  const stored = loadLastSummary()
  const historyRecord = sessionId ? getSessionRecord(sessionId) : undefined
  const summary = isHistoryView
    ? historyRecord
      ? normalizeSummary(historyRecord.summary)
      : undefined
    : state?.summary
      ? normalizeSummary(state.summary)
      : stored?.summary
  const hasNextWorkout =
    !isHistoryView &&
    (state?.hasNextWorkout ?? stored?.hasNextWorkout ?? loadWorkoutQueue().length > 0)

  useEffect(() => {
    if (!summary || isHistoryView) return
    publishToTvTransport(buildSummaryTvState(summary, theme), { theme })
  }, [summary, theme, isHistoryView])

  function leaveSummary() {
    clearLastSummary()
    publishTvIdle(theme)
  }

  function handleDeleteHistory() {
    if (!sessionId || !historyRecord) return
    if (!confirm(`"${historyRecord.workoutName}" uit je historie verwijderen?`)) return
    removeHistory(sessionId)
    navigate('/history')
  }

  function handleDone() {
    if (isHistoryView) {
      navigate('/history')
      return
    }
    leaveSummary()
    navigate('/workouts')
  }

  function handleNextWorkout() {
    const next = popNextQueuedWorkout()
    if (!next) {
      handleDone()
      return
    }
    clearLastSummary()
    startNextWorkout(next)
    navigate('/session')
  }

  if (!summary) {
    return (
      <section className="flex flex-col gap-4 py-2">
        <h1 className="text-xl font-bold">
          {isHistoryView ? 'Sessie niet gevonden' : 'Geen samenvatting'}
        </h1>
        <p className="text-sm text-muted">
          {isHistoryView
            ? 'Deze sessie staat niet meer in je historie.'
            : 'Rond eerst een workout af om het overzicht te zien.'}
        </p>
        <button
          type="button"
          onClick={() => navigate(isHistoryView ? '/history' : '/workouts')}
          className="rounded-xl bg-solo-400 py-3 text-sm font-semibold text-ink"
        >
          {isHistoryView ? 'Terug naar historie' : 'Naar workouts'}
        </button>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-5 py-2">
      <header className="shrink-0">
        <p className="label-mono text-success">● Klaar</p>
        <h1 className="text-xl font-bold">Samenvatting</h1>
        {isHistoryView && historyRecord && (
          <p className="mt-1 text-xs text-muted">
            {new Date(historyRecord.completedAt).toLocaleString('nl-NL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pb-2">
        <WorkoutSummary summary={summary} />
      </div>

      <div className="flex shrink-0 flex-col gap-2">
        {!isHistoryView && hasNextWorkout && (
          <button
            type="button"
            onClick={handleNextWorkout}
            className="flex items-center justify-center gap-2 rounded-xl bg-solo-400 py-3.5 text-sm font-bold text-ink active:bg-solo-500"
          >
            Volgende workout
            <ChevronRight className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={handleDone}
          className="rounded-xl border border-line py-3 text-sm font-semibold text-fg active:bg-surface-2"
        >
          {isHistoryView
            ? 'Terug naar historie'
            : hasNextWorkout
              ? 'Stoppen'
              : 'Terug naar workouts'}
        </button>
        {isHistoryView && (
          <button
            type="button"
            onClick={handleDeleteHistory}
            className="rounded-xl border border-danger/40 bg-danger/10 py-3 text-sm font-semibold text-danger active:bg-danger/20"
          >
            Verwijderen uit historie
          </button>
        )}
      </div>
    </section>
  )
}
