// app/dashboard/components/Parametres.jsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import Icon from './ui/icons'
import { Btn, Field, PageHeader, AvatarCard, Section } from './ui/shared'
import { inputCls } from './ui/utils'

export default function Parametres({ user }) {
  const [profile, setProfile]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)

  // Champs profil
  const [nom, setNom]                 = useState('')
  const [channelName, setChannelName] = useState('')
  const [channelDesc, setChannelDesc] = useState('')
  const [niche, setNiche]             = useState('')

  // Avatar & voix par défaut
  const [avatars, setAvatars]         = useState([])
  const [voices, setVoices]           = useState([])
  const [defaultAvatarId, setDefaultAvatarId] = useState('')
  const [defaultVoiceId, setDefaultVoiceId]   = useState('')
  const [selectedAvatarObj, setSelectedAvatarObj] = useState(null)
  const [selectedVoiceObj, setSelectedVoiceObj]   = useState(null)
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [voiceFilter, setVoiceFilter]     = useState('fr')
  const [avatarSearch, setAvatarSearch]   = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (prof) {
        setProfile(prof)
        setNom(prof.full_name || '')
        setChannelName(prof.youtube_channel_name || '')
        setChannelDesc(prof.youtube_channel_description || '')
        setNiche(prof.niche || '')
        setDefaultAvatarId(prof.default_avatar_id || '')
        setDefaultVoiceId(prof.default_voice_id || '')
        if (prof.default_avatar_id) {
          setSelectedAvatarObj({ avatar_id: prof.default_avatar_id, avatar_name: prof.default_avatar_name, preview_image_url: null })
        }
        if (prof.default_voice_id) {
          setSelectedVoiceObj({ voice_id: prof.default_voice_id, name: prof.default_voice_name })
        }
      }

      // Chargement avatars / voix
      try {
        setLoadingAssets(true)
        const res = await fetch('/api/heygen/avatars-voices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
        const data = await res.json()
        if (data.avatars) setAvatars(data.avatars)
        if (data.voices)  setVoices(data.voices)
      } catch (err) {
        console.error('Erreur chargement assets:', err)
      } finally {
        setLoadingAssets(false)
      }

      setLoading(false)
    }
    load()
  }, [])

  const sauvegarder = async () => {
    setSaving(true)
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: nom,
      youtube_channel_name: channelName,
      youtube_channel_description: channelDesc,
      niche,
      default_avatar_id:   defaultAvatarId   || null,
      default_avatar_name: selectedAvatarObj?.avatar_name || null,
      default_voice_id:    defaultVoiceId     || null,
      default_voice_name:  selectedVoiceObj?.name || null,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const filteredVoices = voices.filter(v => {
    if (voiceFilter === 'all') return true
    return v.language?.toLowerCase().includes(voiceFilter) || v.locale?.toLowerCase().includes(voiceFilter)
  })

  const niches = [
    'Health & Wellness', 'Finance & Money', 'Personal Development',
    'Nutrition & Diet', 'Mental Health', 'Fitness & Sport',
    'Technology', 'Spirituality', 'Relationships', 'Business',
  ]

  if (loading) return (
    <div>
      <PageHeader title="Paramètres" />
      <div className="px-10 py-12 flex items-center gap-3 text-[#333]">
        <div className="w-4 h-4 rounded-full border-2 border-[#c0392b] border-t-transparent animate-spin" />
        <span className="text-[12px]" style={{ fontFamily: "'DM Mono', monospace" }}>Chargement...</span>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <PageHeader
        title="Paramètres"
        sub="Profil, chaîne YouTube et préférences de génération"
        action={
          <Btn onClick={sauvegarder} disabled={saving}>
            {saving ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sauvegarde...</>
            ) : saved ? (
              <>{Icon.check} Sauvegardé !</>
            ) : (
              <>✓ Sauvegarder</>
            )}
          </Btn>
        }
      />

      <div className="px-10 py-8 overflow-y-auto flex-1 space-y-6 max-w-[760px]">

        {/* ── Profil ── */}
        <Section title="Profil">
          <Field label="Nom complet">
            <input
              type="text"
              value={nom}
              onChange={e => setNom(e.target.value)}
              className={inputCls}
              placeholder="Ton nom ou pseudonyme"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={user.email}
              disabled
              className={`${inputCls} opacity-40 cursor-not-allowed`}
            />
          </Field>
        </Section>

        {/* ── Chaîne YouTube ── */}
        <Section title="Chaîne YouTube">
          <Field label="Nom de la chaîne">
            <input
              type="text"
              value={channelName}
              onChange={e => setChannelName(e.target.value)}
              className={inputCls}
              placeholder="Ex: Health Tips with Marie"
            />
          </Field>
          <Field label="Description" optional>
            <textarea
              value={channelDesc}
              onChange={e => setChannelDesc(e.target.value)}
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Décris ta chaîne en quelques mots..."
            />
          </Field>
          <Field label="Niche principale">
            <div className="flex flex-wrap gap-2 mt-1">
              {niches.map(n => (
                <button
                  key={n}
                  onClick={() => setNiche(n)}
                  className={`px-3 py-1.5 rounded-full text-[12px] border transition ${
                    niche === n
                      ? 'border-[#c0392b] bg-[#c0392b]/10 text-white'
                      : 'border-[#1e1e1e] text-[#555] hover:border-[#2a2a2a] hover:text-[#888]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* ── Avatar & Voix par défaut ── */}
        <Section title="Avatar & Voix par défaut">
          {loadingAssets && (
            <div className="flex items-center gap-3 text-[#333] py-2">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-[#c0392b] border-t-transparent animate-spin" />
              <span className="text-[12px]">Chargement des avatars et voix...</span>
            </div>
          )}

          {!loadingAssets && avatars.length > 0 && (
            <div className="grid grid-cols-[1fr_240px] gap-5">

              {/* Avatars */}
              <div>
                <p className="text-[11px] text-[#444] tracking-widests uppercase mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Avatar</p>
                <input
                  type="text"
                  value={avatarSearch}
                  onChange={e => setAvatarSearch(e.target.value)}
                  className={`${inputCls} mb-3 text-[12px]`}
                  placeholder="Rechercher un avatar..."
                />

                {/* Mes avatars */}
                {avatars.filter(a => a.type === 'personal').length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] text-[#c0392b] tracking-widests uppercase mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>✦ Mes avatars</p>
                    <div className="grid grid-cols-3 gap-2">
                      {avatars
                        .filter(a => a.type === 'personal' && (!avatarSearch || a.avatar_name?.toLowerCase().includes(avatarSearch.toLowerCase())))
                        .map(avatar => (
                          <AvatarCard
                            key={avatar.avatar_id}
                            avatar={avatar}
                            selected={defaultAvatarId === avatar.avatar_id}
                            onSelect={() => { setDefaultAvatarId(avatar.avatar_id); setSelectedAvatarObj(avatar) }}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Avatars HeyGen */}
                <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-1" style={{ maxHeight: '380px' }}>
                  {avatars
                    .filter(a => a.type !== 'personal' && (!avatarSearch || a.avatar_name?.toLowerCase().includes(avatarSearch.toLowerCase())))
                    .map(avatar => (
                      <AvatarCard
                        key={avatar.avatar_id}
                        avatar={avatar}
                        selected={defaultAvatarId === avatar.avatar_id}
                        onSelect={() => { setDefaultAvatarId(avatar.avatar_id); setSelectedAvatarObj(avatar) }}
                      />
                    ))}
                </div>
              </div>

              {/* Voix */}
              <div>
                <p className="text-[11px] text-[#444] tracking-widests uppercase mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Voix</p>

                {selectedVoiceObj && (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#c0392b]/8 border border-[#c0392b]/20 rounded-xl mb-3">
                    <div className="w-7 h-7 rounded-md bg-[#c0392b]/20 flex items-center justify-center text-[#c0392b]">{Icon.mic}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-white truncate">{selectedVoiceObj.name}</p>
                      <p className="text-[10px] text-[#555]">{selectedVoiceObj.language || selectedVoiceObj.locale}</p>
                    </div>
                  </div>
                )}

                {/* Filtres */}
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {[
                    { key: 'fr',  label: '🇫🇷' },
                    { key: 'en',  label: '🇺🇸' },
                    { key: 'es',  label: '🇪🇸' },
                    { key: 'all', label: '🌍' },
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setVoiceFilter(f.key)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                        voiceFilter === f.key
                          ? 'border-[#c0392b] bg-[#c0392b]/10 text-[#c0392b]'
                          : 'border-[#1e1e1e] text-[#555]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-1 overflow-y-auto rounded-xl border border-[#1a1a1a]" style={{ maxHeight: '400px' }}>
                  {filteredVoices.slice(0, 60).map(voice => (
                    <button
                      key={voice.voice_id}
                      onClick={() => { setDefaultVoiceId(voice.voice_id); setSelectedVoiceObj(voice) }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 border-b border-[#111] text-left transition last:border-0 ${
                        defaultVoiceId === voice.voice_id
                          ? 'bg-[#c0392b]/8'
                          : 'hover:bg-[#0f0f0f]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                        defaultVoiceId === voice.voice_id ? 'bg-[#c0392b]/20 text-[#c0392b]' : 'bg-[#161616] text-[#333]'
                      }`}>
                        {Icon.mic}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-medium truncate ${defaultVoiceId === voice.voice_id ? 'text-white' : 'text-[#888]'}`}>
                          {voice.name}
                        </p>
                        <p className="text-[10px] text-[#333]">{voice.language || voice.locale}</p>
                      </div>
                      {defaultVoiceId === voice.voice_id && (
                        <span className="text-[#c0392b] flex-shrink-0">{Icon.check}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ── Compte ── */}
        <Section title="Compte">
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-[13px] text-white mb-0.5">Supprimer mon compte</p>
              <p className="text-[11px] text-[#444]">Action irréversible — toutes tes données seront effacées</p>
            </div>
            <button className="text-[12px] text-red-400/60 hover:text-red-400 border border-red-500/10 hover:border-red-500/30 px-3.5 py-2 rounded-lg transition">
              Supprimer
            </button>
          </div>
        </Section>

        {/* Bouton save bas de page */}
        <div className="flex justify-end pb-6">
          <Btn onClick={sauvegarder} disabled={saving}>
            {saving ? (
              <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sauvegarde...</>
            ) : saved ? (
              <>{Icon.check} Sauvegardé !</>
            ) : (
              <>✓ Sauvegarder les modifications</>
            )}
          </Btn>
        </div>

      </div>
    </div>
  )
}