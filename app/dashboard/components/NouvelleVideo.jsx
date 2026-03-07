// app/dashboard/components/NouvelleVideo.jsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import Icon from './ui/icons'
import { Btn, Field, PageHeader, AvatarCard } from './ui/shared'
import { inputCls } from './ui/utils'

export default function NouvelleVideo({ user, avatars = [], voices = [], loadingAssets = false, onBack }) {
  const router = useRouter()
  const [etape, setEtape] = useState('choix')

  const [scriptBrut, setScriptBrut] = useState('')
  const [analysing, setAnalysing] = useState(false)
  const [suggestions, setSuggestions] = useState(null)
  const [scriptGenere, setScriptGenere] = useState('')
  const [generatingScript, setGeneratingScript] = useState(false)
  const [contenu, setContenu] = useState('')

  const [niche, setNiche] = useState('')
  const [tone, setTone] = useState('')
  const [audience, setAudience] = useState('')
  const [longueur, setLongueur] = useState('medium')
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')

  const [avatarId, setAvatarId] = useState('')
  const [voiceId, setVoiceId] = useState('')
  const [avatarSearch, setAvatarSearch] = useState('')
  const [voiceFilter, setVoiceFilter] = useState('fr')
  const [selectedAvatarObj, setSelectedAvatarObj] = useState(null)
  const [selectedVoiceObj, setSelectedVoiceObj] = useState(null)

  const [loading, setLoading] = useState(false)
  const [creditsError, setCreditsError] = useState(null)
  const savingDraftRef = useRef(false)

  // Charger les défauts du profil (avatar/voix par défaut)
  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) return
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle()
      if (profile?.default_avatar_id) {
        setAvatarId(profile.default_avatar_id)
        setSelectedAvatarObj({
          avatar_id: profile.default_avatar_id,
          avatar_name: profile.default_avatar_name,
          preview_image_url: null,
        })
      }
      if (profile?.default_voice_id) {
        setVoiceId(profile.default_voice_id)
        setSelectedVoiceObj({ voice_id: profile.default_voice_id, name: profile.default_voice_name })
      }
    }
    init()
  }, [])

  const handleBack = async () => {
    const scriptToSave = contenu || scriptGenere || scriptBrut
    if (scriptToSave.trim() && !savingDraftRef.current) {
      savingDraftRef.current = true
      try {
        const { data: { user: u } } = await supabase.auth.getUser()
        if (u) {
          await supabase.from('videos').insert({
            user_id: u.id,
            titre: titre || 'Brouillon sans titre',
            script: scriptToSave,
            statut: 'script_pret',
          })
        }
      } catch (e) { console.error('Erreur sauvegarde draft:', e) }
    }
    onBack()
  }

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
            content: `Analyse ce script YouTube et retourne UNIQUEMENT un JSON valide (sans markdown, sans backticks) avec ces champs:\n{\n  "niche": "Health & Wellness | Finance & Money | Personal Development | Nutrition & Diet | Mental Health | Fitness & Sport | Technology | Spirituality | Relationships | Business",\n  "tone": "Authoritative & Medical | Storytelling & Emotional | Energetic & Motivational | Friendly & Conversational | Educational & Scientific",\n  "audience": "Seniors 60+ | Adults 40-60 | Young Adults 18-35 | General Audience | Content Creators | Entrepreneurs",\n  "langue": "Français | English | Español | Português | Deutsch | Italiano | العربية | Nederlands | Русский | 中文",\n  "titre_suggere": "titre accrocheur YouTube optimisé SEO",\n  "resume": "résumé en 1 phrase du contenu"\n}\n\nScript à analyser:\n${scriptBrut.substring(0, 3000)}`,
          }],
        }),
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
      short:  '1000-5000 caractères (3-5 min)',
      medium: '5000-15000 caractères (8-12 min)',
      long:   '15000-30000 caractères (15-20 min)',
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
            content: `Tu es un expert en scripts YouTube viraux. Réécris et améliore ce script.\n\nParamètres:\n- Niche: ${niche}\n- Ton: ${tone}\n- Audience: ${audience}\n- Longueur: ${longueurMap[longueur]}\n\nInstructions:\n- Hook fort en 3 secondes\n- Structure: Hook → Problème → Solution → CTA\n- NE retourne QUE le script pur\n\nScript original:\n${scriptBrut}`,
          }],
        }),
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
    console.log('🚀 lancerGeneration', { contenuLen: contenu?.length, avatarId, voiceId })

    if (!contenu?.trim()) { alert('Le script est vide.'); return }
    if (!avatarId)         { alert('Choisis un avatar.'); return }
    if (!voiceId)          { alert('Choisis une voix.'); return }

    savingDraftRef.current = true
    setLoading(true)
    setCreditsError(null)

    try {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { alert('Session expirée, reconnecte-toi.'); setLoading(false); return }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:         u.id,
          contenu,
          avatarId,
          voiceId,
          titre:          titre || '',
          description:    description || '',
          scriptDirect:   true,
          stopAfterVideo: true,
        }),
      })

      console.log('📥 Status:', res.status)
      const data = await res.json()
      console.log('📥 Réponse:', data)

      if (res.status === 402) {
        setCreditsError({ balance: data.credits_balance, needed: data.credits_needed })
        setLoading(false)
        return
      }

      if (res.ok && data.success) {
        onBack()
      } else {
        alert('Erreur : ' + (data.error || data.message || 'Inconnue'))
      }
    } catch (err) {
      console.error('lancerGeneration error:', err)
      alert('Erreur réseau : ' + err.message)
    }

    setLoading(false)
  }

  const filteredVoices = voices.filter(v => {
    if (voiceFilter === 'all') return true
    return v.language?.toLowerCase().includes(voiceFilter) || v.locale?.toLowerCase().includes(voiceFilter)
  })

  const niches    = ['Health & Wellness','Finance & Money','Personal Development','Nutrition & Diet','Mental Health','Fitness & Sport','Technology','Spirituality','Relationships','Business']
  const tones     = ['Authoritative & Medical','Storytelling & Emotional','Energetic & Motivational','Friendly & Conversational','Educational & Scientific']
  const audiences = ['Seniors 60+','Adults 40-60','Young Adults 18-35','General Audience','Content Creators','Entrepreneurs']
  const hasScript = !!(contenu || scriptGenere || scriptBrut).trim()

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <PageHeader
        title="Nouvelle vidéo"
        sub={
          etape === 'choix'        ? 'Tu as déjà un script ou tu veux en générer un ?' :
          etape === 'analyse'      ? 'Analyse en cours...' :
          etape === 'suggestions'  ? 'Confirme les suggestions IA' :
          etape === 'script_pret'  ? 'Script optimisé prêt' :
          etape === 'avatar'       ? 'Choisis ton avatar' : 'Prêt à générer'
        }
        action={
          <button onClick={handleBack} className="flex items-center gap-2 text-[12px] text-[#444] hover:text-white transition border border-[#1e1e1e] hover:border-[#333] px-3.5 py-2 rounded-lg">
            {Icon.arrowLeft}
            {hasScript ? 'Retour (sauvegarde draft)' : 'Retour'}
          </button>
        }
      />

      <div className="px-10 py-8 max-w-[680px] overflow-y-auto flex-1">

        {/* ── CHOIX ── */}
        {etape === 'choix' && (
          <div className="space-y-3">
            <button onClick={() => setEtape('saisie')} className="w-full flex items-center gap-4 px-5 py-5 bg-[#0d0d0d] border border-[#1e1e1e] hover:border-[#c0392b]/40 hover:bg-[#c0392b]/5 rounded-xl transition-all text-left group">
              <div className="w-11 h-11 rounded-xl bg-[#c0392b]/10 border border-[#c0392b]/20 flex items-center justify-center flex-shrink-0 text-[#c0392b]">{Icon.spark}</div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-white mb-0.5">Optimiser mon script avec l'IA</p>
                <p className="text-[12px] text-[#555]">Colle ton script brut — l'IA l'analyse et génère une version virale</p>
              </div>
              <span className="text-[#333] group-hover:text-[#c0392b] transition-all">{Icon.arrow}</span>
            </button>
            <button onClick={() => setEtape('script_direct')} className="w-full flex items-center gap-4 px-5 py-5 bg-[#0d0d0d] border border-[#1e1e1e] hover:border-[#2a2a2a] hover:bg-[#111] rounded-xl transition-all text-left group">
              <div className="w-11 h-11 rounded-xl bg-[#1a1a1a] border border-[#222] flex items-center justify-center flex-shrink-0 text-[#555]">{Icon.file}</div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-white mb-0.5">J'ai déjà un script prêt</p>
                <p className="text-[12px] text-[#555]">Passe directement à l'avatar et à la génération vidéo</p>
              </div>
              <span className="text-[#333] group-hover:text-[#555] transition-all">{Icon.arrow}</span>
            </button>
          </div>
        )}

        {/* ── SAISIE ── */}
        {etape === 'saisie' && (
          <div className="space-y-4">
            <div className="border border-[#1a1a1a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#1a1a1a] bg-[#0a0a0a]">
                <span className="text-[11px] text-[#555] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Coller un script ou transcript</span>
              </div>
              <textarea value={scriptBrut} onChange={e => setScriptBrut(e.target.value)}
                className="w-full bg-[#0d0d0d] px-4 py-4 text-[13px] text-white placeholder-[#2a2a2a] focus:outline-none resize-none"
                rows={10} placeholder="Collez votre script complet ici..." />
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#1a1a1a] bg-[#0a0a0a]">
                <span className="text-[11px] text-[#333]" style={{ fontFamily: "'DM Mono', monospace" }}>{scriptBrut.length} caractères</span>
                <button onClick={analyserScript} disabled={!scriptBrut.trim()}
                  className="flex items-center gap-2 text-[12px] font-medium px-4 py-2 bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition">
                  Analyser & Continuer
                </button>
              </div>
            </div>
            <button onClick={() => setEtape('choix')} className="flex items-center gap-2 text-[12px] text-[#444] hover:text-white transition">{Icon.arrowLeft} Retour</button>
          </div>
        )}

        {/* ── ANALYSE ── */}
        {etape === 'analyse' && (
          <div className="flex flex-col items-center gap-6 py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#c0392b]/10 border border-[#c0392b]/20 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#c0392b]/30 border-t-[#c0392b] rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-medium text-white mb-1">Analyse en cours...</p>
              <p className="text-[12px] text-[#444]">L'IA détecte la niche, le ton et l'audience</p>
            </div>
          </div>
        )}

        {/* ── SUGGESTIONS ── */}
        {etape === 'suggestions' && suggestions && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#c0392b]/8 border border-[#c0392b]/20 rounded-xl">
              <span className="text-[11px] text-[#c0392b] tracking-widest uppercase font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>Auto-détecté — confirme ou ajuste</span>
            </div>
            {suggestions.titre_suggere && (
              <div className="border border-[#c0392b]/30 bg-[#c0392b]/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-[#c0392b] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Titre suggéré</span>
                  <button onClick={() => setTitre(suggestions.titre_suggere)} className="text-[10px] text-[#c0392b] hover:text-white border border-[#c0392b]/30 hover:border-[#c0392b] px-2 py-1 rounded-lg">Utiliser</button>
                </div>
                <p className="text-[13px] font-semibold text-white">{suggestions.titre_suggere}</p>
              </div>
            )}
            <div>
              <p className="text-[11px] text-[#444] uppercase mb-2.5" style={{ fontFamily: "'DM Mono', monospace" }}>Niche</p>
              <div className="flex flex-wrap gap-2">
                {niches.map(n => (
                  <button key={n} onClick={() => setNiche(n)} className={`px-3 py-1.5 rounded-full text-[12px] border transition ${niche === n ? 'border-[#c0392b] bg-[#c0392b]/10 text-white' : 'border-[#1e1e1e] text-[#555] hover:border-[#2a2a2a]'}`}>{n}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] text-[#444] uppercase mb-2.5" style={{ fontFamily: "'DM Mono', monospace" }}>Ton</p>
              <div className="grid grid-cols-2 gap-2">
                {tones.map(t => (
                  <button key={t} onClick={() => setTone(t)} className={`px-3.5 py-2.5 rounded-xl border text-left text-[12px] transition ${tone === t ? 'border-[#c0392b] bg-[#c0392b]/10 text-white' : 'border-[#1a1a1a] bg-[#0a0a0a] text-[#555] hover:border-[#2a2a2a]'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] text-[#444] uppercase mb-2.5" style={{ fontFamily: "'DM Mono', monospace" }}>Audience</p>
              <div className="flex flex-wrap gap-2">
                {audiences.map(a => (
                  <button key={a} onClick={() => setAudience(a)} className={`px-3 py-1.5 rounded-full text-[12px] border transition ${audience === a ? 'border-[#c0392b] bg-[#c0392b]/10 text-white' : 'border-[#1e1e1e] text-[#555] hover:border-[#2a2a2a]'}`}>{a}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] text-[#444] uppercase mb-2.5" style={{ fontFamily: "'DM Mono', monospace" }}>Longueur</p>
              <div className="grid grid-cols-3 gap-2">
                {[{ key: 'short', label: 'Court', detail: '3-5 min' }, { key: 'medium', label: 'Medium', detail: '8-12 min' }, { key: 'long', label: 'Long', detail: '15-20 min' }].map(l => (
                  <button key={l.key} onClick={() => setLongueur(l.key)} className={`flex flex-col items-start px-3.5 py-3 rounded-xl border transition ${longueur === l.key ? 'border-[#c0392b] bg-[#c0392b]/8' : 'border-[#1a1a1a] bg-[#0a0a0a]'}`}>
                    <span className={`text-[12px] font-semibold ${longueur === l.key ? 'text-white' : 'text-[#555]'}`}>{l.label}</span>
                    <span className="text-[10px] text-[#333]">{l.detail}</span>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={genererScript} className="w-full flex items-center justify-between px-5 py-4 bg-[#c0392b] hover:bg-[#a93226] rounded-xl transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">{Icon.spark}</div>
                <div className="text-left">
                  <p className="text-[13px] font-semibold text-white">Générer le script complet</p>
                  <p className="text-[11px] text-white/60">{longueur === 'short' ? '3-5 min' : longueur === 'medium' ? '8-12 min' : '15-20 min'}</p>
                </div>
              </div>
              <span className="text-white/70">{Icon.arrow}</span>
            </button>
            <button onClick={() => setEtape('saisie')} className="flex items-center gap-2 text-[12px] text-[#444] hover:text-white transition">{Icon.arrowLeft} Retour</button>
          </div>
        )}

        {/* ── SCRIPT GÉNÉRÉ ── */}
        {etape === 'script_pret' && (
          <div className="space-y-4">
            {generatingScript ? (
              <div className="flex flex-col items-center gap-5 py-20">
                <div className="w-14 h-14 rounded-2xl bg-[#c0392b]/10 border border-[#c0392b]/20 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#c0392b]/30 border-t-[#c0392b] rounded-full animate-spin" />
                </div>
                <p className="text-[14px] font-medium text-white">Génération du script viral...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[12px] font-medium text-emerald-400">Script prêt</span>
                    <span className="text-[11px] text-emerald-400/60" style={{ fontFamily: "'DM Mono', monospace" }}>
                      {scriptGenere.split(' ').length} mots · ~{Math.ceil(scriptGenere.split(' ').length / 130)} min
                    </span>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(scriptGenere)} className="text-[11px] text-[#555] hover:text-white transition border border-[#222] px-2.5 py-1 rounded-lg">Copier</button>
                </div>
                <textarea value={scriptGenere} onChange={e => { setScriptGenere(e.target.value); setContenu(e.target.value) }}
                  className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-4 text-[12px] text-[#aaa] leading-relaxed focus:outline-none resize-none"
                  rows={14} style={{ fontFamily: "'DM Mono', monospace" }} />
                <button onClick={() => { setContenu(scriptGenere); setEtape('avatar') }}
                  className="w-full flex items-center justify-between px-5 py-4 bg-[#c0392b] hover:bg-[#a93226] rounded-xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2" width="13" height="11" rx="1.5" stroke="white" strokeWidth="1.3"/><path d="M5.5 5.5l4 2-4 2V5.5Z" fill="white"/></svg>
                    </div>
                    <div className="text-left">
                      <p className="text-[13px] font-semibold text-white">Choisir l'avatar & générer</p>
                      <p className="text-[11px] text-white/60">Étape suivante</p>
                    </div>
                  </div>
                  <span className="text-white/70">{Icon.arrow}</span>
                </button>
                <button onClick={() => setEtape('suggestions')} className="flex items-center gap-2 text-[12px] text-[#444] hover:text-white transition">{Icon.arrowLeft} Ajuster les paramètres</button>
              </>
            )}
          </div>
        )}

        {/* ── SCRIPT DIRECT ── */}
        {etape === 'script_direct' && (
          <div className="space-y-4">
            <Field label="Ton script final">
              <textarea value={contenu} onChange={e => setContenu(e.target.value)}
                className={`${inputCls} resize-none`} rows={12}
                placeholder="Colle ici ton script prêt à tourner..." />
              {contenu && (
                <p className="text-[11px] text-[#333] mt-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {contenu.split(' ').length} mots · ~{Math.ceil(contenu.split(' ').length / 130)} min
                </p>
              )}
            </Field>
            <button onClick={() => { if (contenu.trim()) setEtape('avatar') }}
              disabled={!contenu.trim()}
              className="w-full flex items-center justify-between px-5 py-4 bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="2" width="13" height="11" rx="1.5" stroke="white" strokeWidth="1.3"/><path d="M5.5 5.5l4 2-4 2V5.5Z" fill="white"/></svg>
                </div>
                <div className="text-left">
                  <p className="text-[13px] font-semibold text-white">Choisir l'avatar & générer</p>
                  <p className="text-[11px] text-white/60">Étape suivante</p>
                </div>
              </div>
              <span className="text-white/70">{Icon.arrow}</span>
            </button>
            <button onClick={() => setEtape('choix')} className="flex items-center gap-2 text-[12px] text-[#444] hover:text-white transition">{Icon.arrowLeft} Retour</button>
          </div>
        )}

        {/* ── AVATAR ── */}
        {etape === 'avatar' && (
          <div style={{ maxWidth: '900px' }}>
            {loadingAssets && (
              <div className="flex items-center gap-3 px-5 py-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl mb-5">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-[#c0392b] border-t-transparent animate-spin flex-shrink-0" />
                <span className="text-[13px] text-[#555]">Chargement des avatars...</span>
              </div>
            )}
            {!avatars.length && !loadingAssets && (
              <div className="flex flex-col items-center gap-4 py-16 border border-dashed border-[#1e1e1e] rounded-2xl mb-5">
                <p className="text-[14px] text-[#555]">Aucun avatar disponible</p>
              </div>
            )}
            {avatars.length > 0 && (
              <div className="flex gap-5">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[#444] uppercase mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>Avatar</p>
                  <input type="text" value={avatarSearch} onChange={e => setAvatarSearch(e.target.value)}
                    className={`${inputCls} mb-3 text-[12px]`} placeholder="Rechercher..." />
                  {avatars.filter(a => a.type === 'personal').length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-[#c0392b] uppercase mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>✦ Mes avatars</p>
                      <div className="grid grid-cols-2 gap-2">
                        {avatars.filter(a => a.type === 'personal' && (!avatarSearch || a.avatar_name?.toLowerCase().includes(avatarSearch.toLowerCase()))).map(avatar => (
                          <AvatarCard key={avatar.avatar_id} avatar={avatar} selected={avatarId === avatar.avatar_id}
                            onSelect={() => { setAvatarId(avatar.avatar_id); setSelectedAvatarObj(avatar) }} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1" style={{ maxHeight: '420px' }}>
                    {avatars.filter(a => a.type !== 'personal' && (!avatarSearch || a.avatar_name?.toLowerCase().includes(avatarSearch.toLowerCase()))).map(avatar => (
                      <AvatarCard key={avatar.avatar_id} avatar={avatar} selected={avatarId === avatar.avatar_id}
                        onSelect={() => { setAvatarId(avatar.avatar_id); setSelectedAvatarObj(avatar) }} />
                    ))}
                  </div>
                </div>
                <div style={{ width: '260px', flexShrink: 0 }}>
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
                        </div>
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
                      <p className="text-[11px] text-[#444] uppercase mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>Voix</p>
                      <div className="flex gap-1.5 flex-wrap mb-2">
                        {[{ key:'fr', label:'🇫🇷' }, { key:'en', label:'🇺🇸' }, { key:'es', label:'🇪🇸' }, { key:'all', label:'🌍' }].map(f => (
                          <button key={f.key} onClick={() => setVoiceFilter(f.key)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${voiceFilter === f.key ? 'border-[#c0392b] bg-[#c0392b]/10 text-[#c0392b]' : 'border-[#1e1e1e] text-[#555]'}`}>
                            {f.label}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-1 overflow-y-auto" style={{ maxHeight: '300px' }}>
                        {filteredVoices.slice(0, 60).map(voice => (
                          <button key={voice.voice_id}
                            onClick={() => { setVoiceId(voice.voice_id); setSelectedVoiceObj(voice) }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition ${voiceId === voice.voice_id ? 'border-[#c0392b] bg-[#c0392b]/8' : 'border-[#1a1a1a] bg-[#0d0d0d] hover:border-[#2a2a2a]'}`}>
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${voiceId === voice.voice_id ? 'bg-[#c0392b]/20 text-[#c0392b]' : 'bg-[#161616] text-[#333]'}`}>
                              {Icon.mic}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium text-[#bbb] truncate">{voice.name}</p>
                              <p className="text-[10px] text-[#333]">{voice.language || voice.locale}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-6">
              <Btn variant="ghost" onClick={() => setEtape(contenu === scriptGenere ? 'script_pret' : 'script_direct')}>
                {Icon.arrowLeft} Retour
              </Btn>
              <Btn onClick={() => setEtape('confirmation')} disabled={!avatarId} className="flex-1 justify-center">
                Continuer {Icon.arrow}
              </Btn>
            </div>
          </div>
        )}

        {/* ── CONFIRMATION ── */}
        {etape === 'confirmation' && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 px-4 py-3.5 bg-amber-500/8 border border-amber-500/20 rounded-xl">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-amber-400 flex-shrink-0 mt-0.5">
                <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M7.5 5v3.5M7.5 10v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <div>
                <p className="text-[12px] text-amber-400 font-medium mb-0.5">Génération uniquement</p>
                <p className="text-[11px] text-amber-400/60">La vidéo sera disponible dans ta bibliothèque.</p>
              </div>
            </div>

            {creditsError && (
              <div className="flex items-start gap-3 px-4 py-3.5 bg-red-500/8 border border-red-500/20 rounded-xl">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-red-400 flex-shrink-0 mt-0.5">
                  <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M7.5 5v3.5M7.5 10v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <div>
                  <p className="text-[12px] text-red-400 font-medium mb-0.5">Crédits insuffisants</p>
                  <p className="text-[11px] text-red-400/70">
                    Tu as <strong>{creditsError.balance}</strong> crédits — cette génération nécessite <strong>{creditsError.needed}</strong> crédits.
                  </p>
                </div>
              </div>
            )}

            <div className="border border-[#1a1a1a] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1a1a1a] bg-[#0a0a0a]">
                <span className="text-[11px] text-[#444] uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>Récapitulatif</span>
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
              <button
                onClick={lancerGeneration}
                disabled={loading}
                className="flex-1 flex items-center justify-between px-5 py-4 bg-[#c0392b] hover:bg-[#a93226] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    {loading
                      ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 1.5L9 6H13.5L9.75 8.75L11.25 13.5L7.5 10.75L3.75 13.5L5.25 8.75L1.5 6H6L7.5 1.5Z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/></svg>
                    }
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-semibold text-white">{loading ? 'Lancement...' : 'Générer la vidéo'}</p>
                    <p className="text-[11px] text-white/60">Sans publication automatique</p>
                  </div>
                </div>
                {!loading && <span className="text-white/70">{Icon.arrow}</span>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}