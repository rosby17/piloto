'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap');`

const I = {
  arrowLeft: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 7H2M6 11L2 7l4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevronDown: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  mic: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="4" y="1" width="5" height="7" rx="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M2 6.5a5 5 0 0010 0M6.5 11.5v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  user: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 12c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  play: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2.5l8 4.5-8 4.5V2.5Z" fill="currentColor"/></svg>,
  check: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  spark: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L8.5 5.5H13L9.5 8.25 10.75 13 7 10.5 3.25 13 4.5 8.25 1 5.5H5.5L7 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
  layout: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 5h11M5 5v7" stroke="currentColor" strokeWidth="1.2"/></svg>,
  plus: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  search: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/><path d="M10 10l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
  swap: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 4h11M9 2l3 2-3 2M12 9H1M4 7l-3 2 3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  close: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  film: <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5 3v8M9 3v8M1 6h3M10 6h3M1 9h3M10 9h3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>,
  captions: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="3" width="11" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 6.5h4M3.5 8.5h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
  refresh: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 6.5A4.5 4.5 0 112 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M11 3v3.5h-3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  edit: <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 1.5L11.5 4L4.5 11H2v-2.5L9 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>,
}

function AvatarCardMini({ avatar, selected, onSelect }) {
  return (
    <button onClick={onSelect}
      className={`relative rounded-lg border overflow-hidden text-left transition-all group w-full ${
        selected ? 'border-[#c0392b] ring-1 ring-[#c0392b]/20' : 'border-[#1e1e1e] hover:border-[#2a2a2a]'
      }`}>
      <div className="relative overflow-hidden bg-[#111]" style={{ aspectRatio: '3/4' }}>
        {avatar.preview_image_url
          ? <img src={avatar.preview_image_url} alt={avatar.avatar_name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-2xl text-[#1a1a1a]">👤</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {avatar.type === 'personal' && (
          <div className="absolute top-1.5 left-1.5 bg-[#c0392b] text-white text-[8px] px-1.5 py-0.5 rounded font-semibold tracking-wide">MOI</div>
        )}
        {selected && (
          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#c0392b] flex items-center justify-center">
            {I.check}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5">
          <p className={`text-[9px] font-medium truncate ${selected ? 'text-[#ff6b5a]' : 'text-[#bbb]'}`}>
            {avatar.avatar_name || 'Sans nom'}
          </p>
        </div>
      </div>
    </button>
  )
}

function StudioContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [script, setScript] = useState('')
  const [projectTitle, setProjectTitle] = useState('Nouveau projet')
  const [editingTitle, setEditingTitle] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false) // true = édition vidéo existante

  const [heygenKey, setHeygenKey] = useState('')
  const [avatars, setAvatars] = useState([])
  const [voices, setVoices] = useState([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [avatarSearch, setAvatarSearch] = useState('')
  const [voiceSearch, setVoiceSearch] = useState('')
  const [voiceFilter, setVoiceFilter] = useState('fr')

  const [rightTab, setRightTab] = useState('avatar')
  const [layout, setLayout] = useState('original')

  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [error, setError] = useState('')

  const [defaultAvatarId, setDefaultAvatarId] = useState(null)
  const [defaultVoiceId, setDefaultVoiceId]   = useState(null)
  const [savingDefault, setSavingDefault]      = useState(false)
  const [defaultSaved, setDefaultSaved]        = useState(false)

  const [user, setUser] = useState(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/login'); return }
      setUser(u)

      // ── Lire TOUT le sessionStorage d'abord, puis vider ──
      const storedScript   = sessionStorage.getItem('piloto_studio_script')   || ''
      const storedTitle    = sessionStorage.getItem('piloto_studio_title')    || ''
      const storedVideoId  = sessionStorage.getItem('piloto_studio_video_id') || ''
      const storedAvatarId = sessionStorage.getItem('piloto_studio_avatar_id') || ''
      const storedVoiceId  = sessionStorage.getItem('piloto_studio_voice_id')  || ''
      const urlScript      = searchParams.get('script') || ''
      const urlTitle       = searchParams.get('title')  || ''

      sessionStorage.removeItem('piloto_studio_script')
      sessionStorage.removeItem('piloto_studio_title')
      sessionStorage.removeItem('piloto_studio_video_id')
      sessionStorage.removeItem('piloto_studio_avatar_id')
      sessionStorage.removeItem('piloto_studio_voice_id')

      // Valeurs finales à appliquer
      let finalScript   = storedScript || urlScript || ''
      let finalTitle    = storedTitle  || urlTitle  || 'Nouveau projet'
      let finalAvatarId = storedAvatarId || null
      let finalVoiceId  = storedVoiceId  || null

      // ── Mode édition : charger la vidéo depuis Supabase ──
      if (storedVideoId) {
        setIsEditMode(true)
        const { data: vid } = await supabase
          .from('videos')
          .select('*')
          .eq('id', storedVideoId)
          .single()
        if (vid) {
          // Priorité : champs Supabase > sessionStorage > défauts
          finalScript   = vid.script || vid.contenu || finalScript
          finalTitle    = vid.titre  || finalTitle
          finalAvatarId = vid.avatar_id || finalAvatarId
          finalVoiceId  = vid.voice_id  || finalVoiceId
        }
      }

      // Appliquer script & titre immédiatement
      if (finalScript) setScript(finalScript)
      if (finalTitle)  setProjectTitle(finalTitle)

      // ── Charger assets HeyGen ──
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', u.id).single()
      if (profile?.heygen_key) {
        setHeygenKey(profile.heygen_key)
        setLoadingAssets(true)
        try {
          const res = await fetch('/api/heygen/avatars-voices', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ heygenKey: profile.heygen_key }),
          })
          const data = await res.json()
          const allAvatars = data.avatars || []
          const allVoices  = data.voices  || []
          setAvatars(allAvatars)
          setVoices(allVoices)

          if (profile.default_avatar_id) setDefaultAvatarId(profile.default_avatar_id)
          if (profile.default_voice_id)  setDefaultVoiceId(profile.default_voice_id)

          // Priorité sélection : vidéo éditée > défaut profil > premier dispo
          const avatarToUse =
            (finalAvatarId && allAvatars.find(a => a.avatar_id === finalAvatarId)) ||
            (profile.default_avatar_id && allAvatars.find(a => a.avatar_id === profile.default_avatar_id)) ||
            allAvatars[0] || null

          const voiceToUse =
            (finalVoiceId && allVoices.find(v => v.voice_id === finalVoiceId)) ||
            (profile.default_voice_id && allVoices.find(v => v.voice_id === profile.default_voice_id)) ||
            allVoices[0] || null

          if (avatarToUse) setSelectedAvatar(avatarToUse)
          if (voiceToUse)  setSelectedVoice(voiceToUse)

        } catch (e) { console.error(e) }
        setLoadingAssets(false)
      }
    }
    init()
  }, [])

  const handleGenerate = async () => {
    if (!script.trim() || !selectedAvatar || !selectedVoice) return
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          contenu: script,
          avatarId: selectedAvatar.avatar_id,
          voiceId: selectedVoice.voice_id,
          heygenKey,
          titre: projectTitle,
          scriptDirect: true,
          stopAfterVideo: true,
        })
      })
      const data = await res.json()
      if (data.success) {
        setGenerated(true)
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        setError(data.error || 'Erreur lors de la génération')
      }
    } catch (e) {
      setError(e.message)
    }
    setGenerating(false)
  }

  const saveAsDefault = async () => {
    if (!user || (!selectedAvatar && !selectedVoice)) return
    setSavingDefault(true)
    const updates = {}
    if (selectedAvatar) {
      updates.default_avatar_id   = selectedAvatar.avatar_id
      updates.default_avatar_name = selectedAvatar.avatar_name
      setDefaultAvatarId(selectedAvatar.avatar_id)
    }
    if (selectedVoice) {
      updates.default_voice_id   = selectedVoice.voice_id
      updates.default_voice_name = selectedVoice.name
      setDefaultVoiceId(selectedVoice.voice_id)
    }
    await supabase.from('profiles').update(updates).eq('id', user.id)
    setSavingDefault(false)
    setDefaultSaved(true)
    setTimeout(() => setDefaultSaved(false), 2500)
  }

  const filteredAvatars = avatars.filter(a =>
    !avatarSearch || a.avatar_name?.toLowerCase().includes(avatarSearch.toLowerCase())
  )
  const filteredVoices = voices.filter(v => {
    const matchLang   = voiceFilter === 'all' || v.language?.toLowerCase().includes(voiceFilter) || v.locale?.toLowerCase().includes(voiceFilter)
    const matchSearch = !voiceSearch || v.name?.toLowerCase().includes(voiceSearch.toLowerCase())
    return matchLang && matchSearch
  })

  const wordCount    = script.trim() ? script.trim().split(/\s+/).length : 0
  const estimatedMin = Math.ceil(wordCount / 130)

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
        .fade-in { animation: fadeIn .2s ease forwards; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* ── TOP BAR ── */}
      <header className="h-12 border-b border-[#1a1a1a] flex items-center justify-between px-4 flex-shrink-0 bg-[#080808]">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')}
            className="w-7 h-7 rounded-lg bg-[#141414] hover:bg-[#1e1e1e] border border-[#222] flex items-center justify-center text-[#555] hover:text-white transition">
            {I.arrowLeft}
          </button>
          {/* Badge mode édition */}
          {isEditMode && (
            <div className="flex items-center gap-1.5 text-[10px] text-[#c0392b] border border-[#c0392b]/30 bg-[#c0392b]/8 px-2 py-1 rounded-lg" style={{ fontFamily: "'DM Mono', monospace" }}>
              {I.edit} Édition
            </div>
          )}
          {editingTitle ? (
            <input
              autoFocus
              value={projectTitle}
              onChange={e => setProjectTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
              className="bg-[#1a1a1a] border border-[#c0392b]/40 rounded-lg px-2.5 py-1 text-[13px] text-white focus:outline-none w-52"
              style={{ fontFamily: "'DM Mono', monospace" }}
            />
          ) : (
            <button onClick={() => setEditingTitle(true)}
              className="text-[13px] font-medium text-white hover:text-[#aaa] transition truncate max-w-[200px]"
              style={{ fontFamily: "'DM Mono', monospace" }}>
              {projectTitle}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#444]" style={{ fontFamily: "'DM Mono', monospace" }}>Brand System</span>
          <div className="w-8 h-4 bg-[#c0392b] rounded-full relative cursor-pointer flex items-center px-0.5">
            <div className="w-3 h-3 bg-white rounded-full ml-auto" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {error && <span className="text-[11px] text-red-400 max-w-[200px] truncate">{error}</span>}
          {defaultSaved && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
              {I.check} Défauts sauvegardés
            </div>
          )}
          {generated && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
              {I.check} Envoyé à Heygen
            </div>
          )}
          {!generated && (!selectedAvatar || !selectedVoice || !script.trim()) && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#555] border border-[#1e1e1e] px-2.5 py-1.5 rounded-lg" style={{ fontFamily: "'DM Mono', monospace" }}>
              {!script.trim() ? '⚠ Script vide' : !selectedAvatar ? '⚠ Avatar manquant' : '⚠ Voix manquante'}
            </div>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating || generated || !selectedAvatar || !selectedVoice || !script.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-lg transition-all">
            {generating ? (
              <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Génération...</>
            ) : generated ? (
              <>{I.check} Généré</>
            ) : (
              <>{I.spark} Générer</>
            )}
          </button>
        </div>
      </header>

      {/* ── MAIN 3-COLUMN LAYOUT ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── COLONNE GAUCHE — Script ── */}
        <div className="w-[320px] flex-shrink-0 border-r border-[#1a1a1a] flex flex-col bg-[#090909]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#141414]">
            <span className="text-[11px] text-[#555] tracking-widest uppercase font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>Script</span>
            <div className="flex items-center gap-2 text-[10px] text-[#333]" style={{ fontFamily: "'DM Mono', monospace" }}>
              {wordCount > 0 && <span>{wordCount} mots · ~{estimatedMin} min</span>}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <textarea
              value={script}
              onChange={e => setScript(e.target.value)}
              placeholder="Collez ou écrivez votre script ici..."
              className="w-full h-full bg-transparent px-4 py-4 text-[13px] text-[#ccc] leading-[1.75] placeholder-[#252525] focus:outline-none resize-none"
              style={{ fontFamily: "'DM Sans', sans-serif", minHeight: '100%' }}
            />
          </div>
          <div className="border-t border-[#141414] px-4 py-3">
            <button className="flex items-center gap-2 text-[12px] text-[#444] hover:text-[#888] transition w-full justify-center py-2 border border-dashed border-[#1e1e1e] hover:border-[#2a2a2a] rounded-lg">
              {I.plus} Ajouter une scène
            </button>
          </div>
        </div>

        {/* ── COLONNE CENTRE — Preview ── */}
        <div className="flex-1 flex flex-col bg-[#0c0c0c] overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="relative w-full max-w-[720px]" style={{ aspectRatio: '16/9' }}>
              {selectedAvatar?.preview_image_url ? (
                <div className={`w-full h-full overflow-hidden bg-[#111] ${layout === 'circle' ? 'rounded-full' : 'rounded-2xl'}`}>
                  <img src={selectedAvatar.preview_image_url} alt={selectedAvatar.avatar_name} className="w-full h-full object-cover object-top" />
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="bg-black/70 backdrop-blur-sm px-5 py-2.5 rounded-xl">
                      <p className="text-white text-[16px] font-semibold text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {script.split(' ').slice(0, 5).join(' ')}{script.split(' ').length > 5 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`w-full h-full bg-[#111] border border-[#1e1e1e] flex flex-col items-center justify-center gap-4 ${layout === 'circle' ? 'rounded-full' : 'rounded-2xl'}`}>
                  {loadingAssets ? (
                    <><div className="w-10 h-10 border-2 border-[#c0392b]/30 border-t-[#c0392b] rounded-full animate-spin" /><p className="text-[12px] text-[#444]">Chargement des avatars...</p></>
                  ) : (
                    <><div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#222] flex items-center justify-center text-[#2a2a2a]">{I.user}</div>
                    <div className="text-center"><p className="text-[13px] text-[#444] mb-1">Aucun avatar sélectionné</p><p className="text-[11px] text-[#2a2a2a]">Choisis un avatar dans le panneau de droite</p></div></>
                  )}
                </div>
              )}
              {selectedAvatar && (
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/10 px-2.5 py-1.5 rounded-lg">
                  {selectedAvatar.preview_image_url && <img src={selectedAvatar.preview_image_url} alt="" className="w-5 h-5 rounded-full object-cover object-top" />}
                  <span className="text-[10px] text-white font-medium">{selectedAvatar.avatar_name}</span>
                </div>
              )}
            </div>
          </div>
          <div className="border-t border-[#141414] px-6 py-3 flex items-center gap-4">
            <button className="w-7 h-7 rounded-lg bg-[#c0392b] flex items-center justify-center text-white hover:bg-[#a93226] transition flex-shrink-0">{I.play}</button>
            <div className="flex-1 h-1 bg-[#1a1a1a] rounded-full overflow-hidden"><div className="h-full w-0 bg-[#c0392b] rounded-full" /></div>
            <span className="text-[11px] text-[#333]" style={{ fontFamily: "'DM Mono', monospace" }}>
              00:00 / {estimatedMin > 0 ? `${String(estimatedMin).padStart(2,'0')}:00` : '00:00'}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-14 h-8 rounded-md border border-[#c0392b]/40 overflow-hidden bg-[#111] flex-shrink-0 relative">
                {selectedAvatar?.preview_image_url && <img src={selectedAvatar.preview_image_url} alt="" className="w-full h-full object-cover object-top" />}
                <div className="absolute inset-0 bg-[#c0392b]/10" />
                <div className="absolute bottom-0.5 right-0.5 bg-[#c0392b] text-white text-[7px] px-1 rounded" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {estimatedMin > 0 ? `${estimatedMin}m` : '--'}
                </div>
              </div>
              <button className="w-8 h-8 rounded-md border border-dashed border-[#1e1e1e] hover:border-[#2a2a2a] flex items-center justify-center text-[#2a2a2a] hover:text-[#555] transition">{I.plus}</button>
            </div>
          </div>
        </div>

        {/* ── COLONNE DROITE — Controls ── */}
        <div className="w-[280px] flex-shrink-0 border-l border-[#1a1a1a] flex flex-col bg-[#090909]">
          <div className="flex items-center border-b border-[#141414] px-2 py-2 gap-1">
            {[
              { id: 'avatar',  label: 'Avatar',   icon: I.user },
              { id: 'voice',   label: 'Voix',     icon: I.mic },
              { id: 'layout',  label: 'Layout',   icon: I.layout },
              { id: 'caption', label: 'Captions', icon: I.captions },
            ].map(tab => (
              <button key={tab.id} onClick={() => setRightTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition text-[9px] font-medium tracking-wide ${
                  rightTab === tab.id ? 'bg-[#1a1a1a] text-[#c0392b]' : 'text-[#333] hover:text-[#666] hover:bg-[#111]'
                }`} style={{ fontFamily: "'DM Mono', monospace" }}>
                <span className={rightTab === tab.id ? 'text-[#c0392b]' : 'text-current'}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">

            {/* ── AVATAR TAB ── */}
            {rightTab === 'avatar' && (
              <div className="p-3 space-y-3 fade-in">
                {selectedAvatar && (
                  <div className="bg-[#111] border border-[#c0392b]/20 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                        {selectedAvatar.preview_image_url
                          ? <img src={selectedAvatar.preview_image_url} alt="" className="w-full h-full object-cover object-top" />
                          : <div className="w-full h-full flex items-center justify-center text-[#333]">{I.user}</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[12px] font-medium text-white truncate">{selectedAvatar.avatar_name}</p>
                          {defaultAvatarId === selectedAvatar.avatar_id && (
                            <span className="text-[9px] text-[#c0392b] border border-[#c0392b]/30 px-1.5 py-0.5 rounded font-medium flex-shrink-0" style={{ fontFamily: "'DM Mono', monospace" }}>DÉFAUT</span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#444]" style={{ fontFamily: "'DM Mono', monospace" }}>
                          {selectedAvatar.type === 'personal' ? 'Mon avatar' : 'Bibliothèque'}
                        </p>
                      </div>
                      <button onClick={() => setSelectedAvatar(null)} className="text-[#333] hover:text-[#666] transition flex-shrink-0">{I.close}</button>
                    </div>
                    {defaultAvatarId !== selectedAvatar.avatar_id && (
                      <button onClick={saveAsDefault} disabled={savingDefault}
                        className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-[#1a1a1a] text-[10px] text-[#555] hover:text-[#c0392b] hover:bg-[#c0392b]/5 transition disabled:opacity-40"
                        style={{ fontFamily: "'DM Mono', monospace" }}>
                        {savingDefault ? <div className="w-2.5 h-2.5 border border-[#c0392b]/30 border-t-[#c0392b] rounded-full animate-spin" /> : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}
                        Définir comme avatar par défaut
                      </button>
                    )}
                  </div>
                )}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#333]">{I.search}</span>
                  <input type="text" value={avatarSearch} onChange={e => setAvatarSearch(e.target.value)} placeholder="Rechercher..."
                    className="w-full bg-[#111] border border-[#1e1e1e] rounded-lg pl-8 pr-3 py-2 text-[12px] text-white placeholder-[#2a2a2a] focus:outline-none focus:border-[#2a2a2a]" />
                </div>
                {loadingAssets ? (
                  <div className="flex items-center justify-center py-8 gap-2 text-[#333]">
                    <div className="w-4 h-4 border-2 border-[#c0392b]/30 border-t-[#c0392b] rounded-full animate-spin" />
                    <span className="text-[11px]">Chargement...</span>
                  </div>
                ) : (
                  <>
                    {filteredAvatars.filter(a => a.type === 'personal').length > 0 && (
                      <div>
                        <p className="text-[9px] text-[#c0392b] tracking-widest uppercase mb-2 px-1" style={{ fontFamily: "'DM Mono', monospace" }}>✦ Mes avatars</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {filteredAvatars.filter(a => a.type === 'personal').map(avatar => (
                            <AvatarCardMini key={avatar.avatar_id} avatar={avatar}
                              selected={selectedAvatar?.avatar_id === avatar.avatar_id}
                              onSelect={() => setSelectedAvatar(avatar)} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-[9px] text-[#333] tracking-widest uppercase mb-2 px-1" style={{ fontFamily: "'DM Mono', monospace" }}>Bibliothèque</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {filteredAvatars.filter(a => a.type !== 'personal').map(avatar => (
                          <div key={avatar.avatar_id} className="relative">
                            <AvatarCardMini avatar={avatar}
                              selected={selectedAvatar?.avatar_id === avatar.avatar_id}
                              onSelect={() => setSelectedAvatar(avatar)} />
                            {defaultAvatarId === avatar.avatar_id && (
                              <div className="absolute bottom-5 left-0 right-0 flex justify-center pointer-events-none">
                                <span className="text-[7px] text-[#c0392b] bg-black/80 px-1 py-0.5 rounded" style={{ fontFamily: "'DM Mono', monospace" }}>défaut</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {filteredAvatars.filter(a => a.type !== 'personal').length === 0 && !loadingAssets && (
                        <p className="text-[11px] text-[#2a2a2a] text-center py-4">Aucun avatar trouvé</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── VOICE TAB ── */}
            {rightTab === 'voice' && (
              <div className="p-3 space-y-3 fade-in">
                {selectedVoice && (
                  <div className="bg-[#111] border border-[#c0392b]/20 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#c0392b]/15 flex items-center justify-center text-[#c0392b] flex-shrink-0">{I.mic}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[12px] font-medium text-white truncate">{selectedVoice.name}</p>
                          {defaultVoiceId === selectedVoice.voice_id && (
                            <span className="text-[9px] text-[#c0392b] border border-[#c0392b]/30 px-1.5 py-0.5 rounded font-medium flex-shrink-0" style={{ fontFamily: "'DM Mono', monospace" }}>DÉFAUT</span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#444]" style={{ fontFamily: "'DM Mono', monospace" }}>{selectedVoice.language || selectedVoice.locale}</p>
                      </div>
                      <div className="w-5 h-5 rounded-full bg-[#c0392b] flex items-center justify-center flex-shrink-0">{I.check}</div>
                    </div>
                    {defaultVoiceId !== selectedVoice.voice_id && (
                      <button onClick={saveAsDefault} disabled={savingDefault}
                        className="w-full flex items-center justify-center gap-1.5 py-2 border-t border-[#1a1a1a] text-[10px] text-[#555] hover:text-[#c0392b] hover:bg-[#c0392b]/5 transition disabled:opacity-40"
                        style={{ fontFamily: "'DM Mono', monospace" }}>
                        {savingDefault ? <div className="w-2.5 h-2.5 border border-[#c0392b]/30 border-t-[#c0392b] rounded-full animate-spin" /> : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}
                        Définir comme voix par défaut
                      </button>
                    )}
                  </div>
                )}
                <div className="flex gap-1 flex-wrap">
                  {[{k:'fr',l:'🇫🇷 FR'},{k:'en',l:'🇺🇸 EN'},{k:'es',l:'🇪🇸 ES'},{k:'all',l:'🌍'}].map(f => (
                    <button key={f.k} onClick={() => setVoiceFilter(f.k)}
                      className={`text-[10px] px-2 py-1 rounded-lg border transition ${voiceFilter === f.k ? 'border-[#c0392b] bg-[#c0392b]/10 text-[#c0392b]' : 'border-[#1a1a1a] text-[#444] hover:border-[#222]'}`}
                      style={{ fontFamily: "'DM Mono', monospace" }}>{f.l}</button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#333]">{I.search}</span>
                  <input type="text" value={voiceSearch} onChange={e => setVoiceSearch(e.target.value)} placeholder="Rechercher une voix..."
                    className="w-full bg-[#111] border border-[#1e1e1e] rounded-lg pl-8 pr-3 py-2 text-[12px] text-white placeholder-[#2a2a2a] focus:outline-none focus:border-[#2a2a2a]" />
                </div>
                <div className="space-y-1">
                  {filteredVoices.slice(0, 50).map(voice => (
                    <button key={voice.voice_id} onClick={() => setSelectedVoice(voice)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition ${
                        selectedVoice?.voice_id === voice.voice_id ? 'border-[#c0392b] bg-[#c0392b]/8' : 'border-[#141414] bg-[#0d0d0d] hover:border-[#1e1e1e]'
                      }`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedVoice?.voice_id === voice.voice_id ? 'bg-[#c0392b]/20 text-[#c0392b]' : 'bg-[#141414] text-[#333]'}`}>{I.mic}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-[#bbb] truncate">{voice.name}</p>
                        <p className="text-[10px] text-[#333]" style={{ fontFamily: "'DM Mono', monospace" }}>{voice.language || voice.locale}</p>
                      </div>
                      {selectedVoice?.voice_id === voice.voice_id && (
                        <div className="w-3.5 h-3.5 rounded-full bg-[#c0392b] flex items-center justify-center flex-shrink-0">{I.check}</div>
                      )}
                    </button>
                  ))}
                  {filteredVoices.length === 0 && <p className="text-[11px] text-[#2a2a2a] text-center py-6">Aucune voix trouvée</p>}
                </div>
              </div>
            )}

            {/* ── LAYOUT TAB ── */}
            {rightTab === 'layout' && (
              <div className="p-3 space-y-4 fade-in">
                <div>
                  <p className="text-[10px] text-[#444] tracking-widest uppercase mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>Disposition</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ id: 'original', label: 'Original', preview: 'rounded-lg' }, { id: 'circle', label: 'Circle', preview: 'rounded-full' }].map(l => (
                      <button key={l.id} onClick={() => setLayout(l.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition ${layout === l.id ? 'border-[#c0392b] bg-[#c0392b]/8' : 'border-[#1a1a1a] bg-[#0d0d0d] hover:border-[#2a2a2a]'}`}>
                        <div className={`w-12 h-8 bg-[#1a1a1a] overflow-hidden ${l.preview} border ${layout === l.id ? 'border-[#c0392b]/40' : 'border-[#222]'}`}>
                          {selectedAvatar?.preview_image_url && <img src={selectedAvatar.preview_image_url} alt="" className="w-full h-full object-cover object-top" />}
                        </div>
                        <span className={`text-[11px] ${layout === l.id ? 'text-white' : 'text-[#555]'}`}>{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-[#444] tracking-widest uppercase mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>Motion Engine</p>
                  <div className="flex items-center justify-between px-3 py-2.5 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-amber-400" /></div>
                      <span className="text-[12px] text-[#aaa]">Avatar III</span>
                    </div>
                    {I.chevronDown}
                  </div>
                </div>
              </div>
            )}

            {/* ── CAPTIONS TAB ── */}
            {rightTab === 'caption' && (
              <div className="p-3 space-y-3 fade-in">
                <p className="text-[10px] text-[#444] tracking-widest uppercase mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>Style des captions</p>
                <div className="space-y-2">
                  {['Défaut', 'Bold', 'Minimal', 'Karaoke'].map(style => (
                    <button key={style}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition ${style === 'Défaut' ? 'border-[#c0392b] bg-[#c0392b]/8 text-white' : 'border-[#141414] bg-[#0d0d0d] text-[#555] hover:border-[#1e1e1e]'}`}>
                      <span className="text-[12px]">{style}</span>
                      {style === 'Défaut' && <div className="w-3.5 h-3.5 rounded-full bg-[#c0392b] flex items-center justify-center">{I.check}</div>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#141414] px-3 py-3">
            {!selectedAvatar || !selectedVoice ? (
              <p className="text-[10px] text-[#333] text-center" style={{ fontFamily: "'DM Mono', monospace" }}>
                {!selectedAvatar ? 'Sélectionne un avatar' : 'Sélectionne une voix'}
              </p>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/8 border border-emerald-500/20 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <p className="text-[10px] text-emerald-400" style={{ fontFamily: "'DM Mono', monospace" }}>Prêt à générer</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PilotoStudio() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#c0392b]/30 border-t-[#c0392b] rounded-full animate-spin" />
      </div>
    }>
      <StudioContent />
    </Suspense>
  )
}