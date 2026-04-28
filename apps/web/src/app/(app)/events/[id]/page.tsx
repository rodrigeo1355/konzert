import { notFound } from "next/navigation"
import { prisma } from "@konzert/database"
import { Calendar, MapPin, ArrowLeft, Music2 } from "lucide-react"
import Link from "next/link"
import { TicketSection } from "@/components/events/ticket-section"
import { FollowArtistButton } from "@/components/events/follow-artist-button"
import { auth } from "@/lib/auth"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const event = await prisma.event.findUnique({
    where: { id, status: "PUBLISHED" },
    select: { title: true, description: true, imageUrl: true },
  })
  if (!event) return { title: "Evento — Konzert" }

  return {
    title: `${event.title} — Konzert`,
    description: event.description ?? `Compra entradas para ${event.title} en Konzert.`,
    openGraph: {
      title: event.title,
      description: event.description ?? `Compra entradas para ${event.title} en Konzert.`,
      ...(event.imageUrl && { images: [{ url: event.imageUrl }] }),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description ?? `Compra entradas para ${event.title} en Konzert.`,
      ...(event.imageUrl && { images: [event.imageUrl] }),
    },
  }
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

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [event, session] = await Promise.all([
    prisma.event.findUnique({
      where: { id, status: "PUBLISHED" },
      include: {
        venue: true,
        artists: { include: { artist: true }, orderBy: { matchScore: "desc" } },
        platforms: true,
      },
    }),
    auth(),
  ])

  if (!event) notFound()

  let followedArtistIds = new Set<string>()
  if (session?.user?.id && event.artists.length > 0) {
    const followed = await prisma.userArtist.findMany({
      where: {
        userId: session.user.id,
        artistId: { in: event.artists.map((ea: { artistId: string }) => ea.artistId) },
      },
      select: { artistId: true },
    })
    followedArtistIds = new Set(followed.map((ua) => ua.artistId))
  }

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
        {/* Título */}
        <h1 className="text-2xl font-bold leading-tight text-white">{event.title}</h1>

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

        {/* Artistas */}
        {event.artists.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-widest">
              Artistas
            </h2>
            <div className="flex flex-col gap-0.5">
              {event.artists.map(({ artist }) => (
                <div
                  key={artist.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {artist.imageUrl ? (
                      <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Music2 className="h-5 w-5 text-white/30" />
                    )}
                  </div>
                  <span className="text-sm font-medium flex-1 text-white">{artist.name}</span>
                  {session?.user ? (
                    <FollowArtistButton
                      artistId={artist.id}
                      initialFollowing={followedArtistIds.has(artist.id)}
                    />
                  ) : (
                    <Link
                      href={`/login?callbackUrl=/events/${event.id}`}
                      className="shrink-0 text-xs text-white/40 hover:text-white transition-colors"
                    >
                      Iniciar sesión para seguir
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
