import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialisation du client Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*, avatars (name, photo_url)') // Jointure avec la table avatars
      .eq('user_id', DUMMY_USER_ID)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json({ videos: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { avatar_id, text } = await request.json();

    if (!avatar_id || !text) {
      return NextResponse.json({ error: 'Avatar ou texte manquant' }, { status: 400 });
    }

    // 1. Appel à l'API TTS IziVoice
    const izivoiceApiKey = process.env.IZIVOICE_API_KEY;
    if (!izivoiceApiKey) {
      return NextResponse.json({ error: 'Clé API IziVoice (IZIVOICE_API_KEY) manquante dans le serveur.' }, { status: 500 });
    }

    const ttsResponse = await fetch('https://www.izivoice.app/api/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${izivoiceApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text,
        voice_id: 'cheikh_sn' // Hardcodé pour l'instant (à rendre dynamique plus tard)
      })
    });

    const ttsData = await ttsResponse.json();

    if (!ttsData.success) {
      return NextResponse.json({ error: ttsData.message || "Erreur de génération vocale (IziVoice)" }, { status: 500 });
    }

    const audioUrl = ttsData.audio_url || ttsData.task_id; // Support des formats synchrones et asynchrones


    // 2. Création de l'entrée dans la base de données (statut 'pending' par défaut)
    const { data: dbData, error: dbError } = await supabase
      .from('videos')
      .insert([
        {
          user_id: DUMMY_USER_ID,
          avatar_id: avatar_id,
          source_text: text,
          audio_url: audioUrl,
          // video_url sera rempli plus tard par le serveur GPU
        }
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    // 3. (Futur) Envoi de la requête au serveur GPU (RunPod FastAPI)
    // fetch('http://ip-du-gpu:8000/generate', { ... })

    return NextResponse.json({ video: dbData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
