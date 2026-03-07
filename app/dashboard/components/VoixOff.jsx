// app/dashboard/components/VoixOff.jsx
'use client'

import { useState, useRef } from 'react'

// voices + loadingAssets viennent de page.jsx (chargés une seule fois)
export default function VoixOff({ user, voices = [], loadingAssets = false }) {
  const [texte, setTexte]             = useState('')
  const [voiceId, setVoiceId]         = useState('')
  const [voiceFilter, setVoiceFilter] = useState('fr')
  const [activeTab, setActiveTab]     = useState('reglages')
  const [vitesse, setVitesse]         = useState(1.0)
  const [pitch, setPitch]             = useState(0)
  const [generating, setGenerating]   = useState(false)
  const [audioUrl, setAudioUrl]       = useState(null)
  const [error, setError]             = useState(null)
  const [historique, setHistorique]   = useState([])
  const audioRef = useRef(null)

  const MAX_CHARS = 1500

  // Sélectionner la première voix FR dès que les voix arrivent
  const firstFrVoice = voices.find(v =>
    v.language?.toLowerCase().includes('fr') || v.locale?.toLowerCase().includes('fr')
  )
  const effectiveVoiceId = voiceId || firstFrVoice?.voice_id || voices[0]?.voice_id || ''

  const filteredVoices = voices.filter(v => {
    if (voiceFilter === 'all') return true
    return v.language?.toLowerCase().includes(voiceFilter) || v.locale?.toLowerCase().includes(voiceFilter)
  })

  const selectedVoice = voices.find(v => v.voice_id === effectiveVoiceId)
  const wordCount     = texte.trim().split(/\s+/).filter(Boolean).length
  const charCount     = texte.length
  const estimatedMin  = Math.ceil(wordCount / 140)

  const generer = async () => {
    if (!texte.trim() || !effectiveVoiceId) return
    setGenerating(true)
    setError(null)
    setAudioUrl(null)
    try {
      const res = await fetch('/api/heygen/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texte, voiceId: effectiveVoiceId, vitesse, pitch }),
      })
      const data = await res.json()
      if (data.url) {
        setAudioUrl(data.url)
        setHistorique(prev => [{
          id: Date.now(),
          texte: texte.slice(0, 60) + (texte.length > 60 ? '...' : ''),
          voix: selectedVoice?.name || effectiveVoiceId,
          url: data.url,
          date: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        }, ...prev].slice(0, 20))
      } else {
        setError(data.error || 'Erreur lors de la génération')
      }
    } catch (err) {
      setError(err.message)
    }
    setGenerating(false)
  }

  const langFilters = [
    { key: 'fr',  label: '🇫🇷 FR' },
    { key: 'en',  label: '🇺🇸 EN' },
    { key: 'es',  label: '🇪🇸 ES' },
    { key: 'all', label: '🌍' },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── En-tête ── */}
      <div className="border-b border-[#1c1c1c] px-10 py-8 flex-shrink-0">
        <p className="text-[11px] text-[#444] tracking-[.15em] uppercase mb-1.5"
           style={{ fontFamily: "'DM Mono', monospace" }}>Piloto</p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-[28px] text-white leading-tight">Voix off</h1>
        <p className="text-[13px] text-[#555] mt-1">Génère un audio depuis un texte avec une voix HeyGen</p>
      </div>

      {/* ── Corps ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Zone texte principale */}
        <div className="flex-1 flex flex-col overflow-hidden px-10 py-6">

          <div className="flex-1 relative">
            <textarea
              value={texte}
              onChange={e => setTexte(e.target.value)}
              maxLength={MAX_CHARS}
              placeholder="Écris ou colle le texte à convertir en voix..."
              className="w-full h-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl px-5 py-4 text-[13px] text-white placeholder-[#2a2a2a] focus:outline-none focus:border-[#c0392b]/40 resize-none transition leading-relaxed"
            />
          </div>

          <div className="mt-2 flex items-center gap-4 text-[11px] text-[#333] flex-shrink-0"
               style={{ fontFamily: "'DM Mono', monospace" }}>
            {texte.trim() && <><span>{wordCount} mots</span><span>·</span><span>+{estimatedMin} min</span></>}
            <span className={`ml-auto ${charCount > MAX_CHARS ? 'text-red-400' : ''}`}>
              {charCount} / {MAX_CHARS}
            </span>
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2.5 px-4 py-3 bg-red-500/8 border border-red-500/20 rounded-xl flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-red-400 flex-shrink-0">
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M7 4.5v3M7 9v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span className="text-[12px] text-red-400">{error}</span>
            </div>
          )}

          {audioUrl && (
            <div className="mt-3 border border-emerald-500/20 bg-emerald-500/5 rounded-xl overflow-hidden flex-shrink-0">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-emerald-500/10">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[12px] font-medium text-emerald-400">Audio prêt</span>
                </div>
                <a href={audioUrl} download={`voix-off-${Date.now()}.mp3`}
                   className="flex items-center gap-1.5 text-[11px] text-[#555] hover:text-white border border-[#222] hover:border-[#333] px-2.5 py-1 rounded-lg transition">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v7M3.5 5.5L6 8l2.5-2.5M1.5 9v1a.5.5 0 00.5.5h8a.5.5 0 00.5-.5V9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Télécharger
                </a>
              </div>
              <div className="px-4 py-3">
                <audio ref={audioRef} src={audioUrl} controls className="w-full h-8" style={{ colorScheme: 'dark' }} />
              </div>
            </div>
          )}

          <button
            onClick={generer}
            disabled={!texte.trim() || !effectiveVoiceId || generating || charCount > MAX_CHARS}
            className="mt-4 flex items-center justify-center gap-2.5 w-full py-3.5 bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-30 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-xl transition-all flex-shrink-0"
          >
            {generating ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Génération en cours...</>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="4.5" y="1" width="5" height="7" rx="2.5" stroke="white" strokeWidth="1.2"/>
                  <path d="M2 7a5 5 0 0010 0M7 12v2" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Générer
              </>
            )}
          </button>
        </div>

        {/* ── Sidebar droite ── */}
        <div className="w-[300px] border-l border-[#1c1c1c] flex flex-col flex-shrink-0 overflow-hidden">

          <div className="flex border-b border-[#1c1c1c] flex-shrink-0">
            {['reglages', 'historique'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3.5 text-[12px] font-medium transition-all ${
                  activeTab === tab ? 'text-white border-b-2 border-[#c0392b]' : 'text-[#444] hover:text-[#888]'
                }`} style={{ fontFamily: "'DM Mono', monospace" }}>
                {tab === 'reglages' ? 'Réglages' : 'Historique'}
              </button>
            ))}
          </div>

          {activeTab === 'reglages' && (
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* Voix active */}
              {loadingAssets ? (
                <div className="flex items-center gap-2.5 px-3.5 py-3 bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl">
                  <span className="w-4 h-4 border-2 border-[#c0392b] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  <span className="text-[12px] text-[#444]">Chargement des voix...</span>
                </div>
              ) : selectedVoice ? (
                <div className="flex items-center gap-3 px-3.5 py-3 bg-[#c0392b]/10 border border-[#c0392b]/20 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-[#c0392b]/20 flex items-center justify-center text-[#c0392b] flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="4.5" y="1" width="5" height="7" rx="2.5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M2 7a5 5 0 0010 0M7 12v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white truncate">{selectedVoice.name}</p>
                    <p className="text-[10px] text-[#555]">HeyGen TTS</p>
                  </div>
                </div>
              ) : null}

              {/* Choisir voix */}
              {!loadingAssets && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] text-[#444] tracking-widest uppercase"
                          style={{ fontFamily: "'DM Mono', monospace" }}>Choisir</span>
                    <span className="text-[10px] text-[#333]" style={{ fontFamily: "'DM Mono', monospace" }}>
                      {filteredVoices.length} / {voices.length}
                    </span>
                  </div>

                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    {langFilters.map(f => (
                      <button key={f.key} onClick={() => setVoiceFilter(f.key)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                          voiceFilter === f.key
                            ? 'border-[#c0392b] bg-[#c0392b]/10 text-[#c0392b]'
                            : 'border-[#1e1e1e] text-[#555] hover:text-[#888]'
                        }`}>{f.label}</button>
                    ))}
                  </div>

                  <div className="overflow-y-auto rounded-xl border border-[#1a1a1a]" style={{ maxHeight: '200px' }}>
                    {filteredVoices.length === 0 ? (
                      <div className="flex items-center justify-center py-8 text-[12px] text-[#333]">
                        Aucune voix disponible
                      </div>
                    ) : (
                      filteredVoices.slice(0, 80).map(voice => (
                        <button key={voice.voice_id}
                          onClick={() => setVoiceId(voice.voice_id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 border-b border-[#0f0f0f] text-left transition last:border-0 ${
                            effectiveVoiceId === voice.voice_id ? 'bg-[#c0392b]/8' : 'hover:bg-[#0f0f0f]'
                          }`}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            effectiveVoiceId === voice.voice_id ? 'bg-[#c0392b]' : 'bg-[#1e1e1e]'
                          }`}>
                            {effectiveVoiceId === voice.voice_id && (
                              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                <path d="M1.5 4l2 2 3-3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[11px] font-medium truncate ${effectiveVoiceId === voice.voice_id ? 'text-white' : 'text-[#888]'}`}>
                              {voice.name}
                            </p>
                            <p className="text-[10px] text-[#333]">{voice.language || voice.locale}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Vitesse */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-[#444] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Vitesse</span>
                  <span className="text-[12px] font-bold text-[#c0392b]" style={{ fontFamily: "'DM Mono', monospace" }}>{vitesse.toFixed(1)}x</span>
                </div>
                <input type="range" min="0.5" max="2.0" step="0.1" value={vitesse}
                  onChange={e => setVitesse(parseFloat(e.target.value))}
                  className="w-full cursor-pointer" style={{ accentColor: '#c0392b' }} />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-[#2a2a2a]">Lent</span>
                  <span className="text-[10px] text-[#2a2a2a]">Rapide</span>
                </div>
              </div>

              {/* Pitch */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-[#444] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Pitch</span>
                  <span className="text-[12px] font-bold text-[#c0392b]" style={{ fontFamily: "'DM Mono', monospace" }}>{pitch > 0 ? '+' : ''}{pitch}</span>
                </div>
                <input type="range" min="-10" max="10" step="1" value={pitch}
                  onChange={e => setPitch(parseInt(e.target.value))}
                  className="w-full cursor-pointer" style={{ accentColor: '#c0392b' }} />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-[#2a2a2a]">Grave</span>
                  <span className="text-[10px] text-[#2a2a2a]">Aigu</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2.5 border-t border-[#1a1a1a]">
                <span className="text-[10px] text-[#444] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Moteur</span>
                <span className="text-[11px] text-[#555]">HeyGen TTS</span>
              </div>
            </div>
          )}

          {activeTab === 'historique' && (
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {historique.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#1a1a1a] flex items-center justify-center text-[#2a2a2a]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M4 6h8M4 9h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="text-[12px] text-[#333]">Aucune génération pour l'instant</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {historique.map(item => (
                    <div key={item.id} className="border border-[#1a1a1a] rounded-xl overflow-hidden">
                      <div className="px-3.5 py-3 bg-[#0a0a0a]">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-[11px] text-white leading-snug flex-1">{item.texte}</p>
                          <span className="text-[10px] text-[#333] flex-shrink-0" style={{ fontFamily: "'DM Mono', monospace" }}>{item.date}</span>
                        </div>
                        <p className="text-[10px] text-[#444]">{item.voix}</p>
                      </div>
                      <div className="px-3 py-2 border-t border-[#1a1a1a] flex items-center gap-2">
                        <audio src={item.url} controls className="flex-1 h-6" style={{ colorScheme: 'dark' }} />
                        <a href={item.url} download={`voix-off-${item.id}.mp3`}
                           className="w-6 h-6 flex items-center justify-center text-[#444] hover:text-white transition flex-shrink-0">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M6 1v7M3.5 5.5L6 8l2.5-2.5M1.5 9v1a.5.5 0 00.5.5h8a.5.5 0 00.5-.5V9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}