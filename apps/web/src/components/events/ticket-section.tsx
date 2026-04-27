"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, Ban } from "lucide-react"

const PLATFORM_LABEL: Record<string, string> = {
  PUNTOTICKET: "PuntoTicket",
  TICKETMASTER: "Ticketmaster",
  PASSLINE: "Passline",
  EVENTBRITE: "Eventbrite",
  OTHER: "Comprar entradas",
}

interface Platform {
  id: string
  platform: string
  ticketUrl: string
}

interface TicketSectionProps {
  eventId: string
  saleStatus: "UPCOMING" | "ON_SALE" | "SOLD_OUT"
  platforms: Platform[]
}

export function TicketSection({ eventId, saleStatus, platforms }: TicketSectionProps) {
  const handleBuy = useCallback(
    async (platform: string, url: string) => {
      await fetch(`/api/events/${eventId}/track-click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      }).catch(() => {}) // tracking es best-effort

      window.open(url, "_blank", "noopener,noreferrer")
    },
    [eventId]
  )

  if (saleStatus === "SOLD_OUT") {
    return (
      <div className="flex flex-col gap-3 rounded-xl border bg-muted/50 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Ban className="h-4 w-4 shrink-0" />
          <span>Entradas agotadas</span>
        </div>
        {platforms.map((p) => (
          <Button
            key={p.id}
            variant="outline"
            className="w-full justify-between opacity-50"
            disabled
          >
            {PLATFORM_LABEL[p.platform] ?? p.platform}
            <span className="text-xs text-muted-foreground">Agotado</span>
          </Button>
        ))}
      </div>
    )
  }

  if (saleStatus === "UPCOMING") {
    return (
      <div className="flex flex-col gap-3 rounded-xl border bg-muted/50 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" />
          <span>La venta de entradas aún no ha comenzado</span>
        </div>
        <Button variant="outline" className="w-full" disabled>
          Próximamente
        </Button>
      </div>
    )
  }

  // ON_SALE
  if (platforms.length === 0) {
    return (
      <div className="rounded-xl border bg-muted/50 p-4 text-sm text-muted-foreground">
        No hay plataformas de venta disponibles aún.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Comprar entradas</p>
      {platforms.map((p) => (
        <Button
          key={p.id}
          className="w-full justify-between"
          onClick={() => handleBuy(p.platform, p.ticketUrl)}
        >
          {PLATFORM_LABEL[p.platform] ?? p.platform}
          <ExternalLink className="h-4 w-4" />
        </Button>
      ))}
    </div>
  )
}
