// app/dashboard/components/Sidebar.jsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import Icon from './ui/icons'

// ── Quotas par plan ────────────────────────────────────────
const PLAN_QUOTAS = {
  free:    1000,
  starter: 5000,
  pro:     20000,
  agency:  50000,
}

const PLAN_LABELS = {
  free:    'Gratuit',
  starter: 'Starter',
  pro:     'Pro',
  agency:  'Agency',
}

export default function Sidebar({ user, activeTab, onTabChange, onLogout }) {
  const [credits, setCredits]   = useState(null)
  const [plan, setPlan]         = useState('free')
  const [resetAt, setResetAt]   = useState(null)

  const nav = [
    { id: 'videos',     label: 'Vidéos',     icon: Icon.grid },
    { id: 'voix_off',   label: 'Voix off',   icon: Icon.mic },
    { id: 'parametres', label: 'Paramètres', icon: Icon.settings },
  ]

  useEffect(() => {
    if (!user?.id) return
    fetchCredits()
    // Refresh toutes les 30s
    const t = setInterval(fetchCredits, 30000)
    return () => clearInterval(t)
  }, [user?.id])

  const fetchCredits = async () => {
    const { data } = await supabase
      .from('user_credits')
      .select('credits_balance, plan, reset_at')
      .eq('user_id', user.id)
      .single()
    if (data) {
      setCredits(data.credits_balance)
      setPlan(data.plan || 'free')
      setResetAt(data.reset_at)
    }
  }

  const quota      = PLAN_QUOTAS[plan] ?? 1000
  const used       = credits !== null ? quota - credits : null
  const pct        = credits !== null ? Math.max(0, Math.min(100, (credits / quota) * 100)) : null
  const isLow      = pct !== null && pct < 20
  const isCritical = pct !== null && pct < 10

  // Reset date lisible
  const resetLabel = resetAt
    ? new Date(resetAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    : null

  // Couleur barre
  const barColor = isCritical ? '#ef4444' : isLow ? '#f59e0b' : '#c0392b'

  return (
    <aside className="w-[220px] border-r border-[#1c1c1c] flex flex-col fixed h-full bg-[#0a0a0a]">

      {/* Logo */}
      <div className="px-6 pt-8 pb-6 border-b border-[#1c1c1c]">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#c0392b] rounded-md flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3.5-5 3 4 2-2.5L13 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[17px] tracking-tight text-white">Piloto</span>
        </a>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {nav.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
              activeTab === item.id
                ? 'bg-[#1a1a1a] text-white'
                : 'text-[#555] hover:text-[#aaa] hover:bg-[#141414]'
            }`}>
            <span className={activeTab === item.id ? 'text-[#c0392b]' : 'text-current'}>
              {item.icon}
            </span>
            {item.label}
            {activeTab === item.id && (
              <div className="ml-auto w-1 h-1 rounded-full bg-[#c0392b]" />
            )}
          </button>
        ))}
      </nav>

      {/* ── Bloc Crédits ── */}
      <div className="px-3 pb-3">
        <div className={`rounded-xl border px-3.5 py-3 space-y-2.5 ${
          isCritical ? 'border-red-500/20 bg-red-500/5' :
          isLow      ? 'border-amber-500/20 bg-amber-500/5' :
                       'border-[#1e1e1e] bg-[#0d0d0d]'
        }`}>

          {/* Ligne plan + solde */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold tracking-wide ${
                plan === 'free'    ? 'bg-[#1e1e1e] text-[#555]' :
                plan === 'starter' ? 'bg-sky-500/15 text-sky-400' :
                plan === 'pro'     ? 'bg-violet-500/15 text-violet-400' :
                                     'bg-amber-500/15 text-amber-400'
              }`} style={{ fontFamily: "'DM Mono', monospace" }}>
                {PLAN_LABELS[plan]}
              </span>
            </div>
            <span className={`text-[12px] font-bold tabular-nums ${
              isCritical ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-white'
            }`} style={{ fontFamily: "'DM Mono', monospace" }}>
              {credits !== null ? credits.toLocaleString('fr-FR') : '···'}
            </span>
          </div>

          {/* Barre de progression */}
          <div className="space-y-1">
            <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct ?? 0}%`, background: barColor }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#333]" style={{ fontFamily: "'DM Mono', monospace" }}>
                {credits !== null ? `${credits.toLocaleString('fr-FR')} / ${quota.toLocaleString('fr-FR')}` : ''}
              </span>
              {resetLabel && (
                <span className="text-[10px] text-[#2a2a2a]" style={{ fontFamily: "'DM Mono', monospace" }}>
                  reset {resetLabel}
                </span>
              )}
            </div>
          </div>

          {/* Alerte si bas */}
          {isCritical && (
            <p className="text-[10px] text-red-400 leading-snug">
              ⚠ Crédits presque épuisés
            </p>
          )}
          {isLow && !isCritical && (
            <p className="text-[10px] text-amber-400 leading-snug">
              Crédits bientôt épuisés
            </p>
          )}

          {/* Bouton upgrade si free */}
          {plan === 'free' && (
            <button
              onClick={() => onTabChange('parametres')}
              className="w-full text-[11px] font-medium text-[#c0392b] hover:text-white border border-[#c0392b]/20 hover:border-[#c0392b]/50 hover:bg-[#c0392b]/8 px-2.5 py-1.5 rounded-lg transition text-center"
            >
              Passer au plan payant →
            </button>
          )}
        </div>
      </div>

      {/* User + Logout */}
      <div className="px-3 pb-5 border-t border-[#1c1c1c] pt-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-7 h-7 rounded-md bg-[#c0392b] flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0">
            {user.email[0].toUpperCase()}
          </div>
          <p className="text-[12px] text-[#555] truncate flex-1">{user.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-[#444] hover:text-[#888] transition rounded-lg hover:bg-[#141414]">
          {Icon.logout} Déconnexion
        </button>
      </div>
    </aside>
  )
}