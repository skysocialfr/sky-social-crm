import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'
import { Mail } from 'lucide-react'

type EmailTemplate = {
  key: string
  name: string
  subject: string
  body_html: string
  variables: string[]
  enabled: boolean
  last_edit: string
}

export default function AdminEmails() {
  const { data: templates = [], isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['admin_email_templates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('email_templates').select('*').order('name')
      if (error) throw error
      return data ?? []
    },
  })

  const [selected, setSelected] = useState<EmailTemplate | null>(null)

  if (isLoading) {
    return <div className="animate-pulse h-64 rounded-2xl bg-gray-100" />
  }

  if (templates.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-black text-gray-900">Emails</h1>
          <p className="text-sm text-gray-400 mt-0.5">Templates transactionnels</p>
        </div>
        <div className="rounded-2xl border-2 border-dashed border-[#e4e7f8] p-16 text-center">
          <p className="text-3xl mb-3">✉️</p>
          <p className="text-sm font-semibold text-gray-700">Aucun template</p>
          <p className="text-xs text-gray-400 mt-1">Appliquez la migration 005_admin_tables.sql pour initialiser les templates.</p>
        </div>
      </div>
    )
  }

  const active = selected ?? templates[0]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Mail size={18} className="text-indigo-600" />
        <div>
          <h1 className="text-xl font-black text-gray-900">Emails</h1>
          <p className="text-sm text-gray-400 mt-0.5">{templates.length} template{templates.length !== 1 ? 's' : ''} transactionnel{templates.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex gap-4 min-h-[500px]">
        {/* List */}
        <div className="w-60 flex-shrink-0 space-y-1">
          {templates.map(t => (
            <button
              key={t.key}
              onClick={() => setSelected(t)}
              className={cn(
                'w-full text-left rounded-xl px-4 py-3 transition-colors',
                (selected?.key ?? templates[0]?.key) === t.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-[#e4e7f8] text-gray-700 hover:border-indigo-300'
              )}
            >
              <p className="text-sm font-semibold leading-tight">{t.name}</p>
              <p className="text-[11px] mt-0.5 opacity-70 truncate">{t.key}</p>
              <span className={cn(
                'inline-block mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium',
                (selected?.key ?? templates[0]?.key) === t.key
                  ? 'bg-white/20 text-white'
                  : t.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
              )}>
                {t.enabled ? 'Activé' : 'Désactivé'}
              </span>
            </button>
          ))}
        </div>

        {/* Preview */}
        {active && (
          <div className="flex-1 rounded-2xl border border-[#e4e7f8] bg-white overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#e4e7f8] flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-gray-900">{active.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Objet : {active.subject}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {active.variables.map((v: string) => (
                  <span key={v} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-mono font-semibold text-indigo-600">
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>

            {/* Body preview */}
            <div className="flex-1 p-5">
              <div
                className="rounded-xl border border-[#e4e7f8] bg-[#f8f9ff] p-5 text-sm text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: active.body_html }}
              />
            </div>

            <div className="px-5 py-3 border-t border-[#e4e7f8] flex justify-end">
              <button
                disabled
                className="rounded-xl border border-[#e4e7f8] px-4 py-2 text-xs font-medium text-gray-400 cursor-not-allowed"
                title="Édition disponible dans une prochaine mise à jour"
              >
                Modifier le template
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
