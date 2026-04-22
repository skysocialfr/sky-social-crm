import { useNavigate } from 'react-router-dom'
import { Users, TrendingUp, Target, Flame, Bell, AlertTriangle, Plus } from 'lucide-react'
import KpiCard from '@/components/dashboard/KpiCard'
import FunnelChart from '@/components/dashboard/FunnelChart'
import ChannelChart from '@/components/dashboard/ChannelChart'
import FollowUpAlert from '@/components/dashboard/FollowUpAlert'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useTheme } from '@/context/ThemeContext'

export default function DashboardPage() {
  const { stats, isLoading } = useDashboardStats()
  const navigate = useNavigate()
  const { profile } = useTheme()
  const companyName = profile?.company_name || 'Sky Social'

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-muted" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="flex flex-col gap-5">
      {/* Alert banner */}
      <FollowUpAlert overdue={stats.followupOverdue} today={stats.followupToday} />

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KpiCard
          title="Total prospects"
          value={stats.totalProspects}
          icon={Users}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          description="dans votre pipeline"
        />
        <KpiCard
          title="Revenus potentiels"
          value={`${stats.potentialRevenue.toLocaleString('fr-FR')} €`}
          icon={TrendingUp}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          description="valeur estimée totale"
        />
        <KpiCard
          title="Taux de conversion"
          value={`${stats.conversionRate} %`}
          icon={Target}
          iconColor="text-violet-600 dark:text-violet-400"
          iconBg="bg-violet-100 dark:bg-violet-900/30"
          description="prospects gagnés"
        />
        <KpiCard
          title="Prospects chauds"
          value={stats.hotProspects}
          icon={Flame}
          iconColor="text-orange-600 dark:text-orange-400"
          iconBg="bg-orange-100 dark:bg-orange-900/30"
          description="priorité haute"
        />
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

      {/* Quick actions */}
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
