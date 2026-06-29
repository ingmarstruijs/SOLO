import { Filter } from 'lucide-react'
import type { ReactNode } from 'react'
import type { WorkoutFilters } from '@/types/workout'
import { cn } from '@/lib/cn'

type WorkoutFiltersPanelProps = {
  filters: WorkoutFilters
  recoveryScore: number
  onChange: (filters: WorkoutFilters) => void
}

const TIME_OPTIONS = [
  { label: 'Alle', value: undefined },
  { label: '≤ 20 min', value: 20 },
  { label: '≤ 35 min', value: 35 },
  { label: '≤ 50 min', value: 50 },
]

export function WorkoutFiltersPanel({ filters, recoveryScore, onChange }: WorkoutFiltersPanelProps) {
  return (
    <div className="rounded-card border border-line bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <Filter className="size-4 text-solo-400" />
        <h2 className="text-sm font-semibold">Filters</h2>
      </div>

      <div className="flex flex-col gap-4">
        <FilterGroup label="Tijd">
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((opt) => (
              <Chip
                key={opt.label}
                active={filters.maxMinutes === opt.value}
                onClick={() => onChange({ ...filters, maxMinutes: opt.value })}
              >
                {opt.label}
              </Chip>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup label="Locker & recovery">
          <div className="flex flex-wrap gap-2">
            <Chip
              active={filters.lockerOnly}
              onClick={() => onChange({ ...filters, lockerOnly: !filters.lockerOnly })}
            >
              Alleen met locker materiaal
            </Chip>
            <Chip
              active={filters.favoritesOnly}
              onClick={() => onChange({ ...filters, favoritesOnly: !filters.favoritesOnly })}
            >
              Favorieten
            </Chip>
          </div>
          <p className="mt-2 text-xs text-muted">
            Recovery score: <span className="font-mono text-fg">{recoveryScore}%</span>
            {recoveryScore < 50 && (
              <span className="text-warn"> — zware workouts verborgen</span>
            )}
          </p>
        </FilterGroup>
      </div>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="label-mono mb-2 text-faint">{label}</p>
      {children}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-solo-400/50 bg-solo-400/10 text-solo-300'
          : 'border-line bg-surface-2 text-muted active:bg-surface-3',
      )}
    >
      {children}
    </button>
  )
}
