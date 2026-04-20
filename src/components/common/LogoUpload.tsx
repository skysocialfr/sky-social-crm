import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'

interface LogoUploadProps {
  currentUrl: string | null
  onFile: (file: File) => void
  onClear: () => void
}

const MAX_SIZE = 2 * 1024 * 1024
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp']

export default function LogoUpload({ currentUrl, onFile, onClear }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState('')

  const displayUrl = preview ?? currentUrl

  function handleFile(file: File) {
    setError('')
    if (!ACCEPTED.includes(file.type)) {
      setError('Format accepté : PNG, JPEG ou WEBP')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('Taille max : 2 Mo')
      return
    }
    setPreview(URL.createObjectURL(file))
    onFile(file)
  }

  function handleClear() {
    setPreview(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
    onClear()
  }

  return (
    <div className="space-y-2">
      {displayUrl ? (
        <div className="flex items-center gap-3">
          <img
            src={displayUrl}
            alt="Logo"
            className="h-12 w-12 rounded-lg object-contain border border-border bg-muted"
          />
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={13} /> Supprimer
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <ImagePlus size={18} />
          Cliquer pour ajouter un logo
        </button>
      )}

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  )
}
