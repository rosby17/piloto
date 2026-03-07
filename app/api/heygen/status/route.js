// app/api/heygen/status/route.js
// Rôle : checker le statut d'une vidéo HeyGen et mettre à jour Supabase si terminée
import { createClient } from '@supabase/supabase-js'


export async function POST(request) {
  const { videoId, heygenVideoId, heygenKey } = await request.json()

  if (!heygenVideoId || !heygenKey || !videoId) {
    return Response.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  try {
    const res = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${heygenVideoId}`, {
      headers: { 'X-Api-Key': heygenKey },
    })

    const data = await res.json()
    const status   = data.data?.status
    const videoUrl = data.data?.video_url

    console.log(`HeyGen status check — video_id: ${heygenVideoId} — statut: ${status}`)

    if (status === 'completed' && videoUrl) {
      // Mettre à jour Supabase avec l'URL de la vidéo
      await supabase.from('videos').update({
        statut:        'upload_youtube',
        thumbnail_url: videoUrl,
      }).eq('id', videoId)

      return Response.json({ status: 'completed', videoUrl })
    }

    if (status === 'failed') {
      await supabase.from('videos').update({ statut: 'erreur' }).eq('id', videoId)
      return Response.json({ status: 'failed' })
    }

    // En cours (processing, pending, waiting)
    return Response.json({ status: status || 'processing' })

  } catch (err) {
    console.error('Status check error:', err.message)
    return Response.json({ error: err.message }, { status: 500 })
  }
}