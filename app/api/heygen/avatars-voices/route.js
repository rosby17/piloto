// app/api/heygen/avatars-voices/route.js

// ── Cache module-level (persiste entre les appels tant que la fonction est chaude) ──
let cache = null
let cacheAt = 0
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

export async function POST(req) {
  try {
    const now = Date.now()

    // ── Retourner le cache si encore valide ──
    if (cache && (now - cacheAt) < CACHE_TTL) {
      return Response.json({ ...cache, cached: true })
    }

    const apiKey = process.env.HEYGEN_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'HEYGEN_API_KEY manquante' }, { status: 500 })
    }

    const headers = {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
    }

    // ── Fix 2 : appels en parallèle ──
    const [avatarsRes, voicesRes] = await Promise.all([
      fetch('https://api.heygen.com/v2/avatars', { headers }),
      fetch('https://api.heygen.com/v2/voices',  { headers }),
    ])

    const [avatarsData, voicesData] = await Promise.all([
      avatarsRes.json(),
      voicesRes.json(),
    ])

    const avatars = avatarsData?.data?.avatars ?? []
    const voices  = voicesData?.data?.voices   ?? []

    // Trier : avatars perso en premier
    const sorted = [
      ...avatars.filter(a => a.type === 'personal'),
      ...avatars.filter(a => a.type !== 'personal'),
    ]

    const result = { avatars: sorted, voices }

    // ── Mettre en cache ──
    cache   = result
    cacheAt = now

    return Response.json(result)

  } catch (err) {
    console.error('avatars-voices error:', err)
    // Retourner le cache périmé plutôt qu'une erreur
    if (cache) return Response.json({ ...cache, cached: true, stale: true })
    return Response.json({ error: err.message }, { status: 500 })
  }
}