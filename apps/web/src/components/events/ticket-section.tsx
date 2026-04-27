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
      }).catch(() => {})

      window.open(url, "_blank", "noopener,noreferrer")
    },
    [eventId]
  )

  if (saleStatus === "SOLD_OUT") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#111111] p-4">
        <div className="flex items-center gap-2 text-sm text-red-400">
          <Ban className="h-4 w-4 shrink-0" />
          <span>Entradas agotadas</span>
        </div>
        {platforms.map((p) => (
          <Button
            key={p.id}
            variant="outline"
            className="w-full justify-between opacity-40"
            disabled
          >
            {PLATFORM_LABEL[p.platform] ?? p.platform}
            <span className="text-xs text-white/30">Agotado</span>
          </Button>
        ))}
      </div>
    )
  }

  if (saleStatus === "UPCOMING") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#111111] p-4">
        <div className="flex items-center gap-2 text-sm text-amber-400">
          <Clock className="h-4 w-4 shrink-0" />
          <span>La venta de entradas aún no ha comenzado</span>
        </div>
        <Button variant="outline" className="w-full opacity-50" disabled>
          Próximamente
        </Button>
      </div>
    )
  }

  // ON_SALE
  if (platforms.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111111] p-4 text-sm text-white/40">
        No hay plataformas de venta disponibles aún.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-white/30 uppercase tracking-widest">Comprar entradas</p>
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
