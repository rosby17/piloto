// app/dashboard/components/VoixOff.jsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import Icon from './ui/icons'
import { Btn, Field, PageHeader } from './ui/shared'
import { inputCls } from './ui/utils'

export default function VoixOff({ user }) {
  const [texte, setTexte] = useState('')
  const [voices, setVoices] = useState([])
  const [voiceId, setVoiceId] = useState('')
  const [voiceFilter, setVoiceFilter] = useState('fr')
  const [generating, setGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioName, setAudioName] = useState('')
  const [error, setError] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    const loadVoices = async () => {
      try {
        const res = await fetch('/api/heygen/avatars-voices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
        const data = await res.json()
        if (data.voices) setVoices(data.voices)
      } catch (err) {
        console.error('Erreur chargement voix:', err)
      }
    }
    loadVoices()
  }, [])

  const filteredVoices = voices.filter(v => {
    if (voiceFilter === 'all') return true
    return v.language?.toLowerCase().includes(voiceFilter) || v.locale?.toLowerCase().includes(voiceFilter)
  })

  const generer = async () => {
    if (!texte.trim() || !voiceId) return
    setGenerating(true)
    setError(null)
    setAudioUrl(null)

    try {
      const res = await fetch('/api/heygen/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texte, voiceId }),
      })
      const data = await res.json()
      if (data.url) {
        setAudioUrl(data.url)
        setAudioName(`voix-off-${Date.now()}.mp3`)
      } else {
        setError(data.error || 'Erreur lors de la génération')
      }
    } catch (err) {
      setError(err.message)
    }
    setGenerating(false)
  }

  const selectedVoice = voices.find(v => v.voice_id === voiceId)
  const wordCount = texte.trim().split(/\s+/).filter(Boolean).length
  const estimatedDuration = Math.ceil(wordCount / 140) // ~140 mots/min

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <PageHeader
        title="Voix off"
        sub="Génère un audio depuis un texte avec une voix HeyGen"
      />

      <div className="px-10 py-8 overflow-y-auto flex-1 max-w-[720px]">
        <div className="grid grid-cols-[1fr_260px] gap-6">

          {/* Colonne gauche — texte */}
          <div className="space-y-4">
            <Field label="Texte à lire">
              <textarea
                value={texte}
                onChange={e => setTexte(e.target.value)}
                className={`${inputCls} resize-none`}
                rows={14}
                placeholder="Écris ou colle le texte à convertir en voix..."
              />
              {texte.trim() && (
                <p className="text-[11px] text-[#333] mt-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {wordCount} mots · ~{estimatedDuration} min estimée
                </p>
              )}
            </Field>

            {/* Résultat audio */}
            {audioUrl && (
              <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-500/10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[12px] font-medium text-emerald-400">Audio généré</span>
                  </div>
                  <a
                    href={audioUrl}
                    download={audioName}
                    className="flex items-center gap-1.5 text-[11px] text-[#555] hover:text-white border border-[#222] hover:border-[#333] px-2.5 py-1 rounded-lg transition"
                  >
                    {Icon.download} Télécharger
                  </a>
                </div>
                <div className="px-4 py-4">
                  <audio ref={audioRef} src={audioUrl} controls className="w-full h-9" style={{ colorScheme: 'dark' }} />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 px-4 py-3.5 bg-red-500/8 border border-red-500/20 rounded-xl">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-red-400 flex-shrink-0 mt-0.5">
                  <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M7.5 5v3.5M7.5 10v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <p className="text-[12px] text-red-400">{error}</p>
              </div>
            )}

            <Btn
              onClick={generer}
              disabled={!texte.trim() || !voiceId || generating}
              className="w-full justify-center"
            >
              {generating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>{Icon.mic} Générer la voix off</>
              )}
            </Btn>
          </div>

          {/* Colonne droite — sélection voix */}
          <div className="space-y-3">
            <p className="text-[11px] text-[#444] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>
              Voix
            </p>

            {/* Filtres langue */}
            <div className="flex gap-1.5 flex-wrap">
              {[
                { key: 'fr',  label: '🇫🇷 FR' },
                { key: 'en',  label: '🇺🇸 EN' },
                { key: 'es',  label: '🇪🇸 ES' },
                { key: 'all', label: '🌍 Tout' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setVoiceFilter(f.key)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                    voiceFilter === f.key
                      ? 'border-[#c0392b] bg-[#c0392b]/10 text-[#c0392b]'
                      : 'border-[#1e1e1e] text-[#555] hover:text-[#888]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Aperçu voix sélectionnée */}
            {selectedVoice && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#c0392b]/8 border border-[#c0392b]/20 rounded-xl">
                <div className="w-7 h-7 rounded-md bg-[#c0392b]/20 flex items-center justify-center text-[#c0392b]">
                  {Icon.mic}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-white truncate">{selectedVoice.name}</p>
                  <p className="text-[10px] text-[#555]">{selectedVoice.language || selectedVoice.locale}</p>
                </div>
              </div>
            )}

            {/* Liste voix */}
            <div className="space-y-1 overflow-y-auto rounded-xl border border-[#1a1a1a]" style={{ maxHeight: '480px' }}>
              {filteredVoices.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-[#333] text-[12px]">
                  Aucune voix disponible
                </div>
              ) : (
                filteredVoices.slice(0, 80).map(voice => (
                  <button
                    key={voice.voice_id}
                    onClick={() => setVoiceId(voice.voice_id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 border-b border-[#111] text-left transition last:border-0 ${
                      voiceId === voice.voice_id
                        ? 'bg-[#c0392b]/8 text-white'
                        : 'hover:bg-[#0f0f0f] text-[#888]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                      voiceId === voice.voice_id ? 'bg-[#c0392b]/20 text-[#c0392b]' : 'bg-[#161616] text-[#333]'
                    }`}>
                      {Icon.mic}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate">{voice.name}</p>
                      <p className="text-[10px] text-[#333]">{voice.language || voice.locale}</p>
                    </div>
                    {voiceId === voice.voice_id && (
                      <span className="text-[#c0392b] flex-shrink-0">{Icon.check}</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}