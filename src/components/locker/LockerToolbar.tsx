import { Download, Globe, Plus, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import type { SmartImportDraft } from '@/lib/locker/smartImport'
import { parseSmartImport } from '@/lib/locker/smartImport'
import { LabActionButton } from '@/components/lab/LabPrimitives'
import { cn } from '@/lib/cn'

type LockerToolbarProps = {
  onAdd: () => void
  onExport: () => void
  onImport: (json: string) => number
  onSmartImport: (draft: SmartImportDraft) => void
}

export function LockerToolbar({ onAdd, onExport, onImport, onSmartImport }: LockerToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [smartOpen, setSmartOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [paste, setPaste] = useState('')
  const [draft, setDraft] = useState<SmartImportDraft | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const count = onImport(reader.result as string)
      alert(`${count} item(s) geïmporteerd.`)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleSmartParse() {
    const result = parseSmartImport(paste || url, url)
    setDraft(result)
  }

  function handleSmartConfirm() {
    if (draft) {
      onSmartImport(draft)
      setDraft(null)
      setSmartOpen(false)
      setUrl('')
      setPaste('')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <LabActionButton variant="primary" onClick={onAdd} className="gap-1.5">
          <Plus className="size-4" />
          Toevoegen
        </LabActionButton>
        <LabActionButton variant="secondary" onClick={onExport} className="gap-1.5">
          <Download className="size-4" />
          Export
        </LabActionButton>
        <LabActionButton variant="secondary" onClick={() => fileRef.current?.click()} className="gap-1.5">
          <Upload className="size-4" />
          Import
        </LabActionButton>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />
      </div>

      <button
        type="button"
        onClick={() => setSmartOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted active:bg-surface-2"
      >
        <Globe className="size-4 text-solo-400" />
        Smart import van website
      </button>

      {smartOpen && (
        <div className="flex flex-col gap-3 rounded-card border border-solo-400/30 bg-surface p-4">
          <p className="text-xs text-muted">
            Plak een product-URL of HTML/snippet van een webshop. SOLO. detecteert naam, merk en gewicht.
          </p>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className={inputClass}
          />
          <textarea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder="Of plak pagina-inhoud / producttitel…"
            rows={3}
            className={inputClass}
          />
          <LabActionButton variant="secondary" onClick={handleSmartParse}>
            Analyseren
          </LabActionButton>

          {draft && (
            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <p className="text-sm font-semibold">{draft.name}</p>
              <p className="mt-1 text-xs text-muted">
                {draft.brand && `${draft.brand} · `}
                {draft.category}
                {draft.weightKg != null && ` · ${draft.weightKg} kg`}
              </p>
              <p className={cn('label-mono mt-2 text-[10px]', confidenceColor(draft.confidence))}>
                Betrouwbaarheid: {draft.confidence}
              </p>
              <div className="mt-3 flex gap-2">
                <LabActionButton variant="primary" onClick={handleSmartConfirm}>
                  Toevoegen aan locker
                </LabActionButton>
                <LabActionButton variant="secondary" onClick={() => setDraft(null)}>
                  Annuleren
                </LabActionButton>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function confidenceColor(c: SmartImportDraft['confidence']): string {
  if (c === 'high') return 'text-success'
  if (c === 'medium') return 'text-warn'
  return 'text-danger'
}

const inputClass =
  'w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-sm text-fg outline-none focus:border-solo-400/50'
