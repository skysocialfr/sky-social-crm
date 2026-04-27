// Admin layout — Sidebar, TopBar, helpers (vanilla JSX scope)

const { useState, useMemo } = React

// ---------- Sidebar ----------
function AdminSidebar({ active, onNavigate }) {
  const items = [
    { key:'dashboard',   label:'Vue d\'ensemble',   icon:'📊', badge:null },
    { key:'orgs',        label:'Organisations',     icon:'🏢', badge:'142' },
    { key:'users',       label:'Utilisateurs',      icon:'👥', badge:'612' },
    { key:'billing',     label:'Facturation',       icon:'💳', badge:null },
    { key:'config',      label:'Configuration',     icon:'⚙️', badge:null },
    { key:'emails',      label:'Emails',            icon:'✉️', badge:null },
    { key:'changelog',   label:'Annonces',          icon:'📣', badge:'1' },
  ]

  const su = window.ADMIN.superAdmin

  return (
    <aside style={adminStyles.sidebar}>
      <div style={adminStyles.brand}>
        <div style={adminStyles.brandMark}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="6" fill="#6366f1"/>
            <path d="M7 14 L11 10 L14 13 L17 9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="17" cy="9" r="1.6" fill="#fff"/>
          </svg>
        </div>
        <div>
          <div style={adminStyles.brandTitle}>Sky Social</div>
          <div style={adminStyles.brandSub}>Console Admin</div>
        </div>
      </div>

      <div style={adminStyles.navSection}>
        <div style={adminStyles.navLabel}>Plateforme</div>
        {items.slice(0,1).map(i => <NavItem key={i.key} item={i} active={active===i.key} onClick={()=>onNavigate(i.key)} />)}
      </div>

      <div style={adminStyles.navSection}>
        <div style={adminStyles.navLabel}>Clients</div>
        {items.slice(1,3).map(i => <NavItem key={i.key} item={i} active={active===i.key} onClick={()=>onNavigate(i.key)} />)}
      </div>

      <div style={adminStyles.navSection}>
        <div style={adminStyles.navLabel}>Revenus</div>
        {items.slice(3,4).map(i => <NavItem key={i.key} item={i} active={active===i.key} onClick={()=>onNavigate(i.key)} />)}
      </div>

      <div style={adminStyles.navSection}>
        <div style={adminStyles.navLabel}>Système</div>
        {items.slice(4).map(i => <NavItem key={i.key} item={i} active={active===i.key} onClick={()=>onNavigate(i.key)} />)}
      </div>

      <div style={{flex:1}} />

      <div style={adminStyles.envCard}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
          <span style={{width:8, height:8, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 0 4px rgba(34,197,94,0.18)'}} />
          <span style={{fontSize:11, fontWeight:700, color:'#1a1c2e', letterSpacing:0.3}}>API · OPÉRATIONNELLE</span>
        </div>
        <div style={{fontSize:11, color:'#6b7280', lineHeight:1.5}}>
          Latence p95 · 142 ms<br/>
          Uptime 30j · 99,98 %
        </div>
      </div>

      <div style={adminStyles.userBlock}>
        <img src={su.avatar} alt="" style={adminStyles.userAv} />
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:13, fontWeight:700, color:'#1a1c2e', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{su.name}</div>
          <div style={{fontSize:11, color:'#6b7280', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{su.email}</div>
        </div>
        <button style={adminStyles.userBtn} title="Retour à l'app">↩</button>
      </div>
    </aside>
  )
}

function NavItem({ item, active, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      style={{
        ...adminStyles.navItem,
        background: active ? 'rgba(99,102,241,0.1)' : (hover ? '#f4f6ff' : 'transparent'),
        color: active ? '#6366f1' : '#1a1c2e',
        fontWeight: active ? 700 : 500,
      }}
    >
      <span style={{fontSize:15, opacity: active ? 1 : 0.85}}>{item.icon}</span>
      <span style={{flex:1, textAlign:'left'}}>{item.label}</span>
      {item.badge && (
        <span style={{
          fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:8,
          background: active ? 'rgba(99,102,241,0.18)' : '#eef0fb',
          color: active ? '#4f52d4' : '#6b7280',
        }}>{item.badge}</span>
      )}
    </button>
  )
}

// ---------- TopBar ----------
function AdminTopBar({ title, subtitle, right }) {
  return (
    <header style={adminStyles.topbar}>
      <div>
        <div style={{fontSize:11, fontWeight:700, color:'#6366f1', letterSpacing:0.8, textTransform:'uppercase', marginBottom:4}}>Admin · Console interne</div>
        <h1 style={{fontSize:24, fontWeight:800, color:'#1a1c2e', margin:0, letterSpacing:-0.4}}>{title}</h1>
        {subtitle && <div style={{fontSize:13, color:'#6b7280', marginTop:4}}>{subtitle}</div>}
      </div>
      <div style={{display:'flex', alignItems:'center', gap:10}}>
        {right}
      </div>
    </header>
  )
}

// ---------- Helpers ----------
function fmtEUR(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1).replace('.0','') + ' M€'
  if (n >= 10000)   return Math.round(n/1000) + ' k€'
  if (n >= 1000)    return (n/1000).toFixed(1).replace('.0','') + ' k€'
  return n.toLocaleString('fr-FR') + ' €'
}
function fmtNum(n) { return n.toLocaleString('fr-FR') }

// Mini-areachart inline SVG
function Sparkline({ data, w=120, h=36, color='#6366f1', fill='rgba(99,102,241,0.13)' }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const step = w / (data.length - 1)
  const pts = data.map((v,i) => [i*step, h - ((v - min) / range) * (h - 4) - 2])
  const path = 'M' + pts.map(p => p.join(',')).join(' L')
  const fillPath = path + ` L${w},${h} L0,${h} Z`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{display:'block'}}>
      <path d={fillPath} fill={fill} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={color} />
    </svg>
  )
}

// Trend pill
function TrendPill({ value, suffix='%', good='up' }) {
  const positive = good==='up' ? value>=0 : value<=0
  const v = Math.abs(value).toFixed(value % 1 === 0 ? 0 : 1)
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:3, padding:'2px 7px', borderRadius:6,
      fontSize:11, fontWeight:700,
      background: positive ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.08)',
      color: positive ? '#16a34a' : '#dc2626',
    }}>
      <span>{value>=0?'↑':'↓'}</span>{v}{suffix}
    </span>
  )
}

