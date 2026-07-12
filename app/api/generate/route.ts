import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
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
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { script_text, avatar_image_url, voice_id } = body;

    if (!script_text || !avatar_image_url) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    // 1. Vérifier si l'utilisateur a des crédits
    const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single();
    if (!profile || profile.credits < 1) {
      return NextResponse.json({ error: "Crédits insuffisants. Veuillez recharger votre compte." }, { status: 403 });
    }

    // 2. Déduire 1 crédit (ou plus selon la longueur du script)
    await supabase.from('profiles').update({ credits: profile.credits - 1 }).eq('id', user.id);

    // 3. Créer l'entrée dans l'historique vidéo avec le statut "pending"
    const { data: videoEntry, error: dbError } = await supabase.from('video_history').insert({
      user_id: user.id,
      prompt: script_text.substring(0, 100) + "...", // Sauvegarde un bout du script
      status: 'pending',
      thumbnail_url: avatar_image_url
    }).select().single();

    if (dbError || !videoEntry) {
      console.error(dbError);
      return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
    }

    // 4. Envoyer la tâche au Serveur RunPod en arrière-plan
    const RUNPOD_URL = process.env.RUNPOD_API_URL;
    if (RUNPOD_URL) {
      // Ne pas bloquer l'API Vercel avec "await" pour la réponse si ça prend du temps, 
      // bien que notre FastAPI RunPod réponde "OK" immédiatement grâce aux BackgroundTasks.
      fetch(`${RUNPOD_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: videoEntry.id,
          user_id: user.id,
          script_text,
          avatar_image_url,
          voice_id: voice_id || 'default'
        })
      }).catch(err => console.error("Erreur d'appel vers RunPod:", err));
    } else {
      console.warn("RUNPOD_API_URL n'est pas défini. Simulation de la vidéo...");
      // Simulation pour tester l'interface
      setTimeout(async () => {
        await supabase.from('video_history').update({
          status: 'completed',
          video_url: "https://www.w3schools.com/html/mov_bbb.mp4"
        }).eq('id', videoEntry.id);
      }, 5000);
    }

    // 5. Retourner l'ID de la vidéo au Frontend
    return NextResponse.json({ success: true, video_id: videoEntry.id });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
