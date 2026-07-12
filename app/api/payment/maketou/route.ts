import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { amount, creditsToAdd } = await req.json();

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {}
        }
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // L'identifiant public du produit "Prix libre" sur Maketou
    const productDocumentId = '84c8e311-2291-4b84-af3e-07d8958fdce9';

    // Conversion Euro -> Francs CFA (1 EUR = ~655 FCFA)
    const amountInFCFA = amount * 655;

    const payload = {
      productDocumentId,
      customerPrice: amountInFCFA, // Prix envoyé en FCFA à Maketou
      email: user.email,
      firstName: user.user_metadata?.full_name?.split(' ')[0] || 'Client',
      lastName: user.user_metadata?.full_name?.split(' ')[1] || 'Rogen',
      redirectURL: `https://piloto-teal.vercel.app/dashboard`,
      meta: {
        userId: user.id,
        creditsToAdd
      }
    };

    const response = await fetch('https://api.maketou.net/api/v1/stores/cart/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MAKETOU_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur Maketou:", data);
      return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 });
    }

    // Rediriger vers l'URL de paiement Maketou
    return NextResponse.json({ checkoutUrl: data.redirectUrl });

  } catch (e) {
    console.error("Erreur serveur API:", e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
