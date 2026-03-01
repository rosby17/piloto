import { google } from 'googleapis'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('state') // récupéré depuis le dashboard

  const callbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/youtube/callback`

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    callbackUrl
  )

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly',
    ],
    prompt: 'consent',
    state: userId, // ← transmet l'userId à Google, qui le renvoie dans le callback
  })

  return Response.redirect(url)
}