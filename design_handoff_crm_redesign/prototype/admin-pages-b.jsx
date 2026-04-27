// Admin pages B — Configuration, Emails, Changelog
const { useState: useStateB } = React

// ==================== CONFIG (Plans + Feature flags) ====================
function AdminConfig() {
  const [tab, setTab] = useStateB('plans')
  return (
    <div style={pageStyles.scroll}>
      <AdminTopBar
        title="Configuration plateforme"
        subtitle="Plans, prix, feature flags et paramètres globaux"
      />
      <div style={pageStyles.body}>
        <div style={{display:'inline-flex', background:'#fff', border:'1px solid #e4e7f8', borderRadius:10, padding:3, marginBottom:14}}>
          {[
            {k:'plans', l:'Plans & tarifs'},
            {k:'flags', l:'Feature flags'},
            {k:'general', l:'Paramètres généraux'},
          ].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} style={{
              padding:'8px 14px', fontSize:13, fontWeight:600, border:'none',
              background: tab===t.k ? '#6366f1' : 'transparent',
              color: tab===t.k ? '#fff' : '#6b7280',
              borderRadius:8, cursor:'pointer', fontFamily:'inherit',
            }}>{t.l}</button>
          ))}
        </div>

        {tab==='plans' && <PlansConfig/>}
        {tab==='flags' && <FlagsConfig/>}
        {tab==='general' && <GeneralConfig/>}
      </div>
    </div>
  )
}

