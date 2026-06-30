import { Download, Plus, Upload } from 'lucide-react'
import { useRef } from 'react'
import { LabActionButton } from '@/components/lab/LabPrimitives'

type LockerToolbarProps = {
  onAdd: () => void
  onExport: () => void
  onImport: (json: string) => number
}

export function LockerToolbar({ onAdd, onExport, onImport }: LockerToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null)

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

  return (
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
  )
}
