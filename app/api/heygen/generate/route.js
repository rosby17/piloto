// app/api/generate/route.js
import { createClient } from '@supabase/supabase-js'


export async function POST(request) {
  const {
    userId, contenu, avatarId, voiceId, heygenKey,
    titre, description,
  } = await request.json()

  if (!userId)    return Response.json({ error: 'userId manquant' },    { status: 400 })
  if (!contenu)   return Response.json({ error: 'contenu manquant' },   { status: 400 })
  if (!avatarId)  return Response.json({ error: 'avatarId manquant' },  { status: 400 })
  if (!voiceId)   return Response.json({ error: 'voiceId manquant' },   { status: 400 })
  if (!heygenKey) return Response.json({ error: 'heygenKey manquant' }, { status: 400 })

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
  runPipeline({ videoId, contenu, avatarId, voiceId, heygenKey, titre, description })
    .catch(err => {
      console.error('Pipeline error:', err.message)
      supabase.from('videos').update({ statut: 'erreur' }).eq('id', videoId)
    })

  return Response.json({ success: true, videoId })
}

async function runPipeline({ videoId, contenu, avatarId, voiceId, heygenKey, titre, description }) {
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
  const videoUrl = await pollHeygenStatus(heygenVideoId, heygenKey)
  console.log('Video URL reçue:', videoUrl)

  // Vidéo prête — stocker l'URL de téléchargement
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
    const status   = data.data?.status
    const videoUrl = data.data?.video_url

    console.log(`Poll ${i + 1} — statut HeyGen: ${status}`)

    if (status === 'completed' && videoUrl) return videoUrl
    if (status === 'failed') throw new Error('HeyGen: génération échouée')
  }
  throw new Error('HeyGen: timeout 20 min')
}