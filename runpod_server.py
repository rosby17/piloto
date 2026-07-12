import os
import time
import subprocess
import requests
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
import uuid

# Initialisation de FastAPI
app = FastAPI(title="Rogen AI - RunPod Worker")

# Variables d'environnement (à configurer sur RunPod)
SUPABASE_URL = os.getenv("SUPABASE_URL", "VOTRE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "VOTRE_SUPABASE_KEY") # Utiliser Service Role Key
IZIVOICE_API_KEY = os.getenv("IZIVOICE_API_KEY", "VOTRE_IZIVOICE_API_KEY")

# Initialisation de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class GenerateRequest(BaseModel):
    video_id: str  # L'ID de l'entrée dans la table video_history
    user_id: str
    script_text: str
    avatar_image_url: str
    voice_id: str = "default_voice_id"

def process_video_pipeline(request: GenerateRequest):
    """
    Fonction exécutée en arrière-plan (Background Task) pour ne pas bloquer l'API Vercel.
    """
    work_dir = f"/tmp/{request.video_id}"
    os.makedirs(work_dir, exist_ok=True)
    
    try:
        # ÉTAPE 1 : Mettre à jour le statut dans Supabase
        supabase.table("video_history").update({"status": "generating"}).eq("id", request.video_id).execute()
        
        # ÉTAPE 2 : Chunking du texte (découpage par paragraphes)
        # On découpe le texte pour ne pas surcharger l'API IziVoice ou le GPU d'un seul coup
        paragraphs = [p.strip() for p in request.script_text.split("\n\n") if p.strip()]
        
        audio_files = []
        video_files = []
        
        # Télécharger l'avatar source
        avatar_path = f"{work_dir}/avatar.jpg"
        img_data = requests.get(request.avatar_image_url).content
        with open(avatar_path, 'wb') as f:
            f.write(img_data)
            
        print(f"Début du traitement de {len(paragraphs)} chunks pour la vidéo {request.video_id}")
        
        for i, text_chunk in enumerate(paragraphs):
            # ÉTAPE 3 : Génération Audio avec IziVoice
            print(f"Génération audio {i+1}/{len(paragraphs)}")
            audio_path = f"{work_dir}/audio_{i}.mp3"
            
            # Appel à l'API IziVoice (Adapter l'URL et le format selon leur documentation)
            izi_response = requests.post(
                "https://api.izivoice.com/v1/tts", # Remplacer par la vraie URL
                headers={"Authorization": f"Bearer {IZIVOICE_API_KEY}"},
                json={"text": text_chunk, "voice_id": request.voice_id}
            )
            
            if not izi_response.ok:
                raise Exception(f"Erreur IziVoice sur le chunk {i}: {izi_response.text}")
                
            with open(audio_path, 'wb') as f:
                f.write(izi_response.content)
            audio_files.append(audio_path)
            
            # ÉTAPE 4 : Génération Lipsync avec le modèle local (EchoMimic / LivePortrait)
            print(f"Génération vidéo {i+1}/{len(paragraphs)}")
            video_chunk_path = f"{work_dir}/video_chunk_{i}.mp4"
            
            # TODO: Remplacer par l'appel à votre modèle d'inférence (ex: appel à une fonction Python ou subprocess)
            # Exemple avec EchoMimic / LivePortrait script en ligne de commande :
            # subprocess.run(["python", "inference.py", "--image", avatar_path, "--audio", audio_path, "--output", video_chunk_path], check=True)
            
            # Simulation pour le test : 
            subprocess.run(["ffmpeg", "-loop", "1", "-i", avatar_path, "-i", audio_path, "-c:v", "libx264", "-c:a", "aac", "-b:a", "192k", "-pix_fmt", "yuv420p", "-shortest", video_chunk_path], check=True)
            
            video_files.append(video_chunk_path)
            
        # ÉTAPE 5 : Concaténation de toutes les vidéos avec FFmpeg
        print("Concaténation finale...")
        final_video_path = f"{work_dir}/final_video.mp4"
        list_file_path = f"{work_dir}/list.txt"
        
        with open(list_file_path, 'w') as f:
            for vf in video_files:
                f.write(f"file '{os.path.basename(vf)}'\n")
                
        subprocess.run(["ffmpeg", "-f", "concat", "-safe", "0", "-i", list_file_path, "-c", "copy", final_video_path], check=True)
        
        # ÉTAPE 6 : Upload vers Supabase Storage
        print("Upload vers Supabase...")
        file_name = f"{request.user_id}/{request.video_id}.mp4"
        with open(final_video_path, 'rb') as f:
            supabase.storage.from_("rogen_media").upload(
                path=file_name,
                file=f,
                file_options={"content-type": "video/mp4"}
            )
            
        # Obtenir l'URL publique
        public_url = supabase.storage.from_("rogen_media").get_public_url(file_name)
        
        # ÉTAPE 7 : Mettre à jour la base de données avec l'URL finale
        supabase.table("video_history").update({
            "status": "completed",
            "video_url": public_url
        }).eq("id", request.video_id).execute()
        
        print(f"✅ Vidéo {request.video_id} terminée avec succès !")
        
    except Exception as e:
        print(f"❌ Erreur critique sur {request.video_id} : {str(e)}")
        # Mettre à jour Supabase avec l'erreur
        try:
            supabase.table("video_history").update({"status": "failed"}).eq("id", request.video_id).execute()
        except:
            pass

@app.post("/generate")
async def generate_video(request: GenerateRequest, background_tasks: BackgroundTasks):
    """
    Endpoint appelé par le serveur Vercel. 
    Il démarre le processus en arrière-plan et répond immédiatement "OK" pour éviter un Timeout.
    """
    background_tasks.add_task(process_video_pipeline, request)
    return {"message": "Génération démarrée en arrière-plan", "video_id": request.video_id}

# Pour lancer le serveur en local : 
# uvicorn runpod_server:app --host 0.0.0.0 --port 8000
