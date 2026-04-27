
// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ title, value, trend, spark, sparkColor, description, alert, icon, iconBg }) {
  const S = {
    card: { background: alert ? 'rgba(220,38,38,0.04)' : C.card, border:`1px solid ${alert ? 'rgba(220,38,38,0.2)' : C.border}`, borderRadius:14, padding:'18px 20px', display:'flex', flexDirection:'column', gap:12, boxShadow:'0 1px 4px rgba(99,102,241,0.06)' },
    iconWrap: { width:38, height:38, borderRadius:10, background: alert ? 'rgba(220,38,38,0.09)' : (iconBg||C.primaryLight), display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 },
    title: { fontSize:12, color:C.muted, fontWeight:500 },
    value: { fontSize:26, fontWeight:800, color: alert ? C.red : C.text, lineHeight:1, marginTop:2 },
    desc: { fontSize:11, color:C.subtle },
    row: { display:'flex', alignItems:'flex-end', justifyContent:'space-between' },
  }
  return (
    <div style={S.card}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={S.iconWrap}>{icon}</div>
        {spark && <Sparkline data={spark} color={alert ? C.red : (sparkColor||C.primary)} />}
      </div>
      <div>
        <div style={S.title}>{title}</div>
        <div style={S.value}>{value}</div>
        {description && <div style={{ ...S.desc, marginTop:4 }}>{description}</div>}
      </div>
      {trend !== undefined && (
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <TrendChip value={trend} />
          <span style={{ fontSize:11, color:C.subtle }}>vs mois dernier</span>
        </div>
      )}
    </div>
  )
}

// ─── Goal Bar ─────────────────────────────────────────────────────────────────
function GoalBar({ current, goal }) {
  const pct = Math.min(100, Math.round((current/goal)*100))
  const color = pct >= 80 ? C.green : pct >= 50 ? C.amber : C.primary
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 20px', boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
        <div>
          <div style={{ fontSize:12, color:C.muted, fontWeight:500 }}>Objectif mensuel</div>
          <div style={{ fontSize:22, fontWeight:800, color:C.text, marginTop:4 }}>
            {current.toLocaleString('fr-FR')} €
            <span style={{ fontSize:13, color:C.subtle, fontWeight:400, marginLeft:6 }}>/ {goal.toLocaleString('fr-FR')} €</span>
          </div>
        </div>
        <div style={{ background:`${color}12`, border:`1px solid ${color}25`, borderRadius:10, padding:'6px 12px', textAlign:'center' }}>
          <div style={{ fontSize:22, fontWeight:800, color, lineHeight:1 }}>{pct}%</div>
          <div style={{ fontSize:10, color:C.subtle, marginTop:2 }}>atteint</div>
        </div>
      </div>
      <div style={{ height:7, borderRadius:4, background:'#eef0ff' }}>
        <div style={{ width:`${pct}%`, height:'100%', borderRadius:4, background:`linear-gradient(90deg,${color}bb,${color})`, transition:'width 0.8s ease', boxShadow:`0 0 8px ${color}40` }} />
      </div>
    </div>
  )
}

