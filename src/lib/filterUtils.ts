import type { Prospect } from '@/types'

export interface FilterCondition {
  field: string
  operator: string
  value: string
}

export const FILTER_FIELDS = [
  { key: 'company_name', label: 'Entreprise', type: 'text' },
  { key: 'first_name', label: 'Prénom', type: 'text' },
  { key: 'last_name', label: 'Nom', type: 'text' },
  { key: 'sector', label: 'Secteur', type: 'text' },
  { key: 'city', label: 'Ville', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'stage', label: 'Étape', type: 'text' },
  { key: 'priority', label: 'Priorité', type: 'text' },
  { key: 'channel', label: 'Canal', type: 'text' },
  { key: 'deal_value', label: 'Valeur (€)', type: 'number' },
]

export const TEXT_OPERATORS = [
  { key: 'contains', label: 'contient' },
  { key: 'not_contains', label: 'ne contient pas' },
  { key: 'equals', label: 'est exactement' },
  { key: 'is_empty', label: 'est vide' },
  { key: 'is_not_empty', label: 'est renseigné' },
]

export const NUMBER_OPERATORS = [
  { key: 'eq', label: '=' },
  { key: 'gt', label: '>' },
  { key: 'gte', label: '>=' },
  { key: 'lt', label: '<' },
  { key: 'lte', label: '<=' },
  { key: 'is_empty', label: 'est vide' },
]

export function evaluateConditions(prospect: Prospect, conditions: FilterCondition[]): boolean {
  return conditions.every((cond) => evaluateCondition(prospect, cond))
}

function evaluateCondition(prospect: Prospect, cond: FilterCondition): boolean {
  const raw = (prospect as Record<string, unknown>)[cond.field]
  const val = raw == null ? '' : String(raw).toLowerCase()
  const target = cond.value.toLowerCase()

  switch (cond.operator) {
    case 'contains':      return val.includes(target)
    case 'not_contains':  return !val.includes(target)
    case 'equals':        return val === target
    case 'is_empty':      return val === '' || raw == null
    case 'is_not_empty':  return val !== '' && raw != null
    case 'eq':            return parseFloat(val) === parseFloat(cond.value)
    case 'gt':            return parseFloat(val) > parseFloat(cond.value)
    case 'gte':           return parseFloat(val) >= parseFloat(cond.value)
    case 'lt':            return parseFloat(val) < parseFloat(cond.value)
    case 'lte':           return parseFloat(val) <= parseFloat(cond.value)
    default:              return true
  }
}