function PlansConfig() {
  const plans = window.ADMIN.plans
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
        <div style={{fontSize:13, color:'#6b7280'}}>4 plans configurés · {plans.reduce((s,p)=>s+p.subscribers,0)} abonnés payants</div>
        <button style={btn.primary}>+ Nouveau plan</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}}>
        {plans.map(p => (
          <div key={p.id} style={{
            background:'#fff', border:`1px solid ${p.color}30`, borderRadius:14, padding:18,
            boxShadow:'0 1px 4px rgba(99,102,241,0.06)',
            display:'flex', flexDirection:'column', gap:10,
          }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
              <div>
                <div style={{fontSize:15, fontWeight:800, color:'#1a1c2e'}}>{p.name}</div>
                <div style={{fontSize:11, color:'#6b7280', marginTop:2}}>{p.public ? '🌐 Public' : '🔒 Sur demande'}</div>
              </div>
              <span style={{width:10, height:10, borderRadius:'50%', background: p.active ? p.color : '#9ca3af'}}/>
            </div>
            <div>
              <div style={{display:'flex', alignItems:'baseline', gap:4}}>
                <span style={{fontSize:32, fontWeight:800, color:'#1a1c2e', letterSpacing:-0.6}}>{p.monthly}</span>
                <span style={{fontSize:13, color:'#6b7280', fontWeight:600}}>€/mois</span>
              </div>
              <div style={{fontSize:11, color:'#6b7280'}}>{p.yearly} €/an · économisez 16%</div>
            </div>
            <div style={{padding:'10px 12px', background:'#f7f8ff', borderRadius:9, display:'flex', justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:10, color:'#6b7280', fontWeight:700, letterSpacing:0.4, textTransform:'uppercase'}}>Abonnés</div>
                <div style={{fontSize:18, fontWeight:800, color:'#1a1c2e', marginTop:2}}>{p.subscribers}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:10, color:'#6b7280', fontWeight:700, letterSpacing:0.4, textTransform:'uppercase'}}>MRR</div>
                <div style={{fontSize:18, fontWeight:800, color:p.color, marginTop:2}}>{(p.subscribers*p.monthly).toLocaleString('fr-FR')}€</div>
              </div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:6, fontSize:12, color:'#1a1c2e', marginTop:4}}>
              {p.features.map((f,i)=>(
                <div key={i} style={{display:'flex', alignItems:'center', gap:7}}>
                  <span style={{color:p.color, fontWeight:700}}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex', gap:6, marginTop:'auto', paddingTop:8}}>
              <button style={{...btn.outline, flex:1, padding:'7px 10px', fontSize:12}}>Modifier</button>
              <button style={{...btn.outline, padding:'7px 10px', fontSize:12, color:'#dc2626', borderColor:'rgba(220,38,38,0.2)'}}>Désactiver</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FlagsConfig() {
  const flags = window.ADMIN.featureFlags
  return (
    <Card padding={0}>
      <div style={{padding:'14px 18px', borderBottom:'1px solid #f0f2fa', display:'flex', justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:14, fontWeight:700, color:'#1a1c2e'}}>Feature flags</div>
          <div style={{fontSize:11, color:'#6b7280', marginTop:2}}>Activez progressivement les nouvelles fonctionnalités par plan</div>
        </div>
        <button style={btn.primary}>+ Nouveau flag</button>
      </div>
      <table style={tbl.table}>
        <thead>
          <tr>
            <th style={tbl.th}>Clé</th>
            <th style={tbl.th}>Description</th>
            <th style={tbl.th}>Statut</th>
            <th style={tbl.th}>Plans</th>
            <th style={tbl.th}>Rollout</th>
            <th style={{...tbl.th, width:120}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flags.map(f => (
            <tr key={f.key} style={tbl.tr}>
              <td style={tbl.td}><code style={{fontSize:12, fontFamily:'JetBrains Mono, monospace', background:'#f4f6ff', padding:'2px 7px', borderRadius:5, color:'#4f52d4'}}>{f.key}</code></td>
              <td style={tbl.td}><span style={{fontSize:13, color:'#1a1c2e'}}>{f.label}</span></td>
              <td style={tbl.td}><StatusBadge status={f.status}/></td>
              <td style={tbl.td}>
                <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
                  {f.plans.map(p => <PlanBadge key={p} plan={p}/>)}
                </div>
              </td>
              <td style={tbl.td}>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <div style={{width:80, height:5, background:'#f0f2fa', borderRadius:3, overflow:'hidden'}}>
                    <div style={{width:f.rollout, height:'100%', background: f.rollout==='100%' ? '#16a34a' : '#6366f1'}}/>
                  </div>
                  <span style={{fontSize:12, fontWeight:700, color:'#1a1c2e'}}>{f.rollout}</span>
                </div>
              </td>
              <td style={tbl.td}>
                <div style={{display:'flex', gap:6}}>
                  <button style={tbl.smallBtn}>Modifier</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

function GeneralConfig() {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14}}>
      <Card>
        <CardHeader title="Inscription" subtitle="Configuration des nouveaux comptes"/>
        <ConfigRow label="Inscription publique" value={true} type="toggle" desc="Permettre aux nouveaux utilisateurs de créer un compte"/>
        <ConfigRow label="Vérification email obligatoire" value={true} type="toggle" desc="L'utilisateur doit vérifier son email avant de pouvoir se connecter"/>
        <ConfigRow label="Plan par défaut" value="Pro (essai 14j)" type="select" desc="Plan attribué à l'inscription"/>
        <ConfigRow label="Durée d'essai gratuit" value="14 jours" type="select"/>
        <ConfigRow label="Domaines autorisés" value="Tous" type="text" desc="Restriction par domaine email (ex: @entreprise.com)"/>
      </Card>
      <Card>
        <CardHeader title="Sécurité" subtitle="Politiques globales"/>
        <ConfigRow label="2FA obligatoire (Owners)" value={false} type="toggle"/>
        <ConfigRow label="Force du mot de passe" value="Élevée (8+ car., maj+min+chiffre)" type="select"/>
        <ConfigRow label="Durée session" value="30 jours" type="select"/>
        <ConfigRow label="Rate limiting API" value="1000 req/min" type="text"/>
        <ConfigRow label="Logs d'audit" value={true} type="toggle" desc="Tracer toutes les actions admin sensibles"/>
      </Card>
      <Card>
        <CardHeader title="Limites & quotas" subtitle="Limites globales applicables à tous les plans"/>
        <ConfigRow label="Taille max import CSV" value="50 MB" type="text"/>
        <ConfigRow label="Pièces jointes max" value="25 MB" type="text"/>
        <ConfigRow label="Webhooks par org" value="20" type="text"/>
        <ConfigRow label="Rétention logs" value="90 jours" type="select"/>
      </Card>
      <Card>
        <CardHeader title="Maintenance" subtitle="Mode maintenance et bannières"/>
        <ConfigRow label="Mode maintenance" value={false} type="toggle" desc="Bloque l'accès à l'app et affiche une page de maintenance"/>
        <ConfigRow label="Bannière globale" value="Désactivée" type="select"/>
        <ConfigRow label="Inscription gelée" value={false} type="toggle"/>
        <div style={{padding:'12px', background:'rgba(220,38,38,0.05)', border:'1px solid rgba(220,38,38,0.15)', borderRadius:9, marginTop:10}}>
          <div style={{fontSize:12, fontWeight:700, color:'#dc2626', marginBottom:4}}>⚠️ Zone dangereuse</div>
          <div style={{fontSize:11, color:'#6b7280', lineHeight:1.5}}>Activer le mode maintenance déconnecte tous les utilisateurs et bloque toute requête API non-admin.</div>
        </div>
      </Card>
    </div>
  )
}

function ConfigRow({ label, value, type, desc }) {
  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, padding:'11px 0', borderTop:'1px solid #f0f2fa'}}>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:13, fontWeight:600, color:'#1a1c2e'}}>{label}</div>
        {desc && <div style={{fontSize:11, color:'#6b7280', marginTop:2}}>{desc}</div>}
      </div>
      <div>
        {type==='toggle' && <Toggle value={value}/>}
        {type==='select' && <span style={{fontSize:13, fontWeight:600, color:'#1a1c2e', padding:'7px 11px', background:'#f7f8ff', borderRadius:8, border:'1px solid #e4e7f8'}}>{value} ▾</span>}
        {type==='text'   && <span style={{fontSize:13, fontWeight:600, color:'#1a1c2e', padding:'7px 11px', background:'#f7f8ff', borderRadius:8, border:'1px solid #e4e7f8'}}>{value}</span>}
      </div>
    </div>
  )
}

