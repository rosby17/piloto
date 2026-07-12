import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialisation du client Supabase (côté serveur)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// DUMMY USER ID pour les tests (à remplacer par le vrai user_id une fois l'auth connectée)
const DUMMY_USER_ID = '00000000-0000-0000-0000-000000000000';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('avatars')
      .select('*')
      .eq('user_id', DUMMY_USER_ID)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json({ avatars: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file || !name) {
      return NextResponse.json({ error: 'Fichier ou nom manquant' }, { status: 400 });
    }

    // 1. Upload du fichier vers Supabase Storage (Bucket "avatars")
    const fileExt = file.name.split('.').pop();
    const fileName = `${DUMMY_USER_ID}-${Date.now()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (storageError) throw storageError;

    // 2. Récupération de l'URL publique
    const { data: { publicUrl } } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(fileName);

    // 3. Insertion dans la table des avatars
    const { data: dbData, error: dbError } = await supabase
      .from('avatars')
      .insert([
        {
          user_id: DUMMY_USER_ID,
          name: name,
          photo_url: publicUrl,
        }
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ avatar: dbData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
