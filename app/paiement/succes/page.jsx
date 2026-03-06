// app/paiement/succes/page.jsx

'use client'

import { useSearchParams } from 'next/navigation'

const PLAN_LABELS = {
  starter_monthly: 'Starter',
  pro_monthly: 'Pro',
  agency_monthly: 'Agency',
}

export default function PaiementSucces() {
  const params = useSearchParams()
  const plan = params.get('plan') || ''
  const planLabel = PLAN_LABELS[plan] || 'Premium'

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-8"
      style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400&display=swap');`}</style>

      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full border border-[#c0392b]/40 bg-[#c0392b]/10 flex items-center justify-center mx-auto mb-8">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>

        <p className="text-[11px] text-[#333] tracking-[.2em] uppercase mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>
          Paiement confirmé
        </p>

        <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[40px] leading-tight text-white mb-4">
          Bienvenue sur<br />
          <span className="text-[#c0392b] italic">Piloto {planLabel}.</span>
        </h1>

        <p className="text-[14px] text-[#444] mb-10 leading-relaxed">
          Ton abonnement est actif. Tu peux maintenant accéder à toutes les fonctionnalités de ton plan.
        </p>

        <a href="/dashboard"
          className="inline-flex items-center gap-2.5 bg-[#c0392b] hover:bg-[#a93226] text-white font-medium px-7 py-3.5 rounded-lg transition text-[14px]">
          Accéder au dashboard
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>

        <p className="text-[11px] text-[#282828] mt-5" style={{ fontFamily: "'DM Mono', monospace" }}>
          Une confirmation a été envoyée par email
        </p>
      </div>
    </main>
  )
}
