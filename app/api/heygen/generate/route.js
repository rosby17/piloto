import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  const { userId, script, avatarId, voiceId, heygenKey, titre, videoId } = await request.json()

  if (!script || !avatarId || !voiceId || !heygenKey) {
    return Response.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  // Découpe le script si > 5000 chars (limite Heygen)
  const scriptChunks = []
  const maxChars = 4800
  if (script.length <= maxChars) {
    scriptChunks.push(script)
  } else {
    let remaining = script
    while (remaining.length > 0) {
      const chunk = remaining.substring(0, maxChars)
      const lastDot = chunk.lastIndexOf('.')
      const cutAt = lastDot > 0 ? lastDot + 1 : maxChars
      scriptChunks.push(remaining.substring(0, cutAt).trim())
      remaining = remaining.substring(cutAt).trim()
    }
  }

  // Construit les video_inputs (1 scène par chunk)
  const videoInputs = scriptChunks.map(chunk => ({
    character: {
      type: 'avatar',
      avatar_id: avatarId,
      avatar_style: 'normal',
    },
    voice: {
      type: 'text',
      input_text: chunk,
      voice_id: voiceId,
      speed: 1.0,
    },
    background: {
      type: 'color',
      value: '#000000',
    },
  }))

  try {
    // Lance la génération Heygen
    const heygenRes = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': heygenKey,
      },
      body: JSON.stringify({
        video_inputs: videoInputs,
        dimension: { width: 1280, height: 720 },
        title: titre || 'Piloto Video',
      }),
    })

    const heygenData = await heygenRes.json()

    if (heygenData.error || !heygenData.data?.video_id) {
      return Response.json({ error: heygenData.error?.message || 'Erreur Heygen' }, { status: 400 })
    }

    const heygenVideoId = heygenData.data.video_id

    // Met à jour le statut dans Supabase
    if (videoId) {
      await supabase.from('videos').update({
        heygen_video_id: heygenVideoId,
        statut: 'video_en_cours',
      }).eq('id', videoId)
    }

    return Response.json({ success: true, heygenVideoId })

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}