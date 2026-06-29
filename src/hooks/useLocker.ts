import { useCallback, useSyncExternalStore } from 'react'
import type { LockerItem } from '@/types/locker'
import {
  addLockerItem,
  exportLocker,
  getLockerItems,
  importLocker,
  removeLockerItem,
  subscribeLocker,
  updateLockerItem,
} from '@/lib/storage/lockerStore'

export function useLocker() {
  const items = useSyncExternalStore(subscribeLocker, getLockerItems, getLockerItems)

  const add = useCallback(
    (partial: Omit<LockerItem, 'id' | 'createdAt' | 'updatedAt'>) => addLockerItem(partial),
    [],
  )
  const update = useCallback(
    (id: string, patch: Partial<LockerItem>) => updateLockerItem(id, patch),
    [],
  )
  const remove = useCallback((id: string) => removeLockerItem(id), [])
  const exportData = useCallback(() => exportLocker(), [])
  const importData = useCallback((json: string) => {
    const data = JSON.parse(json)
    return importLocker(data)
  }, [])

  return { items, add, update, remove, exportData, importData }
}
