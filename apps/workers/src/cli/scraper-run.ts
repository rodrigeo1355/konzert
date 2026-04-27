import { scrapers, type PlatformKey } from "@konzert/scraper"
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

  await prisma.scraperRun.update({
    where: { id: dbRun.id },
    data: {
      status:
        result.errors.length === 0
          ? "SUCCESS"
          : result.events.length > 0
            ? "PARTIAL"
            : "FAILED",
      eventsNew: result.events.length,
      errorMessage: result.errors.length > 0 ? result.errors.join("; ") : null,
      durationMs: result.durationMs,
      finishedAt: new Date(),
    },
  })

  console.log(
    `Done: ${result.events.length} events, ${result.errors.length} errors, ${result.durationMs}ms`
  )
  if (result.errors.length > 0) console.error("Errors:", result.errors)

  await prisma.$disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
