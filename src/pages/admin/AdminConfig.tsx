import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'
import { Check, Zap } from 'lucide-react'

type Plan = {
  id: string
  name: string
  monthly_price: number
  yearly_price: number | null
  color: string
  features: string[]
  prospects_limit: number | null
  active: boolean
  public: boolean
}

type Flag = {
  key: string
  label: string
  status: 'on' | 'off' | 'rollout'
  rollout_percent: number
}

const TABS = ['Plans & tarifs', 'Feature flags', 'Paramètres'] as const
type Tab = typeof TABS[number]

// Plans tab
function PlansTab() {
  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ['admin_plans'],
    queryFn: async () => {
      const { data, error } = await supabase.from('plans').select('*').order('monthly_price')
      if (error) throw error
      return data ?? []
    },
  })

  if (isLoading) return <div className="animate-pulse h-40 rounded-xl bg-gray-100" />

  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[#e4e7f8] p-12 text-center">
        <p className="text-2xl mb-2">📋</p>
        <p className="text-sm font-semibold text-gray-700">Aucun plan</p>
        <p className="text-xs text-gray-400 mt-1">Appliquez la migration 005_admin_tables.sql pour initialiser les plans.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {plans.map(plan => (
        <div key={plan.id} className="rounded-2xl border border-[#e4e7f8] bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ background: plan.color }} />
              <span className="text-sm font-bold text-gray-900">{plan.name}</span>
            </div>
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', plan.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400')}>
              {plan.active ? 'Actif' : 'Inactif'}
            </span>
          </div>
          <p className="text-3xl font-black text-gray-900 mb-0.5">{plan.monthly_price}€<span className="text-sm font-normal text-gray-400"> / mois</span></p>
          {plan.yearly_price != null && (
            <p className="text-xs text-gray-400 mb-4">{plan.yearly_price}€ / an</p>
          )}
          <ul className="space-y-1.5 mb-4">
            {plan.features.map((f: string) => (
              <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                <Check size={11} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          {plan.prospects_limit && (
            <p className="text-xs text-gray-400">Limite : {plan.prospects_limit} prospects</p>
          )}
        </div>
      ))}
    </div>
  )
}

// Feature flags tab
function FlagsTab() {
  const qc = useQueryClient()
  const { data: flags = [], isLoading } = useQuery<Flag[]>({
    queryKey: ['admin_flags'],
    queryFn: async () => {
      const { data, error } = await supabase.from('feature_flags').select('*').order('label')
      if (error) throw error
      return data ?? []
    },
  })

  const update = useMutation({
    mutationFn: async ({ key, status }: { key: string; status: Flag['status'] }) => {
      const { error } = await supabase
        .from('feature_flags')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('key', key)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin_flags'] }),
  })

  if (isLoading) return <div className="animate-pulse h-40 rounded-xl bg-gray-100" />

  if (flags.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[#e4e7f8] p-12 text-center">
        <p className="text-2xl mb-2">🚩</p>
        <p className="text-sm font-semibold text-gray-700">Aucun feature flag</p>
        <p className="text-xs text-gray-400 mt-1">Appliquez la migration 005_admin_tables.sql pour initialiser les flags.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[#e4e7f8] bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#e4e7f8] text-xs text-gray-400">
            <th className="px-5 py-3 text-left font-semibold">Flag</th>
            <th className="px-5 py-3 text-left font-semibold">Clé</th>
            <th className="px-5 py-3 text-left font-semibold">Statut</th>
            <th className="px-5 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {flags.map(flag => (
            <tr key={flag.key} className="border-b border-[#e4e7f8] last:border-0">
              <td className="px-5 py-3 font-medium text-gray-900">{flag.label}</td>
              <td className="px-5 py-3 text-xs font-mono text-gray-400">{flag.key}</td>
              <td className="px-5 py-3">
                {flag.status === 'on' ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">ON</span>
                ) : flag.status === 'rollout' ? (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600">Rollout {flag.rollout_percent}%</span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">OFF</span>
                )}
              </td>
              <td className="px-5 py-3">
                <div className="flex gap-1.5">
                  {(['on', 'rollout', 'off'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => update.mutate({ key: flag.key, status: s })}
                      disabled={flag.status === s}
                      className={cn(
                        'rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors disabled:opacity-40',
                        flag.status === s
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-[#e4e7f8] text-gray-600 hover:border-indigo-300'
                      )}
                    >
                      {s === 'on' ? 'ON' : s === 'off' ? 'OFF' : 'Rollout'}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Platform settings tab
function SettingsTab() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-[#e4e7f8] p-12 text-center">
      <p className="text-2xl mb-2">⚙️</p>
      <p className="text-sm font-semibold text-gray-700">Paramètres globaux</p>
      <p className="text-xs text-gray-400 mt-1">Éditeur de platform_settings — disponible dans une prochaine mise à jour.</p>
    </div>
  )
}

export default function AdminConfig() {
  const [tab, setTab] = useState<Tab>('Plans & tarifs')

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Zap size={18} className="text-indigo-600" />
        <div>
          <h1 className="text-xl font-black text-gray-900">Configuration</h1>
          <p className="text-sm text-gray-400 mt-0.5">Plans, feature flags et paramètres globaux</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-[#e4e7f8] bg-white p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-lg px-4 py-2 text-xs font-semibold transition-colors',
              tab === t ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Plans & tarifs' && <PlansTab />}
      {tab === 'Feature flags' && <FlagsTab />}
      {tab === 'Paramètres' && <SettingsTab />}
    </div>
  )
}
