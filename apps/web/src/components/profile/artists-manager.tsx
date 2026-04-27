"use client"

import { useState, useEffect, useCallback, useRef, useTransition } from "react"
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
    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
      {artist.imageUrl ? (
        <img src={artist.imageUrl} alt={artist.name} className="h-full w-full object-cover" />
      ) : (
        <Music2 className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
  )
}

export function ArtistsManager() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Artist[]>([])
  const [following, setFollowing] = useState<Artist[]>([])
  const [pending, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [searching, setSearching] = useState(false)

  const debouncedQuery = useDebounce(query, 300)

  // Cargar artistas seguidos
  useEffect(() => {
    fetch("/api/artists/following")
      .then((r) => r.json() as Promise<Artist[]>)
      .then(setFollowing)
      .catch(() => {})
  }, [])

  // Búsqueda con debounce
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
      // Optimistic update
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
    // Optimistic update
    setFollowing((prev) => prev.filter((a) => a.id !== artistId))

    const res = await fetch(`/api/artists/${artistId}/follow`, { method: "DELETE" })
    if (!res.ok) {
      // Revertir si falla — recargamos la lista
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar artista..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {limitReached && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          Alcanzaste el límite de 50 artistas. Deja de seguir alguno para agregar más.
        </p>
      )}

      {/* Resultados de búsqueda */}
      {showResults && (
        <div className="flex flex-col gap-1">
          {results.length === 0 && !searching ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No encontramos &quot;{debouncedQuery}&quot;
            </p>
          ) : (
            results.map((artist) => {
              const following_ = isFollowing(artist.id)
              const loading = loadingId === artist.id
              return (
                <div
                  key={artist.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
                >
                  <ArtistAvatar artist={artist} />
                  <span className="text-sm font-medium flex-1">{artist.name}</span>
                  <Button
                    size="sm"
                    variant={following_ ? "outline" : "default"}
                    onClick={() => (following_ ? unfollow(artist.id) : follow(artist))}
                    disabled={loading}
                    className="shrink-0 w-28"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : following_ ? (
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
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground mb-1">
          Siguiendo ({following.length}/50)
        </p>
        {following.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Todavía no sigues ningún artista. Búscalos arriba.
          </p>
        ) : (
          following.map((artist) => (
            <div
              key={artist.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
            >
              <ArtistAvatar artist={artist} />
              <span className="text-sm font-medium flex-1">{artist.name}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => unfollow(artist.id)}
                disabled={loadingId === artist.id}
                className="shrink-0 text-muted-foreground hover:text-destructive"
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
