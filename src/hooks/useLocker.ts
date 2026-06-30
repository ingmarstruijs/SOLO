import { useCallback, useSyncExternalStore } from 'react'
import type { LockerItem } from '@/types/locker'
import {
  addLockerItem,
  addLockerProfile,
  exportLocker,
  getActiveLockerId,
  getActiveLockerProfile,
  getLockerItems,
  getLockerProfiles,
  importLocker,
  removeLockerItem,
  removeLockerProfile,
  renameLockerProfile,
  setActiveLockerProfile,
  subscribeLocker,
  updateLockerItem,
} from '@/lib/storage/lockerStore'

export function useLocker() {
  const items = useSyncExternalStore(subscribeLocker, getLockerItems, getLockerItems)
  const profiles = useSyncExternalStore(subscribeLocker, getLockerProfiles, getLockerProfiles)
  const activeProfileId = useSyncExternalStore(subscribeLocker, getActiveLockerId, getActiveLockerId)
  const activeProfile = useSyncExternalStore(
    subscribeLocker,
    getActiveLockerProfile,
    getActiveLockerProfile,
  )

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
  const switchProfile = useCallback((id: string) => setActiveLockerProfile(id), [])
  const addProfile = useCallback((name: string) => addLockerProfile(name), [])
  const renameProfile = useCallback((id: string, name: string) => renameLockerProfile(id, name), [])
  const removeProfile = useCallback((id: string) => removeLockerProfile(id), [])

  return {
    items,
    profiles,
    activeProfileId,
    activeProfile,
    add,
    update,
    remove,
    exportData,
    importData,
    switchProfile,
    addProfile,
    renameProfile,
    removeProfile,
  }
}
