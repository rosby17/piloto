import { createClient } from '@supabase/supabase-js'
import { google } from 'googleapis'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ── Helpers ────────────────────────────────────────────────

async function genererScriptIA(contenu, duree) {
  const mots = duree === '60' ? 120 : duree === '180' ? 360 : 1200
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Tu es un expert en création de contenu YouTube viral. Génère un script parlé naturel et engageant d'environ ${mots} mots (${duree} secondes). Le script doit être direct, sans introduction longue, adapté à un avatar IA qui parle face caméra. Retourne UNIQUEMENT le texte du script, sans titre ni mise en forme.\n\nContenu source :\n\n${contenu}`
      }]
    })
  })
  const data = await res.json()
  if (!res.ok) console.error('Anthropic genScript error:', JSON.stringify(data))
  return data.choices?.[0]?.message?.content || contenu
}

async function genererMetadonnees(script) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Expert YouTube. Génère titre viral (max 80 chars) + description SEO (max 300 chars) en français.\n\nScript: ${script.substring(0, 500)}\n\nJSON uniquement: {"titre":"...","description":"..."}`
      }]
    })
  })
  const data = await res.json()
  if (!res.ok) console.error('Anthropic genMeta error:', JSON.stringify(data))
  const text = data.choices?.[0]?.message?.content || '{}'
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return { titre: 'Ma vidéo Piloto', description: '' }
  }
}

async function creerVideoHeygen(script, avatarId, voiceId, heygenKey) {
  const scriptFinal = script.substring(0, 4900)

  const res = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: {
      'X-Api-Key': heygenKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      video_inputs: [{
        character: {
          type: 'avatar',
          avatar_id: avatarId,
          avatar_style: 'normal'
        },
        voice: {
          type: 'text',
          input_text: scriptFinal,
          voice_id: voiceId,
          speed: 1.0,
        },
        background: {
          type: 'color',
          value: '#FAFAFA'
        }
      }],
      dimension: { width: 1280, height: 720 },
      aspect_ratio: null,
    })
  })

  const data = await res.json()

  if (!data?.data?.video_id) {
    console.error('HeyGen response:', JSON.stringify(data))
    throw new Error(`Heygen erreur: ${data?.message || data?.error || JSON.stringify(data)}`)
  }

  return data.data.video_id
}

async function attendreVideoHeygen(videoId, heygenKey, maxTentatives = 60) {
  for (let i = 0; i < maxTentatives; i++) {
    await new Promise(r => setTimeout(r, 15000))

    const res = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
      headers: { 'X-Api-Key': heygenKey }
    })
    const data = await res.json()
    const status = data?.data?.status

    console.log(`HeyGen status [${i + 1}/${maxTentatives}]: ${status}`)

    if (status === 'completed') return data.data.video_url
    if (status === 'failed') {
      throw new Error(`Heygen failed: ${JSON.stringify(data.data.error || data.data)}`)
    }
  }
  throw new Error('Timeout: la vidéo HeyGen prend trop longtemps (>15 min)')
}

async function uploaderSurYoutube({ videoUrl, titre, description, channelData, datePublication }) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/youtube/callback`
  )

  oauth2Client.setCredentials({
    access_token: channelData.access_token,
    refresh_token: channelData.refresh_token,
  })

  const videoRes = await fetch(videoUrl)
  const videoBuffer = await videoRes.arrayBuffer()
  const videoStream = Buffer.from(videoBuffer)

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

  const uploadRes = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: titre || 'Ma vidéo Piloto',
        description: description || '',
        tags: ['IA', 'Piloto', 'YouTube automation'],
        categoryId: '22',
        defaultLanguage: 'fr',
      },
      status: {
        privacyStatus: datePublication ? 'private' : 'public',
        publishAt: datePublication || undefined,
      }
    },
    media: {
      mimeType: 'video/mp4',
      body: require('stream').Readable.from(videoStream),
    }
  })

  return uploadRes.data.id
}

