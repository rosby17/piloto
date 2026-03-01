'use client'
import { useState, Suspense } from 'react'
import { supabase } from '../../../lib/supabase'

function ParametresContent() {
  const [heygenKey, setHeygenKey] = useState('')
  const [avatarId, setAvatarId] = useState('')

  return (
    <div>
      <h1 className="text-3xl font-black mb-2">Paramètres</h1>
      <p className="text-gray-400 mb-8">Configure ton compte et tes intégrations</p>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-lg">🎬 Heygen</h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Clé API Heygen par défaut</label>
            <input
              type="password"
              value={heygenKey}
              onChange={e => setHeygenKey(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              placeholder="sk_..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Avatar ID par défaut</label>
            <input
              type="text"
              value={avatarId}
              onChange={e => setAvatarId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              placeholder="Abigail_expressive_2024112501"
            />
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm">
            Sauvegarder
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="font-bold text-lg">📺 YouTube</h2>
          <p className="text-gray-400 text-sm">Connecte ta chaîne YouTube pour publier automatiquement.</p>
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition text-sm">
            🔗 Connecter ma chaîne YouTube
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Parametres() {
  return (
    <Suspense fallback={<div className="text-white">Chargement...</div>}>
      <ParametresContent />
    </Suspense>
  )
}


