import { useMemo } from 'react'
import { isToday, isBefore, parseISO, startOfDay } from 'date-fns'
import { useProspects } from './useProspects'
import { PIPELINE_STAGES } from '@/lib/constants'
import type { DashboardStats } from '@/types'

export function useDashboardStats(): { stats: DashboardStats | null; isLoading: boolean } {
  const { data: prospects, isLoading } = useProspects()

  const stats = useMemo<DashboardStats | null>(() => {
    if (!prospects) return null

    const active = prospects.filter((p) => p.stage !== 'Perdu')
    const won = prospects.filter((p) => p.stage === 'Gagné')
    const hot = prospects.filter((p) => p.priority === 'Chaud' && p.stage !== 'Perdu' && p.stage !== 'Gagné')

    const today = startOfDay(new Date())
    const followupToday = active.filter((p) => p.next_followup_date && isToday(parseISO(p.next_followup_date))).length
    const followupOverdue = active.filter(
      (p) =>
        p.next_followup_date &&
        !isToday(parseISO(p.next_followup_date)) &&
        isBefore(startOfDay(parseISO(p.next_followup_date)), today)
    ).length

    const potentialRevenue = active
      .filter((p) => p.deal_value != null)
      .reduce((sum, p) => sum + (p.deal_value ?? 0), 0)

    const conversionRate =
      prospects.length > 0 ? Math.round((won.length / prospects.length) * 100) : 0

    const byStage = PIPELINE_STAGES.map((stage) => {
      const stageProspects = prospects.filter((p) => p.stage === stage)
      return {
        stage,
        count: stageProspects.length,
        value: stageProspects.reduce((s, p) => s + (p.deal_value ?? 0), 0),
      }
    })

    const channelMap = new Map<string, number>()
    prospects.forEach((p) => {
      channelMap.set(p.channel, (channelMap.get(p.channel) ?? 0) + 1)
    })
    const byChannel = Array.from(channelMap.entries()).map(([channel, count]) => ({ channel, count }))

    return {
      totalProspects: prospects.length,
      potentialRevenue,
      conversionRate,
      hotProspects: hot.length,
      followupToday,
      followupOverdue,
      byStage,
      byChannel,
    }
  }, [prospects])

  return { stats, isLoading }
}
