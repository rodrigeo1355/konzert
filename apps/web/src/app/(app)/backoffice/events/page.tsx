import { Suspense } from "react"
import { EventsTable } from "@/components/admin/events-table"

export const metadata = { title: "Eventos — Backoffice Konzert" }

export default function BackofficeEventsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Gestión de eventos</h1>
        <p className="text-sm text-white/40 mt-1">
          Revisa, edita y modera los eventos importados por el scraper.
        </p>
      </div>
      <Suspense>
        <EventsTable />
      </Suspense>
    </div>
  )
}
