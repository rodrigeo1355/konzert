interface SpotifyToken {
  access_token: string
  expires_at: number
}

interface SpotifyArtist {
  id: string
  name: string
  images: Array<{ url: string; width: number; height: number }>
  genres: string[]
  popularity: number
}

interface SpotifySearchResult {
  artists: { items: SpotifyArtist[] }
}

let cached: SpotifyToken | null = null

async function getToken(): Promise<string> {
  if (cached && cached.expires_at > Date.now() + 5000) return cached.access_token

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) throw new Error("Spotify credentials not configured")

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  })

  if (!res.ok) throw new Error(`Spotify token error: ${res.status}`)

  const data = (await res.json()) as { access_token: string; expires_in: number }
  cached = { access_token: data.access_token, expires_at: Date.now() + data.expires_in * 1000 }
  return cached.access_token
}

export async function searchSpotifyArtists(query: string): Promise<SpotifyArtist[]> {
  const token = await getToken()
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=5&market=CL`

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`Spotify search error: ${res.status}`)

  const data = (await res.json()) as SpotifySearchResult
  return data.artists.items
}

export function normalizeArtistName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
}

export type { SpotifyArtist }
