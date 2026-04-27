import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { searchSpotifyArtists } from "@/lib/spotify"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  if ((session.user as { role?: string }).role !== "ADMIN") return null
  return session.user
}

export async function GET(req: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  try {
    const artists = await searchSpotifyArtists(q)
    return NextResponse.json(
      artists.map((a) => ({
        spotifyId: a.id,
        name: a.name,
        imageUrl: a.images[0]?.url ?? null,
        genres: a.genres,
        popularity: a.popularity,
      }))
    )
  } catch {
    return NextResponse.json({ error: "Error al consultar Spotify." }, { status: 502 })
  }
}
