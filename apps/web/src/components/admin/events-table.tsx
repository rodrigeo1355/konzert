"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Clock, Plus, ChevronLeft, ChevronRight } from "lucide-react"

type EventStatus = "DRAFT" | "PUBLISHED" | "REJECTED"
type Platform = "PUNTOTICKET" | "TICKETMASTER" | "PASSLINE" | "JOINNUS" | "FINTIX" | "EVENTBRITE" | "OTHER"

interface AdminEvent {
  id: string
  title: string
  status: EventStatus
  saleStatus: string
  dateStart: string
  updatedAt: string
  manuallyEdited: boolean
  venue: { name: string }
  artists: Array<{ artist: { name: string } }>
  platforms: Array<{ platform: Platform }>
}

const STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  REJECTED: "Rechazado",
}

const STATUS_COLORS: Record<EventStatus, string> = {
  DRAFT: "text-yellow-400",
  PUBLISHED: "text-emerald-400",
  REJECTED: "text-red-400",
}

const PLATFORMS: Platform[] = ["PUNTOTICKET", "TICKETMASTER", "PASSLINE", "JOINNUS", "FINTIX", "EVENTBRITE", "OTHER"]

function StatusIcon({ status }: { status: EventStatus }) {
  if (status === "PUBLISHED") return <CheckCircle className="h-3.5 w-3.5" />
  if (status === "REJECTED") return <XCircle className="h-3.5 w-3.5" />
  return <Clock className="h-3.5 w-3.5" />
}

export function EventsTable() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [events, setEvents] = useState<AdminEvent[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const status = searchParams.get("status") ?? ""
  const platform = searchParams.get("platform") ?? ""
  const from = searchParams.get("from") ?? ""
  const to = searchParams.get("to") ?? ""
  const page = parseInt(searchParams.get("page") ?? "1")

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set("status", status)
    if (platform) params.set("platform", platform)
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    params.set("page", String(page))

    const res = await fetch(`/api/admin/events?${params}`)
    if (res.ok) {
      const data = await res.json() as { events: AdminEvent[]; total: number }
      setEvents(data.events)
      setTotal(data.total)
    }
    setLoading(false)
  }, [status, platform, from, to, page])

  useEffect(() => { void fetchEvents() }, [fetchEvents])

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    router.push(`/backoffice/events?${params}`)
  }

  function setPage(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(p))
    router.push(`/backoffice/events?${params}`)
  }

  const totalPages = Math.ceil(total / 20)

  async function quickAction(id: string, action: "publish" | "reject" | "draft") {
    await fetch(`/api/admin/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    void fetchEvents()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setFilter("status", e.target.value)}
          className="h-9 rounded-lg border border-white/10 bg-[#111111] text-sm text-white/70 px-3 focus:outline-none focus:border-[#06b6d4]/50"
        >
          <option value="">Todos los estados</option>
          <option value="DRAFT">Borrador</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="REJECTED">Rechazado</option>
        </select>

        <select
          value={platform}
          onChange={(e) => setFilter("platform", e.target.value)}
          className="h-9 rounded-lg border border-white/10 bg-[#111111] text-sm text-white/70 px-3 focus:outline-none focus:border-[#06b6d4]/50"
        >
          <option value="">Todas las plataformas</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <Input
          type="date"
          value={from}
          onChange={(e) => setFilter("from", e.target.value)}
          className="h-9 w-36 text-sm"
          placeholder="Desde"
        />
        <Input
          type="date"
          value={to}
          onChange={(e) => setFilter("to", e.target.value)}
          className="h-9 w-36 text-sm"
          placeholder="Hasta"
        />

        <div className="ml-auto">
          <Button asChild size="sm">
            <Link href="/backoffice/events/new">
              <Plus className="h-4 w-4" />
              Nuevo evento
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Evento</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden md:table-cell">Artista</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden lg:table-cell">Fecha</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden lg:table-cell">Recinto</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3 hidden md:table-cell">Plataforma</th>
              <th className="text-left text-xs text-white/40 font-medium px-4 py-3">Estado</th>
              <th className="text-right text-xs text-white/40 font-medium px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-white/30 text-sm">
                  Cargando…
                </td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-white/30 text-sm">
                  No hay eventos con estos filtros
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white/90 truncate max-w-[180px]">
                        {event.title}
                      </span>
                      {event.manuallyEdited && (
                        <span className="shrink-0 text-[10px] text-[#06b6d4] border border-[#06b6d4]/30 rounded px-1.5 py-0.5">
                          manual
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50 hidden md:table-cell">
                    {event.artists.map((ea) => ea.artist.name).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-white/50 hidden lg:table-cell whitespace-nowrap">
                    {new Date(event.dateStart).toLocaleDateString("es-CL")}
                  </td>
                  <td className="px-4 py-3 text-white/50 hidden lg:table-cell truncate max-w-[140px]">
                    {event.venue.name}
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs hidden md:table-cell">
                    {event.platforms.map((p) => p.platform).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 text-xs font-medium ${STATUS_COLORS[event.status]}`}>
                      <StatusIcon status={event.status} />
                      {STATUS_LABELS[event.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {event.status !== "PUBLISHED" && (
                        <button
                          onClick={() => void quickAction(event.id, "publish")}
                          className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Publicar
                        </button>
                      )}
                      {event.status !== "REJECTED" && (
                        <button
                          onClick={() => void quickAction(event.id, "reject")}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Rechazar
                        </button>
                      )}
                      <Link
                        href={`/backoffice/events/${event.id}`}
                        className="text-xs text-[#06b6d4] hover:text-[#22d3ee] transition-colors"
                      >
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-white/40">
          <span>{total} eventos en total</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="disabled:opacity-30 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-white/60">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="disabled:opacity-30 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
