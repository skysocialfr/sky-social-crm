import { useState, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  parseFile, autoDetectMapping, computeResult, getValidRows,
  FIELD_LABELS, type ParseResult,
} from '@/lib/csvUtils'
import type { ProspectFormData } from '@/types'

type FieldMapping = Record<string, keyof ProspectFormData | '_ignore'>

type Step = 'upload' | 'mapping' | 'importing' | 'done'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (rows: ProspectFormData[]) => Promise<void>
}

const FIELD_OPTIONS = [
  { value: '_ignore', label: '— Ignorer —' },
  ...Object.entries(FIELD_LABELS).map(([k, v]) => ({ value: k, label: v })),
]

export default function ImportCSVModal({ open, onOpenChange, onImport }: Props) {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [rawData, setRawData] = useState<{ headers: string[]; rawRows: Record<string, string>[] } | null>(null)
  const [mapping, setMapping] = useState<FieldMapping>({})
  const [result, setResult] = useState<ParseResult | null>(null)
  const [parseError, setParseError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setStep('upload')
      setFile(null)
      setRawData(null)
      setMapping({})
      setResult(null)
      setParseError('')
    }, 300)
  }

  const processFile = async (f: File) => {
    setFile(f)
    setParseError('')
    try {
      const data = await parseFile(f)
      if (!data.rawRows.length) {
        setParseError('Le fichier est vide.')
        return
      }
      const detected = autoDetectMapping(data.headers)
      setRawData(data)
      setMapping(detected)
      setResult(computeResult(data.headers, data.rawRows, detected))
      setStep('mapping')
    } catch {
      setParseError("Impossible de lire le fichier. Vérifiez qu'il s'agit d'un fichier CSV ou Excel valide.")
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
    e.target.value = ''
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) processFile(f)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMappingChange = (header: string, field: string) => {
    const next: FieldMapping = { ...mapping, [header]: field as keyof ProspectFormData | '_ignore' }
    setMapping(next)
    if (rawData) setResult(computeResult(rawData.headers, rawData.rawRows, next))
  }

  const handleImport = async () => {
    if (!result) return
    const rows = getValidRows(result.rows)
    if (!rows.length) return
    setStep('importing')
    try {
      await onImport(rows)
      setStep('done')
    } catch {
      setStep('mapping')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card shadow-xl max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
            <div>
              <Dialog.Title className="text-base font-semibold text-foreground">
                Importer des prospects
              </Dialog.Title>
              <Dialog.Description className="text-xs text-muted-foreground mt-0.5">
                Fichiers acceptés : .csv, .xlsx, .xls
              </Dialog.Description>
            </div>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1">

            {/* Step 1 — Upload */}
            {step === 'upload' && (
              <div className="p-6 space-y-4">
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={cn(
                    'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-12 transition-colors cursor-pointer',
                    isDragging
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  <div className="rounded-full bg-muted p-4">
                    <Upload size={24} className="text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Glissez votre fichier ici</p>
                    <p className="text-xs text-muted-foreground mt-1">ou cliquez pour choisir</p>
                  </div>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileInput}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                {parseError && (
                  <p className="text-xs text-red-400 flex items-center gap-1.5">
                    <AlertCircle size={12} /> {parseError}
                  </p>
                )}

                <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">Colonnes reconnues automatiquement :</p>
                  <p>entreprise, prénom, nom, canal, email, téléphone, secteur, ville, priorité, étape, valeur, notes, prochain contact…</p>
                </div>
              </div>
            )}

            {/* Step 2 — Mapping + preview */}
            {(step === 'mapping' || step === 'importing') && result && rawData && (
              <div className="p-5 space-y-4">
                {/* File stats banner */}
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
                  <FileSpreadsheet size={18} className="text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file?.name}</p>
                    <p className="text-xs text-muted-foreground">{rawData.rawRows.length} lignes détectées</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs flex-shrink-0">
                    <span className="text-emerald-400 font-medium">{result.validCount} valides</span>
                    {result.errorCount > 0 && (
                      <span className="text-amber-400 font-medium">{result.errorCount} erreurs</span>
                    )}
                  </div>
                </div>

                {/* Mapping table */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Correspondance des colonnes
                  </p>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Colonne fichier</th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Exemple</th>
                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Champ CRM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rawData.headers.map((h) => (
                          <tr key={h} className="border-b border-border last:border-0">
                            <td className="px-3 py-2 font-medium text-foreground">{h}</td>
                            <td className="px-3 py-2 text-muted-foreground max-w-[120px] truncate">
                              {String(rawData.rawRows[0]?.[h] ?? '').substring(0, 30) || (
                                <span className="italic">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={mapping[h] ?? '_ignore'}
                                onChange={(e) => handleMappingChange(h, e.target.value)}
                                disabled={step === 'importing'}
                                className="w-full rounded border border-border bg-input px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary"
                              >
                                {FIELD_OPTIONS.map((o) => (
                                  <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Error summary */}
                {result.errorCount > 0 && (
                  <div className="rounded-lg border border-amber-800 bg-amber-900/20 p-3 space-y-1.5">
                    <p className="text-xs font-medium text-amber-300 flex items-center gap-1.5">
                      <AlertCircle size={12} />
                      {result.errorCount} ligne{result.errorCount > 1 ? 's' : ''} ignorée{result.errorCount > 1 ? 's' : ''} (données invalides ou manquantes)
                    </p>
                    {result.rows.filter(r => r.errors.length > 0).slice(0, 3).map(r => (
                      <p key={r.index} className="text-xs text-amber-400/80">
                        Ligne {r.index + 2} : {r.errors.join(', ')}
                      </p>
                    ))}
                    {result.errorCount > 3 && (
                      <p className="text-xs text-amber-400/60">…et {result.errorCount - 3} autre{result.errorCount - 3 > 1 ? 's' : ''}</p>
                    )}
                  </div>
                )}

                {step === 'importing' && (
                  <div className="rounded-lg bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                    Import en cours…
                  </div>
                )}
              </div>
            )}

            {/* Step — Done */}
            {step === 'done' && (
              <div className="p-10 flex flex-col items-center gap-3 text-center">
                <div className="rounded-full bg-emerald-900/30 p-4">
                  <CheckCircle2 size={28} className="text-emerald-400" />
                </div>
                <p className="text-base font-semibold text-foreground">Import réussi !</p>
                <p className="text-sm text-muted-foreground">
                  {result?.validCount ?? 0} prospect{(result?.validCount ?? 0) > 1 ? 's' : ''} importé{(result?.validCount ?? 0) > 1 ? 's' : ''} avec succès.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t border-border flex-shrink-0">
            {step !== 'done' ? (
              <>
                <button
                  onClick={handleClose}
                  disabled={step === 'importing'}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                {step === 'mapping' && result && (
                  <button
                    onClick={handleImport}
                    disabled={result.validCount === 0}
                    className={cn(
                      'flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors',
                      result.validCount === 0 && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <ChevronRight size={14} />
                    Importer {result.validCount} prospect{result.validCount > 1 ? 's' : ''}
                  </button>
                )}
                {step === 'importing' && (
                  <button disabled className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground opacity-50 cursor-not-allowed">
                    Import en cours…
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleClose}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Fermer
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
