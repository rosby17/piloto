import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Webhook Maketou reçu:", body);

    // TODO: Adapter la condition "isSuccess" au format exact envoyé par Maketou
    // Souvent le statut est "paid", "success", ou body.success = true
    const isSuccess = body.status === 'paid' || body.status === 'success' || body.success === true;
    
    // On vérifie que la transaction contient nos métadonnées personnalisées (userId, creditsToAdd)
    if (isSuccess && body.meta && body.meta.userId && body.meta.creditsToAdd) {
      const { userId, creditsToAdd } = body.meta;

      // Connexion Supabase en mode admin (Service Role) pour contourner les RLS
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // On récupère le profil actuel de l'utilisateur
      const { data: profile } = await supabase.from('profiles').select('credits').eq('id', userId).single();
      
      if (profile) {
        // On ajoute les crédits achetés au solde existant
        await supabase
          .from('profiles')
          .update({ credits: profile.credits + parseInt(creditsToAdd) })
          .eq('id', userId);
          
        console.log(`✅ Succès: Ajout de ${creditsToAdd} crédits à l'utilisateur ${userId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Erreur Webhook Maketou:", e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
