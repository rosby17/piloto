// app/dashboard/components/Sidebar.jsx
'use client'

import Icon from './ui/icons'

export default function Sidebar({ user, activeTab, onTabChange, onLogout }) {
  const nav = [
    { id: 'videos',     label: 'Vidéos',     icon: Icon.grid },
    { id: 'voix_off',   label: 'Voix off',   icon: Icon.mic },
    { id: 'parametres', label: 'Paramètres', icon: Icon.settings },
  ]

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

      {/* User + Logout */}
      <div className="px-3 pb-5 border-t border-[#1c1c1c] pt-4">
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