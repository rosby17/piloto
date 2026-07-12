"use client";

import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Image as ImageIcon, Trash2, Loader2, Video } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Avatar {
  id: string;
  name: string;
  photo_url: string;
  created_at: string;
}

export default function AvatarsPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les avatars depuis la base de données
  const fetchAvatars = async () => {
    try {
      const res = await fetch("/api/avatars");
      const data = await res.json();
      if (data.avatars) {
        setAvatars(data.avatars);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des avatars", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatars();
  }, []);

  // Gérer l'upload d'un nouvel avatar
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = prompt("Donnez un nom à cet avatar :", "Mon Avatar");
    if (!name) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);

    try {
      const res = await fetch("/api/avatars", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.avatar) {
        setAvatars([data.avatar, ...avatars]);
      } else if (data.error) {
        toast.error("Erreur : " + data.error);
      }
    } catch (error) {
      console.error("Erreur d'upload", error);
      toast.error("Une erreur est survenue lors de l'upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Mes Avatars</h1>
          <p className="text-gray-400">Gérez vos visages IA pour la génération de vidéos.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-full font-medium hover:bg-white/20 transition-colors border border-white/10"
          >
            <Plus className="w-4 h-4" />
            Créer un avatar
          </button>
          <Link 
            href="/studio"
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-indigo-500 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          >
            <Video className="w-4 h-4" />
            Aller dans le Studio
          </Link>
        </div>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Upload Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          onClick={() => fileInputRef.current?.click()}
          className="aspect-[4/5] rounded-3xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:bg-white/10 hover:border-white/40 transition-colors"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-4" />
              <h3 className="text-lg font-medium mb-1">Upload en cours...</h3>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-1">Nouvel Avatar</h3>
              <p className="text-sm text-gray-400">Uploadez une photo claire de face (JPG, PNG)</p>
            </>
          )}
        </motion.div>

        {/* Loading Skeleton or Avatar Cards */}
        {isLoading ? (
          <div className="aspect-[4/5] rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
        ) : (
          avatars.map((avatar, idx) => (
            <motion.div
              key={avatar.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative aspect-[4/5] rounded-3xl overflow-hidden bg-white/5 border border-white/10"
            >
              {/* Image */}
              <div className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={avatar.photo_url} 
                  alt={avatar.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h3 className="text-xl font-semibold text-white mb-1">{avatar.name}</h3>
                <p className="text-sm text-gray-300">
                  {new Date(avatar.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>

              {/* Actions (hover) */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-10 h-10 rounded-full bg-red-500/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