function Toggle({ value }) {
  return (
    <div style={{
      width:38, height:22, borderRadius:11, padding:2, cursor:'pointer',
      background: value ? '#6366f1' : '#d4d8ec', transition:'background 0.2s',
    }}>
      <div style={{
        width:18, height:18, borderRadius:'50%', background:'#fff',
        transform: value ? 'translateX(16px)' : 'translateX(0)', transition:'transform 0.2s',
        boxShadow:'0 1px 3px rgba(0,0,0,0.15)',
      }}/>
    </div>
  )
}

// ==================== EMAILS ====================
function AdminEmails() {
  const tpls = window.ADMIN.emailTemplates
  const [selected, setSelected] = useStateB(tpls[0].key)
  const sel = tpls.find(t => t.key === selected)

  return (
    <div style={pageStyles.scroll}>
      <AdminTopBar
        title="Emails transactionnels"
        subtitle="Templates et statistiques d'envoi"
        right={<button style={btn.primary}>+ Nouveau template</button>}
      />
      <div style={{...pageStyles.body, display:'grid', gridTemplateColumns:'380px 1fr', gap:14}}>
        {/* Liste templates */}
        <Card padding={0}>
          <div style={{padding:'14px 16px', borderBottom:'1px solid #f0f2fa'}}>
            <div style={{fontSize:13, fontWeight:700, color:'#1a1c2e'}}>Templates ({tpls.length})</div>
            <div style={{fontSize:11, color:'#6b7280', marginTop:2}}>{tpls.reduce((s,t)=>s+t.sentMonth,0).toLocaleString('fr-FR')} envoyés ce mois</div>
          </div>
          <div style={{display:'flex', flexDirection:'column'}}>
            {tpls.map(t => (
              <button key={t.key} onClick={()=>setSelected(t.key)} style={{
                display:'flex', alignItems:'flex-start', gap:10, padding:'12px 16px',
                border:'none', background: selected===t.key ? '#f4f6ff' : '#fff',
                borderLeft: selected===t.key ? '3px solid #6366f1' : '3px solid transparent',
                borderBottom:'1px solid #f0f2fa',
                textAlign:'left', cursor:'pointer', fontFamily:'inherit',
              }}>
                <div style={{
                  width:32, height:32, borderRadius:8, background: selected===t.key ? '#6366f1' : '#eef0fb',
                  color: selected===t.key ? '#fff' : '#6366f1',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0,
                }}>✉</div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:700, color:'#1a1c2e'}}>{t.name}</div>
                  <div style={{fontSize:11, color:'#6b7280', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{t.subject}</div>
                  <div style={{display:'flex', gap:10, marginTop:6, fontSize:11}}>
                    <span style={{color:'#6b7280'}}>📤 {t.sentMonth}</span>
                    <span style={{color: t.openRate>70 ? '#16a34a' : '#b45309', fontWeight:700}}>👁 {t.openRate}%</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Détail / preview */}
        <Card>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14}}>
            <div>
              <div style={{fontSize:11, fontWeight:700, color:'#6366f1', letterSpacing:0.6, textTransform:'uppercase'}}>Template · {sel.key}</div>
              <div style={{fontSize:18, fontWeight:800, color:'#1a1c2e', marginTop:4}}>{sel.name}</div>
              <div style={{fontSize:12, color:'#6b7280', marginTop:2}}>Modifié le {sel.lastEdit}</div>
            </div>
            <div style={{display:'flex', gap:8}}>
              <button style={btn.outline}>Tester</button>
              <button style={btn.primary}>Modifier</button>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, marginBottom:18}}>
            <MiniStat label="Envoyés (30j)" value={sel.sentMonth.toLocaleString('fr-FR')}/>
            <MiniStat label="Taux d'ouverture" value={`${sel.openRate}%`} good={sel.openRate>70}/>
            <MiniStat label="Plaintes" value="0,02%" good/>
          </div>

          {/* Preview */}
          <div style={{fontSize:12, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:0.6, marginBottom:10}}>Aperçu</div>
          <div style={{background:'#f4f6ff', padding:18, borderRadius:12, border:'1px solid #e4e7f8'}}>
            <div style={{background:'#fff', borderRadius:10, padding:24, boxShadow:'0 2px 12px rgba(99,102,241,0.08)', maxWidth:520, margin:'0 auto'}}>
              <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:18, paddingBottom:14, borderBottom:'1px solid #f0f2fa'}}>
                <div style={{width:32, height:32, borderRadius:8, background:'#6366f1', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:14}}>S</div>
                <div style={{fontSize:14, fontWeight:800, color:'#1a1c2e'}}>Sky Social CRM</div>
              </div>
              <div style={{fontSize:11, color:'#9ca3af', marginBottom:6}}>De : noreply@skysocial.app</div>
              <div style={{fontSize:11, color:'#9ca3af', marginBottom:14}}>À : sophie@bento-co.fr</div>
              <div style={{fontSize:18, fontWeight:800, color:'#1a1c2e', marginBottom:14}}>{sel.subject.replace('{{number}}','2026-04-1142').replace('{{inviter}}','Romain').replace('{{org}}','Atelier Digital').replace('{{month}}','avril 2026')}</div>
              <div style={{fontSize:13, color:'#1a1c2e', lineHeight:1.7}}>
                Bonjour Sophie,<br/><br/>
                {emailBodyFor(sel.key)}
                <br/><br/>
                <span style={{display:'inline-block', padding:'10px 20px', background:'#6366f1', color:'#fff', borderRadius:8, fontSize:13, fontWeight:700}}>Action principale →</span>
                <br/><br/>
                <span style={{color:'#6b7280', fontSize:12}}>L'équipe Sky Social CRM</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function emailBodyFor(key) {
  const m = {
    welcome: 'Bienvenue sur Sky Social CRM ! Nous sommes ravis de vous compter parmi nous. Pour bien démarrer, nous vous avons préparé un guide rapide pour configurer vos premiers prospects.',
    trial_ending: 'Plus que 3 jours pour profiter pleinement de votre essai Pro. Sécurisez votre compte dès maintenant pour ne pas perdre vos données.',
    trial_expired: 'Votre période d\'essai gratuite est désormais terminée. Pour continuer à utiliser Sky Social CRM, choisissez le plan qui vous convient.',
    invoice_paid: 'Votre paiement a bien été reçu. Vous trouverez votre facture en pièce jointe et dans votre espace de facturation.',
    invoice_failed: 'Nous n\'avons pas pu prélever votre dernière facture. Merci de mettre à jour vos informations bancaires sous 48 h.',
    password_reset: 'Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en créer un nouveau (lien valable 1 h).',
    invitation: 'Romain Beaufort vous invite à rejoindre Atelier Digital sur Sky Social CRM. Acceptez l\'invitation pour collaborer avec votre équipe.',
    monthly_summary: 'Voici votre résumé du mois : 47 prospects ajoutés, 12 deals gagnés, 31 200 € de revenus. Bravo pour cette belle performance !',
  }
  return m[key] || 'Contenu du template…'
}

