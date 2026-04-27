import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { Megaphone, Plus, Globe, EyeOff } from 'lucide-react'

type Entry = {
  id: string
  version: string
  date: string
  tag: string
  title: string
  body_md: string | null
  published: boolean
  published_at: string | null
  created_at: string
}

const TAG_STYLES: Record<string, string> = {
  feature:     'bg-indigo-50 text-indigo-600',
  fix:         'bg-red-50 text-red-600',
  improvement: 'bg-emerald-50 text-emerald-600',
  breaking:    'bg-amber-50 text-amber-700',
}

const TAG_LABELS: Record<string, string> = {
  feature:     'Nouveauté',
  fix:         'Correctif',
  improvement: 'Amélioration',
  breaking:    'Breaking change',
}

function NewEntryForm({ onClose }: { onClose: () => void }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [form, setForm] = useState({ version: '', title: '', tag: 'feature', body_md: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.version || !form.title) return
    setLoading(true)
    try {
      const { error } = await supabase.from('changelog_entries').insert({
        ...form,
        author_id: user?.id,
        date: new Date().toISOString().slice(0, 10),
      })
      if (error) throw error
      qc.invalidateQueries({ queryKey: ['admin_changelog'] })
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#e4e7f8] bg-white p-5 space-y-4">
      <h3 className="text-sm font-bold text-gray-900">Nouvelle entrée</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Version</label>
          <input
            value={form.version}
            onChange={e => setForm(p => ({ ...p, version: e.target.value }))}
            placeholder="v1.2.0"
            className="w-full rounded-xl border border-[#e4e7f8] bg-[#f7f8ff] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Type</label>
          <select
            value={form.tag}
            onChange={e => setForm(p => ({ ...p, tag: e.target.value }))}
            className="w-full rounded-xl border border-[#e4e7f8] bg-[#f7f8ff] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            {Object.entries(TAG_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Titre</label>
        <input
          value={form.title}
          onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          placeholder="Description courte de la mise à jour"
          className="w-full rounded-xl border border-[#e4e7f8] bg-[#f7f8ff] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Détails (optionnel)</label>
        <textarea
          value={form.body_md}
          onChange={e => setForm(p => ({ ...p, body_md: e.target.value }))}
          placeholder="Markdown supporté…"
          rows={3}
          className="w-full rounded-xl border border-[#e4e7f8] bg-[#f7f8ff] px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none resize-none"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="rounded-xl border border-[#e4e7f8] px-4 py-2 text-xs font-medium text-gray-600 hover:border-indigo-300">
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading || !form.version || !form.title}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Création…' : 'Créer'}
        </button>
      </div>
    </form>
  )
}

export default function AdminChangelog() {
  const qc = useQueryClient()
  const [showNew, setShowNew] = useState(false)

  const { data: entries = [], isLoading } = useQuery<Entry[]>({
    queryKey: ['admin_changelog'],
    queryFn: async () => {
      const { data, error } = await supabase.from('changelog_entries').select('*').order('date', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from('changelog_entries').update({
        published,
        published_at: published ? new Date().toISOString() : null,
      }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_changelog'] }),
  })

  if (isLoading) return <div className="animate-pulse h-64 rounded-2xl bg-gray-100" />

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Megaphone size={18} className="text-indigo-600" />
          <div>
            <h1 className="text-xl font-black text-gray-900">Changelog</h1>
            <p className="text-sm text-gray-400 mt-0.5">{entries.length} entrée{entries.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus size={14} />
          Nouvelle entrée
        </button>
      </div>

      {showNew && <NewEntryForm onClose={() => setShowNew(false)} />}

      {entries.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#e4e7f8] p-16 text-center">
          <p className="text-3xl mb-3">📢</p>
          <p className="text-sm font-semibold text-gray-700">Aucune entrée</p>
          <p className="text-xs text-gray-400 mt-1">Créez votre première entrée de changelog ci-dessus.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <div key={entry.id} className="rounded-2xl border border-[#e4e7f8] bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-1 self-stretch rounded-full bg-indigo-200 mt-1" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-gray-400">{entry.version}</span>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', TAG_STYLES[entry.tag] ?? 'bg-gray-100 text-gray-500')}>
                        {TAG_LABELS[entry.tag] ?? entry.tag}
                      </span>
                      {!entry.published && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-400">Brouillon</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{entry.title}</p>
                    {entry.body_md && (
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{entry.body_md}</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-2">
                      {format(parseISO(entry.date), 'd MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => togglePublish.mutate({ id: entry.id, published: !entry.published })}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors flex-shrink-0',
                    entry.published
                      ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                      : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  )}
                >
                  {entry.published ? <><EyeOff size={12} /> Dépublier</> : <><Globe size={12} /> Publier</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
