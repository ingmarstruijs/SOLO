import { getCoachVoiceGender, type CoachVoiceGender } from '@/lib/storage/coachStore'

const PREVIEW_LINE =
  'Bench press klaar. Volgende: squat. Tien reps. Zestig kilo. Rust negentig seconden.'

const FEMALE_HINTS = ['female', 'vrouw', 'colette', 'zira', 'samantha', 'hazel', 'femme']
const MALE_HINTS = ['male', 'man', 'frank', 'maarten', 'david', 'mark', 'guy']

let lastSpokenKey = ''
let speaking = false

export function isCoachVoiceSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function baseScore(voice: SpeechSynthesisVoice): number {
  const lang = voice.lang.toLowerCase()
  const name = voice.name.toLowerCase()
  let score = 0
  if (lang.startsWith('nl')) score += 40
  else if (lang.startsWith('de') || lang.startsWith('be')) score += 8
  else score -= 20
  if (voice.localService) score += 6
  if (name.includes('natural') || name.includes('neural')) score += 10
  return score
}

function genderScore(voice: SpeechSynthesisVoice, gender: CoachVoiceGender): number {
  const name = voice.name.toLowerCase()
  let score = baseScore(voice)
  const prefer = gender === 'female' ? FEMALE_HINTS : MALE_HINTS
  const avoid = gender === 'female' ? MALE_HINTS : FEMALE_HINTS
  for (const hint of prefer) {
    if (name.includes(hint)) score += 18
  }
  for (const hint of avoid) {
    if (name.includes(hint)) score -= 14
  }
  return score
}

export function resolveCoachVoice(
  voices: SpeechSynthesisVoice[],
  gender = getCoachVoiceGender(),
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null

  const ranked = voices.slice().sort((a, b) => genderScore(b, gender) - genderScore(a, gender))
  return (
    ranked.find((v) => v.lang.toLowerCase().startsWith('nl')) ??
    ranked.find((v) => v.lang.toLowerCase().startsWith('de')) ??
    ranked[0] ??
    null
  )
}

function withVoices(run: (voices: SpeechSynthesisVoice[]) => void): void {
  const synth = window.speechSynthesis
  const voices = synth.getVoices()
  if (voices.length > 0) {
    run(voices)
    return
  }

  synth.onvoiceschanged = () => {
    synth.onvoiceschanged = null
    run(synth.getVoices())
  }
  synth.getVoices()
}

function speak(
  text: string,
  key: string,
  gender?: CoachVoiceGender,
  options: { cancel?: boolean; rate?: number } = {},
): void {
  if (!isCoachVoiceSupported() || !text.trim()) return
  if (key === lastSpokenKey && speaking) return

  const synth = window.speechSynthesis
  const selectedGender = gender ?? getCoachVoiceGender()
  const cancel = options.cancel ?? true

  withVoices((voices) => {
    if (cancel) synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text.trim())
    utterance.lang = 'nl-NL'
    utterance.rate = options.rate ?? 0.95
    utterance.pitch = selectedGender === 'female' ? 1.05 : 0.95
    utterance.volume = 0.9

    const voice = resolveCoachVoice(voices, selectedGender)
    if (voice) {
      utterance.voice = voice
      utterance.lang = voice.lang
    }

    utterance.onstart = () => {
      speaking = true
      lastSpokenKey = key
    }
    utterance.onend = () => {
      speaking = false
    }
    utterance.onerror = () => {
      speaking = false
    }

    synth.speak(utterance)
  })
}

export function speakCoachLine(text: string, key = text, gender?: CoachVoiceGender): void {
  speak(text, key, gender, { cancel: true })
}

/**
 * Short tick for the rest countdown. Cancels any in-progress speech so the
 * spoken number always matches the current timer value (stays synchronous).
 */
export function speakCoachTick(text: string, key: string, gender?: CoachVoiceGender): void {
  speak(text, key, gender, { cancel: true, rate: 1.15 })
}

export function previewCoachVoice(gender: CoachVoiceGender): void {
  speakCoachLine(PREVIEW_LINE, `preview-${gender}-${Date.now()}`, gender)
}

export function stopCoachVoice(): void {
  if (!isCoachVoiceSupported()) return
  window.speechSynthesis.cancel()
  speaking = false
  lastSpokenKey = ''
}
