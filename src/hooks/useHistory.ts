import { useCallback, useSyncExternalStore } from 'react'
import {
  clearHistory,
  getHistory,
  getHistoryStats,
  removeSessionRecord,
  subscribeHistory,
} from '@/lib/storage/historyStore'

export function useHistory() {
  const history = useSyncExternalStore(subscribeHistory, getHistory, getHistory)

  const remove = useCallback((id: string) => removeSessionRecord(id), [])
  const clearAll = useCallback(() => clearHistory(), [])

  return {
    history,
    stats: getHistoryStats(),
    remove,
    clearAll,
  }
}
