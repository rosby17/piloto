// app/dashboard/components/ui/utils.js

// ── Temps écoulé ───────────────────────────────────────────
export function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffH   = Math.floor(diffMin / 60)
  const diffD   = Math.floor(diffH / 24)

  if (diffSec < 60)  return "à l'instant"
  if (diffMin < 60)  return `il y a ${diffMin} min`
  if (diffH < 24)    return `il y a ${diffH}h`
  if (diffD === 1)   return 'hier'
  if (diffD < 7)     return `il y a ${diffD}j`
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

// ── Formate les secondes en "Xmin Xs" ─────────────────────
export function formatDuration(secs) {
  if (!secs || isNaN(secs)) return null
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = Math.floor(secs % 60)
  if (h > 0) return `${h}h ${m}min`
  if (m > 0) return `${m}min${s > 0 ? ' ' + s + 's' : ''}`
  return `${s}s`
}

// ── Statuts considérés "en cours" ─────────────────────────
export const STATUTS_EN_COURS = [
  'generation_script',
  'generation_meta',
  'generation_video',
  'video_en_cours',
  'en_attente',
]

// ── Input CSS commun ───────────────────────────────────────
export const inputCls = "w-full bg-[#111] border border-[#222] rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder-[#333] focus:outline-none focus:border-[#c0392b] transition"

// ── Map statut → label court ───────────────────────────────
export function getStatusLabel(statut) {
  const map = {
    en_attente:        'En attente',
    generation_script: 'Script IA',
    script_pret:       'Draft',
    generation_video:  'Envoi...',
    video_en_cours:    'Piloto',
    upload_youtube:    'Prête ✓',
    publiee:           'Publiée',
    programmee:        'Programmée',
    erreur:            'Erreur',
  }
  return map[statut] || statut
}

// ── Map statut → overlay visuel ───────────────────────────
export function getStatusOverlay(statut) {
  switch (statut) {
    case 'en_attente':
    case 'generation_script':
      return { label: 'Script en cours', bg: 'bg-violet-500/20 border-violet-500/30', dot: 'bg-violet-400', badge: 'bg-violet-500/80 text-white', glowColor: '#7c3aed', pulse: true }
    case 'script_pret':
      return { label: 'Draft', bg: 'bg-[#111]/80 border-[#333]', dot: 'bg-[#555]', badge: 'bg-[#2a2a2a] text-[#888]', glowColor: null, pulse: false }
    case 'generation_video':
      return { label: 'Envoi en cours...', bg: 'bg-amber-500/20 border-amber-500/30', dot: 'bg-amber-400', badge: 'bg-amber-500/80 text-white', glowColor: '#f59e0b', pulse: true }
    case 'video_en_cours':
      return { label: 'Piloto génère...', bg: 'bg-amber-500/20 border-amber-500/30', dot: 'bg-amber-400', badge: 'bg-amber-500/80 text-white', glowColor: '#f59e0b', pulse: true }
    case 'upload_youtube':
      return { label: 'Vidéo prête ✓', bg: 'bg-emerald-500/20 border-emerald-500/30', dot: 'bg-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400', glowColor: '#10b981', pulse: false }
    case 'publiee':
      return { label: null, badge: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400', glowColor: null, pulse: false }
    case 'programmee':
      return { label: null, badge: 'bg-sky-500/20 text-sky-400', dot: 'bg-sky-400', glowColor: null, pulse: false }
    case 'erreur':
      return { label: 'Erreur', bg: 'bg-red-500/20 border-red-500/30', dot: 'bg-red-400', badge: 'bg-red-500/20 text-red-400', glowColor: '#ef4444', pulse: false }
    default:
      return { badge: 'bg-[#2a2a2a] text-[#666]', dot: 'bg-[#444]', glowColor: null, pulse: false }
  }
}