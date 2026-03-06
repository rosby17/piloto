// app/api/payment/initialize/route.js

import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    const { plan, amount, currency, planName } = body

    if (!plan || !amount || !currency) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const MONEROO_SECRET_KEY = process.env.MONEROO_SECRET_KEY
    if (!MONEROO_SECRET_KEY) {
      return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 })
    }

    const monerooRes = await fetch('https://api.moneroo.io/v1/payments/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MONEROO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount,
        currency,
        description: `Piloto ${planName} — abonnement mensuel`,
        metadata: { plan },

        // ── Customer ────────────────────────────────────────────────────────
        // TODO: remplace par les vraies infos de l'utilisateur connecté (Supabase session)
        customer: {
          email: 'test@piloto.tools-cl.com',
          first_name: 'Test',
          last_name: 'User',
          phone: '+2250700000001', // ✅ numéro de test Moneroo → simule un paiement réussi
          // +2250700000002 → échoué | +2250700000003 → en attente
        },

        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/paiement/succes?plan=${plan}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#tarifs`,
      }),
    })

    const monerooData = await monerooRes.json()

    if (!monerooRes.ok) {
      console.error('Moneroo error:', monerooData)
      return NextResponse.json(
        { error: monerooData.message || 'Erreur Moneroo' },
        { status: monerooRes.status }
      )
    }

    return NextResponse.json({
      checkout_url: monerooData.data?.checkout_url,
      payment_id: monerooData.data?.id,
    })

  } catch (err) {
    console.error('Payment init error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}