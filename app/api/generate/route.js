// app/api/generate/route.js
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { userId, contenu, avatarId, voiceId, titre, description } = await request.json()

  if (!userId)   return Response.json({ error: 'userId manquant' },  { status: 400 })
  if (!contenu)  return Response.json({ error: 'contenu manquant' }, { status: 400 })
  if (!avatarId) return Response.json({ error: 'avatarId manquant' },{ status: 400 })
  if (!voiceId)  return Response.json({ error: 'voiceId manquant' }, { status: 400 })

  // 1. Vérifier les crédits
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    return Response.json({ error: 'Profil introuvable' }, { status: 404 })
  }

  if (profile.credits <= 0) {
    return Response.json({ error: 'credits_insuffisants' }, { status: 402 })
  }

  // 2. Déduire 1 crédit
  const { error: creditError } = await supabase
    .from('profiles')
    .update({ credits: profile.credits - 1 })
    .eq('id', userId)

  if (creditError) {
    return Response.json({ error: 'Erreur déduction crédits' }, { status: 500 })
  }

  // 3. Créer la ligne vidéo
  const { data: videoRow, error: insertError } = await supabase
    .from('videos')
    .insert({
      user_id:     userId,
      titre:       titre || 'Nouveau projet',
      description: description || null,
      statut:      'generation_video',
      avatar_id:   avatarId,
      voice_id:    voiceId,
    })
    .select()
    .single()

  if (insertError) {
    // Rembourser le crédit si insert échoue
    await supabase.from('profiles').update({ credits: profile.credits }).eq('id', userId)
    return Response.json({ error: insertError.message }, { status: 500 })
  }

  const videoId = videoRow.id

  // 4. Découper le script si trop long
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

  // 5. Clé HeyGen côté serveur uniquement
  const heygenKey = process.env.HEYGEN_API_KEY

  if (!heygenKey) {
    await supabase.from('videos').update({ statut: 'erreur' }).eq('id', videoId)
    await supabase.from('profiles').update({ credits: profile.credits }).eq('id', userId)
    return Response.json({ error: 'Clé API non configurée' }, { status: 500 })
  }

  // 6. Envoyer à HeyGen
  try {
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

    if (heygenData.error || !heygenData.data?.video_id) {
      await supabase.from('videos').update({ statut: 'erreur' }).eq('id', videoId)
      // Rembourser le crédit si HeyGen échoue
      await supabase.from('profiles').update({ credits: profile.credits }).eq('id', userId)
      return Response.json({ error: heygenData.error?.message || 'HeyGen: pas de video_id' }, { status: 400 })
    }

    const heygenVideoId = heygenData.data.video_id

    await supabase.from('videos').update({
      heygen_video_id: heygenVideoId,
      statut: 'video_en_cours',
    }).eq('id', videoId)

    return Response.json({ success: true, videoId, heygenVideoId, creditsRestants: profile.credits - 1 })

  } catch (err) {
    await supabase.from('videos').update({ statut: 'erreur' }).eq('id', videoId)
    await supabase.from('profiles').update({ credits: profile.credits }).eq('id', userId)
    return Response.json({ error: err.message }, { status: 500 })
  }
}