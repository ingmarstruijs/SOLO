import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocker } from '@/hooks/useLocker'
import { cn } from '@/lib/cn'

type MenuState = { id: string; name: string; x: number; y: number }

export function LockerProfileSwitcher({ showHint = true }: { showHint?: boolean }) {
  const {
    profiles,
    activeProfileId,
    switchProfile,
    addProfile,
    renameProfile,
    removeProfile,
  } = useLocker()
  const [menu, setMenu] = useState<MenuState | null>(null)

  function handleAdd() {
    const name = prompt('Naam voor nieuwe locker', 'Sportschool')
    if (!name?.trim()) return
    addProfile(name.trim())
  }

  function openMenu(e: React.MouseEvent<HTMLButtonElement>, id: string, name: string) {
    const rect = e.currentTarget.getBoundingClientRect()
    setMenu((cur) =>
      cur?.id === id ? null : { id, name, x: rect.right, y: rect.bottom },
    )
  }

  function handleRename() {
    if (!menu) return
    const { id, name: currentName } = menu
    setMenu(null)
    const name = prompt('Locker hernoemen', currentName)
    if (!name?.trim()) return
    renameProfile(id, name.trim())
  }

  function handleRemove() {
    if (!menu) return
    const { id, name } = menu
    setMenu(null)
    if (!confirm(`Locker "${name}" verwijderen?`)) return
    removeProfile(id)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 overflow-x-auto pb-2 pt-1">
        {profiles.map((profile) => {
          const active = profile.id === activeProfileId
          return (
            <div key={profile.id} className="relative shrink-0">
              <button
                type="button"
                onClick={() => switchProfile(profile.id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border py-2 pl-3 pr-9 text-left transition-colors',
                  active
                    ? 'border-solo-400/50 bg-solo-400/10'
                    : 'border-line bg-surface active:bg-surface-2',
                )}
              >
                <span className="text-sm font-semibold">{profile.name}</span>
                <span className="text-[10px] text-muted">{profile.items.length}</span>
              </button>
              <button
                type="button"
                onClick={(e) => openMenu(e, profile.id, profile.name)}
                className="absolute right-1 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-faint active:bg-surface-2"
                aria-label={`Opties voor ${profile.name}`}
              >
                <MoreHorizontal className="size-4" />
              </button>
            </div>
          )
        })}
        <button
          type="button"
          onClick={handleAdd}
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-dashed border-line text-muted active:bg-surface-2"
          aria-label="Nieuwe locker"
        >
          <Plus className="size-4" />
        </button>
      </div>
      {showHint && (
        <p className="text-[11px] text-muted">
          Wissel tussen locaties. Workout prep gebruikt de actieve locker.
        </p>
      )}

      {menu &&
        createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setMenu(null)}
              aria-label="Sluit menu"
            />
            <div
              className="fixed z-50 min-w-[9rem] -translate-x-full rounded-xl border border-line bg-surface p-1 shadow-lg"
              style={{ left: menu.x, top: menu.y + 4 }}
            >
              <button
                type="button"
                onClick={handleRename}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm active:bg-surface-2"
              >
                <Pencil className="size-3.5" />
                Hernoemen
              </button>
              {profiles.length > 1 && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-danger active:bg-surface-2"
                >
                  <Trash2 className="size-3.5" />
                  Verwijderen
                </button>
              )}
            </div>
          </>,
          document.body,
        )}
    </div>
  )
}
