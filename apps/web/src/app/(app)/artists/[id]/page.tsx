import { notFound } from "next/navigation"
import { prisma } from "@konzert/database"
import { Calendar, MapPin, ArrowLeft, Music2, Users } from "lucide-react"
import Link from "next/link"
import { FollowArtistButton } from "@/components/events/follow-artist-button"
import { auth } from "@/lib/auth"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const artist = await prisma.artist.findUnique({
    where: { id },
    select: { name: true, imageUrl: true },
  })
  if (!artist) return { title: "Artista — Konzert" }

  return {
    title: `${artist.name} — Konzert`,
    description: `Próximos eventos de ${artist.name} en Santiago. Sigue al artista y recibe notificaciones en Konzert.`,
    openGraph: {
      title: `${artist.name} — Konzert`,
      description: `Próximos eventos de ${artist.name} en Santiago.`,
      ...(artist.imageUrl && { images: [{ url: artist.imageUrl }] }),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${artist.name} — Konzert`,
      description: `Próximos eventos de ${artist.name} en Santiago.`,
      ...(artist.imageUrl && { images: [artist.imageUrl] }),
    },
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CL", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatPrice(min: number | null, max: number | null): string {
  if (min == null) return "Precio por confirmar"
  const fmt = (n: number) => `$${n.toLocaleString("es-CL")}`
  if (max == null || min === max) return fmt(min)
  return `${fmt(min)} — ${fmt(max)}`
}

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const now = new Date()

  const [artist, session] = await Promise.all([
    prisma.artist.findUnique({
      where: { id },
      include: {
        _count: { select: { followers: true } },
        eventArtists: {
          where: {
            event: { status: "PUBLISHED", dateStart: { gte: now } },
          },
          include: {
            event: {
              include: { venue: true },
            },
          },
          orderBy: { event: { dateStart: "asc" } },
        },
      },
    }),
    auth(),
  ])

  if (!artist) notFound()

  let isFollowing = false
  if (session?.user?.id) {
    const ua = await prisma.userArtist.findUnique({
      where: { userId_artistId: { userId: session.user.id, artistId: id } },
      select: { userId: true },
    })
    isFollowing = !!ua
  }

  const upcomingEvents = artist.eventArtists.map((ea) => ea.event)

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <div className="relative h-64 overflow-hidden">
        {artist.imageUrl ? (
          <img
            src={artist.imageUrl}
            alt={artist.name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, #1e3a8a 0%, #0a0a0a 70%)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <Link
          href="/map"
          className="absolute top-4 left-4 flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al mapa
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-12 pb-12 flex flex-col gap-6">
        {/* Avatar + nombre */}
        <div className="flex items-end gap-4">
          <div className="h-20 w-20 rounded-full border-2 border-black bg-white/5 flex items-center justify-center overflow-hidden shrink-0 shadow-xl">
            {artist.imageUrl ? (
              <img src={artist.imageUrl} alt={artist.name} className="h-full w-full object-cover" />
            ) : (
              <Music2 className="h-8 w-8 text-white/30" />
            )}
          </div>
          <div className="flex-1 pb-1 flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-white leading-tight">{artist.name}</h1>
            <span className="flex items-center gap-1.5 text-sm text-white/40">
              <Users className="h-3.5 w-3.5" />
              {artist._count.followers}{" "}
              {artist._count.followers === 1 ? "seguidor" : "seguidores"}
            </span>
          </div>
          {session?.user ? (
            <FollowArtistButton artistId={artist.id} initialFollowing={isFollowing} />
          ) : (
            <Link
              href={`/login?callbackUrl=/artists/${artist.id}`}
              className="shrink-0 text-xs text-white/40 hover:text-white transition-colors"
            >
              Iniciar sesión para seguir
            </Link>
          )}
        </div>

        {/* Próximos eventos */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-widest">
            Próximos eventos
          </h2>

          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-white/30 py-4">
              No hay eventos próximos agendados para este artista.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/5 hover:border-white/10 transition-colors group"
                >
                  <div className="h-12 w-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          background: "linear-gradient(135deg, #1e3a8a 0%, #06b6d4 100%)",
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-white truncate group-hover:text-[#06b6d4] transition-colors">
                      {event.title}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-white/40">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {formatDate(event.dateStart)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-white/40">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {event.venue.name}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-semibold gradient-text">
                    {formatPrice(event.priceMin, event.priceMax)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
