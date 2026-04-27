// Admin pages A — Dashboard, Organisations, Utilisateurs, Facturation
const { useState: useStateA, useMemo: useMemoA } = React

// ==================== DASHBOARD ====================
function AdminDashboard() {
  const m = window.ADMIN.metrics
  const [period, setPeriod] = useStateA('30j')

  return (
    <div style={pageStyles.scroll}>
      <AdminTopBar
        title="Vue d'ensemble"
        subtitle="État général de Sky Social CRM — toutes organisations confondues"
        right={
          <>
            <SegmentedToggle options={['7j','30j','90j','12m']} value={period} onChange={setPeriod} />
            <button style={btn.primary}>Exporter rapport</button>
          </>
        }
      />

      <div style={pageStyles.body}>
        {/* Hero KPIs row */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}}>
          <HeroKpi
            label="REVENUS RÉCURRENTS (MRR)"
            value={fmtEUR(m.mrr)}
            sub={`ARR · ${fmtEUR(m.arr)}`}
            trend={m.mrrTrend}
            spark={m.mrrSeries}
            color="#6366f1"
          />
          <HeroKpi
            label="UTILISATEURS ACTIFS"
            value={fmtNum(m.activeUsers)}
            sub={`${m.paidOrgs} orgs payantes · ${m.trialOrgs} essais`}
            trend={m.activeUsersTrend}
            spark={m.usersSeries}
            color="#0ea5e9"
          />
          <HeroKpi
            label="TAUX DE CHURN"
            value={`${m.churn} %`}
            sub="Mensuel · NRR 108 %"
            trend={m.churnTrend}
            trendGood="down"
            spark={m.churnSeries}
            color="#f59e0b"
          />
          <HeroKpi
            label="NOUVEAUX INSCRITS (30j)"
            value={fmtNum(m.signupsMonth)}
            sub={`${m.signupsToday} aujourd'hui · ${m.signupsWeek} cette semaine`}
            trend={null}
            spark={m.signupSeries}
            color="#22c55e"
          />
        </div>

        {/* Row : MRR chart + plan split */}
        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:14, marginTop:14}}>
          <Card>
            <CardHeader title="Évolution du MRR" subtitle="12 derniers mois" right={<TrendPill value={m.mrrTrend} suffix="%" />} />
            <MRRChart data={m.mrrSeries} height={220} />
          </Card>

          <Card>
            <CardHeader title="Répartition par plan" subtitle={`${m.paidOrgs} organisations payantes`} />
            <div style={{display:'flex', flexDirection:'column', gap:12, marginTop:6}}>
              {m.planSplit.map(p => {
                const totalRev = m.planSplit.reduce((s,x)=>s+x.revenue,0)
                const pct = (p.revenue / totalRev) * 100
                return (
                  <div key={p.name}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:12}}>
                      <span style={{display:'flex', alignItems:'center', gap:7}}>
                        <span style={{width:9, height:9, borderRadius:3, background:p.color}}/>
                        <span style={{fontWeight:700, color:'#1a1c2e'}}>{p.name}</span>
                        <span style={{color:'#9ca3af', fontSize:11}}>· {p.count}</span>
                      </span>
                      <span style={{fontWeight:700, color:'#1a1c2e'}}>{fmtEUR(p.revenue)}</span>
                    </div>
                    <div style={{height:7, background:'#f4f6ff', borderRadius:4, overflow:'hidden'}}>
                      <div style={{width:`${pct}%`, height:'100%', background:p.color, borderRadius:4, transition:'width 0.6s'}}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Row : Top features + Critical alerts */}
        <div style={{display:'grid', gridTemplateColumns:'3fr 2fr', gap:14, marginTop:14}}>
          <Card>
            <CardHeader title="Fonctionnalités les plus utilisées" subtitle="Événements sur 30 jours" />
            <div style={{display:'flex', flexDirection:'column'}}>
              {m.topFeatures.map((f,i) => {
                const max = Math.max(...m.topFeatures.map(x=>x.events))
                const pct = (f.events / max) * 100
                return (
                  <div key={f.name} style={{display:'grid', gridTemplateColumns:'180px 1fr 90px 60px', gap:14, alignItems:'center', padding:'10px 0', borderTop: i===0 ? 'none' : '1px solid #f0f2fa'}}>
                    <div style={{fontSize:13, fontWeight:600, color:'#1a1c2e'}}>{f.name}</div>
                    <div style={{height:6, background:'#f4f6ff', borderRadius:3, overflow:'hidden'}}>
                      <div style={{width:`${pct}%`, height:'100%', background:'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius:3}}/>
                    </div>
                    <div style={{fontSize:13, fontWeight:700, color:'#1a1c2e', textAlign:'right'}}>{fmtNum(f.events)}</div>
                    <div style={{textAlign:'right'}}><TrendPill value={f.trend} suffix="%" /></div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card>
            <CardHeader title="À surveiller" subtitle="Actions admin recommandées" />
            <div style={{display:'flex', flexDirection:'column', gap:9, marginTop:4}}>
              <AlertRow color="#dc2626" icon="⚠️" title="1 paiement échoué" desc="Mainstream Médias — facture INV-2026-03-1102 (199 €)" cta="Relancer" />
              <AlertRow color="#f59e0b" icon="⏰" title="1 facture en retard" desc="Kiwi Marketing — Pro 79 € · 7 jours de retard" cta="Voir" />
              <AlertRow color="#6366f1" icon="🚀" title="2 essais expirent demain" desc="Studio Onze · Boucle Studio" cta="Voir" />
              <AlertRow color="#22c55e" icon="✨" title="3 candidats au upgrade" desc="Limites du plan atteintes — Pro → Business" cta="Cibler" />
            </div>
          </Card>
        </div>

        {/* Bottom row: secondary metrics */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14, marginTop:14}}>
          <SmallStat label="ARPU" value={`${m.arpu} €`} sub="Par utilisateur / mois" />
          <SmallStat label="LTV" value={fmtEUR(m.ltv)} sub="Lifetime value moyenne" />
          <SmallStat label="CAC" value={`${m.cac} €`} sub="Coût d'acquisition" />
          <SmallStat label="LTV / CAC" value={(m.ltv/m.cac).toFixed(1)+'×'} sub="Ratio santé business" highlight />
        </div>
      </div>
    </div>
  )
}

// MRR chart (bars)
function MRRChart({ data, height = 200 }) {
  const max = Math.max(...data) * 1.1
  const months = ['Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc','Jan','Fév','Mar','Avr']
  return (
    <div style={{display:'flex', alignItems:'flex-end', gap:10, height, padding:'18px 4px 8px', borderBottom:'1px solid #f0f2fa'}}>
      {data.map((v,i) => {
        const h = (v / max) * (height - 30)
        const last = i === data.length - 1
        return (
          <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
            <div style={{fontSize:10, fontWeight:700, color:last?'#6366f1':'#9ca3af'}}>{fmtEUR(v).replace(' €','')}</div>
            <div style={{
              width:'100%', height:h,
              background: last ? 'linear-gradient(180deg, #6366f1, #4f52d4)' : 'linear-gradient(180deg, #c7d0ff, #a5b1f0)',
              borderRadius:'6px 6px 0 0',
              transition:'height 0.6s',
            }}/>
            <div style={{fontSize:10, color:'#9ca3af', fontWeight:600}}>{months[i]}</div>
          </div>
        )
      })}
    </div>
  )
}

function HeroKpi({ label, value, sub, trend, trendGood='up', spark, color }) {
  return (
    <div style={{
      background:'#fff', border:'1px solid #e4e7f8', borderRadius:14, padding:'16px 18px',
      boxShadow:'0 1px 4px rgba(99,102,241,0.06)',
      display:'flex', flexDirection:'column', gap:10, position:'relative', overflow:'hidden',
    }}>
      <div style={{fontSize:10, fontWeight:700, color:'#9ca3af', letterSpacing:0.6, textTransform:'uppercase'}}>{label}</div>
      <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:10}}>
        <div style={{fontSize:28, fontWeight:800, color:'#1a1c2e', letterSpacing:-0.6}}>{value}</div>
        {trend !== null && <TrendPill value={trend} suffix="%" good={trendGood}/>}
      </div>
      <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:10}}>
        <div style={{fontSize:11, color:'#6b7280'}}>{sub}</div>
        <Sparkline data={spark} w={100} h={32} color={color} fill={color+'22'} />
      </div>
    </div>
  )
}

