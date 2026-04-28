import { notFound } from "next/navigation"
import { prisma } from "@konzert/database"
import { EventForm } from "@/components/admin/event-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "Editar evento — Backoffice Konzert" }

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [event, venues] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: {
        platforms: { take: 1 },
      },
    }),
    prisma.venue.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  if (!event) notFound()

  const firstPlatform = event.platforms[0]

  const initial = {
    id: event.id,
    title: event.title,
    description: event.description ?? "",
    imageUrl: event.imageUrl ?? "",
    dateStart: event.dateStart.toISOString().slice(0, 16),
    dateEnd: event.dateEnd?.toISOString().slice(0, 16) ?? "",
    venueId: event.venueId,
    status: event.status as "DRAFT" | "PUBLISHED" | "REJECTED",
    saleStatus: event.saleStatus as "UPCOMING" | "ON_SALE" | "SOLD_OUT",
    priceMin: event.priceMin?.toString() ?? "",
    priceMax: event.priceMax?.toString() ?? "",
    ticketUrl: firstPlatform?.ticketUrl ?? "",
    ticketPlatform: (firstPlatform?.platform ?? "OTHER") as "PUNTOTICKET" | "TICKETMASTER" | "PASSLINE" | "JOINNUS" | "FINTIX" | "EVENTBRITE" | "OTHER",
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/backoffice/events"
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a eventos
        </Link>
        <h1 className="text-xl font-bold text-white">{event.title}</h1>
        {event.manuallyEdited && (
          <span className="inline-block mt-1 text-xs text-[#06b6d4] border border-[#06b6d4]/30 rounded px-2 py-0.5">
            Editado manualmente — el scraper no sobreescribirá este evento
          </span>
        )}
      </div>
      <EventForm venues={venues} initial={initial} />
    </div>
  )
}
