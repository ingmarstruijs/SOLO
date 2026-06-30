import type { ThemeId } from '@/lib/theme/themes'
import {
  buildIdleTvState,
  closeTvWindow,
  connectTvWindow,
  onTvReceiverHello,
  pingTvReceiver,
  publishTvState,
  type TvMessage,
} from './broadcast'

export type TvConnectionStatus = 'disconnected' | 'connecting' | 'connected'

type TvTransportState = {
  status: TvConnectionStatus
  receiverUrl: string
}

let state: TvTransportState = {
  status: 'disconnected',
  receiverUrl: getReceiverUrl(),
}

/** Whether the user wants the TV connected. Suppresses auto-reconnect after an explicit disconnect. */
let desiredConnected = false
/** Last message sent, re-published whenever a (new) receiver announces itself. */
let lastMessage: TvMessage | null = null
let helloUnsub: (() => void) | null = null

const listeners = new Set<() => void>()

function notify(): void {
  listeners.forEach((listener) => listener())
}

function getReceiverUrl(): string {
  if (typeof window === 'undefined') return '/tv'
  return `${window.location.origin}/tv`
}

/** Re-send the latest state whenever a receiver announces itself (fresh load or reconnect). */
function ensureHelloListener(): void {
  if (helloUnsub) return
  helloUnsub = onTvReceiverHello(() => {
    if (lastMessage) publishTvState(lastMessage)
  })
}

export function getTvTransportState(): TvTransportState {
  return state
}

export function getTvConnectionStatus(): TvConnectionStatus {
  return state.status
}

export function subscribeTvTransport(onChange: () => void): () => void {
  listeners.add(onChange)
  return () => listeners.delete(onChange)
}

function setStatus(status: TvConnectionStatus): void {
  if (state.status === status) return
  state = { ...state, status }
  notify()
}

/**
 * Reconcile the connection status by pinging open receivers. When the user has
 * disconnected we stay disconnected; otherwise we reflect whether a receiver is
 * actually alive (so closing the TV window flips us back to disconnected).
 */
export async function refreshTvConnectionStatus(): Promise<void> {
  if (!desiredConnected) {
    setStatus('disconnected')
    return
  }
  const alive = await pingTvReceiver()
  setStatus(alive ? 'connected' : 'disconnected')
}

export function isTvConnected(): boolean {
  return state.status === 'connected'
}

/**
 * Connect to a TV receiver. If a receiver is already open it reconnects to it
 * (no new window); otherwise it opens the receiver window once.
 */
export async function connectTv(): Promise<void> {
  desiredConnected = true
  ensureHelloListener()
  setStatus('connecting')

  const alive = await pingTvReceiver()
  if (!alive) connectTvWindow()

  setStatus('connected')
}

export function disconnectTv(): void {
  desiredConnected = false
  closeTvWindow()
  setStatus('disconnected')
}

/** Publish idle TV state — ready for the next workout. */
export function publishTvIdle(theme: ThemeId): void {
  publishToTvTransport(buildIdleTvState(theme), { theme })
}

/** Publish state to TV; optionally (re)connects, opening a window only if needed. */
export function publishToTvTransport(
  message: TvMessage,
  options?: { openWindow?: boolean; theme?: ThemeId },
): void {
  ensureHelloListener()
  const payload = options?.theme ? { ...message, theme: options.theme } : message
  lastMessage = payload
  publishTvState(payload)

  if (options?.openWindow) {
    void connectTv()
  }
}

/** Reconnect TV and push the latest state immediately. */
export async function reconnectTv(
  message: TvMessage,
  options?: { theme?: ThemeId },
): Promise<void> {
  await connectTv()
  publishToTvTransport(message, { theme: options?.theme })
}
