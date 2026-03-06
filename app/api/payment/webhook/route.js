// app/api/payment/webhook/route.js
// À configurer dans Moneroo dashboard → Settings → Webhooks
// URL : https://ton-domaine.vercel.app/api/payment/webhook

import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()

    if (body.status !== 'success') {
      return NextResponse.json({ received: true })
    }

    const { id: paymentId, metadata } = body
    const plan = metadata?.plan

    // Vérifie le paiement directement auprès de Moneroo
    const verifyRes = await fetch(`https://api.moneroo.io/v1/payments/${paymentId}/verify`, {
      headers: { 'Authorization': `Bearer ${process.env.MONEROO_SECRET_KEY}` }
    })
    const verifyData = await verifyRes.json()

    if (verifyData.data?.status !== 'success') {
      return NextResponse.json({ error: 'Paiement non vérifié' }, { status: 400 })
    }

    // ── TODO : Mettre à jour Supabase ─────────────────────────────────────────
    // Tu as déjà supabase.js dans /lib — voici comment l'utiliser :
    //
    // import { supabase } from '@/lib/supabase'
    //
    // await supabase
    //   .from('users')
    //   .update({
    //     plan,
    //     plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    //   })
    //   .eq('email', verifyData.data.customer.email)

    console.log(`✅ Paiement ${paymentId} confirmé — Plan: ${plan}`)
    return NextResponse.json({ received: true })

  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
