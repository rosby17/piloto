"use client";

import { User, Mail, Shield, Key, Bell, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Paramètres du compte</h1>
        <p className="text-gray-400">Gérez vos informations personnelles et vos préférences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg bg-white/10 text-white font-medium text-sm transition-colors">
            <User className="w-4 h-4" /> Profil
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors">
            <Shield className="w-4 h-4" /> Sécurité
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors">
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors">
            <Key className="w-4 h-4" /> API Keys
          </button>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          {/* Section Profil */}
          <section className="bg-[#18181B] border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Informations Personnelles</h2>
            
            <div className="space-y-6">
              {/* Photo de profil */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                  JD
                </div>
                <div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors">
                      Changer d'avatar
                    </button>
                    <button className="px-4 py-2 text-gray-400 hover:text-red-400 text-sm font-medium rounded-lg transition-colors">
                      Supprimer
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Format JPG ou PNG, max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Prénom</label>
                  <input 
                    type="text" 
                    defaultValue="John"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Nom</label>
                  <input 
                    type="text" 
                    defaultValue="Doe"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Adresse Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="email" 
                    defaultValue="john.doe@example.com"
                    disabled
                    className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-gray-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500">Géré via Google Authentication.</p>
              </div>

              <div className="pt-4 flex justify-end">
                <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition-all">
                  Sauvegarder les modifications
                </button>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section className="bg-[#18181B] border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Préférences d'Affichage</h2>
            
            <div className="flex items-center justify-between p-4 bg-black/30 border border-white/5 rounded-xl">
              <div className="flex items-center gap-4">
                <Palette className="w-6 h-6 text-indigo-400" />
                <div>
                  <h3 className="font-medium text-white">Thème Sombre</h3>
                  <p className="text-sm text-gray-400">Le thème sombre est activé par défaut sur Rogen.</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-indigo-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </section>

          {/* Delete Account */}
          <section className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-red-500 mb-2">Zone de Danger</h2>
            <p className="text-sm text-gray-400 mb-6">La suppression de votre compte est définitive et toutes vos vidéos générées seront perdues.</p>
            <button className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-semibold rounded-lg transition-colors border border-red-500/20">
              Supprimer mon compte
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
