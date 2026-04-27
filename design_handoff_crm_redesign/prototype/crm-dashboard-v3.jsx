
// ─── Dashboard v3 — Pro CRM with avatars, richer widgets ────────────────────
// Overrides window.DashboardPage set by crm-pages-a.jsx

(function () {
  const C = window.C
  const { AV } = window

  // ─── Sparkline (mini area) ───────────────────────────────────────────
  function MiniArea({ data, color, w=70, h=24 }) {
    if (!data?.length) return null
    const max = Math.max(...data), min = Math.min(...data)
    const norm = v => h - ((v-min)/((max-min)||1))*h
    const step = w/(data.length-1)
    const pts = data.map((v,i)=>`${i*step},${norm(v)}`).join(' ')
    const area = `0,${h} ${pts} ${w},${h}`
    const gid = `g-${color.replace('#','')}-${w}`
    return (
      <svg width={w} height={h} style={{ display:'block' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#${gid})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={w} cy={norm(data[data.length-1])} r="2.5" fill={color} />
      </svg>
    )
  }

  // ─── Stacked revenue chart (Won vs Pipeline) ─────────────────────────
  function RevenueChart({ months, won, pipeline }) {
    const max = Math.max(...pipeline) * 1.1
    const H = 180
    return (
      <div>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', height:H, gap:10, padding:'0 4px' }}>
          {months.map((m,i)=>{
            const pPct = (pipeline[i]/max)*100
            const wPct = (won[i]/max)*100
            const isLast = i === months.length-1
            return (
              <div key={m} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, position:'relative' }}>
                <div style={{ position:'relative', width:'100%', maxWidth:36, height:H, display:'flex', flexDirection:'column-reverse' }}>
                  <div title={`Pipeline : ${pipeline[i].toLocaleString('fr-FR')} €`}
                    style={{ position:'absolute', bottom:0, left:0, right:0, height:`${pPct}%`, background:`linear-gradient(180deg, ${C.primary}25, ${C.primary}12)`, border:`1px solid ${C.primaryBorder}`, borderRadius:6, transition:'height 0.9s ease' }} />
                  <div title={`Gagné : ${won[i].toLocaleString('fr-FR')} €`}
                    style={{ position:'absolute', bottom:0, left:0, right:0, height:`${wPct}%`, background:isLast ? `linear-gradient(180deg, ${C.green}, #0d8a3e)` : `linear-gradient(180deg, ${C.primary}, #4f52d4)`, borderRadius:6, transition:'height 0.9s ease', boxShadow: isLast ? `0 4px 12px ${C.green}55` : `0 2px 8px ${C.primary}35` }} />
                  {isLast && (
                    <div style={{ position:'absolute', bottom:`calc(${wPct}% + 8px)`, left:'50%', transform:'translateX(-50%)', background:C.text, color:'#fff', fontSize:10, fontWeight:700, padding:'3px 7px', borderRadius:5, whiteSpace:'nowrap' }}>
                      {(won[i]/1000).toFixed(1)}k €
                    </div>
                  )}
                </div>
                <div style={{ fontSize:11, color:isLast?C.text:C.subtle, fontWeight:isLast?700:500 }}>{m}</div>
              </div>
            )
          })}
        </div>
        <div style={{ display:'flex', gap:16, marginTop:14, paddingTop:12, borderTop:`1px solid ${C.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:10, height:10, borderRadius:3, background:C.green }} />
            <span style={{ fontSize:11, color:C.muted }}>Gagné</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ width:10, height:10, borderRadius:3, background:C.primary, opacity:0.25, border:`1px solid ${C.primaryBorder}` }} />
            <span style={{ fontSize:11, color:C.muted }}>Pipeline potentiel</span>
          </div>
          <div style={{ marginLeft:'auto', fontSize:11, color:C.subtle }}>7 derniers mois</div>
        </div>
      </div>
    )
  }

  // ─── KPI Card (v3, tighter) ──────────────────────────────────────────
  function KpiV3({ label, value, sub, trend, data, color, alert }) {
    return (
      <div style={{ background:C.card, border:`1px solid ${alert?'rgba(220,38,38,0.25)':C.border}`, borderRadius:14, padding:'16px 18px', boxShadow:'0 1px 3px rgba(99,102,241,0.05)', position:'relative', overflow:'hidden' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
          <div style={{ fontSize:11, color:C.muted, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>
          {trend !== undefined && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:2, fontSize:11, fontWeight:700, color: trend>=0 ? C.green : C.red, background: trend>=0 ? C.greenLight : C.redLight, padding:'2px 7px', borderRadius:5 }}>
              {trend>=0?'↑':'↓'} {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div style={{ fontSize:28, fontWeight:800, color: alert ? C.red : C.text, lineHeight:1.05 }}>{value}</div>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginTop:8, gap:12 }}>
          <div style={{ fontSize:11, color:C.subtle }}>{sub}</div>
          {data && <MiniArea data={data} color={color||C.primary} w={70} h={22} />}
        </div>
      </div>
    )
  }

  // ─── Hot Deals card with avatars ─────────────────────────────────────
  function HotDealsCard({ prospects, setPage, setDetailId }) {
    const hot = prospects.filter(p => p.priority==='Chaud' && p.stage!=='Gagné' && p.stage!=='Perdu')
      .sort((a,b)=>b.value-a.value).slice(0,4)
    return (
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 20px', boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:C.text }}>🔥 Deals chauds à closer</div>
            <div style={{ fontSize:11, color:C.subtle, marginTop:2 }}>Les {hot.length} plus gros en pipeline</div>
          </div>
          <button onClick={()=>setPage('prospects')} style={{ fontSize:11, fontWeight:700, color:C.primary, background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:7, padding:'5px 10px', cursor:'pointer' }}>Tous →</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {hot.map(p=>(
            <div key={p.id} onClick={()=>{setDetailId(p.id); setPage('detail')}}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'10px', borderRadius:10, cursor:'pointer', transition:'background 0.15s', border:`1px solid transparent` }}
              onMouseEnter={e=>{ e.currentTarget.style.background = '#f7f8ff'; e.currentTarget.style.borderColor = C.border }}
              onMouseLeave={e=>{ e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
            >
              <div style={{ position:'relative', flexShrink:0 }}>
                <img src={p.avatar} alt="" width="40" height="40" style={{ borderRadius:'50%', background:'#f0f1f8', display:'block' }} />
                <span style={{ position:'absolute', bottom:-2, right:-2, width:16, height:16, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, border:`1.5px solid #fff`, boxShadow:'0 1px 3px rgba(0,0,0,0.15)' }}>🔥</span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:C.text, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.contact}</span>
                  <span style={{ fontSize:11, color:C.subtle }}>· {p.company}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
                  <span style={{ color:C.muted }}>{p.stage}</span>
                  <span style={{ color:C.subtle }}>·</span>
                  <span style={{ color:C.subtle }}>Score {p.score}</span>
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:15, fontWeight:800, color:C.text }}>{p.value.toLocaleString('fr-FR')} €</div>
                <div style={{ fontSize:10, color:C.subtle, marginTop:1 }}>{p.channel.split('/')[0]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── Team Leaderboard ────────────────────────────────────────────────
  function TeamCard({ team }) {
    const sorted = [...team].sort((a,b)=>b.revenue-a.revenue)
    const maxRev = sorted[0].revenue
    const medals = ['🥇','🥈','🥉','']
    return (
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 20px', boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Performance équipe</div>
            <div style={{ fontSize:11, color:C.subtle, marginTop:2 }}>Classement du mois</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:-6 }}>
            {team.slice(0,3).map((u,i)=>(
              <img key={u.id} src={u.avatar} alt={u.name} width="26" height="26"
                style={{ borderRadius:'50%', border:'2px solid #fff', marginLeft:i>0?-8:0, background:'#f0f1f8' }} />
            ))}
            <span style={{ marginLeft:6, fontSize:11, color:C.subtle, fontWeight:600 }}>+{team.length} actifs</span>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {sorted.map((u,i)=>(
            <div key={u.id} style={{ display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:14, width:18, textAlign:'center', flexShrink:0 }}>{medals[i] || `${i+1}`}</span>
              <div style={{ position:'relative', flexShrink:0 }}>
                <img src={u.avatar} alt="" width="34" height="34" style={{ borderRadius:'50%', background:'#f0f1f8', display:'block' }} />
                {u.online && <span style={{ position:'absolute', bottom:0, right:0, width:9, height:9, borderRadius:'50%', background:C.green, border:'2px solid #fff' }} />}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{u.name}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
                  <div style={{ flex:1, height:4, background:'#eef0ff', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ width:`${(u.revenue/maxRev)*100}%`, height:'100%', background:i===0 ? `linear-gradient(90deg, ${C.amber}, ${C.primary})` : C.primary, borderRadius:2, transition:'width 0.8s' }} />
                  </div>
                  <span style={{ fontSize:10, color:C.subtle, fontWeight:600, minWidth:60, textAlign:'right' }}>{u.winRate}% win</span>
                </div>
              </div>
              <div style={{ fontSize:13, fontWeight:800, color:C.text, flexShrink:0, minWidth:64, textAlign:'right' }}>{(u.revenue/1000).toFixed(1)}k€</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── Today's Tasks card ──────────────────────────────────────────────
  function TasksCard({ relances, prospects, setPage, setDetailId }) {
    const today = relances.slice(0,4).map(r => ({ ...r, prospect: prospects.find(p=>p.id===r.id) }))
    return (
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 20px', boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:C.text }}>📅 À faire aujourd'hui</div>
            <div style={{ fontSize:11, color:C.subtle, marginTop:2 }}>Relances programmées et en retard</div>
          </div>
          <button onClick={()=>setPage('relances')} style={{ fontSize:11, fontWeight:700, color:C.primary, background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:7, padding:'5px 10px', cursor:'pointer' }}>Tout →</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
          {today.map((t,i)=>(
            <div key={t.id} onClick={()=>{setDetailId(t.id); setPage('detail')}}
              style={{ display:'flex', alignItems:'center', gap:11, padding:'10px 8px', borderRadius:8, cursor:'pointer', borderBottom: i<today.length-1 ? `1px solid ${C.border}` : 'none' }}
              onMouseEnter={e=>e.currentTarget.style.background='#f7f8ff'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            >
              <input type="checkbox" onClick={e=>e.stopPropagation()} style={{ width:16, height:16, accentColor:C.primary, cursor:'pointer', flexShrink:0 }} />
              <img src={t.prospect?.avatar} alt="" width="28" height="28" style={{ borderRadius:'50%', flexShrink:0, background:'#f0f1f8' }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.text }}>{t.contact} <span style={{ color:C.subtle, fontWeight:500 }}>· {t.company}</span></div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>Relance · {t.stage}</div>
              </div>
              {t.overdue
                ? <span style={{ fontSize:10, fontWeight:700, color:C.red, background:C.redLight, padding:'2px 7px', borderRadius:5, flexShrink:0 }}>En retard</span>
                : <span style={{ fontSize:10, fontWeight:700, color:C.amber, background:C.amberLight, padding:'2px 7px', borderRadius:5, flexShrink:0 }}>Aujourd'hui</span>
              }
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── Activity v3 with avatars ────────────────────────────────────────
  function ActivityV3({ interactions, prospects, setPage, setDetailId }) {
    const TYPE_COLOR = { 'Appel':C.green,'LinkedIn':C.primary,'Email':C.blue,'Réunion':C.amber,'Instagram':C.pink,'Téléphone':C.green }
    const OUTCOME = {
      'Positif':  { color:C.green, bg:C.greenLight },
      'Gagné':    { color:C.green, bg:C.greenLight },
      'En attente':{ color:C.amber, bg:C.amberLight },
      'Négatif':  { color:C.red,   bg:C.redLight },
    }
    return (
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 20px', boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Activité récente</div>
            <div style={{ fontSize:11, color:C.subtle, marginTop:2 }}>Dernières interactions de l'équipe</div>
          </div>
          <button onClick={()=>setPage('journal')} style={{ fontSize:11, fontWeight:700, color:C.primary, background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:7, padding:'5px 10px', cursor:'pointer' }}>Journal →</button>
        </div>
        <div>
          {interactions.map((it,i)=>{
            const p = prospects.find(x=>x.id===it.prospectId)
            const tc = TYPE_COLOR[it.type]||C.muted
            const oc = OUTCOME[it.outcome]||{}
            return (
              <div key={it.id} onClick={()=>{setDetailId(it.prospectId); setPage('detail')}}
                style={{ display:'flex', gap:12, padding:'11px 0', cursor:'pointer', borderBottom: i<interactions.length-1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <img src={p?.avatar} alt="" width="36" height="36" style={{ borderRadius:'50%', background:'#f0f1f8', display:'block' }} />
                  <div style={{ position:'absolute', bottom:-3, right:-3, width:18, height:18, borderRadius:'50%', background:'#fff', border:`1.5px solid ${tc}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10 }}>{it.icon}</div>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
                    <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{it.prospect}</span>
                    {it.outcome && <span style={{ fontSize:10, fontWeight:700, color:oc.color, background:oc.bg, padding:'1px 6px', borderRadius:5 }}>{it.outcome}</span>}
                    <span style={{ fontSize:11, color:C.subtle, marginLeft:'auto' }}>{it.date==="Aujourd'hui"?it.time:it.date}</span>
                  </div>
                  <p style={{ fontSize:12, color:C.muted, margin:0, lineHeight:1.5 }}>{it.summary}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ─── Goal progress (richer) ──────────────────────────────────────────
  function GoalV3({ current, goal, wonThisMonth }) {
    const pct = Math.min(100, Math.round((current/goal)*100))
    const remaining = goal - current
    const daysLeft = 9
    const dailyTarget = Math.ceil(remaining/daysLeft)
    return (
      <div style={{ background:`linear-gradient(135deg, ${C.primary} 0%, #4f52d4 55%, #3730a3 100%)`, borderRadius:14, padding:'20px 22px', color:'#fff', position:'relative', overflow:'hidden' }}>
        {/* Decorative rings */}
        <div style={{ position:'absolute', top:-60, right:-60, width:180, height:180, borderRadius:'50%', border:'40px solid rgba(255,255,255,0.08)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-40, right:20, width:90, height:90, borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />

        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.75)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>Objectif Avril</div>
              <div style={{ fontSize:26, fontWeight:800, marginTop:4, letterSpacing:'-0.01em' }}>
                {(current/1000).toFixed(1)}k € <span style={{ fontSize:15, color:'rgba(255,255,255,0.7)', fontWeight:500 }}>/ {(goal/1000).toFixed(0)}k €</span>
              </div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:10, padding:'8px 14px', textAlign:'center', backdropFilter:'blur(6px)' }}>
              <div style={{ fontSize:24, fontWeight:800, lineHeight:1 }}>{pct}%</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.8)', marginTop:2 }}>atteint</div>
            </div>
          </div>

          <div style={{ height:8, borderRadius:4, background:'rgba(255,255,255,0.15)', overflow:'hidden', marginBottom:14 }}>
            <div style={{ width:`${pct}%`, height:'100%', borderRadius:4, background:'linear-gradient(90deg, #fbbf24, #fff)', boxShadow:'0 0 12px rgba(255,255,255,0.6)', transition:'width 0.9s' }} />
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', gap:14 }}>
            <div>
              <div style={{ fontSize:16, fontWeight:800 }}>{wonThisMonth}</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.75)' }}>deals gagnés</div>
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:800 }}>{daysLeft} j</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.75)' }}>restants</div>
            </div>
            <div>
              <div style={{ fontSize:16, fontWeight:800 }}>{(dailyTarget/1000).toFixed(1)}k€</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.75)' }}>rythme/jour</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Main Dashboard ──────────────────────────────────────────────────
  window.DashboardPage = function DashboardPage({ setPage, setDetailId }) {
    const { stats, user, team, prospects, interactions, relances, analytics, byChannel } = window.CRM
    const now = new Date()
    const hours = now.getHours()
    const greeting = hours < 12 ? 'Bonjour' : hours < 18 ? 'Bon après-midi' : 'Bonsoir'
    const firstName = user.name.split(' ')[0]

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

        {/* Welcome banner */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 22px', display:'flex', alignItems:'center', gap:16, boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }}>
          <img src={user.avatar} alt="" width="52" height="52" style={{ borderRadius:'50%', background:'#f0f1f8', flexShrink:0 }} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:800, color:C.text, letterSpacing:'-0.01em' }}>{greeting}, {firstName} 👋</div>
            <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>
              Vous avez <strong style={{ color:C.red }}>{stats.followupOverdue} relance{stats.followupOverdue>1?'s':''} en retard</strong>,
              {' '}<strong style={{ color:C.amber }}>{stats.followupToday} à faire aujourd'hui</strong>, et
              {' '}<strong style={{ color:C.green }}>{stats.hotProspects} deals chauds</strong> à suivre.
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>setPage('relances')} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:9, padding:'8px 14px', fontSize:12, fontWeight:700, color:C.text, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6 }}>📅 Mes relances</button>
            <button onClick={()=>setPage('prospects')} style={{ background:C.primary, border:'none', borderRadius:9, padding:'8px 14px', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6, boxShadow:`0 2px 8px ${C.primary}55` }}>+ Nouveau prospect</button>
          </div>
        </div>

        {/* Overdue alert */}
        {stats.followupOverdue > 0 && (
          <div onClick={()=>setPage('relances')} style={{ background:'rgba(220,38,38,0.05)', border:`1px solid rgba(220,38,38,0.2)`, borderRadius:12, padding:'11px 16px', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
            <span style={{ fontSize:15 }}>⚠️</span>
            <span style={{ fontSize:13, color:C.red }}><strong>{stats.followupOverdue} relance{stats.followupOverdue>1?'s':''} en retard</strong> — à traiter en urgence</span>
            <span style={{ marginLeft:'auto', fontSize:12, color:C.red, fontWeight:700 }}>Voir →</span>
          </div>
        )}

        {/* KPI row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12 }}>
          <KpiV3 label="Prospects actifs"  value={stats.totalProspects} sub="dans le pipeline"   trend={stats.totalTrend}     data={stats.sparkProspects}  color={C.primary} />
          <KpiV3 label="Revenus potentiels" value={`${(stats.potentialRevenue/1000).toFixed(0)}k €`} sub="valeur totale estimée" trend={stats.revenueTrend} data={stats.sparkRevenue} color={C.green} />
          <KpiV3 label="Taux de conversion" value={`${stats.conversionRate}%`} sub="prospects → clients" trend={stats.conversionTrend} data={stats.sparkConversion} color={C.violet} />
          <KpiV3 label="Deals chauds" value={stats.hotProspects} sub="à closer ce mois" trend={stats.hotTrend} data={stats.sparkHot} color={C.red} />
        </div>

        {/* Goal + Revenue chart */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:12 }}>
          <GoalV3 current={stats.monthlyRevenue} goal={stats.monthlyGoal} wonThisMonth={stats.wonThisMonth} />
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 20px', boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Revenus gagnés & pipeline</div>
                <div style={{ fontSize:11, color:C.subtle, marginTop:2 }}>Tendance sur 7 mois — objectif dépassé en avril</div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {['7M','1A','Max'].map((l,i)=>(
                  <button key={l} style={{ fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:6, border:`1px solid ${i===0?C.primaryBorder:C.border}`, background:i===0?C.primaryLight:C.card, color:i===0?C.primary:C.muted, cursor:'pointer' }}>{l}</button>
                ))}
              </div>
            </div>
            <RevenueChart months={analytics.revenueMonths} won={analytics.revenueWon} pipeline={analytics.revenuePipeline} />
          </div>
        </div>

        {/* Hot deals + Team */}
        <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:12 }}>
          <HotDealsCard prospects={prospects} setPage={setPage} setDetailId={setDetailId} />
          <TeamCard team={team} />
        </div>

        {/* Tasks + Activity */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 3fr', gap:12 }}>
          <TasksCard relances={relances} prospects={prospects} setPage={setPage} setDetailId={setDetailId} />
          <ActivityV3 interactions={interactions} prospects={prospects} setPage={setPage} setDetailId={setDetailId} />
        </div>

      </div>
    )
  }
})();
