import { formatRestSeconds, restCountdownLabel, useRestCountdown } from '@/hooks/useRestCountdown'
import type { TvRestState } from '@/lib/tv/broadcast'

export function TvRestTimer({ rest }: { rest: TvRestState | null | undefined }) {
  const timer =
    rest?.active && rest.endsAt
      ? {
          id: 'tv-rest',
          endsAt: new Date(rest.endsAt).getTime(),
          totalSeconds: rest.totalSeconds,
          afterExerciseName: rest.afterExerciseName ?? '',
          kind: rest.kind ?? 'exercise',
          phaseLabel: rest.phaseLabel,
        }
      : null

  const countdown = useRestCountdown(timer)
  if (!countdown.active) return null

  return (
    <section className="shrink-0 rounded-[1.5vh] border border-calm/40 bg-calm/10 p-[2vh]">
      <div className="flex items-center justify-between gap-[2vh]">
        <div>
          <p className="label-mono text-[1.2vh] text-calm">RUST</p>
          {countdown.afterExerciseName && (
            <p className="mt-[0.5vh] text-[1.6vh] text-muted">{restCountdownLabel(countdown)}</p>
          )}
        </div>
        <p className="font-mono text-[6vh] font-bold leading-none tabular-nums text-calm">
          {formatRestSeconds(countdown.remaining)}
        </p>
      </div>
      <div className="mt-[1.5vh] h-[1vh] overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-calm transition-[width] duration-300"
          style={{ width: `${countdown.progress * 100}%` }}
        />
      </div>
      <p className="mt-[1vh] text-[1.4vh] text-muted">
        {countdown.remaining} / {countdown.total} seconden
      </p>
    </section>
  )
}
