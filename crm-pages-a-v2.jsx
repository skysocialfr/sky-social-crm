
// ─── KPI Block (typographic, no icon boxes) ───────────────────────────────────
function KpiBlock({ label, value, trend, sub, alert }) {
  const up = trend >= 0
  return (
    <div style={{ background:alert?`rgba(184,40,40,0.05)`:C2.card, border:`1px solid ${alert?'rgba(184,40,40,0.2)':C2.border}`, borderRadius:6, padding:'22px 24px', display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ fontSize:11, fontWeight:700, color:C2.subtle, textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</div>
      <div style={{ fontFamily:'Syne, sans-serif', fontSize:48, fontWeight:800, color:alert?C2.red:C2.text, lineHeight:1, letterSpacing:'-0.02em' }}>{value}</div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {trend !== undefined && (
          <span style={{ fontSize:11, fontWeight:700, color:up?C2.green:C2.red }}>{up?'↑':'↓'} {Math.abs(trend)}{String(trend).includes('.')?'%':''} vs dernier mois</span>
        )}
        {sub && <span style={{ fontSize:11, color:C2.subtle }}>{sub}</span>}
      </div>
    </div>
  )
}

// ─── Pipeline as a ruler/table ────────────────────────────────────────────────
function PipelineTable({ data }) {
  const max = Math.max(...data.map(d=>d.count))
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
      {data.filter(d=>!['Gagné','Perdu'].includes(d.stage)).map((d,i)=>{
        const m = S2_STAGE[d.stage]||{ color:C2.muted }
        const pct = (d.count/max)*100
        return (
          <div key={d.stage} style={{ display:'flex', alignItems:'center', gap:14, padding:'9px 0', borderBottom:i<5?`1px solid ${C2.border}`:'none' }}>
            <div style={{ width:140, flexShrink:0 }}>
              <span style={{ fontSize:12, color:C2.muted, fontWeight:400 }}>{d.stage}</span>
            </div>
            <div style={{ width:32, textAlign:'right', flexShrink:0 }}>
              <span style={{ fontFamily:'Syne, sans-serif', fontSize:18, fontWeight:800, color:m.color }}>{d.count}</span>
            </div>
            <div style={{ flex:1, height:3, background:C2.bgDeep, borderRadius:2, overflow:'hidden' }}>
              <div style={{ width:`${pct}%`, height:'100%', background:m.color, opacity:0.6, borderRadius:2, transition:'width 0.8s ease' }} />
            </div>
            <div style={{ width:76, textAlign:'right', flexShrink:0 }}>
              <span style={{ fontSize:11, color:C2.subtle }}>{d.value.toLocaleString('fr-FR')} €</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Channel distribution ─────────────────────────────────────────────────────
function ChannelBars({ data }) {
  const total = data.reduce((s,d)=>s+d.count,0)
  const COLORS = [C2.accent, C2.blue, C2.amber, C2.muted]
  return (
    <div>
      {/* Single stacked bar */}
      <div style={{ display:'flex', height:8, borderRadius:2, overflow:'hidden', marginBottom:14 }}>
        {data.map((d,i)=>(
          <div key={d.channel} style={{ flex:d.count, background:COLORS[i], opacity: i===0?1:0.7-i*0.1, transition:'flex 0.8s' }} />
        ))}
      </div>
      {/* Legend */}
      <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
        {data.map((d,i)=>(
          <div key={d.channel} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:1, background:COLORS[i], flexShrink:0 }} />
            <span style={{ fontSize:12, color:C2.muted, flex:1 }}>{d.channel}</span>
            <span style={{ fontSize:12, fontWeight:700, color:C2.text, fontFamily:'Syne, sans-serif' }}>{d.count}</span>
            <span style={{ fontSize:11, color:C2.subtle, width:28, textAlign:'right' }}>{Math.round(d.count/total*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Activity Log ─────────────────────────────────────────────────────────────
function ActivityLog({ interactions, onClickItem }) {
  const TYPE_COLOR = { 'Appel':C2.green,'LinkedIn':C2.blue,'Email':C2.accent,'Réunion':C2.amber,'Note interne':C2.muted,'Instagram':C2.red,'Téléphone':C2.green }
  const OUTCOME_STYLE = {
    'Positif':  { color:C2.green  },
    'Gagné':    { color:C2.green  },
    'En attente':{ color:C2.amber },
    'Négatif':  { color:C2.red   },
  }
  return (
    <div>
      {/* Log header */}
      <div style={{ display:'grid', gridTemplateColumns:'44px 1fr 70px 70px', gap:10, padding:'6px 0 8px', borderBottom:`1px solid ${C2.border}`, marginBottom:4 }}>
        {['Heure','Prospect','Type','Résultat'].map(h=>(
          <span key={h} style={{ fontSize:9, fontWeight:700, color:C2.subtle, textTransform:'uppercase', letterSpacing:'0.1em' }}>{h}</span>
        ))}
      </div>
      {interactions.map((item,i)=>{
        const tc = TYPE_COLOR[item.type]||C2.muted
        const oc = OUTCOME_STYLE[item.outcome]||{}
        return (
          <div key={item.id} onClick={()=>onClickItem&&onClickItem(item)}
            style={{ display:'grid', gridTemplateColumns:'44px 1fr 70px 70px', gap:10, padding:'9px 0', borderBottom:i<interactions.length-1?`1px solid ${C2.border}`:'none', cursor:onClickItem?'pointer':'default', transition:'background 0.1s' }}
            onMouseEnter={e=>{ if(onClickItem) e.currentTarget.style.background=C2.bg }}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}
          >
            <span style={{ fontSize:11, color:C2.subtle, fontFamily:'monospace' }}>{item.time}</span>
            <span style={{ fontSize:12, fontWeight:600, color:C2.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.prospect}</span>
            <span style={{ fontSize:11, color:tc, fontWeight:600 }}>{item.type}</span>
            {item.outcome ? <span style={{ fontSize:11, fontWeight:700, color:oc.color }}>{item.outcome}</span> : <span />}
          </div>
        )
      })}
    </div>
  )
}

// ─── Goal ruler ───────────────────────────────────────────────────────────────
function GoalRuler({ current, goal }) {
  const pct = Math.min(100, Math.round((current/goal)*100))
  const color = pct>=80?C2.green:pct>=50?C2.amber:C2.accent
  return (
    <div style={{ background:C2.card, border:`1px solid ${C2.border}`, borderRadius:6, padding:'22px 24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:C2.subtle, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Objectif mensuel</div>
          <div style={{ fontFamily:'Syne, sans-serif', fontSize:36, fontWeight:800, color:C2.text, lineHeight:1 }}>
            {current.toLocaleString('fr-FR')} €
            <span style={{ fontSize:14, color:C2.muted, fontWeight:400, marginLeft:8 }}>/ {goal.toLocaleString('fr-FR')} €</span>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:'Syne, sans-serif', fontSize:42, fontWeight:800, color, lineHeight:1 }}>{pct}%</div>
          <div style={{ fontSize:11, color:C2.subtle }}>atteint</div>
        </div>
      </div>
      {/* Ruler bar */}
      <div style={{ position:'relative', height:10, background:C2.bgDeep, borderRadius:2 }}>
        <div style={{ width:`${pct}%`, height:'100%', background:color, borderRadius:2, transition:'width 0.8s ease' }} />
        {/* Tick marks */}
        {[25,50,75].map(t=>(
          <div key={t} style={{ position:'absolute', top:'100%', left:`${t}%`, transform:'translateX(-50%)', paddingTop:4 }}>
            <div style={{ width:1, height:4, background:C2.border, margin:'0 auto' }} />
            <div style={{ fontSize:9, color:C2.subtle, textAlign:'center', marginTop:2 }}>{t}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard Page v2 ────────────────────────────────────────────────────────
function DashboardPageV2({ setPage, setDetailId }) {
  const { stats, byStage, byChannel, interactions } = window.CRM
  const card = { background:C2.card, border:`1px solid ${C2.border}`, borderRadius:6, padding:'22px 24px' }
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Alert */}
      {stats.followupOverdue > 0 && (
        <div onClick={()=>setPage('relances')} style={{ background:C2.redLight, border:`1px solid rgba(184,40,40,0.2)`, borderRadius:6, padding:'10px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer' }}>
          <div style={{ width:3, height:20, background:C2.red, borderRadius:1, flexShrink:0 }} />
          <span style={{ fontSize:13, color:C2.red, fontWeight:600 }}>{stats.followupOverdue} relance{stats.followupOverdue>1?'s':''} en retard — à traiter maintenant</span>
          <span style={{ marginLeft:'auto', fontSize:12, color:C2.red, fontWeight:700 }}>Voir →</span>
        </div>
      )}

      {/* KPI row — typographic, no widgets */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        <KpiBlock label="Total prospects" value={stats.totalProspects} trend={stats.totalTrend} sub="dans le pipeline" />
        <KpiBlock label="Revenus potentiels" value={`${(stats.potentialRevenue/1000).toFixed(0)}k€`} trend={stats.revenueTrend} />
        <KpiBlock label="Taux de conversion" value={`${stats.conversionRate}%`} trend={stats.conversionTrend} />
        <KpiBlock label="Relances en retard" value={stats.followupOverdue} alert={stats.followupOverdue>0} />
      </div>

      {/* Goal ruler + 3 stats */}
      <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:12 }}>
        <GoalRuler current={stats.monthlyRevenue} goal={stats.monthlyGoal} />
        <div style={{ ...card, display:'flex', flexDirection:'column', gap:0 }}>
          {[
            { label:'Prospects chauds', val:stats.hotProspects, color:C2.red },
            { label:"Relances aujourd'hui", val:stats.followupToday, color:C2.amber },
            { label:'Gagnés ce mois', val:stats.wonThisMonth, color:C2.green },
          ].map((item,i,arr)=>(
            <div key={item.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:i<arr.length-1?`1px solid ${C2.border}`:'none' }}>
              <span style={{ fontSize:12, color:C2.muted }}>{item.label}</span>
              <span style={{ fontFamily:'Syne, sans-serif', fontSize:28, fontWeight:800, color:item.color }}>{item.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts + Activity log */}
      <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:12 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:C2.subtle, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>Pipeline par étape</div>
            <div style={{ fontSize:10, color:C2.subtle, marginBottom:16 }}>Prospects actifs &amp; valeur estimée</div>
            <PipelineTable data={byStage} />
          </div>
          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:C2.subtle, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>Canaux de prospection</div>
            <div style={{ fontSize:10, color:C2.subtle, marginBottom:16 }}>Répartition par source</div>
            <ChannelBars data={byChannel} />
          </div>
        </div>

        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:16 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:C2.subtle, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:2 }}>Activité récente</div>
              <div style={{ fontSize:10, color:C2.subtle }}>Dernières interactions</div>
            </div>
            <button onClick={()=>setPage('journal')} style={{ fontSize:11, color:C2.accent, fontWeight:600, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', padding:0 }}>Journal →</button>
          </div>
          <ActivityLog interactions={interactions} onClickItem={item=>{ setDetailId(item.prospectId); setPage('detail') }} />
        </div>
      </div>
    </div>
  )
}

// ─── Prospects Page v2 ────────────────────────────────────────────────────────
function ProspectsPageV2({ setPage, setDetailId }) {
  const [view, setView] = React.useState('table')
  const [search, setSearch] = React.useState('')
  const [filterStage, setFilterStage] = React.useState('')
  const [filterPriority, setFilterPriority] = React.useState('')
  const [selected, setSelected] = React.useState(new Set())
  const [sortKey, setSortKey] = React.useState('company')
  const [sortDir, setSortDir] = React.useState('asc')
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [advConditions, setAdvConditions] = React.useState([])

  const prospects = window.CRM.prospects
  const filtered = React.useMemo(() => prospects.filter(p => {
    if (search && !p.company.toLowerCase().includes(search.toLowerCase()) && !p.contact.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStage && p.stage !== filterStage) return false
    if (filterPriority && p.priority !== filterPriority) return false
    return true
  }).sort((a,b)=>{ const c=String(a[sortKey]||'').localeCompare(String(b[sortKey]||''),'fr'); return sortDir==='asc'?c:-c }), [prospects,search,filterStage,filterPriority,sortKey,sortDir])

  const toggleSort = k=>{ if(sortKey===k) setSortDir(d=>d==='asc'?'desc':'asc'); else{setSortKey(k);setSortDir('asc')} }
  const toggleSelect = id=>{ const s=new Set(selected); s.has(id)?s.delete(id):s.add(id); setSelected(s) }
  const allSel = filtered.length>0&&filtered.every(p=>selected.has(p.id))
  const STAGES = ['Identifié','Premier contact','Réponse reçue','RDV fixé','Devis envoyé','En négociation','Gagné','Perdu']
  const inp = { background:C2.card, border:`1px solid ${C2.border}`, borderRadius:4, padding:'6px 12px', color:C2.text, fontSize:12, outline:'none', fontFamily:'inherit', transition:'border-color 0.12s' }
  const btn = (v) => ({ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:4, fontSize:12, fontWeight:600, cursor:'pointer', border:'none', fontFamily:'inherit', transition:'all 0.12s',
    ...(v==='primary'?{ background:C2.accent, color:'#fff', boxShadow:`0 2px 8px ${C2.accent}35` }:
        v==='ghost' ?{ background:C2.card, color:C2.muted, border:`1px solid ${C2.border}` }:{}) })
  const viewBtn = active=>({ padding:'6px 12px', borderRadius:4, fontSize:12, fontWeight:600, cursor:'pointer', border:`1px solid ${active?C2.accentBdr:C2.border}`, background:active?C2.accentLight:C2.card, color:active?C2.accent:C2.muted, transition:'all 0.12s', fontFamily:'inherit' })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
        <div>
          <div style={{ fontFamily:'Syne, sans-serif', fontSize:22, fontWeight:800, color:C2.text }}>Prospects</div>
          <div style={{ fontSize:12, color:C2.subtle, marginTop:2 }}>{prospects.length} prospects · {filtered.length} affichés{filtered.length<prospects.length?' (filtré)':''}</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button style={btn('ghost')}>Importer</button>
          <button style={btn('ghost')}>Exporter</button>
          <button style={btn('primary')}>+ Nouveau prospect</button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
        <input style={{ ...inp, width:210 }} placeholder="Rechercher…" value={search} onChange={e=>setSearch(e.target.value)} onFocus={e=>e.target.style.borderColor=C2.accent} onBlur={e=>e.target.style.borderColor=C2.border} />
        <select style={{ ...inp, cursor:'pointer' }} value={filterStage} onChange={e=>setFilterStage(e.target.value)}>
          <option value="">Toutes les étapes</option>
          {STAGES.map(s=><option key={s}>{s}</option>)}
        </select>
        <select style={{ ...inp, cursor:'pointer' }} value={filterPriority} onChange={e=>setFilterPriority(e.target.value)}>
          <option value="">Toutes priorités</option>
          <option>Chaud</option><option>Tiède</option><option>Froid</option>
        </select>
        <button onClick={()=>setShowAdvanced(!showAdvanced)}
          style={{ ...inp, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6, padding:'7px 13px', background:showAdvanced?C2.accentLight:C2.card, borderColor:showAdvanced?C2.accentBdr:C2.border, color:showAdvanced?C2.accent:C2.muted, fontWeight:600 }}>
          Filtres avancés {advConditions.length>0&&<span style={{ background:C2.accent, color:'#fff', borderRadius:2, fontSize:10, fontWeight:700, padding:'0 5px' }}>{advConditions.length}</span>}
        </button>
        <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
          <button style={viewBtn(view==='table')} onClick={()=>setView('table')}>Table</button>
          <button style={viewBtn(view==='kanban')} onClick={()=>setView('kanban')}>Kanban</button>
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size>0&&(
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 14px', background:C2.accentLight, border:`1px solid ${C2.accentBdr}`, borderRadius:4 }}>
          <span style={{ fontSize:12, color:C2.accent, fontWeight:700 }}>{selected.size} sélectionné{selected.size>1?'s':''}</span>
          <button style={{ ...btn('ghost'), padding:'4px 10px', fontSize:11 }} onClick={()=>setSelected(new Set())}>Désélectionner</button>
          <button style={{ ...btn('ghost'), padding:'4px 10px', fontSize:11, color:C2.amber, borderColor:C2.amberLight }}>Changer étape</button>
          <button style={{ ...btn('ghost'), padding:'4px 10px', fontSize:11, color:C2.red, borderColor:C2.redLight }}>Supprimer</button>
        </div>
      )}

      {/* TABLE */}
      {view==='table'&&(
        <div style={{ background:C2.card, border:`1px solid ${C2.border}`, borderRadius:6, overflow:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:860 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C2.border}`, background:C2.bg }}>
                <th style={{ padding:'9px 14px', width:36 }}>
                  <input type="checkbox" checked={allSel} onChange={()=>setSelected(allSel?new Set():new Set(filtered.map(p=>p.id)))} style={{ cursor:'pointer', accentColor:C2.accent }} />
                </th>
                {[['company','Entreprise'],['stage','Étape'],['priority','Priorité'],['channel','Canal'],['value','Valeur'],['followup','Prochain contact'],['score','Score']].map(([k,l])=>(
                  <th key={k} onClick={()=>toggleSort(k)} style={{ padding:'9px 14px', fontSize:10, fontWeight:700, color:C2.subtle, textTransform:'uppercase', letterSpacing:'0.08em', textAlign:'left', cursor:'pointer', userSelect:'none', whiteSpace:'nowrap' }}>
                    {l}{sortKey===k?(sortDir==='asc'?' ↑':' ↓'):''}
                  </th>
                ))}
                <th style={{ padding:'9px 14px' }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map(p=>{
                const sel=selected.has(p.id)
                const pm=S2_PRIO[p.priority]
                const overdue=p.followup&&new Date(p.followup)<new Date()
                return (
                  <tr key={p.id} style={{ borderBottom:`1px solid ${C2.border}`, background:sel?C2.accentLight:'transparent', transition:'background 0.1s', cursor:'pointer' }}
                    onMouseEnter={e=>{ if(!sel) e.currentTarget.style.background=C2.bg }}
                    onMouseLeave={e=>{ if(!sel) e.currentTarget.style.background='transparent' }}
                  >
                    <td style={{ padding:'11px 14px' }} onClick={e=>{e.stopPropagation();toggleSelect(p.id)}}>
                      <input type="checkbox" checked={sel} onChange={()=>toggleSelect(p.id)} style={{ cursor:'pointer', accentColor:C2.accent }} />
                    </td>
                    <td style={{ padding:'11px 14px' }} onClick={()=>{setDetailId(p.id);setPage('detail')}}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:3, height:30, borderRadius:1, background:pm.dot, flexShrink:0 }} />
                        <Avatar2 initials={p.initials} color={p.color} size={28} />
                        <div>
                          <div style={{ fontWeight:700, color:C2.text, fontSize:13, fontFamily:'Syne, sans-serif' }}>{p.company}</div>
                          <div style={{ fontSize:11, color:C2.subtle }}>{p.contact}{p.title?` · ${p.title}`:''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'11px 14px' }} onClick={()=>{setDetailId(p.id);setPage('detail')}}><StageBadge2 stage={p.stage} /></td>
                    <td style={{ padding:'11px 14px' }} onClick={()=>{setDetailId(p.id);setPage('detail')}}><PriorityBadge2 priority={p.priority} /></td>
                    <td style={{ padding:'11px 14px', fontSize:12, color:C2.muted }} onClick={()=>{setDetailId(p.id);setPage('detail')}}>{p.channel}</td>
                    <td style={{ padding:'11px 14px' }} onClick={()=>{setDetailId(p.id);setPage('detail')}}>
                      {p.value?<span style={{ fontFamily:'Syne, sans-serif', fontWeight:700, color:C2.green, fontSize:13 }}>{p.value.toLocaleString('fr-FR')} {p.currency}</span>:<span style={{ color:C2.subtle }}>—</span>}
                    </td>
                    <td style={{ padding:'11px 14px' }} onClick={()=>{setDetailId(p.id);setPage('detail')}}>
                      {p.followup?<span style={{ fontSize:12, fontWeight:overdue?700:400, color:overdue?C2.red:C2.text }}>{overdue?'⚠ ':''}{new Date(p.followup).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})}</span>:<span style={{ color:C2.subtle }}>—</span>}
                    </td>
                    <td style={{ padding:'11px 14px' }} onClick={()=>{setDetailId(p.id);setPage('detail')}}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ flex:1, height:3, background:C2.bgDeep, borderRadius:1 }}>
                          <div style={{ width:`${p.score}%`, height:'100%', background:p.score>=75?C2.green:p.score>=50?C2.amber:C2.red, borderRadius:1 }} />
                        </div>
                        <span style={{ fontSize:11, fontWeight:700, color:C2.muted, width:22, textAlign:'right', fontFamily:'monospace' }}>{p.score}</span>
                      </div>
                    </td>
                    <td style={{ padding:'11px 14px' }} onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>{setDetailId(p.id);setPage('detail')}} style={{ padding:'4px 10px', borderRadius:3, background:'transparent', border:`1px solid ${C2.border}`, color:C2.muted, fontSize:11, cursor:'pointer', fontFamily:'inherit', transition:'all 0.12s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=C2.accent;e.currentTarget.style.color=C2.accent}} onMouseLeave={e=>{e.currentTarget.style.borderColor=C2.border;e.currentTarget.style.color=C2.muted}}>
                        Ouvrir →
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* KANBAN */}
      {view==='kanban'&&(
        <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:8 }}>
          {STAGES.map(stage=>{
            const cols=filtered.filter(p=>p.stage===stage)
            const total=cols.reduce((s,p)=>s+(p.value||0),0)
            const m=S2_STAGE[stage]||{color:C2.muted}
            return (
              <div key={stage} style={{ width:200, flexShrink:0 }}>
                <div style={{ padding:'8px 10px', background:C2.card, borderRadius:4, border:`1px solid ${C2.border}`, marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:11, fontWeight:700, color:m.color }}>{stage}</span>
                  <span style={{ fontFamily:'Syne, sans-serif', fontSize:14, fontWeight:800, color:C2.text }}>{cols.length}</span>
                </div>
                {total>0&&<div style={{ fontSize:10, color:C2.subtle, paddingLeft:2, marginBottom:6 }}>{total.toLocaleString('fr-FR')} €</div>}
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {cols.map(p=>{
                    const pm=S2_PRIO[p.priority]
                    return (
                      <div key={p.id} onClick={()=>{setDetailId(p.id);setPage('detail')}}
                        style={{ background:C2.card, border:`1px solid ${C2.border}`, borderLeft:`2px solid ${pm.dot}`, borderRadius:4, padding:'10px 12px', cursor:'pointer', transition:'all 0.12s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=`${m.color}55`;e.currentTarget.style.boxShadow=`0 2px 8px ${m.color}18`}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=C2.border;e.currentTarget.style.boxShadow='none'}}
                      >
                        <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:5 }}>
                          <Avatar2 initials={p.initials} color={p.color} size={20} />
                          <span style={{ fontSize:12, fontWeight:700, color:C2.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontFamily:'Syne, sans-serif' }}>{p.company}</span>
                        </div>
                        <div style={{ fontSize:11, color:C2.subtle, marginBottom:7 }}>{p.contact}</div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontSize:10, color:C2.muted }}>{p.channel.split('/')[0]}</span>
                          {p.value&&<span style={{ fontFamily:'Syne, sans-serif', fontSize:12, fontWeight:700, color:C2.green }}>{(p.value/1000).toFixed(1)}k</span>}
                        </div>
                      </div>
                    )
                  })}
                  <button style={{ background:'transparent', border:`1px dashed ${C2.border}`, borderRadius:4, padding:'7px', color:C2.subtle, fontSize:11, cursor:'pointer', width:'100%', fontFamily:'inherit', transition:'all 0.12s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=C2.accent;e.currentTarget.style.color=C2.accent}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=C2.border;e.currentTarget.style.color=C2.subtle}}>
                    + Ajouter
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

Object.assign(window, { DashboardPageV2, ProspectsPageV2, KpiBlock, GoalRuler, PipelineTable, ChannelBars, ActivityLog })
