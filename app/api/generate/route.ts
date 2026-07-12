import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // We can parse the FormData if needed later
    // const formData = await req.formData();
    
    // Simuler le temps de traitement de l'IA (ex: 5 secondes)
    await new Promise((resolve) => setTimeout(resolve, 5000));
    
    // Retourner une fausse vidéo générée pour tester le frontend
    return NextResponse.json({ 
      success: true, 
      video_url: "https://www.w3schools.com/html/mov_bbb.mp4" 
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
