// app/api/credits/check/route.js
// Vérifie si l'utilisateur a assez de crédits avant une génération

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(request) {
  try {
    const body = await request.json()
    const { duration_seconds = 60 } = body

    // Crédits nécessaires pour cette durée
    const credits_needed = Math.ceil((duration_seconds / 60) * 1000)

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

    // Récupérer crédits
    const { data: credits, error } = await supabase
      .from('user_credits')
      .select('credits_balance, credits_used, credits_limit, plan, reset_at')
      .eq('user_id', user.id)
      .single()

    if (error || !credits) {
      return Response.json({ error: 'Crédits introuvables' }, { status: 404 })
    }

    const has_enough = credits.credits_balance >= credits_needed

    return Response.json({
      has_enough,
      credits_balance: credits.credits_balance,
      credits_needed,
      credits_used: credits.credits_used,
      credits_limit: credits.credits_limit,
      plan: credits.plan,
      reset_at: credits.reset_at,
    })

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}