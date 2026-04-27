import { useMemo } from 'react'
import { parseISO, differenceInDays, subMonths, isSameMonth, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useProspects } from './useProspects'
import { PIPELINE_STAGES, CHANNELS } from '@/lib/constants'

export interface ChannelStat {
  channel: string
  total: number
  won: number
  rate: number
}

export interface FunnelStep {
  stage: string
  count: number
  pct: number
}

export interface AnalyticsData {
  avgCycleDays: number
  avgDealValue: number
  topChannel: string
  topChannelRate: number
  revenueMonths: string[]
  revenueByMonth: number[]
  conversionByMonth: number[]
  funnelData: FunnelStep[]
  totalWon: number
  totalLost: number
  channelBreakdown: ChannelStat[]
}

export function useAnalytics(): { data: AnalyticsData | null; isLoading: boolean } {
  const { data: prospects = [], isLoading } = useProspects()

  const data = useMemo<AnalyticsData | null>(() => {
    if (!prospects.length) return null

    const won = prospects.filter((p) => p.stage === 'Gagné')
    const lost = prospects.filter((p) => p.stage === 'Perdu')

    // Average deal cycle (creation → Gagné)
    const avgCycleDays =
      won.length > 0
        ? Math.round(
            won.reduce(
              (s, p) => s + differenceInDays(parseISO(p.updated_at), parseISO(p.created_at)),
              0
            ) / won.length
          )
        : 0

    // Average deal value (won only)
    const wonWithValue = won.filter((p) => p.deal_value != null)
    const avgDealValue =
      wonWithValue.length > 0
        ? Math.round(wonWithValue.reduce((s, p) => s + (p.deal_value ?? 0), 0) / wonWithValue.length)
        : 0

    // Channel breakdown + top channel
    const channelBreakdown: ChannelStat[] = CHANNELS.map((ch) => {
      const total = prospects.filter((p) => p.channel === ch).length
      const wonCount = prospects.filter((p) => p.channel === ch && p.stage === 'Gagné').length
      const rate = total > 0 ? Math.round((wonCount / total) * 100) : 0
      return { channel: ch, total, won: wonCount, rate }
    })
      .filter((c) => c.total > 0)
      .sort((a, b) => b.rate - a.rate)

    const topChannel = channelBreakdown[0]

    // 7-month revenue + conversion cohort
    const now = new Date()
    const revenueMonths: string[] = []
    const revenueByMonth: number[] = []
    const conversionByMonth: number[] = []

    for (let i = 6; i >= 0; i--) {
      const month = subMonths(now, i)
      revenueMonths.push(format(month, 'MMM', { locale: fr }))

      revenueByMonth.push(
        won
          .filter((p) => isSameMonth(parseISO(p.updated_at), month))
          .reduce((s, p) => s + (p.deal_value ?? 0), 0)
      )

      const cohort = prospects.filter((p) => isSameMonth(parseISO(p.created_at), month))
      const cohortWon = cohort.filter((p) => p.stage === 'Gagné')
      conversionByMonth.push(
        cohort.length > 0 ? Math.round((cohortWon.length / cohort.length) * 100) : 0
      )
    }

    // Funnel: % of non-lost prospects reaching each stage or further
    const nonLost = prospects.filter((p) => p.stage !== 'Perdu')
    const activeStages = PIPELINE_STAGES.filter((s) => s !== 'Perdu')
    const funnelData: FunnelStep[] = activeStages.map((stage) => {
      const stageIdx = PIPELINE_STAGES.indexOf(stage)
      const atOrPast = nonLost.filter(
        (p) => PIPELINE_STAGES.indexOf(p.stage) >= stageIdx
      ).length
      const pct = nonLost.length > 0 ? Math.round((atOrPast / nonLost.length) * 100) : 0
      return { stage, count: atOrPast, pct }
    })

    return {
      avgCycleDays,
      avgDealValue,
      topChannel: topChannel?.channel ?? '—',
      topChannelRate: topChannel?.rate ?? 0,
      revenueMonths,
      revenueByMonth,
      conversionByMonth,
      funnelData,
      totalWon: won.length,
      totalLost: lost.length,
      channelBreakdown,
    }
  }, [prospects])

  return { data, isLoading }
}