function SmallStat({ label, value, sub, highlight }) {
  return (
    <div style={{
      background: highlight ? 'linear-gradient(135deg, #6366f1, #4f52d4)' : '#fff',
      border: highlight ? 'none' : '1px solid #e4e7f8',
      borderRadius:14, padding:'14px 16px',
      boxShadow:'0 1px 4px rgba(99,102,241,0.06)',
      color: highlight ? '#fff' : '#1a1c2e',
    }}>
      <div style={{fontSize:10, fontWeight:700, opacity:0.7, letterSpacing:0.6, textTransform:'uppercase'}}>{label}</div>
      <div style={{fontSize:24, fontWeight:800, marginTop:6, letterSpacing:-0.4}}>{value}</div>
      <div style={{fontSize:11, opacity:0.7, marginTop:2}}>{sub}</div>
    </div>
  )
}

function AlertRow({ color, icon, title, desc, cta }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, border:'1px solid #f0f2fa', background:'#fcfdff'}}>
      <div style={{width:32, height:32, borderRadius:8, background:color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14}}>{icon}</div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:13, fontWeight:700, color:'#1a1c2e'}}>{title}</div>
        <div style={{fontSize:11, color:'#6b7280', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{desc}</div>
      </div>
      <button style={{padding:'5px 10px', fontSize:11, fontWeight:700, color:color, background:'transparent', border:`1px solid ${color}40`, borderRadius:7, cursor:'pointer'}}>{cta} →</button>
    </div>
  )
}