// Status badge
function StatusBadge({ status }) {
  const map = {
    'Actif':       { bg:'rgba(22,163,74,0.1)',   color:'#16a34a', dot:'#22c55e' },
    'Trial':       { bg:'rgba(99,102,241,0.1)',  color:'#6366f1', dot:'#6366f1' },
    'Past Due':    { bg:'rgba(217,119,6,0.12)',  color:'#b45309', dot:'#f59e0b' },
    'Suspendu':    { bg:'rgba(220,38,38,0.08)',  color:'#dc2626', dot:'#dc2626' },
    'Payée':       { bg:'rgba(22,163,74,0.1)',   color:'#16a34a', dot:'#22c55e' },
    'En retard':   { bg:'rgba(217,119,6,0.12)',  color:'#b45309', dot:'#f59e0b' },
    'Échouée':     { bg:'rgba(220,38,38,0.08)',  color:'#dc2626', dot:'#dc2626' },
    'Production':  { bg:'rgba(22,163,74,0.1)',   color:'#16a34a', dot:'#22c55e' },
    'Beta':        { bg:'rgba(99,102,241,0.1)',  color:'#6366f1', dot:'#6366f1' },
    'Alpha':       { bg:'rgba(217,119,6,0.12)',  color:'#b45309', dot:'#f59e0b' },
    'Désactivé':   { bg:'#f1f3f9',               color:'#6b7280', dot:'#9ca3af' },
  }
  const s = map[status] || map['Désactivé']
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6, padding:'3px 9px', borderRadius:7,
      fontSize:11, fontWeight:600, background:s.bg, color:s.color,
    }}>
      <span style={{width:6, height:6, borderRadius:'50%', background:s.dot}} />
      {status}
    </span>
  )
}

const adminStyles = {
  sidebar: {
    width: 240, flexShrink: 0, background:'#fff', borderRight:'1px solid #e4e7f8',
    display:'flex', flexDirection:'column', padding:'18px 14px 14px',
    height:'100vh', position:'sticky', top:0, gap:2,
  },
  brand: { display:'flex', alignItems:'center', gap:10, padding:'4px 8px 18px' },
  brandMark: { width:36, height:36, borderRadius:9, background:'#eef0fb', display:'flex', alignItems:'center', justifyContent:'center' },
  brandTitle: { fontSize:14, fontWeight:800, color:'#1a1c2e', letterSpacing:-0.2 },
  brandSub: { fontSize:11, color:'#6b7280', fontWeight:600 },
  navSection: { display:'flex', flexDirection:'column', gap:1, marginBottom:10 },
  navLabel: { fontSize:10, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:0.6, padding:'6px 10px 4px' },
  navItem: {
    display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:9,
    border:'none', cursor:'pointer', fontSize:13, color:'#1a1c2e',
    transition:'background 0.12s, color 0.12s', textAlign:'left', width:'100%',
    fontFamily:'inherit',
  },
  envCard: { background:'#f7f8ff', border:'1px solid #e4e7f8', borderRadius:10, padding:'10px 12px', margin:'4px 4px 8px' },
  userBlock: { display:'flex', alignItems:'center', gap:9, padding:'8px 8px', borderRadius:10, background:'#fff', border:'1px solid #e4e7f8' },
  userAv: { width:32, height:32, borderRadius:'50%', background:'#eef0fb' },
  userBtn: { width:28, height:28, borderRadius:8, border:'1px solid #e4e7f8', background:'#fff', cursor:'pointer', fontSize:13, color:'#6b7280' },
  topbar: {
    display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:24,
    padding:'24px 28px 18px', borderBottom:'1px solid #e4e7f8', background:'#fff',
    position:'sticky', top:0, zIndex:5,
  },
}

Object.assign(window, { AdminSidebar, AdminTopBar, NavItem, Sparkline, TrendPill, StatusBadge, adminStyles, fmtEUR, fmtNum })
