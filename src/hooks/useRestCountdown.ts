import { useEffect, useState } from 'react'

export type RestTimerKind = 'exercise' | 'phase'

export type RestTimer = {
  id: string
  endsAt: number
  totalSeconds: number
  afterExerciseName: string
  kind?: RestTimerKind
  phaseLabel?: string
}

export type RestCountdown = {
  active: boolean
  remaining: number
  total: number
  progress: number
  afterExerciseName: string
  kind: RestTimerKind
  phaseLabel?: string
}

const IDLE: RestCountdown = {
  active: false,
  remaining: 0,
  total: 0,
  progress: 0,
  afterExerciseName: '',
  kind: 'exercise',
}

export function useRestCountdown(timer: RestTimer | null): RestCountdown {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!timer) return
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 100)
    return () => window.clearInterval(id)
  }, [timer])

  if (!timer) return IDLE

  const remaining = Math.max(0, Math.ceil((timer.endsAt - now) / 1000))
  const progress =
    timer.totalSeconds > 0 ? Math.min(1, remaining / timer.totalSeconds) : 0

  return {
    active: remaining > 0,
    remaining,
    total: timer.totalSeconds,
    progress,
    afterExerciseName: timer.afterExerciseName,
    kind: timer.kind ?? 'exercise',
    phaseLabel: timer.phaseLabel,
  }
}

export function restCountdownLabel(countdown: Pick<RestCountdown, 'kind' | 'phaseLabel' | 'afterExerciseName'>): string {
  if (countdown.kind === 'phase' && countdown.phaseLabel) {
    return `Tussen ${countdown.phaseLabel.toLowerCase()}s`
  }
  return `Bij ${countdown.afterExerciseName}`
}

export function formatRestSeconds(seconds: number): string {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return s > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${m}m`
  }
  return `${seconds}s`
}