// ==================== ORGS ====================
function AdminOrgs() {
  const orgs = window.ADMIN.orgs
  const [search, setSearch] = useStateA('')
  const [planFilter, setPlanFilter] = useStateA('Tous')
  const [statusFilter, setStatusFilter] = useStateA('Tous')

  const filtered = useMemoA(() => orgs.filter(o => {
    if (search && !o.name.toLowerCase().includes(search.toLowerCase()) && !o.owner.toLowerCase().includes(search.toLowerCase())) return false
    if (planFilter !== 'Tous' && o.plan !== planFilter) return false
    if (statusFilter !== 'Tous' && o.status !== statusFilter) return false
    return true
  }), [orgs, search, planFilter, statusFilter])

  return (
    <div style={pageStyles.scroll}>
      <AdminTopBar
        title="Organisations"
        subtitle={`${orgs.length} organisations · ${orgs.filter(o=>o.status==='Actif').length} actives · ${orgs.filter(o=>o.status==='Trial').length} en essai`}
        right={<button style={btn.primary}>+ Créer une organisation</button>}
      />
      <div style={pageStyles.body}>
        {/* Filtres */}
        <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', marginBottom:14}}>
          <div style={{position:'relative', flex:1, minWidth:240, maxWidth:380}}>
            <span style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:13}}>🔍</span>
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Rechercher une organisation, un propriétaire…"
              style={{width:'100%', padding:'10px 12px 10px 34px', background:'#fff', border:'1px solid #e4e7f8', borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit'}}/>
          </div>
          <Select value={planFilter} onChange={setPlanFilter} options={['Tous','Starter','Pro','Business','Enterprise']} label="Plan" />
          <Select value={statusFilter} onChange={setStatusFilter} options={['Tous','Actif','Trial','Past Due','Suspendu']} label="Statut" />
          <div style={{flex:1}}/>
          <button style={btn.outline}>↓ Exporter CSV</button>
        </div>

        <Card padding={0}>
          <table style={tbl.table}>
            <thead>
              <tr>
                <th style={{...tbl.th, width:32}}><input type="checkbox" /></th>
                <th style={tbl.th}>Organisation</th>
                <th style={tbl.th}>Plan</th>
                <th style={tbl.th}>Statut</th>
                <th style={tbl.thRight}>MRR</th>
                <th style={tbl.th}>Sièges</th>
                <th style={tbl.thRight}>Prospects</th>
                <th style={tbl.th}>Inscription</th>
                <th style={tbl.th}>Activité</th>
                <th style={{...tbl.th, width:60}}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} style={tbl.tr}>
                  <td style={tbl.td}><input type="checkbox" /></td>
                  <td style={tbl.td}>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <img src={o.logo} alt="" style={{width:36, height:36, borderRadius:8, background:'#eef0fb'}}/>
                      <div>
                        <div style={{fontSize:13, fontWeight:700, color:'#1a1c2e'}}>{o.name} <span style={{marginLeft:6, fontSize:12}}>{o.country}</span></div>
                        <div style={{fontSize:11, color:'#6b7280'}}>{o.owner} · {o.industry}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tbl.td}><PlanBadge plan={o.plan} /></td>
                  <td style={tbl.td}><StatusBadge status={o.status}/></td>
                  <td style={tbl.tdRight}>
                    <span style={{fontSize:13, fontWeight:700, color:o.mrr>0?'#1a1c2e':'#9ca3af'}}>
                      {o.mrr>0 ? `${o.mrr} €` : '—'}
                    </span>
                  </td>
                  <td style={tbl.td}>
                    <div style={{display:'flex', alignItems:'center', gap:6}}>
                      <span style={{fontSize:12, color:'#6b7280'}}>{o.seatsUsed}/{o.seats}</span>
                      <div style={{width:50, height:5, background:'#f0f2fa', borderRadius:3, overflow:'hidden'}}>
                        <div style={{width:`${(o.seatsUsed/o.seats)*100}%`, height:'100%', background:'#6366f1'}}/>
                      </div>
                    </div>
                  </td>
                  <td style={tbl.tdRight}><span style={{fontSize:12, color:'#1a1c2e', fontWeight:600}}>{fmtNum(o.prospects)}</span></td>
                  <td style={tbl.td}><span style={{fontSize:12, color:'#6b7280'}}>{o.signupAt}</span></td>
                  <td style={tbl.td}><span style={{fontSize:12, color:'#6b7280'}}>{o.lastActive}</span></td>
                  <td style={tbl.td}><button style={tbl.iconBtn}>⋯</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}