function MiniStat({ label, value, good }) {
  return (
    <div style={{padding:'12px 14px', background:'#f7f8ff', borderRadius:10, border:'1px solid #e4e7f8'}}>
      <div style={{fontSize:10, color:'#6b7280', fontWeight:700, letterSpacing:0.4, textTransform:'uppercase'}}>{label}</div>
      <div style={{fontSize:20, fontWeight:800, color: good ? '#16a34a' : '#1a1c2e', marginTop:4, letterSpacing:-0.4}}>{value}</div>
    </div>
  )
}

// ==================== CHANGELOG ====================
function AdminChangelog() {
  const items = window.ADMIN.changelog
  return (
    <div style={pageStyles.scroll}>
      <AdminTopBar
        title="Annonces & changelog"
        subtitle="Communiquez les nouveautés à vos utilisateurs"
        right={<button style={btn.primary}>+ Nouvelle annonce</button>}
      />
      <div style={{...pageStyles.body, maxWidth:920}}>
        <div style={{display:'flex', gap:10, marginBottom:18}}>
          <Select value="Toutes" onChange={()=>{}} options={['Toutes','Nouveau','Amélioration','Correctif','À venir']} label="Type"/>
          <Select value="Toutes" onChange={()=>{}} options={['Toutes','Publiées','Brouillons']} label="Statut"/>
        </div>

        <div style={{position:'relative', paddingLeft:32}}>
          <div style={{position:'absolute', left:11, top:8, bottom:8, width:2, background:'linear-gradient(180deg, #6366f1 0%, #e4e7f8 100%)'}}/>

          {items.map(item => {
            const tagColor = item.tag==='Nouveau'      ? '#6366f1'
                            : item.tag==='Amélioration' ? '#22c55e'
                            : item.tag==='Correctif'    ? '#f59e0b'
                            :                             '#9ca3af'
            return (
              <div key={item.id} style={{position:'relative', marginBottom:18}}>
                <div style={{
                  position:'absolute', left:-30, top:6, width:24, height:24, borderRadius:'50%',
                  background:'#fff', border:`3px solid ${tagColor}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}/>
                <Card>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:14, marginBottom:8}}>
                    <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
                      <span style={{padding:'3px 9px', borderRadius:6, fontSize:11, fontWeight:700, background:tagColor+'20', color:tagColor}}>{item.tag}</span>
                      <code style={{fontSize:11, fontFamily:'JetBrains Mono, monospace', color:'#9ca3af'}}>v{item.version}</code>
                      <span style={{fontSize:11, color:'#9ca3af'}}>· {item.date}</span>
                      <span style={{fontSize:11, color:'#9ca3af'}}>· {item.author}</span>
                      {!item.published && <span style={{padding:'2px 7px', borderRadius:5, fontSize:10, fontWeight:700, background:'#f1f3f9', color:'#6b7280'}}>BROUILLON</span>}
                    </div>
                    <div style={{display:'flex', gap:6}}>
                      <button style={tbl.smallBtn} title="Modifier">✎</button>
                      <button style={tbl.smallBtn} title="Dupliquer">⧉</button>
                    </div>
                  </div>
                  <div style={{fontSize:16, fontWeight:800, color:'#1a1c2e', marginBottom:6}}>{item.title}</div>
                  <div style={{fontSize:13, color:'#6b7280', lineHeight:1.6}}>{item.body}</div>
                  {item.published && (
                    <div style={{display:'flex', gap:14, marginTop:12, paddingTop:12, borderTop:'1px solid #f0f2fa', fontSize:11, color:'#6b7280'}}>
                      <span>👁 {Math.floor(Math.random()*800+200)} vues</span>
                      <span>💬 {Math.floor(Math.random()*30)} réactions</span>
                      <span>📧 Envoyé à {Math.floor(Math.random()*400+200)} utilisateurs</span>
                    </div>
                  )}
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

Object.assign(window, { AdminConfig, AdminEmails, AdminChangelog })
