// app/dashboard/components/MesVideos.jsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import Icon from './ui/icons'
import { Btn, PageHeader, VideoDurationBadge } from './ui/shared'
import { timeAgo, STATUTS_EN_COURS, getStatusLabel, getStatusOverlay } from './ui/utils'

export default function MesVideos({ user, onNouvelleVideo }) {
  const router = useRouter()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingVideo, setEditingVideo] = useState(null)
  const [editTitre, setEditTitre] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })
  const [renamingVideo, setRenamingVideo] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [playingVideo, setPlayingVideo] = useState(null)
  const intervalRef = useRef(null)
  const pollingRef = useRef({})
  const tickRef = useRef(null)

  const inputCls = "w-full bg-[#111] border border-[#222] rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder-[#333] focus:outline-none focus:border-[#c0392b] transition"

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

  const startPolling = (video) => {
    const pollId = setInterval(async () => {
      try {
        const res = await fetch('/api/heygen/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: video.id, heygenVideoId: video.heygen_video_id }),
        })
        const data = await res.json()
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(pollingRef.current[video.id])
          delete pollingRef.current[video.id]
          fetchVideos()
        }
      } catch (err) { console.error('Polling error:', err) }
    }, 15000)
    pollingRef.current[video.id] = pollId
  }

  useEffect(() => {
    fetchVideos()
    intervalRef.current = setInterval(fetchVideos, 10000)
    tickRef.current = setInterval(() => {}, 30000)
    return () => {
      clearInterval(intervalRef.current)
      clearInterval(tickRef.current)
      Object.values(pollingRef.current).forEach(clearInterval)
      pollingRef.current = {}
    }
  }, [])

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

  const isEnCours = (v) => STATUTS_EN_COURS.includes(v.statut)
  const hasActive = videos.some(v => !['publiee', 'erreur', 'programmee', 'script_pret', 'upload_youtube'].includes(v.statut))

  const ThumbnailPlaceholder = ({ statut }) => {
    const overlay = getStatusOverlay(statut)
    return (
      <div className="w-full h-full relative bg-[#0d0d0d] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#141414] to-[#080808]" />
        {overlay.glowColor && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full blur-2xl opacity-25" style={{ background: overlay.glowColor }} />
        )}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
        <div className="relative flex flex-col items-center gap-2.5">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${overlay.bg || 'bg-[#111] border-[#1e1e1e]'}`}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="3" width="16" height="12" rx="2" stroke="#2a2a2a" strokeWidth="1.3"/><path d="M7 6.5l5 2.5-5 2.5V6.5Z" fill="#2a2a2a"/></svg>
          </div>
          {overlay.pulse && (
            <div className="flex items-center gap-1">
              {[0, 0.15, 0.3].map((delay, i) => (
                <div key={i} className={`w-1 h-1 rounded-full pulse-dot ${overlay.dot}`} style={{ animationDelay: `${delay}s` }} />
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
    <div className="flex flex-col flex-1 overflow-hidden">
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

      <div className="px-10 py-8 overflow-y-auto flex-1">

        {/* Modal lecteur */}
        {playingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setPlayingVideo(null)}>
            <div className="relative w-full max-w-4xl mx-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-[13px] font-medium text-white truncate pr-4">{playingVideo.titre || 'Vidéo'}</p>
                <button onClick={() => setPlayingVideo(null)} className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#666] hover:text-white transition flex-shrink-0">{Icon.close}</button>
              </div>
              <video src={playingVideo.url} controls autoPlay className="w-full rounded-xl border border-[#2a2a2a] bg-black shadow-2xl" style={{ maxHeight: '72vh' }} />
              <div className="flex items-center justify-between mt-3 px-1">
                <p className="text-[11px] text-[#444]" style={{ fontFamily: "'DM Mono', monospace" }}>Appuie sur Échap ou clique en dehors pour fermer</p>
                <a href={playingVideo.url} download onClick={e => e.stopPropagation()} className="flex items-center gap-2 text-[12px] text-[#555] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-2 rounded-lg transition">{Icon.download} Télécharger</a>
              </div>
            </div>
          </div>
        )}

        {/* Modal édition */}
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
                <Btn onClick={sauvegarderEdit} disabled={saving} className="flex-1 justify-center">{saving ? 'Sauvegarde...' : '✓ Sauvegarder'}</Btn>
              </div>
            </div>
          </div>
        )}

        {/* Modal renommer */}
        {renamingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#0e0e0e] border border-[#222] rounded-2xl p-6 w-full max-w-sm mx-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[18px] text-white">Renommer</h3>
                <button onClick={() => setRenamingVideo(null)} className="text-[#444] hover:text-white transition">{Icon.close}</button>
              </div>
              <input type="text" value={renameValue} onChange={e => setRenameValue(e.target.value)}
                onKeyDown={async e => {
                  if (e.key === 'Enter' && renameValue.trim()) {
                    await supabase.from('videos').update({ titre: renameValue.trim() }).eq('id', renamingVideo.id)
                    setRenamingVideo(null); fetchVideos()
                  }
                }}
                className={inputCls} placeholder="Nouveau titre..." autoFocus />
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

        {/* Menu contextuel */}
        {openMenuId && (() => {
          const v = videos.find(vid => vid.id === openMenuId)
          if (!v) return null
          const enCours = isEnCours(v)
          return (
            <>
              <div className="fixed inset-0 z-[998]" onClick={() => setOpenMenuId(null)} />
              <div className="fixed z-[999] w-56 bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl shadow-black/80 py-1"
                style={{ right: window.innerWidth - menuPos.x, top: menuPos.y - 8, transform: 'translateY(-100%)' }}
                onClick={e => e.stopPropagation()}>
                <div className="px-3.5 py-2 border-b border-[#1e1e1e] mb-1">
                  <p className="text-[10px] text-[#555] truncate" style={{ fontFamily: "'DM Mono', monospace" }}>{v.titre || 'Vidéo'}</p>
                </div>
                {enCours ? (
                  <div className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-[#333] cursor-not-allowed select-none">{Icon.lock}<span>Génération en cours...</span></div>
                ) : (
                  <button onClick={() => {
                    setOpenMenuId(null)
                    sessionStorage.setItem('piloto_studio_video_id', v.id)
                    sessionStorage.setItem('piloto_studio_script', v.script || v.contenu || '')
                    sessionStorage.setItem('piloto_studio_title', v.titre || '')
                    sessionStorage.setItem('piloto_studio_avatar_id', v.avatar_id || '')
                    sessionStorage.setItem('piloto_studio_voice_id', v.voice_id || '')
                    router.push('/dashboard/studio')
                  }} className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-[#c0392b] hover:text-white hover:bg-[#1e1e1e] transition w-full text-left font-medium">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 1.5L10.5 3.5L4 10L1.5 10.5L2 8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                    Éditer dans Studio
                  </button>
                )}
                <div className="border-t border-[#1e1e1e] my-1" />
                {v.thumbnail_url ? (
                  <button onClick={() => { setPlayingVideo({ url: v.thumbnail_url, titre: v.titre }); setOpenMenuId(null) }} className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-emerald-400 hover:text-white hover:bg-[#1e1e1e] transition w-full text-left font-medium">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 4.5l5 2.5-5 2.5V4.5Z" fill="currentColor"/></svg>
                    Lire la vidéo
                  </button>
                ) : (
                  <div className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-[#333] cursor-not-allowed select-none">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 4.5l5 2.5-5 2.5V4.5Z" fill="currentColor"/></svg>
                    Vidéo en cours...
                  </div>
                )}
                {v.thumbnail_url
                  ? <a href={v.thumbnail_url} download onClick={() => setOpenMenuId(null)} className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-[#bbb] hover:text-white hover:bg-[#1e1e1e] transition cursor-pointer">{Icon.download} Télécharger</a>
                  : <div className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-[#333] cursor-not-allowed select-none">{Icon.download} Télécharger (en cours...)</div>
                }
                {v.youtube_video_id
                  ? <a href={`https://youtube.com/watch?v=${v.youtube_video_id}`} target="_blank" rel="noopener noreferrer" onClick={() => setOpenMenuId(null)} className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-[#bbb] hover:text-white hover:bg-[#1e1e1e] transition cursor-pointer">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 5L9 7L5.5 9V5Z" fill="currentColor"/></svg>
                      Voir sur YouTube
                    </a>
                  : <div className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-[#333] cursor-not-allowed select-none">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 5L9 7L5.5 9V5Z" fill="currentColor"/></svg>
                      Publier sur YouTube
                    </div>
                }
                <div className="border-t border-[#1e1e1e] my-1" />
                <button onClick={() => { setRenamingVideo(v); setRenameValue(v.titre || ''); setOpenMenuId(null) }} className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-[#bbb] hover:text-white hover:bg-[#1e1e1e] transition w-full text-left">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 11h2.5L11 4.5a1.4 1.4 0 00-2-2L2.5 9V11Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/><path d="M9 2.5l2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  Renommer
                </button>
                <button onClick={() => { ouvrirEdit(v); setOpenMenuId(null) }} className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-[#bbb] hover:text-white hover:bg-[#1e1e1e] transition w-full text-left">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 7h4M7 5v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  Modifier titre/desc
                </button>
                <div className="border-t border-[#1e1e1e] my-1" />
                <button onClick={() => { supprimerVideo(v.id); setOpenMenuId(null) }} disabled={deletingId === v.id} className="flex items-center gap-3 px-3.5 py-2.5 text-[12px] text-red-400/70 hover:text-red-400 hover:bg-red-500/8 transition w-full text-left disabled:opacity-30">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V3a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v4.5M8.5 6v4.5M3.5 4l.5 7a.5.5 0 00.5.5h5a.5.5 0 00.5-.5l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {deletingId === v.id ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </>
          )
        })()}

        {/* Grille vidéos */}
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
              const isError = v.statut === 'erreur'
              const isDraft = v.statut === 'script_pret'
              const isReady = v.statut === 'upload_youtube'
              const isMenuOpen = openMenuId === v.id
              const enCours = isEnCours(v)

              return (
                <div key={v.id} className="group relative flex flex-col rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#2a2a2a] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40">
                  <div className="relative rounded-t-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    {isReady && v.thumbnail_url ? (
                      <button onClick={() => setPlayingVideo({ url: v.thumbnail_url, titre: v.titre })} className="block w-full h-full group/play relative">
                        <video src={v.thumbnail_url} className="w-full h-full object-cover" muted preload="metadata" onMouseEnter={e => { e.currentTarget.currentTime = 1 }} />
                        <div className="absolute inset-0 bg-black/30 group-hover/play:bg-black/50 transition-all duration-200 flex items-center justify-center">
                          <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center group-hover/play:scale-110 transition-all duration-200">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M6 3.5l9 5.5-9 5.5V3.5Z" fill="white"/></svg>
                          </div>
                        </div>
                        <VideoDurationBadge src={v.thumbnail_url} />
                      </button>
                    ) : v.thumbnail_url ? (
                      <img src={v.thumbnail_url} alt={v.titre} className="w-full h-full object-cover" />
                    ) : (
                      <ThumbnailPlaceholder statut={v.statut} />
                    )}
                    {isActive && (
                      <div className={`absolute inset-0 border flex items-center justify-center ${overlay.bg}`}>
                        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3.5 py-2 flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full pulse-dot flex-shrink-0 ${overlay.dot}`} />
                          <span className="text-[11px] text-white font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>{overlay.label}</span>
                        </div>
                      </div>
                    )}
                    {isDraft && !isActive && <div className="absolute top-2 left-2 bg-[#1a1a1a]/90 backdrop-blur-sm border border-[#333] text-[#888] text-[10px] px-2.5 py-1 rounded-lg font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>Draft</div>}
                    {isError && <div className="absolute top-2 left-2 bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-400 text-[10px] px-2.5 py-1 rounded-lg font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>Erreur</div>}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      {enCours ? (
                        <div className="w-7 h-7 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-[#444] cursor-not-allowed">{Icon.lock}</div>
                      ) : (
                        <button onClick={e => {
                          e.stopPropagation()
                          sessionStorage.setItem('piloto_studio_video_id', v.id)
                          sessionStorage.setItem('piloto_studio_script', v.script || v.contenu || '')
                          sessionStorage.setItem('piloto_studio_title', v.titre || '')
                          sessionStorage.setItem('piloto_studio_avatar_id', v.avatar_id || '')
                          sessionStorage.setItem('piloto_studio_voice_id', v.voice_id || '')
                          router.push('/dashboard/studio')
                        }} className="w-7 h-7 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-[#ccc] hover:text-white transition">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5L10.5 3.5L4 10L1.5 10.5L2 8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="px-3 py-2.5 flex flex-col gap-1.5 flex-1">
                    <p className="text-[12px] font-medium text-white leading-snug line-clamp-2" style={{ minHeight: '34px' }}>
                      {v.titre || <span className="text-[#2a2a2a] italic font-normal">Titre en génération...</span>}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span className="text-[10px] text-[#2a2a2a]" style={{ fontFamily: "'DM Mono', monospace" }}>{timeAgo(v.created_at)}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${overlay.badge}`} style={{ fontFamily: "'DM Mono', monospace" }}>
                          {overlay.pulse && <span className={`w-1 h-1 rounded-full pulse-dot flex-shrink-0 ${overlay.dot}`} />}
                          {getStatusLabel(v.statut)}
                        </span>
                        <button onClick={e => {
                          e.stopPropagation()
                          if (isMenuOpen) { setOpenMenuId(null); return }
                          const rect = e.currentTarget.getBoundingClientRect()
                          setMenuPos({ x: rect.right, y: rect.top })
                          setOpenMenuId(v.id)
                        }} className={`w-6 h-6 rounded-md flex items-center justify-center transition ${isMenuOpen ? 'bg-[#2a2a2a] text-white' : 'text-[#444] hover:text-[#aaa] hover:bg-[#1a1a1a]'}`}>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="2.5" cy="6.5" r="1" fill="currentColor"/><circle cx="6.5" cy="6.5" r="1" fill="currentColor"/><circle cx="10.5" cy="6.5" r="1" fill="currentColor"/></svg>
                        </button>
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