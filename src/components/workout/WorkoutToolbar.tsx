import { Download, FileUp, Globe, Plus, Upload } from 'lucide-react'
import { useRef, type ChangeEvent } from 'react'
import { LabActionButton } from '@/components/lab/LabPrimitives'

type WorkoutToolbarProps = {
  onNew: () => void
  onExport: () => void
  onImportJson: (json: string) => number
  onImportFit: (buffer: ArrayBuffer) => void
  onBrowseWger: () => void
}

export function WorkoutToolbar({
  onNew,
  onExport,
  onImportJson,
  onImportFit,
  onBrowseWger,
}: WorkoutToolbarProps) {
  const jsonRef = useRef<HTMLInputElement>(null)
  const fitRef = useRef<HTMLInputElement>(null)

  function handleJson(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const count = onImportJson(reader.result as string)
      alert(`${count} workout(s) geïmporteerd.`)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleFit(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onImportFit(reader.result as ArrayBuffer)
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-wrap gap-2">
      <LabActionButton variant="primary" onClick={onNew} className="gap-1.5">
        <Plus className="size-4" />
        Nieuw
      </LabActionButton>
      <LabActionButton variant="secondary" onClick={onExport} className="gap-1.5">
        <Download className="size-4" />
        Export
      </LabActionButton>
      <LabActionButton
        variant="secondary"
        onClick={() => jsonRef.current?.click()}
        className="gap-1.5"
      >
        <Upload className="size-4" />
        JSON
      </LabActionButton>
      <LabActionButton
        variant="secondary"
        onClick={() => fitRef.current?.click()}
        className="gap-1.5"
      >
        <FileUp className="size-4" />
        Garmin FIT
      </LabActionButton>
      <LabActionButton variant="secondary" onClick={onBrowseWger} className="gap-1.5">
        <Globe className="size-4" />
        Wger DB
      </LabActionButton>
      <input ref={jsonRef} type="file" accept=".json" className="hidden" onChange={handleJson} />
      <input ref={fitRef} type="file" accept=".fit" className="hidden" onChange={handleFit} />
    </div>
  )
}
