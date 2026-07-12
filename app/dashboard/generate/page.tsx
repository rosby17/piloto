"use client";

import { motion } from "framer-motion";
import { Play, Loader2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface Avatar {
  id: string;
  name: string;
  photo_url: string;
}

export default function GeneratePage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const res = await fetch("/api/avatars");
        const data = await res.json();
        if (data.avatars) {
          setAvatars(data.avatars);
          if (data.avatars.length > 0) {
            setSelectedAvatar(data.avatars[0].id);
          }
        }
      } catch (error) {
        console.error("Erreur de chargement", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvatars();
  }, []);

  const handleGenerate = async () => {
    if (!text || !selectedAvatar) return;
    setIsGenerating(true);
    
    try {
      const selectedAvatarObj = avatars.find(a => a.id === selectedAvatar);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          script_text: text, 
          avatar_image_url: selectedAvatarObj?.photo_url,
          voice_id: "default_voice"
        }),
      });
      const data = await res.json();
      
      if (data.success || data.video_id) {
        alert("La vidéo a été ajoutée à la file d'attente ! Redirection vers l'historique...");
        window.location.href = "/dashboard/history";
      } else {
        alert("Erreur: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Générer une vidéo</h1>
        <p className="text-gray-400">Faites parler votre avatar avec la puissance d'EchoMimic.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: Controls */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Avatar Selection */}
          <section className="space-y-4">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm">1</span>
              Choisissez un avatar
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {isLoading ? (
                <div className="w-24 h-24 rounded-2xl bg-white/10 animate-pulse shrink-0" />
              ) : avatars.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun avatar trouvé. Veuillez en créer un dans "Mes Avatars".</p>
              ) : (
                avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`relative shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                      selectedAvatar === avatar.id 
                        ? "border-rose-500 scale-105 shadow-[0_0_20px_rgba(244,63,94,0.3)]" 
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatar.photo_url} alt={avatar.name} className="w-24 h-24 object-cover" />
                    {selectedAvatar === avatar.id && (
                      <div className="absolute inset-0 ring-inset ring-2 ring-rose-500 rounded-xl" />
                    )}
                  </button>
                ))
              )}
            </div>
          </section>

          {/* Text Input */}
          <section className="space-y-4">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm">2</span>
              Texte à prononcer
            </h2>
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tapez le texte que votre avatar doit dire... (ex: Bonjour et bienvenue sur ma chaîne !)"
                className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none"
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-500">
                {text.length} / 500 caractères
              </div>
            </div>
          </section>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!text || !selectedAvatar || isGenerating}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-rose-500 to-indigo-600 hover:opacity-90 shadow-[0_0_30px_rgba(244,63,94,0.3)]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Générer la vidéo
              </>
            )}
          </button>
        </div>

        {/* Right column: Preview */}
        <div className="md:col-span-1 space-y-4">
           <h2 className="text-lg font-medium">Aperçu</h2>
           <div className="aspect-[9/16] rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
              {selectedAvatar ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={avatars.find(a => a.id === selectedAvatar)?.photo_url} 
                    alt="Preview" 
                    className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm"
                  />
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center z-10 border border-white/30 group-hover:scale-110 transition-transform cursor-not-allowed">
                    <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
                  </div>
                  <p className="z-10 mt-4 text-sm font-medium text-white/80">Aperçu indisponible</p>
                </>
              ) : (
                <p className="text-gray-500 text-sm">Sélectionnez un avatar</p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
