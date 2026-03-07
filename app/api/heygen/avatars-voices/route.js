// app/api/heygen/avatars-voices/route.js
// Utilise la clé HeyGen master (plus de clé utilisateur)

export async function POST(request) {
  try {
    // ✅ Clé HeyGen MASTER — jamais exposée au client
    const heygenKey = process.env.HEYGEN_API_KEY

    if (!heygenKey) {
      return Response.json({ error: 'Clé HeyGen non configurée' }, { status: 500 })
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
        { error: `Erreur HeyGen (${avatarsRes.status})` },
        { status: 500 }
      )
    }

    const avatarsData  = await avatarsRes.json()
    const personalData = personalRes.ok ? await personalRes.json() : null
    const voicesData   = voicesRes.ok   ? await voicesRes.json()   : null

    const publicAvatars = (avatarsData.data?.avatars || []).map(a => ({
      avatar_id:         a.avatar_id,
      avatar_name:       a.avatar_name,
      preview_image_url: a.preview_image_url || null,
      gender:            a.gender || null,
      type:              'public',
    }))

    const personalAvatars = (personalData?.data?.avatar_group_list || []).map(g => ({
      avatar_id:         g.id,
      avatar_name:       g.name || 'Mon avatar',
      preview_image_url: g.preview_image_url || g.cover_image_url || null,
      gender:            null,
      type:              'personal',
    }))

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