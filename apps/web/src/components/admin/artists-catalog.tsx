"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Music2, Search, Plus, Trash2, Loader2, ExternalLink } from "lucide-react"
import { useDebounce } from "@/lib/use-debounce"
import Link from "next/link"

interface ArtistRow {
  id: string
  name: string
  imageUrl: string | null
  spotifyId: string | null
  _count: { followers: number; eventArtists: number }
}

interface SpotifyResult {
  spotifyId: string
  name: string
  imageUrl: string | null
  genres: string[]
  popularity: number
}

function ArtistAvatar({ src, name }: { src: string | null; name: string }) {
  return (
    <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <Music2 className="h-4 w-4 text-white/20" />
      )}
    </div>
  )
}

export function ArtistsCatalog() {
  const router = useRouter()
  const [artists, setArtists] = useState<ArtistRow[]>([])
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [showImport, setShowImport] = useState(false)
  const [spotifyQuery, setSpotifyQuery] = useState("")
  const [spotifyResults, setSpotifyResults] = useState<SpotifyResult[]>([])
  const [spotifyLoading, setSpotifyLoading] = useState(false)
  const [importingId, setImportingId] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, 300)
  const debouncedSpotify = useDebounce(spotifyQuery, 400)

  const fetchArtists = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (debouncedQuery) params.set("q", debouncedQuery)
    const res = await fetch(`/api/admin/artists?${params}`)
    if (res.ok) {
      const data = await res.json() as { artists: ArtistRow[]; total: number }
      setArtists(data.artists)
      setTotal(data.total)
    }
    setLoading(false)
  }, [debouncedQuery])

  useEffect(() => { void fetchArtists() }, [fetchArtists])

  useEffect(() => {
    if (debouncedSpotify.length < 2) { setSpotifyResults([]); return }
    setSpotifyLoading(true)
    fetch(`/api/admin/artists/spotify-search?q=${encodeURIComponent(debouncedSpotify)}`)
      .then((r) => r.json() as Promise<SpotifyResult[]>)
      .then(setSpotifyResults)
      .catch(() => setSpotifyResults([]))
      .finally(() => setSpotifyLoading(false))
  }, [debouncedSpotify])

  async function importArtist(artist: SpotifyResult) {
    setImportingId(artist.spotifyId)
    const res = await fetch("/api/admin/artists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: artist.name,
        imageUrl: artist.imageUrl,
        spotifyId: artist.spotifyId,
      }),
    })
    setImportingId(null)
    if (res.ok) {
      setShowImport(false)
      setSpotifyQuery("")
      setSpotifyResults([])
      void fetchArtists()
    } else {
      const data = await res.json() as { error?: string }
      alert(data.error ?? "Error al importar artista.")
    }
  }

  async function deleteArtist(id: string, name: string) {
    if (!confirm(`¿Eliminar a ${name} del catálogo?`)) return
    setDeletingId(id)
    await fetch(`/api/admin/artists/${id}`, { method: "DELETE" })
    setDeletingId(null)
    void fetchArtists()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar artista…"
            className="pl-8 h-9 text-sm"
          />
        </div>
        <Link href="/backoffice/artists/pending-matches">
          <Button variant="outline" size="sm">
            Cola de revisión
          </Button>
        </Link>
        <Button size="sm" onClick={() => setShowImport((v) => !v)}>
          <Plus className="h-4 w-4" />
          Importar de Spotify
        </Button>
      </div>

      {/* Import panel */}
      {showImport && (
        <div className="rounded-2xl border border-[#06b6d4]/20 bg-[#06b6d4]/5 p-4 flex flex-col gap-3">
          <p className="text-sm font-semibold text-white/70">Importar artista desde Spotify</p>
          <Input
            value={spotifyQuery}
            onChange={(e) => setSpotifyQuery(e.target.value)}
            placeholder="Nombre del artista…"
            className="h-9 text-sm max-w-sm"
            autoFocus
          />
          {spotifyLoading && (
            <div className="flex items-center gap-2 text-xs text-white/30">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Buscando…
            </div>
          )}
          {spotifyResults.length > 0 && (
            <div className="flex flex-col gap-1">
              {spotifyResults.map((a) => (
                <div
                  key={a.spotifyId}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2"
                >
                  <ArtistAvatar src={a.imageUrl} name={a.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 font-medium truncate">{a.name}</p>
                    <p className="text-xs text-white/30 truncate">
                      {a.genres.slice(0, 2).join(", ") || "Sin géneros"} · Pop. {a.popularity}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={importingId === a.spotifyId}
                    onClick={() => void importArtist(a)}
                  >
                    {importingId === a.spotifyId ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Importar"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Artista</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden md:table-cell">Spotify</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden sm:table-cell">Seguidores</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden sm:table-cell">Eventos</th>
              <th className="text-right text-xs text-white/40 font-medium px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-white/30 text-sm">
                  Cargando…
                </td>
              </tr>
            ) : artists.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-white/30 text-sm">
                  No hay artistas
                </td>
              </tr>
            ) : (
              artists.map((artist) => (
                <tr key={artist.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <ArtistAvatar src={artist.imageUrl} name={artist.name} />
                      <span className="text-white/80 font-medium">{artist.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {artist.spotifyId ? (
                      <a
                        href={`https://open.spotify.com/artist/${artist.spotifyId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#06b6d4] hover:text-[#22d3ee] transition-colors text-xs"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Spotify
                      </a>
                    ) : (
                      <span className="text-white/20 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs hidden sm:table-cell">
                    {artist._count.followers}
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs hidden sm:table-cell">
                    {artist._count.eventArtists}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => void deleteArtist(artist.id, artist.name)}
                      disabled={deletingId === artist.id}
                      className="text-red-400/60 hover:text-red-400 transition-colors disabled:opacity-30"
                    >
                      {deletingId === artist.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-white/20">{total} artistas en total</p>
    </div>
  )
}
