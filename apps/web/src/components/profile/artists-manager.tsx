"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UserCheck, UserPlus, Loader2, Music2, Search } from "lucide-react"
import { useDebounce } from "@/lib/use-debounce"

interface Artist {
  id: string
  name: string
  imageUrl: string | null
}

function ArtistAvatar({ artist }: { artist: Artist }) {
  return (
    <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
      {artist.imageUrl ? (
        <img src={artist.imageUrl} alt={artist.name} className="h-full w-full object-cover" />
      ) : (
        <Music2 className="h-5 w-5 text-white/30" />
      )}
    </div>
  )
}

export function ArtistsManager() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Artist[]>([])
  const [following, setFollowing] = useState<Artist[]>([])
  const [, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [searching, setSearching] = useState(false)

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    fetch("/api/artists/following")
      .then((r) => r.json() as Promise<Artist[]>)
      .then(setFollowing)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    fetch(`/api/artists/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json() as Promise<Artist[]>)
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setSearching(false))
  }, [debouncedQuery])

  const isFollowing = useCallback(
    (id: string) => following.some((a) => a.id === id),
    [following]
  )

  const follow = useCallback(
    async (artist: Artist) => {
      if (following.length >= 50) {
        setLimitReached(true)
        return
      }
      setLoadingId(artist.id)
      setFollowing((prev) => [artist, ...prev])

      const res = await fetch(`/api/artists/${artist.id}/follow`, { method: "POST" })
      if (!res.ok) {
        setFollowing((prev) => prev.filter((a) => a.id !== artist.id))
        if (res.status === 422) setLimitReached(true)
      }
      setLoadingId(null)
    },
    [following.length]
  )

  const unfollow = useCallback(async (artistId: string) => {
    setLoadingId(artistId)
    setFollowing((prev) => prev.filter((a) => a.id !== artistId))

    const res = await fetch(`/api/artists/${artistId}/follow`, { method: "DELETE" })
    if (!res.ok) {
      fetch("/api/artists/following")
        .then((r) => r.json() as Promise<Artist[]>)
        .then(setFollowing)
        .catch(() => {})
    }
    setLoadingId(null)
    setLimitReached(false)
  }, [])

  const showResults = debouncedQuery.length >= 2

  return (
    <div className="flex flex-col gap-6">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <Input
          placeholder="Buscar artista..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-white/30" />
        )}
      </div>

      {limitReached && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2.5 rounded-xl">
          Alcanzaste el límite de 50 artistas. Deja de seguir alguno para agregar más.
        </p>
      )}

      {/* Resultados de búsqueda */}
      {showResults && (
        <div className="flex flex-col gap-0.5">
          {results.length === 0 && !searching ? (
            <p className="text-sm text-white/40 py-4 text-center">
              No encontramos &quot;{debouncedQuery}&quot;
            </p>
          ) : (
            results.map((artist) => {
              const followed = isFollowing(artist.id)
              const loading = loadingId === artist.id
              return (
                <div
                  key={artist.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <ArtistAvatar artist={artist} />
                  <span className="text-sm font-medium flex-1 text-white">{artist.name}</span>
                  <Button
                    size="sm"
                    variant={followed ? "outline" : "default"}
                    onClick={() => (followed ? unfollow(artist.id) : follow(artist))}
                    disabled={loading}
                    className="shrink-0 w-28"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : followed ? (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Siguiendo
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Seguir
                      </>
                    )}
                  </Button>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Lista de seguidos */}
      <div className="flex flex-col gap-0.5">
        <p className="text-xs font-medium text-white/30 uppercase tracking-widest mb-2">
          Siguiendo ({following.length}/50)
        </p>
        {following.length === 0 ? (
          <p className="text-sm text-white/40 py-6 text-center">
            Todavía no sigues ningún artista. Búscalos arriba.
          </p>
        ) : (
          following.map((artist) => (
            <div
              key={artist.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <ArtistAvatar artist={artist} />
              <span className="text-sm font-medium flex-1 text-white">{artist.name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => unfollow(artist.id)}
                disabled={loadingId === artist.id}
                className="shrink-0 text-white/30 hover:text-destructive hover:bg-destructive/10"
              >
                {loadingId === artist.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Dejar de seguir"
                )}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