// ==================== USERS ====================
function AdminUsers() {
  const users = window.ADMIN.users
  const [search, setSearch] = useStateA('')
  const [statusFilter, setStatusFilter] = useStateA('Tous')

  const filtered = useMemoA(() => users.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase()) && !u.org.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'Tous' && u.status !== statusFilter) return false
    return true
  }), [users, search, statusFilter])

  return (
    <div style={pageStyles.scroll}>
      <AdminTopBar
        title="Utilisateurs"
        subtitle={`${users.length} utilisateurs au total · toutes organisations`}
        right={<button style={btn.outline}>↓ Exporter CSV</button>}
      />
      <div style={pageStyles.body}>
        <div style={{display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', marginBottom:14}}>
          <div style={{position:'relative', flex:1, minWidth:240, maxWidth:380}}>
            <span style={{position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:13}}>🔍</span>
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Rechercher un utilisateur, email, organisation…"
              style={{width:'100%', padding:'10px 12px 10px 34px', background:'#fff', border:'1px solid #e4e7f8', borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit'}}/>
          </div>
          <Select value={statusFilter} onChange={setStatusFilter} options={['Tous','Actif','Trial','Past Due','Suspendu']} label="Statut" />
        </div>

        <Card padding={0}>
          <table style={tbl.table}>
            <thead>
              <tr>
                <th style={{...tbl.th, width:32}}><input type="checkbox" /></th>
                <th style={tbl.th}>Utilisateur</th>
                <th style={tbl.th}>Organisation</th>
                <th style={tbl.th}>Rôle</th>
                <th style={tbl.th}>Statut</th>
                <th style={tbl.th}>Dernière activité</th>
                <th style={tbl.th}>Inscription</th>
                <th style={{...tbl.th, width:140}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={tbl.tr}>
                  <td style={tbl.td}><input type="checkbox" /></td>
                  <td style={tbl.td}>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <img src={u.avatar} alt="" style={{width:34, height:34, borderRadius:'50%', background:'#eef0fb'}}/>
                      <div>
                        <div style={{fontSize:13, fontWeight:700, color:'#1a1c2e'}}>{u.name}</div>
                        <div style={{fontSize:11, color:'#6b7280'}}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tbl.td}><span style={{fontSize:12, color:'#1a1c2e', fontWeight:600}}>{u.org}</span></td>
                  <td style={tbl.td}><RoleBadge role={u.role}/></td>
                  <td style={tbl.td}><StatusBadge status={u.status}/></td>
                  <td style={tbl.td}><span style={{fontSize:12, color:'#6b7280'}}>{u.lastSeen}</span></td>
                  <td style={tbl.td}><span style={{fontSize:12, color:'#6b7280'}}>{u.signupAt}</span></td>
                  <td style={tbl.td}>
                    <div style={{display:'flex', gap:6}}>
                      <button style={tbl.smallBtn} title="Impersonate">👁</button>
                      <button style={tbl.smallBtn} title="Email">✉</button>
                      <button style={{...tbl.smallBtn, color:'#dc2626'}} title="Suspendre">⊘</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  )
}

// ==================== BILLING ====================
function AdminBilling() {
  const m = window.ADMIN.metrics
  const invoices = window.ADMIN.invoices

  return (
    <div style={pageStyles.scroll}>
      <AdminTopBar
        title="Facturation & abonnements"
        subtitle="Revenus, factures et état des paiements"
        right={<button style={btn.outline}>↓ Exporter rapport mensuel</button>}
      />
      <div style={pageStyles.body}>
        {/* Summary cards */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}}>
          <BillingStat label="MRR" value={fmtEUR(m.mrr)} trend={m.mrrTrend} />
          <BillingStat label="ARR projeté" value={fmtEUR(m.arr)} trend={m.mrrTrend} />
          <BillingStat label="Encaissé ce mois" value={fmtEUR(invoices.filter(i=>i.status==='Payée').reduce((s,i)=>s+i.amount,0))} sub={`${invoices.filter(i=>i.status==='Payée').length} factures`} />
          <BillingStat label="En souffrance" value={fmtEUR(invoices.filter(i=>i.status!=='Payée').reduce((s,i)=>s+i.amount,0))} sub={`${invoices.filter(i=>i.status!=='Payée').length} factures`} alert />
        </div>

        <div style={{marginTop:14}}>
          <Card>
            <CardHeader title="Évolution du MRR sur 12 mois" right={<TrendPill value={m.mrrTrend} suffix="%" />} />
            <MRRChart data={m.mrrSeries} height={220} />
          </Card>
        </div>

        {/* Invoices table */}
        <div style={{marginTop:14}}>
          <Card padding={0}>
            <div style={{padding:'14px 18px', borderBottom:'1px solid #f0f2fa', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontSize:14, fontWeight:700, color:'#1a1c2e'}}>Factures récentes</div>
                <div style={{fontSize:11, color:'#6b7280', marginTop:2}}>Avril 2026 — Mars 2026</div>
              </div>
              <div style={{display:'flex', gap:8}}>
                <Select value="Toutes" onChange={()=>{}} options={['Toutes','Payée','En retard','Échouée']} label="Statut"/>
              </div>
            </div>
            <table style={tbl.table}>
              <thead>
                <tr>
                  <th style={tbl.th}>N° facture</th>
                  <th style={tbl.th}>Organisation</th>
                  <th style={tbl.th}>Date</th>
                  <th style={tbl.th}>Méthode</th>
                  <th style={tbl.th}>Statut</th>
                  <th style={tbl.thRight}>Montant</th>
                  <th style={{...tbl.th, width:80}}></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} style={tbl.tr}>
                    <td style={tbl.td}><span style={{fontSize:12, fontFamily:'JetBrains Mono, monospace', color:'#6b7280'}}>{inv.id}</span></td>
                    <td style={tbl.td}><span style={{fontSize:13, fontWeight:600, color:'#1a1c2e'}}>{inv.org}</span></td>
                    <td style={tbl.td}><span style={{fontSize:12, color:'#6b7280'}}>{inv.date}</span></td>
                    <td style={tbl.td}><span style={{fontSize:12, color:'#6b7280'}}>{inv.method}</span></td>
                    <td style={tbl.td}><StatusBadge status={inv.status}/></td>
                    <td style={tbl.tdRight}><span style={{fontSize:13, fontWeight:700, color:'#1a1c2e'}}>{inv.amount} €</span></td>
                    <td style={tbl.td}>
                      <div style={{display:'flex', gap:6}}>
                        <button style={tbl.smallBtn} title="Télécharger PDF">↓</button>
                        {inv.status !== 'Payée' && <button style={{...tbl.smallBtn, color:'#6366f1'}} title="Relancer">↻</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ---------- Shared subcomponents ----------
function Card({ children, padding=18 }) {
  return (
    <div style={{
      background:'#fff', border:'1px solid #e4e7f8', borderRadius:14,
      boxShadow:'0 1px 4px rgba(99,102,241,0.06)',
      padding,
    }}>{children}</div>
  )
}

function CardHeader({ title, subtitle, right }) {
  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:14}}>
      <div>
        <div style={{fontSize:14, fontWeight:700, color:'#1a1c2e'}}>{title}</div>
        {subtitle && <div style={{fontSize:11, color:'#6b7280', marginTop:2}}>{subtitle}</div>}
      </div>
      {right}
    </div>
  )
}

function SegmentedToggle({ options, value, onChange }) {
  return (
    <div style={{display:'inline-flex', background:'#f4f6ff', border:'1px solid #e4e7f8', borderRadius:9, padding:3}}>
      {options.map(opt => (
        <button key={opt} onClick={()=>onChange(opt)} style={{
          padding:'6px 12px', fontSize:12, fontWeight:600, border:'none',
          background: value===opt ? '#fff' : 'transparent',
          color: value===opt ? '#1a1c2e' : '#6b7280',
          borderRadius:7, cursor:'pointer',
          boxShadow: value===opt ? '0 1px 3px rgba(99,102,241,0.15)' : 'none',
          fontFamily:'inherit',
        }}>{opt}</button>
      ))}
    </div>
  )
}

function Select({ value, onChange, options, label }) {
  return (
    <div style={{position:'relative'}}>
      <select value={value} onChange={e=>onChange(e.target.value)} style={{
        appearance:'none', padding:'9px 28px 9px 12px',
        background:'#fff', border:'1px solid #e4e7f8', borderRadius:9,
        fontSize:13, color:'#1a1c2e', fontWeight:600, cursor:'pointer', fontFamily:'inherit',
      }}>
        {options.map(o => <option key={o} value={o}>{label}: {o}</option>)}
      </select>
      <span style={{position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:10, color:'#9ca3af', pointerEvents:'none'}}>▾</span>
    </div>
  )
}

function PlanBadge({ plan }) {
  const map = {
    Starter:    { bg:'#f1f3f9',              color:'#475569' },
    Pro:        { bg:'rgba(99,102,241,0.12)', color:'#4f52d4' },
    Business:   { bg:'rgba(139,92,246,0.12)', color:'#7c3aed' },
    Enterprise: { bg:'rgba(14,165,233,0.12)', color:'#0369a1' },
  }
  const s = map[plan] || map.Starter
  return <span style={{padding:'3px 9px', borderRadius:6, fontSize:11, fontWeight:700, background:s.bg, color:s.color}}>{plan}</span>
}

function RoleBadge({ role }) {
  const map = {
    Owner:  { bg:'rgba(217,119,6,0.12)', color:'#b45309' },
    Admin:  { bg:'rgba(99,102,241,0.12)', color:'#4f52d4' },
    Member: { bg:'#f1f3f9',              color:'#475569' },
  }
  const s = map[role] || map.Member
  return <span style={{padding:'2px 8px', borderRadius:6, fontSize:11, fontWeight:600, background:s.bg, color:s.color}}>{role}</span>
}

function BillingStat({ label, value, sub, trend, alert }) {
  return (
    <div style={{
      background:'#fff', border:`1px solid ${alert?'rgba(220,38,38,0.3)':'#e4e7f8'}`, borderRadius:14, padding:'16px 18px',
      boxShadow:'0 1px 4px rgba(99,102,241,0.06)',
    }}>
      <div style={{fontSize:10, fontWeight:700, color:alert?'#dc2626':'#9ca3af', letterSpacing:0.6, textTransform:'uppercase'}}>{label}</div>
      <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginTop:8}}>
        <div style={{fontSize:24, fontWeight:800, color: alert?'#dc2626':'#1a1c2e', letterSpacing:-0.4}}>{value}</div>
        {trend!==undefined && <TrendPill value={trend} suffix="%"/>}
      </div>
      {sub && <div style={{fontSize:11, color:'#6b7280', marginTop:4}}>{sub}</div>}
    </div>
  )
}