// ─── Funnel Chart ─────────────────────────────────────────────────────────────
function FunnelChart({ data }) {
  const max = Math.max(...data.map(d=>d.count))
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {data.filter(d=>!['Gagné','Perdu'].includes(d.stage)).map(d => {
        const m = STAGE_META[d.stage]||{ color:C.primary }
        const pct = (d.count/max)*100
        return (
          <div key={d.stage} style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ fontSize:11, color:C.muted, width:130, flexShrink:0, textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.stage}</div>
            <div style={{ flex:1, height:18, background:'#f4f5ff', borderRadius:5, overflow:'hidden', position:'relative' }}>
              <div style={{ width:`${pct}%`, height:'100%', background:`${m.color}22`, borderRadius:5, transition:'width 0.8s', position:'relative' }}>
                <div style={{ position:'absolute', bottom:0, left:0, width:'100%', height:3, background:m.color, borderRadius:2 }} />
              </div>
            </div>
            <div style={{ fontSize:11, fontWeight:700, color:C.text, width:16, textAlign:'right' }}>{d.count}</div>
            <div style={{ fontSize:10, color:C.subtle, width:72, textAlign:'right', whiteSpace:'nowrap' }}>{d.value.toLocaleString('fr-FR')} €</div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ data }) {
  const total = data.reduce((s,d)=>s+d.count,0)
  let offset = 0
  const R = 36, Circ = 2*Math.PI*R
  const segs = data.map(d => { const dash=(d.count/total)*Circ; const seg={dash,offset,...d}; offset+=dash; return seg })
  return (
    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
      <svg width="90" height="90" viewBox="0 0 90 90" style={{ flexShrink:0 }}>
        <circle cx="45" cy="45" r={R} fill="none" stroke="#f0f1f8" strokeWidth="9"/>
        {segs.map((s,i)=>(
          <circle key={i} cx="45" cy="45" r={R} fill="none" stroke={s.color} strokeWidth="9"
            strokeDasharray={`${s.dash} ${Circ-s.dash}`} strokeDashoffset={Circ/4-s.offset} />
        ))}
        <text x="45" y="49" textAnchor="middle" fill={C.text} fontSize="13" fontWeight="800">{total}</text>
      </svg>
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
        {data.map(d=>(
          <div key={d.channel} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:d.color, flexShrink:0 }} />
            <span style={{ fontSize:12, color:C.muted, flex:1 }}>{d.channel}</span>
            <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{d.count}</span>
            <span style={{ fontSize:11, color:C.subtle, width:28, textAlign:'right' }}>{Math.round(d.count/total*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Activity Feed ────────────────────────────────────────────────────────────
function ActivityFeed({ interactions, onClickItem }) {
  const TYPE_COLOR = { 'Appel':C.green,'LinkedIn':C.primary,'Email':C.blue,'Réunion':C.amber,'Note interne':C.muted,'Instagram':C.pink,'Téléphone':C.green }
  const OUTCOME_STYLE = {
    'Positif':{ color:C.green, bg:C.greenLight },
    'Gagné':  { color:C.green, bg:C.greenLight },
    'En attente':{ color:C.amber, bg:C.amberLight },
    'Négatif':{ color:C.red,   bg:C.redLight },
    'Tiède':  { color:C.amber, bg:C.amberLight },
    'Froid':  { color:C.muted, bg:'rgba(107,114,128,0.08)' },
  }
  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      {interactions.map((item,i)=>{
        const tc = TYPE_COLOR[item.type]||C.muted
        const oc = OUTCOME_STYLE[item.outcome]||{}
        return (
          <div key={item.id} onClick={()=>onClickItem&&onClickItem(item)}
            style={{ display:'flex', gap:12, paddingBottom:14, position:'relative', cursor:onClickItem?'pointer':'default' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:32, flexShrink:0 }}>
              <div style={{ width:32, height:32, borderRadius:9, background:`${tc}12`, border:`1.5px solid ${tc}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, zIndex:1 }}>{item.icon}</div>
              {i<interactions.length-1 && <div style={{ width:1.5, flex:1, background:C.border, marginTop:4 }} />}
            </div>
            <div style={{ flex:1, paddingTop:4 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
                <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{item.prospect}</span>
                {item.outcome && <span style={{ fontSize:10, fontWeight:700, color:oc.color, background:oc.bg, padding:'1px 6px', borderRadius:5 }}>{item.outcome}</span>}
                <span style={{ fontSize:11, color:C.subtle, marginLeft:'auto' }}>{item.date==="Aujourd'hui"?item.time:item.date}</span>
              </div>
              <p style={{ fontSize:12, color:C.muted, margin:0, lineHeight:1.5 }}>{item.summary}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
function DashboardPage({ setPage, setDetailId }) {
  const { stats, byStage, byChannel, interactions } = window.CRM
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Alert */}
      {stats.followupOverdue > 0 && (
        <div onClick={()=>setPage('relances')} style={{ background:'rgba(220,38,38,0.05)', border:`1px solid rgba(220,38,38,0.2)`, borderRadius:12, padding:'11px 16px', display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
          <span style={{ fontSize:15 }}>⚠️</span>
          <span style={{ fontSize:13, color:C.red }}><strong>{stats.followupOverdue} relance{stats.followupOverdue>1?'s':''} en retard</strong> — à traiter en urgence</span>
          <span style={{ marginLeft:'auto', fontSize:12, color:C.red, fontWeight:700 }}>Voir →</span>
        </div>
      )}

      {/* KPI grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        <KpiCard title="Total prospects" value={stats.totalProspects} trend={stats.totalTrend} spark={stats.sparkProspects} sparkColor={C.primary} description="dans le pipeline" icon="👥" />
        <KpiCard title="Revenus potentiels" value={`${(stats.potentialRevenue/1000).toFixed(0)}k €`} trend={stats.revenueTrend} spark={stats.sparkRevenue} sparkColor={C.green} description="valeur totale estimée" icon="💰" iconBg={C.greenLight} />
        <KpiCard title="Taux de conversion" value={`${stats.conversionRate}%`} trend={stats.conversionTrend} spark={stats.sparkConversion} sparkColor={C.violet} description="prospects gagnés" icon="🎯" iconBg={C.violetLight} />
        <KpiCard title="Relances en retard" value={stats.followupOverdue} alert={stats.followupOverdue>0} description="à traiter en urgence" icon="⚠️" />
      </div>

      {/* Goal + Quick stats */}
      <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:12 }}>
        <GoalBar current={stats.monthlyRevenue} goal={stats.monthlyGoal} />
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 20px', display:'flex', gap:0, boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }}>
          {[
            { label:'Chauds',   val:stats.hotProspects, color:C.red,   emoji:'🔥' },
            { label:"Aujourd'hui", val:stats.followupToday, color:C.amber, emoji:'📅' },
            { label:'Gagnés',   val:stats.wonThisMonth,  color:C.green, emoji:'🏆' },
          ].map((item,i) => (
            <div key={item.label} style={{ flex:1, textAlign:'center', borderRight: i<2 ? `1px solid ${C.border}` : 'none', padding:'0 8px' }}>
              <div style={{ fontSize:20 }}>{item.emoji}</div>
              <div style={{ fontSize:28, fontWeight:800, color:item.color, lineHeight:1.1, margin:'4px 0' }}>{item.val}</div>
              <div style={{ fontSize:11, color:C.subtle }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts + Activity */}
      <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:12 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 20px', boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:3 }}>Pipeline par étape</div>
            <div style={{ fontSize:11, color:C.subtle, marginBottom:14 }}>Prospects actifs dans chaque phase</div>
            <FunnelChart data={byStage} />
          </div>
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 20px', boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:3 }}>Canaux de prospection</div>
            <div style={{ fontSize:11, color:C.subtle, marginBottom:14 }}>Répartition par source</div>
            <DonutChart data={byChannel} />
          </div>
        </div>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 20px', boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:3 }}>Activité récente</div>
          <div style={{ fontSize:11, color:C.subtle, marginBottom:16 }}>Dernières interactions</div>
          <ActivityFeed interactions={interactions} onClickItem={item=>{ setDetailId(item.prospectId); setPage('detail') }} />
          <button onClick={()=>setPage('journal')} style={{ marginTop:12, width:'100%', background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:9, padding:'8px 0', color:C.primary, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            Voir tout le journal →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Advanced Filters ─────────────────────────────────────────────────────────
const FILTER_FIELDS = [
  { key:'priority',  label:'Priorité',           type:'select',  options:['Chaud','Tiède','Froid'] },
  { key:'stage',     label:'Étape',              type:'select',  options:['Identifié','Premier contact','Réponse reçue','RDV fixé','Devis envoyé','En négociation','Gagné','Perdu'] },
  { key:'channel',   label:'Canal',              type:'select',  options:['LinkedIn','Instagram/DMs','Email froid','Téléphone/Physique'] },
  { key:'value',     label:'Valeur du deal',     type:'number',  ops:['est supérieure à','est inférieure à','est égale à'] },
  { key:'score',     label:'Score de lead',      type:'number',  ops:['est supérieur à','est inférieur à','est égal à'] },
  { key:'sector',    label:'Secteur',            type:'text' },
  { key:'city',      label:'Ville',              type:'text' },
  { key:'followup',  label:'Prochain contact',   type:'date_special', ops:['est planifié','n\'est pas planifié','est dans le passé','est aujourd\'hui ou demain'] },
]
const DEFAULT_OPS = { select:['est','n\'est pas'], text:['contient','ne contient pas'], number:['est supérieure à','est inférieure à','est égale à'], date_special:[] }

function getOps(field) {
  if (field.ops) return field.ops
  return DEFAULT_OPS[field.type] || ['est']
}

function applyCondition(prospect, cond) {
  const field = FILTER_FIELDS.find(f=>f.key===cond.field)
  if (!field || !cond.field) return true
  const val = prospect[cond.field]
  switch(field.type) {
    case 'select':
      return cond.op==="n'est pas" ? String(val)!==cond.value : String(val)===cond.value
    case 'text':
      return cond.op==="ne contient pas"
        ? !(String(val||'').toLowerCase().includes(cond.value.toLowerCase()))
        : String(val||'').toLowerCase().includes(cond.value.toLowerCase())
    case 'number': {
      const n = Number(val||0), v = Number(cond.value||0)
      if (cond.op.includes('supérieure') || cond.op.includes('supérieur')) return n > v
      if (cond.op.includes('inférieure') || cond.op.includes('inférieur')) return n < v
      return n === v
    }
    case 'date_special':
      if (cond.op==="est planifié") return !!val
      if (cond.op==="n'est pas planifié") return !val
      if (cond.op==="est dans le passé") return val && new Date(val) < new Date()
      if (cond.op==="est aujourd'hui ou demain") {
        if (!val) return false
        const d = new Date(val), now = new Date()
        const diff = (d - now) / 86400000
        return diff >= -0.5 && diff <= 1.5
      }
      return true
    default: return true
  }
}

const SAVED_PRESETS = [
  { name:'Chauds sans relance', conditions:[{field:'priority',op:'est',value:'Chaud'},{field:'followup',op:"n'est pas planifié",value:''}] },
  { name:'Pipeline actif', conditions:[{field:'stage',op:'est',value:'En négociation'},{field:'value',op:'est supérieure à',value:'5000'}] },
  { name:'LinkedIn > 5k€', conditions:[{field:'channel',op:'est',value:'LinkedIn'},{field:'value',op:'est supérieure à',value:'5000'}] },
]

function AdvancedFilterPanel({ conditions, setConditions, onClose, onSave }) {
  const addCond = () => setConditions(c=>[...c,{id:Date.now(),field:'priority',op:'est',value:''}])
  const removeCond = id => setConditions(c=>c.filter(x=>x.id!==id))
  const updateCond = (id,k,v) => setConditions(c=>c.map(x=>x.id===id?{...x,[k]:v, ...(k==='field'?{op:getOps(FILTER_FIELDS.find(f=>f.key===v)||{})[0]||'est',value:''}:{})}:x))
  const [saveName, setSaveName] = React.useState('')
  const [showSave, setShowSave] = React.useState(false)

  const inp = { background:'#f7f8ff', border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 10px', color:C.text, fontSize:12, outline:'none', fontFamily:'inherit' }

  return (
    <div style={{ background:C.card, border:`1px solid ${C.primaryBorder}`, borderRadius:14, padding:'18px 20px', marginBottom:14, boxShadow:'0 4px 20px rgba(99,102,241,0.1)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.text }}>🔍 Filtres avancés</div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ fontSize:11, color:C.subtle }}>Opérateur : <strong style={{ color:C.primary }}>ET</strong></span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:C.subtle, fontSize:16, padding:0, lineHeight:1 }}>×</button>
        </div>
      </div>

      {/* Preset chips */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
        <span style={{ fontSize:11, color:C.subtle, alignSelf:'center' }}>Présets :</span>
        {SAVED_PRESETS.map(p=>(
          <button key={p.name} onClick={()=>setConditions(p.conditions.map((c,i)=>({...c,id:i+1})))}
            style={{ padding:'3px 10px', borderRadius:20, border:`1px solid ${C.primaryBorder}`, background:C.primaryLight, color:C.primary, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all 0.13s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background=C.primary; e.currentTarget.style.color='#fff' }}
            onMouseLeave={e=>{ e.currentTarget.style.background=C.primaryLight; e.currentTarget.style.color=C.primary }}
          >{p.name}</button>
        ))}
      </div>

      {/* Conditions */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {conditions.map((cond,idx) => {
          const field = FILTER_FIELDS.find(f=>f.key===cond.field)
          const ops = field ? getOps(field) : ['est']
          return (
            <div key={cond.id} style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              {idx > 0 && <span style={{ fontSize:11, fontWeight:700, color:C.primary, width:24, textAlign:'center', flexShrink:0 }}>ET</span>}
              {idx === 0 && <span style={{ fontSize:11, color:C.subtle, width:24, textAlign:'center', flexShrink:0 }}>Si</span>}

              {/* Field selector */}
              <select value={cond.field} onChange={e=>updateCond(cond.id,'field',e.target.value)}
                style={{ ...inp, cursor:'pointer', minWidth:140 }}>
                {FILTER_FIELDS.map(f=><option key={f.key} value={f.key}>{f.label}</option>)}
              </select>

              {/* Operator */}
              {field?.type !== 'date_special' ? (
                <select value={cond.op} onChange={e=>updateCond(cond.id,'op',e.target.value)}
                  style={{ ...inp, cursor:'pointer', minWidth:130 }}>
                  {ops.map(o=><option key={o}>{o}</option>)}
                </select>
              ) : (
                <select value={cond.op} onChange={e=>updateCond(cond.id,'op',e.target.value)}
                  style={{ ...inp, cursor:'pointer', minWidth:180 }}>
                  {["est planifié","n'est pas planifié","est dans le passé","est aujourd'hui ou demain"].map(o=><option key={o}>{o}</option>)}
                </select>
              )}

              {/* Value */}
              {field?.type === 'select' && (
                <select value={cond.value} onChange={e=>updateCond(cond.id,'value',e.target.value)}
                  style={{ ...inp, cursor:'pointer', minWidth:140 }}>
                  <option value="">Sélectionner…</option>
                  {(field.options||[]).map(o=><option key={o}>{o}</option>)}
                </select>
              )}
              {(field?.type === 'text') && (
                <input value={cond.value} onChange={e=>updateCond(cond.id,'value',e.target.value)}
                  placeholder="Valeur…" style={{ ...inp, minWidth:120 }} />
              )}
              {field?.type === 'number' && (
                <input type="number" value={cond.value} onChange={e=>updateCond(cond.id,'value',e.target.value)}
                  placeholder="0" style={{ ...inp, width:80 }} />
              )}

              <button onClick={()=>removeCond(cond.id)} style={{ width:26, height:26, borderRadius:6, background:C.redLight, border:`1px solid rgba(220,38,38,0.2)`, color:C.red, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>×</button>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:8, marginTop:14, alignItems:'center', flexWrap:'wrap' }}>
        <button onClick={addCond} style={{ display:'inline-flex', alignItems:'center', gap:5, background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:8, padding:'6px 13px', color:C.primary, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          + Ajouter une condition
        </button>
        {conditions.length > 0 && (
          <>
            <button onClick={()=>setConditions([])} style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#f7f8ff', border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 13px', color:C.muted, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
              Effacer tout
            </button>
            {!showSave ? (
              <button onClick={()=>setShowSave(true)} style={{ display:'inline-flex', alignItems:'center', gap:5, background:C.greenLight, border:`1px solid rgba(22,163,74,0.2)`, borderRadius:8, padding:'6px 13px', color:C.green, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                💾 Enregistrer le filtre
              </button>
            ) : (
              <div style={{ display:'flex', gap:6 }}>
                <input value={saveName} onChange={e=>setSaveName(e.target.value)} placeholder="Nom du filtre…"
                  style={{ ...inp, padding:'5px 10px', width:160 }} />
                <button onClick={()=>{ onSave(saveName, conditions); setShowSave(false); setSaveName('') }}
                  style={{ background:C.green, border:'none', borderRadius:8, padding:'5px 12px', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>OK</button>
              </div>
            )}
          </>
        )}
        <span style={{ marginLeft:'auto', fontSize:12, color:C.primary, fontWeight:700 }}>
          {/* count shown externally */}
        </span>
      </div>
    </div>
  )
}

// ─── Prospects Page ───────────────────────────────────────────────────────────
function ProspectsPage({ setPage, setDetailId }) {
  const [view, setView] = React.useState('table')
  const [search, setSearch] = React.useState('')
  const [filterStage, setFilterStage] = React.useState('')
  const [filterPriority, setFilterPriority] = React.useState('')
  const [selected, setSelected] = React.useState(new Set())
  const [sortKey, setSortKey] = React.useState('company')
  const [sortDir, setSortDir] = React.useState('asc')
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [advConditions, setAdvConditions] = React.useState([])
  const [savedFilters, setSavedFilters] = React.useState([])

  const prospects = window.CRM.prospects
  const filtered = React.useMemo(() => prospects.filter(p => {
    if (search && !p.company.toLowerCase().includes(search.toLowerCase()) && !p.contact.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStage && p.stage !== filterStage) return false
    if (filterPriority && p.priority !== filterPriority) return false
    // Advanced conditions (AND)
    for (const cond of advConditions) {
      if (cond.field && cond.value !== undefined) {
        if (!applyCondition(p, cond)) return false
      }
    }
    return true
  }).sort((a,b) => { const c=String(a[sortKey]||'').localeCompare(String(b[sortKey]||''),'fr'); return sortDir==='asc'?c:-c }), [prospects,search,filterStage,filterPriority,sortKey,sortDir,advConditions])

  const activeFilterCount = advConditions.filter(c=>c.field&&c.value!==undefined&&c.value!=='').length

  const toggleSort = k => { if(sortKey===k) setSortDir(d=>d==='asc'?'desc':'asc'); else { setSortKey(k); setSortDir('asc') } }
  const toggleSelect = id => { const s=new Set(selected); s.has(id)?s.delete(id):s.add(id); setSelected(s) }
  const allSel = filtered.length>0 && filtered.every(p=>selected.has(p.id))

  const STAGES = ['Identifié','Premier contact','Réponse reçue','RDV fixé','Devis envoyé','En négociation','Gagné','Perdu']
  const PIPELINE_STAGES = STAGES

  const btn = (variant) => ({
    display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:9,
    fontSize:12, fontWeight:600, cursor:'pointer', border:'none', fontFamily:'inherit', transition:'all 0.13s',
    ...(variant==='primary' ? { background:C.primary, color:'#fff', boxShadow:`0 2px 8px ${C.primary}40` } :
        variant==='ghost'   ? { background:C.card, color:C.muted, border:`1px solid ${C.border}` } : {}),
  })
  const viewBtn = active => ({ padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', border:`1px solid ${active?C.primaryBorder:C.border}`, background:active?C.primaryLight:C.card, color:active?C.primary:C.muted, transition:'all 0.13s', fontFamily:'inherit' })
  const inp = { background:'#f7f8ff', border:`1px solid ${C.border}`, borderRadius:9, padding:'7px 12px', color:C.text, fontSize:12, outline:'none', fontFamily:'inherit' }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800, color:C.text }}>Prospects</div>
          <div style={{ fontSize:12, color:C.subtle, marginTop:2 }}>
            {prospects.length} prospects · <span style={{ color: filtered.length < prospects.length ? C.primary : C.subtle, fontWeight: filtered.length < prospects.length ? 700 : 400 }}>{filtered.length} affichés{filtered.length < prospects.length ? ` (filtré${activeFilterCount>0?' — '+activeFilterCount+' condition'+(activeFilterCount>1?'s':''):''})`  : ''}</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button style={btn('ghost')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Importer
          </button>
          <button style={btn('ghost')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Exporter
          </button>
          <button style={btn('primary')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nouveau prospect
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <input style={{ ...inp, width:220 }} placeholder="🔍  Rechercher…" value={search} onChange={e=>setSearch(e.target.value)} />
        <select style={{ ...inp, cursor:'pointer' }} value={filterStage} onChange={e=>setFilterStage(e.target.value)}>
          <option value="">Toutes les étapes</option>
          {STAGES.map(s=><option key={s}>{s}</option>)}
        </select>
        <select style={{ ...inp, cursor:'pointer' }} value={filterPriority} onChange={e=>setFilterPriority(e.target.value)}>
          <option value="">Toutes priorités</option>
          <option>Chaud</option><option>Tiède</option><option>Froid</option>
        </select>
        <button onClick={()=>setShowAdvanced(!showAdvanced)}
          style={{ ...inp, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:6, padding:'7px 13px', background:showAdvanced||activeFilterCount>0?C.primaryLight:'#f7f8ff', border:`1px solid ${showAdvanced||activeFilterCount>0?C.primaryBorder:C.border}`, color:showAdvanced||activeFilterCount>0?C.primary:C.muted, borderRadius:9, fontWeight:600, transition:'all 0.13s' }}>
          ⚡ Filtres avancés
          {activeFilterCount > 0 && <span style={{ background:C.primary, color:'#fff', borderRadius:10, fontSize:10, fontWeight:700, padding:'1px 6px', marginLeft:2 }}>{activeFilterCount}</span>}
        </button>
        {/* Saved filter chips */}
        {savedFilters.map(f=>(
          <button key={f.name} onClick={()=>setAdvConditions(f.conditions)}
            style={{ padding:'5px 10px', borderRadius:20, border:`1px solid ${C.primaryBorder}`, background:C.primaryLight, color:C.primary, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            {f.name} ×
          </button>
        ))}
        <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
          <button style={viewBtn(view==='table')} onClick={()=>setView('table')}>☰ Table</button>
          <button style={viewBtn(view==='kanban')} onClick={()=>setView('kanban')}>⊞ Kanban</button>
        </div>
      </div>

      {/* Advanced filter panel */}
      {showAdvanced && (
        <AdvancedFilterPanel
          conditions={advConditions}
          setConditions={setAdvConditions}
          onClose={()=>setShowAdvanced(false)}
          onSave={(name, conds)=>setSavedFilters(f=>[...f,{name,conditions:conds}])}
        />
      )}

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px', background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:10 }}>
          <span style={{ fontSize:12, color:C.primary, fontWeight:700 }}>{selected.size} sélectionné{selected.size>1?'s':''}</span>
          <button style={{ ...btn('ghost'), padding:'4px 10px', fontSize:11 }} onClick={()=>setSelected(new Set())}>Désélectionner</button>
          <button style={{ ...btn('ghost'), padding:'4px 10px', fontSize:11, color:C.amber, borderColor:'rgba(217,119,6,0.2)', background:'rgba(217,119,6,0.07)' }}>Changer étape</button>
          <button style={{ ...btn('ghost'), padding:'4px 10px', fontSize:11, color:C.red, borderColor:'rgba(220,38,38,0.2)', background:C.redLight }}>Supprimer</button>
        </div>
      )}

      {/* TABLE VIEW */}
      {view === 'table' && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:'auto', boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:860 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${C.border}`, background:'#f9faff' }}>
                <th style={{ padding:'10px 14px', width:36 }}>
                  <input type="checkbox" checked={allSel} onChange={()=>setSelected(allSel?new Set():new Set(filtered.map(p=>p.id)))} style={{ cursor:'pointer', accentColor:C.primary }} />
                </th>
                {[['company','Entreprise'],['stage','Étape'],['priority','Priorité'],['channel','Canal'],['value','Valeur'],['followup','Prochain contact'],['score','Score']].map(([k,l])=>(
                  <th key={k} onClick={()=>toggleSort(k)} style={{ padding:'10px 14px', fontSize:11, color:C.muted, fontWeight:700, textAlign:'left', cursor:'pointer', userSelect:'none', whiteSpace:'nowrap' }}>
                    {l} {sortKey===k?(sortDir==='asc'?'↑':'↓'):''}
                  </th>
                ))}
                <th style={{ padding:'10px 14px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const sel = selected.has(p.id)
                const pm = PRIORITY_META[p.priority]
                const overdue = p.followup && new Date(p.followup) < new Date()
                return (
                  <tr key={p.id} style={{ borderBottom:`1px solid ${C.border}`, background:sel?`${C.primary}06`:'transparent', transition:'background 0.1s', cursor:'pointer' }}
                    onMouseEnter={e=>{ if(!sel) e.currentTarget.style.background='#f9faff' }}
                    onMouseLeave={e=>{ if(!sel) e.currentTarget.style.background='transparent' }}
                  >
                    <td style={{ padding:'11px 14px', width:36 }} onClick={e=>{e.stopPropagation();toggleSelect(p.id)}}>
                      <input type="checkbox" checked={sel} onChange={()=>toggleSelect(p.id)} style={{ cursor:'pointer', accentColor:C.primary }} />
                    </td>
                    <td style={{ padding:'11px 14px' }} onClick={()=>{ setDetailId(p.id); setPage('detail') }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:3, height:34, borderRadius:2, background:pm.dot, flexShrink:0 }} />
                        <Avatar initials={p.initials} color={p.color} size={32} />
                        <div>
                          <div style={{ fontWeight:700, color:C.text, fontSize:13 }}>{p.company}</div>
                          <div style={{ fontSize:11, color:C.subtle }}>{p.contact}{p.title?` · ${p.title}`:''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'11px 14px' }} onClick={()=>{ setDetailId(p.id); setPage('detail') }}><StageBadge stage={p.stage} /></td>
                    <td style={{ padding:'11px 14px' }} onClick={()=>{ setDetailId(p.id); setPage('detail') }}><PriorityBadge priority={p.priority} /></td>
                    <td style={{ padding:'11px 14px' }} onClick={()=>{ setDetailId(p.id); setPage('detail') }}><ChannelBadge channel={p.channel} label /></td>
                    <td style={{ padding:'11px 14px' }} onClick={()=>{ setDetailId(p.id); setPage('detail') }}>
                      {p.value ? <span style={{ fontWeight:700, color:C.green, fontSize:13 }}>{p.value.toLocaleString('fr-FR')} {p.currency}</span> : <span style={{ color:C.subtle }}>—</span>}
                    </td>
                    <td style={{ padding:'11px 14px' }} onClick={()=>{ setDetailId(p.id); setPage('detail') }}>
                      {p.followup ? <span style={{ fontSize:12, fontWeight:overdue?700:400, color:overdue?C.red:C.text }}>{overdue?'⚠ ':''}{new Date(p.followup).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})}</span> : <span style={{ color:C.subtle }}>—</span>}
                    </td>
                    <td style={{ padding:'11px 14px' }} onClick={()=>{ setDetailId(p.id); setPage('detail') }}>
                      <div style={{ width:80 }}><ScoreBar score={p.score} /></div>
                    </td>
                    <td style={{ padding:'11px 14px' }} onClick={e=>e.stopPropagation()}>
                      <div style={{ display:'flex', gap:4 }}>
                        {p.email && <button style={{ width:26, height:26, borderRadius:6, background:C.blueLight, border:`1px solid ${C.blue}25`, color:C.blue, cursor:'pointer', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' }}>✉</button>}
                        <button onClick={()=>{ setDetailId(p.id); setPage('detail') }} style={{ width:26, height:26, borderRadius:6, background:'#f4f5ff', border:`1px solid ${C.border}`, color:C.muted, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>→</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* KANBAN VIEW */}
      {view === 'kanban' && (
        <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:8 }}>
          {PIPELINE_STAGES.map(stage => {
            const cols = filtered.filter(p=>p.stage===stage)
            const total = cols.reduce((s,p)=>s+(p.value||0),0)
            const m = STAGE_META[stage]||{ color:C.muted }
            return (
              <div key={stage} style={{ width:196, flexShrink:0 }}>
                <div style={{ padding:'8px 10px', background:C.card, borderRadius:10, border:`1px solid ${C.border}`, marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:m.color }}>{stage}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:C.text, background:'#f4f5ff', borderRadius:5, padding:'1px 7px', border:`1px solid ${C.border}` }}>{cols.length}</span>
                  </div>
                  {total>0 && <div style={{ fontSize:10, color:C.subtle }}>{total.toLocaleString('fr-FR')} €</div>}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                  {cols.map(p => {
                    const pm = PRIORITY_META[p.priority]
                    return (
                      <div key={p.id} onClick={()=>{ setDetailId(p.id); setPage('detail') }}
                        style={{ background:C.card, border:`1px solid ${C.border}`, borderLeft:`3px solid ${pm.dot}`, borderRadius:10, padding:'10px 12px', cursor:'pointer', transition:'all 0.13s', boxShadow:'0 1px 3px rgba(99,102,241,0.06)' }}
                        onMouseEnter={e=>{ e.currentTarget.style.boxShadow=`0 4px 16px ${m.color}20`; e.currentTarget.style.borderColor=`${m.color}50` }}
                        onMouseLeave={e=>{ e.currentTarget.style.boxShadow='0 1px 3px rgba(99,102,241,0.06)'; e.currentTarget.style.borderColor=C.border }}
                      >
                        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
                          <Avatar initials={p.initials} color={p.color} size={22} />
                          <span style={{ fontSize:12, fontWeight:700, color:C.text, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.company}</span>
                        </div>
                        <div style={{ fontSize:11, color:C.subtle, marginBottom:7 }}>{p.contact}</div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <ChannelBadge channel={p.channel} />
                          {p.value && <span style={{ fontSize:11, fontWeight:700, color:C.green }}>{(p.value/1000).toFixed(1)}k €</span>}
                        </div>
                        {p.followup && (
                          <div style={{ marginTop:6, fontSize:10, color:new Date(p.followup)<new Date()?C.red:C.subtle, display:'flex', alignItems:'center', gap:4 }}>
                            📅 {new Date(p.followup).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'})}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <button style={{ background:'#f7f8ff', border:`1px dashed ${C.border}`, borderRadius:9, padding:'8px', color:C.subtle, fontSize:12, cursor:'pointer', width:'100%', transition:'all 0.13s', fontFamily:'inherit' }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.primary; e.currentTarget.style.color=C.primary; e.currentTarget.style.background=C.primaryLight }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.subtle; e.currentTarget.style.background='#f7f8ff' }}
                  >+ Ajouter</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

Object.assign(window, { DashboardPage, ProspectsPage, KpiCard, GoalBar, FunnelChart, DonutChart, ActivityFeed })
