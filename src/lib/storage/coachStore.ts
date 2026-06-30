import { readStore, subscribeStore, writeStore } from './localStore'

const COACH_ENABLED_KEY = 'solo-coach-enabled'
const COACH_VOICE_GENDER_KEY = 'solo-coach-voice-gender'

export type CoachVoiceGender = 'male' | 'female'

export function getCoachEnabled(): boolean {
  return readStore<boolean>(COACH_ENABLED_KEY, true)
}

export function setCoachEnabled(enabled: boolean): void {
  writeStore(COACH_ENABLED_KEY, enabled)
}

export function subscribeCoachEnabled(onChange: () => void): () => void {
  return subscribeStore(COACH_ENABLED_KEY, onChange)
}

export function getCoachVoiceGender(): CoachVoiceGender {
  return readStore<CoachVoiceGender>(COACH_VOICE_GENDER_KEY, 'female')
}

export function setCoachVoiceGender(gender: CoachVoiceGender): void {
  writeStore(COACH_VOICE_GENDER_KEY, gender)
}

export function subscribeCoachVoiceGender(onChange: () => void): () => void {
  return subscribeStore(COACH_VOICE_GENDER_KEY, onChange)
}
