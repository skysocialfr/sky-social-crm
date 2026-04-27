import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import KpiCard from '@/components/dashboard/KpiCard'
import HotDealsCard from '@/components/dashboard/HotDealsCard'
import TodayTasksCard from '@/components/dashboard/TodayTasksCard'
import GoalCard from '@/components/dashboard/GoalCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import TeamCard from '@/components/dashboard/TeamCard'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useProspects } from '@/hooks/useProspects'
import { useAuth } from '@/hooks/useAuth'
import { dicebearAvatar } from '@/lib/avatar'

export default function DashboardPage() {
  const { stats, isLoading } = useDashboardStats()
  const { data: prospects } = useProspects()
  const navigate = useNavigate()
  const { user } = useAuth()

  const email = user?.email ?? ''
  const rawFirst = email.split('@')[0].split('.')[0].split('_')[0]
  const firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1) || 'vous'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-[88px] rounded-card bg-border" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-card bg-border" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-40 rounded-card bg-border" />
          <div className="lg:col-span-2 h-40 rounded-card bg-border" />
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome banner */}
      <div className="rounded-card shadow-card border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <img
          src={dicebearAvatar(email || firstName)}
          alt=""
          width={52}
          height={52}
          className="rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[18px] font-black text-text tracking-tight">
            {greeting}, {firstName} 👋
          </p>
          <p className="text-[13px] text-muted mt-0.5 leading-relaxed">
            {stats.followupOverdue > 0 && (
              <>
                <strong className="text-crm-red">
                  {stats.followupOverdue} relance{stats.followupOverdue > 1 ? 's' : ''} en retard
                </strong>
                {(stats.followupToday > 0 || stats.hotProspects > 0) && ', '}
              </>
            )}
            {stats.followupToday > 0 && (
              <>
                <strong className="text-crm-amber">
                  {stats.followupToday} à faire aujourd'hui
                </strong>
                {stats.hotProspects > 0 && ', et '}
              </>
            )}
            {stats.hotProspects > 0 && (
              <>
                <strong className="text-crm-green">
                  {stats.hotProspects} deal{stats.hotProspects > 1 ? 's' : ''} chaud
                  {stats.hotProspects > 1 ? 's' : ''}
                </strong>
                {' '}à suivre.
              </>
            )}
            {stats.followupOverdue === 0 && stats.followupToday === 0 && stats.hotProspects === 0 && (
              'Tout est à jour, beau travail !'
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => navigate('/app/relances')}
            className="flex items-center gap-1.5 rounded-btn border border-border bg-card px-3 py-2 text-xs font-bold text-text hover:bg-bg transition-colors"
          >
            📅 Mes relances
          </button>
          <button
            onClick={() => navigate('/app/prospects')}
            className="flex items-center gap-1.5 rounded-btn px-3 py-2 text-xs font-bold text-white hover:shadow-primary transition-shadow"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f52d4)' }}
          >
            <Plus size={13} />
            Nouveau prospect
          </button>
        </div>
      </div>

      {/* Overdue alert */}
      {stats.followupOverdue > 0 && (
        <button
          onClick={() => navigate('/app/relances')}
          className="flex items-center gap-2.5 rounded-btn border border-crm-red bg-crm-red-light px-4 py-2.5 text-left hover:opacity-80 transition-opacity"
        >
          <span className="text-[15px]">🚨</span>
          <span className="text-sm text-crm-red flex-1">
            <strong>
              {stats.followupOverdue} relance{stats.followupOverdue > 1 ? 's' : ''} en retard
            </strong>
            {' '}— à traiter en urgence
          </span>
          <span className="text-xs font-bold text-crm-red">Voir →</span>
        </button>
      )}

      {/* 4 KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="Prospects actifs"
          value={stats.totalProspects}
          color="#6366f1"
          sparkData={stats.sparkProspects}
          trend={stats.totalTrend}
        />
        <KpiCard
          title="Revenus potentiels"
          value={`${(stats.potentialRevenue / 1000).toFixed(0)}k €`}
          color="#16a34a"
          sparkData={stats.sparkRevenue}
          trend={stats.revenueTrend}
        />
        <KpiCard
          title="Taux conversion"
          value={`${stats.conversionRate}%`}
          color="#7c3aed"
          sparkData={stats.sparkConversion}
          trend={stats.conversionTrend}
        />
        <KpiCard
          title="Deals chauds"
          value={stats.hotProspects}
          color="#dc2626"
          sparkData={stats.sparkHot}
          trend={stats.hotTrend}
        />
      </div>

      {/* Goal + Revenue chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GoalCard
          monthlyRevenue={stats.monthlyRevenue}
          monthlyGoal={stats.monthlyGoal}
          wonThisMonth={stats.wonThisMonth}
        />
        <div className="lg:col-span-2 rounded-card shadow-card border border-border bg-card p-5">
          <RevenueChart
            months={stats.revenueMonths}
            won={stats.revenueWon}
            pipeline={stats.revenuePipeline}
          />
        </div>
      </div>

      {/* Hot Deals + Team */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <HotDealsCard prospects={prospects ?? []} />
        </div>
        <div className="lg:col-span-2">
          <TeamCard />
        </div>
      </div>

      {/* Tasks + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <TodayTasksCard prospects={prospects ?? []} />
        </div>
        <div className="lg:col-span-3">
          <ActivityFeed />
        </div>
      </div>

      {/* Empty state */}
      {stats.totalProspects === 0 && (
        <div className="rounded-card border-2 border-dashed border-border p-10 text-center">
          <p className="text-lg font-bold text-text mb-2">Bienvenue sur Sky Social CRM !</p>
          <p className="text-sm text-muted mb-5">Commencez par ajouter votre premier prospect.</p>
          <button
            onClick={() => navigate('/app/prospects')}
            className="inline-flex items-center gap-2 rounded-btn bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover transition-colors shadow-primary"
          >
            <Plus size={15} /> Ajouter un prospect
          </button>
        </div>
      )}
    </div>
  )
}
