import { useSyncExternalStore } from 'react'
import {
  getActiveSession,
  isSessionActive,
  subscribeActiveSession,
} from '@/lib/storage/sessionStore'

export function useActiveSession() {
  const session = useSyncExternalStore(subscribeActiveSession, getActiveSession, getActiveSession)
  const active = useSyncExternalStore(
    subscribeActiveSession,
    isSessionActive,
    isSessionActive,
  )
  return { session, active }
}
