
// ─── Color palette (light vivid theme) ───────────────────────────────────────
const C = {
  bg:       '#f4f6ff',
  card:     '#ffffff',
  border:   '#e4e7f8',
  sidebar:  '#ffffff',
  text:     '#1a1c2e',
  muted:    '#6b7280',
  subtle:   '#9ca3af',
  primary:  '#6366f1',
  primaryHover: '#4f52d4',
  primaryLight: 'rgba(99,102,241,0.08)',
  primaryBorder:'rgba(99,102,241,0.2)',
  green:    '#16a34a',
  greenLight:'rgba(22,163,74,0.08)',
  amber:    '#d97706',
  amberLight:'rgba(217,119,6,0.08)',
  red:      '#dc2626',
  redLight: 'rgba(220,38,38,0.07)',
  blue:     '#2563eb',
  blueLight:'rgba(37,99,235,0.08)',
  pink:     '#db2777',
  pinkLight:'rgba(219,39,119,0.08)',
  violet:   '#7c3aed',
  violetLight:'rgba(124,58,237,0.08)',
}
window.C = C

// ─── Stage / Priority / Channel meta ─────────────────────────────────────────
const STAGE_META = {
  'Identifié':       { color:'#6b7280', bg:'rgba(107,114,128,0.1)' },
  'Premier contact': { color:'#0891b2', bg:'rgba(8,145,178,0.09)' },
  'Réponse reçue':   { color:'#7c3aed', bg:'rgba(124,58,237,0.09)' },
  'RDV fixé':        { color:'#d97706', bg:'rgba(217,119,6,0.09)' },
  'Devis envoyé':    { color:'#ea580c', bg:'rgba(234,88,12,0.09)' },
  'En négociation':  { color:'#6366f1', bg:'rgba(99,102,241,0.1)' },
  'Gagné':           { color:'#16a34a', bg:'rgba(22,163,74,0.1)' },
  'Perdu':           { color:'#dc2626', bg:'rgba(220,38,38,0.1)' },
}
const PRIORITY_META = {
  'Chaud': { color:'#dc2626', bg:'rgba(220,38,38,0.08)', dot:'#ef4444' },
  'Tiède': { color:'#d97706', bg:'rgba(217,119,6,0.08)', dot:'#f59e0b' },
  'Froid': { color:'#6b7280', bg:'rgba(107,114,128,0.08)', dot:'#9ca3af' },
}
const CHANNEL_META = {
  'LinkedIn':           { icon:'IN', color:'#6366f1' },
  'Instagram/DMs':      { icon:'IG', color:'#db2777' },
  'Email froid':        { icon:'✉',  color:'#0891b2' },
  'Téléphone/Physique': { icon:'☎',  color:'#d97706' },
  'Téléphone':          { icon:'☎',  color:'#d97706' },
}

// ─── Shared micro-components ──────────────────────────────────────────────────
function StageBadge({ stage }) {
  const m = STAGE_META[stage] || { color:'#6b7280', bg:'rgba(107,114,128,0.09)' }
  return <span style={{ color:m.color, background:m.bg, padding:'3px 9px', borderRadius:6, fontSize:11, fontWeight:700, whiteSpace:'nowrap' }}>{stage}</span>
}

function PriorityBadge({ priority }) {
  const m = PRIORITY_META[priority] || PRIORITY_META['Froid']
  return (
    <span style={{ color:m.color, background:m.bg, padding:'3px 9px', borderRadius:6, fontSize:11, fontWeight:700, display:'inline-flex', alignItems:'center', gap:4 }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:m.dot, display:'inline-block', flexShrink:0 }} />{priority}
    </span>
  )
}

function ChannelBadge({ channel, label=false }) {
  const m = CHANNEL_META[channel] || { icon:'?', color:'#6b7280' }
  return (
    <span style={{ color:m.color, display:'inline-flex', alignItems:'center', gap:5, fontSize:12, fontWeight:500 }}>
      <span style={{ fontSize:9, fontWeight:800, background:`${m.color}15`, border:`1px solid ${m.color}30`, borderRadius:4, padding:'1px 4px' }}>{m.icon}</span>
      {label && channel}
    </span>
  )
}

function Avatar({ initials, color, size=32 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:8, background:`${color}18`, border:`1.5px solid ${color}35`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <span style={{ fontSize:size*0.33, fontWeight:800, color }}>{initials}</span>
    </div>
  )
}

