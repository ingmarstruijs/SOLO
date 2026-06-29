const STORAGE_EVENT = 'solo-storage-change'

/**
 * Per-key snapshot cache. Holds the last raw JSON string seen for a key and the
 * parsed value it produced. As long as the raw string is unchanged we return the
 * exact same object/array reference, which is required for `useSyncExternalStore`
 * getSnapshot functions to avoid infinite render loops.
 */
const snapshotCache = new Map<string, { raw: string | null; value: unknown }>()

/**
 * Read JSON from localStorage with a fallback, returning a stable cached
 * reference. The parsed value reference only changes when the underlying raw
 * string in localStorage changes, making this safe to use directly as a
 * `useSyncExternalStore` snapshot source.
 */
export function readStore<T>(key: string, fallback: T): T {
  let raw: string | null
  try {
    raw = localStorage.getItem(key)
  } catch {
    return fallback
  }

  const cached = snapshotCache.get(key)
  if (cached && cached.raw === raw) {
    return cached.value as T
  }

  if (!raw) {
    snapshotCache.set(key, { raw, value: fallback })
    return fallback
  }

  try {
    const value = JSON.parse(raw) as T
    snapshotCache.set(key, { raw, value })
    return value
  } catch {
    snapshotCache.set(key, { raw, value: fallback })
    return fallback
  }
}

/** Write JSON to localStorage, refresh the snapshot cache, and notify subscribers. */
export function writeStore<T>(key: string, value: T): void {
  const raw = JSON.stringify(value)
  localStorage.setItem(key, raw)
  // Cache a re-parsed copy so the snapshot reference is always fresh and
  // independent of any array/object the caller may mutate in place after writing.
  snapshotCache.set(key, { raw, value: JSON.parse(raw) })
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }))
}

/** Subscribe to localStorage changes for a specific key. */
export function subscribeStore(key: string, onChange: () => void): () => void {
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<{ key: string }>).detail
    if (detail?.key === key) onChange()
  }
  const storageHandler = (e: StorageEvent) => {
    if (e.key === key) onChange()
  }
  window.addEventListener(STORAGE_EVENT, handler)
  window.addEventListener('storage', storageHandler)
  return () => {
    window.removeEventListener(STORAGE_EVENT, handler)
    window.removeEventListener('storage', storageHandler)
  }
}

export function createId(): string {
  return crypto.randomUUID()
}
