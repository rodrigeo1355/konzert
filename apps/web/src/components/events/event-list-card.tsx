import Link from "next/link"
import { Calendar, MapPin, Music2 } from "lucide-react"

const SALE_STATUS_LABEL: Record<string, string> = {
  ON_SALE: "Venta abierta",
  UPCOMING: "Próximamente",
  SOLD_OUT: "Agotadas",
}

const SALE_STATUS_COLOR: Record<string, string> = {
  ON_SALE: "bg-[#06b6d4]/15 text-[#06b6d4] border border-[#06b6d4]/30",
  UPCOMING: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  SOLD_OUT: "bg-red-500/15 text-red-400 border border-red-500/30",
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatPrice(min: number | null, max: number | null): string {
  if (min == null) return "Precio por confirmar"
  const fmt = (n: number) => `$${n.toLocaleString("es-CL")}`
  if (max == null || min === max) return fmt(min)
  return `${fmt(min)} — ${fmt(max)}`
}

interface EventListCardProps {
  id: string
  title: string
  dateStart: Date
  saleStatus: string
  priceMin: number | null
  priceMax: number | null
  imageUrl: string | null
  venueName: string
  venueAddress: string
}

export function EventListCard({
  id,
  title,
  dateStart,
  saleStatus,
  priceMin,
  priceMax,
  imageUrl,
  venueName,
  venueAddress,
}: EventListCardProps) {
  return (
    <Link
      href={`/events/${id}`}
      className="group flex flex-col bg-[#111111] border border-white/8 rounded-2xl overflow-hidden hover:border-white/20 transition-all hover:shadow-lg hover:shadow-black/40"
    >
      <div className="relative h-44 overflow-hidden bg-white/5">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, #1e3a8a 0%, #0d0d0d 80%)",
            }}
          >
            <Music2 className="h-10 w-10 text-white/10" />
          </div>
        )}
        <span
          className={[
            "absolute top-3 left-3 text-xs font-medium px-2.5 py-0.5 rounded-full",
            SALE_STATUS_COLOR[saleStatus] ?? "bg-white/10 text-white/50 border border-white/20",
          ].join(" ")}
        >
          {SALE_STATUS_LABEL[saleStatus] ?? saleStatus}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-semibold text-sm leading-snug text-white line-clamp-2 group-hover:text-[#06b6d4] transition-colors">
          {title}
        </h3>
        <div className="flex flex-col gap-1 text-xs text-white/40">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-white/25" />
            {formatDate(dateStart)}
          </span>
          <span className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-white/25" />
            <span className="truncate">{venueName} · {venueAddress}</span>
          </span>
        </div>
        <p className="text-sm font-semibold gradient-text mt-1">
          {formatPrice(priceMin, priceMax)}
        </p>
      </div>
    </Link>
  )
}