const pageStyles = {
  scroll: { flex:1, display:'flex', flexDirection:'column', height:'100vh', overflowY:'auto' },
  body:   { padding:'18px 28px 32px', flex:1 },
}

const btn = {
  primary: { padding:'9px 14px', fontSize:13, fontWeight:700, color:'#fff', background:'#6366f1', border:'none', borderRadius:9, cursor:'pointer', boxShadow:'0 2px 8px rgba(99,102,241,0.45)', fontFamily:'inherit' },
  outline: { padding:'9px 14px', fontSize:13, fontWeight:600, color:'#1a1c2e', background:'#fff', border:'1px solid #e4e7f8', borderRadius:9, cursor:'pointer', fontFamily:'inherit' },
}

const tbl = {
  table: { width:'100%', borderCollapse:'collapse' },
  th:    { padding:'12px 14px', fontSize:11, fontWeight:700, color:'#6b7280', letterSpacing:0.4, textTransform:'uppercase', textAlign:'left', background:'#fcfdff', borderBottom:'1px solid #e4e7f8' },
  thRight:{ padding:'12px 14px', fontSize:11, fontWeight:700, color:'#6b7280', letterSpacing:0.4, textTransform:'uppercase', textAlign:'right', background:'#fcfdff', borderBottom:'1px solid #e4e7f8' },
  tr:    { borderBottom:'1px solid #f0f2fa', transition:'background 0.12s', cursor:'pointer' },
  td:    { padding:'12px 14px', fontSize:13, color:'#1a1c2e', verticalAlign:'middle' },
  tdRight:{ padding:'12px 14px', fontSize:13, color:'#1a1c2e', textAlign:'right', verticalAlign:'middle' },
  iconBtn:{ width:28, height:28, borderRadius:7, border:'1px solid transparent', background:'transparent', color:'#6b7280', cursor:'pointer', fontSize:14 },
  smallBtn:{ width:28, height:28, borderRadius:7, border:'1px solid #e4e7f8', background:'#fff', color:'#6b7280', cursor:'pointer', fontSize:13, fontFamily:'inherit' },
}

Object.assign(window, {
  AdminDashboard, AdminOrgs, AdminUsers, AdminBilling,
  Card, CardHeader, SegmentedToggle, Select, PlanBadge, RoleBadge,
  pageStyles, btn, tbl,
})
