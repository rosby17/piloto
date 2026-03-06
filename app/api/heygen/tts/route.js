// app/api/heygen/tts/route.js
export async function POST(request) {
  const { heygenKey, voiceId, script, speed = 1.0, pitch = 0 } = await request.json()

  if (!heygenKey) return Response.json({ error: 'Clé HeyGen manquante' }, { status: 400 })
  if (!voiceId)   return Response.json({ error: 'voiceId manquant' },      { status: 400 })
  if (!script)    return Response.json({ error: 'Script manquant' },       { status: 400 })

  // Endpoints à essayer dans l'ordre
  const attempts = [
    {
      url: 'https://api.heygen.com/v1/text_to_speech',
      body: { voice_id: voiceId, text: script, speed, pitch },
    },
    {
      url: 'https://api.heygen.com/v1/text_to_speech',
      body: { voice_id: voiceId, input: script, speed, pitch },
    },
    {
      url: 'https://api.heygen.com/v1/tts',
      body: { voice_id: voiceId, text: script, speed, pitch },
    },
  ]

  let lastError = ''

  for (const attempt of attempts) {
    try {
      console.log('[TTS] Essai:', attempt.url, JSON.stringify(attempt.body).slice(0, 100))

      const res = await fetch(attempt.url, {
        method: 'POST',
        headers: {
          'X-Api-Key':    heygenKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attempt.body),
      })

      const raw = await res.text()
      console.log('[TTS] Status:', res.status, '| Réponse:', raw.slice(0, 300))

      // Skip les 404
      if (res.status === 404) { lastError = `404 sur ${attempt.url}`; continue }

      let data
      try { data = JSON.parse(raw) } catch { data = {} }

      if (!res.ok) {
        lastError = data?.message || data?.error?.message || raw.slice(0, 200)
        continue
      }

      const audioUrl    = data.data?.audio_url    || data.audio_url    || null
      const audioBase64 = data.data?.audio_base64 || data.audio_base64 || null

      if (!audioUrl && !audioBase64) {
        lastError = 'Aucun audio dans la réponse: ' + raw.slice(0, 200)
        continue
      }

      if (audioBase64 && !audioUrl) {
        return Response.json({ audioUrl: `data:audio/mpeg;base64,${audioBase64}` })
      }

      return Response.json({ audioUrl })

    } catch (err) {
      console.error('[TTS] Erreur réseau:', err.message)
      lastError = err.message
    }
  }

  return Response.json({ error: lastError || 'Tous les endpoints ont échoué' }, { status: 400 })
}