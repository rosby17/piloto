"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Video, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SignInContent() {
  const [isLoading, setIsLoading] = useState<"google" | "apple" | null>(null);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setIsLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      alert("Erreur de connexion : " + error.message);
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0E0E10] text-white">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 bg-[#18181B] border border-white/10 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 mb-4 cursor-pointer hover:bg-indigo-500/30 transition-colors">
              <Video className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Bienvenue sur Rogen</h1>
          <p className="text-gray-400 text-sm">
            Créez votre studio vidéo propulsé par l'IA.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={() => handleOAuthLogin("google")}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 disabled:opacity-50 text-black rounded-xl font-medium transition-colors"
          >
            {isLoading === "google" ? <Loader2 className="w-5 h-5 animate-spin text-gray-500" /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continuer avec Google
          </button>
          
          <button 
            onClick={() => handleOAuthLogin("apple")}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#242427] hover:bg-[#2A2A2E] disabled:opacity-50 border border-white/10 text-white rounded-xl font-medium transition-colors"
          >
            {isLoading === "apple" ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <svg className="w-5 h-5 pb-0.5" viewBox="0 0 384 512" fill="currentColor">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.8 90.4-82.5 102.7-119.3-65.2-30.7-61.7-90-61.8-91.3zM244 83.8c27-32.8 23.6-60.5 22.8-65.4-26.3 1-52.6 15.6-68.5 35-15.6 18.5-28.7 47.9-24.6 74 29.2 2.2 55.4-13.8 70.3-43.6z"/>
              </svg>
            )}
            Continuer avec Apple
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          En vous connectant, vous acceptez nos{" "}
          <Link href="#" className="text-gray-300 hover:text-white underline underline-offset-2">Conditions</Link>{" "}
          et notre{" "}
          <Link href="#" className="text-gray-300 hover:text-white underline underline-offset-2">Politique de confidentialité</Link>.
        </div>
      </motion.div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0E0E10] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
      <SignInContent />
    </Suspense>
  );
}
