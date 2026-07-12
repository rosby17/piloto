"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Video, Wand2, Zap, Play, Mic, Globe, UploadCloud, ChevronRight, CheckCircle2, UserSquare2, ArrowRight, Type } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0E0E10] text-gray-200 font-sans selection:bg-indigo-500/30">
      
      {/* Background Effects */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-indigo-900/20 via-purple-900/10 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[50rem] h-[50rem] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Video className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Rogen</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="#features" className="hover:text-white transition-colors">Fonctionnalités</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">Comment ça marche</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Tarifs</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block">
            Se connecter
          </Link>
          <Link href="/sign-in" className="px-5 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all">
            Commencer
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-8"
        >
          <SparklesIcon className="w-3.5 h-3.5" />
          Nouveau Moteur Rogen V2 Disponible
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-6"
        >
          Créez des vidéos pros avec des <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">Avatars IA</span> ultra-réalistes.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed"
        >
          Transformez n'importe quelle photo et n'importe quel texte en une vidéo dynamique en quelques secondes. Idéal pour le marketing, la formation et la communication.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/sign-in" className="px-8 py-4 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-full transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center gap-2 group">
            Générer ma première vidéo <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-sm text-gray-500 mt-2 sm:mt-0 sm:ml-4 text-left">
            5 crédits offerts à l'inscription.<br/>Aucune carte bancaire requise.
          </p>
        </motion.div>
      </main>

      {/* Video Mockup Preview */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative aspect-video rounded-2xl md:rounded-[2.5rem] bg-[#18181B] border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5"
        >
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20" />
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 flex items-end justify-center">
               <div className="w-full h-full bg-[url('/avatar.png')] bg-contain bg-bottom bg-no-repeat opacity-90 mix-blend-lighten" style={{ maskImage: 'linear-gradient(to top, black 50%, transparent)', WebkitMaskImage: 'linear-gradient(to top, black 50%, transparent)' }} />
           </div>
           
           <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-2xl hover:scale-110 transition-transform cursor-pointer">
                  <Play className="w-8 h-8 ml-1" />
               </div>
           </div>
        </motion.div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Comment ça marche ?</h2>
            <p className="text-gray-400">La magie opère en seulement 3 étapes simples.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard 
              number="01"
              icon={<UploadCloud className="w-6 h-6 text-indigo-400" />}
              title="Uploadez une photo"
              desc="Choisissez un visage clair, généré par IA ou votre propre photo."
              delay={0.1}
            />
            <StepCard 
              number="02"
              icon={<Type className="w-6 h-6 text-purple-400" />}
              title="Écrivez le script"
              desc="Tapez votre texte ou uploadez un fichier audio avec votre propre voix."
              delay={0.2}
            />
            <StepCard 
              number="03"
              icon={<Wand2 className="w-6 h-6 text-rose-400" />}
              title="L'IA génère la vidéo"
              desc="Notre moteur exclusif anime le visage et synchronise les lèvres parfaitement."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                Le moteur d'animation le plus avancé.
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Fini les avatars statiques et robotiques. Rogen utilise une technologie d'intelligence artificielle de pointe pour un rendu naturel.
              </p>
              <ul className="space-y-4">
                <FeatureItem icon={<Zap />} text="Rendu ultra-réaliste (Mouvement de tête, clignements des yeux)" delay={0.1} />
                <FeatureItem icon={<Mic />} text="Clonage vocal intégré avec émotions" delay={0.2} />
                <FeatureItem icon={<Globe />} text="Support de plus de 40 langues nativement" delay={0.3} />
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative aspect-square rounded-3xl bg-[#18181B] border border-white/10 overflow-hidden shadow-2xl p-8 hidden md:block"
            >
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent" />
               <div className="relative h-full flex flex-col items-center justify-center text-center space-y-6">
                 <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center"><UserSquare2 className="w-8 h-8 text-indigo-400" /></div>
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center"><Mic className="w-8 h-8 text-rose-400" /></div>
                 </div>
                 <div className="w-10 h-10 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center"><ArrowRight className="w-4 h-4 text-gray-500 rotate-90" /></div>
                 <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Video className="w-12 h-12 text-white" />
                 </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-500" />
            <span className="text-xl font-bold tracking-tight text-white">Rogen</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 Rogen AI. Tous droits réservés.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">Mentions Légales</Link>
            <Link href="#" className="hover:text-white transition-colors">CGV</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function StepCard({ number, icon, title, desc, delay }: { number: string, icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="p-8 rounded-3xl bg-[#18181B] border border-white/5 relative overflow-hidden group hover:border-white/20 transition-colors"
    >
      <div className="absolute top-4 right-6 text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors">
        {number}
      </div>
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function FeatureItem({ icon, text, delay }: { icon: React.ReactNode, text: string, delay: number }) {
  return (
    <motion.li 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-4 bg-[#18181B] p-4 rounded-2xl border border-white/5"
    >
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
        {icon}
      </div>
      <span className="text-gray-300 font-medium">{text}</span>
    </motion.li>
  );
}