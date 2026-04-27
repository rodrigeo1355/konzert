"use client"

import { useState, useEffect, useCallback } from "react"
import { Bell, Ticket, Loader2, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface NotificationItem {
  id: string
  type: "EVENT_ANNOUNCED" | "SALE_OPENED"
  sentAt: string
  readAt: string | null
  event: { id: string; title: string; imageUrl: string | null }
}

interface ApiResponse {
  notifications: NotificationItem[]
  unreadCount: number
}

const TYPE_LABEL: Record<NotificationItem["type"], string> = {
  EVENT_ANNOUNCED: "Evento anunciado",
  SALE_OPENED: "Venta abierta",
}

function NotificationIcon({ type }: { type: NotificationItem["type"] }) {
  if (type === "SALE_OPENED") return <Ticket className="h-5 w-5 text-[#06b6d4]" />
  return <Bell className="h-5 w-5 text-[#06b6d4]" />
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function NotificationList() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotifications = useCallback(async () => {
    const res = await fetch("/api/user/notifications")
    if (!res.ok) return
    const data = (await res.json()) as ApiResponse
    setItems(data.notifications)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markRead = useCallback(async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    )
    await fetch(`/api/user/notifications/${id}`, { method: "PATCH" })
  }, [])

  const markAllRead = useCallback(async () => {
    setMarkingAll(true)
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })))
    await fetch("/api/user/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    })
    setMarkingAll(false)
  }, [])

  const unreadCount = items.filter((n) => !n.readAt).length

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-white/40">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando notificaciones…
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <Bell className="h-10 w-10 text-white/10" />
        <p className="text-sm text-white/40">Todavía no tienes notificaciones.</p>
        <p className="text-xs text-white/25">
          Te avisaremos cuando un artista que sigues anuncie un show en Chile.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/30">{unreadCount} sin leer</p>
          <Button
            size="sm"
            variant="ghost"
            onClick={markAllRead}
            disabled={markingAll}
            className="text-xs text-white/40 hover:text-white h-7 px-2"
          >
            {markingAll ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
            ) : (
              <CheckCheck className="h-3 w-3 mr-1.5" />
            )}
            Marcar todas como leídas
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-0.5">
        {items.map((n) => (
          <Link
            key={n.id}
            href={`/events/${n.event.id}`}
            onClick={() => !n.readAt && markRead(n.id)}
            className={[
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-colors",
              n.readAt ? "hover:bg-white/5" : "bg-white/5 hover:bg-white/[0.08]",
            ].join(" ")}
          >
            <div className="h-10 w-10 rounded-full bg-[#1e3a8a]/20 border border-[#1e3a8a]/30 flex items-center justify-center shrink-0">
              <NotificationIcon type={n.type} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={["text-sm leading-tight truncate", n.readAt ? "text-white/60" : "text-white font-medium"].join(" ")}>
                {n.event.title}
              </p>
              <p className="text-xs text-white/30 mt-0.5">
                {TYPE_LABEL[n.type]} · {formatDate(n.sentAt)}
              </p>
            </div>
            {!n.readAt && (
              <span className="h-2 w-2 rounded-full bg-[#06b6d4] shrink-0" />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
