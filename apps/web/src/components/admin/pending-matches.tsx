"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, Music2, Calendar } from "lucide-react"

interface PendingMatch {
  eventId: string
  artistId: string
  matchScore: number
  event: { id: string; title: string; dateStart: string }
  artist: { id: string; name: string; imageUrl: string | null }
}

export function PendingMatches() {
  const [matches, setMatches] = useState<PendingMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  const fetchMatches = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/artists/pending-matches")
    if (res.ok) setMatches(await res.json() as PendingMatch[])
    setLoading(false)
  }, [])

  useEffect(() => { void fetchMatches() }, [fetchMatches])

  async function act(eventId: string, artistId: string, action: "approve" | "reject") {
    const key = `${eventId}:${artistId}`
    setActing(key)
    await fetch("/api/admin/artists/pending-matches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, artistId, action }),
    })
    setActing(null)
    setMatches((prev) => prev.filter((m) => !(m.eventId === eventId && m.artistId === artistId)))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-white/30 text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando…
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <CheckCircle className="h-8 w-8 text-emerald-400/50" />
        <p className="text-sm text-white/40">No hay matches pendientes de revisión.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {matches.map((m) => {
        const key = `${m.eventId}:${m.artistId}`
        const isActing = acting === key
        return (
          <div
            key={key}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#111111] px-4 py-3"
          >
            {/* Artist */}
            <div className="h-9 w-9 rounded-full bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
              {m.artist.imageUrl ? (
                <img src={m.artist.imageUrl} alt={m.artist.name} className="h-full w-full object-cover" />
              ) : (
                <Music2 className="h-4 w-4 text-white/20" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">{m.artist.name}</p>
              <p className="text-xs text-white/40 flex items-center gap-1 truncate">
                <Calendar className="h-3 w-3 shrink-0" />
                {m.event.title}
              </p>
            </div>

            {/* Score */}
            <div className="text-xs text-white/30 shrink-0 hidden sm:block">
              Confianza{" "}
              <span className="text-yellow-400/70 font-mono">
                {Math.round(m.matchScore * 100)}%
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                disabled={isActing}
                onClick={() => void act(m.eventId, m.artistId, "approve")}
                className="border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/10"
              >
                {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                Confirmar
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isActing}
                onClick={() => void act(m.eventId, m.artistId, "reject")}
                className="border-red-400/20 text-red-400 hover:bg-red-400/10"
              >
                {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                Rechazar
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
