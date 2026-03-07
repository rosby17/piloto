// app/dashboard/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

import Sidebar       from './components/Sidebar'
import MesVideos     from './components/MesVideos'
import NouvelleVideo from './components/NouvelleVideo'
import VoixOff       from './components/VoixOff'
import Parametres    from './components/Parametres'

export default function Dashboard() {
  const router  = useRouter()
  const [user, setUser]                 = useState(null)
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState('videos')
  const [showNouvelle, setShowNouvelle] = useState(false)

  // ── Assets chargés UNE seule fois pour tout le dashboard ──
  const [avatars, setAvatars]             = useState([])
  const [voices, setVoices]               = useState([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [assetsLoaded, setAssetsLoaded]   = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push('/login'); return }
      setUser(u)
      setLoading(false)
    }
    init()
  }, [])

  // Dès que l'user est connu, on charge les assets en arrière-plan
  useEffect(() => {
    if (user && !assetsLoaded && !loadingAssets) {
      fetchAssets()
    }
  }, [user])

  const fetchAssets = async () => {
    setLoadingAssets(true)
    try {
      const res = await fetch('/api/heygen/avatars-voices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (data.avatars) setAvatars(data.avatars)
      if (data.voices)  setVoices(data.voices)
      setAssetsLoaded(true)
    } catch (err) {
      console.error('Erreur chargement assets HeyGen:', err)
    } finally {
      setLoadingAssets(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="flex items-center gap-3 text-[#333]">
        <div className="w-5 h-5 rounded-full border-2 border-[#c0392b] border-t-transparent animate-spin" />
        <span className="text-[13px]" style={{ fontFamily: "'DM Mono', monospace" }}>Chargement...</span>
      </div>
    </div>
  )

  const renderContent = () => {
    if (showNouvelle) {
      return (
        <NouvelleVideo
          user={user}
          avatars={avatars}
          voices={voices}
          loadingAssets={loadingAssets}
          onBack={() => { setShowNouvelle(false); setActiveTab('videos') }}
        />
      )
    }
    switch (activeTab) {
      case 'videos':
        return (
          <MesVideos
            user={user}
            onNouvelleVideo={() => setShowNouvelle(true)}
          />
        )
      case 'voix_off':
        return (
          <VoixOff
            user={user}
            voices={voices}
            loadingAssets={loadingAssets}
          />
        )
      case 'parametres':
        return (
          <Parametres
            user={user}
            avatars={avatars}
            voices={voices}
            loadingAssets={loadingAssets}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #2a2a2a; }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: .4; transform: scale(.75); }
        }
        .pulse-dot { animation: pulse-dot 1.4s ease-in-out infinite; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <Sidebar
        user={user}
        activeTab={showNouvelle ? '' : activeTab}
        onTabChange={(tab) => { setShowNouvelle(false); setActiveTab(tab) }}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col overflow-hidden" style={{ marginLeft: '220px', height: '100vh' }}>
        {renderContent()}
      </main>
    </div>
  )
}