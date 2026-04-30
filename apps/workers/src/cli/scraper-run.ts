import { scrapers, type PlatformKey } from "@konzert/scraper"
import { geocodeAddress } from "@konzert/scraper/utils"
import { prisma } from "@konzert/database"

async function run() {
  const arg = process.argv.find((a) => a.startsWith("--platform="))
  const platform = arg?.split("=")[1]?.toUpperCase() as PlatformKey | undefined

  if (!platform || !(platform in scrapers)) {
    console.error(
      "Usage: tsx src/cli/scraper-run.ts --platform=<PUNTOTICKET|TICKETMASTER|PASSLINE>"
    )
    process.exit(1)
  }

  const scraper = scrapers[platform]
  console.log(`Running scraper: ${platform}`)

  const dbRun = await prisma.scraperRun.create({
    data: { platform, status: "PARTIAL", startedAt: new Date() },
  })

  const result = await scraper.scrape()

  let eventsNew = 0
  let eventsUpdated = 0

  for (const scraped of result.events) {
    const venueId = `venue-${scraped.venueName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`

    const venue = await prisma.venue.upsert({
      where: { id: venueId },
      update: {},
      create: { id: venueId, name: scraped.venueName, address: scraped.venueAddress },
    })

    const hasLocation = await prisma.$queryRaw<Array<{ has: boolean }>>`
      SELECT location IS NOT NULL AS has FROM "Venue" WHERE id = ${venue.id}
    `
    if (!hasLocation[0]?.has) {
      const coords = await geocodeAddress(venue.name, venue.address ?? "")
      if (coords) {
        await prisma.$executeRaw`
          UPDATE "Venue"
          SET location = ST_SetSRID(ST_MakePoint(${coords.lng}, ${coords.lat}), 4326)
          WHERE id = ${venue.id}
        `
        console.log(`  Geocoded "${venue.name}" → ${coords.lat}, ${coords.lng}`)
      } else {
        console.log(`  Could not geocode "${venue.name}"`)
      }
    }

    const existing = await prisma.event.findFirst({
      where: { title: scraped.title, dateStart: scraped.dateStart, venueId: venue.id },
    })

    if (existing) {
      await prisma.eventPlatform.upsert({
        where: { eventId_platform: { eventId: existing.id, platform: platform as never } },
        update: { ticketUrl: scraped.ticketUrl },
        create: { eventId: existing.id, platform: platform as never, ticketUrl: scraped.ticketUrl },
      })
      eventsUpdated++
    } else {
      const event = await prisma.event.create({
        data: {
          title: scraped.title,
          dateStart: scraped.dateStart,
          dateEnd: scraped.dateEnd,
          imageUrl: scraped.imageUrl ?? null,
          venueId: venue.id,
          priceMin: scraped.priceMin ?? null,
          priceMax: scraped.priceMax ?? null,
          status: "PUBLISHED",
          saleStatus: "UPCOMING",
        },
      })

      await prisma.eventPlatform.create({
        data: { eventId: event.id, platform: platform as never, ticketUrl: scraped.ticketUrl },
      })

      console.log(`  + "${scraped.title}" @ ${scraped.venueName} (${scraped.dateStart.toISOString().slice(0, 10)})`)
      eventsNew++
    }
  }

  await prisma.scraperRun.update({
    where: { id: dbRun.id },
    data: {
      status: result.errors.length === 0 ? "SUCCESS" : result.events.length > 0 ? "PARTIAL" : "FAILED",
      eventsNew,
      eventsUpdated,
      errorMessage: result.errors.length > 0 ? result.errors.join("; ") : null,
      durationMs: result.durationMs,
      finishedAt: new Date(),
    },
  })

  console.log(
    `Done: ${eventsNew} new, ${eventsUpdated} updated, ${result.errors.length} errors, ${result.durationMs}ms`
  )
  if (result.errors.length > 0) console.error("Errors:", result.errors)

  await prisma.$disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
