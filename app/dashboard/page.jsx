'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

// ── SVG Icons ──────────────────────────────────────────────
const Icon = {
  plus: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  film: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 6h14M1 10h14M4 3v3M4 10v3M8 3v3M8 10v3M12 3v3M12 10v3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>,
  grid: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>,
  calendar: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="3" width="13" height="11.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1.5 7h13M5 1.5V4.5M11 1.5V4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1.5v1.3M8 13.2v1.3M1.5 8h1.3M13.2 8h1.3M3.4 3.4l.9.9M11.7 11.7l.9.9M3.4 12.6l.9-.9M11.7 4.3l.9-.9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  logout: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M6 13H3a1 1 0 01-1-1V3a1 1 0 011-1h3M10 10.5l3-3-3-3M13 7.5H5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  arrowLeft: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 7H2M6 11L2 7l4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M5.5 6.5v4M8.5 6.5v4M3.5 4l.7 7.5a.5.5 0 00.5.5h4.6a.5.5 0 00.5-.5L10.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  spark: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5L9 6H13.5L9.75 8.75L11.25 13.5L7.5 10.75L3.75 13.5L5.25 8.75L1.5 6H6L7.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  upload: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 10.5V3M5 5.5L8 3l3 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M2.5 10.5v2a1 1 0 001 1h9a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  youtube: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3.5" width="14" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M6.5 5.5l4 2.5-4 2.5V5.5Z" fill="currentColor"/></svg>,
  text: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 7h8M2 10h10M2 13h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  file: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M9 1.5H4a1 1 0 00-1 1v11a1 1 0 001 1h8a1 1 0 001-1V6L9 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M9 1.5V6h4.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  link: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 9.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5l-1 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M9.5 6.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  refresh: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 7A5 5 0 112 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M12 3v4h-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  external: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7M7 1h4m0 0v4m0-4L5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  mic: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4.5" y="1" width="5" height="7" rx="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M2 7a5 5 0 0010 0M7 12v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
}

// ── Statut config ──────────────────────────────────────────
const STATUTS = {
  en_attente:        { label: 'En attente',       color: 'text-[#555]',      bg: 'bg-[#555]/8 border-[#555]/15',      pulse: false },
  generation_script: { label: 'Script IA',         color: 'text-violet-400',  bg: 'bg-violet-400/8 border-violet-400/15', pulse: true },
  script_pret:       { label: 'Script prêt',       color: 'text-violet-400',  bg: 'bg-violet-400/8 border-violet-400/15', pulse: false },
  generation_meta:   { label: 'Métadonnées IA',    color: 'text-blue-400',    bg: 'bg-blue-400/8 border-blue-400/15',   pulse: true },
  meta_pret:         { label: 'Métadonnées prêtes', color: 'text-blue-400',   bg: 'bg-blue-400/8 border-blue-400/15',   pulse: false },
  generation_video:  { label: 'Envoi Heygen',      color: 'text-amber-400',   bg: 'bg-amber-400/8 border-amber-400/15', pulse: true },
  video_en_cours:    { label: 'Heygen en cours',   color: 'text-amber-400',   bg: 'bg-amber-400/8 border-amber-400/15', pulse: true },
  upload_youtube:    { label: 'Upload YouTube',    color: 'text-orange-400',  bg: 'bg-orange-400/8 border-orange-400/15', pulse: true },
  publiee:           { label: 'Publiée',           color: 'text-emerald-400', bg: 'bg-emerald-400/8 border-emerald-400/15', pulse: false },
  programmee:        { label: 'Programmée',        color: 'text-sky-400',     bg: 'bg-sky-400/8 border-sky-400/15',     pulse: false },
  erreur:            { label: 'Erreur',            color: 'text-red-400',     bg: 'bg-red-400/8 border-red-400/15',     pulse: false },
}

const inputCls = "w-full bg-[#111] border border-[#222] rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder-[#333] focus:outline-none focus:border-[#c0392b] transition"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('creer')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else setUser(user)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) return (
    <main className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="text-[#888] text-sm tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Chargement</div>
    </main>
  )

  const nav = [
    { id: 'creer',      label: 'Créer',      icon: Icon.film },
    { id: 'videos',     label: 'Vidéos',     icon: Icon.grid },
    { id: 'calendrier', label: 'Calendrier', icon: Icon.calendar },
    { id: 'parametres', label: 'Paramètres', icon: Icon.settings },
  ]

  return (
    <main className="min-h-screen bg-[#0e0e0e] text-white flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        .fade-in { animation: fadeUp .3s ease forwards; opacity: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .pulse-dot { animation: pulseDot 1.5s ease-in-out infinite; }
        @keyframes pulseDot { 0%,100% { opacity:1; } 50% { opacity:.3; } }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(0.3); }
      `}</style>

      {/* SIDEBAR */}
      <aside className="w-[220px] border-r border-[#1c1c1c] flex flex-col fixed h-full bg-[#0a0a0a]">
        <div className="px-6 pt-8 pb-6 border-b border-[#1c1c1c]">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#c0392b] rounded-md flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5-5 3 4 2-2.5L13 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[17px] tracking-tight text-white">Piloto</span>
          </a>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {nav.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                activeTab === item.id ? 'bg-[#1a1a1a] text-white' : 'text-[#555] hover:text-[#aaa] hover:bg-[#141414]'
              }`}>
              <span className={activeTab === item.id ? 'text-[#c0392b]' : 'text-current'}>{item.icon}</span>
              {item.label}
              {activeTab === item.id && <div className="ml-auto w-1 h-1 rounded-full bg-[#c0392b]" />}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-5 border-t border-[#1c1c1c] pt-4">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-md bg-[#c0392b] flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0">
              {user.email[0].toUpperCase()}
            </div>
            <p className="text-[12px] text-[#555] truncate flex-1">{user.email}</p>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-[#444] hover:text-[#888] transition rounded-lg hover:bg-[#141414]">
            {Icon.logout} Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ml-[220px] flex-1 min-h-screen">
        <div className="fade-in" key={activeTab}>
          {activeTab === 'creer'      && <CreerVideo user={user} onGoToParams={() => setActiveTab('parametres')} />}
          {activeTab === 'videos'     && <MesVideos user={user} onCreer={() => setActiveTab('creer')} />}
          {activeTab === 'calendrier' && <Calendrier user={user} />}
          {activeTab === 'parametres' && <Parametres user={user} />}
        </div>
      </div>
    </main>
  )
}

