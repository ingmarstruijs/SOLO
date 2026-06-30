import { useCallback, useSyncExternalStore } from 'react'
import {
  getCoachEnabled,
  setCoachEnabled,
  subscribeCoachEnabled,
} from '@/lib/storage/coachStore'

export function useCoachEnabled() {
  const enabled = useSyncExternalStore(subscribeCoachEnabled, getCoachEnabled, getCoachEnabled)
  const setEnabled = useCallback((value: boolean) => setCoachEnabled(value), [])
  const toggleEnabled = useCallback(() => setCoachEnabled(!getCoachEnabled()), [])
  return { enabled, setEnabled, toggleEnabled }
}
