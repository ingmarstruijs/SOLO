import type { LockerCollection, LockerExport, LockerItem, LockerProfile } from '@/types/locker'
import { createId, readStore, subscribeStore, writeStore } from './localStore'

const KEY = 'solo-lockers'
const LEGACY_KEY = 'solo-locker'

const SEED_LOCKER: LockerItem[] = [
  {
    id: 'seed-db-20',
    name: 'Hex Dumbbell 20 kg',
    brand: 'Rogue',
    category: 'dumbbell',
    weightKg: 20,
    firstUsedAt: '2025-06-01',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed-db-14',
    name: 'Hex Dumbbell 14 kg',
    brand: 'Rogue',
    category: 'dumbbell',
    weightKg: 14,
    firstUsedAt: '2025-06-01',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed-kb-16',
    name: 'Kettlebell 16 kg',
    brand: '',
    category: 'kettlebell',
    weightKg: 16,
    firstUsedAt: '2025-08-15',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed-band',
    name: 'Resistance Band Set',
    brand: 'TheraBand',
    category: 'resistance_band',
    resistance: 'medium',
    firstUsedAt: '2025-09-01',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed-bench',
    name: 'Flat Bench',
    brand: 'Rep Fitness',
    category: 'bench',
    firstUsedAt: '2025-06-01',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed-bar',
    name: 'Olympic Barbell',
    brand: 'Rogue',
    category: 'barbell',
    weightKg: 20,
    firstUsedAt: '2025-06-01',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed-plate-20',
    name: 'Bumper Plate 20 kg',
    brand: 'Rogue',
    category: 'weight_plate',
    weightKg: 20,
    firstUsedAt: '2025-06-01',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed-plate-10',
    name: 'Bumper Plate 10 kg',
    brand: 'Rogue',
    category: 'weight_plate',
    weightKg: 10,
    firstUsedAt: '2025-06-01',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'seed-plate-5',
    name: 'Bumper Plate 5 kg',
    brand: 'Rogue',
    category: 'weight_plate',
    weightKg: 5,
    firstUsedAt: '2025-06-01',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

function createProfile(name: string, items: LockerItem[], id?: string): LockerProfile {
  const now = new Date().toISOString()
  return {
    id: id ?? createId(),
    name,
    items,
    createdAt: now,
    updatedAt: now,
  }
}

function migrateLegacyCollection(): LockerCollection {
  const legacyItems = readStore<LockerItem[]>(LEGACY_KEY, [])
  const home = createProfile('Thuis', legacyItems.length > 0 ? legacyItems : SEED_LOCKER)
  return { profiles: [home], activeProfileId: home.id }
}

function ensureCollection(): LockerCollection {
  const existing = readStore<LockerCollection | null>(KEY, null)
  if (existing?.profiles?.length) {
    const activeExists = existing.profiles.some((p) => p.id === existing.activeProfileId)
    if (activeExists) return existing
    const fixed = { ...existing, activeProfileId: existing.profiles[0].id }
    writeStore(KEY, fixed)
    return readStore<LockerCollection>(KEY, fixed)
  }

  const migrated = migrateLegacyCollection()
  writeStore(KEY, migrated)
  return readStore<LockerCollection>(KEY, migrated)
}

function updateCollection(mutator: (collection: LockerCollection) => LockerCollection): void {
  writeStore(KEY, mutator(ensureCollection()))
}

function getActiveProfile(collection = ensureCollection()): LockerProfile {
  return collection.profiles.find((p) => p.id === collection.activeProfileId) ?? collection.profiles[0]
}

export function getLockerCollection(): LockerCollection {
  return ensureCollection()
}

export function getLockerProfiles(): LockerProfile[] {
  return ensureCollection().profiles
}

export function getActiveLockerId(): string {
  return ensureCollection().activeProfileId
}

export function getActiveLockerProfile(): LockerProfile {
  return getActiveProfile()
}

export function getLockerItems(): LockerItem[] {
  return getActiveProfile().items
}

export function setActiveLockerProfile(id: string): void {
  updateCollection((collection) => {
    if (!collection.profiles.some((p) => p.id === id)) return collection
    return { ...collection, activeProfileId: id }
  })
}

export function addLockerProfile(name: string): LockerProfile {
  const profile = createProfile(name.trim() || 'Nieuwe locker', [])
  updateCollection((collection) => ({
    profiles: [...collection.profiles, profile],
    activeProfileId: profile.id,
  }))
  return profile
}

export function renameLockerProfile(id: string, name: string): void {
  const trimmed = name.trim()
  if (!trimmed) return
  updateCollection((collection) => ({
    ...collection,
    profiles: collection.profiles.map((p) =>
      p.id === id ? { ...p, name: trimmed, updatedAt: new Date().toISOString() } : p,
    ),
  }))
}

export function removeLockerProfile(id: string): boolean {
  const collection = ensureCollection()
  if (collection.profiles.length <= 1) return false

  const profiles = collection.profiles.filter((p) => p.id !== id)
  if (profiles.length === collection.profiles.length) return false

  updateCollection(() => ({
    profiles,
    activeProfileId:
      collection.activeProfileId === id ? profiles[0].id : collection.activeProfileId,
  }))
  return true
}

function saveActiveLockerItems(items: LockerItem[]): void {
  updateCollection((collection) => ({
    ...collection,
    profiles: collection.profiles.map((p) =>
      p.id === collection.activeProfileId
        ? { ...p, items, updatedAt: new Date().toISOString() }
        : p,
    ),
  }))
}

export function addLockerItem(
  partial: Omit<LockerItem, 'id' | 'createdAt' | 'updatedAt'>,
): LockerItem {
  const now = new Date().toISOString()
  const item: LockerItem = { ...partial, id: createId(), createdAt: now, updatedAt: now }
  saveActiveLockerItems([...getLockerItems(), item])
  return item
}

export function updateLockerItem(id: string, patch: Partial<LockerItem>): LockerItem | null {
  const items = getLockerItems()
  const idx = items.findIndex((i) => i.id === id)
  if (idx === -1) return null
  const updated = { ...items[idx], ...patch, updatedAt: new Date().toISOString() }
  const next = [...items]
  next[idx] = updated
  saveActiveLockerItems(next)
  return updated
}

export function removeLockerItem(id: string): void {
  saveActiveLockerItems(getLockerItems().filter((i) => i.id !== id))
}

export function exportLocker(): LockerExport {
  const profile = getActiveProfile()
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    profileName: profile.name,
    items: profile.items,
  }
}

export function importLocker(data: LockerExport): number {
  const existing = getLockerItems()
  const merged = [...existing]
  let added = 0
  for (const item of data.items) {
    if (!merged.some((e) => e.id === item.id)) {
      merged.push(item)
      added++
    }
  }
  saveActiveLockerItems(merged)
  return added
}

export function subscribeLocker(onChange: () => void): () => void {
  return subscribeStore(KEY, onChange)
}
