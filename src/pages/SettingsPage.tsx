import { Play, Settings } from 'lucide-react'
import { THEMES, getThemeLabel } from '@/lib/theme/themes'
import { useCoachVoiceGender } from '@/hooks/useCoachVoiceGender'
import { useTheme } from '@/hooks/useTheme'
import { isCoachVoiceSupported, previewCoachVoice } from '@/lib/tv/coachVoice'
import { cn } from '@/lib/cn'

export function SettingsPage() {
  const { theme, preference, setTheme, isAuto } = useTheme()
  const { gender, setGender } = useCoachVoiceGender()
  const voiceSupported = isCoachVoiceSupported()

  return (
    <div className="flex flex-col gap-5 py-2">
      <header className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-surface-2 text-solo-400">
          <Settings className="size-6" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Instellingen</h1>
          <p className="text-xs text-muted">Thema en voorkeuren</p>
        </div>
      </header>

      <section className="rounded-card border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold">Thema</h2>
        <p className="mt-1 text-xs text-muted">
          {isAuto
            ? `Automatisch actief — nu ${getThemeLabel(theme)}`
            : 'Handmatig thema gekozen.'}
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          <li>
            <button
              type="button"
              onClick={() => setTheme('auto')}
              className={cn(
                'w-full rounded-xl border p-3 text-left transition-colors active:bg-surface-2',
                isAuto ? 'border-solo-400/50 bg-solo-400/5' : 'border-line',
              )}
            >
              <p className="font-semibold">Automatisch</p>
              <p className="text-xs text-muted">
                Past zich aan op basis van tijd — nu {getThemeLabel(theme)}
              </p>
            </button>
          </li>
          {THEMES.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setTheme(t.id)}
                className={cn(
                  'w-full rounded-xl border p-3 text-left transition-colors active:bg-surface-2',
                  preference === t.id ? 'border-solo-400/50 bg-solo-400/5' : 'border-line',
                )}
              >
                <p className="font-semibold">{t.label}</p>
                <p className="text-xs text-muted">
                  {t.description} · {t.timeRange}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-card border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold">Coachstem</h2>
        <p className="mt-1 text-xs text-muted">
          Kies een mannen- of vrouwenstem voor coach-aankondigingen tijdens een sessie.
        </p>

        {!voiceSupported ? (
          <p className="mt-3 text-xs text-warn">Spraak wordt niet ondersteund in deze browser.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={cn(
                  'flex flex-1 items-center justify-center rounded-xl border p-3 text-sm font-semibold transition-colors',
                  gender === 'male' ? 'border-solo-400/50 bg-solo-400/5' : 'border-line',
                )}
              >
                Man
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={cn(
                  'flex flex-1 items-center justify-center rounded-xl border p-3 text-sm font-semibold transition-colors',
                  gender === 'female' ? 'border-solo-400/50 bg-solo-400/5' : 'border-line',
                )}
              >
                Vrouw
              </button>
            </div>
            <button
              type="button"
              onClick={() => previewCoachVoice(gender)}
              className="flex items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 py-2.5 text-sm font-medium text-solo-400 active:bg-surface-3"
            >
              <Play className="size-4" />
              Voorbeeld beluisteren
            </button>
          </div>
        )}
      </section>

      <section className="rounded-card border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold">Privacy</h2>
        <p className="mt-1 text-xs text-muted">
          Alle data blijft lokaal op je apparaat. Geen cloud, geen tracking.
        </p>
      </section>
    </div>
  )
}
