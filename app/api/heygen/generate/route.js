// app/api/generate/route.js
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Client Supabase admin (service role) pour les opérations backend
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  const {
    userId, contenu, avatarId, voiceId,
    titre, description,
    estimated_duration_seconds = 60, // durée estimée avant génération
  } = await request.json()

  // ✅ heygenKey supprimé — on utilise la clé master
  const heygenKey = process.env.HEYGEN_API_KEY
  if (!heygenKey) return Response.json({ error: 'Clé HeyGen non configurée' }, { status: 500 })

  if (!userId)   return Response.json({ error: 'userId manquant' },   { status: 400 })
  if (!contenu)  return Response.json({ error: 'contenu manquant' },  { status: 400 })
  if (!avatarId) return Response.json({ error: 'avatarId manquant' }, { status: 400 })
  if (!voiceId)  return Response.json({ error: 'voiceId manquant' },  { status: 400 })

  // ✅ Vérifier session utilisateur
  const cookieStore = cookies()
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  if (authError || !user || user.id !== userId) {
    return Response.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // ✅ Vérifier les crédits AVANT de lancer la génération
  const credits_needed = Math.ceil((estimated_duration_seconds / 60) * 1000)
  const { data: userCredits, error: creditsError } = await supabase
    .from('user_credits')
    .select('credits_balance, plan')
    .eq('user_id', userId)
    .single()

  if (creditsError || !userCredits) {
    return Response.json({ error: 'Impossible de vérifier les crédits' }, { status: 500 })
  }

  if (userCredits.credits_balance < credits_needed) {
    return Response.json({
      error: 'Crédits insuffisants',
      credits_balance: userCredits.credits_balance,
      credits_needed,
      upgrade_required: true,
    }, { status: 402 })
  }

  // 1. Créer la ligne vidéo dans Supabase
  const { data: videoRow, error: insertError } = await supabase
    .from('videos')
    .insert({
      user_id:     userId,
      titre:       titre || null,
      description: description || null,
      statut:      'generation_video',
      avatar_id:   avatarId,
      voice_id:    voiceId,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Supabase insert error:', JSON.stringify(insertError))
    return Response.json({ error: insertError.message }, { status: 500 })
  }

  const videoId = videoRow.id

  // 2. Pipeline en arrière-plan (non-bloquant)
  runPipeline({ videoId, userId, contenu, avatarId, voiceId, heygenKey, titre, description })
    .catch(err => {
      console.error('Pipeline error:', err.message)
      supabase.from('videos').update({ statut: 'erreur' }).eq('id', videoId)
    })

  return Response.json({
    success: true,
    videoId,
    credits_balance: userCredits.credits_balance,
    credits_needed,
  })
}

async function runPipeline({ videoId, userId, contenu, avatarId, voiceId, heygenKey, titre, description }) {
  const update = (statut, extra = {}) =>
    supabase.from('videos').update({ statut, ...extra }).eq('id', videoId)

  await update('generation_video')

  // Découpe le script si > 4800 chars
  const maxChars = 4800
  const chunks = []
  if (contenu.length <= maxChars) {
    chunks.push(contenu)
  } else {
    let remaining = contenu
    while (remaining.length > 0) {
      const chunk = remaining.substring(0, maxChars)
      const lastDot = chunk.lastIndexOf('.')
      const cutAt = lastDot > 0 ? lastDot + 1 : maxChars
      chunks.push(remaining.substring(0, cutAt).trim())
      remaining = remaining.substring(cutAt).trim()
    }
  }

  const videoInputs = chunks.map(chunk => ({
    character:  { type: 'avatar', avatar_id: avatarId, avatar_style: 'normal' },
    voice:      { type: 'text', input_text: chunk, voice_id: voiceId, speed: 1.0 },
    background: { type: 'color', value: '#000000' },
  }))

  // Envoi à HeyGen
  const heygenRes = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': heygenKey },
    body: JSON.stringify({
      video_inputs: videoInputs,
      dimension: { width: 1280, height: 720 },
      title: titre || 'Piloto Video',
    }),
  })

  const heygenData = await heygenRes.json()
  console.log('HeyGen response:', JSON.stringify(heygenData))

  if (heygenData.error || !heygenData.data?.video_id) {
    throw new Error(heygenData.error?.message || 'HeyGen: pas de video_id')
  }

  const heygenVideoId = heygenData.data.video_id
  await update('video_en_cours', { heygen_video_id: heygenVideoId })

  // Polling jusqu'à completion (max 20 min)
  const { videoUrl, duration_seconds } = await pollHeygenStatus(heygenVideoId, heygenKey)
  console.log('Video URL reçue:', videoUrl, '— durée:', duration_seconds, 's')

  // ✅ Déduire les crédits APRÈS succès avec la durée réelle
  const credits_to_deduct = Math.ceil((duration_seconds / 60) * 1000)
  const { data: deductResult } = await supabase.rpc('deduct_credits', {
    p_user_id:          userId,
    p_amount:           credits_to_deduct,
    p_description:      `Vidéo générée : ${titre || 'Sans titre'}`,
    p_video_id:         heygenVideoId,
    p_duration_seconds: duration_seconds,
  })

  if (!deductResult?.success) {
    console.error('Erreur déduction crédits:', deductResult?.error)
    // On ne bloque pas — la vidéo est générée, on log l'erreur
  } else {
    console.log(`✅ ${credits_to_deduct} crédits déduits — solde: ${deductResult.balance}`)
  }

  // Vidéo prête — stocker l'URL
  await update('upload_youtube', {
    thumbnail_url: videoUrl,
    titre:         titre || null,
    description:   description || null,
  })

  console.log(`✅ Vidéo ${videoId} prête`)
}

async function pollHeygenStatus(heygenVideoId, heygenKey, maxAttempts = 120, intervalMs = 10000) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, intervalMs))

    const res = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${heygenVideoId}`, {
      headers: { 'X-Api-Key': heygenKey },
    })
    const data = await res.json()
    const status       = data.data?.status
    const videoUrl     = data.data?.video_url
    const duration     = data.data?.duration  // durée réelle en secondes

    console.log(`Poll ${i + 1} — statut HeyGen: ${status}`)

    if (status === 'completed' && videoUrl) {
      return {
        videoUrl,
        duration_seconds: duration || 60,
      }
    }
    if (status === 'failed') throw new Error('HeyGen: génération échouée')
  }
  throw new Error('HeyGen: timeout 20 min')
}