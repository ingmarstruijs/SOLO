import { useCallback, useSyncExternalStore } from 'react'
import {
  getRecoveryScore,
  setRecoveryScore,
  subscribeRecovery,
} from '@/lib/storage/recoveryStore'

export function useRecoveryScore() {
  const score = useSyncExternalStore(subscribeRecovery, getRecoveryScore, getRecoveryScore)
  const setScore = useCallback((value: number) => setRecoveryScore(value), [])
  return { score, setScore }
}
