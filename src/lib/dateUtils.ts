import { format, formatDistanceToNow, isToday, isBefore, parseISO, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return format(parseISO(date), 'd MMM yyyy', { locale: fr })
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—'
  return format(parseISO(date), 'd MMM yyyy à HH:mm', { locale: fr })
}

export function formatRelative(date: string | null | undefined): string {
  if (!date) return '—'
  return formatDistanceToNow(parseISO(date), { locale: fr, addSuffix: true })
}

export function isOverdue(date: string | null | undefined): boolean {
  if (!date) return false
  return isBefore(startOfDay(parseISO(date)), startOfDay(new Date()))
}

export function isDueToday(date: string | null | undefined): boolean {
  if (!date) return false
  return isToday(parseISO(date))
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
