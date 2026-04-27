import { useMemo } from 'react'
import { isToday, isBefore, parseISO, startOfDay, subMonths, isSameMonth, format } from 'date-fns'
import { fr } from 'date-fns/locale'
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
    const followupToday = active.filter(
      (p) => p.next_followup_date && isToday(parseISO(p.next_followup_date))
    ).length
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
      const sp = prospects.filter((p) => p.stage === stage)
      return { stage, count: sp.length, value: sp.reduce((s, p) => s + (p.deal_value ?? 0), 0) }
    })

    const channelMap = new Map<string, number>()
    prospects.forEach((p) => channelMap.set(p.channel, (channelMap.get(p.channel) ?? 0) + 1))
    const byChannel = Array.from(channelMap.entries()).map(([channel, count]) => ({ channel, count }))

    // v3 — sparklines: 7 bi-weekly snapshots based on created_at cumulative counts
    const now = new Date()
    const sparkProspects: number[] = []
    const sparkRevenue: number[] = []
    const sparkConversion: number[] = []
    const sparkHot: number[] = []

    for (let i = 6; i >= 0; i--) {
      const cutoff = subMonths(now, i * 0.5)
      const slice = prospects.filter((p) => parseISO(p.created_at) <= cutoff)
      const wonSlice = slice.filter((p) => p.stage === 'Gagné')
      const hotSlice = slice.filter(
        (p) => p.priority === 'Chaud' && p.stage !== 'Perdu' && p.stage !== 'Gagné'
      )
      sparkProspects.push(slice.length)
      sparkRevenue.push(
        slice.filter((p) => p.stage !== 'Perdu').reduce((s, p) => s + (p.deal_value ?? 0), 0)
      )
      sparkConversion.push(
        slice.length > 0 ? Math.round((wonSlice.length / slice.length) * 100) : 0
      )
      sparkHot.push(hotSlice.length)
    }

    // v3 — trends: last 30 days vs previous 30 days
    const d30 = new Date(now.getTime() - 30 * 86400000)
    const d60 = new Date(now.getTime() - 60 * 86400000)
    const recent = prospects.filter((p) => parseISO(p.created_at) >= d30)
    const previous = prospects.filter((p) => {
      const d = parseISO(p.created_at)
      return d >= d60 && d < d30
    })
    const recentWon = recent.filter((p) => p.stage === 'Gagné')
    const prevWon = previous.filter((p) => p.stage === 'Gagné')

    const calcTrend = (a: number, b: number) =>
      b === 0 ? (a > 0 ? 100 : 0) : Math.round(((a - b) / b) * 100)

    const totalTrend = calcTrend(recent.length, previous.length)
    const revenueTrend = calcTrend(
      recent.reduce((s, p) => s + (p.deal_value ?? 0), 0),
      previous.reduce((s, p) => s + (p.deal_value ?? 0), 0)
    )
    const conversionTrend = calcTrend(
      recent.length > 0 ? Math.round((recentWon.length / recent.length) * 100) : 0,
      previous.length > 0 ? Math.round((prevWon.length / previous.length) * 100) : 0
    )
    const recentHot = recent.filter(
      (p) => p.priority === 'Chaud' && p.stage !== 'Perdu' && p.stage !== 'Gagné'
    )
    const prevHot = previous.filter(
      (p) => p.priority === 'Chaud' && p.stage !== 'Perdu' && p.stage !== 'Gagné'
    )
    const hotTrend = calcTrend(recentHot.length, prevHot.length)

    // v3 — 7-month revenue chart
    const revenueMonths: string[] = []
    const revenueWon: number[] = []
    const revenuePipeline: number[] = []
    for (let i = 6; i >= 0; i--) {
      const month = subMonths(now, i)
      revenueMonths.push(format(month, 'MMM', { locale: fr }))
      revenueWon.push(
        won
          .filter((p) => isSameMonth(parseISO(p.updated_at), month))
          .reduce((s, p) => s + (p.deal_value ?? 0), 0)
      )
      revenuePipeline.push(
        active
          .filter((p) => p.stage !== 'Gagné' && isSameMonth(parseISO(p.created_at), month))
          .reduce((s, p) => s + (p.deal_value ?? 0), 0)
      )
    }

    const wonThisMonth = won.filter((p) => isSameMonth(parseISO(p.updated_at), now)).length
    const monthlyRevenue = won
      .filter((p) => isSameMonth(parseISO(p.updated_at), now))
      .reduce((s, p) => s + (p.deal_value ?? 0), 0)
    const monthlyGoal = Math.max(monthlyRevenue * 1.5, potentialRevenue * 0.1, 5000)

    return {
      totalProspects: prospects.length,
      potentialRevenue,
      conversionRate,
      hotProspects: hot.length,
      followupToday,
      followupOverdue,
      byStage,
      byChannel,
      sparkProspects,
      sparkRevenue,
      sparkConversion,
      sparkHot,
      totalTrend,
      revenueTrend,
      conversionTrend,
      hotTrend,
      monthlyRevenue,
      monthlyGoal,
      wonThisMonth,
      revenueMonths,
      revenueWon,
      revenuePipeline,
    }
  }, [prospects])

  return { stats, isLoading }
}