// ── Route POST principale ──────────────────────────────────

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      userId,
      contenu,
      duree,
      avatarId,
      voiceId,
      heygenKey,
      titre: titreManuel,
      description: descriptionManuelle,
      chaineId,          // optionnel — null si publication manuelle
      datePublication,
      scriptDirect,
      stopAfterVideo,    // true → s'arrête après HeyGen, pas d'upload YouTube
    } = body

    // ── Validation — chaineId optionnel si stopAfterVideo ──
    if (!userId || !contenu || !avatarId || !voiceId || !heygenKey) {
      return Response.json(
        { error: `Paramètres manquants: ${[
          !userId && 'userId',
          !contenu && 'contenu',
          !avatarId && 'avatarId',
          !voiceId && 'voiceId',
          !heygenKey && 'heygenKey',
        ].filter(Boolean).join(', ')}` },
        { status: 400 }
      )
    }

    // chaineId requis seulement si on publie sur YouTube
    if (!stopAfterVideo && !chaineId) {
      return Response.json(
        { error: 'chaineId requis pour la publication YouTube' },
        { status: 400 }
      )
    }

    // Récupère les infos de la chaîne si nécessaire
    let chaineData = null
    if (chaineId && !stopAfterVideo) {
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .eq('id', chaineId)
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        return Response.json({ error: 'Chaîne introuvable' }, { status: 404 })
      }
      chaineData = data
    }

    // Crée l'entrée vidéo en base
    const insertPayload = {
      user_id: userId,
      channel_id: chaineData?.channel_id || null,
      script: contenu,
      duree: parseInt(duree) || 60,
      statut: scriptDirect ? 'generation_video' : 'generation_script',
    }
    // Ajoute date_publication seulement si fournie (évite erreur colonne nullable)
    if (datePublication) insertPayload.date_publication = datePublication

    const { data: video, error: videoError } = await supabase
      .from('videos')
      .insert(insertPayload)
      .select()
      .single()

    if (videoError) {
      console.error('Supabase insert error:', JSON.stringify(videoError))
      return Response.json({ error: `Erreur création vidéo: ${videoError.message}` }, { status: 500 })
    }

    const videoDbId = video.id

    // Lance le pipeline en arrière-plan
    runPipeline({
      videoDbId, userId, contenu, duree: duree || '60',
      avatarId, voiceId, heygenKey,
      titreManuel, descriptionManuelle,
      chaineData, datePublication,
      scriptDirect: !!scriptDirect,
      stopAfterVideo: !!stopAfterVideo,
    }).catch(async (err) => {
      console.error('Pipeline error:', err)
      await supabase.from('videos').update({ statut: 'erreur' }).eq('id', videoDbId)
    })

    return Response.json({ success: true, videoId: videoDbId })

  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

// ── Pipeline complet ───────────────────────────────────────

async function runPipeline({
  videoDbId, userId, contenu, duree,
  avatarId, voiceId, heygenKey,
  titreManuel, descriptionManuelle,
  chaineData, datePublication,
  scriptDirect, stopAfterVideo,
}) {
  const update = (statut, extra = {}) =>
    supabase.from('videos').update({ statut, ...extra }).eq('id', videoDbId)

  let script

  if (scriptDirect) {
    script = contenu
    await update('script_pret', { script })
  } else {
    await update('generation_script')
    script = await genererScriptIA(contenu, duree)
    await update('script_pret', { script })
  }

  // Génère titre + description si non fournis
  let titre = titreManuel
  let description = descriptionManuelle
  if (!titre || !description) {
    const meta = await genererMetadonnees(script)
    titre = titre || meta.titre
    description = description || meta.description
  }
  await update('meta_pret', { titre, description })

  // Envoie à HeyGen
  await update('generation_video')
  const heygenVideoId = await creerVideoHeygen(script, avatarId, voiceId, heygenKey)
  await update('video_en_cours', { heygen_video_id: heygenVideoId })

  // Attend la fin de génération HeyGen
  const videoUrl = await attendreVideoHeygen(heygenVideoId, heygenKey)

  // ── Arrêt après HeyGen (publication manuelle) ──────────────
  if (stopAfterVideo) {
    await update('publiee', { thumbnail_url: videoUrl })
    return
  }

  // ── Upload YouTube automatique ─────────────────────────────
  await update('upload_youtube')
  const youtubeVideoId = await uploaderSurYoutube({
    videoUrl, titre, description, channelData: chaineData, datePublication
  })

  const statut = datePublication ? 'programmee' : 'publiee'
  await update(statut, {
    youtube_video_id: youtubeVideoId,
    thumbnail_url: videoUrl,
  })
}