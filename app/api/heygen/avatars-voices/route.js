// app/api/heygen/avatars-voices/route.js
// Récupère avatars publics + avatars personnels + voix

export async function POST(request) {
  try {
    const body = await request.json()
    const heygenKey = (body.heygenKey || body.apiKey || '').trim()

    if (!heygenKey) {
      return Response.json({ error: 'Clé API manquante' }, { status: 400 })
    }

    // 3 appels en parallèle : avatars publics + avatars perso + voix
    const [avatarsRes, personalRes, voicesRes] = await Promise.all([
      fetch('https://api.heygen.com/v2/avatars', {
        headers: { 'X-Api-Key': heygenKey },
      }),
      fetch('https://api.heygen.com/v2/photo_avatar/avatar_group/list', {
        headers: { 'X-Api-Key': heygenKey },
      }),
      fetch('https://api.heygen.com/v2/voices', {
        headers: { 'X-Api-Key': heygenKey },
      }),
    ])

    if (!avatarsRes.ok) {
      return Response.json(
        { error: `Clé API invalide (${avatarsRes.status})` },
        { status: 401 }
      )
    }

    const avatarsData  = await avatarsRes.json()
    const personalData = personalRes.ok ? await personalRes.json() : null
    const voicesData   = voicesRes.ok   ? await voicesRes.json()   : null

    // Avatars publics HeyGen
    const publicAvatars = (avatarsData.data?.avatars || []).map(a => ({
      avatar_id:         a.avatar_id,
      avatar_name:       a.avatar_name,
      preview_image_url: a.preview_image_url || null,
      gender:            a.gender || null,
      type:              'public',
    }))

    // Avatars personnels (Photo Avatar / Digital Twin)
    const personalAvatars = (personalData?.data?.avatar_group_list || []).map(g => ({
      avatar_id:         g.id,
      avatar_name:       g.name || 'Mon avatar',
      preview_image_url: g.preview_image_url || g.cover_image_url || null,
      gender:            null,
      type:              'personal',
    }))

    // Fusion : avatars perso en premier
    const avatars = [...personalAvatars, ...publicAvatars]

    const voices = (voicesData?.data?.voices || []).map(v => ({
      voice_id: v.voice_id,
      name:     v.name,
      language: v.language,
      locale:   v.locale,
      gender:   v.gender,
    }))

    return Response.json({ avatars, voices })

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}