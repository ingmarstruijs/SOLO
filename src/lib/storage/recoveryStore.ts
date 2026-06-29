import { readStore, subscribeStore, writeStore } from './localStore'

const KEY = 'solo-recovery-score'

/** Mock recovery score until Health Connect / Apple Health integration lands. */
export function getRecoveryScore(): number {
  return readStore<number>(KEY, 78)
}

export function setRecoveryScore(score: number): void {
  writeStore(KEY, Math.max(0, Math.min(100, Math.round(score))))
}

export function subscribeRecovery(onChange: () => void): () => void {
  return subscribeStore(KEY, onChange)
}

export function isRecoveryCritical(score: number): boolean {
  return score < 50
}
