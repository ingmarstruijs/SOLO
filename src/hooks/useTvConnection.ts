import { useEffect, useSyncExternalStore } from 'react'
import {
  getTvConnectionStatus,
  refreshTvConnectionStatus,
  subscribeTvTransport,
} from '@/lib/tv/transport'

export function useTvConnection() {
  const status = useSyncExternalStore(
    subscribeTvTransport,
    getTvConnectionStatus,
    () => 'disconnected' as const,
  )

  useEffect(() => {
    void refreshTvConnectionStatus()
    const id = window.setInterval(() => {
      void refreshTvConnectionStatus()
    }, 3000)
    return () => window.clearInterval(id)
  }, [])

  return {
    status,
    connected: status === 'connected',
  }
}
