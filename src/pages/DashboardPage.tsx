import { useNavigate } from 'react-router-dom'
import { Users, TrendingUp, Target, Flame, Bell, AlertTriangle, Plus, Calendar } from 'lucide-react'
import KpiCard from '@/components/dashboard/KpiCard'
import FunnelChart from '@/components/dashboard/FunnelChart'
import ChannelChart from '@/components/dashboard/ChannelChart'
import HotDealsCard from '@/components/dashboard/HotDealsCard'
import TodayTasksCard from '@/components/dashboard/TodayTasksCard'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useProspects } from '@/hooks/useProspects'
import { useTheme } from '@/context/ThemeContext'

export default function DashboardPage() {
  const { stats, isLoading } = useDashboardStats()
  const { data: prospects } = useProspects()
  const navigate = useNavigate()
  const { profile } = useTheme()
  const companyName = profile?.company_name || 'Sky Social'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome banner — rich */}
      <div className="rounded-xl border border-border bg-card p-5 flex flex-col lg:flex-row lg:items-center gap-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-white text-lg font-black flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          {(companyName[0] || 'S').toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-black text-foreground tracking-tight">
            {greeting}, {companyName} 👋
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {stats.followupOverdue > 0 && (
              <>
                Vous avez{' '}
                <strong className="text-red-600 dark:text-red-400">
                  {stats.followupOverdue} relance{stats.followupOverdue > 1 ? 's' : ''} en retard
                </strong>
                {(stats.followupToday > 0 || stats.hotProspects > 0) && ', '}
              </>
            )}
            {stats.followupToday > 0 && (
              <>
                <strong className="text-amber-600 dark:text-amber-400">
                  {stats.followupToday} à faire aujourd'hui
                </strong>
                {stats.hotProspects > 0 && ', et '}
              </>
            )}
            {stats.hotProspects > 0 && (
              <>
                <strong className="text-orange-600 dark:text-orange-400">
                  {stats.hotProspects} deal{stats.hotProspects > 1 ? 's' : ''} chaud{stats.hotProspects > 1 ? 's' : ''}
                </strong>{' '}
                à suivre.
              </>
            )}
            {stats.followupOverdue === 0 && stats.followupToday === 0 && stats.hotProspects === 0 && (
              <>Tout est à jour, beau travail !</>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => navigate('/app/relances')}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors"
          >
            <Calendar size={13} />
            Mes relances
          </button>
          <button
            onClick={() => navigate('/app/prospects')}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-white hover:opacity-90 transition-opacity shadow-md"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
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
          className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-left hover:bg-red-100 transition-colors dark:border-red-700 dark:bg-red-900/20 dark:hover:bg-red-900/30"
        >
          <AlertTriangle size={14} className="text-red-600 dark:text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-700 dark:text-red-300 flex-1">
            <strong>{stats.followupOverdue} relance{stats.followupOverdue > 1 ? 's' : ''} en retard</strong>
            {' '}— à traiter en urgence
          </span>
          <span className="text-xs font-bold text-red-700 dark:text-red-400">Voir →</span>
        </button>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title="Prospects actifs"
          value={stats.totalProspects}
          icon={Users}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          description="dans le pipeline"
        />
        <KpiCard
          title="Revenus potentiels"
          value={`${(stats.potentialRevenue / 1000).toFixed(0)}k €`}
          icon={TrendingUp}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          description="valeur estimée"
        />
        <KpiCard
          title="Taux de conversion"
          value={`${stats.conversionRate}%`}
          icon={Target}
          iconColor="text-violet-600 dark:text-violet-400"
          iconBg="bg-violet-100 dark:bg-violet-900/30"
          description="prospects → clients"
        />
        <KpiCard
          title="Deals chauds"
          value={stats.hotProspects}
          icon={Flame}
          iconColor="text-orange-600 dark:text-orange-400"
          iconBg="bg-orange-100 dark:bg-orange-900/30"
          description="à closer"
        />
      </div>

      {/* Hot Deals + Today's Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <HotDealsCard prospects={prospects ?? []} />
        </div>
        <div className="lg:col-span-2">
          <TodayTasksCard prospects={prospects ?? []} />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-1">Pipeline par étape</p>
          <p className="text-xs text-muted-foreground mb-4">Nombre de prospects à chaque étape</p>
          <FunnelChart byStage={stats.byStage} />
        </div>
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-1">Canaux de prospection</p>
          <p className="text-xs text-muted-foreground mb-4">Répartition par source</p>
          <ChannelChart byChannel={stats.byChannel} />
        </div>
      </div>

      {/* Secondary KPIs — followup focus */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          title="Relances aujourd'hui"
          value={stats.followupToday}
          icon={Bell}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          description="à contacter"
        />
        <KpiCard
          title="Relances en retard"
          value={stats.followupOverdue}
          icon={AlertTriangle}
          alert={stats.followupOverdue > 0}
          description="à traiter en urgence"
        />
      </div>

      {/* Empty state */}
      {stats.totalProspects === 0 && (
        <div className="rounded-xl border-2 border-dashed border-border p-10 text-center">
          <p className="text-lg font-semibold text-foreground mb-2">Bienvenue sur {companyName} CRM !</p>
          <p className="text-sm text-muted-foreground mb-5">Commencez par ajouter votre premier prospect.</p>
          <button
            onClick={() => navigate('/app/prospects')}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} /> Ajouter un prospect
          </button>
        </div>
      )}
    </div>
  )
}
