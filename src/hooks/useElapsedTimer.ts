import { useEffect, useState } from 'react'

export type ElapsedTimer = {
  active: boolean
  elapsed: number
  formatted: string
}

const IDLE: ElapsedTimer = {
  active: false,
  elapsed: 0,
  formatted: '0s',
}

export function formatElapsedSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m > 0) return `${m}:${s.toString().padStart(2, '0')}`
  return `${s}s`
}

/** Counts up from startedAt while active. */
export function useElapsedTimer(startedAt: number | null, active: boolean): ElapsedTimer {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!active || startedAt == null) return
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [startedAt, active])

  if (!active || startedAt == null) return IDLE

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000))
  return {
    active: true,
    elapsed,
    formatted: formatElapsedSeconds(elapsed),
  }
}
