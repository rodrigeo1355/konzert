import { NextResponse } from "next/server"
import { prisma } from "@konzert/database"
import { Prisma } from "@konzert/database"

const SANTIAGO_LAT = -33.4489
const SANTIAGO_LNG = -70.6693
const MAX_RADIUS = 25_000

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const lat = parseFloat(searchParams.get("lat") ?? String(SANTIAGO_LAT))
  const lng = parseFloat(searchParams.get("lng") ?? String(SANTIAGO_LNG))
  const radius = Math.min(parseFloat(searchParams.get("radius") ?? "5000"), MAX_RADIUS)
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : null

  if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
    return NextResponse.json({ error: "Parámetros inválidos." }, { status: 400 })
  }

  const now = new Date()
  const fromDate = from ? new Date(from) : null
  const toDate = to ? new Date(to) : null

  const events = await prisma.$queryRaw<EventRow[]>`
    SELECT
      e.id,
      e.title,
      e."dateStart",
      e."saleStatus",
      e."priceMin",
      e."priceMax",
      e."imageUrl",
      v.id          AS "venueId",
      v.name        AS "venueName",
      v.address     AS "venueAddress",
      ST_Y(v.location::geometry) AS lat,
      ST_X(v.location::geometry) AS lng,
      COALESCE(
        ST_Distance(v.location::geography, ST_MakePoint(${lng}, ${lat})::geography),
        0
      ) AS "distanceMeters"
    FROM "Event" e
    JOIN "Venue" v ON e."venueId" = v.id
    WHERE
      e.status = 'PUBLISHED'
      AND e."dateStart" > ${now}
      AND (${fromDate}::timestamptz IS NULL OR e."dateStart" >= ${fromDate}::timestamptz)
      AND (${toDate}::timestamptz IS NULL OR e."dateStart" <= ${toDate}::timestamptz)
      AND (${maxPrice}::int IS NULL OR e."priceMin" IS NULL OR e."priceMin" <= ${maxPrice}::int)
      AND (
        v.location IS NULL
        OR ST_DWithin(
          v.location::geography,
          ST_MakePoint(${lng}, ${lat})::geography,
          ${MAX_RADIUS}
        )
      )
    ORDER BY "distanceMeters" ASC
    LIMIT 50
  `

  return NextResponse.json(events)
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
  lat: number | null
  lng: number | null
  distanceMeters: number
}
