
// ─── Prospect Detail ──────────────────────────────────────────────────────────
function ProspectDetailPage({ id, setPage }) {
  const p = window.CRM.prospects.find(x=>x.id===id) || window.CRM.prospects[0]
  const interactions = window.CRM.detailInteractions[id] || window.CRM.detailInteractions['1']
  const [tab, setTab] = React.useState('timeline')
  const PIPE = ['Identifié','Premier contact','Réponse reçue','RDV fixé','Devis envoyé','En négociation','Gagné','Perdu']
  const stageIdx = PIPE.indexOf(p.stage)
  const TYPE_COLOR = { 'Appel':C.green,'LinkedIn':C.primary,'Email':C.blue,'Réunion':C.amber,'Note interne':C.muted,'Devis':C.violet,'Instagram':C.pink }

  const card = { background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 20px', boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }
  const tabBtn = (active) => ({ padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', border:'none', fontFamily:'inherit', background:active?C.primaryLight:'transparent', color:active?C.primary:C.muted, transition:'all 0.13s' })
  const actionBtn = (color, bg) => ({ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:9, fontSize:12, fontWeight:600, cursor:'pointer', border:`1px solid ${color}30`, background:bg||`${color}10`, color, fontFamily:'inherit', transition:'all 0.13s' })
  const fieldLabel = { fontSize:10, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:5 }

  return (
    <div style={{ maxWidth:960 }}>
      <button onClick={()=>setPage('prospects')} style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, color:C.muted, cursor:'pointer', background:'none', border:'none', padding:0, fontFamily:'inherit', marginBottom:14 }}>
        ← Retour aux prospects
      </button>

      {/* Header */}
      <div style={{ ...card, marginBottom:14 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <Avatar initials={p.initials} color={p.color} size={52} />
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5, flexWrap:'wrap' }}>
                <h1 style={{ fontSize:20, fontWeight:800, color:C.text, margin:0 }}>{p.company}</h1>
                <PriorityBadge priority={p.priority} />
                <StageBadge stage={p.stage} />
              </div>
              <p style={{ fontSize:13, color:C.muted, margin:0 }}>{p.contact}{p.title?` · ${p.title}`:''}{p.city?` · ${p.city}`:''}</p>
            </div>
          </div>
          <div style={{ background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:12, padding:'10px 18px', textAlign:'center', flexShrink:0 }}>
            <div style={{ fontSize:10, color:C.muted, fontWeight:700, textTransform:'uppercase', marginBottom:4 }}>Score</div>
            <div style={{ fontSize:30, fontWeight:800, color:p.score>=75?C.green:p.score>=50?C.amber:C.red, lineHeight:1 }}>{p.score}</div>
            <div style={{ fontSize:10, color:C.subtle, marginTop:3 }}>/100</div>
          </div>
        </div>

        {/* Pipeline bar */}
        <div style={{ marginTop:18, paddingTop:16, borderTop:`1px solid ${C.border}` }}>
          <div style={{ display:'flex', alignItems:'flex-start', position:'relative' }}>
            {PIPE.filter(s=>s!=='Perdu').map((s,i) => {
              const active = i <= stageIdx && p.stage!=='Perdu'
              const current = s === p.stage
              const m = STAGE_META[s]
              return (
                <div key={s} style={{ flex:1, textAlign:'center', position:'relative' }}>
                  <div style={{ height:3, background:active?C.primary:'#eef0ff', marginBottom:6, transition:'background 0.3s' }} />
                  <div style={{ width:9, height:9, borderRadius:'50%', background:current?C.primary:active?`${C.primary}60`:'#e4e6f4', border:current?`2px solid ${C.primary}`:'none', margin:'0 auto 5px', transition:'all 0.3s', boxShadow:current?`0 0 0 3px ${C.primary}25`:'' }} />
                  <div style={{ fontSize:9, color:current?C.primary:C.subtle, fontWeight:current?700:400, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.split(' ')[0]}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display:'flex', gap:8, marginTop:16, paddingTop:14, borderTop:`1px solid ${C.border}`, flexWrap:'wrap' }}>
          {p.email && <button style={actionBtn(C.blue)}> ✉ Email</button>}
          {p.phone && <button style={actionBtn(C.green)}> Appeler</button>}
          <button style={actionBtn(C.primary)}>LinkedIn</button>
          <button style={actionBtn(C.amber)}>Planifier relance</button>
          <button style={{ ...actionBtn(C.violet), marginLeft:'auto' }}>✏️ Modifier</button>
          <button style={{ ...actionBtn(C.red,'rgba(220,38,38,0.06)') }}>🗑 Supprimer</button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:14 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Tabs */}
          <div style={{ display:'flex', gap:2, background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:6 }}>
            {[['timeline','⏱ Timeline'],['notes','📝 Notes'],['infos','ℹ️ Infos']].map(([k,l])=>(
              <button key={k} style={tabBtn(tab===k)} onClick={()=>setTab(k)}>{l}</button>
            ))}
          </div>

          {tab === 'timeline' && (
            <div style={card}>
              <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                <input placeholder="Ajouter une interaction…" style={{ flex:1, background:'#f7f8ff', border:`1px solid ${C.border}`, borderRadius:9, padding:'8px 12px', color:C.text, fontSize:12, outline:'none', fontFamily:'inherit' }} />
                <button style={{ background:C.primary, border:'none', borderRadius:9, padding:'8px 16px', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:`0 2px 8px ${C.primary}40` }}>Ajouter</button>
              </div>
              {interactions.map((item,i)=>{
                const tc = TYPE_COLOR[item.type]||C.muted
                return (
                  <div key={item.id} style={{ display:'flex', gap:12, paddingBottom:16, position:'relative' }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:32, flexShrink:0 }}>
                      <div style={{ width:32, height:32, borderRadius:10, background:`${tc}12`, border:`1.5px solid ${tc}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>{item.icon||'💬'}</div>
                      {i<interactions.length-1 && <div style={{ width:2, flex:1, background:C.border, marginTop:4 }} />}
                    </div>
                    <div style={{ flex:1, paddingTop:4 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:tc }}>{item.type}</span>
                        <span style={{ fontSize:11, color:C.subtle }}>{item.date}</span>
                        {item.outcome && <span style={{ fontSize:10, fontWeight:700, color:item.outcome==='Positif'?C.green:C.amber, background:item.outcome==='Positif'?C.greenLight:C.amberLight, borderRadius:5, padding:'1px 6px' }}>{item.outcome}</span>}
                      </div>
                      <p style={{ fontSize:12, color:C.muted, margin:0, lineHeight:1.5 }}>{item.summary}</p>
                      {item.next && <p style={{ fontSize:11, color:C.subtle, margin:'4px 0 0', fontStyle:'italic' }}>→ {item.next}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {tab === 'notes' && (
            <div style={card}>
              <textarea defaultValue={p.notes||''} placeholder="Notes libres…" style={{ width:'100%', minHeight:200, background:'#f9faff', border:`1px solid ${C.border}`, borderRadius:9, padding:12, color:C.text, fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', lineHeight:1.6, boxSizing:'border-box' }} />
            </div>
          )}
          {tab === 'infos' && (
            <div style={{ ...card, display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px 24px' }}>
              {[['Secteur',p.sector],['Ville',p.city],['Email',p.email],['Téléphone',p.phone],['Canal',p.channel],['Valeur du deal',p.value?`${p.value.toLocaleString('fr-FR')} ${p.currency}`:null]].map(([label,val])=>val&&(
                <div key={label}>
                  <div style={fieldLabel}>{label}</div>
                  <div style={{ fontSize:13, color:C.text }}>{val}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={card}>
            <div style={fieldLabel}>Valeur du deal</div>
            <div style={{ fontSize:24, fontWeight:800, color:C.green }}>{p.value?`${p.value.toLocaleString('fr-FR')} ${p.currency}`:'—'}</div>
          </div>
          <div style={{ ...card, border:`1px solid ${p.followup&&new Date(p.followup)<new Date()?'rgba(220,38,38,0.25)':C.border}`, background:p.followup&&new Date(p.followup)<new Date()?'rgba(220,38,38,0.04)':C.card }}>
            <div style={fieldLabel}>Prochain contact</div>
            <div style={{ fontSize:13, fontWeight:700, color:p.followup&&new Date(p.followup)<new Date()?C.red:C.text, marginTop:4 }}>
              {p.followup?new Date(p.followup).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'}):'Non planifié'}
            </div>
            {p.followup&&new Date(p.followup)<new Date()&&<div style={{ fontSize:11, color:C.red, marginTop:3 }}>⚠ En retard</div>}
            <button style={{ marginTop:10, width:'100%', background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:8, padding:'7px 0', color:C.primary, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Reprogrammer</button>
          </div>
          <div style={card}>
            <div style={fieldLabel}>Score de lead</div>
            <div style={{ marginTop:8 }}><ScoreBar score={p.score} /></div>
            <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:6 }}>
              {[['Engagement',Math.min(100,Math.round(p.score*0.9))],['Timing',Math.min(100,Math.round(p.score*1.1))],['Valeur deal',Math.min(100,Math.round(p.score*0.85))]].map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:C.subtle }}>
                  <span>{l}</span><span style={{ color:C.muted, fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Relances Page ────────────────────────────────────────────────────────────
function RelancesPage({ setPage, setDetailId }) {
  const todayStr = new Date().toISOString().split('T')[0]
  const allRelances = window.CRM.relances || []

  // Enrich with extra mock dates for a fuller calendar
  const relances = [
    ...allRelances,
    { id:'2',  company:'Beauté Concept',   contact:'Sophie Leroi',   priority:'Chaud', stage:'RDV fixé',        date:'2026-04-22', overdue:false },
    { id:'10', company:'ArtisanBio',        contact:'Emma Fontaine',  priority:'Chaud', stage:'RDV fixé',        date:'2026-04-23', overdue:false },
    { id:'6',  company:'Startup Labs',      contact:'Léa Bernard',    priority:'Tiède', stage:'Identifié',       date:'2026-04-28', overdue:false },
    { id:'11', company:'FinTech Solutions', contact:'David Hamid',    priority:'Chaud', stage:'En négociation',  date:'2026-04-26', overdue:false },
    { id:'4',  company:'RestauGroup',       contact:'Camille Laurent',priority:'Froid', stage:'Premier contact', date:'2026-04-29', overdue:false },
    { id:'12', company:'Agence Pixel',      contact:'Julie Chen',     priority:'Tiède', stage:'Devis envoyé',    date:'2026-04-27', overdue:false },
    { id:'9',  company:'EduConnect',        contact:'Thomas Garcia',  priority:'Tiède', stage:'Premier contact', date:'2026-05-02', overdue:false },
    { id:'3',  company:'Immo Plus',         contact:'Pierre Dubois',  priority:'Tiède', stage:'Devis envoyé',    date:'2026-05-05', overdue:false },
  ]

  const [viewMode, setViewMode] = React.useState('list')
  const [calDate, setCalDate] = React.useState(new Date(2026, 3, 1)) // April 2026
  const [selectedDay, setSelectedDay] = React.useState(null)
  const [popupRelance, setPopupRelance] = React.useState(null)

  const overdue = allRelances.filter(r=>r.overdue)
  const todayRel = allRelances.filter(r=>!r.overdue&&r.date===todayStr)
  const upcoming = allRelances.filter(r=>!r.overdue&&r.date!==todayStr)

  const PM = PRIORITY_META
  const viewBtn = (active) => ({ padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', border:`1px solid ${active?C.primaryBorder:C.border}`, background:active?C.primaryLight:C.card, color:active?C.primary:C.muted, transition:'all 0.13s', fontFamily:'inherit' })

  // ── List view row ──
  function Row({ r }) {
    const [reschedule, setReschedule] = React.useState(false)
    return (
      <div style={{ background:C.card, border:`1px solid ${r.overdue?'rgba(220,38,38,0.25)':C.border}`, borderLeft:`3px solid ${r.overdue?C.red:C.amber}`, borderRadius:12, padding:'14px 16px', marginBottom:8, transition:'all 0.13s', boxShadow:'0 1px 3px rgba(99,102,241,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
              <span onClick={()=>{ setDetailId(r.id); setPage('detail') }} style={{ fontSize:13, fontWeight:700, color:C.text, cursor:'pointer' }}>{r.company}</span>
              <PriorityBadge priority={r.priority} />
              <StageBadge stage={r.stage} />
              <span style={{ marginLeft:'auto', fontSize:12, fontWeight:600, color:r.overdue?C.red:C.amber }}>
                {r.overdue?'⚠ En retard · ':'📅 '}{new Date(r.date+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}
              </span>
            </div>
            <div style={{ fontSize:11, color:C.subtle }}>{r.contact}</div>
          </div>
          <div style={{ display:'flex', gap:6, flexShrink:0 }}>
            <button onClick={()=>alert('Marqué contacté!')} style={{ display:'inline-flex', alignItems:'center', gap:5, background:C.greenLight, border:`1px solid rgba(22,163,74,0.2)`, borderRadius:8, padding:'6px 13px', color:C.green, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>✓ Contacté</button>
            <button onClick={()=>setReschedule(!reschedule)} style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#f7f8ff', border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 13px', color:C.muted, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>📅 Reporter</button>
          </div>
        </div>
        {reschedule && (
          <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.border}`, display:'flex', gap:8, alignItems:'center' }}>
            <input type="date" style={{ background:'#f7f8ff', border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 10px', color:C.text, fontSize:12, outline:'none', fontFamily:'inherit' }} />
            <button style={{ background:C.primary, border:'none', borderRadius:8, padding:'6px 14px', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Confirmer</button>
          </div>
        )}
      </div>
    )
  }

  // ── Calendar view ──
  function CalendarView() {
    const year = calDate.getFullYear()
    const month = calDate.getMonth()
    const monthName = calDate.toLocaleDateString('fr-FR', { month:'long', year:'numeric' })
    const firstDay = new Date(year, month, 1).getDay() // 0=Sun
    const daysInMonth = new Date(year, month+1, 0).getDate()
    // Monday-first adjustment
    const startOffset = firstDay === 0 ? 6 : firstDay - 1

    const byDate = {}
    relances.forEach(r => {
      if (!byDate[r.date]) byDate[r.date] = []
      byDate[r.date].push(r)
    })

    const days = []
    for (let i = 0; i < startOffset; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    while (days.length % 7 !== 0) days.push(null)

    const WEEK_DAYS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']
    const todayDate = new Date()

    return (
      <div>
        {/* Calendar header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={()=>setCalDate(new Date(year, month-1, 1))} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${C.border}`, background:C.card, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'inherit' }}>‹</button>
            <span style={{ fontSize:15, fontWeight:800, color:C.text, minWidth:160, textAlign:'center', textTransform:'capitalize' }}>{monthName}</span>
            <button onClick={()=>setCalDate(new Date(year, month+1, 1))} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${C.border}`, background:C.card, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'inherit' }}>›</button>
          </div>
          <button onClick={()=>setCalDate(new Date(2026,3,1))} style={{ padding:'5px 12px', borderRadius:8, border:`1px solid ${C.border}`, background:C.card, cursor:'pointer', fontSize:12, color:C.muted, fontFamily:'inherit' }}>Aujourd'hui</button>
        </div>

        {/* Mini stats */}
        <div style={{ display:'flex', gap:10, marginBottom:16 }}>
          {[
            { label:'Ce mois', val: relances.filter(r=>r.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`)).length, color:C.primary },
            { label:'En retard', val: overdue.length, color:C.red },
            { label:'Cette semaine', val: relances.filter(r=>{ const d=new Date(r.date+'T12:00:00'); const now=new Date(); const weekStart=new Date(now); weekStart.setDate(now.getDate()-now.getDay()+1); const weekEnd=new Date(weekStart); weekEnd.setDate(weekStart.getDate()+6); return d>=weekStart&&d<=weekEnd }).length, color:C.amber },
          ].map(s=>(
            <div key={s.label} style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'10px 14px', textAlign:'center' }}>
              <div style={{ fontSize:20, fontWeight:800, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:11, color:C.subtle, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }}>
          {/* Week day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:`1px solid ${C.border}` }}>
            {WEEK_DAYS.map(d=>(
              <div key={d} style={{ padding:'10px 0', textAlign:'center', fontSize:11, fontWeight:700, color:C.subtle, background:'#f9faff' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} style={{ minHeight:90, borderRight:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, background:'#fafbff' }} />

              const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const dayRelances = byDate[dateStr] || []
              const isToday = todayDate.getFullYear()===year && todayDate.getMonth()===month && todayDate.getDate()===day
              const isPast = new Date(dateStr+'T23:59:59') < new Date() && !isToday
              const isSelected = selectedDay === dateStr
              const isWeekend = (idx % 7) >= 5

              return (
                <div key={day} onClick={()=>setSelectedDay(isSelected?null:dateStr)}
                  style={{ minHeight:90, borderRight:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:'6px 7px', cursor:'pointer', background:isSelected?C.primaryLight:isWeekend?'#fafbff':'white', transition:'background 0.13s', position:'relative' }}
                  onMouseEnter={e=>{ if(!isSelected) e.currentTarget.style.background='#f9faff' }}
                  onMouseLeave={e=>{ if(!isSelected) e.currentTarget.style.background=isWeekend?'#fafbff':'white' }}
                >
                  {/* Day number */}
                  <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:4 }}>
                    <span style={{ width:22, height:22, borderRadius:'50%', background:isToday?C.primary:'transparent', color:isToday?'#fff':isPast?C.subtle:C.text, fontSize:12, fontWeight:isToday?800:500, display:'flex', alignItems:'center', justifyContent:'center' }}>{day}</span>
                  </div>

                  {/* Relance chips */}
                  {dayRelances.slice(0,3).map((r,i) => {
                    const pm = PM[r.priority]
                    return (
                      <div key={r.id} onClick={e=>{ e.stopPropagation(); setPopupRelance(r) }}
                        style={{ fontSize:10, fontWeight:600, color:r.overdue?C.red:pm.color, background:r.overdue?'rgba(220,38,38,0.1)':`${pm.dot}15`, border:`1px solid ${r.overdue?'rgba(220,38,38,0.2)':`${pm.dot}25`}`, borderLeft:`2px solid ${r.overdue?C.red:pm.dot}`, borderRadius:4, padding:'2px 5px', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', cursor:'pointer', transition:'all 0.1s' }}
                        onMouseEnter={e=>e.currentTarget.style.background=r.overdue?'rgba(220,38,38,0.16)':`${pm.dot}25`}
                        onMouseLeave={e=>e.currentTarget.style.background=r.overdue?'rgba(220,38,38,0.1)':`${pm.dot}15`}
                      >
                        {r.company}
                      </div>
                    )
                  })}
                  {dayRelances.length > 3 && (
                    <div style={{ fontSize:10, color:C.primary, fontWeight:600, marginTop:2 }}>+{dayRelances.length-3} de plus</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected day detail panel */}
        {selectedDay && (byDate[selectedDay]||[]).length > 0 && (
          <div style={{ marginTop:14, background:C.card, border:`1px solid ${C.primaryBorder}`, borderRadius:12, padding:'16px 18px', boxShadow:'0 4px 16px rgba(99,102,241,0.08)' }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.primary, marginBottom:12 }}>
              📅 {new Date(selectedDay+'T12:00:00').toLocaleDateString('fr-FR',{ weekday:'long', day:'numeric', month:'long' })} — {(byDate[selectedDay]||[]).length} relance{(byDate[selectedDay]||[]).length>1?'s':''}
            </div>
            {(byDate[selectedDay]||[]).map(r => {
              const pm = PM[r.priority]
              return (
                <div key={r.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:`1px solid ${C.border}`, flexWrap:'wrap' }}>
                  <div style={{ width:3, height:36, borderRadius:2, background:pm.dot, flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text, cursor:'pointer' }} onClick={()=>{ setDetailId(r.id); setPage('detail') }}>{r.company}</div>
                    <div style={{ fontSize:11, color:C.subtle, marginTop:2 }}>{r.contact}</div>
                  </div>
                  <PriorityBadge priority={r.priority} />
                  <StageBadge stage={r.stage} />
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={()=>alert('Marqué contacté!')} style={{ display:'inline-flex', alignItems:'center', gap:4, background:C.greenLight, border:`1px solid rgba(22,163,74,0.2)`, borderRadius:7, padding:'5px 11px', color:C.green, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>✓ Contacté</button>
                    <button onClick={()=>{ setDetailId(r.id); setPage('detail') }} style={{ display:'inline-flex', alignItems:'center', gap:4, background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:7, padding:'5px 11px', color:C.primary, fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Voir fiche →</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Popup quick view */}
        {popupRelance && (
          <div style={{ position:'fixed', inset:0, background:'rgba(30,31,60,0.25)', backdropFilter:'blur(2px)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={()=>setPopupRelance(null)}>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'22px 24px', width:360, boxShadow:'0 16px 48px rgba(99,102,241,0.18)' }} onClick={e=>e.stopPropagation()}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:800, color:C.text }}>{popupRelance.company}</div>
                  <div style={{ fontSize:12, color:C.subtle, marginTop:3 }}>{popupRelance.contact}</div>
                </div>
                <button onClick={()=>setPopupRelance(null)} style={{ background:'none', border:'none', cursor:'pointer', color:C.subtle, fontSize:18, lineHeight:1, padding:0 }}>×</button>
              </div>
              <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
                <PriorityBadge priority={popupRelance.priority} />
                <StageBadge stage={popupRelance.stage} />
              </div>
              <div style={{ background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:9, padding:'10px 14px', fontSize:13, color:C.primary, fontWeight:600, marginBottom:16 }}>
                📅 {new Date(popupRelance.date+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={()=>{ setDetailId(popupRelance.id); setPage('detail'); setPopupRelance(null) }} style={{ flex:1, background:C.gradient, border:'none', borderRadius:9, padding:'9px 0', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Voir la fiche →</button>
                <button onClick={()=>{ alert('Marqué contacté!'); setPopupRelance(null) }} style={{ flex:1, background:C.greenLight, border:`1px solid rgba(22,163,74,0.2)`, borderRadius:9, padding:'9px 0', color:C.green, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✓ Contacté</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: viewMode==='calendar' ? 900 : 720 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800, color:C.text }}>Relances</div>
          <div style={{ fontSize:12, color:C.subtle, marginTop:3 }}>{relances.length} relances planifiées</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button style={viewBtn(viewMode==='list')} onClick={()=>setViewMode('list')}>☰ Liste</button>
          <button style={viewBtn(viewMode==='calendar')} onClick={()=>setViewMode('calendar')}>📅 Calendrier</button>
        </div>
      </div>

      {viewMode === 'list' && (
        <>
          {overdue.length > 0 && <div style={{ marginBottom:20 }}><div style={{ fontSize:12, fontWeight:700, color:C.red, marginBottom:10 }}>🔴 En retard ({overdue.length})</div>{overdue.map(r=><Row key={r.id} r={r}/>)}</div>}
          <div style={{ marginBottom:20 }}><div style={{ fontSize:12, fontWeight:700, color:C.amber, marginBottom:10 }}>🟡 Aujourd'hui ({todayRel.length})</div>{todayRel.length===0&&<div style={{ fontSize:13, color:C.subtle, padding:'12px 0' }}>Aucune relance pour aujourd'hui.</div>}{todayRel.map(r=><Row key={r.id} r={r}/>)}</div>
          {upcoming.length > 0 && <div><div style={{ fontSize:12, fontWeight:700, color:C.muted, marginBottom:10 }}>📆 À venir ({upcoming.length})</div>{upcoming.map(r=><Row key={r.id} r={r}/>)}</div>}
        </>
      )}

      {viewMode === 'calendar' && <CalendarView />}
    </div>
  )
}

// ─── Analytics Page ───────────────────────────────────────────────────────────
function AnalyticsPage() {
  const { analytics, byChannel } = window.CRM
  const maxR = Math.max(...analytics.revenueWon)

  function LineChart({ data, color, max, width=300, height=80 }) {
    const pts = data.map((v,i) => [((i/(data.length-1))*(width-20)+10), (height-8-((v/max)*(height-16)))])
    const line = pts.map(([x,y])=>`${x},${y}`).join(' ')
    const fill = `M ${pts[0][0]},${pts[0][1]} ${pts.slice(1).map(([x,y])=>`L ${x},${y}`).join(' ')} L ${pts[pts.length-1][0]},${height-8} L 10,${height-8} Z`
    return (
      <svg width={width} height={height} style={{ display:'block', overflow:'visible' }}>
        <path d={fill} fill={`${color}12`} />
        <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3.5" fill={color} stroke="#fff" strokeWidth="1.5" />)}
      </svg>
    )
  }

  const card = { background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 20px', boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:20, fontWeight:800, color:C.text }}>Analytics</div>
        <div style={{ fontSize:12, color:C.subtle, marginTop:3 }}>Performance commerciale · Avril 2026</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:14 }}>
        {[
          { label:'Durée moy. cycle', val:`${analytics.avgDealCycle}j`, sub:'de lead à deal', color:C.primary, bg:C.primaryLight },
          { label:'Valeur moy. deal', val:`${(analytics.avgDealValue/1000).toFixed(1)}k €`, sub:'par deal gagné', color:C.green, bg:C.greenLight },
          { label:'Meilleur canal', val:analytics.topChannelWin, sub:'taux de conversion ↑', color:C.amber, bg:C.amberLight },
          { label:'Taux de clôture', val:'55%', sub:'négociation → gagné', color:C.violet, bg:C.violetLight },
        ].map(item=>(
          <div key={item.label} style={{ ...card, borderLeft:`3px solid ${item.color}` }}>
            <div style={{ fontSize:11, color:C.subtle, marginBottom:8 }}>{item.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:item.color, lineHeight:1 }}>{item.val}</div>
            <div style={{ fontSize:11, color:C.subtle, marginTop:5 }}>{item.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
        <div style={card}>
          <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:2 }}>Revenus gagnés</div>
          <div style={{ fontSize:11, color:C.subtle, marginBottom:14 }}>6 derniers mois</div>
          <LineChart data={analytics.revenueWon} color={C.green} max={maxR} width={340} height={90} />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>{analytics.revenueMonths.map(m=><span key={m} style={{ fontSize:10, color:C.subtle }}>{m}</span>)}</div>
        </div>
        <div style={card}>
          <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:2 }}>Taux de conversion</div>
          <div style={{ fontSize:11, color:C.subtle, marginBottom:14 }}>Évolution mensuelle (%)</div>
          <LineChart data={analytics.conversionRates} color={C.primary} max={35} width={340} height={90} />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>{analytics.conversionMonths.map(m=><span key={m} style={{ fontSize:10, color:C.subtle }}>{m}</span>)}</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <div style={card}>
          <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:2 }}>Entonnoir de conversion</div>
          <div style={{ fontSize:11, color:C.subtle, marginBottom:14 }}>Taux de passage entre étapes</div>
          {analytics.stageConversion.map(({ from, to, rate })=>(
            <div key={from} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:9 }}>
              <div style={{ width:150, fontSize:11, color:C.muted, textAlign:'right', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flexShrink:0 }}>{from} → {to}</div>
              <div style={{ flex:1, height:14, background:'#f4f5ff', borderRadius:4, overflow:'hidden' }}>
                <div style={{ width:`${rate}%`, height:'100%', background:rate>=70?`${C.green}30`:rate>=50?`${C.amber}30`:`${C.red}25`, borderRadius:4 }} />
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:rate>=70?C.green:rate>=50?C.amber:C.red, width:30, textAlign:'right' }}>{rate}%</span>
            </div>
          ))}
        </div>
        <div style={card}>
          <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:2 }}>Performance par canal</div>
          <div style={{ fontSize:11, color:C.subtle, marginBottom:14 }}>Prospects par source</div>
          {byChannel.map(ch=>{
            const pct=(ch.count/47)*100
            return (
              <div key={ch.channel} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:12, color:C.text, fontWeight:500 }}>{ch.channel}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:C.muted }}>{ch.count}</span>
                </div>
                <div style={{ height:7, background:'#f4f5ff', borderRadius:4 }}>
                  <div style={{ width:`${pct}%`, height:'100%', background:ch.color, borderRadius:4, transition:'width 0.8s', boxShadow:`0 0 6px ${ch.color}50` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Journal Page ─────────────────────────────────────────────────────────────
function JournalPage({ setPage, setDetailId }) {
  const all = window.CRM.journal || []
  const [search, setSearch] = React.useState('')
  const [filterType, setFilterType] = React.useState('')
  const [filterOutcome, setFilterOutcome] = React.useState('')
  const [expanded, setExpanded] = React.useState(null)
  const [showForm, setShowForm] = React.useState(false)
  const [newEntry, setNewEntry] = React.useState({ prospect:'', type:'Appel', summary:'', outcome:'Positif', next:'' })

  const TYPE_COLOR = { 'Appel':C.green,'LinkedIn':C.primary,'Email':C.blue,'Réunion':C.amber,'Note interne':C.muted,'Devis':C.violet,'Instagram':C.pink,'Téléphone':C.green }
  const OUTCOME_META = {
    'Positif':   { color:C.green,   bg:C.greenLight,   emoji:'✅' },
    'Gagné':     { color:C.green,   bg:C.greenLight,   emoji:'🏆' },
    'En attente':{ color:C.amber,   bg:C.amberLight,   emoji:'⏳' },
    'Négatif':   { color:C.red,     bg:C.redLight,     emoji:'❌' },
    'Tiède':     { color:C.amber,   bg:C.amberLight,   emoji:'🌡' },
    'Froid':     { color:C.muted,   bg:'rgba(107,114,128,0.08)', emoji:'🧊' },
  }

  const filtered = all.filter(e => {
    if (search && !e.prospect.toLowerCase().includes(search.toLowerCase()) && !e.summary.toLowerCase().includes(search.toLowerCase())) return false
    if (filterType && e.type !== filterType) return false
    if (filterOutcome && e.outcome !== filterOutcome) return false
    return true
  })

  // Group by date
  const grouped = filtered.reduce((acc, e) => {
    const key = e.date
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  const inp = { background:'#f7f8ff', border:`1px solid ${C.border}`, borderRadius:9, padding:'7px 12px', color:C.text, fontSize:12, outline:'none', fontFamily:'inherit' }
  const card = { background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }

  return (
    <div style={{ maxWidth:760 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800, color:C.text }}>Journal d'activité</div>
          <div style={{ fontSize:12, color:C.subtle, marginTop:3 }}>{all.length} interactions enregistrées · Toutes les étapes</div>
        </div>
        <button onClick={()=>setShowForm(!showForm)}
          style={{ display:'inline-flex', alignItems:'center', gap:6, background:C.primary, border:'none', borderRadius:9, padding:'9px 18px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:`0 2px 10px ${C.primary}40` }}>
          + Nouvelle entrée
        </button>
      </div>

      {/* New entry form */}
      {showForm && (
        <div style={{ ...card, padding:'18px 20px', marginBottom:16, border:`1px solid ${C.primaryBorder}`, background:'#fafbff' }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:14 }}>📝 Nouvelle entrée de journal</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div>
              <label style={{ fontSize:11, color:C.muted, fontWeight:600, display:'block', marginBottom:5 }}>Prospect</label>
              <select style={{ ...inp, width:'100%', cursor:'pointer' }} value={newEntry.prospect} onChange={e=>setNewEntry(n=>({...n,prospect:e.target.value}))}>
                <option value="">Sélectionner…</option>
                {window.CRM.prospects.map(p=><option key={p.id} value={p.company}>{p.company}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, color:C.muted, fontWeight:600, display:'block', marginBottom:5 }}>Type d'interaction</label>
              <select style={{ ...inp, width:'100%', cursor:'pointer' }} value={newEntry.type} onChange={e=>setNewEntry(n=>({...n,type:e.target.value}))}>
                {['Appel','Email','LinkedIn','Instagram','Réunion','Devis','Note interne','Téléphone'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontSize:11, color:C.muted, fontWeight:600, display:'block', marginBottom:5 }}>Résumé de l'échange</label>
            <textarea rows={3} placeholder="Décrivez ce qui s'est passé, ce qui a été dit, les points clés…" style={{ ...inp, width:'100%', resize:'vertical', lineHeight:1.6, boxSizing:'border-box', padding:'10px 12px' }} value={newEntry.summary} onChange={e=>setNewEntry(n=>({...n,summary:e.target.value}))} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
            <div>
              <label style={{ fontSize:11, color:C.muted, fontWeight:600, display:'block', marginBottom:5 }}>Résultat / Outcome</label>
              <select style={{ ...inp, width:'100%', cursor:'pointer' }} value={newEntry.outcome} onChange={e=>setNewEntry(n=>({...n,outcome:e.target.value}))}>
                {['Positif','En attente','Tiède','Froid','Négatif','Gagné'].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:11, color:C.muted, fontWeight:600, display:'block', marginBottom:5 }}>Prochaine action</label>
              <input style={{ ...inp, width:'100%', boxSizing:'border-box' }} placeholder="ex: Rappeler le 25/04" value={newEntry.next} onChange={e=>setNewEntry(n=>({...n,next:e.target.value}))} />
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>setShowForm(false)} style={{ background:C.primary, border:'none', borderRadius:8, padding:'8px 20px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:`0 2px 8px ${C.primary}35` }}>
              Enregistrer
            </button>
            <button onClick={()=>setShowForm(false)} style={{ background:'#f7f8ff', border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 16px', color:C.muted, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        <input style={{ ...inp, width:240 }} placeholder="🔍  Rechercher dans le journal…" value={search} onChange={e=>setSearch(e.target.value)} />
        <select style={{ ...inp, cursor:'pointer' }} value={filterType} onChange={e=>setFilterType(e.target.value)}>
          <option value="">Tous les types</option>
          {['Appel','Email','LinkedIn','Instagram','Réunion','Devis','Note interne','Téléphone'].map(t=><option key={t}>{t}</option>)}
        </select>
        <select style={{ ...inp, cursor:'pointer' }} value={filterOutcome} onChange={e=>setFilterOutcome(e.target.value)}>
          <option value="">Tous les résultats</option>
          {['Positif','En attente','Tiède','Froid','Négatif','Gagné'].map(o=><option key={o}>{o}</option>)}
        </select>
        <div style={{ marginLeft:'auto', fontSize:12, color:C.subtle, display:'flex', alignItems:'center' }}>{filtered.length} entrée{filtered.length>1?'s':''}</div>
      </div>

      {/* Grouped entries */}
      {Object.entries(grouped).map(([date, entries]) => (
        <div key={date} style={{ marginBottom:20 }}>
          {/* Date header */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.primary, background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:6, padding:'3px 10px' }}>{date}</div>
            <div style={{ flex:1, height:1, background:C.border }} />
            <div style={{ fontSize:11, color:C.subtle }}>{entries.length} interaction{entries.length>1?'s':''}</div>
          </div>

          {/* Entries */}
          <div style={card}>
            {entries.map((e, idx) => {
              const tc = TYPE_COLOR[e.type] || C.muted
              const om = OUTCOME_META[e.outcome] || {}
              const isExpanded = expanded === e.id
              return (
                <div key={e.id} style={{ borderBottom: idx<entries.length-1 ? `1px solid ${C.border}` : 'none' }}>
                  {/* Entry header — always visible */}
                  <div onClick={()=>setExpanded(isExpanded ? null : e.id)}
                    style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px', cursor:'pointer', background:isExpanded?'#f9faff':'transparent', transition:'background 0.13s' }}
                    onMouseEnter={e=>{ if(!isExpanded) e.currentTarget.style.background='#fafbff' }}
                    onMouseLeave={e=>{ if(!isExpanded) e.currentTarget.style.background='transparent' }}
                  >
                    {/* Type icon */}
                    <div style={{ width:36, height:36, borderRadius:10, background:`${tc}12`, border:`1.5px solid ${tc}28`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{e.icon}</div>

                    {/* Prospect + stage */}
                    <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}
                      onClick={ev=>{ ev.stopPropagation(); setDetailId(e.prospectId); setPage('detail') }}>
                      <Avatar initials={e.initials} color={e.color} size={26} />
                      <span style={{ fontSize:13, fontWeight:700, color:C.primary, textDecoration:'underline', textDecorationColor:`${C.primary}40` }}>{e.prospect}</span>
                    </div>

                    {/* Type badge */}
                    <span style={{ fontSize:11, fontWeight:600, color:tc, background:`${tc}12`, border:`1px solid ${tc}25`, borderRadius:5, padding:'2px 8px', flexShrink:0 }}>{e.type}</span>

                    {/* Stage */}
                    <StageBadge stage={e.stage} />

                    {/* Summary preview */}
                    <span style={{ fontSize:12, color:C.muted, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:0 }}>{e.summary}</span>

                    {/* Outcome + time */}
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                      {e.outcome && <span style={{ fontSize:11, fontWeight:700, color:om.color, background:om.bg, borderRadius:5, padding:'2px 8px' }}>{om.emoji} {e.outcome}</span>}
                      <span style={{ fontSize:11, color:C.subtle }}>{e.time}</span>
                      <span style={{ fontSize:12, color:isExpanded?C.primary:C.subtle, transition:'color 0.13s' }}>{isExpanded?'▲':'▼'}</span>
                    </div>
                  </div>

                  {/* Expanded debrief */}
                  {isExpanded && (
                    <div style={{ padding:'0 18px 18px 68px', background:'#f9faff', borderTop:`1px solid ${C.border}` }}>
                      <div style={{ paddingTop:14, display:'flex', flexDirection:'column', gap:12 }}>

                        {/* Full summary */}
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Résumé de l'échange</div>
                          <p style={{ fontSize:13, color:C.text, lineHeight:1.65, margin:0, background:C.card, border:`1px solid ${C.border}`, borderRadius:9, padding:'12px 14px' }}>{e.summary}</p>
                        </div>

                        {/* Next action */}
                        {e.next && (
                          <div>
                            <div style={{ fontSize:10, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Prochaine action</div>
                            <div style={{ fontSize:13, color:C.primary, background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:9, padding:'10px 14px', fontWeight:500 }}>
                              → {e.next}
                            </div>
                          </div>
                        )}

                        {/* Debrief zone */}
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Débrief personnel</div>
                          <textarea rows={2} placeholder="Ajoutez votre analyse, ressentis, points d'attention… (visible uniquement par vous)"
                            style={{ width:'100%', background:C.card, border:`1px solid ${C.border}`, borderRadius:9, padding:'10px 14px', color:C.text, fontSize:12, fontFamily:'inherit', outline:'none', resize:'vertical', lineHeight:1.6, boxSizing:'border-box', borderStyle:'dashed' }}
                          />
                        </div>

                        {/* Actions */}
                        <div style={{ display:'flex', gap:8 }}>
                          <button onClick={()=>{ setDetailId(e.prospectId); setPage('detail') }}
                            style={{ display:'inline-flex', alignItems:'center', gap:5, background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:8, padding:'6px 13px', color:C.primary, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                            Voir la fiche →
                          </button>
                          <button style={{ display:'inline-flex', alignItems:'center', gap:5, background:C.greenLight, border:`1px solid rgba(22,163,74,0.2)`, borderRadius:8, padding:'6px 13px', color:C.green, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                            ✓ Sauvegarder débrief
                          </button>
                          <button style={{ display:'inline-flex', alignItems:'center', gap:5, background:'#f7f8ff', border:`1px solid ${C.border}`, borderRadius:8, padding:'6px 13px', color:C.muted, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                            ✏️ Modifier
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'48px 0', color:C.subtle, fontSize:13 }}>
          <div style={{ fontSize:32, marginBottom:10 }}>📓</div>
          Aucune entrée trouvée pour ces filtres.
        </div>
      )}
    </div>
  )
}

// ─── Settings Page ─────────────────────────────────────────────────────────────
function SettingsPage() {
  const SECTIONS = [
    { id:'account',       label:'Mon compte',         emoji:'👤' },
    { id:'security',      label:'Sécurité',            emoji:'🔒' },
    { id:'notifications', label:'Notifications',       emoji:'🔔' },
    { id:'appearance',    label:'Apparence',           emoji:'🎨' },
    { id:'prospect-card', label:'Fiche prospect',      emoji:'📋' },
    { id:'integrations',  label:'Intégrations',        emoji:'🔗' },
    { id:'billing',       label:'Abonnement & Facturation', emoji:'💳' },
    { id:'team',          label:'Équipe',              emoji:'👥' },
    { id:'data',          label:'Données & RGPD',      emoji:'🛡️' },
  ]

  const [active, setActive] = React.useState('account')
  const [saved, setSaved] = React.useState(false)
  const [toggles, setToggles] = React.useState({ followup:true, interactions:true, services:true, deal:true, social:true })
  const [notifToggles, setNotifToggles] = React.useState({ email_relance:true, email_new:false, push_relance:true, push_won:true, weekly_report:true })
  const [integrations, setIntegrations] = React.useState({ linkedin:false, gmail:true, calendly:false, zapier:false, hubspot:false, slack:false })
  const toggle = (obj, setObj, k) => setObj(prev=>({...prev,[k]:!prev[k]}))

  const card = { background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px 22px', marginBottom:14, boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }
  const inp = { width:'100%', background:'#f7f8ff', border:`1px solid ${C.border}`, borderRadius:9, padding:'9px 13px', color:C.text, fontSize:13, outline:'none', fontFamily:'inherit', boxSizing:'border-box' }
  const label = { fontSize:12, color:C.muted, fontWeight:600, marginBottom:6, display:'block' }
  const sectionTitle = { fontSize:15, fontWeight:800, color:C.text, marginBottom:2 }
  const sectionSub = { fontSize:12, color:C.subtle, marginBottom:18 }
  const toggleBtn = (on) => ({ width:40, height:22, borderRadius:11, background:on?C.primary:'#e4e7f8', border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0, padding:0 })
  const thumb = (on) => ({ width:16, height:16, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left:on?21:3, transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.15)' })
  const saveBtn = { background:C.primary, border:'none', borderRadius:9, padding:'10px 22px', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:`0 2px 10px ${C.primary}40` }
  const COLORS = [C.primary,'#7c3aed','#16a34a','#d97706','#db2777','#2563eb','#dc2626','#0891b2']

  const ToggleRow = ({ label: lbl, desc, on, onToggle }) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:`1px solid ${C.border}` }}>
      <div>
        <div style={{ fontSize:13, color:C.text, fontWeight:500 }}>{lbl}</div>
        {desc && <div style={{ fontSize:11, color:C.subtle, marginTop:2 }}>{desc}</div>}
      </div>
      <button style={toggleBtn(on)} onClick={onToggle}><div style={thumb(on)} /></button>
    </div>
  )

  const IntegrationCard = ({ id, name, desc, icon, connected }) => (
    <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom:`1px solid ${C.border}` }}>
      <div style={{ width:40, height:40, borderRadius:10, background:C.primaryLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{name}</div>
        <div style={{ fontSize:11, color:C.subtle, marginTop:2 }}>{desc}</div>
      </div>
      <button onClick={()=>setIntegrations(i=>({...i,[id]:!i[id]}))}
        style={{ padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', border:`1px solid ${connected?'rgba(220,38,38,0.25)':C.primaryBorder}`, background:connected?C.redLight:C.primaryLight, color:connected?C.red:C.primary, transition:'all 0.13s' }}>
        {connected ? 'Déconnecter' : 'Connecter'}
      </button>
    </div>
  )

  const renderContent = () => {
    switch(active) {
      case 'account': return (
        <div>
          <div style={sectionTitle}>Mon compte</div>
          <div style={sectionSub}>Informations de votre profil et de votre entreprise</div>
          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Avatar</div>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
              <div style={{ width:64, height:64, borderRadius:16, background:`linear-gradient(135deg,${C.primary},${C.violet})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:'#fff' }}>MD</div>
              <div>
                <button style={{ display:'block', background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:8, padding:'7px 14px', color:C.primary, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginBottom:6 }}>Changer la photo</button>
                <div style={{ fontSize:11, color:C.subtle }}>JPG, PNG, GIF · Max 2 Mo</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div><label style={label}>Prénom</label><input style={inp} defaultValue="Marie" /></div>
              <div><label style={label}>Nom</label><input style={inp} defaultValue="Dupont" /></div>
              <div><label style={label}>Email</label><input style={inp} defaultValue="marie@skysocial.fr" /></div>
              <div><label style={label}>Téléphone</label><input style={inp} defaultValue="+33 6 12 34 56 78" /></div>
            </div>
          </div>
          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Entreprise</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div><label style={label}>Nom de la société</label><input style={inp} defaultValue="Sky Social Agency" /></div>
              <div><label style={label}>Site web</label><input style={inp} defaultValue="https://skysocial.fr" /></div>
              <div><label style={label}>Secteur</label>
                <select style={{ ...inp, cursor:'pointer' }}>
                  <option>Marketing & Communication</option><option>Tech</option><option>Conseil</option>
                </select>
              </div>
              <div><label style={label}>Taille</label>
                <select style={{ ...inp, cursor:'pointer' }}>
                  <option>1–9 personnes</option><option>10–49</option><option>50–249</option>
                </select>
              </div>
            </div>
          </div>
          <button style={saveBtn} onClick={()=>{ setSaved(true); setTimeout(()=>setSaved(false),2500) }}>
            {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
          </button>
        </div>
      )

      case 'security': return (
        <div>
          <div style={sectionTitle}>Sécurité</div>
          <div style={sectionSub}>Protégez votre compte et gérez vos accès</div>
          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Mot de passe</div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div><label style={label}>Mot de passe actuel</label><input type="password" style={inp} /></div>
              <div><label style={label}>Nouveau mot de passe</label><input type="password" style={inp} /></div>
              <div><label style={label}>Confirmer le nouveau mot de passe</label><input type="password" style={inp} /></div>
            </div>
            <button style={{ ...saveBtn, marginTop:16 }}>Changer le mot de passe</button>
          </div>
          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Double authentification (2FA)</div>
            <ToggleRow label="Activer la 2FA par email" desc="Un code vous est envoyé à chaque connexion" on={true} onToggle={()=>{}} />
            <ToggleRow label="Application d'authentification (TOTP)" desc="Google Authenticator, Authy…" on={false} onToggle={()=>{}} />
          </div>
          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Sessions actives</div>
            {[['Paris, France','Chrome · macOS','Maintenant'],['Lyon, France','Safari · iPhone','Il y a 2h']].map(([loc,device,time])=>(
              <div key={loc+device} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:time==='Maintenant'?C.green:C.subtle, flexShrink:0 }} />
                <div style={{ flex:1 }}><div style={{ fontSize:13, color:C.text, fontWeight:500 }}>{loc}</div><div style={{ fontSize:11, color:C.subtle }}>{device} · {time}</div></div>
                {time!=='Maintenant' && <button style={{ fontSize:11, color:C.red, background:C.redLight, border:`1px solid rgba(220,38,38,0.2)`, borderRadius:7, padding:'4px 10px', cursor:'pointer', fontFamily:'inherit' }}>Révoquer</button>}
              </div>
            ))}
          </div>
        </div>
      )

      case 'notifications': return (
        <div>
          <div style={sectionTitle}>Notifications</div>
          <div style={sectionSub}>Choisissez comment et quand être notifié</div>
          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Email</div>
            <ToggleRow label="Rappels de relance" desc="Email la veille de chaque relance planifiée" on={notifToggles.email_relance} onToggle={()=>toggle(notifToggles,setNotifToggles,'email_relance')} />
            <ToggleRow label="Nouveau prospect créé" desc="Email de confirmation à chaque ajout" on={notifToggles.email_new} onToggle={()=>toggle(notifToggles,setNotifToggles,'email_new')} />
            <ToggleRow label="Rapport hebdomadaire" desc="Résumé des activités chaque lundi matin" on={notifToggles.weekly_report} onToggle={()=>toggle(notifToggles,setNotifToggles,'weekly_report')} />
          </div>
          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Notifications push</div>
            <ToggleRow label="Relances en retard" desc="Alerte immédiate si une relance est dépassée" on={notifToggles.push_relance} onToggle={()=>toggle(notifToggles,setNotifToggles,'push_relance')} />
            <ToggleRow label="Deal gagné" desc="Félicitations quand un prospect passe à Gagné 🎉" on={notifToggles.push_won} onToggle={()=>toggle(notifToggles,setNotifToggles,'push_won')} />
          </div>
        </div>
      )

      case 'appearance': return (
        <div>
          <div style={sectionTitle}>Apparence</div>
          <div style={sectionSub}>Personnalisez les couleurs et le logo de votre CRM</div>
          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Couleur principale</div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {COLORS.map(c=>(
                <div key={c} style={{ width:38, height:38, borderRadius:10, background:c, cursor:'pointer', border:`2px solid ${c===C.primary?'rgba(0,0,0,0.2)':'transparent'}`, transition:'all 0.15s', boxShadow:c===C.primary?`0 0 0 3px ${c}40`:'' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
                />
              ))}
            </div>
          </div>
          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Logo</div>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:64, height:64, borderRadius:14, border:`2px dashed ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.subtle, fontSize:22 }}>🏢</div>
              <div>
                <button style={{ display:'block', background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:8, padding:'7px 14px', color:C.primary, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginBottom:6 }}>Importer un logo</button>
                <div style={{ fontSize:11, color:C.subtle }}>PNG, SVG · Fond transparent recommandé · Max 1 Mo</div>
              </div>
            </div>
          </div>
          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Thème</div>
            <div style={{ display:'flex', gap:10 }}>
              {[['Clair','☀️'],['Sombre','🌙'],['Système','💻']].map(([t,e])=>(
                <div key={t} onClick={()=>{}} style={{ flex:1, padding:'12px', border:`2px solid ${t==='Clair'?C.primary:C.border}`, borderRadius:10, cursor:'pointer', textAlign:'center', background:t==='Clair'?C.primaryLight:C.card, transition:'all 0.13s' }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{e}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:t==='Clair'?C.primary:C.muted }}>{t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

      case 'prospect-card': return (
        <div>
          <div style={sectionTitle}>Fiche prospect</div>
          <div style={sectionSub}>Affichez ou masquez des sections sur chaque fiche</div>
          <div style={card}>
            {[
              ['followup','Planificateur de relance','Date du prochain contact'],
              ['interactions','Historique des interactions','Journal des appels, emails, RDV…'],
              ['services','Services intéressés','Tags des services sur la fiche'],
              ['deal','Valeur du deal','Montant estimé du contrat'],
              ['social','Liens sociaux','LinkedIn, Instagram, Google Maps'],
            ].map(([k,l,d])=>(
              <ToggleRow key={k} label={l} desc={d} on={toggles[k]} onToggle={()=>toggle(toggles,setToggles,k)} />
            ))}
          </div>
        </div>
      )

      case 'integrations': return (
        <div>
          <div style={sectionTitle}>Intégrations</div>
          <div style={sectionSub}>Connectez vos outils préférés à Sky Social CRM</div>
          <div style={card}>
            {[
              ['gmail','Gmail','Envoi d\'emails directement depuis la fiche prospect','📧'],
              ['linkedin','LinkedIn','Synchronisez vos contacts et messages LinkedIn','💼'],
              ['calendly','Calendly','Créez des liens de RDV depuis chaque fiche','📅'],
              ['slack','Slack','Recevez vos alertes relance sur Slack','💬'],
              ['zapier','Zapier','Automatisez Sky Social CRM avec 5000+ apps','⚡'],
              ['hubspot','HubSpot','Importez vos contacts HubSpot','🟠'],
            ].map(([id,name,desc,icon])=>(
              <IntegrationCard key={id} id={id} name={name} desc={desc} icon={icon} connected={integrations[id]} />
            ))}
          </div>
        </div>
      )

      case 'billing': return (
        <div>
          <div style={sectionTitle}>Abonnement & Facturation</div>
          <div style={sectionSub}>Gérez votre plan et vos factures</div>
          <div style={{ ...card, border:`1px solid ${C.primaryBorder}`, background:C.primaryLight }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:C.primary, marginBottom:4 }}>⚡ Plan Pro</div>
                <div style={{ fontSize:13, color:C.muted }}>Actif jusqu'au 22 mai 2026</div>
                <div style={{ fontSize:12, color:C.subtle, marginTop:4 }}>Prospects illimités · Support prioritaire · Analytics avancés</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:24, fontWeight:800, color:C.primary }}>9€</div>
                <div style={{ fontSize:11, color:C.subtle }}>/ mois</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:14 }}>
              <button style={{ background:C.card, border:`1px solid ${C.primaryBorder}`, borderRadius:8, padding:'7px 14px', color:C.primary, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Changer de plan</button>
              <button style={{ background:C.redLight, border:`1px solid rgba(220,38,38,0.2)`, borderRadius:8, padding:'7px 14px', color:C.red, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Annuler l'abonnement</button>
            </div>
          </div>
          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Historique de facturation</div>
            {[['Avr 2026','Pro mensuel','9,00 €','Payée'],['Mar 2026','Pro mensuel','9,00 €','Payée'],['Fév 2026','Pro mensuel','9,00 €','Payée']].map(([date,desc,amount,status])=>(
              <div key={date} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:C.text, fontWeight:500 }}>{desc}</div>
                  <div style={{ fontSize:11, color:C.subtle }}>{date}</div>
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{amount}</span>
                <span style={{ fontSize:11, color:C.green, background:C.greenLight, borderRadius:5, padding:'2px 8px', fontWeight:600 }}>{status}</span>
                <button style={{ fontSize:11, color:C.muted, background:'#f7f8ff', border:`1px solid ${C.border}`, borderRadius:7, padding:'4px 10px', cursor:'pointer', fontFamily:'inherit' }}>PDF</button>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Moyen de paiement</div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:44, height:30, borderRadius:6, background:'linear-gradient(135deg,#1a56db,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#fff', fontWeight:700 }}>VISA</div>
              <div><div style={{ fontSize:13, color:C.text, fontWeight:500 }}>•••• •••• •••• 4242</div><div style={{ fontSize:11, color:C.subtle }}>Expire 08/28</div></div>
              <button style={{ marginLeft:'auto', fontSize:12, color:C.primary, background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:7, padding:'5px 12px', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>Modifier</button>
            </div>
          </div>
        </div>
      )

      case 'team': return (
        <div>
          <div style={sectionTitle}>Équipe</div>
          <div style={sectionSub}>Invitez des collaborateurs et gérez leurs accès</div>
          <div style={card}>
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
              <input style={{ ...inp, flex:1 }} placeholder="email@exemple.fr" />
              <select style={{ ...inp, width:140, cursor:'pointer' }}><option>Membre</option><option>Admin</option><option>Lecture seule</option></select>
              <button style={{ ...saveBtn, padding:'9px 16px', whiteSpace:'nowrap' }}>Inviter</button>
            </div>
            {[
              { name:'Marie Dupont', email:'marie@skysocial.fr', role:'Admin', initials:'MD', color:C.primary, online:true },
              { name:'Thomas Martin', email:'thomas@skysocial.fr', role:'Membre', initials:'TM', color:C.green, online:false },
            ].map(m=>(
              <div key={m.email} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
                <Avatar initials={m.initials} color={m.color} size={36} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{m.name}</div>
                  <div style={{ fontSize:11, color:C.subtle }}>{m.email}</div>
                </div>
                <span style={{ fontSize:11, color:C.primary, background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:5, padding:'2px 8px', fontWeight:600 }}>{m.role}</span>
                <div style={{ width:7, height:7, borderRadius:'50%', background:m.online?C.green:'#e4e6f4' }} title={m.online?'En ligne':'Hors ligne'} />
              </div>
            ))}
          </div>
        </div>
      )

      case 'data': return (
        <div>
          <div style={sectionTitle}>Données & RGPD</div>
          <div style={sectionSub}>Gérez vos données personnelles et leur conformité</div>
          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Export de données</div>
            <p style={{ fontSize:13, color:C.muted, marginBottom:14 }}>Exportez l'ensemble de vos prospects, interactions et paramètres dans un fichier CSV ou JSON.</p>
            <div style={{ display:'flex', gap:8 }}>
              <button style={{ background:C.primaryLight, border:`1px solid ${C.primaryBorder}`, borderRadius:8, padding:'8px 16px', color:C.primary, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>📥 Export CSV</button>
              <button style={{ background:'#f7f8ff', border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 16px', color:C.muted, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>📥 Export JSON</button>
            </div>
          </div>
          <div style={card}>
            <div style={{ fontSize:11, fontWeight:700, color:C.subtle, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:14 }}>Conformité RGPD</div>
            <ToggleRow label="Consentement des prospects" desc="Enregistrez le consentement de chaque prospect contacté" on={true} onToggle={()=>{}} />
            <ToggleRow label="Suppression automatique" desc="Supprimer les prospects inactifs après 2 ans" on={false} onToggle={()=>{}} />
            <ToggleRow label="Log des accès" desc="Conserver un journal des connexions et modifications" on={true} onToggle={()=>{}} />
          </div>
          <div style={{ ...card, border:`1px solid rgba(220,38,38,0.2)`, background:C.redLight }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.red, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>⚠ Zone de danger</div>
            <p style={{ fontSize:13, color:C.muted, marginBottom:14 }}>La suppression du compte est irréversible. Toutes vos données seront effacées définitivement.</p>
            <button style={{ background:C.redLight, border:`1px solid rgba(220,38,38,0.3)`, borderRadius:8, padding:'8px 16px', color:C.red, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Supprimer mon compte</button>
          </div>
        </div>
      )

      default: return null
    }
  }

  return (
    <div style={{ display:'flex', gap:20, maxWidth:900 }}>
      {/* Settings nav */}
      <div style={{ width:200, flexShrink:0 }}>
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden', boxShadow:'0 1px 4px rgba(99,102,241,0.06)' }}>
          {SECTIONS.map(s=>(
            <div key={s.id} onClick={()=>setActive(s.id)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer', background:active===s.id?C.primaryLight:'transparent', borderLeft:`3px solid ${active===s.id?C.primary:'transparent'}`, transition:'all 0.13s' }}
              onMouseEnter={e=>{ if(active!==s.id){ e.currentTarget.style.background='#f7f8ff' }}}
              onMouseLeave={e=>{ if(active!==s.id){ e.currentTarget.style.background='transparent' }}}
            >
              <span style={{ fontSize:14 }}>{s.emoji}</span>
              <span style={{ fontSize:12, fontWeight:active===s.id?700:500, color:active===s.id?C.primary:C.muted }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Content */}
      <div style={{ flex:1 }}>{renderContent()}</div>
    </div>
  )
}

Object.assign(window, { ProspectDetailPage, RelancesPage, AnalyticsPage, SettingsPage, JournalPage })
