// app/dashboard/components/ui/shared.jsx
'use client'

import { useState, useEffect } from 'react'
import { formatDuration } from './utils'

// ── Input CSS commun ───────────────────────────────────────
export const inputCls = "w-full bg-[#111] border border-[#222] rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder-[#333] focus:outline-none focus:border-[#c0392b] transition"

// ── PageHeader ─────────────────────────────────────────────
export function PageHeader({ title, sub, action }) {
  return (
    <div className="border-b border-[#1c1c1c] px-10 py-8 flex items-start justify-between flex-shrink-0">
      <div>
        <p className="text-[11px] text-[#444] tracking-[.15em] uppercase mb-1.5" style={{ fontFamily: "'DM Mono', monospace" }}>Piloto</p>
        <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[28px] text-white leading-tight">{title}</h1>
        {sub && <p className="text-[13px] text-[#555] mt-1">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Btn ────────────────────────────────────────────────────
export function Btn({ children, onClick, disabled, variant = 'primary', className = '' }) {
  const base = 'inline-flex items-center gap-2 text-[13px] font-medium rounded-lg px-4 py-2.5 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-[#c0392b] hover:bg-[#a93226] text-white',
    ghost:   'border border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#3a3a3a]',
    subtle:  'bg-[#161616] hover:bg-[#1e1e1e] text-[#aaa] hover:text-white border border-[#222]',
    spark:   'bg-gradient-to-r from-[#7c3aed] to-[#c0392b] hover:opacity-90 text-white',
  }
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

// ── Field ──────────────────────────────────────────────────
export function Field({ label, optional, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-2">
        <label className="text-[12px] font-medium text-[#888] tracking-wide uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>{label}</label>
        {optional && <span className="text-[11px] text-[#3a3a3a]">optionnel</span>}
      </div>
      {children}
      {hint && <p className="text-[11px] text-[#3a3a3a] mt-1.5">{hint}</p>}
    </div>
  )
}

// ── AvatarCard ─────────────────────────────────────────────
export function AvatarCard({ avatar, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`relative rounded-xl border overflow-hidden text-left transition-all group w-full ${
        selected ? 'border-[#c0392b] ring-1 ring-[#c0392b]/20' : 'border-[#1e1e1e] hover:border-[#2a2a2a]'
      }`}>
      <div className="relative overflow-hidden bg-[#111]" style={{ aspectRatio: '3/4' }}>
        {avatar.preview_image_url
          ? <img src={avatar.preview_image_url} alt={avatar.avatar_name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-4xl text-[#1a1a1a]">👤</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {avatar.type === 'personal' && (
          <div className="absolute top-2 left-2 bg-[#c0392b] text-white text-[9px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide" style={{ fontFamily: "'DM Mono', monospace" }}>
            MON AVATAR
          </div>
        )}
        {selected && (
          <div className="absolute inset-0 bg-[#c0392b]/15 flex items-start justify-end p-2">
            <div className="w-5 h-5 rounded-full bg-[#c0392b] flex items-center justify-center shadow-lg">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5 7.5 2" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </div>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 px-2.5 py-2">
          <p className={`text-[10px] font-medium truncate leading-tight ${selected ? 'text-[#ff6b5a]' : 'text-[#ccc]'}`}>
            {avatar.avatar_name || 'Sans nom'}
          </p>
        </div>
      </div>
    </button>
  )
}

// ── VideoDurationBadge ─────────────────────────────────────
export function VideoDurationBadge({ src }) {
  const [duration, setDuration] = useState(null)

  useEffect(() => {
    if (!src) return
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = src
    video.onloadedmetadata = () => setDuration(video.duration)
  }, [src])

  const label = formatDuration(duration)

  return (
    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/75 backdrop-blur-sm px-1.5 py-0.5 rounded" style={{ fontFamily: "'DM Mono', monospace" }}>
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" className="text-white/70 flex-shrink-0">
        <rect x="1" y="2" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M4 4l3 1.5L4 7V4Z" fill="currentColor"/>
      </svg>
      <span className="text-[10px] text-white font-medium leading-none">{label ?? '···'}</span>
    </div>
  )
}

// ── Section (pour Paramètres) ──────────────────────────────
export function Section({ title, children }) {
  return (
    <div className="border border-[#1a1a1a] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <span className="text-[11px] text-[#444] tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace" }}>{title}</span>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}