import { Play } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useActiveSession } from '@/hooks/useActiveSession'
import { bottomNav } from '@/config/nav'
import { cn } from '@/lib/cn'

export function BottomNav() {
  const navigate = useNavigate()
  const { active } = useActiveSession()
  const left = bottomNav.slice(0, 2)
  const right = bottomNav.slice(2, 4)

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/90 backdrop-blur-md">
      <div className="relative grid h-[var(--bottomnav-h)] grid-cols-5 items-center">
        {left.map((item) => (
          <NavItemLink key={item.to} {...item} />
        ))}

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => navigate('/session')}
            aria-label={active ? 'Actieve sessie' : 'Sessie starten'}
            className={cn(
              '-mt-8 grid size-16 place-items-center rounded-full border-4 text-ink shadow-lg transition-transform active:scale-95',
              active
                ? 'border-success bg-success text-ink shadow-success/30 ring-4 ring-success/25 animate-pulse'
                : 'border-ink bg-solo-400 shadow-solo-600/30',
            )}
          >
            <Play className={cn('size-7 translate-x-0.5 fill-ink', active && 'fill-ink')} />
          </button>
          {active && (
            <span className="absolute -mt-[4.5rem] rounded-full bg-success px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ink">
              Live
            </span>
          )}
        </div>

        {right.map((item) => (
          <NavItemLink key={item.to} {...item} />
        ))}
      </div>
    </nav>
  )
}

function NavItemLink({
  to,
  label,
  icon: Icon,
}: (typeof bottomNav)[number]) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex h-full flex-col items-center justify-center gap-1 transition-colors',
          isActive ? 'text-solo-400' : 'text-muted active:text-fg',
        )
      }
    >
      <Icon className="size-6" />
      <span className="text-[0.65rem] font-medium tracking-wide">{label}</span>
    </NavLink>
  )
}
