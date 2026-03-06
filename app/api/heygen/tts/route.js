// app/api/heygen/tts/route.js
export async function POST(request) {
  const { heygenKey, voiceId, script, speed = 1.0, pitch = 0 } = await request.json()

  if (!heygenKey) return Response.json({ error: 'Clé HeyGen manquante' }, { status: 400 })
  if (!voiceId)   return Response.json({ error: 'voiceId manquant' },      { status: 400 })
  if (!script)    return Response.json({ error: 'Script manquant' },       { status: 400 })

  try {
    const res = await fetch('https://api.heygen.com/v1/text_to_speech', {
      method: 'POST',
      headers: {
        'X-Api-Key': heygenKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        voice_id: voiceId,
        text:     script,
        speed,
        pitch,
      }),
    })

    const data = await res.json()

    if (!res.ok || data.error) {
      return Response.json(
        { error: data.error?.message || data.message || 'Erreur HeyGen TTS' },
        { status: 400 }
      )
    }

    // HeyGen TTS retourne l'audio en base64 ou un URL direct selon le plan
    const audioUrl    = data.data?.audio_url    || data.audio_url    || null
    const audioBase64 = data.data?.audio_base64 || data.audio_base64 || null

    if (!audioUrl && !audioBase64) {
      return Response.json({ error: 'Aucun audio retourné par HeyGen' }, { status: 400 })
    }

    // Si base64 → on retourne un data URL écoutables directement dans le browser
    if (audioBase64 && !audioUrl) {
      return Response.json({
        audioUrl: `data:audio/mpeg;base64,${audioBase64}`,
      })
    }

    return Response.json({ audioUrl })

  } catch (err) {
    console.error('TTS error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}