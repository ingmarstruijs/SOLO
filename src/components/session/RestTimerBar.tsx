import { cn } from '@/lib/cn'
import { formatRestSeconds, restCountdownLabel, type RestCountdown } from '@/hooks/useRestCountdown'

type RestTimerBarProps = {
  countdown: RestCountdown
  onSkip: () => void
  className?: string
}

export function RestTimerBar({ countdown, onSkip, className }: RestTimerBarProps) {
  if (!countdown.active) return null

  return (
    <section
      className={cn(
        'rounded-card border border-calm/40 bg-calm/10 p-3',
        className,
      )}
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="label-mono text-[10px] text-calm">Rust</p>
          <p className="truncate text-xs text-muted">{restCountdownLabel(countdown)}</p>
        </div>
        <p className="font-mono text-3xl font-bold tabular-nums text-calm">
          {formatRestSeconds(countdown.remaining)}
        </p>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-calm transition-[width] duration-300"
          style={{ width: `${countdown.progress * 100}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
        <span>
          {countdown.remaining} / {countdown.total} seconden
        </span>
        <button
          type="button"
          onClick={onSkip}
          className="font-medium text-solo-400 active:text-solo-300"
        >
          Overslaan
        </button>
      </div>
    </section>
  )
}
