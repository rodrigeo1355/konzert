"use client"

import Link from "next/link"
import { X, MapPin, Calendar, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MapEvent } from "@/lib/types"

interface EventCardProps {
  event: MapEvent
  onClose: () => void
}

const SALE_STATUS_LABEL: Record<MapEvent["saleStatus"], string> = {
  ON_SALE: "Venta abierta",
  UPCOMING: "Próximamente",
  SOLD_OUT: "Agotadas",
}

const SALE_STATUS_COLOR: Record<MapEvent["saleStatus"], string> = {
  ON_SALE: "bg-[#06b6d4]/15 text-[#06b6d4] border border-[#06b6d4]/30",
  UPCOMING: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  SOLD_OUT: "bg-red-500/15 text-red-400 border border-red-500/30",
}

function formatPrice(min: number | null, max: number | null): string {
  if (min == null) return "Precio por confirmar"
  const fmt = (n: number) => `$${n.toLocaleString("es-CL")}`
  if (max == null || min === max) return fmt(min)
  return `${fmt(min)} — ${fmt(max)}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function EventCard({ event, onClose }: EventCardProps) {
  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl shadow-xl overflow-hidden w-72">
      {event.imageUrl && (
        <div className="h-32 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight text-white">{event.title}</h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 transition-colors shrink-0 mt-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <span
          className={[
            "self-start text-xs font-medium px-2.5 py-0.5 rounded-full",
            SALE_STATUS_COLOR[event.saleStatus],
          ].join(" ")}
        >
          {SALE_STATUS_LABEL[event.saleStatus]}
        </span>

        <div className="flex flex-col gap-1.5 text-xs text-white/50">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-white/30" />
            {formatDate(event.dateStart)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-white/30" />
            {event.venueName}
          </span>
          <span className="flex items-center gap-1.5">
            <Ticket className="h-3.5 w-3.5 shrink-0 text-white/30" />
            {formatPrice(event.priceMin, event.priceMax)}
          </span>
        </div>

        <Button asChild size="sm" className="w-full mt-1">
          <Link href={`/events/${event.id}`}>Ver detalles</Link>
        </Button>
      </div>
    </div>
  )
}
