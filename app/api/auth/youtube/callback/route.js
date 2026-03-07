import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'


export async function GET(request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const userId = searchParams.get('state')

  if (!code) {
    return Response.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=no_code`)
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/youtube/callback`
  )

  const { tokens } = await oauth2Client.getToken(code)
  oauth2Client.setCredentials(tokens)

  // Récupère infos de la chaîne
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client })
  const { data } = await youtube.channels.list({ part: 'snippet', mine: true })
  const channel = data.items?.[0]

  if (!channel) {
    return Response.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=no_channel`)
  }

  // Sauvegarde dans Supabase
  await supabase.from('youtube_channels').upsert({
    user_id: userId,
    channel_id: channel.id,
    channel_name: channel.snippet.title,
    channel_thumbnail: channel.snippet.thumbnails?.default?.url,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  }, { onConflict: 'channel_id' })

  return Response.redirect(`${process.env.NEXTAUTH_URL}/dashboard?success=channel_connected`)
}
