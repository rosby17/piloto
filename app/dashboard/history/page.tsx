"use client";

import { motion } from "framer-motion";
import { Play, Download, Trash2, Calendar, Clock } from "lucide-react";

export default function HistoryPage() {
  const videos = [
    { id: 1, title: "Présentation Marketing - Produit A", date: "12 Jui 2026", duration: "0:45", status: "completed" },
    { id: 2, title: "Tutoriel Onboarding Rogen", date: "10 Jui 2026", duration: "1:20", status: "completed" },
    { id: 3, title: "Message de Bienvenue", date: "08 Jui 2026", duration: "0:30", status: "completed" },
    { id: 4, title: "Annonce Promotionnelle", date: "05 Jui 2026", duration: "1:05", status: "completed" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Historique</h1>
          <p className="text-gray-400">Retrouvez et téléchargez toutes vos vidéos générées par l'IA.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video, idx) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative aspect-video rounded-2xl overflow-hidden bg-[#18181B] border border-white/10 flex flex-col"
          >
            {/* Thumbnail */}
            <div className="relative flex-1 bg-black/50">
              <div className="absolute inset-0 bg-[url('/avatar.png')] bg-cover bg-top opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-transparent to-transparent" />
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white hover:bg-white/20 transition-all hover:scale-105">
                  <Play className="w-5 h-5 ml-1" />
                </button>
              </div>

              <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-xs font-mono text-white flex items-center gap-1">
                <Clock className="w-3 h-3" /> {video.duration}
              </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-[#18181B]">
              <h3 className="text-sm font-semibold text-white mb-1 truncate">{video.title}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                <Calendar className="w-3 h-3" /> {video.date}
              </div>
              
              <div className="flex items-center gap-2">
                <button className="flex-1 py-2 flex items-center justify-center gap-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-xs font-medium rounded-lg transition-colors">
                  <Download className="w-4 h-4" /> Télécharger
                </button>
                <button className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