function ScoreBar({ score }) {
  const color = score >= 75 ? C.green : score >= 50 ? C.amber : C.red
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
      <div style={{ flex:1, height:4, borderRadius:2, background:'#f0f1f8' }}>
        <div style={{ width:`${score}%`, height:'100%', borderRadius:2, background:color, transition:'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize:11, fontWeight:700, color, minWidth:22, textAlign:'right' }}>{score}</span>
    </div>
  )
}

function Sparkline({ data, color=C.primary, width=64, height=24 }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1
  const pts = data.map((v,i) => `${(i/(data.length-1))*(width-4)+2},${height-2-((v-min)/range)*(height-4)}`).join(' ')
  return (
    <svg width={width} height={height} style={{ display:'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

function TrendChip({ value }) {
  const up = value >= 0
  return (
    <span style={{ fontSize:11, fontWeight:700, color:up?C.green:C.red, background:up?C.greenLight:C.redLight, borderRadius:5, padding:'2px 7px', display:'inline-flex', alignItems:'center', gap:2 }}>
      {up ? '↑' : '↓'} {Math.abs(value)}{String(value).includes('.')?'%':''}
    </span>
  )
}

function Divider() { return <div style={{ height:1, background:C.border }} /> }

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, overdue }) {
  const NAV = [
    { id:'dashboard', label:'Tableau de bord', emoji:'◉' },
    { id:'prospects',  label:'Prospects',       emoji:'👥' },
    { id:'relances',   label:'Relances',         emoji:'🔔', badge:overdue },
    { id:'journal',    label:'Journal',           emoji:'📓' },
    { id:'analytics',  label:'Analytics',        emoji:'📊', isNew:true },
    { id:'settings',   label:'Paramètres',       emoji:'⚙️' },
  ]
  const { user } = window.CRM
  const S = {
    wrap: { width:220, background:C.sidebar, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', height:'100vh', flexShrink:0 },
    logo: { padding:'18px 16px 14px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:10 },
    mark: { width:34, height:34, borderRadius:10, background:`linear-gradient(135deg,${C.primary},${C.violet})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 4px 12px ${C.primary}40` },
    logoName: { fontSize:13, fontWeight:800, color:C.text },
    logoSub: { fontSize:10, color:C.subtle, marginTop:1 },
    nav: { flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:1 },
    item: (active) => ({
      display:'flex', alignItems:'center', gap:9, padding:'8px 10px', borderRadius:9, cursor:'pointer',
      background: active ? C.primaryLight : 'transparent',
      color: active ? C.primary : C.muted,
      fontSize:13, fontWeight: active ? 700 : 500,
      border: active ? `1px solid ${C.primaryBorder}` : '1px solid transparent',
      transition:'all 0.13s',
    }),
    badge: { background:C.red, color:'#fff', fontSize:10, fontWeight:700, borderRadius:10, padding:'1px 6px', marginLeft:'auto', lineHeight:1.4 },
    newTag: { background:C.primaryLight, color:C.primary, fontSize:9, fontWeight:800, borderRadius:4, padding:'2px 6px', marginLeft:'auto', letterSpacing:'0.06em', border:`1px solid ${C.primaryBorder}` },
    footer: { padding:'12px 16px', borderTop:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:10 },
    av: { width:32, height:32, borderRadius:9, background:`linear-gradient(135deg,${C.primary},${C.violet})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#fff', flexShrink:0 },
  }
  return (
    <div style={S.wrap}>
      <div style={S.logo}>
        <div style={S.mark}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <div>
          <div style={S.logoName}>{user.company}</div>
          <div style={S.logoSub}>CRM Prospection</div>
        </div>
      </div>
      <nav style={S.nav}>
        {NAV.map(({ id, label, emoji, badge, isNew }) => (
          <div key={id} style={S.item(page===id)} onClick={() => setPage(id)}
            onMouseEnter={e=>{ if(page!==id){ e.currentTarget.style.background='rgba(99,102,241,0.05)'; e.currentTarget.style.color='#374151' }}}
            onMouseLeave={e=>{ if(page!==id){ e.currentTarget.style.background='transparent'; e.currentTarget.style.color=C.muted }}}
          >
            <span style={{ fontSize:14 }}>{emoji}</span>
            <span style={{ flex:1 }}>{label}</span>
            {badge > 0 && <span style={S.badge}>{badge}</span>}
            {isNew && !badge && <span style={S.newTag}>NEW</span>}
          </div>
        ))}
      </nav>
      <div style={S.footer}>
        <div style={S.av}>{user.initials}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
          <div style={{ fontSize:10, color:C.subtle, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
        </div>
        <div style={{ width:7, height:7, borderRadius:'50%', background:C.green, flexShrink:0 }} />
      </div>
    </div>
  )
}

// ─── TopBar ───────────────────────────────────────────────────────────────────
function TopBar({ page, setPage, setSearchOpen }) {
  const LABELS = { dashboard:'Tableau de bord', prospects:'Prospects', relances:'Relances', analytics:'Analytics', settings:'Paramètres', detail:'Fiche prospect' }
  const S = {
    bar: { height:52, borderBottom:`1px solid ${C.border}`, background:C.card, display:'flex', alignItems:'center', padding:'0 20px', gap:10, flexShrink:0 },
    breadcrumb: { fontSize:12, color:C.subtle },
    crumb: { fontSize:13, fontWeight:700, color:C.text },
    searchBtn: { display:'flex', alignItems:'center', gap:8, background:'#f7f8ff', border:`1px solid ${C.border}`, borderRadius:9, padding:'6px 14px', cursor:'pointer', color:C.subtle, fontSize:12, transition:'all 0.13s' },
    kbd: { background:C.border, borderRadius:4, padding:'1px 5px', fontSize:10, color:C.muted, fontFamily:'monospace' },
    iconBtn: { width:34, height:34, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:C.muted, transition:'all 0.13s', border:`1px solid transparent`, position:'relative' },
    notifDot: { position:'absolute', top:7, right:7, width:6, height:6, borderRadius:'50%', background:C.red, border:'1.5px solid #fff' },
  }
  return (
    <div style={S.bar}>
      <span style={S.breadcrumb}>Sky Social &rsaquo;</span>
      <span style={S.crumb}>{LABELS[page] || page}</span>
      <div style={{ ...S.searchBtn, marginLeft:'auto' }} onClick={()=>setSearchOpen(true)}
        onMouseEnter={e=>{ e.currentTarget.style.background='#eef0ff'; e.currentTarget.style.color=C.muted }}
        onMouseLeave={e=>{ e.currentTarget.style.background='#f7f8ff'; e.currentTarget.style.color=C.subtle }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        Rechercher…
        <span style={S.kbd}>⌘K</span>
      </div>
      <div style={S.iconBtn} onClick={()=>setPage('relances')}
        onMouseEnter={e=>{ e.currentTarget.style.background='#f7f8ff'; e.currentTarget.style.borderColor=C.border }}
        onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span style={S.notifDot} />
      </div>
    </div>
  )
}

// ─── Global Search Modal ──────────────────────────────────────────────────────
function SearchModal({ open, onClose, setPage, setDetailId }) {
  const [q, setQ] = React.useState('')
  React.useEffect(() => {
    if (!open) { setQ(''); return }
    const h = (e) => { if(e.key==='Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open])
  if (!open) return null
  const results = q.length > 1 ? window.CRM.prospects.filter(p =>
    p.company.toLowerCase().includes(q.toLowerCase()) ||
    p.contact.toLowerCase().includes(q.toLowerCase()) ||
    (p.sector||'').toLowerCase().includes(q.toLowerCase())
  ) : []
  const S = {
    overlay: { position:'fixed', inset:0, background:'rgba(30,31,60,0.35)', backdropFilter:'blur(3px)', zIndex:1000, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:80 },
    modal: { width:560, background:C.card, borderRadius:16, overflow:'hidden', boxShadow:'0 24px 64px rgba(99,102,241,0.18), 0 4px 24px rgba(0,0,0,0.08)', border:`1px solid ${C.border}` },
    inputWrap: { display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom:`1px solid ${C.border}` },
    input: { flex:1, background:'transparent', border:'none', outline:'none', color:C.text, fontSize:15, fontFamily:'inherit', '::placeholder':{ color:C.subtle } },
    item: { display:'flex', alignItems:'center', gap:12, padding:'10px 16px', cursor:'pointer', transition:'background 0.1s' },
    hint: { padding:'10px 16px', borderTop:`1px solid ${C.border}`, display:'flex', gap:16, fontSize:11, color:C.subtle },
  }
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e=>e.stopPropagation()}>
        <div style={S.inputWrap}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.subtle} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input autoFocus style={S.input} placeholder="Rechercher un prospect, une société…" value={q} onChange={e=>setQ(e.target.value)} />
          <span style={{ fontSize:11, color:C.subtle, background:'#f4f5ff', borderRadius:5, padding:'2px 8px', fontFamily:'monospace' }}>ESC</span>
        </div>
        {q.length < 2 && <div style={{ padding:'28px 0', textAlign:'center', color:C.subtle, fontSize:13 }}>Commencez à taper pour rechercher…</div>}
        {q.length >= 2 && results.length === 0 && <div style={{ padding:'28px 0', textAlign:'center', color:C.subtle, fontSize:13 }}>Aucun résultat pour « {q} »</div>}
        {results.map(p => (
          <div key={p.id} style={S.item}
            onMouseEnter={e=>e.currentTarget.style.background='#f7f8ff'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            onClick={()=>{ setDetailId(p.id); setPage('detail'); onClose() }}
          >
            <Avatar initials={p.initials} color={p.color} size={32} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{p.company}</div>
              <div style={{ fontSize:11, color:C.muted }}>{p.contact} · {p.sector}</div>
            </div>
            <StageBadge stage={p.stage} />
          </div>
        ))}
        <div style={S.hint}>
          <span>↵ Ouvrir</span><span>↑↓ Naviguer</span><span>ESC Fermer</span>
        </div>
      </div>
    </div>
  )
}

Object.assign(window, { C, StageBadge, PriorityBadge, ChannelBadge, Avatar, ScoreBar, Sparkline, TrendChip, Divider, Sidebar, TopBar, SearchModal, STAGE_META, PRIORITY_META, CHANNEL_META })
