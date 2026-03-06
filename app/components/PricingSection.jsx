// Remplace la section {/* ── TARIFS ── */} dans app/page.jsx
// Colle ce composant directement à la place, ou importe-le

'use client'

import { useState } from 'react'

const IconCheck = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconSpinner = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="25" strokeDashoffset="10" strokeLinecap="round"/>
  </svg>
)

const PLANS = [
  {
    name: 'Gratuit',
    price: '0',
    priceId: null,
    amount: 0,
    currency: 'EUR',
    features: ['3 vidéos/mois', '1 chaîne YouTube', 'Script IA basique', 'Miniature auto'],
    cta: 'Commencer',
    highlight: false,
  },
  {
    name: 'Starter',
    price: '9',
    priceId: 'starter_monthly',
    amount: 900,
    currency: 'EUR',
    features: ['15 vidéos/mois', '2 chaînes YouTube', 'Script IA avancé', 'Import PDF/URL', 'Support email'],
    cta: 'Choisir Starter',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '29',
    priceId: 'pro_monthly',
    amount: 2900,
    currency: 'EUR',
    features: ['50 vidéos/mois', '5 chaînes YouTube', 'Script IA premium', 'Miniature HD', 'Support prioritaire', 'Analytics'],
    cta: 'Choisir Pro',
    highlight: true,
  },
  {
    name: 'Agency',
    price: '99',
    priceId: null,
    amount: 0,
    currency: 'EUR',
    features: ['Illimité', 'Chaînes illimitées', 'API access', 'White label', 'Account manager'],
    cta: 'Contacter',
    highlight: false,
    isContact: true,
  },
]

export default function PricingSection() {
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [error, setError] = useState(null)

  async function handleCheckout(plan) {
    if (!plan.priceId && !plan.isContact) {
      window.location.href = '/register'
      return
    }
    if (plan.isContact) {
      window.location.href = 'mailto:contact@piloto.app'
      return
    }

    setLoadingPlan(plan.priceId)
    setError(null)

    try {
      const res = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan.priceId,
          amount: plan.amount,
          currency: plan.currency,
          planName: plan.name,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.checkout_url) {
        throw new Error(data.error || 'Erreur lors de l\'initialisation du paiement')
      }

      window.location.href = data.checkout_url

    } catch (e) {
      setError(e.message || 'Une erreur est survenue. Réessaie.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <section id="tarifs" className="py-28 px-8">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <p className="text-[11px] text-[#333] tracking-[.2em] uppercase mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>
            Tarifs
          </p>
          <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[40px] leading-tight text-white">
            Simple et transparent.
          </h2>
        </div>

        {error && (
          <div className="mb-6 border border-red-900/40 bg-red-950/20 rounded-xl px-5 py-4 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#c0392b] flex-shrink-0" />
            <p className="text-[13px] text-red-400 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-[#444] hover:text-white text-[18px] leading-none">×</button>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-3 items-start">
          {PLANS.map((plan) => {
            const isLoading = loadingPlan === plan.priceId
            return (
              <div key={plan.name} className={`rounded-xl border flex flex-col p-5 ${
                plan.highlight
                  ? 'border-[#c0392b] bg-[#c0392b]/5'
                  : 'border-[#131313] bg-[#080808]'
              }`}>
                {plan.highlight && (
                  <div className="flex items-center gap-1.5 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c0392b]" />
                    <span className="text-[11px] text-[#c0392b]" style={{ fontFamily: "'DM Mono', monospace" }}>Populaire</span>
                  </div>
                )}
                <div className="mb-1">
                  <span className="text-[12px] text-[#444]" style={{ fontFamily: "'DM Mono', monospace" }}>{plan.name}</span>
                </div>
                <div className="mb-5 flex items-baseline gap-1">
                  <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[38px] text-white leading-none">{plan.price}€</span>
                  <span className="text-[12px] text-[#333]">/mois</span>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-[12px] text-[#444]">
                      <span className={plan.highlight ? 'text-[#c0392b]' : 'text-[#2a2a2a]'}>{IconCheck}</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan)}
                  disabled={isLoading}
                  className={`text-center text-[12px] font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 ${
                    plan.highlight
                      ? 'bg-[#c0392b] hover:bg-[#a93226] text-white disabled:opacity-60'
                      : 'border border-[#1e1e1e] hover:border-[#2a2a2a] text-[#555] hover:text-white disabled:opacity-40'
                  }`}
                >
                  {isLoading ? <>{IconSpinner} Redirection...</> : plan.cta}
                </button>
              </div>
            )
          })}
        </div>

        <p className="text-[11px] text-[#2a2a2a] mt-6 text-center" style={{ fontFamily: "'DM Mono', monospace" }}>
          Paiement sécurisé · Annulation à tout moment · Powered by Moneroo
        </p>
      </div>
    </section>
  )
}
