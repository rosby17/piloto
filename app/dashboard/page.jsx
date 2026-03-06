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
  close: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  download: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M2 10v1.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

// ── Statut config ──────────────────────────────────────────
const STATUTS = {
  en_attente:        { label: 'En attente',        color: 'text-[#555]',      bg: 'bg-[#555]/8 border-[#555]/15',         pulse: false },
  generation_script: { label: 'Script IA',          color: 'text-violet-400',  bg: 'bg-violet-400/8 border-violet-400/15', pulse: true  },
  script_pret:       { label: 'Script prêt',        color: 'text-violet-400',  bg: 'bg-violet-400/8 border-violet-400/15', pulse: false },
  generation_meta:   { label: 'Métadonnées IA',     color: 'text-blue-400',    bg: 'bg-blue-400/8 border-blue-400/15',     pulse: true  },
  meta_pret:         { label: 'Métadonnées prêtes', color: 'text-blue-400',    bg: 'bg-blue-400/8 border-blue-400/15',     pulse: false },
  generation_video:  { label: 'Envoi Heygen',       color: 'text-amber-400',   bg: 'bg-amber-400/8 border-amber-400/15',   pulse: true  },
  video_en_cours:    { label: 'Heygen en cours',    color: 'text-amber-400',   bg: 'bg-amber-400/8 border-amber-400/15',   pulse: true  },
  upload_youtube:    { label: 'Upload YouTube',     color: 'text-orange-400',  bg: 'bg-orange-400/8 border-orange-400/15', pulse: true  },
  publiee:           { label: 'Publiée',            color: 'text-emerald-400', bg: 'bg-emerald-400/8 border-emerald-400/15', pulse: false },
  programmee:        { label: 'Programmée',         color: 'text-sky-400',     bg: 'bg-sky-400/8 border-sky-400/15',       pulse: false },
  erreur:            { label: 'Erreur',             color: 'text-red-400',     bg: 'bg-red-400/8 border-red-400/15',       pulse: false },
}

const inputCls = "w-full bg-[#111] border border-[#222] rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder-[#333] focus:outline-none focus:border-[#c0392b] transition"

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

