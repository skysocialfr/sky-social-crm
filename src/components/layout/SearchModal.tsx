import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProspects } from '@/hooks/useProspects'
import { dicebearAvatar } from '@/lib/avatar'

interface Props {
  open: boolean
  onClose: () => void
}

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { data: prospects } = useProspects()

  useEffect(() => {
    if (!open) { setQuery(''); return }
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); onClose() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  const q = query.trim().toLowerCase()
  const results = q.length >= 2
    ? (prospects ?? []).filter(p =>
        p.company_name.toLowerCase().includes(q) ||
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
        (p.sector ?? '').toLowerCase().includes(q)
      ).slice(0, 8)
    : []

  const goToProspect = (id: string) => {
    navigate(`/app/prospects/${id}`)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20"
      style={{ background: 'rgba(30,31,60,0.35)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="w-[560px] bg-white rounded-2xl overflow-hidden border border-[#e4e7f8]"
        style={{ boxShadow: '0 24px 64px rgba(99,102,241,0.18), 0 4px 24px rgba(0,0,0,0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-[14px] border-b border-[#e4e7f8]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#1a1c2e] placeholder-[#9ca3af]"
            placeholder="Rechercher un prospect, une société…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <span className="text-[11px] text-[#9ca3af] bg-[#f4f5ff] rounded-[5px] px-2 font-mono">ESC</span>
        </div>

        {q.length < 2 && (
          <p className="py-7 text-center text-[13px] text-[#9ca3af]">Commencez à taper pour rechercher…</p>
        )}
        {q.length >= 2 && results.length === 0 && (
          <p className="py-7 text-center text-[13px] text-[#9ca3af]">Aucun résultat pour « {query} »</p>
        )}
        {results.map(p => (
          <button
            key={p.id}
            onClick={() => goToProspect(p.id)}
            className="w-full flex items-center gap-3 px-4 py-[10px] text-left transition-colors hover:bg-[#f7f8ff]"
          >
            <img
              src={dicebearAvatar(`${p.first_name} ${p.last_name}`)}
              alt=""
              className="w-8 h-8 rounded-full bg-[#f0f1f8] flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-[#1a1c2e] truncate">{p.company_name}</p>
              <p className="text-[11px] text-[#6b7280] truncate">{p.first_name} {p.last_name}{p.sector ? ` · ${p.sector}` : ''}</p>
            </div>
            <span className="text-[11px] font-bold flex-shrink-0 px-[9px] py-[3px] rounded-[6px]"
              style={{ color: '#6b7280', background: 'rgba(107,114,128,0.1)' }}>
              {p.stage}
            </span>
          </button>
        ))}

        <div className="flex gap-4 px-4 py-[10px] border-t border-[#e4e7f8] text-[11px] text-[#9ca3af]">
          <span>↵ Ouvrir</span>
          <span>ESC Fermer</span>
        </div>
      </div>
    </div>
  )
}
