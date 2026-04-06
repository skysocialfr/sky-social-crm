import { useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { exportToExcel, exportToCSV } from '@/lib/exportUtils'
import type { Prospect } from '@/types'
import { cn } from '@/lib/cn'

interface Props {
  prospects: Prospect[]
}

export default function ExportButton({ prospects }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Download size={13} />
        Exporter ({prospects.length})
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg border border-border bg-card shadow-xl">
            <button
              onClick={() => { exportToExcel(prospects); setOpen(false) }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-foreground hover:bg-muted transition-colors first:rounded-t-lg"
            >
              <FileSpreadsheet size={13} className="text-emerald-400" />
              Excel (.xlsx)
            </button>
            <button
              onClick={() => { exportToCSV(prospects); setOpen(false) }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-foreground hover:bg-muted transition-colors last:rounded-b-lg"
            >
              <FileText size={13} className="text-blue-400" />
              CSV (.csv)
            </button>
          </div>
        </>
      )}
    </div>
  )
}
