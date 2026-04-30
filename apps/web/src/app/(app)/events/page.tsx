import { Suspense } from "react"
import Link from "next/link"
import { prisma } from "@konzert/database"
import { Map, List, ChevronLeft, ChevronRight } from "lucide-react"
import { EventListCard } from "@/components/events/event-list-card"
import { EventsFilters } from "@/components/events/events-filters"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Eventos — Konzert" }

const PAGE_SIZE = 20

interface SearchParams {
  from?: string
  to?: string
  maxPrice?: string
  page?: string
}

interface EventRow {
  id: string
  title: string
  dateStart: Date
  saleStatus: string
  priceMin: number | null
  priceMax: number | null
  imageUrl: string | null
  venueId: string
  venueName: string
  venueAddress: string
}

async function fetchEvents(sp: SearchParams) {
  const page = Math.max(1, parseInt(sp.page ?? "1"))
  const offset = (page - 1) * PAGE_SIZE
  const now = new Date()
  const fromDate = sp.from ? new Date(sp.from + "T00:00:00") : null
  const toDate = sp.to ? new Date(sp.to + "T23:59:59") : null
  const maxPrice = sp.maxPrice ? parseInt(sp.maxPrice) : null

  const [events, countResult] = await Promise.all([
    prisma.$queryRaw<EventRow[]>`
      SELECT
        e.id,
        e.title,
        e."dateStart",
        e."saleStatus",
        e."priceMin",
        e."priceMax",
        e."imageUrl",
        v.id      AS "venueId",
        v.name    AS "venueName",
        v.address AS "venueAddress"
      FROM "Event" e
      JOIN "Venue" v ON e."venueId" = v.id
      WHERE
        e.status = 'PUBLISHED'
        AND e."dateStart" > ${now}
        AND (${fromDate}::timestamptz IS NULL OR e."dateStart" >= ${fromDate}::timestamptz)
        AND (${toDate}::timestamptz IS NULL OR e."dateStart" <= ${toDate}::timestamptz)
        AND (${maxPrice}::int IS NULL OR e."priceMin" IS NULL OR e."priceMin" <= ${maxPrice}::int)
      ORDER BY e."dateStart" ASC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `,
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) AS count
      FROM "Event" e
      JOIN "Venue" v ON e."venueId" = v.id
      WHERE
        e.status = 'PUBLISHED'
        AND e."dateStart" > ${now}
        AND (${fromDate}::timestamptz IS NULL OR e."dateStart" >= ${fromDate}::timestamptz)
        AND (${toDate}::timestamptz IS NULL OR e."dateStart" <= ${toDate}::timestamptz)
        AND (${maxPrice}::int IS NULL OR e."priceMin" IS NULL OR e."priceMin" <= ${maxPrice}::int)
    `,
  ])

  const total = Number(countResult[0].count)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return { events, page, total, totalPages }
}

function buildUrl(sp: SearchParams, page: number) {
  const params = new URLSearchParams()
  if (sp.from) params.set("from", sp.from)
  if (sp.to) params.set("to", sp.to)
  if (sp.maxPrice) params.set("maxPrice", sp.maxPrice)
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  return `/events${qs ? `?${qs}` : ""}`
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const { events, page, total, totalPages } = await fetchEvents(sp)

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Eventos</h1>
            <p className="text-sm text-white/40 mt-0.5">
              {total === 0 ? "Sin eventos" : `${total} evento${total !== 1 ? "s" : ""} próximos`}
            </p>
          </div>
          <Link
            href="/map"
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors border border-white/10 hover:border-white/25 rounded-xl px-3 py-2"
          >
            <Map className="h-4 w-4" />
            Ver mapa
          </Link>
        </div>

        {/* Filtros */}
        <Suspense>
          <EventsFilters />
        </Suspense>

        {/* Grid */}
        {events.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <List className="h-10 w-10 text-white/10" />
            <p className="text-white/40 text-sm">No hay eventos con esos filtros.</p>
            <Link href="/events" className="text-xs text-[#06b6d4] hover:underline">
              Limpiar filtros
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {events.map((event) => (
              <EventListCard
                key={event.id}
                id={event.id}
                title={event.title}
                dateStart={new Date(event.dateStart)}
                saleStatus={event.saleStatus}
                priceMin={event.priceMin}
                priceMax={event.priceMax}
                imageUrl={event.imageUrl}
                venueName={event.venueName}
                venueAddress={event.venueAddress}
              />
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {page > 1 ? (
              <Link
                href={buildUrl(sp, page - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/25 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/5 text-sm text-white/20 cursor-not-allowed">
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </span>
            )}

            <span className="text-sm text-white/30 px-2">
              {page} / {totalPages}
            </span>

            {page < totalPages ? (
              <Link
                href={buildUrl(sp, page + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-sm text-white/60 hover:text-white hover:border-white/25 transition-all"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/5 text-sm text-white/20 cursor-not-allowed">
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