function AvatarCard({ avatar, selected, onSelect }) {
  return (
    <button onClick={onSelect}
      className={`relative rounded-xl border overflow-hidden text-left transition-all group w-full ${
        selected ? 'border-[#c0392b] ring-1 ring-[#c0392b]/20' : 'border-[#1e1e1e] hover:border-[#2a2a2a]'
      }`}>
      <div className="relative overflow-hidden bg-[#111]" style={{ aspectRatio: '3/4' }}>
        {avatar.preview_image_url
          ? <img src={avatar.preview_image_url} alt={avatar.avatar_name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-4xl text-[#1a1a1a]">👤</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {avatar.type === 'personal' && (
          <div className="absolute top-2 left-2 bg-[#c0392b] text-white text-[9px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide" style={{ fontFamily: "'DM Mono', monospace" }}>
            MON AVATAR
          </div>
        )}
        {selected && (
          <div className="absolute inset-0 bg-[#c0392b]/15 flex items-start justify-end p-2">
            <div className="w-5 h-5 rounded-full bg-[#c0392b] flex items-center justify-center shadow-lg">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5 7.5 2" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 px-2.5 py-2">
          <p className={`text-[10px] font-medium truncate leading-tight ${selected ? 'text-[#ff6b5a]' : 'text-[#ccc]'}`}>
            {avatar.avatar_name || 'Sans nom'}
          </p>
        </div>
      </div>
    </button>
  )
}

// ── DASHBOARD PRINCIPAL ────────────────────────────────────
export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('videos')
  const [nouvelleVideo, setNouvelleVideo] = useState(false)

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
            <button key={item.id} onClick={() => { setActiveTab(item.id); setNouvelleVideo(false) }}
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
        <div className="fade-in" key={activeTab + (nouvelleVideo ? '-new' : '')}>
          {activeTab === 'videos' && !nouvelleVideo && (
            <MesVideos
              user={user}
              onNouvelleVideo={() => setNouvelleVideo(true)}
              onGoToParams={() => { setActiveTab('parametres'); setNouvelleVideo(false) }}
            />
          )}
          {activeTab === 'videos' && nouvelleVideo && (
            <NouvelleVideo
              user={user}
              onBack={() => setNouvelleVideo(false)}
              onGoToParams={() => { setActiveTab('parametres'); setNouvelleVideo(false) }}
            />
          )}
          {activeTab === 'calendrier' && <Calendrier user={user} />}
          {activeTab === 'parametres' && <Parametres user={user} />}
        </div>
      </div>
    </main>
  )
}

// ── MES VIDÉOS ─────────────────────────────────────────────
function MesVideos({ user, onNouvelleVideo, onGoToParams }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingVideo, setEditingVideo] = useState(null)
  const [editTitre, setEditTitre] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [renamingVideo, setRenamingVideo] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  // ── NOUVEAU : état pour le lecteur vidéo modal ──
  const [playingVideo, setPlayingVideo] = useState(null) // { url, titre }
  const intervalRef = useRef(null)
  const pollingRef = useRef({})

  const fetchVideos = async () => {
    const { data } = await supabase
      .from('videos').select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) {
      setVideos(data)
      data.forEach(v => {
        if (v.statut === 'video_en_cours' && v.heygen_video_id && !pollingRef.current[v.id]) {
          startPolling(v)
        }
        if (!['video_en_cours', 'generation_video'].includes(v.statut) && pollingRef.current[v.id]) {
          clearInterval(pollingRef.current[v.id])
          delete pollingRef.current[v.id]
        }
      })
    }
    setLoading(false)
  }

  const startPolling = async (video) => {
    const { data: profile } = await supabase
      .from('profiles').select('heygen_key').eq('id', user.id).single()
    const heygenKey = profile?.heygen_key
    if (!heygenKey) return

    const pollId = setInterval(async () => {
      try {
        const res = await fetch('/api/heygen/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId: video.id,
            heygenVideoId: video.heygen_video_id,
            heygenKey,
          }),
        })
        const data = await res.json()
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(pollingRef.current[video.id])
          delete pollingRef.current[video.id]
          fetchVideos()
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 15000)

    pollingRef.current[video.id] = pollId
  }

  useEffect(() => {
    fetchVideos()
    intervalRef.current = setInterval(fetchVideos, 10000)
    return () => {
      clearInterval(intervalRef.current)
      Object.values(pollingRef.current).forEach(clearInterval)
      pollingRef.current = {}
    }
  }, [])

  // Fermer menu si clic en dehors
  useEffect(() => {
    const handle = () => setOpenMenuId(null)
    document.addEventListener('click', handle)
    return () => document.removeEventListener('click', handle)
  }, [])

  const ouvrirEdit = (v) => { setEditingVideo(v); setEditTitre(v.titre || ''); setEditDescription(v.description || '') }

  const sauvegarderEdit = async () => {
    setSaving(true)
    await supabase.from('videos').update({ titre: editTitre, description: editDescription }).eq('id', editingVideo.id)
    setSaving(false); setEditingVideo(null); fetchVideos()
  }

  const supprimerVideo = async (id) => {
    if (!confirm('Supprimer cette vidéo définitivement ?')) return
    setDeletingId(id)
    await supabase.from('videos').delete().eq('id', id)
    setDeletingId(null); fetchVideos()
  }

  const hasActive = videos.some(v => !['publiee', 'erreur', 'programmee', 'script_pret', 'upload_youtube'].includes(v.statut))

  const getStatusOverlay = (statut) => {
    switch (statut) {
      case 'en_attente':
      case 'generation_script':
        return {
          label: 'Script en cours',
          icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L9.5 6.5H14.5L10.5 9.5L12 14.5L8 11.5L4 14.5L5.5 9.5L1.5 6.5H6.5L8 1.5Z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
          bg: 'bg-violet-500/20 border-violet-500/30',
          dot: 'bg-violet-400',
          badge: 'bg-violet-500/80 text-white',
          glowColor: '#7c3aed',
          pulse: true,
        }
      case 'script_pret':
        return {
          label: 'Draft',
          icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3h10M3 7h7M3 11h5" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>,
          bg: 'bg-[#111]/80 border-[#333]',
          dot: 'bg-[#555]',
          badge: 'bg-[#2a2a2a] text-[#888]',
          glowColor: null,
          pulse: false,
        }
      case 'generation_video':
        return {
          label: 'Envoi HeyGen...',
          icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.3"/><path d="M8 5v3l2 2" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>,
          bg: 'bg-amber-500/20 border-amber-500/30',
          dot: 'bg-amber-400',
          badge: 'bg-amber-500/80 text-white',
          glowColor: '#f59e0b',
          pulse: true,
        }
      case 'video_en_cours':
        return {
          label: 'HeyGen génère...',
          icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.3"/><path d="M8 5v3l2 2" stroke="white" strokeWidth="1.3" strokeLinecap="round"/></svg>,
          bg: 'bg-amber-500/20 border-amber-500/30',
          dot: 'bg-amber-400',
          badge: 'bg-amber-500/80 text-white',
          glowColor: '#f59e0b',
          pulse: true,
        }
      case 'upload_youtube':
        return {
          label: 'Vidéo prête ✓',
          icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8l4 4 8-8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
          bg: 'bg-emerald-500/20 border-emerald-500/30',
          dot: 'bg-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-400',
          glowColor: '#10b981',
          pulse: false,
        }
      case 'publiee':
        return { label: null, badge: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400', glowColor: null, pulse: false }
      case 'programmee':
        return { label: null, badge: 'bg-sky-500/20 text-sky-400', dot: 'bg-sky-400', glowColor: null, pulse: false }
      case 'erreur':
        return {
          label: 'Erreur',
          icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.3"/><path d="M8 5v4M8 11v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>,
          bg: 'bg-red-500/20 border-red-500/30',
          dot: 'bg-red-400',
          badge: 'bg-red-500/20 text-red-400',
          glowColor: '#ef4444',
          pulse: false,
        }
      default:
        return { badge: 'bg-[#2a2a2a] text-[#666]', dot: 'bg-[#444]', glowColor: null, pulse: false }
    }
  }

  const getStatusLabel = (statut) => {
    const map = {
      en_attente: 'En attente', generation_script: 'Script IA', script_pret: 'Draft',
      generation_video: 'Envoi...', video_en_cours: 'HeyGen', upload_youtube: 'Prête ✓',
      publiee: 'Publiée', programmee: 'Programmée', erreur: 'Erreur',
    }
    return map[statut] || statut
  }

  const ThumbnailPlaceholder = ({ statut }) => {
    const overlay = getStatusOverlay(statut)
    return (
      <div className="w-full h-full relative bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#141414] to-[#080808]" />
        {overlay.glowColor && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full blur-2xl opacity-25"
            style={{ background: overlay.glowColor }} />
        )}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '18px 18px'
        }} />
        <div className="relative flex flex-col items-center gap-2.5">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${overlay.bg || 'bg-[#111] border-[#1e1e1e]'}`}>
            {overlay.icon || (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="1" y="3" width="16" height="12" rx="2" stroke="#2a2a2a" strokeWidth="1.3"/>
                <path d="M7 6.5l5 2.5-5 2.5V6.5Z" fill="#2a2a2a"/>
              </svg>
            )}
          </div>
          {overlay.pulse && (
            <div className="flex items-center gap-1">
              {[0, 0.15, 0.3].map((delay, i) => (
                <div key={i} className={`w-1 h-1 rounded-full pulse-dot ${overlay.dot}`}
                  style={{ animationDelay: `${delay}s` }} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) return (
    <div>
      <PageHeader title="Vidéos" />
      <div className="px-10 py-12 flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#333]">
          <div className="w-4 h-4 rounded-full border-2 border-[#c0392b] border-t-transparent animate-spin" />
          <span className="text-[12px]" style={{ fontFamily: "'DM Mono', monospace" }}>Chargement...</span>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Vidéos"
        sub={videos.length > 0 ? `${videos.length} vidéo${videos.length !== 1 ? 's' : ''}` : 'Crée ta première vidéo'}
        action={
          <div className="flex items-center gap-3">
            {hasActive && (
              <div className="flex items-center gap-2 text-[12px] text-amber-400" style={{ fontFamily: "'DM Mono', monospace" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-dot" />
                Pipeline actif
              </div>
            )}
            <Btn variant="subtle" onClick={fetchVideos}>{Icon.refresh} Actualiser</Btn>
            <Btn onClick={onNouvelleVideo}>{Icon.plus} Nouvelle vidéo</Btn>
          </div>
        }
      />

      <div className="px-10 py-8">

        {/* ── Modal lecteur vidéo ── */}
        {playingVideo && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setPlayingVideo(null)}>
            <div
              className="relative w-full max-w-4xl mx-4"
              onClick={e => e.stopPropagation()}>
              {/* Header modal */}
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-[13px] font-medium text-white truncate pr-4">{playingVideo.titre || 'Vidéo'}</p>
                <button
                  onClick={() => setPlayingVideo(null)}
                  className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#666] hover:text-white transition flex-shrink-0">
                  {Icon.close}
                </button>
              </div>
              {/* Lecteur vidéo */}
              <video
                src={playingVideo.url}
                controls
                autoPlay
                className="w-full rounded-xl border border-[#2a2a2a] bg-black shadow-2xl"
                style={{ maxHeight: '72vh' }}
              />
              {/* Footer avec bouton télécharger */}
              <div className="flex items-center justify-between mt-3 px-1">
                <p className="text-[11px] text-[#444]" style={{ fontFamily: "'DM Mono', monospace" }}>
                  Appuie sur Échap ou clique en dehors pour fermer
                </p>
                <a
                  href={playingVideo.url}
                  download
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-2 text-[12px] text-[#555] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-2 rounded-lg transition">
                  {Icon.download} Télécharger
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal édition ── */}
        {editingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#0e0e0e] border border-[#222] rounded-2xl p-6 w-full max-w-md mx-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[18px] text-white">Modifier</h3>
                <button onClick={() => setEditingVideo(null)} className="text-[#444] hover:text-white transition">{Icon.close}</button>
              </div>
              <div>
                <label className="text-[11px] text-[#555] uppercase tracking-widest mb-1.5 block" style={{ fontFamily: "'DM Mono', monospace" }}>Titre</label>
                <input type="text" value={editTitre} onChange={e => setEditTitre(e.target.value)} className={inputCls} placeholder="Titre de la vidéo" />
              </div>
              <div>
                <label className="text-[11px] text-[#555] uppercase tracking-widest mb-1.5 block" style={{ fontFamily: "'DM Mono', monospace" }}>Description</label>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} className={`${inputCls} resize-none`} rows={3} placeholder="Description YouTube" />
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

        {/* ── Modal renommer ── */}
        {renamingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#0e0e0e] border border-[#222] rounded-2xl p-6 w-full max-w-sm mx-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[18px] text-white">Renommer</h3>
                <button onClick={() => setRenamingVideo(null)} className="text-[#444] hover:text-white transition">{Icon.close}</button>
              </div>
              <input
                type="text"
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={async e => {
                  if (e.key === 'Enter' && renameValue.trim()) {
                    await supabase.from('videos').update({ titre: renameValue.trim() }).eq('id', renamingVideo.id)
                    setRenamingVideo(null); fetchVideos()
                  }
                }}
                className={inputCls}
                placeholder="Nouveau titre..."
                autoFocus
              />
              <div className="flex gap-2">
                <Btn variant="ghost" onClick={() => setRenamingVideo(null)} className="flex-1 justify-center">Annuler</Btn>
                <Btn onClick={async () => {
                  if (!renameValue.trim()) return
                  await supabase.from('videos').update({ titre: renameValue.trim() }).eq('id', renamingVideo.id)
                  setRenamingVideo(null); fetchVideos()
                }} className="flex-1 justify-center">Renommer</Btn>
              </div>
            </div>
          </div>
        )}

        {videos.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-24 border border-dashed border-[#1a1a1a] rounded-2xl">
            <div className="w-14 h-14 rounded-2xl border border-[#1e1e1e] bg-[#0d0d0d] flex items-center justify-center text-[#2a2a2a]">{Icon.film}</div>
            <div className="text-center">
              <p className="text-[15px] text-[#555] mb-1.5">Aucune vidéo pour l'instant</p>
              <p className="text-[12px] text-[#2a2a2a]">Lance ta première génération en collant un script</p>
            </div>
            <Btn onClick={onNouvelleVideo}>{Icon.plus} Nouvelle vidéo</Btn>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map(v => {
              const overlay = getStatusOverlay(v.statut)
              const isActive = overlay.pulse
              const isDone = ['publiee', 'programmee', 'upload_youtube'].includes(v.statut)
              const isError = v.statut === 'erreur'
              const isDraft = v.statut === 'script_pret'
              const isReady = v.statut === 'upload_youtube'
              const isMenuOpen = openMenuId === v.id

              return (
                <div key={v.id} className="group relative flex flex-col rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#2a2a2a] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40">

                  {/* Vignette 16/9 */}
                  <div className="relative rounded-t-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>

                    {/* ── VIDÉO PRÊTE : bouton play qui ouvre le lecteur modal ── */}
                    {isReady && v.thumbnail_url ? (
                      <button
                        onClick={() => setPlayingVideo({ url: v.thumbnail_url, titre: v.titre })}
                        className="block w-full h-full group/play">
                        <div className="w-full h-full bg-[#0d0d0d] flex items-center justify-center relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
                          <div className="relative flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center group-hover/play:bg-emerald-500/40 group-hover/play:scale-110 transition-all duration-200">
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7 4l10 6-10 6V4Z" fill="#10b981"/>
                              </svg>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>
                              Lire la vidéo
                            </span>
                          </div>
                        </div>
                      </button>
                    ) : v.thumbnail_url ? (
                      <img src={v.thumbnail_url} alt={v.titre} className="w-full h-full object-cover" />
                    ) : (
                      <ThumbnailPlaceholder statut={v.statut} />
                    )}

                    {/* Overlay statut actif */}
                    {isActive && (
                      <div className={`absolute inset-0 border flex items-center justify-center ${overlay.bg}`}>
                        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-lg">
                          <span className={`w-1.5 h-1.5 rounded-full pulse-dot flex-shrink-0 ${overlay.dot}`} />
                          <span className="text-[11px] text-white font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>
                            {overlay.label}
                          </span>
                        </div>
                      </div>
                    )}

                    {isDraft && !isActive && (
                      <div className="absolute top-2 left-2 bg-[#1a1a1a]/90 backdrop-blur-sm border border-[#333] text-[#888] text-[10px] px-2.5 py-1 rounded-lg font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>
                        Draft
                      </div>
                    )}
                    {isError && (
                      <div className="absolute top-2 left-2 bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-400 text-[10px] px-2.5 py-1 rounded-lg font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>
                        Erreur
                      </div>
                    )}

                    {/* Bouton edit top-right */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        onClick={e => { e.stopPropagation(); ouvrirEdit(v) }}
                        className="w-7 h-7 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-[#ccc] hover:text-white transition"
                        title="Modifier">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5L10.5 3.5L4 10L1.5 10.5L2 8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                      </button>
                    </div>
                  </div>

                  {/* Infos bas de card */}
                  <div className="px-3 py-2.5 flex flex-col gap-1.5 flex-1">
                    <p className="text-[12px] font-medium text-white leading-snug line-clamp-2" style={{ minHeight: '34px' }}>
                      {v.titre || <span className="text-[#2a2a2a] italic font-normal">Titre en génération...</span>}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span className="text-[10px] text-[#2a2a2a]" style={{ fontFamily: "'DM Mono', monospace" }}>
                        {new Date(v.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${overlay.badge}`} style={{ fontFamily: "'DM Mono', monospace" }}>
                          {overlay.pulse && <span className={`w-1 h-1 rounded-full pulse-dot flex-shrink-0 ${overlay.dot}`} />}
                          {getStatusLabel(v.statut)}
                        </span>

                        {/* Menu "..." */}
                        <div className="relative">
                          <button
                            onClick={e => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : v.id) }}
                            className={`w-6 h-6 rounded-md flex items-center justify-center transition ${isMenuOpen ? 'bg-[#2a2a2a] text-white' : 'text-[#444] hover:text-[#aaa] hover:bg-[#1a1a1a]'}`}>
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                              <circle cx="2.5" cy="6.5" r="1" fill="currentColor"/>
                              <circle cx="6.5" cy="6.5" r="1" fill="currentColor"/>
                              <circle cx="10.5" cy="6.5" r="1" fill="currentColor"/>
                            </svg>
                          </button>

                          {isMenuOpen && (
                            <div
                              className="absolute bottom-8 right-0 z-50 w-52 bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl shadow-black/80 py-1"
                              onClick={e => e.stopPropagation()}>

                              <div className="px-3.5 py-2 border-b border-[#1e1e1e] mb-1">
                                <p className="text-[10px] text-[#444]" style={{ fontFamily: "'DM Mono', monospace" }}>Avatar Video</p>
                              </div>

                              {/* Lire la vidéo */}
                              {v.thumbnail_url ? (
                                <button
                                  onClick={() => { setPlayingVideo({ url: v.thumbnail_url, titre: v.titre }); setOpenMenuId(null) }}
                                  className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-emerald-400 hover:text-white hover:bg-[#1e1e1e] transition cursor-pointer font-medium w-full text-left">
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 4.5l5 2.5-5 2.5V4.5Z" fill="currentColor"/></svg>
                                  Lire la vidéo
                                </button>
                              ) : (
                                <div className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-[#333] cursor-not-allowed select-none">
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 4.5l5 2.5-5 2.5V4.5Z" fill="currentColor"/></svg>
                                  Vidéo en cours...
                                </div>
                              )}

                              {/* Télécharger */}
                              {v.thumbnail_url ? (
                                <a href={v.thumbnail_url} download
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-[#bbb] hover:text-white hover:bg-[#1e1e1e] transition cursor-pointer">
                                  {Icon.download} Télécharger la vidéo
                                </a>
                              ) : (
                                <div className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-[#333] cursor-not-allowed select-none">
                                  {Icon.download} Télécharger (en cours...)
                                </div>
                              )}

                              {/* YouTube */}
                              {v.youtube_video_id ? (
                                <a href={`https://youtube.com/watch?v=${v.youtube_video_id}`} target="_blank" rel="noopener noreferrer"
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-[#bbb] hover:text-white hover:bg-[#1e1e1e] transition cursor-pointer">
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 5L9 7L5.5 9V5Z" fill="currentColor"/></svg>
                                  Voir sur YouTube
                                </a>
                              ) : (
                                <div className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-[#333] cursor-not-allowed select-none">
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 5L9 7L5.5 9V5Z" fill="currentColor"/></svg>
                                  Publier sur YouTube
                                </div>
                              )}

                              <button
                                onClick={() => { setRenamingVideo(v); setRenameValue(v.titre || ''); setOpenMenuId(null) }}
                                className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-[#bbb] hover:text-white hover:bg-[#1e1e1e] transition w-full text-left">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 11h2.5L11 4.5a1.4 1.4 0 00-2-2L2.5 9V11Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M9 2.5l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                                Renommer
                              </button>

                              <button
                                onClick={() => { ouvrirEdit(v); setOpenMenuId(null) }}
                                className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-[#bbb] hover:text-white hover:bg-[#1e1e1e] transition w-full text-left">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 7h4M7 5v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                                Modifier
                              </button>

                              <div className="border-t border-[#1e1e1e] my-1" />

                              <button
                                onClick={() => { supprimerVideo(v.id); setOpenMenuId(null) }}
                                disabled={deletingId === v.id}
                                className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-red-400/70 hover:text-red-400 hover:bg-red-500/8 transition w-full text-left disabled:opacity-30">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V3a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v4.5M8.5 6v4.5M3.5 4l.5 7a.5.5 0 00.5.5h5a.5.5 0 00.5-.5l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                {deletingId === v.id ? 'Suppression...' : 'Supprimer'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── NOUVELLE VIDÉO ─────────────────────────────────────────
function NouvelleVideo({ user, onBack, onGoToParams }) {
  const router = useRouter()
  const [etape, setEtape] = useState('choix')

  const [scriptBrut, setScriptBrut] = useState('')
  const [analysing, setAnalysing]   = useState(false)
  const [suggestions, setSuggestions] = useState(null)
  const [scriptGenere, setScriptGenere] = useState('')
  const [generatingScript, setGeneratingScript] = useState(false)
  const [contenu, setContenu] = useState('')

  const [niche, setNiche]     = useState('')
  const [tone, setTone]       = useState('')
  const [audience, setAudience] = useState('')
  const [longueur, setLongueur] = useState('medium')

  const [heygenKey, setHeygenKey]   = useState('')
  const [avatarId, setAvatarId]     = useState('')
  const [voiceId, setVoiceId]       = useState('')
  const [avatars, setAvatars]       = useState([])
  const [voices, setVoices]         = useState([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [assetsError, setAssetsError]     = useState('')
  const [avatarSearch, setAvatarSearch]   = useState('')
  const [voiceFilter, setVoiceFilter]     = useState('fr')
  const [selectedAvatarObj, setSelectedAvatarObj] = useState(null)
  const [selectedVoiceObj, setSelectedVoiceObj]   = useState(null)

  const [titre, setTitre]         = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) return
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', u.id).single()
      if (profile?.heygen_key) {
        setHeygenKey(profile.heygen_key)
        try {
          setLoadingAssets(true)
          const res = await fetch('/api/heygen/avatars-voices', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ heygenKey: profile.heygen_key }),
          })
          const data = await res.json()
          if (data.avatars) setAvatars(data.avatars)
          if (data.voices)  setVoices(data.voices)
        } catch (err) { console.error(err) }
        finally { setLoadingAssets(false) }
      }
      if (profile?.default_avatar_id) {
        setAvatarId(profile.default_avatar_id)
        setSelectedAvatarObj({ avatar_id: profile.default_avatar_id, avatar_name: profile.default_avatar_name, preview_image_url: null })
      }
      if (profile?.default_voice_id) {
        setVoiceId(profile.default_voice_id)
        setSelectedVoiceObj({ voice_id: profile.default_voice_id, name: profile.default_voice_name })
      }
    }
    init()
  }, [])

  const analyserScript = async () => {
    if (!scriptBrut.trim()) return
    setAnalysing(true)
    setEtape('analyse')
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Analyse ce script YouTube et retourne UNIQUEMENT un JSON valide (sans markdown, sans backticks) avec ces champs:
{
  "niche": "Health & Wellness | Finance & Money | Personal Development | Nutrition & Diet | Mental Health | Fitness & Sport | Technology | Spirituality | Relationships | Business",
  "tone": "Authoritative & Medical | Storytelling & Emotional | Energetic & Motivational | Friendly & Conversational | Educational & Scientific",
  "audience": "Seniors 60+ | Adults 40-60 | Young Adults 18-35 | General Audience | Content Creators | Entrepreneurs",
  "langue": "Français | English | Español | Português | Deutsch | Italiano | العربية | Nederlands | Русский | 中文",
  "titre_suggere": "titre accrocheur YouTube optimisé SEO",
  "resume": "résumé en 1 phrase du contenu"
}

Script à analyser:
${scriptBrut.substring(0, 3000)}`
          }]
        })
      })
      const data = await response.json()
      const text = data.choices?.[0]?.message?.content || '{}'
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setSuggestions(parsed)
      setNiche(parsed.niche || '')
      setTone(parsed.tone || '')
      setAudience(parsed.audience || '')
      setTitre(parsed.titre_suggere || '')
      setEtape('suggestions')
    } catch (err) {
      console.error(err)
      setSuggestions({})
      setEtape('suggestions')
    }
    setAnalysing(false)
  }

  const genererScript = async () => {
    setGeneratingScript(true)
    setEtape('script_pret')
    const longueurMap = {
      short: '1000-5000 caractères (3-5 min)',
      medium: '5000-15000 caractères (8-12 min)',
      long: '15000-30000 caractères (15-20 min)',
    }
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: `Tu es un expert en scripts YouTube viraux. Réécris et améliore ce script en le rendant plus engageant et optimisé pour YouTube.

Paramètres:
- Niche: ${niche}
- Ton: ${tone}
- Audience cible: ${audience}
- Longueur souhaitée: ${longueurMap[longueur]}
- Langue: garde la même langue que le script original

Instructions:
- Commence par un hook fort qui accroche en 3 secondes
- Structure claire: Hook → Problème → Solution → CTA
- Adapte le vocabulaire à l'audience ${audience}
- Ton ${tone}
- NE retourne QUE le script pur, sans titre ni notes de mise en scène

Script original:
${scriptBrut}`
          }]
        })
      })
      const data = await response.json()
      const script = data.choices?.[0]?.message?.content || scriptBrut
      setScriptGenere(script)
      setContenu(script)
    } catch (err) {
      console.error(err)
      setScriptGenere(scriptBrut)
      setContenu(scriptBrut)
    }
    setGeneratingScript(false)
  }

  const lancerGeneration = async () => {
    setLoading(true)
    try {
      const { data: { user: u } } = await supabase.auth.getUser()
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: u.id, contenu, avatarId, voiceId, heygenKey,
          titre, description,
          scriptDirect: true,
          stopAfterVideo: true,
        })
      })
      const data = await res.json()
      if (data.success) { onBack() }
      else { alert('Erreur : ' + data.error) }
    } catch (err) { alert('Erreur : ' + err.message) }
    setLoading(false)
  }

  const filteredVoices = voices.filter(v => {
    if (voiceFilter === 'all') return true
    return v.language?.toLowerCase().includes(voiceFilter) || v.locale?.toLowerCase().includes(voiceFilter)
  })

  const niches    = ['Health & Wellness','Finance & Money','Personal Development','Nutrition & Diet','Mental Health','Fitness & Sport','Technology','Spirituality','Relationships','Business']
  const tones     = ['Authoritative & Medical','Storytelling & Emotional','Energetic & Motivational','Friendly & Conversational','Educational & Scientific']
  const audiences = ['Seniors 60+','Adults 40-60','Young Adults 18-35','General Audience','Content Creators','Entrepreneurs']

  return (
    <div>
      <PageHeader
        title="Nouvelle vidéo"
        sub={
          etape === 'choix' ? 'Tu as déjà un script ou tu veux en générer un ?' :
          etape === 'analyse' ? 'Analyse en cours...' :
          etape === 'suggestions' ? 'Confirme les suggestions IA' :
          etape === 'script_pret' ? 'Script optimisé prêt' :
          etape === 'avatar' ? 'Choisis ton avatar' : 'Prêt à générer'
        }
        action={
          <button onClick={onBack} className="flex items-center gap-2 text-[12px] text-[#444] hover:text-white transition border border-[#1e1e1e] hover:border-[#333] px-3.5 py-2 rounded-lg">
            {Icon.arrowLeft} Retour
          </button>
        }
      />

      <div className="px-10 py-8 max-w-[680px]">

        {/* ── ÉTAPE CHOIX ── */}
        {etape === 'choix' && (
          <div className="space-y-3">
            <button
              onClick={() => setEtape('saisie')}
              className="w-full flex items-center gap-4 px-5 py-5 bg-[#0d0d0d] border border-[#1e1e1e] hover:border-[#c0392b]/40 hover:bg-[#c0392b]/5 rounded-xl transition-all text-left group">
              <div className="w-11 h-11 rounded-xl bg-[#c0392b]/10 border border-[#c0392b]/20 flex items-center justify-center flex-shrink-0 text-[#c0392b] group-hover:bg-[#c0392b]/20 transition">
                {Icon.spark}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-white mb-0.5">Optimiser mon script avec l'IA</p>
                <p className="text-[12px] text-[#555]">Colle ton script brut — l'IA l'analyse, suggère et génère une version virale</p>
              </div>
              <span className="text-[#333] group-hover:text-[#c0392b] group-hover:translate-x-0.5 transition-all">{Icon.arrow}</span>
            </button>

            <button
              onClick={() => setEtape('script_direct')}
              className="w-full flex items-center gap-4 px-5 py-5 bg-[#0d0d0d] border border-[#1e1e1e] hover:border-[#2a2a2a] hover:bg-[#111] rounded-xl transition-all text-left group">
              <div className="w-11 h-11 rounded-xl bg-[#1a1a1a] border border-[#222] flex items-center justify-center flex-shrink-0 text-[#555] group-hover:text-[#aaa] transition">
                {Icon.file}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-white mb-0.5">J'ai déjà un script prêt</p>
                <p className="text-[12px] text-[#555]">Passe directement à l'avatar et à la génération vidéo</p>
              </div>
              <span className="text-[#333] group-hover:text-[#555] group-hover:translate-x-0.5 transition-all">{Icon.arrow}</span>
            </button>
          </div>
        )}

        {/* ── ÉTAPE SAISIE ── */}
        {etape === 'saisie' && (
          <div className="space-y-4">
            <div className="border border-[#1a1a1a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#1a1a1a] bg-[#0a0a0a]">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-[#555]"><path d="M2 2.5h9M2 5.5h6M2 8.5h7M2 11.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span className="text-[11px] text-[#555] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Coller un titre, un script ou un transcript</span>
                <span className="text-[#c0392b] text-[11px]">*</span>
              </div>
              <textarea
                value={scriptBrut}
                onChange={e => setScriptBrut(e.target.value)}
                className="w-full bg-[#0d0d0d] px-4 py-4 text-[13px] text-white placeholder-[#2a2a2a] focus:outline-none resize-none"
                rows={10}
                placeholder="Collez votre script complet ici..."
              />
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#1a1a1a] bg-[#0a0a0a]">
                <span className="text-[11px] text-[#333]" style={{ fontFamily: "'DM Mono', monospace" }}>{scriptBrut.length} caractères</span>
                <button
                  onClick={analyserScript}
                  disabled={!scriptBrut.trim()}
                  className="flex items-center gap-2 text-[12px] font-medium px-4 py-2 bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/><path d="M10 10l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  Analyser & Continuer
                </button>
              </div>
            </div>
            <button onClick={() => setEtape('choix')} className="flex items-center gap-2 text-[12px] text-[#444] hover:text-white transition">
              {Icon.arrowLeft} Retour
            </button>
          </div>
        )}

        {/* ── ÉTAPE ANALYSE ── */}
        {etape === 'analyse' && (
          <div className="flex flex-col items-center gap-6 py-20">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#c0392b]/10 border border-[#c0392b]/20 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#c0392b]/30 border-t-[#c0392b] rounded-full animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-[15px] font-medium text-white mb-1">Analyse en cours...</p>
              <p className="text-[12px] text-[#444]">L'IA détecte la niche, le ton et l'audience</p>
            </div>
            <div className="flex items-center gap-2">
              {['Niche', 'Ton', 'Audience', 'Titre'].map((item, i) => (
                <div key={item} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111] border border-[#1e1e1e] text-[11px] text-[#444] animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                  <span className="w-1 h-1 rounded-full bg-[#c0392b]/50" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ÉTAPE SUGGESTIONS ── */}
        {etape === 'suggestions' && suggestions && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#c0392b]/8 border border-[#c0392b]/20 rounded-xl">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-[#c0392b] flex-shrink-0"><path d="M6.5 1L8 5H12L8.8 7.4 10 11.5 6.5 9.2 3 11.5l1.2-4.1L1 5h4L6.5 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
              <span className="text-[11px] text-[#c0392b] tracking-widest uppercase font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>Auto-détecté — confirme ou ajuste</span>
            </div>

            {suggestions.titre_suggere && (
              <div className="border border-[#c0392b]/30 bg-[#c0392b]/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-[#c0392b] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Titre suggéré · {suggestions.langue}</span>
                  <button onClick={() => setTitre(suggestions.titre_suggere)} className="text-[10px] text-[#c0392b] hover:text-white transition border border-[#c0392b]/30 hover:border-[#c0392b] px-2 py-1 rounded-lg">
                    Utiliser
                  </button>
                </div>
                <p className="text-[13px] font-semibold text-white leading-snug">{suggestions.titre_suggere}</p>
              </div>
            )}

            <div>
              <p className="text-[11px] text-[#444] tracking-widest uppercase mb-2.5" style={{ fontFamily: "'DM Mono', monospace" }}>Niche</p>
              <div className="flex flex-wrap gap-2">
                {niches.map(n => (
                  <button key={n} onClick={() => setNiche(n)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border transition ${niche === n ? 'border-[#c0392b] bg-[#c0392b]/10 text-white' : 'border-[#1e1e1e] text-[#555] hover:border-[#2a2a2a] hover:text-[#aaa]'}`}>
                    {niche === n && <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5 7.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] text-[#444] tracking-widest uppercase mb-2.5" style={{ fontFamily: "'DM Mono', monospace" }}>Ton</p>
              <div className="grid grid-cols-2 gap-2">
                {tones.map(t => (
                  <button key={t} onClick={() => setTone(t)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-left text-[12px] transition ${tone === t ? 'border-[#c0392b] bg-[#c0392b]/10 text-white' : 'border-[#1a1a1a] bg-[#0a0a0a] text-[#555] hover:border-[#2a2a2a] hover:text-[#aaa]'}`}>
                    {tone === t && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0 text-[#c0392b]"><path d="M1.5 5L3.5 7 8.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] text-[#444] tracking-widest uppercase mb-2.5" style={{ fontFamily: "'DM Mono', monospace" }}>Audience cible</p>
              <div className="flex flex-wrap gap-2">
                {audiences.map(a => (
                  <button key={a} onClick={() => setAudience(a)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border transition ${audience === a ? 'border-[#c0392b] bg-[#c0392b]/10 text-white' : 'border-[#1e1e1e] text-[#555] hover:border-[#2a2a2a] hover:text-[#aaa]'}`}>
                    {audience === a && <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5 7.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] text-[#444] tracking-widest uppercase mb-2.5" style={{ fontFamily: "'DM Mono', monospace" }}>Longueur du script</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'short',  label: 'Court',  detail: '3-5 min',   chars: '1k-5k' },
                  { key: 'medium', label: 'Medium', detail: '8-12 min',  chars: '5k-15k' },
                  { key: 'long',   label: 'Long',   detail: '15-20 min', chars: '15k-30k' },
                ].map(l => (
                  <button key={l.key} onClick={() => setLongueur(l.key)}
                    className={`flex flex-col items-start px-3.5 py-3 rounded-xl border text-left transition ${longueur === l.key ? 'border-[#c0392b] bg-[#c0392b]/8' : 'border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#2a2a2a]'}`}>
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-[12px] font-semibold ${longueur === l.key ? 'text-white' : 'text-[#555]'}`}>{l.label}</span>
                      <span className="text-[10px] text-[#333]" style={{ fontFamily: "'DM Mono', monospace" }}>{l.detail}</span>
                    </div>
                    <span className="text-[10px] text-[#333]" style={{ fontFamily: "'DM Mono', monospace" }}>{l.chars} chars</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={genererScript}
              className="w-full flex items-center justify-between px-5 py-4 bg-[#c0392b] hover:bg-[#a93226] rounded-xl transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">{Icon.spark}</div>
                <div className="text-left">
                  <p className="text-[13px] font-semibold text-white">Générer le script complet</p>
                  <p className="text-[11px] text-white/60">Script viral optimisé · {longueur === 'short' ? '3-5 min' : longueur === 'medium' ? '8-12 min' : '15-20 min'}</p>
                </div>
              </div>
              <span className="text-white/70 group-hover:translate-x-0.5 transition-transform">{Icon.arrow}</span>
            </button>

            <button onClick={() => setEtape('saisie')} className="flex items-center gap-2 text-[12px] text-[#444] hover:text-white transition">
              {Icon.arrowLeft} Retour
            </button>
          </div>
        )}

        {/* ── ÉTAPE SCRIPT GÉNÉRÉ ── */}
        {etape === 'script_pret' && (
          <div className="space-y-4">
            {generatingScript ? (
              <div className="flex flex-col items-center gap-5 py-20">
                <div className="w-14 h-14 rounded-2xl bg-[#c0392b]/10 border border-[#c0392b]/20 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#c0392b]/30 border-t-[#c0392b] rounded-full animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-medium text-white mb-1">Génération du script viral...</p>
                  <p className="text-[12px] text-[#444]">Hook · Structure · CTA optimisés</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-emerald-400"><path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="text-[12px] font-medium text-emerald-400">Script prêt</span>
                    <span className="text-[11px] text-emerald-400/60" style={{ fontFamily: "'DM Mono', monospace" }}>
                      {scriptGenere.split(' ').length} mots · ~{Math.ceil(scriptGenere.split(' ').length / 130)} min
                    </span>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(scriptGenere)}
                    className="flex items-center gap-1.5 text-[11px] text-[#555] hover:text-white transition border border-[#222] hover:border-[#333] px-2.5 py-1 rounded-lg">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="1" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.1"/><path d="M3 3V2a1 1 0 011-1h5a1 1 0 011 1v6a1 1 0 01-1 1H8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    Copier
                  </button>
                </div>

                <div className="relative border border-[#1a1a1a] rounded-xl overflow-hidden">
                  <textarea
                    value={scriptGenere}
                    onChange={e => { setScriptGenere(e.target.value); setContenu(e.target.value) }}
                    className="w-full bg-[#0a0a0a] px-4 py-4 text-[12px] text-[#aaa] leading-relaxed focus:outline-none resize-none"
                    rows={14}
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  />
                </div>

                <button
                  onClick={() => {
                    setContenu(scriptGenere)
                    sessionStorage.setItem('piloto_studio_script', scriptGenere)
                    sessionStorage.setItem('piloto_studio_title', titre || 'Nouveau projet')
                    router.push('/dashboard/studio')
                  }}
                  className="w-full flex items-center justify-between px-5 py-4 bg-[#c0392b] hover:bg-[#a93226] rounded-xl transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2" width="13" height="11" rx="1.5" stroke="white" strokeWidth="1.3"/><path d="M5.5 5.5l4 2-4 2V5.5Z" fill="white"/></svg>
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-semibold text-white">Aller dans Piloto Studio</p>
                      <p className="text-[11px] text-white/60">Choisir l'avatar et générer la vidéo</p>
                    </div>
                  </div>
                  <span className="text-white/70 group-hover:translate-x-0.5 transition-transform">{Icon.arrow}</span>
                </button>

                <button onClick={() => setEtape('suggestions')} className="flex items-center gap-2 text-[12px] text-[#444] hover:text-white transition">
                  {Icon.arrowLeft} Ajuster les paramètres
                </button>
              </>
            )}
          </div>
        )}

        {/* ── ÉTAPE SCRIPT DIRECT ── */}
        {etape === 'script_direct' && (
          <div className="space-y-4">
            <Field label="Ton script final">
              <textarea
                value={contenu}
                onChange={e => setContenu(e.target.value)}
                className={`${inputCls} resize-none`}
                rows={12}
                placeholder="Colle ici ton script prêt à tourner..."
              />
              {contenu && (
                <p className="text-[11px] text-[#333] mt-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {contenu.split(' ').length} mots · ~{Math.ceil(contenu.split(' ').length / 130)} min
                </p>
              )}
            </Field>

            <button
              onClick={() => {
                if (!contenu.trim()) return
                sessionStorage.setItem('piloto_studio_script', contenu)
                sessionStorage.setItem('piloto_studio_title', 'Nouveau projet')
                router.push('/dashboard/studio')
              }}
              disabled={!contenu.trim()}
              className="w-full flex items-center justify-between px-5 py-4 bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2" width="13" height="11" rx="1.5" stroke="white" strokeWidth="1.3"/><path d="M5.5 5.5l4 2-4 2V5.5Z" fill="white"/></svg>
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-semibold text-white">Aller dans Piloto Studio</p>
                  <p className="text-[11px] text-white/60">Choisir l'avatar et générer la vidéo</p>
                </div>
              </div>
              <span className="text-white/70 group-hover:translate-x-0.5 transition-transform">{Icon.arrow}</span>
            </button>

            <button onClick={() => setEtape('choix')} className="flex items-center gap-2 text-[12px] text-[#444] hover:text-white transition">
              {Icon.arrowLeft} Retour
            </button>
          </div>
        )}

        {/* ── ÉTAPE AVATAR ── */}
        {etape === 'avatar' && (
          <div style={{ maxWidth: '900px' }}>
            {loadingAssets && (
              <div className="flex items-center gap-3 px-5 py-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl mb-5">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-[#c0392b] border-t-transparent animate-spin flex-shrink-0" />
                <span className="text-[13px] text-[#555]">Chargement de tes avatars HeyGen...</span>
              </div>
            )}
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
            {assetsError && (
              <div className="px-4 py-3 bg-red-500/8 border border-red-500/20 rounded-xl mb-5">
                <p className="text-[12px] text-red-400">{assetsError}</p>
              </div>
            )}
            {avatars.length > 0 && (
              <div className="flex gap-5">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[#444] tracking-widest uppercase mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Avatar</p>
                  <input type="text" value={avatarSearch} onChange={e => setAvatarSearch(e.target.value)} className={`${inputCls} mb-3 text-[12px]`} placeholder="Rechercher..." />
                  {avatars.filter(a => a.type === 'personal').length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-[#c0392b] tracking-widest uppercase mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>✦ Mes avatars</p>
                      <div className="grid grid-cols-2 gap-2">
                        {avatars.filter(a => a.type === 'personal' && (!avatarSearch || a.avatar_name?.toLowerCase().includes(avatarSearch.toLowerCase()))).map(avatar => (
                          <AvatarCard key={avatar.avatar_id} avatar={avatar} selected={avatarId === avatar.avatar_id} onSelect={() => { setAvatarId(avatar.avatar_id); setSelectedAvatarObj(avatar) }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] text-[#333] tracking-widest uppercase mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>Bibliothèque</p>
                  <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1" style={{ maxHeight: '420px' }}>
                    {avatars.filter(a => a.type !== 'personal' && (!avatarSearch || a.avatar_name?.toLowerCase().includes(avatarSearch.toLowerCase()))).map(avatar => (
                      <AvatarCard key={avatar.avatar_id} avatar={avatar} selected={avatarId === avatar.avatar_id} onSelect={() => { setAvatarId(avatar.avatar_id); setSelectedAvatarObj(avatar) }} />
                    ))}
                  </div>
                </div>
                <div style={{ width: '260px', flexShrink: 0 }}>
                  {selectedAvatarObj ? (
                    <div className="mb-4 rounded-xl overflow-hidden border border-[#c0392b]/30 bg-[#0d0d0d]">
                      <div style={{ height: '160px' }} className="relative overflow-hidden bg-[#111]">
                        {selectedAvatarObj.preview_image_url ? <img src={selectedAvatarObj.preview_image_url} alt={selectedAvatarObj.avatar_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-5xl">👤</div>}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 px-3 py-2"><p className="text-[11px] font-semibold text-white truncate">{selectedAvatarObj.avatar_name}</p></div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 rounded-xl border border-dashed border-[#1e1e1e] bg-[#0a0a0a] flex flex-col items-center justify-center gap-2 py-8">
                      <span className="text-3xl text-[#2a2a2a]">👤</span>
                      <p className="text-[11px] text-[#333]">Choisis un avatar</p>
                    </div>
                  )}
                  {voices.length > 0 && (
                    <div>
                      <p className="text-[11px] text-[#444] tracking-widest uppercase mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>Voix</p>
                      <div className="flex gap-1.5 flex-wrap mb-2">
                        {[{ key:'fr', label:'🇫🇷' }, { key:'en', label:'🇺🇸' }, { key:'es', label:'🇪🇸' }, { key:'all', label:'🌍' }].map(f => (
                          <button key={f.key} onClick={() => setVoiceFilter(f.key)} className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${voiceFilter === f.key ? 'border-[#c0392b] bg-[#c0392b]/10 text-[#c0392b]' : 'border-[#1e1e1e] text-[#555] hover:border-[#2a2a2a]'}`}>{f.label}</button>
                        ))}
                      </div>
                      <div className="space-y-1 overflow-y-auto" style={{ maxHeight: '300px' }}>
                        {filteredVoices.slice(0, 60).map(voice => (
                          <button key={voice.voice_id} onClick={() => { setVoiceId(voice.voice_id); setSelectedVoiceObj(voice) }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition ${voiceId === voice.voice_id ? 'border-[#c0392b] bg-[#c0392b]/8' : 'border-[#1a1a1a] bg-[#0d0d0d] hover:border-[#2a2a2a]'}`}>
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${voiceId === voice.voice_id ? 'bg-[#c0392b]/20 text-[#c0392b]' : 'bg-[#161616] text-[#333]'}`}>{Icon.mic}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium text-[#bbb] truncate">{voice.name}</p>
                              <p className="text-[10px] text-[#333]" style={{ fontFamily: "'DM Mono', monospace" }}>{voice.language || voice.locale}</p>
                            </div>
                            {voiceId === voice.voice_id && <div className="w-3.5 h-3.5 rounded-full bg-[#c0392b] flex items-center justify-center flex-shrink-0"><svg width="7" height="7" viewBox="0 0 7 7" fill="none"><path d="M1 3.5L2.5 5 6 1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg></div>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-6">
              <Btn variant="ghost" onClick={() => setEtape(contenu === scriptGenere ? 'script_pret' : 'script_direct')}>{Icon.arrowLeft} Retour</Btn>
              <Btn onClick={() => setEtape('confirmation')} disabled={!avatarId} className="flex-1 justify-center">Continuer {Icon.arrow}</Btn>
            </div>
            {!avatarId && avatars.length > 0 && <p className="text-[11px] text-amber-600 text-center mt-2">Sélectionne un avatar pour continuer</p>}
          </div>
        )}

        {/* ── ÉTAPE CONFIRMATION ── */}
        {etape === 'confirmation' && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-500/8 border border-amber-500/20 rounded-xl">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-amber-400 flex-shrink-0 mt-0.5"><circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 5v3.5M7.5 10v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              <div>
                <p className="text-[12px] text-amber-400 font-medium mb-0.5">Génération uniquement</p>
                <p className="text-[11px] text-amber-400/60 leading-relaxed">La vidéo sera générée et disponible dans ta bibliothèque. Publie sur YouTube manuellement depuis le menu <strong className="text-amber-400/80">···</strong>.</p>
              </div>
            </div>
            <div className="border border-[#1a1a1a] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1a1a1a] bg-[#0a0a0a]">
                <span className="text-[11px] text-[#444] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Récapitulatif</span>
              </div>
              <div className="divide-y divide-[#111]">
                {[
                  { label: 'Avatar', value: selectedAvatarObj?.avatar_name || avatarId || '—' },
                  { label: 'Voix',   value: selectedVoiceObj?.name || voiceId || '—' },
                  { label: 'Script', value: contenu ? `${contenu.split(' ').length} mots` : '—' },
                  { label: 'Titre',  value: titre || "Généré par l'IA" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-[11px] text-[#555]" style={{ fontFamily: "'DM Mono', monospace" }}>{label}</span>
                    <span className="text-[12px] text-[#888] truncate max-w-[200px] text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Btn variant="ghost" onClick={() => setEtape('avatar')}>{Icon.arrowLeft} Retour</Btn>
              <button onClick={lancerGeneration} disabled={loading}
                className="flex-1 flex items-center justify-between px-5 py-4 bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5L9 6H13.5L9.75 8.75L11.25 13.5L7.5 10.75L3.75 13.5L5.25 8.75L1.5 6H6L7.5 1.5Z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/></svg>}
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-semibold text-white">{loading ? 'Lancement...' : 'Générer la vidéo'}</p>
                    <p className="text-[11px] text-white/60">Sans publication automatique</p>
                  </div>
                </div>
                {!loading && <span className="text-white/70 group-hover:translate-x-0.5 transition-transform">{Icon.arrow}</span>}
              </button>
            </div>
          </div>
        )}
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
    await supabase.from('profiles').upsert({
      id: user.id, email: user.email,
      heygen_key: heygenKey,
      default_avatar_id: selectedAvatar?.avatar_id || null,
      default_avatar_name: selectedAvatar?.avatar_name || null,
      default_voice_id: selectedVoice?.voice_id || null,
      default_voice_name: selectedVoice?.name || null,
    })
    setSavingProfile(false)
    setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000)
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
            ✓ Paramètres sauvegardés
          </div>
        )}

        <Section title="Compte">
          <Field label="Email">
            <input type="email" defaultValue={user.email} disabled className={`${inputCls} opacity-40 cursor-not-allowed`} />
          </Field>
        </Section>

        <Section title="Heygen — Clé API & Avatar par défaut">
          <Field label="Clé API Heygen" hint="Trouve ta clé sur heygen.com → Settings → API">
            <div className="flex gap-2">
              <input type="password" value={heygenKey} onChange={e => setHeygenKey(e.target.value)}
                className={`${inputCls} flex-1`} placeholder="sk_..." />
              <button onClick={chargerAssets} disabled={loadingAssets || !heygenKey}
                className="flex items-center gap-2 bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-40 text-white text-[12px] font-medium px-4 py-2.5 rounded-lg transition whitespace-nowrap">
                {loadingAssets ? <span className="animate-pulse">Chargement...</span> : <>{Icon.refresh} Charger</>}
              </button>
            </div>
          </Field>

          {assetsError && (
            <div className="px-4 py-3 bg-red-500/8 border border-red-500/20 rounded-lg">
              <p className="text-[12px] text-red-400">{assetsError}</p>
            </div>
          )}

          {selectedAvatar && avatars.length === 0 && (
            <div className="flex items-center gap-3 bg-[#111] border border-[#222] rounded-xl p-3">
              <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-xl flex-shrink-0">👤</div>
              <div>
                <p className="text-[11px] text-[#888]">Avatar actuel</p>
                <p className="text-[12px] font-medium text-white">{selectedAvatar.avatar_name || selectedAvatar.avatar_id}</p>
              </div>
            </div>
          )}

          {avatars.length > 0 && (
            <Field label={`Avatar par défaut · ${avatars.length}`}>
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
                  </button>
                ))}
              </div>
            </Field>
          )}

          {voices.length > 0 && (
            <Field label={`Voix par défaut · ${voices.length}`}>
              <div className="flex gap-2 flex-wrap mb-3">
                {[{ key:'fr', label:'🇫🇷 FR' }, { key:'en', label:'🇺🇸 EN' }, { key:'es', label:'🇪🇸 ES' }, { key:'all', label:'🌍 Toutes' }].map(f => (
                  <button key={f.key} onClick={() => setVoiceFilter(f.key)}
                    className={`text-[11px] px-3 py-1.5 rounded-lg border transition ${voiceFilter === f.key ? 'border-[#c0392b] bg-[#c0392b]/10 text-[#c0392b]' : 'border-[#1e1e1e] text-[#555] hover:border-[#2a2a2a]'}`}
                    style={{ fontFamily: "'DM Mono', monospace" }}>
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
                      <p className="text-[11px] text-[#444]" style={{ fontFamily: "'DM Mono', monospace" }}>{voice.language || voice.locale}</p>
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
                  <button onClick={() => window.location.href = `/api/auth/youtube?state=${user.id}`}
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