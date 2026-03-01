'use client'
import { useState, useEffect, Suspense } from 'react'
import { supabase } from '../../../lib/supabase'

function ParametresContent() {
  const [user, setUser] = useState(null)
  const [heygenKey, setHeygenKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [avatars, setAvatars] = useState([])
  const [voices, setVoices] = useState([])
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [voiceFilter, setVoiceFilter] = useState('fr')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
        loadProfile(user.id)
      }
    })
  }, [])

  const loadProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) {
      setProfile(data)
      if (data.heygen_key) setHeygenKey(data.heygen_key)
      if (data.default_avatar_id) setSelectedAvatar({ avatar_id: data.default_avatar_id, avatar_name: data.default_avatar_name })
      if (data.default_voice_id) setSelectedVoice({ voice_id: data.default_voice_id, name: data.default_voice_name })
    }
  }

  const fetchAvatarsVoices = async () => {
    if (!heygenKey) { setError('Entre ta clé API Heygen'); return }
    setLoadingAssets(true)
    setError('')
    try {
      const res = await fetch('/api/heygen/avatars-voices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heygenKey }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setAvatars(data.avatars || [])
      setVoices(data.voices || [])
    } catch (err) {
      setError('Erreur de connexion')
    }
    setLoadingAssets(false)
  }

  const saveSettings = async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        heygen_key: heygenKey,
        default_avatar_id: selectedAvatar?.avatar_id || null,
        default_avatar_name: selectedAvatar?.avatar_name || null,
        default_voice_id: selectedVoice?.voice_id || null,
        default_voice_name: selectedVoice?.name || null,
      })
      if (err) throw err
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const filteredVoices = voices.filter(v => {
    if (voiceFilter === 'all') return true
    return v.language?.toLowerCase().includes(voiceFilter) ||
           v.locale?.toLowerCase().includes(voiceFilter) ||
           v.name?.toLowerCase().includes(voiceFilter)
  })

  const inputCls = "w-full bg-[#111] border border-[#222] rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder-[#333] focus:outline-none focus:border-[#c0392b] transition"

  const Section = ({ title, children }) => (
    <div className="border border-[#1a1a1a] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <span className="text-[11px] text-[#444] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>{title}</span>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap');`}</style>

      <div className="border-b border-[#1c1c1c] px-10 py-8">
        <p className="text-[11px] text-[#444] tracking-[.15em] uppercase mb-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>Piloto</p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[28px] text-white">Paramètres</h1>
        <p className="text-[13px] text-[#555] mt-1">Configure ton compte, Heygen et tes chaînes YouTube.</p>
      </div>

      <div className="px-10 py-8 max-w-[720px] space-y-5">

        {/* ERREUR */}
        {error && (
          <div className="bg-red-600/10 border border-red-600/30 text-red-400 text-[12px] px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* SUCCÈS */}
        {saved && (
          <div className="bg-green-600/10 border border-green-600/30 text-green-400 text-[12px] px-4 py-3 rounded-xl">
            ✓ Paramètres sauvegardés avec succès
          </div>
        )}

        {/* COMPTE */}
        <Section title="Compte">
          <div>
            <label className="block text-[12px] font-medium text-[#888] mb-2 uppercase tracking-wide" style={{ fontFamily: "'DM Mono', monospace" }}>Email</label>
            <input type="email" defaultValue={user?.email} disabled className={`${inputCls} opacity-40 cursor-not-allowed`} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#888] mb-2 uppercase tracking-wide" style={{ fontFamily: "'DM Mono', monospace" }}>Plan actuel</label>
            <div className="inline-flex items-center gap-2 bg-[#111] border border-[#222] px-3 py-2 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c0392b]" />
              <span className="text-[12px] text-[#888] capitalize" style={{ fontFamily: "'DM Mono', monospace" }}>{profile?.plan || 'gratuit'}</span>
            </div>
          </div>
        </Section>

        {/* HEYGEN */}
        <Section title="Heygen — Clé API">
          <div>
            <label className="block text-[12px] font-medium text-[#888] mb-2 uppercase tracking-wide" style={{ fontFamily: "'DM Mono', monospace" }}>Clé API Heygen</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={heygenKey}
                onChange={e => setHeygenKey(e.target.value)}
                className={`${inputCls} flex-1`}
                placeholder="sk_..."
              />
              <button
                onClick={fetchAvatarsVoices}
                disabled={loadingAssets || !heygenKey}
                className="flex items-center gap-2 bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-40 text-white text-[12px] font-medium px-4 py-2.5 rounded-lg transition whitespace-nowrap"
              >
                {loadingAssets ? (
                  <span className="animate-pulse">Chargement...</span>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 7A5 5 0 112 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M12 3v4h-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Charger mes avatars
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-[#333] mt-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>Trouve ta clé sur heygen.com → Settings → API</p>
          </div>
        </Section>

        {/* SÉLECTEUR AVATAR */}
        {avatars.length > 0 && (
          <Section title={`Avatars disponibles · ${avatars.length}`}>
            <p className="text-[12px] text-[#555]">Choisis l'avatar par défaut pour tes vidéos</p>

            {selectedAvatar && (
              <div className="flex items-center gap-3 bg-[#c0392b]/10 border border-[#c0392b]/30 rounded-xl p-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#c0392b]/20 border border-[#c0392b]/30 overflow-hidden flex-shrink-0">
                  {selectedAvatar.preview_image_url ? (
                    <img src={selectedAvatar.preview_image_url} alt={selectedAvatar.avatar_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#c0392b] text-[16px]">👤</div>
                  )}
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#c0392b]">✓ Sélectionné</p>
                  <p className="text-[11px] text-[#888]">{selectedAvatar.avatar_name}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
              {avatars.map((avatar, i) => (
                <button
                  key={avatar.avatar_id || i}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-left transition ${
                    selectedAvatar?.avatar_id === avatar.avatar_id
                      ? 'border-[#c0392b] bg-[#c0392b]/10'
                      : 'border-[#1e1e1e] bg-[#111] hover:border-[#2a2a2a]'
                  }`}
                >
                  <div className="w-full h-20 rounded-lg overflow-hidden bg-[#1a1a1a]">
                    {avatar.preview_image_url ? (
                      <img src={avatar.preview_image_url} alt={avatar.avatar_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                    )}
                  </div>
                  <p className="text-[11px] text-[#888] text-center leading-tight truncate w-full">
                    {avatar.avatar_name || avatar.avatar_id}
                  </p>
                  {selectedAvatar?.avatar_id === avatar.avatar_id && (
                    <div className="w-4 h-4 rounded-full bg-[#c0392b] flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5 6.5 2" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* SÉLECTEUR VOIX */}
        {voices.length > 0 && (
          <Section title={`Voix disponibles · ${voices.length}`}>
            <p className="text-[12px] text-[#555]">Choisis la voix par défaut pour tes vidéos</p>

            {selectedVoice && (
              <div className="flex items-center gap-3 bg-[#c0392b]/10 border border-[#c0392b]/30 rounded-xl p-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#c0392b]/20 border border-[#c0392b]/30 flex items-center justify-center text-[#c0392b] text-xl flex-shrink-0">
                  🎙️
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#c0392b]">✓ Sélectionnée</p>
                  <p className="text-[11px] text-[#888]">{selectedVoice.name} · {selectedVoice.language}</p>
                </div>
              </div>
            )}

            {/* Filtre par langue */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'fr', label: '🇫🇷 Français' },
                { key: 'en', label: '🇺🇸 Anglais' },
                { key: 'es', label: '🇪🇸 Espagnol' },
                { key: 'all', label: '🌍 Toutes' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setVoiceFilter(f.key)}
                  className={`text-[11px] px-3 py-1.5 rounded-lg border transition ${
                    voiceFilter === f.key
                      ? 'border-[#c0392b] bg-[#c0392b]/10 text-[#c0392b]'
                      : 'border-[#1e1e1e] text-[#555] hover:border-[#2a2a2a] hover:text-[#888]'
                  }`}
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {f.label}
                </button>
              ))}
              <span className="text-[11px] text-[#333] self-center" style={{ fontFamily: "'DM Mono', monospace" }}>
                {filteredVoices.length} voix
              </span>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {filteredVoices.slice(0, 50).map((voice, i) => (
                <button
                  key={voice.voice_id || i}
                  onClick={() => setSelectedVoice(voice)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left transition ${
                    selectedVoice?.voice_id === voice.voice_id
                      ? 'border-[#c0392b] bg-[#c0392b]/8'
                      : 'border-[#1a1a1a] bg-[#0d0d0d] hover:border-[#2a2a2a]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[14px] flex-shrink-0 ${
                    selectedVoice?.voice_id === voice.voice_id ? 'bg-[#c0392b]/20' : 'bg-[#161616]'
                  }`}>
                    🎙️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#ccc] truncate">{voice.name}</p>
                    <p className="text-[11px] text-[#444]" style={{ fontFamily: "'DM Mono', monospace" }}>
                      {voice.language || voice.locale} · {voice.gender || 'N/A'}
                    </p>
                  </div>
                  {selectedVoice?.voice_id === voice.voice_id && (
                    <div className="w-4 h-4 rounded-full bg-[#c0392b] flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5 6.5 2" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* BOUTON SAUVEGARDER */}
        <button
          onClick={saveSettings}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-40 text-white font-medium py-3.5 rounded-xl transition text-[14px]"
        >
          {loading ? 'Sauvegarde...' : '✓ Sauvegarder les paramètres'}
        </button>

      </div>
    </div>
  )
}

export default function Parametres() {
  return (
    <Suspense fallback={<div className="text-white p-10">Chargement...</div>}>
      <ParametresContent />
    </Suspense>
  )
}