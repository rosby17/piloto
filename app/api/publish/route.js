import { createClient } from '@supabase/supabase-js'
import { google } from 'googleapis'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { videoId, userId } = await request.json()

    if (!videoId || !userId) {
      return Response.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    // Récupère la vidéo
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('user_id', userId)
      .single()

    if (videoError || !video) {
      return Response.json({ error: 'Vidéo introuvable' }, { status: 404 })
    }

    if (video.statut !== 'video_prete' && video.statut !== 'upload_youtube') {
      return Response.json({ error: 'La vidéo n\'est pas prête à être publiée' }, { status: 400 })
    }

    if (!video.thumbnail_url) {
      return Response.json({ error: 'URL de la vidéo manquante' }, { status: 400 })
    }

    // Récupère la chaîne YouTube
    const { data: chaineData, error: chaineError } = await supabase
      .from('youtube_channels')
      .select('*')
      .eq('channel_id', video.channel_id)
      .eq('user_id', userId)
      .single()

    if (chaineError || !chaineData) {
      return Response.json({ error: 'Chaîne YouTube introuvable' }, { status: 404 })
    }

    // Lance l'upload en arrière-plan
    uploadYoutube({ video, chaineData }).catch(async (err) => {
      console.error('Publish error:', err)
      await supabase.from('videos').update({ statut: 'erreur' }).eq('id', videoId)
    })

    return Response.json({ success: true })

  } catch (err) {
    console.error(err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

async function uploadYoutube({ video, chaineData }) {
  const update = (statut, extra = {}) =>
    supabase.from('videos').update({ statut, ...extra }).eq('id', video.id)

  await update('upload_youtube')

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/youtube/callback`
  )

  oauth2Client.setCredentials({
    access_token: chaineData.access_token,
    refresh_token: chaineData.refresh_token,
  })

  const videoRes = await fetch(video.thumbnail_url)
  const videoBuffer = await videoRes.arrayBuffer()
  const videoStream = Buffer.from(videoBuffer)

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

  const uploadRes = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: video.titre || 'Ma vidéo Piloto',
        description: video.description || '',
        tags: ['IA', 'Piloto', 'YouTube automation'],
        categoryId: '22',
        defaultLanguage: 'fr',
      },
      status: {
        privacyStatus: video.date_publication ? 'private' : 'public',
        publishAt: video.date_publication || undefined,
      }
    },
    media: {
      mimeType: 'video/mp4',
      body: require('stream').Readable.from(videoStream),
    }
  })

  const youtubeVideoId = uploadRes.data.id
  await update(video.date_publication ? 'programmee' : 'publiee', {
    youtube_video_id: youtubeVideoId
  })
}
