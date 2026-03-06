// app/api/heygen/tts/route.js
export async function POST(request) {
  const { heygenKey, voiceId, script, speed = 1.0, pitch = 0 } = await request.json()

  if (!heygenKey) return Response.json({ error: 'Clé HeyGen manquante' }, { status: 400 })
  if (!voiceId)   return Response.json({ error: 'voiceId manquant' },      { status: 400 })
  if (!script)    return Response.json({ error: 'Script manquant' },       { status: 400 })

  try {
    const body = {
      voice_id: voiceId,
      input:    script,   // ← HeyGen v2 utilise "input" et non "text"
      speed,
      pitch,
    }

    console.log('[TTS] Appel HeyGen avec voiceId:', voiceId)

    // Essai avec l'endpoint v2
    const res = await fetch('https://api.heygen.com/v2/tts', {
      method: 'POST',
      headers: {
        'X-Api-Key':    heygenKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const raw = await res.text()
    console.log('[TTS] Status HeyGen:', res.status)
    console.log('[TTS] Réponse brute:', raw)

    let data
    try { data = JSON.parse(raw) } catch { data = {} }

    if (!res.ok) {
      return Response.json(
        { error: data?.message || data?.error?.message || `HeyGen ${res.status}: ${raw.slice(0, 200)}` },
        { status: 400 }
      )
    }

    const audioUrl    = data.data?.audio_url    || data.audio_url    || null
    const audioBase64 = data.data?.audio_base64 || data.audio_base64 || null

    console.log('[TTS] audioUrl:', audioUrl)
    console.log('[TTS] audioBase64 présent:', !!audioBase64)

    if (!audioUrl && !audioBase64) {
      return Response.json({
        error: 'Aucun audio retourné. Réponse HeyGen: ' + raw.slice(0, 300)
      }, { status: 400 })
    }

    if (audioBase64 && !audioUrl) {
      return Response.json({
        audioUrl: `data:audio/mpeg;base64,${audioBase64}`,
      })
    }

    return Response.json({ audioUrl })

  } catch (err) {
    console.error('[TTS] Erreur:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}