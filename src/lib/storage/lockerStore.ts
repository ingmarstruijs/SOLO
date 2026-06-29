import type { LockerExport, LockerItem } from '@/types/locker'
import { createId, readStore, subscribeStore, writeStore } from './localStore'

const KEY = 'solo-locker'

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

function ensureSeed(): LockerItem[] {
  const existing = readStore<LockerItem[]>(KEY, [])
  if (existing.length === 0) {
    writeStore(KEY, SEED_LOCKER)
    // Re-read so we return the cached (stable) reference rather than the seed constant.
    return readStore<LockerItem[]>(KEY, [])
  }
  return existing
}

export function getLockerItems(): LockerItem[] {
  return ensureSeed()
}

export function saveLockerItems(items: LockerItem[]): void {
  writeStore(KEY, items)
}

export function addLockerItem(
  partial: Omit<LockerItem, 'id' | 'createdAt' | 'updatedAt'>,
): LockerItem {
  const now = new Date().toISOString()
  const item: LockerItem = { ...partial, id: createId(), createdAt: now, updatedAt: now }
  saveLockerItems([...getLockerItems(), item])
  return item
}

export function updateLockerItem(id: string, patch: Partial<LockerItem>): LockerItem | null {
  const items = getLockerItems()
  const idx = items.findIndex((i) => i.id === id)
  if (idx === -1) return null
  const updated = { ...items[idx], ...patch, updatedAt: new Date().toISOString() }
  items[idx] = updated
  saveLockerItems(items)
  return updated
}

export function removeLockerItem(id: string): void {
  saveLockerItems(getLockerItems().filter((i) => i.id !== id))
}

export function exportLocker(): LockerExport {
  return { version: 1, exportedAt: new Date().toISOString(), items: getLockerItems() }
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
  saveLockerItems(merged)
  return added
}

export function subscribeLocker(onChange: () => void): () => void {
  return subscribeStore(KEY, onChange)
}
