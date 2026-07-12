"use client";

import { motion } from "framer-motion";
import { Users, Video, Clock, Settings, LogOut, CreditCard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Mes Avatars", href: "/dashboard", icon: <Users className="w-5 h-5" /> },
    { name: "Studio Vidéo", href: "/studio", icon: <Video className="w-5 h-5" /> },
    { name: "Historique", href: "/dashboard/history", icon: <Clock className="w-5 h-5" /> },
    { name: "Abonnement & Crédits", href: "/dashboard/billing", icon: <CreditCard className="w-5 h-5" /> },
    { name: "Paramètres", href: "/dashboard/settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-indigo-600 flex items-center justify-center">
              <Video className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Rogen</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 mt-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-white/10 text-white font-medium shadow-sm" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-8 bg-rose-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:text-white hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute top-[-20%] right-[-10%] w-[50rem] h-[50rem] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
