import PricingSection from './components/PricingSection'

export const dynamic = 'force-dynamic'



const Icon = {
  plane: (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2 7.5L13 2L10 7.5L13 13L2 7.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  ),
  check: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  arrow: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  source: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 9h9M3 13h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  ai: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2.5L12 8H17.5L13 11.5L14.5 17L10 13.5L5.5 17L7 11.5L2.5 8H8L10 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  ),
  video: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M14 8l4-2v8l-4-2V8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  ),
  image: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="7" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M2 13l4-4 3 3 3-2.5 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M2 9h16M6 2v4M14 2v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  channels: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="3.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="16.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="3.5" cy="15" r="2" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="16.5" cy="15" r="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5.5 5.5L7.5 8M12.5 8L14.5 5.5M5.5 14.5L7.5 12M12.5 12L14.5 14.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  ),
  seo: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M13.5 13.5L17.5 17.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M6 9h6M9 6v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  logo: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 8l4-5.5 3.5 4.5 2.5-3L14 8" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 border-b border-[#161616] bg-[#0a0a0a]/90 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#c0392b] rounded-md flex items-center justify-center">
            {Icon.logo}
          </div>
          <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[17px] text-white tracking-tight">Piloto</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {[
            { href: '#comment', label: 'Comment' },
            { href: '#fonctionnalites', label: 'Fonctionnalités' },
            { href: '#tarifs', label: 'Tarifs' },
          ].map((item) => (
            <a key={item.href} href={item.href}
              className="text-[13px] text-[#555] hover:text-white transition"
              style={{ fontFamily: "'DM Mono', monospace" }}>
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a href="/login" className="text-[13px] text-[#555] hover:text-white transition">
            Connexion
          </a>
          <a href="/register"
            className="flex items-center gap-2 bg-[#c0392b] hover:bg-[#a93226] text-white text-[13px] font-medium px-4 py-2 rounded-lg transition">
            Commencer {Icon.arrow}
          </a>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="pt-36 pb-28 px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(192,57,43,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(192,57,43,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-[#c0392b]/6 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2.5 border border-[#1e1e1e] bg-[#111] rounded-full px-4 py-2 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#c0392b]" />
            <span className="text-[12px] text-[#555]" style={{ fontFamily: "'DM Mono', monospace" }}>
              Heygen × YouTube — pipeline automatique
            </span>
          </div>

          <h1 style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-[56px] md:text-[76px] leading-[1.05] text-white mb-6">
            Transforme une idée<br />
            en vidéo YouTube<br />
            <span className="text-[#c0392b] italic">automatiquement.</span>
          </h1>

          <p className="text-[16px] text-[#555] max-w-xl mb-10 leading-relaxed">
            Envoie un lien, un sujet ou un script. Piloto reformule avec l'IA, génère ta vidéo avec ton avatar Heygen, crée la miniature et publie sur YouTube à la date que tu choisis.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a href="/register"
              className="inline-flex items-center gap-2.5 bg-[#c0392b] hover:bg-[#a93226] text-white font-medium px-6 py-3.5 rounded-lg transition text-[14px]">
              Commencer gratuitement {Icon.arrow}
            </a>
            <a href="#comment"
              className="inline-flex items-center gap-2 border border-[#1e1e1e] hover:border-[#2a2a2a] text-[#555] hover:text-white px-6 py-3.5 rounded-lg transition text-[14px]">
              Voir comment ça marche
            </a>
          </div>

          <p className="text-[12px] text-[#333] mt-5" style={{ fontFamily: "'DM Mono', monospace" }}>
            Aucune carte bancaire · Annulation à tout moment
          </p>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────── */}
      <section className="border-y border-[#131313] bg-[#080808] py-10">
        <div className="max-w-4xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '10×', label: 'Plus rapide' },
            { value: '500+', label: 'Créateurs' },
            { value: '50K+', label: 'Vidéos publiées' },
            { value: '98%', label: 'Satisfaction' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "'DM Serif Display', serif" }}
                className="text-[36px] text-[#c0392b] leading-none mb-1">{s.value}</div>
              <div className="text-[12px] text-[#444]" style={{ fontFamily: "'DM Mono', monospace" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ───────────────────────────── */}
      <section id="comment" className="py-28 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <p className="text-[11px] text-[#333] tracking-[.2em] uppercase mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>
              Pipeline
            </p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[40px] leading-tight text-white">
              De l'idée à la publication<br />
              <span className="text-[#c0392b] italic">en quelques clics.</span>
            </h2>
          </div>

          <div className="space-y-2">
            {[
              {
                n: '01', icon: Icon.source, title: 'Source du contenu',
                desc: "Envoie un lien YouTube, un fichier PDF/TXT ou colle ton script. Piloto s'adapte à toutes les sources.",
                tags: ['URL YouTube', 'PDF', 'TXT', 'Texte libre'],
              },
              {
                n: '02', icon: Icon.ai, title: 'Script IA viral',
                desc: "Notre IA reformule ton contenu en script optimisé pour maximiser l'engagement — court, moyen ou long.",
                tags: ['Script optimisé', 'Durée personnalisable', 'Ton ajustable'],
              },
              {
                n: '03', icon: Icon.video, title: 'Vidéo générée sur Heygen',
                desc: 'Le script est envoyé à Heygen. Ta vidéo est générée avec ton avatar et ta voix. Tout est personnalisable.',
                tags: ['Ton avatar', 'Ta voix', 'Tes paramètres'],
              },
              {
                n: '04', icon: Icon.image, title: 'Miniature automatique',
                desc: 'Piloto génère une miniature accrocheuse basée sur le titre. Personnalisable ou remplaçable avant publication.',
                tags: ['Auto-générée', 'Personnalisable', '1280×720'],
              },
              {
                n: '05', icon: Icon.calendar, title: 'Publication programmée',
                desc: 'Choisis la date et l\'heure. Piloto publie automatiquement sur ta chaîne avec titre SEO et description.',
                tags: ['Titre SEO', 'Description auto', 'Date libre'],
              },
            ].map((s, i) => (
              <div key={i} className="flex gap-5 items-start border border-[#131313] hover:border-[#c0392b]/20 rounded-xl p-5 transition group bg-[#080808]">
                <div className="flex-shrink-0 flex items-center gap-4">
                  <span className="text-[11px] text-[#2a2a2a] w-6 text-right" style={{ fontFamily: "'DM Mono', monospace" }}>{s.n}</span>
                  <div className="w-9 h-9 rounded-lg border border-[#1a1a1a] group-hover:border-[#c0392b]/40 flex items-center justify-center text-[#444] group-hover:text-[#c0392b] transition bg-[#0d0d0d]">
                    {s.icon}
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-[14px] font-semibold text-[#ccc] mb-1.5">{s.title}</h3>
                  <p className="text-[13px] text-[#444] leading-relaxed mb-3">{s.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.tags.map((t, j) => (
                      <span key={j} className="text-[11px] text-[#333] border border-[#1a1a1a] px-2.5 py-0.5 rounded-full"
                        style={{ fontFamily: "'DM Mono', monospace" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FONCTIONNALITÉS ─────────────────────────────── */}
      <section id="fonctionnalites" className="py-28 px-8 bg-[#080808] border-y border-[#131313]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <p className="text-[11px] text-[#333] tracking-[.2em] uppercase mb-3" style={{ fontFamily: "'DM Mono', monospace" }}>
              Fonctionnalités
            </p>
            <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[40px] leading-tight text-white">
              Tout est personnalisable.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {[
              { icon: Icon.source, title: 'Toutes les sources', desc: 'Lien, PDF, TXT ou texte libre. Piloto extrait et reformule le contenu automatiquement.' },
              { icon: Icon.ai, title: 'Script IA viral', desc: "Script optimisé pour maximiser l'engagement selon la durée et le ton que tu choisis." },
              { icon: Icon.video, title: 'Avatar Heygen', desc: 'Connecte ton compte Heygen et utilise ton propre avatar avec la voix de ton choix.' },
              { icon: Icon.image, title: 'Miniature HD', desc: 'Génération automatique ou upload de la tienne. Format optimisé pour YouTube.' },
              { icon: Icon.seo, title: 'Publication auto', desc: 'Titre SEO, description et date de publication configurés automatiquement.' },
              { icon: Icon.channels, title: 'Multi-chaînes', desc: 'Connecte plusieurs chaînes YouTube et choisis la destination à chaque vidéo.' },
            ].map((f, i) => (
              <div key={i} className="border border-[#131313] hover:border-[#c0392b]/25 rounded-xl p-5 transition group bg-[#0a0a0a]">
                <div className="w-9 h-9 rounded-lg border border-[#1a1a1a] group-hover:border-[#c0392b]/40 flex items-center justify-center text-[#333] group-hover:text-[#c0392b] transition mb-4">
                  {f.icon}
                </div>
                <h3 className="text-[13px] font-semibold text-[#aaa] mb-1.5">{f.title}</h3>
                <p className="text-[12px] text-[#3a3a3a] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TARIFS ──────────────────────────────────────── */}
      <PricingSection />

      {/* ── CTA FINAL ───────────────────────────────────── */}
      <section className="py-28 px-8 border-t border-[#131313] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(192,57,43,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(192,57,43,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#c0392b]/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-2xl mx-auto text-center">
          <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[48px] leading-tight text-white mb-5">
            Prêt à voler en<br />
            <span className="text-[#c0392b] italic">pilote automatique ?</span>
          </h2>
          <p className="text-[14px] text-[#444] mb-8 leading-relaxed">
            De l'idée à la vidéo publiée — sans effort, sans montage.
          </p>
          <a href="/register"
            className="inline-flex items-center gap-2.5 bg-[#c0392b] hover:bg-[#a93226] text-white font-medium px-7 py-3.5 rounded-lg transition text-[14px]">
            Commencer gratuitement {Icon.arrow}
          </a>
          <p className="text-[11px] text-[#282828] mt-4" style={{ fontFamily: "'DM Mono', monospace" }}>
            Aucune carte bancaire · Annulation à tout moment
          </p>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="border-t border-[#111] py-6 px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#c0392b] rounded flex items-center justify-center">
            {Icon.logo}
          </div>
          <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[14px] text-[#333]">Piloto</span>
        </div>
        <p className="text-[11px] text-[#2a2a2a]" style={{ fontFamily: "'DM Mono', monospace" }}>
          © 2026 Piloto
        </p>
      </footer>

    </main>
  )
}