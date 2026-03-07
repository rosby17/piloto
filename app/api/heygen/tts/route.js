// app/api/heygen/tts/route.js

export async function POST(req) {
  try {
    const apiKey = process.env.HEYGEN_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'HEYGEN_API_KEY manquante' }, { status: 500 })
    }

    const { texte, voiceId, vitesse = 1.0, pitch = 0 } = await req.json()

    if (!texte?.trim()) {
      return Response.json({ error: 'Texte manquant' }, { status: 400 })
    }
    if (!voiceId) {
      return Response.json({ error: 'voiceId manquant' }, { status: 400 })
    }

    // ── Étape 1 : créer la tâche TTS ──
    const createRes = await fetch('https://api.heygen.com/v1/audio/tts', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text:     texte,
        voice_id: voiceId,
        speed:    vitesse,
        pitch:    pitch,
      }),
    })

    const createData = await createRes.json()
    console.log('TTS create response:', JSON.stringify(createData))

    // Selon la version de l'API HeyGen, la réponse peut être directe ou en polling
    // Cas 1 : url directe dans la réponse
    if (createData?.data?.url) {
      return Response.json({ url: createData.data.url })
    }
    if (createData?.data?.audio_url) {
      return Response.json({ url: createData.data.audio_url })
    }

    // Cas 2 : task_id à poller
    const taskId = createData?.data?.task_id || createData?.task_id
    if (taskId) {
      // Polling jusqu'à 30s
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 1500))

        const statusRes = await fetch(`https://api.heygen.com/v1/audio/tts/${taskId}`, {
          headers: { 'X-Api-Key': apiKey },
        })
        const statusData = await statusRes.json()
        console.log(`TTS poll ${i}:`, JSON.stringify(statusData))

        const url = statusData?.data?.url || statusData?.data?.audio_url
        if (url) return Response.json({ url })

        const status = statusData?.data?.status
        if (status === 'failed' || status === 'error') {
          return Response.json({ error: 'Génération TTS échouée' }, { status: 500 })
        }
      }
      return Response.json({ error: 'Timeout — génération trop longue' }, { status: 504 })
    }

    // Cas inattendu
    console.error('TTS réponse inattendue:', createData)
    return Response.json({
      error: createData?.message || createData?.error || 'Réponse inattendue de HeyGen',
    }, { status: 500 })

  } catch (err) {
    console.error('TTS error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}