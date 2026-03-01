'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Admin() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('stats')
  const [users, setUsers] = useState([])
  const [videos, setVideos] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVideos: 0,
    usersPlan: { gratuit: 0, starter: 0, pro: 0, agency: 0 }
  })

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) { router.push('/dashboard'); return }

    loadData()
  }

  const loadData = async () => {
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: videosData } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    const u = usersData || []
    const v = videosData || []

    setUsers(u)
    setVideos(v)
    setStats({
      totalUsers: u.length,
      totalVideos: v.length,
      usersPlan: {
        gratuit: u.filter(x => x.plan === 'gratuit').length,
        starter: u.filter(x => x.plan === 'starter').length,
        pro: u.filter(x => x.plan === 'pro').length,
        agency: u.filter(x => x.plan === 'agency').length,
      }
    })
    setLoading(false)
  }

  const toggleBlock = async (userId, blocked) => {
    await supabase.from('profiles').update({ blocked: !blocked }).eq('id', userId)
    loadData()
  }

  const changePlan = async (userId, plan) => {
    await supabase.from('profiles').update({ plan }).eq('id', userId)
    loadData()
  }

  const deleteUser = async (userId) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    await supabase.from('profiles').delete().eq('id', userId)
    loadData()
  }

  if (loading) return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-xl animate-pulse">Chargement...</div>
    </main>
  )

  return (
    <main className="min-h-screen bg-black text-white flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">✈️</span>
            <span className="text-xl font-black">Piloto</span>
          </div>
          <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'stats', icon: '📊', label: 'Stats globales' },
            { id: 'users', icon: '👥', label: 'Utilisateurs' },
            { id: 'videos', icon: '🎬', label: 'Vidéos générées' },
            { id: 'abonnements', icon: '💳', label: 'Abonnements' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === item.id
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <a href="/dashboard" className="w-full flex items-center gap-2 text-sm text-gray-400 hover:text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition">
            ← Dashboard utilisateur
          </a>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
            className="w-full text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 py-2 rounded-xl transition"
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ml-64 flex-1 p-8">

        {/* STATS */}
        {activeTab === 'stats' && (
          <div>
            <h1 className="text-3xl font-black mb-2">Stats globales</h1>
            <p className="text-gray-400 mb-8">Vue d'ensemble de Piloto</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Utilisateurs total', value: stats.totalUsers, icon: '👥', color: 'text-blue-400' },
                { label: 'Vidéos générées', value: stats.totalVideos, icon: '🎬', color: 'text-green-400' },
                { label: 'Plans payants', value: stats.usersPlan.starter + stats.usersPlan.pro + stats.usersPlan.agency, icon: '💳', color: 'text-yellow-400' },
                { label: 'Plan gratuit', value: stats.usersPlan.gratuit, icon: '🆓', color: 'text-gray-400' },
              ].map((s, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className={`text-4xl font-black mb-1 ${s.color}`}>{s.value}</div>
                  <div className="text-gray-400 text-sm">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="font-bold text-lg mb-4">Répartition des plans</h2>
              <div className="space-y-3">
                {[
                  { plan: 'Gratuit', count: stats.usersPlan.gratuit, color: 'bg-gray-500' },
                  { plan: 'Starter', count: stats.usersPlan.starter, color: 'bg-blue-500' },
                  { plan: 'Pro', count: stats.usersPlan.pro, color: 'bg-red-500' },
                  { plan: 'Agency', count: stats.usersPlan.agency, color: 'bg-yellow-500' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-20 text-sm text-gray-400">{p.plan}</div>
                    <div className="flex-1 bg-gray-800 rounded-full h-3">
                      <div
                        className={`${p.color} h-3 rounded-full transition-all`}
                        style={{ width: stats.totalUsers ? `${(p.count / stats.totalUsers) * 100}%` : '0%' }}
                      />
                    </div>
                    <div className="w-8 text-sm font-bold">{p.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* UTILISATEURS */}
        {activeTab === 'users' && (
          <div>
            <h1 className="text-3xl font-black mb-2">Utilisateurs</h1>
            <p className="text-gray-400 mb-8">{users.length} utilisateurs inscrits</p>

            <div className="space-y-3">
              {users.length === 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
                  Aucun utilisateur pour l'instant
                </div>
              )}
              {users.map((u, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-bold">
                      {u.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{u.full_name || 'Sans nom'}</p>
                      <p className="text-gray-400 text-sm">{u.email}</p>
                      <p className="text-gray-600 text-xs">{new Date(u.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={u.plan}
                      onChange={e => changePlan(u.id, e.target.value)}
                      className="bg-gray-800 border border-gray-700 text-white text-xs px-3 py-2 rounded-lg"
                    >
                      <option value="gratuit">Gratuit</option>
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                      <option value="agency">Agency</option>
                    </select>
                    <button
                      onClick={() => toggleBlock(u.id, u.blocked)}
                      className={`text-xs font-bold px-3 py-2 rounded-lg transition ${
                        u.blocked
                          ? 'bg-green-600/20 text-green-400 hover:bg-green-600/40'
                          : 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/40'
                      }`}
                    >
                      {u.blocked ? '✓ Débloquer' : '⚠ Bloquer'}
                    </button>
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="text-xs font-bold px-3 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40 transition"
                    >
                      🗑 Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIDÉOS */}
        {activeTab === 'videos' && (
          <div>
            <h1 className="text-3xl font-black mb-2">Vidéos générées</h1>
            <p className="text-gray-400 mb-8">{videos.length} vidéos au total</p>

            <div className="space-y-3">
              {videos.length === 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
                  Aucune vidéo générée pour l'instant
                </div>
              )}
              {videos.map((v, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-xl">🎬</div>
                    <div>
                      <p className="font-semibold">{v.titre || 'Sans titre'}</p>
                      <p className="text-gray-400 text-sm">{v.source} • {v.duree}s</p>
                      <p className="text-gray-600 text-xs">{new Date(v.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    v.statut === 'publiee' ? 'bg-green-600/20 text-green-400' :
                    v.statut === 'en_cours' ? 'bg-yellow-600/20 text-yellow-400' :
                    'bg-blue-600/20 text-blue-400'
                  }`}>
                    {v.statut}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABONNEMENTS */}
        {activeTab === 'abonnements' && (
          <div>
            <h1 className="text-3xl font-black mb-2">Abonnements</h1>
            <p className="text-gray-400 mb-8">Gestion des plans utilisateurs</p>

            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { plan: 'Gratuit', count: stats.usersPlan.gratuit, price: '0€', color: 'border-gray-700' },
                { plan: 'Starter', count: stats.usersPlan.starter, price: '9€/mois', color: 'border-blue-700' },
                { plan: 'Pro', count: stats.usersPlan.pro, price: '29€/mois', color: 'border-red-700' },
                { plan: 'Agency', count: stats.usersPlan.agency, price: '99€/mois', color: 'border-yellow-700' },
              ].map((p, i) => (
                <div key={i} className={`bg-gray-900 border ${p.color} rounded-2xl p-5 text-center`}>
                  <div className="text-3xl font-black mb-1">{p.count}</div>
                  <div className="font-bold mb-1">{p.plan}</div>
                  <div className="text-gray-400 text-sm">{p.price}</div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="font-bold text-lg mb-4">Revenus estimés</h2>
              <div className="text-4xl font-black text-green-400">
                {(stats.usersPlan.starter * 9 + stats.usersPlan.pro * 29 + stats.usersPlan.agency * 99).toLocaleString('fr-FR')}€
                <span className="text-lg text-gray-400 font-normal">/mois</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}