// ── Composants réutilisables ───────────────────────────────
function PageHeader({ title, sub, action }) {
  return (
    <div className="border-b border-[#1c1c1c] px-10 py-8 flex items-start justify-between">
      <div>
        <p className="text-[11px] text-[#444] tracking-[.15em] uppercase mb-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>Piloto</p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[28px] text-white leading-tight">{title}</h1>
        {sub && <p className="text-[13px] text-[#555] mt-1">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

function Btn({ children, onClick, disabled, variant = 'primary', className = '' }) {
  const base = 'inline-flex items-center gap-2 text-[13px] font-medium rounded-lg px-4 py-2.5 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-[#c0392b] hover:bg-[#a93226] text-white',
    ghost:   'border border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#3a3a3a]',
    subtle:  'bg-[#161616] hover:bg-[#1e1e1e] text-[#aaa] hover:text-white border border-[#222]',
    spark:   'bg-gradient-to-r from-[#7c3aed] to-[#c0392b] hover:opacity-90 text-white',
  }
  return <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>{children}</button>
}

function Field({ label, optional, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <label className="text-[12px] font-medium text-[#888] tracking-wide uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>{label}</label>
        {optional && <span className="text-[11px] text-[#3a3a3a]">optionnel</span>}
      </div>
      {children}
      {hint && <p className="text-[11px] text-[#3a3a3a] mt-1.5">{hint}</p>}
    </div>
  )
}

// ── Avatar Card ───────────────────────────────────────────
function AvatarCard({ avatar, selected, onSelect }) {
  return (
    <button onClick={onSelect}
      className={`relative rounded-xl border overflow-hidden text-left transition-all group w-full ${
        selected ? 'border-[#c0392b] ring-1 ring-[#c0392b]/20' : 'border-[#1e1e1e] hover:border-[#2a2a2a]'
      }`}>
      <div className="relative overflow-hidden bg-[#111]" style={{ aspectRatio: '3/4' }}>
        {avatar.preview_image_url
          ? <img src={avatar.preview_image_url} alt={avatar.avatar_name}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-4xl text-[#1a1a1a]">👤</div>
        }
        {/* Gradient bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {/* Badge perso */}
        {avatar.type === 'personal' && (
          <div className="absolute top-2 left-2 bg-[#c0392b] text-white text-[9px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide" style={{ fontFamily: "'DM Mono', monospace" }}>
            MON AVATAR
          </div>
        )}
        {/* Check sélectionné */}
        {selected && (
          <div className="absolute inset-0 bg-[#c0392b]/15 flex items-start justify-end p-2">
            <div className="w-5 h-5 rounded-full bg-[#c0392b] flex items-center justify-center shadow-lg">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5 7.5 2" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </div>
          </div>
        )}
        {/* Nom en bas */}
        <div className="absolute bottom-0 left-0 right-0 px-2.5 py-2">
          <p className={`text-[10px] font-medium truncate leading-tight ${selected ? 'text-[#ff6b5a]' : 'text-[#ccc]'}`}>
            {avatar.avatar_name || 'Sans nom'}
          </p>
        </div>
      </div>
    </button>
  )
}

// ── MES VIDÉOS ─────────────────────────────────────────────
function MesVideos({ user, onCreer }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingVideo, setEditingVideo] = useState(null)
  const [editTitre, setEditTitre] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const intervalRef = useRef(null)

  const fetchVideos = async () => {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setVideos(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchVideos()
    intervalRef.current = setInterval(fetchVideos, 10000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const ouvrirEdit = (v) => {
    setEditingVideo(v)
    setEditTitre(v.titre || '')
    setEditDescription(v.description || '')
  }

  const sauvegarderEdit = async () => {
    setSaving(true)
    await supabase.from('videos').update({ titre: editTitre, description: editDescription }).eq('id', editingVideo.id)
    setSaving(false)
    setEditingVideo(null)
    fetchVideos()
  }

  const supprimerVideo = async (id) => {
    if (!confirm('Supprimer cette vidéo définitivement ?')) return
    setDeletingId(id)
    await supabase.from('videos').delete().eq('id', id)
    setDeletingId(null)
    fetchVideos()
  }

  const hasActive = videos.some(v => !['publiee', 'erreur', 'programmee'].includes(v.statut))

  const StatutBadge = ({ statut }) => {
    const s = STATUTS[statut] || STATUTS['en_attente']
    return (
      <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border ${s.color} ${s.bg}`}
        style={{ fontFamily: "'DM Mono', monospace" }}>
        {s.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current pulse-dot" />}
        {s.label}
      </span>
    )
  }

  const Pipeline = ({ statut }) => {
    const steps = [
      { key: 'generation_script', label: 'Script' },
      { key: 'generation_video',  label: 'Heygen' },
      { key: 'upload_youtube',    label: 'YouTube' },
      { key: 'publiee',           label: 'Publié' },
    ]
    const order = Object.keys(STATUTS)
    const currentIdx = order.indexOf(statut)
    return (
      <div className="flex items-center gap-1.5 mt-2">
        {steps.map((step, i) => {
          const stepIdx = order.indexOf(step.key)
          const done = currentIdx > stepIdx
          const active = currentIdx === stepIdx || (step.key === 'generation_video' && ['generation_video','video_en_cours'].includes(statut))
          return (
            <div key={step.key} className="flex items-center gap-1.5">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-all ${
                done   ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                active ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                         'bg-[#111] text-[#2a2a2a] border border-[#1a1a1a]'
              }`} style={{ fontFamily: "'DM Mono', monospace" }}>
                {done && <span className="text-emerald-500">{Icon.check}</span>}
                {active && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-dot" />}
                {step.label}
              </div>
              {i < steps.length - 1 && <div className={`w-3 h-px ${done ? 'bg-emerald-500/30' : 'bg-[#1a1a1a]'}`} />}
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) return (
    <div>
      <PageHeader title="Mes vidéos" sub="Historique de toutes vos générations." />
      <div className="px-10 py-12 text-center">
        <p className="text-[12px] text-[#333] animate-pulse" style={{ fontFamily: "'DM Mono', monospace" }}>Chargement...</p>
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Mes vidéos"
        sub={`${videos.length} vidéo${videos.length !== 1 ? 's' : ''} · ${hasActive ? 'Pipeline actif' : 'Tout est calme'}`}
        action={
          <div className="flex items-center gap-3">
            {hasActive && (
              <div className="flex items-center gap-2 text-[12px] text-amber-400" style={{ fontFamily: "'DM Mono', monospace" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-dot" />
                En cours
              </div>
            )}
            <Btn variant="subtle" onClick={fetchVideos}>{Icon.refresh} Actualiser</Btn>
          </div>
        }
      />
      <div className="px-10 py-8">
        {/* Modal édition */}
        {editingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#0e0e0e] border border-[#222] rounded-2xl p-6 w-full max-w-md mx-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[18px] text-white">Modifier la vidéo</h3>
                <button onClick={() => setEditingVideo(null)} className="text-[#444] hover:text-white transition text-xl">✕</button>
              </div>
              <div>
                <label className="text-[11px] text-[#555] uppercase tracking-widest mb-1.5 block" style={{ fontFamily: "'DM Mono', monospace" }}>Titre</label>
                <input type="text" value={editTitre} onChange={e => setEditTitre(e.target.value)}
                  className={inputCls} placeholder="Titre de la vidéo" />
              </div>
              <div>
                <label className="text-[11px] text-[#555] uppercase tracking-widest mb-1.5 block" style={{ fontFamily: "'DM Mono', monospace" }}>Description</label>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)}
                  className={`${inputCls} resize-none`} rows={3} placeholder="Description YouTube" />
              </div>
              <div className="flex gap-2 pt-1">
                <Btn variant="ghost" onClick={() => setEditingVideo(null)} className="flex-1 justify-center">Annuler</Btn>
                <Btn onClick={sauvegarderEdit} disabled={saving} className="flex-1 justify-center">
                  {saving ? 'Sauvegarde...' : '✓ Sauvegarder'}
                </Btn>
              </div>
            </div>
          </div>
        )}

        {videos.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 border border-dashed border-[#1a1a1a] rounded-xl">
            <div className="w-12 h-12 rounded-xl border border-[#1e1e1e] flex items-center justify-center text-[#2a2a2a]">{Icon.film}</div>
            <div className="text-center">
              <p className="text-[14px] text-[#444] mb-1">Aucune vidéo générée</p>
              <p className="text-[12px] text-[#2a2a2a]">Lance ta première génération depuis l'onglet Créer</p>
            </div>
            <Btn onClick={onCreer}>Créer une vidéo {Icon.arrow}</Btn>
          </div>
        ) : (
          <div className="space-y-2">
            {videos.map(v => (
              <div key={v.id} className={`border rounded-xl p-5 transition-all ${
                v.statut === 'erreur' ? 'border-red-500/20 bg-red-500/3' :
                ['publiee','programmee'].includes(v.statut) ? 'border-[#1a1a1a] bg-[#080808]' :
                'border-amber-500/15 bg-amber-500/3'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-white truncate mb-1">
                      {v.titre || <span className="text-[#333] italic">Titre en cours de génération...</span>}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[11px] text-[#333]" style={{ fontFamily: "'DM Mono', monospace" }}>
                        {new Date(v.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      {v.channel_id && <span className="text-[11px] text-[#333]" style={{ fontFamily: "'DM Mono', monospace" }}>· {v.channel_id}</span>}
                      {v.duree && <span className="text-[11px] text-[#333]" style={{ fontFamily: "'DM Mono', monospace" }}>· {v.duree === 60 ? '~1 min' : v.duree === 180 ? '~3 min' : '~10 min'}</span>}
                    </div>
                    {!['publiee', 'erreur', 'programmee'].includes(v.statut) && <Pipeline statut={v.statut} />}
                    {v.statut === 'erreur' && (
                      <p className="text-[11px] text-red-400 mt-2" style={{ fontFamily: "'DM Mono', monospace" }}>
                        Une erreur est survenue pendant la génération
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                    <StatutBadge statut={v.statut} />

                    {/* Télécharger — dès que HeyGen a fini */}
                    {v.thumbnail_url && (
                      <a href={v.thumbnail_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-white transition border border-emerald-400/20 hover:border-emerald-400/60 px-2.5 py-1.5 rounded-lg">
                        {Icon.upload} Télécharger
                      </a>
                    )}

                    {/* Éditer titre/description */}
                    <button onClick={() => ouvrirEdit(v)}
                      className="flex items-center gap-1.5 text-[11px] text-[#555] hover:text-white transition border border-[#222] hover:border-[#444] px-2.5 py-1.5 rounded-lg">
                      ✏️ Éditer
                    </button>

                    {/* Voir sur YouTube */}
                    {v.youtube_video_id && (
                      <a href={`https://youtube.com/watch?v=${v.youtube_video_id}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[11px] text-[#c0392b] hover:text-white transition border border-[#c0392b]/20 hover:border-[#c0392b] px-2.5 py-1.5 rounded-lg">
                        {Icon.external} YouTube
                      </a>
                    )}

                    {/* Supprimer */}
                    <button onClick={() => supprimerVideo(v.id)} disabled={deletingId === v.id}
                      className="flex items-center gap-1.5 text-[11px] text-[#333] hover:text-red-400 transition border border-[#1a1a1a] hover:border-red-500/30 px-2.5 py-1.5 rounded-lg disabled:opacity-30">
                      {deletingId === v.id ? '...' : Icon.trash}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── CRÉER VIDÉO ────────────────────────────────────────────
function CreerVideo({ user, onGoToParams }) {
  const [etape, setEtape] = useState(1)
  const [source, setSource] = useState('texte')
  const [contenu, setContenu] = useState('')
  const [duree, setDuree] = useState('60')

  // Heygen — chargés depuis le profil ou saisis manuellement
  const [heygenKey, setHeygenKey]     = useState('')
  const [avatarId, setAvatarId]       = useState('')
  const [voiceId, setVoiceId]         = useState('')

  // Sélecteur avatar/voix
  const [avatars, setAvatars]               = useState([])
  const [voices, setVoices]                 = useState([])
  const [loadingAssets, setLoadingAssets]   = useState(false)
  const [assetsError, setAssetsError]       = useState('')
  const [avatarSearch, setAvatarSearch]     = useState('')
  const [voiceFilter, setVoiceFilter]       = useState('fr')
  const [selectedAvatarObj, setSelectedAvatarObj] = useState(null)
  const [selectedVoiceObj, setSelectedVoiceObj]   = useState(null)

  // Métadonnées
  const [titre, setTitre]               = useState('')
  const [description, setDescription]   = useState('')
  const [miniature, setMiniature]       = useState(null)
  const [datePublication, setDatePublication] = useState('')
  const [chaineSelectionnee, setChaineSelectionnee] = useState(null)
  const [chaines, setChaines]           = useState([])
  const [generatingMeta, setGeneratingMeta] = useState(false)
  const [loading, setLoading]           = useState(false)

  // Au chargement : récupérer le profil + charger avatars automatiquement
  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) return
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', u.id).single()
      if (profile) {
        if (profile.heygen_key) {
          setHeygenKey(profile.heygen_key)
          // Charge les avatars automatiquement sans action du client
          try {
            setLoadingAssets(true)
            const res = await fetch('/api/heygen/avatars-voices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ heygenKey: profile.heygen_key }),
            })
            const data = await res.json()
            if (data.avatars) setAvatars(data.avatars)
            if (data.voices)  setVoices(data.voices)
          } catch (err) {
            console.error('Erreur chargement avatars:', err)
          } finally {
            setLoadingAssets(false)
          }
        }
        if (profile.default_avatar_id) {
          setAvatarId(profile.default_avatar_id)
          setSelectedAvatarObj({ avatar_id: profile.default_avatar_id, avatar_name: profile.default_avatar_name, preview_image_url: null })
        }
        if (profile.default_voice_id) {
          setVoiceId(profile.default_voice_id)
          setSelectedVoiceObj({ voice_id: profile.default_voice_id, name: profile.default_voice_name })
        }
      }
      const { data: ch } = await supabase.from('youtube_channels').select('*').order('created_at', { ascending: false })
      if (ch) setChaines(ch)
    }
    init()
  }, [])

  // Charger avatars + voix depuis HeyGen
  const chargerAssets = async () => {
    if (!heygenKey) { setAssetsError('Entre ta clé API HeyGen'); return }
    setLoadingAssets(true)
    setAssetsError('')
    try {
      const res = await fetch('/api/heygen/avatars-voices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heygenKey }),
      })
      const data = await res.json()
      if (data.error) { setAssetsError(data.error); setLoadingAssets(false); return }
      setAvatars(data.avatars || [])
      setVoices(data.voices || [])
    } catch (err) {
      setAssetsError('Erreur de connexion')
    }
    setLoadingAssets(false)
  }

  const genererAvecIA = async () => {
    setGeneratingMeta(true)
    try {
      // Appel via route serveur Next.js (évite le blocage CORS)
      const res = await fetch('/api/ai/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu })
      })
      const data = await res.json()
      if (data.titre) setTitre(data.titre)
      if (data.description) setDescription(data.description)
    } catch { alert('Erreur génération IA') }
    setGeneratingMeta(false)
  }

  const lancerGeneration = async () => {
    setLoading(true)
    try {
      const { data: { user: u } } = await supabase.auth.getUser()
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: u.id, contenu, duree, avatarId, voiceId, heygenKey,
          titre, description, chaineId: chaineSelectionnee.id,
          datePublication: datePublication || null,
          scriptDirect: source === 'texte', // ← script collé directement = pas besoin d'IA
        })
      })
      const data = await res.json()
      if (data.success) {
        setEtape(1); setContenu(''); setTitre(''); setDescription(''); setChaineSelectionnee(null)
        alert('Génération lancée ! Suis le statut dans "Mes vidéos"')
      } else {
        alert('Erreur : ' + data.error)
      }
    } catch (err) {
      alert('Erreur : ' + err.message)
    }
    setLoading(false)
  }

  const filteredVoices = voices.filter(v => {
    if (voiceFilter === 'all') return true
    return v.language?.toLowerCase().includes(voiceFilter) || v.locale?.toLowerCase().includes(voiceFilter)
  })

  const steps = ['Source', 'Avatar', 'Métadonnées', 'Publication']

  return (
    <div>
      <PageHeader title="Nouvelle vidéo" sub="De ton script à YouTube, automatiquement." />
      <div className="px-10 py-8">

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-10">
          {steps.map((s, i) => {
            const n = i + 1
            const active = etape === n
            const done = etape > n
            return (
              <div key={n} className="flex items-center">
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] transition-all ${
                    done ? 'bg-[#c0392b] text-white' : active ? 'bg-white text-black font-semibold' : 'bg-[#1c1c1c] text-[#444]'
                  }`} style={{ fontFamily: "'DM Mono', monospace" }}>
                    {done ? Icon.check : n}
                  </div>
                  <span className={`text-[12px] transition-all ${active ? 'text-white font-medium' : done ? 'text-[#555]' : 'text-[#333]'}`}>{s}</span>
                </div>
                {i < steps.length - 1 && <div className={`w-10 h-px mx-3 ${done ? 'bg-[#c0392b]' : 'bg-[#1c1c1c]'}`} />}
              </div>
            )
          })}
        </div>

        <div className="max-w-[600px]">

          {/* ── ÉTAPE 1 : SOURCE ───────────────────────────────── */}
          {etape === 1 && (
            <div className="space-y-6">
              <Field label="Source">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'texte', icon: Icon.text, label: 'Script' },
                    { id: 'fichier', icon: Icon.file, label: 'Fichier' },
                    { id: 'url', icon: Icon.link, label: 'URL' },
                  ].map(s => (
                    <button key={s.id} onClick={() => setSource(s.id)}
                      className={`flex flex-col items-center gap-2 py-4 rounded-lg border text-[12px] font-medium transition-all ${
                        source === s.id ? 'bg-[#c0392b]/10 border-[#c0392b] text-white' : 'bg-[#111] border-[#1e1e1e] text-[#444] hover:border-[#2a2a2a] hover:text-[#777]'
                      }`}>
                      <span className={source === s.id ? 'text-[#c0392b]' : ''}>{s.icon}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </Field>

              {source === 'texte' && (
                <Field label="Contenu">
                  <textarea value={contenu} onChange={e => setContenu(e.target.value)}
                    className={`${inputCls} resize-none`} rows={6}
                    placeholder="Colle ton script, un sujet ou une idée..." />
                </Field>
              )}
              {source === 'url' && (
                <Field label="URL d'inspiration">
                  <input type="url" value={contenu} onChange={e => setContenu(e.target.value)} className={inputCls} placeholder="https://youtube.com/watch?v=..." />
                </Field>
              )}
              {source === 'fichier' && (
                <Field label="Fichier">
                  <label className={`flex flex-col items-center justify-center gap-2 py-10 rounded-lg border border-dashed hover:border-[#c0392b] transition cursor-pointer bg-[#111] ${contenu ? 'border-[#c0392b]/40' : 'border-[#222]'}`}>
                    <span className="text-[#444]">{Icon.upload}</span>
                    {contenu ? <span className="text-[12px] text-[#c0392b]">Chargé · {contenu.length} caractères</span>
                      : <span className="text-[12px] text-[#444]">.txt · .pdf · .doc · .docx</span>}
                    <input type="file" accept=".txt,.pdf,.doc,.docx" className="hidden"
                      onChange={async e => {
                        const f = e.target.files[0]
                        if (!f) return
                        if (f.name.endsWith('.txt')) {
                          const r = new FileReader(); r.onload = ev => setContenu(ev.target.result); r.readAsText(f)
                        } else if (f.name.endsWith('.pdf')) {
                          const formData = new FormData(); formData.append('file', f)
                          const res = await fetch('/api/extract-text', { method: 'POST', body: formData })
                          const data = await res.json(); setContenu(data.text || '')
                        } else if (f.name.endsWith('.doc') || f.name.endsWith('.docx')) {
                          const arrayBuffer = await f.arrayBuffer()
                          const mammoth = await import('mammoth')
                          const result = await mammoth.extractRawText({ arrayBuffer }); setContenu(result.value || '')
                        }
                      }} />
                  </label>
                </Field>
              )}

              <Field label="Durée">
                <div className="grid grid-cols-3 gap-2">
                  {[{ v:'60', l:'Court', s:'~1 min' }, { v:'180', l:'Moyen', s:'~3 min' }, { v:'600', l:'Long', s:'~10 min' }].map(d => (
                    <button key={d.v} onClick={() => setDuree(d.v)}
                      className={`py-3 rounded-lg border text-left px-3.5 transition-all ${duree === d.v ? 'bg-[#c0392b]/10 border-[#c0392b]' : 'bg-[#111] border-[#1e1e1e] hover:border-[#2a2a2a]'}`}>
                      <div className={`text-[12px] font-semibold ${duree === d.v ? 'text-white' : 'text-[#555]'}`}>{d.l}</div>
                      <div className="text-[11px] text-[#333]" style={{ fontFamily: "'DM Mono', monospace" }}>{d.s}</div>
                    </button>
                  ))}
                </div>
              </Field>

              <Btn onClick={() => setEtape(2)} disabled={!contenu} className="w-full justify-center">Continuer {Icon.arrow}</Btn>
            </div>
          )}

          {/* ── ÉTAPE 2 : AVATAR & VOIX — layout 2 colonnes ─── */}
          {etape === 2 && (
            <div style={{ maxWidth: '900px' }}>

              {/* Chargement */}
              {loadingAssets && (
                <div className="flex items-center gap-3 px-5 py-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl mb-5">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-[#c0392b] border-t-transparent animate-spin flex-shrink-0" />
                  <span className="text-[13px] text-[#555]">Chargement de tes avatars HeyGen...</span>
                </div>
              )}

              {/* Pas de clé → rediriger */}
              {!avatars.length && !loadingAssets && (
                <div className="flex flex-col items-center gap-4 py-16 border border-dashed border-[#1e1e1e] rounded-2xl mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center text-[#333] text-2xl">🎭</div>
                  <div className="text-center">
                    <p className="text-[14px] text-[#555] mb-1">Aucun avatar chargé</p>
                    <p className="text-[12px] text-[#333]">Configure ta clé HeyGen dans les paramètres</p>
                  </div>
                  <Btn variant="subtle" onClick={onGoToParams}>{Icon.settings} Paramètres</Btn>
                </div>
              )}

              {/* Erreur */}
              {assetsError && (
                <div className="px-4 py-3 bg-red-500/8 border border-red-500/20 rounded-xl mb-5">
                  <p className="text-[12px] text-red-400">{assetsError}</p>
                </div>
              )}

              {/* Layout 2 colonnes : avatars gauche, voix droite */}
              {avatars.length > 0 && (
                <div className="flex gap-5">

                  {/* ── COLONNE GAUCHE : Avatars ── */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-[11px] text-[#444] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Avatar</p>
                        <p className="text-[11px] text-[#333] mt-0.5">{avatars.filter(a => a.type === 'personal').length > 0 ? `${avatars.filter(a=>a.type==='personal').length} perso · ` : ''}{avatars.filter(a => a.type !== 'personal').length} publics</p>
                      </div>
                      <button onClick={chargerAssets} className="text-[10px] text-[#333] hover:text-[#666] transition flex items-center gap-1" style={{ fontFamily: "'DM Mono', monospace" }}>
                        {Icon.refresh} refresh
                      </button>
                    </div>

                    {/* Recherche */}
                    <input type="text" value={avatarSearch} onChange={e => setAvatarSearch(e.target.value)}
                      className={`${inputCls} mb-3 text-[12px]`} placeholder="Rechercher..." />

                    {/* Avatars perso en tête si présents */}
                    {avatars.filter(a => a.type === 'personal').length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] text-[#c0392b] tracking-widest uppercase mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>✦ Mes avatars</p>
                        <div className="grid grid-cols-2 gap-2">
                          {avatars
                            .filter(a => a.type === 'personal' && (!avatarSearch || a.avatar_name?.toLowerCase().includes(avatarSearch.toLowerCase())))
                            .map(avatar => (
                              <AvatarCard key={avatar.avatar_id} avatar={avatar} selected={avatarId === avatar.avatar_id}
                                onSelect={() => { setAvatarId(avatar.avatar_id); setSelectedAvatarObj(avatar) }} />
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Avatars publics */}
                    <p className="text-[10px] text-[#333] tracking-widest uppercase mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>Bibliothèque</p>
                    <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1" style={{ maxHeight: '420px' }}>
                      {avatars
                        .filter(a => a.type !== 'personal' && (!avatarSearch || a.avatar_name?.toLowerCase().includes(avatarSearch.toLowerCase())))
                        .map(avatar => (
                          <AvatarCard key={avatar.avatar_id} avatar={avatar} selected={avatarId === avatar.avatar_id}
                            onSelect={() => { setAvatarId(avatar.avatar_id); setSelectedAvatarObj(avatar) }} />
                        ))}
                    </div>
                  </div>

                  {/* ── COLONNE DROITE : Voix + aperçu sélection ── */}
                  <div style={{ width: '260px', flexShrink: 0 }}>

                    {/* Aperçu avatar sélectionné */}
                    {selectedAvatarObj ? (
                      <div className="mb-4 rounded-xl overflow-hidden border border-[#c0392b]/30 bg-[#0d0d0d]">
                        <div style={{ height: '160px' }} className="relative overflow-hidden bg-[#111]">
                          {selectedAvatarObj.preview_image_url
                            ? <img src={selectedAvatarObj.preview_image_url} alt={selectedAvatarObj.avatar_name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-5xl">👤</div>
                          }
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 px-3 py-2">
                            <p className="text-[11px] font-semibold text-white truncate">{selectedAvatarObj.avatar_name}</p>
                            {selectedAvatarObj.type === 'personal' && (
                              <span className="text-[9px] text-[#c0392b] uppercase tracking-widest" style={{ fontFamily: "'DM Mono', monospace" }}>✦ Mon avatar</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 rounded-xl border border-dashed border-[#1e1e1e] bg-[#0a0a0a] flex flex-col items-center justify-center gap-2 py-8">
                        <span className="text-3xl text-[#2a2a2a]">👤</span>
                        <p className="text-[11px] text-[#333]">Choisis un avatar</p>
                      </div>
                    )}

                    {/* Voix */}
                    {voices.length > 0 && (
                      <div>
                        <p className="text-[11px] text-[#444] tracking-widest uppercase mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>Voix</p>
                        <div className="flex gap-1.5 flex-wrap mb-2">
                          {[{ key:'fr', label:'🇫🇷' }, { key:'en', label:'🇺🇸' }, { key:'es', label:'🇪🇸' }, { key:'all', label:'🌍' }].map(f => (
                            <button key={f.key} onClick={() => setVoiceFilter(f.key)}
                              className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                                voiceFilter === f.key ? 'border-[#c0392b] bg-[#c0392b]/10 text-[#c0392b]' : 'border-[#1e1e1e] text-[#555] hover:border-[#2a2a2a]'
                              }`}>
                              {f.label}
                            </button>
                          ))}
                        </div>
                        <div className="space-y-1 overflow-y-auto pr-0.5" style={{ maxHeight: '300px' }}>
                          {filteredVoices.slice(0, 60).map(voice => (
                            <button key={voice.voice_id}
                              onClick={() => { setVoiceId(voice.voice_id); setSelectedVoiceObj(voice) }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition ${
                                voiceId === voice.voice_id ? 'border-[#c0392b] bg-[#c0392b]/8' : 'border-[#1a1a1a] bg-[#0d0d0d] hover:border-[#2a2a2a]'
                              }`}>
                              <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] ${voiceId === voice.voice_id ? 'bg-[#c0392b]/20 text-[#c0392b]' : 'bg-[#161616] text-[#333]'}`}>
                                {Icon.mic}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-medium text-[#bbb] truncate">{voice.name}</p>
                                <p className="text-[10px] text-[#333]" style={{ fontFamily: "'DM Mono', monospace" }}>{voice.language || voice.locale}</p>
                              </div>
                              {voiceId === voice.voice_id && (
                                <div className="w-3.5 h-3.5 rounded-full bg-[#c0392b] flex items-center justify-center flex-shrink-0">
                                  <svg width="7" height="7" viewBox="0 0 7 7" fill="none"><path d="M1 3.5L2.5 5 6 1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Boutons navigation */}
              <div className="flex gap-2 mt-6">
                <Btn variant="ghost" onClick={() => setEtape(1)}>{Icon.arrowLeft} Retour</Btn>
                <Btn onClick={() => setEtape(3)} disabled={!avatarId} className="flex-1 justify-center">
                  Continuer {Icon.arrow}
                </Btn>
              </div>
              {!avatarId && avatars.length > 0 && <p className="text-[11px] text-amber-600 text-center mt-2">Sélectionne un avatar pour continuer</p>}
            </div>
          )}

          {/* ── ÉTAPE 3 : MÉTADONNÉES ──────────────────────────── */}
          {etape === 3 && (
            <div className="space-y-5">
              <Field label="Titre YouTube" optional>
                <input type="text" value={titre} onChange={e => setTitre(e.target.value)} className={inputCls} placeholder="Titre de ta vidéo" />
                {titre && <p className="text-[11px] text-[#333] mt-1" style={{ fontFamily: "'DM Mono', monospace" }}>{titre.length}/80</p>}
              </Field>
              <Field label="Description" optional>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className={`${inputCls} resize-none`} rows={3} placeholder="Générée par l'IA si vide" />
              </Field>
              <Field label="Miniature" optional hint="1280×720 · JPG ou PNG — auto-générée si vide">
                <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed cursor-pointer transition ${miniature ? 'border-[#c0392b]/40 bg-[#c0392b]/5' : 'border-[#1e1e1e] hover:border-[#2a2a2a] bg-[#111]'}`}>
                  <span className="text-[#555]">{Icon.upload}</span>
                  <span className="text-[12px] text-[#555]">{miniature ? <span className="text-[#c0392b]">{miniature.name}</span> : 'Uploader une miniature'}</span>
                  <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={e => setMiniature(e.target.files[0] || null)} />
                </label>
              </Field>
              <div className="flex gap-2 pt-1">
                <Btn variant="ghost" onClick={() => setEtape(2)}>{Icon.arrowLeft} Retour</Btn>
                <Btn onClick={() => setEtape(4)} className="flex-1 justify-center">Continuer {Icon.arrow}</Btn>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 4 : PUBLICATION ──────────────────────────── */}
          {etape === 4 && (
            <div className="space-y-6">
              <Field label="Chaîne YouTube">
                {chaines.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-10 border border-dashed border-[#1e1e1e] rounded-lg">
                    <span className="text-[#333]">{Icon.youtube}</span>
                    <p className="text-[12px] text-[#444]">Aucune chaîne connectée</p>
                    <Btn variant="subtle" onClick={onGoToParams}>Paramètres {Icon.arrow}</Btn>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chaines.map(ch => (
                      <button key={ch.id} onClick={() => setChaineSelectionnee(ch)}
                        className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg border transition-all text-left ${chaineSelectionnee?.id === ch.id ? 'border-[#c0392b] bg-[#c0392b]/5' : 'border-[#1e1e1e] bg-[#111] hover:border-[#2a2a2a]'}`}>
                        <div className="w-8 h-8 rounded-md bg-[#c0392b] flex items-center justify-center text-[12px] font-semibold text-white flex-shrink-0">
                          {ch.channel_name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-white">{ch.channel_name}</p>
                          <p className="text-[11px] text-[#444] truncate" style={{ fontFamily: "'DM Mono', monospace" }}>{ch.channel_id}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${chaineSelectionnee?.id === ch.id ? 'border-[#c0392b] bg-[#c0392b] text-white' : 'border-[#2a2a2a]'}`}>
                          {chaineSelectionnee?.id === ch.id && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4L3 5.5 6.5 2" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>}
                        </div>
                      </button>
                    ))}
                    <button onClick={onGoToParams}
                      className="w-full flex items-center justify-center gap-2 py-2.5 text-[12px] text-[#333] hover:text-[#666] transition border border-dashed border-[#1a1a1a] hover:border-[#2a2a2a] rounded-lg">
                      {Icon.plus} Ajouter une chaîne
                    </button>
                  </div>
                )}
              </Field>

              <Field label="Date de publication" optional hint="Laisser vide pour publier immédiatement">
                <input type="datetime-local" value={datePublication} onChange={e => setDatePublication(e.target.value)} className={inputCls} />
              </Field>

              {/* Récap */}
              <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[#1a1a1a] bg-[#0d0d0d]">
                  <span className="text-[11px] text-[#444] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Récapitulatif</span>
                </div>
                <div className="divide-y divide-[#141414]">
                  {[
                    ['Source', source],
                    ['Durée', duree === '60' ? '1 min' : duree === '180' ? '3 min' : '10 min'],
                    ['Avatar', selectedAvatarObj?.avatar_name || avatarId || '—'],
                    ['Voix', selectedVoiceObj?.name || voiceId || '—'],
                    ['Titre', titre || 'IA'],
                    ['Chaîne', chaineSelectionnee?.channel_name || <span className="text-amber-500">Non sélectionnée</span>],
                    ['Publication', datePublication || 'Immédiate'],
                  ].map(([k, v], i) => (
                    <div key={i} className="flex justify-between items-center px-4 py-2.5">
                      <span className="text-[11px] text-[#444]" style={{ fontFamily: "'DM Mono', monospace" }}>{k}</span>
                      <span className="text-[12px] text-[#777] truncate max-w-[250px] text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Btn variant="ghost" onClick={() => setEtape(3)}>{Icon.arrowLeft} Retour</Btn>
                <Btn onClick={lancerGeneration} disabled={loading || !chaineSelectionnee} className="flex-1 justify-center">
                  {loading ? 'Lancement...' : <>Lancer la génération {Icon.arrow}</>}
                </Btn>
              </div>
              {!chaineSelectionnee && <p className="text-[11px] text-amber-600 text-center">Sélectionne une chaîne pour continuer</p>}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ── CALENDRIER ─────────────────────────────────────────────
function Calendrier({ user }) {
  const [videos, setVideos] = useState([])

  useEffect(() => {
    supabase.from('videos').select('*')
      .eq('user_id', user.id)
      .eq('statut', 'programmee')
      .order('date_publication', { ascending: true })
      .then(({ data }) => { if (data) setVideos(data) })
  }, [])

  return (
    <div>
      <PageHeader title="Calendrier" sub="Publications programmées à venir." />
      <div className="px-10 py-8">
        {videos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 border border-dashed border-[#1a1a1a] rounded-xl">
            <div className="w-12 h-12 rounded-xl border border-[#1e1e1e] flex items-center justify-center text-[#2a2a2a]">{Icon.calendar}</div>
            <p className="text-[13px] text-[#333]">Aucune publication programmée</p>
          </div>
        ) : (
          <div className="space-y-2">
            {videos.map(v => (
              <div key={v.id} className="flex items-center justify-between px-5 py-4 border border-[#1a1a1a] rounded-xl bg-[#080808]">
                <div>
                  <p className="text-[13px] font-medium text-white">{v.titre}</p>
                  <p className="text-[11px] text-[#444] mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{v.channel_id}</p>
                </div>
                <p className="text-[12px] text-sky-400" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {new Date(v.date_publication).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── PARAMÈTRES ─────────────────────────────────────────────
function Parametres({ user }) {
  const [chaines, setChaines]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [ajoutMode, setAjoutMode] = useState(false)
  const [newNom, setNewNom]       = useState('')
  const [newId, setNewId]         = useState('')
  const [saving, setSaving]       = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // Heygen dans paramètres
  const [heygenKey, setHeygenKey]         = useState('')
  const [avatars, setAvatars]             = useState([])
  const [voices, setVoices]               = useState([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [assetsError, setAssetsError]     = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [selectedVoice, setSelectedVoice]   = useState(null)
  const [voiceFilter, setVoiceFilter]       = useState('fr')
  const [savingProfile, setSavingProfile]   = useState(false)
  const [profileSaved, setProfileSaved]     = useState(false)

  const fetchChaines = async () => {
    setLoading(true)
    const { data } = await supabase.from('youtube_channels').select('*').order('created_at', { ascending: false })
    if (data) setChaines(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchChaines()
    // Charger profil existant
    const loadProfile = async () => {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile) {
        if (profile.heygen_key) setHeygenKey(profile.heygen_key)
        if (profile.default_avatar_id) setSelectedAvatar({ avatar_id: profile.default_avatar_id, avatar_name: profile.default_avatar_name })
        if (profile.default_voice_id) setSelectedVoice({ voice_id: profile.default_voice_id, name: profile.default_voice_name })
      }
    }
    loadProfile()
  }, [])

  const chargerAssets = async () => {
    if (!heygenKey) { setAssetsError('Entre ta clé API HeyGen'); return }
    setLoadingAssets(true); setAssetsError('')
    try {
      const res = await fetch('/api/heygen/avatars-voices', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heygenKey }),
      })
      const data = await res.json()
      if (data.error) { setAssetsError(data.error); setLoadingAssets(false); return }
      setAvatars(data.avatars || []); setVoices(data.voices || [])
    } catch { setAssetsError('Erreur de connexion') }
    setLoadingAssets(false)
  }

  const sauvegarderProfil = async () => {
    setSavingProfile(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id, email: user.email,
      heygen_key: heygenKey,
      default_avatar_id: selectedAvatar?.avatar_id || null,
      default_avatar_name: selectedAvatar?.avatar_name || null,
      default_voice_id: selectedVoice?.voice_id || null,
      default_voice_name: selectedVoice?.name || null,
    })
    setSavingProfile(false)
    if (!error) { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000) }
  }

  const ajouter = async () => {
    if (!newNom.trim() || !newId.trim()) return
    setSaving(true)
    const { error } = await supabase.from('youtube_channels').insert({ user_id: user.id, channel_name: newNom.trim(), channel_id: newId.trim() })
    if (!error) { setNewNom(''); setNewId(''); setAjoutMode(false); await fetchChaines() }
    else alert(error.message)
    setSaving(false)
  }

  const supprimer = async (id) => {
    if (!confirm('Supprimer cette chaîne ?')) return
    setDeletingId(id)
    await supabase.from('youtube_channels').delete().eq('id', id)
    await fetchChaines(); setDeletingId(null)
  }

  const connecterYoutube = () => { window.location.href = `/api/auth/youtube?state=${user.id}` }

  const filteredVoices = voices.filter(v => {
    if (voiceFilter === 'all') return true
    return v.language?.toLowerCase().includes(voiceFilter) || v.locale?.toLowerCase().includes(voiceFilter)
  })

  const Section = ({ title, children }) => (
    <div className="border border-[#1a1a1a] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <span className="text-[11px] text-[#444] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>{title}</span>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )

  return (
    <div>
      <PageHeader title="Paramètres" sub="Compte, Heygen et chaînes YouTube." />
      <div className="px-10 py-8 max-w-[640px] space-y-5">

        {profileSaved && (
          <div className="bg-emerald-600/10 border border-emerald-600/30 text-emerald-400 text-[12px] px-4 py-3 rounded-xl">
            ✓ Paramètres sauvegardés — disponibles dans toutes tes créations
          </div>
        )}

        {/* Compte */}
        <Section title="Compte">
          <Field label="Email">
            <input type="email" defaultValue={user.email} disabled className={`${inputCls} opacity-40 cursor-not-allowed`} />
          </Field>
        </Section>

        {/* Heygen */}
        <Section title="Heygen — Clé API & Avatar par défaut">
          <Field label="Clé API Heygen" hint="Trouve ta clé sur heygen.com → Settings → API">
            <div className="flex gap-2">
              <input type="password" value={heygenKey} onChange={e => setHeygenKey(e.target.value)}
                className={`${inputCls} flex-1`} placeholder="sk_..." />
              <button onClick={chargerAssets} disabled={loadingAssets || !heygenKey}
                className="flex items-center gap-2 bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-40 text-white text-[12px] font-medium px-4 py-2.5 rounded-lg transition whitespace-nowrap">
                {loadingAssets ? <span className="animate-pulse">Chargement...</span> : <>{Icon.refresh} Charger mes avatars</>}
              </button>
            </div>
          </Field>

          {assetsError && (
            <div className="px-4 py-3 bg-red-500/8 border border-red-500/20 rounded-lg">
              <p className="text-[12px] text-red-400">{assetsError}</p>
            </div>
          )}

          {/* Avatar sélectionné actuel */}
          {selectedAvatar && avatars.length === 0 && (
            <div className="flex items-center gap-3 bg-[#111] border border-[#222] rounded-xl p-3">
              <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-xl flex-shrink-0">👤</div>
              <div>
                <p className="text-[11px] text-[#888]">Avatar actuel</p>
                <p className="text-[12px] font-medium text-white">{selectedAvatar.avatar_name || selectedAvatar.avatar_id}</p>
              </div>
            </div>
          )}

          {/* Grille avatars */}
          {avatars.length > 0 && (
            <Field label={`Choisis ton avatar par défaut · ${avatars.length}`}>
              <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                {avatars.map((avatar, i) => (
                  <button key={avatar.avatar_id || i} onClick={() => setSelectedAvatar(avatar)}
                    className={`flex flex-col items-center gap-2 rounded-xl border overflow-hidden text-left transition ${
                      selectedAvatar?.avatar_id === avatar.avatar_id ? 'border-[#c0392b] bg-[#c0392b]/10' : 'border-[#1e1e1e] bg-[#111] hover:border-[#2a2a2a]'
                    }`}>
                    <div className="w-full h-20 overflow-hidden bg-[#1a1a1a]">
                      {avatar.preview_image_url
                        ? <img src={avatar.preview_image_url} alt={avatar.avatar_name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>}
                    </div>
                    <p className="text-[11px] text-[#888] text-center leading-tight truncate w-full px-2 pb-2">
                      {avatar.avatar_name || avatar.avatar_id}
                    </p>
                    {selectedAvatar?.avatar_id === avatar.avatar_id && (
                      <div className="w-4 h-4 rounded-full bg-[#c0392b] flex items-center justify-center mb-2">
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5 6.5 2" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {/* Sélecteur voix */}
          {voices.length > 0 && (
            <Field label={`Voix par défaut · ${voices.length}`}>
              <div className="flex gap-2 flex-wrap mb-3">
                {[{ key:'fr', label:'🇫🇷 FR' }, { key:'en', label:'🇺🇸 EN' }, { key:'es', label:'🇪🇸 ES' }, { key:'all', label:'🌍 Toutes' }].map(f => (
                  <button key={f.key} onClick={() => setVoiceFilter(f.key)}
                    className={`text-[11px] px-3 py-1.5 rounded-lg border transition ${
                      voiceFilter === f.key ? 'border-[#c0392b] bg-[#c0392b]/10 text-[#c0392b]' : 'border-[#1e1e1e] text-[#555] hover:border-[#2a2a2a]'
                    }`} style={{ fontFamily: "'DM Mono', monospace" }}>
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {filteredVoices.slice(0, 50).map(voice => (
                  <button key={voice.voice_id} onClick={() => setSelectedVoice(voice)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition ${
                      selectedVoice?.voice_id === voice.voice_id ? 'border-[#c0392b] bg-[#c0392b]/8' : 'border-[#1a1a1a] bg-[#0d0d0d] hover:border-[#2a2a2a]'
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedVoice?.voice_id === voice.voice_id ? 'bg-[#c0392b]/20 text-[#c0392b]' : 'bg-[#161616] text-[#444]'}`}>
                      {Icon.mic}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#ccc] truncate">{voice.name}</p>
                      <p className="text-[11px] text-[#444]" style={{ fontFamily: "'DM Mono', monospace" }}>{voice.language || voice.locale} · {voice.gender || 'N/A'}</p>
                    </div>
                    {selectedVoice?.voice_id === voice.voice_id && (
                      <div className="w-4 h-4 rounded-full bg-[#c0392b] flex items-center justify-center flex-shrink-0">{Icon.check}</div>
                    )}
                  </button>
                ))}
              </div>
            </Field>
          )}

          <Btn onClick={sauvegarderProfil} disabled={savingProfile} className="w-full justify-center">
            {savingProfile ? 'Sauvegarde...' : '✓ Sauvegarder'}
          </Btn>
        </Section>

        {/* YouTube */}
        <Section title={`Chaînes YouTube · ${chaines.length}`}>
          {loading ? (
            <p className="text-[12px] text-[#333] animate-pulse" style={{ fontFamily: "'DM Mono', monospace" }}>Chargement...</p>
          ) : (
            <div className="space-y-2">
              {chaines.length === 0 && !ajoutMode && (
                <div className="py-8 text-center border border-dashed border-[#1a1a1a] rounded-lg">
                  <p className="text-[12px] text-[#333]">Aucune chaîne connectée</p>
                </div>
              )}
              {chaines.map(ch => (
                <div key={ch.id} className="flex items-center gap-3 px-3.5 py-3 bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg">
                  <div className="w-8 h-8 rounded-md bg-[#c0392b] flex items-center justify-center text-[12px] font-semibold text-white flex-shrink-0">
                    {ch.channel_name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-white">{ch.channel_name}</p>
                    <p className="text-[11px] text-[#333] truncate" style={{ fontFamily: "'DM Mono', monospace" }}>{ch.channel_id}</p>
                  </div>
                  <button onClick={() => supprimer(ch.id)} disabled={deletingId === ch.id}
                    className="text-[#2a2a2a] hover:text-red-500 transition disabled:opacity-30 p-1.5">
                    {Icon.trash}
                  </button>
                </div>
              ))}
              {ajoutMode ? (
                <div className="border border-[#1e1e1e] rounded-lg p-4 space-y-3 bg-[#0a0a0a]">
                  <Field label="Nom de la chaîne">
                    <input type="text" value={newNom} onChange={e => setNewNom(e.target.value)} className={inputCls} placeholder="Ma chaîne" />
                  </Field>
                  <Field label="Channel ID" hint="YouTube Studio → Paramètres → Informations sur la chaîne">
                    <input type="text" value={newId} onChange={e => setNewId(e.target.value)} className={inputCls} placeholder="UCxxxxxxxxxxxxxxxxxx" />
                  </Field>
                  <div className="flex gap-2">
                    <Btn variant="ghost" onClick={() => { setAjoutMode(false); setNewNom(''); setNewId('') }}>Annuler</Btn>
                    <Btn onClick={ajouter} disabled={saving || !newNom.trim() || !newId.trim()} className="flex-1 justify-center">
                      {saving ? 'Ajout...' : 'Confirmer'}
                    </Btn>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button onClick={connecterYoutube}
                    className="w-full flex items-center justify-center gap-2 py-3 text-[12px] text-[#c0392b] hover:text-white border border-dashed border-[#c0392b]/30 hover:border-[#c0392b] hover:bg-[#c0392b]/5 rounded-lg transition font-medium">
                    {Icon.youtube} Connecter Youtube
                  </button>
                  <button onClick={() => setAjoutMode(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-[12px] text-[#333] hover:text-[#666] transition border border-dashed border-[#1a1a1a] hover:border-[#2a2a2a] rounded-lg">
                    {Icon.plus} Ajouter manuellement
                  </button>
                </div>
              )}
            </div>
          )}
        </Section>

      </div>
    </div>
  )
}