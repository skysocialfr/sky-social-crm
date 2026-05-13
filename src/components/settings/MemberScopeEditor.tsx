import { useMemo } from 'react'
import { Eye, Lock } from 'lucide-react'
import { listDelegableFields } from '@/lib/scopeMatcher'
import { cn } from '@/lib/cn'
import type { CustomFieldsSchema, TeamScopes, TeamVisibilityMode } from '@/types'

interface Props {
  schema: CustomFieldsSchema | null
  visibilityMode: TeamVisibilityMode
  scopes: TeamScopes
  onChangeVisibilityMode: (mode: TeamVisibilityMode) => void
  onChangeScopes: (scopes: TeamScopes) => void
  disabled?: boolean
}

/**
 * Editor block for a team member's visibility settings: visibility_mode +
 * the multi-select of allowed values for each delegable field in the team
 * schema. Reused by InviteMemberModal (initial config) and by TeamSettings
 * (editing an existing member).
 */
export default function MemberScopeEditor({
  schema,
  visibilityMode,
  scopes,
  onChangeVisibilityMode,
  onChangeScopes,
  disabled,
}: Props) {
  const delegableFields = useMemo(() => listDelegableFields(schema), [schema])

  const toggleValue = (key: string, value: string) => {
    const current = scopes[key] ?? []
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    const updated = { ...scopes }
    if (next.length === 0) delete updated[key]
    else updated[key] = next
    onChangeScopes(updated)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-card border border-border bg-card p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-3">
          Visibilité
        </p>
        <div className="flex flex-col gap-2">
          <label className={cn(
            'flex cursor-pointer items-start gap-3 rounded-btn border p-3 transition-colors',
            visibilityMode === 'scope_only' ? 'border-primary bg-primary-light' : 'border-border hover:border-primary/50',
            disabled && 'opacity-60 cursor-not-allowed',
          )}>
            <input
              type="radio"
              name="visibility_mode"
              checked={visibilityMode === 'scope_only'}
              onChange={() => !disabled && onChangeVisibilityMode('scope_only')}
              disabled={disabled}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-text">
                <Lock size={13} /> Périmètre uniquement
              </div>
              <p className="text-[12px] text-muted mt-0.5">
                Le membre ne voit que les prospects qui correspondent à son périmètre, ses propres créations, et les prospects qui lui sont assignés.
              </p>
            </div>
          </label>

          <label className={cn(
            'flex cursor-pointer items-start gap-3 rounded-btn border p-3 transition-colors',
            visibilityMode === 'read_all' ? 'border-primary bg-primary-light' : 'border-border hover:border-primary/50',
            disabled && 'opacity-60 cursor-not-allowed',
          )}>
            <input
              type="radio"
              name="visibility_mode"
              checked={visibilityMode === 'read_all'}
              onChange={() => !disabled && onChangeVisibilityMode('read_all')}
              disabled={disabled}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-text">
                <Eye size={13} /> Lecture totale + édition périmètre
              </div>
              <p className="text-[12px] text-muted mt-0.5">
                Le membre voit toute la base de l'équipe en lecture, mais ne peut modifier que les prospects dans son périmètre.
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="rounded-card border border-border bg-card p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
          Périmètre
        </p>
        <p className="text-[12px] text-muted mb-3">
          Cochez les valeurs autorisées pour chaque rubrique déléguable. Une rubrique sans cases cochées = aucune restriction sur cette rubrique.
        </p>

        {delegableFields.length === 0 ? (
          <div className="rounded-btn border border-dashed border-border bg-bg/50 px-3 py-4 text-center">
            <p className="text-[12px] text-muted">
              Aucune rubrique déléguable. Pour en créer une, allez dans <strong>Réglages → Rubriques & champs</strong>, créez un champ de type « Liste déroulante » et cochez « Déléguable par membre ».
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {delegableFields.map((field) => {
              const allowed = scopes[field.key] ?? []
              const isUnrestricted = allowed.length === 0
              return (
                <div key={field.key} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-text">{field.label}</p>
                    {isUnrestricted && (
                      <span className="rounded-pill bg-bg px-2 py-0.5 text-[10px] font-semibold uppercase text-muted">
                        toutes les valeurs
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {field.options.map((opt) => {
                      const isOn = allowed.includes(opt)
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => !disabled && toggleValue(field.key, opt)}
                          disabled={disabled}
                          className={cn(
                            'rounded-pill border px-3 py-1 text-xs font-medium transition-colors',
                            isOn
                              ? 'border-primary bg-primary text-white'
                              : 'border-border bg-card text-text hover:border-primary/50',
                            disabled && 'opacity-60 cursor-not-allowed',
                          )}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
