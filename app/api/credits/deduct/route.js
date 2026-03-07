// app/api/credits/deduct/route.js
// Déduit les crédits après une génération HeyGen réussie

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const body = await request.json()
    const { duration_seconds, video_id, description } = body

    if (!duration_seconds) {
      return Response.json({ error: 'duration_seconds requis' }, { status: 400 })
    }

    const credits_to_deduct = Math.ceil((duration_seconds / 60) * 1000)

    // Client Supabase avec session utilisateur
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { get: (name) => cookieStore.get(name)?.value } }
    )

    // Vérifier session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Déduire via fonction Supabase (atomique)
    const { data, error } = await supabase.rpc('deduct_credits', {
      p_user_id:         user.id,
      p_amount:          credits_to_deduct,
      p_description:     description || `Génération vidéo ${duration_seconds}s`,
      p_video_id:        video_id || null,
      p_duration_seconds: duration_seconds,
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }

    if (!data.success) {
      return Response.json({ error: data.error, credits_balance: data.balance }, { status: 402 })
    }

    return Response.json({
      success: true,
      deducted: credits_to_deduct,
      credits_balance: data.balance,
    })

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}