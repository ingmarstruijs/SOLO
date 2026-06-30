import { useCallback, useSyncExternalStore } from 'react'
import {
  getCoachVoiceGender,
  setCoachVoiceGender,
  subscribeCoachVoiceGender,
  type CoachVoiceGender,
} from '@/lib/storage/coachStore'

export function useCoachVoiceGender() {
  const gender = useSyncExternalStore(
    subscribeCoachVoiceGender,
    getCoachVoiceGender,
    () => 'female' as const,
  )
  const setGender = useCallback((value: CoachVoiceGender) => {
    setCoachVoiceGender(value)
  }, [])
  return { gender, setGender }
}
