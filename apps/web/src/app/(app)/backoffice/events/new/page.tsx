import { prisma } from "@konzert/database"
import { EventForm } from "@/components/admin/event-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = { title: "Nuevo evento — Backoffice Konzert" }

export default async function NewEventPage() {
  const venues = await prisma.venue.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

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
        <h1 className="text-xl font-bold text-white">Crear evento</h1>
        <p className="text-sm text-white/40 mt-1">
          Los eventos creados manualmente aparecen en el mapa inmediatamente si se publican.
        </p>
      </div>
      <EventForm venues={venues} />
    </div>
  )
}
