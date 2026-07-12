"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Check, Sparkles, Zap, Coins, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";

export default function BillingPage() {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePayment = async (amount: number, creditsToAdd: number) => {
    setLoadingId(amount);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/payment/maketou', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, creditsToAdd })
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setErrorMsg(data.error || 'Erreur lors de la création du paiement');
      }
    } catch (err) {
      setErrorMsg('Erreur de connexion au serveur de paiement');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      
      {/* Header & Balance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Abonnement & Crédits</h1>
          <p className="text-gray-400">Gérez votre forfait et achetez des crédits supplémentaires.</p>
        </div>
        
        <div className="bg-[#18181B] border border-white/10 p-5 rounded-2xl flex items-center gap-6 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">Solde actuel</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">24</span>
              <span className="text-sm text-gray-500">crédits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forfaits Mensuels */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold">Forfaits Mensuels</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Plan Gratuit */}
          <div className="p-8 rounded-3xl bg-[#18181B] border border-white/10 flex flex-col relative">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Découverte</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-white">0€</span>
              <span className="text-gray-500">/mois</span>
            </div>
            <p className="text-sm text-gray-400 mb-8 flex-1">Parfait pour tester Rogen et générer vos premières vidéos.</p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3 text-sm text-gray-300"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> 5 Crédits offerts</li>
              <li className="flex items-start gap-3 text-sm text-gray-300"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Accès à Rogen Engine</li>
              <li className="flex items-start gap-3 text-sm text-gray-500"><Check className="w-5 h-5 text-gray-600 shrink-0" /> Export 720p avec Filigrane</li>
            </ul>
            <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/10">
              Plan Actuel
            </button>
          </div>

          {/* Plan Pro */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-900/40 to-[#18181B] border border-indigo-500/50 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(99,102,241,0.15)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3 h-3" /> Recommandé
            </div>
            <h3 className="text-lg font-semibold text-indigo-300 mb-2">Créateur Pro</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-white">29€</span>
              <span className="text-gray-500">/mois</span>
            </div>
            <p className="text-sm text-gray-400 mb-8 flex-1">Pour les créateurs réguliers qui veulent la meilleure qualité.</p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3 text-sm text-gray-200"><Check className="w-5 h-5 text-indigo-400 shrink-0" /> 100 Crédits / mois</li>
              <li className="flex items-start gap-3 text-sm text-gray-200"><Check className="w-5 h-5 text-indigo-400 shrink-0" /> Accès à Motion Engine (Corps entier)</li>
              <li className="flex items-start gap-3 text-sm text-gray-200"><Check className="w-5 h-5 text-indigo-400 shrink-0" /> Export 4K sans filigrane</li>
              <li className="flex items-start gap-3 text-sm text-gray-200"><Check className="w-5 h-5 text-indigo-400 shrink-0" /> Clonage vocal premium</li>
            </ul>
            <button className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg flex items-center justify-center gap-2">
              S'abonner <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Plan Enterprise */}
          <div className="p-8 rounded-3xl bg-[#18181B] border border-white/10 flex flex-col relative">
            <h3 className="text-lg font-semibold text-gray-300 mb-2">Agence</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-white">99€</span>
              <span className="text-gray-500">/mois</span>
            </div>
            <p className="text-sm text-gray-400 mb-8 flex-1">Volume massif pour les équipes et agences de production.</p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3 text-sm text-gray-300"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> 500 Crédits / mois</li>
              <li className="flex items-start gap-3 text-sm text-gray-300"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Toutes les features Pro</li>
              <li className="flex items-start gap-3 text-sm text-gray-300"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Support Prioritaire 24/7</li>
            </ul>
            <button className="w-full py-3 rounded-xl bg-white text-black hover:bg-gray-200 font-semibold transition-colors">
              S'abonner
            </button>
          </div>
        </div>
      </section>

      {/* Packs de Crédits (One-time) */}
      <section className="space-y-6 pt-8 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-rose-400" />
          <h2 className="text-xl font-bold">Packs de Crédits (Achat Unique)</h2>
        </div>
        <p className="text-gray-400 text-sm mb-6">Besoin de plus de vidéos sans changer d'abonnement ? Achetez des crédits qui n'expirent jamais.</p>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMsg}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { credits: 20, price: 9, bonus: null },
            { credits: 50, price: 19, bonus: "Populaire" },
            { credits: 100, price: 35, bonus: "+10 offerts" },
            { credits: 500, price: 149, bonus: "Meilleur prix" },
          ].map((pack, i) => (
            <div key={i} className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden">
              {pack.bonus && (
                <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                  {pack.bonus}
                </div>
              )}
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Coins className="w-5 h-5 text-yellow-400" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-1">{pack.credits}</h4>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Crédits</p>
              <button 
                onClick={() => handlePayment(pack.price, pack.credits)}
                disabled={loadingId === pack.price}
                className="w-full py-2 rounded-lg bg-indigo-600/20 text-indigo-300 font-medium group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingId === pack.price ? <Loader2 className="w-4 h-4 animate-spin" /> : `${pack.price} €`}
              </button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
