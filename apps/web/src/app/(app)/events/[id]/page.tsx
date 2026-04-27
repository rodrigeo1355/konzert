import { notFound } from "next/navigation"
import { prisma } from "@konzert/database"
import { Calendar, MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { TicketSection } from "@/components/events/ticket-section"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: { title: true },
  })
  return { title: event ? `${event.title} — Konzert` : "Evento — Konzert" }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
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

export default async function EventPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id, status: "PUBLISHED" },
    include: {
      venue: true,
      artists: { include: { artist: true }, orderBy: { matchScore: "desc" } },
      platforms: true,
    },
  })

  if (!event) notFound()

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <div className="relative h-72 overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, #1e3a8a 0%, #0a0a0a 70%)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <Link
          href="/map"
          className="absolute top-4 left-4 flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al mapa
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Título y artistas */}
        <div>
          <h1 className="text-2xl font-bold leading-tight text-white">{event.title}</h1>
          {event.artists.length > 0 && (
            <p className="mt-1 text-white/50">
              {event.artists.map((ea) => ea.artist.name).join(", ")}
            </p>
          )}
        </div>

        {/* Info del evento */}
        <div className="flex flex-col gap-2 text-sm">
          <span className="flex items-center gap-2 text-white/50">
            <Calendar className="h-4 w-4 shrink-0 text-[#06b6d4]" />
            {formatDate(event.dateStart)}
            {event.dateEnd && ` — ${formatDate(event.dateEnd)}`}
          </span>
          <span className="flex items-center gap-2 text-white/50">
            <MapPin className="h-4 w-4 shrink-0 text-[#06b6d4]" />
            {event.venue.name} · {event.venue.address}
          </span>
        </div>

        {/* Descripción */}
        {event.description && (
          <p className="text-sm text-white/40 leading-relaxed">{event.description}</p>
        )}

        {/* Precio */}
        <p className="text-xl font-bold gradient-text">
          {formatPrice(event.priceMin, event.priceMax)}
        </p>

        {/* Sección de tickets */}
        <TicketSection
          eventId={event.id}
          saleStatus={event.saleStatus}
          platforms={event.platforms.map((p) => ({
            id: p.id,
            platform: p.platform,
            ticketUrl: p.ticketUrl,
          }))}
        />
      </div>
    </div>
  )
}
