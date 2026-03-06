// app/api/heygen/tts/route.js
// ⚠️  HeyGen TTS direct (POST /v1/audio/text_to_speech) est réservé aux plans API payants (Pro/Scale/Enterprise).

export async function POST(request) {
  const { heygenKey, voiceId, script, speed = 1.0, pitch = 0 } = await request.json()

  if (!heygenKey) return Response.json({ error: 'Clé HeyGen manquante' }, { status: 400 })
  if (!voiceId)   return Response.json({ error: 'voiceId manquant' },      { status: 400 })
  if (!script)    return Response.json({ error: 'Script manquant' },       { status: 400 })

  try {
    const res = await fetch('https://api.heygen.com/v1/audio/text_to_speech', {
      method: 'POST',
      headers: {
        'X-Api-Key':    heygenKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        voice_id: voiceId,
        text:     script,
      }),
    })

    const raw = await res.text()
    console.log('[TTS] Status:', res.status)
    console.log('[TTS] Réponse HeyGen:', raw.slice(0, 500))

    let data
    try { data = JSON.parse(raw) } catch { data = {} }

    if (!res.ok) {
      const heygenMsg = data?.message || data?.error?.message || String(data?.error || '')
      let friendlyError = heygenMsg

      if (res.status === 401 || res.status === 403) {
        friendlyError = 'Clé HeyGen invalide ou accès refusé.'
      } else if (res.status === 400) {
        friendlyError = heygenMsg || 'Erreur 400 — vérifie que ton plan HeyGen supporte le TTS (Pro ou supérieur).'
      } else if (res.status === 429) {
        friendlyError = 'Limite de requêtes HeyGen atteinte. Réessaie dans quelques secondes.'
      }

      return Response.json({ error: friendlyError || `Erreur HeyGen ${res.status}` }, { status: 400 })
    }

    const audioUrl    = data.data?.audio_url    || data.audio_url    || null
    const audioBase64 = data.data?.audio_base64 || data.audio_base64 || null

    if (!audioUrl && !audioBase64) {
      console.log('[TTS] Réponse sans audio:', raw)
      return Response.json({ error: 'Aucun audio retourné. Réponse: ' + raw.slice(0, 200) }, { status: 400 })
    }

    if (audioBase64 && !audioUrl) {
      return Response.json({ audioUrl: `data:audio/mpeg;base64,${audioBase64}` })
    }

    return Response.json({ audioUrl })

  } catch (err) {
    console.error('[TTS] Erreur réseau:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}