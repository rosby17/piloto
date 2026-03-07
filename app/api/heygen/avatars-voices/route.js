// app/api/heygen/tts/route.js
// Endpoint officiel HeyGen : POST /v1/audio/text_to_speech

export async function POST(req) {
  try {
    const apiKey = process.env.HEYGEN_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'HEYGEN_API_KEY manquante' }, { status: 500 })
    }

    const { texte, voiceId, vitesse = 1.0, pitch = 0 } = await req.json()

    if (!texte?.trim()) return Response.json({ error: 'Texte manquant' }, { status: 400 })
    if (!voiceId)       return Response.json({ error: 'voiceId manquant' }, { status: 400 })

    const headers = {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
    }

    const body = {
      text:     texte.trim(),
      voice_id: voiceId,
      speed:    vitesse,
      pitch:    pitch,
    }

    console.log('TTS → POST /v1/audio/text_to_speech', JSON.stringify(body))

    const res = await fetch('https://api.heygen.com/v1/audio/text_to_speech', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    const data = await res.json()
    console.log('TTS response status:', res.status, JSON.stringify(data))

    // Cas 1 : URL audio directe dans la réponse
    const directUrl = data?.data?.url || data?.data?.audio_url || data?.url || data?.audio_url
    if (directUrl) return Response.json({ url: directUrl })

    // Cas 2 : task_id → polling
    const taskId = data?.data?.task_id || data?.task_id
    if (taskId) {
      console.log('TTS polling task_id:', taskId)
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 2000))
        const pollRes  = await fetch(`https://api.heygen.com/v1/audio/text_to_speech/${taskId}`, { headers })
        const pollData = await pollRes.json()
        console.log(`TTS poll ${i}:`, JSON.stringify(pollData))
        const audioUrl = pollData?.data?.url || pollData?.data?.audio_url
        if (audioUrl) return Response.json({ url: audioUrl })
        const status = pollData?.data?.status
        if (status === 'failed' || status === 'error') {
          return Response.json({ error: 'Génération TTS échouée' }, { status: 500 })
        }
      }
      return Response.json({ error: 'Timeout TTS' }, { status: 504 })
    }

    // Erreur HeyGen explicite
    console.error('TTS réponse inattendue:', data)
    return Response.json({
      error: data?.message || data?.error || `Erreur HeyGen status ${res.status}`,
    }, { status: res.status || 500 })

  } catch (err) {
    console.error('TTS exception:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}