import { useCallback, useEffect, useSyncExternalStore } from 'react'
import {
  applyTheme,
  getEffectiveTheme,
  getThemePreference,
  setThemePreference,
  startAutoThemeWatcher,
  type ThemePreference,
} from '@/lib/theme/themes'

const THEME_EVENT = 'solo-theme-change'

function subscribeTheme(onChange: () => void): () => void {
  const handler = () => onChange()
  window.addEventListener(THEME_EVENT, handler)
  return () => window.removeEventListener(THEME_EVENT, handler)
}

export function useTheme() {
  const preference = useSyncExternalStore(
    subscribeTheme,
    getThemePreference,
    getThemePreference,
  )
  const theme = useSyncExternalStore(subscribeTheme, getEffectiveTheme, getEffectiveTheme)

  const setTheme = useCallback((next: ThemePreference) => {
    setThemePreference(next)
    applyTheme()
    window.dispatchEvent(new Event(THEME_EVENT))
  }, [])

  return { theme, preference, setTheme, isAuto: preference === 'auto' }
}

/** Mount once in the app shell to switch themes at day-part boundaries. */
export function useAutoThemeWatcher(): void {
  const { preference } = useTheme()

  useEffect(() => {
    if (preference !== 'auto') return
    return startAutoThemeWatcher(() => {
      window.dispatchEvent(new Event(THEME_EVENT))
    })
  }, [preference])
}

export function initTheme(): void {
  applyTheme()
}
