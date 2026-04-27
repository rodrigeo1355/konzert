import { Worker } from "bullmq"
import * as React from "react"
import { prisma } from "@konzert/database"
import { scrapers } from "@konzert/scraper"
import { sendEmail, ScraperAlertEmail } from "@konzert/emails"
import { redis } from "../redis"
import { SCRAPER_QUEUE, type ScraperJobData } from "../queues/scraper"
import { notifyAffectedUsers } from "../notifications"

const CONSECUTIVE_FAIL_KEY = (platform: string) => `scraper:fails:${platform}`
const FAIL_THRESHOLD = 2

async function checkAndAlertConsecutiveFails(platform: string, error: string) {
  const key = CONSECUTIVE_FAIL_KEY(platform)
  const count = await redis.incr(key)
  await redis.expire(key, 60 * 60 * 24) // reset after 24h of no new failures

  if (count >= FAIL_THRESHOLD) {
    const adminEmail = process.env.ADMIN_ALERT_EMAIL
    if (!adminEmail) return

    await sendEmail({
      to: adminEmail,
      subject: `[Konzert] Alerta: scraper ${platform} falló ${count} veces`,
      react: React.createElement(ScraperAlertEmail, {
        platform,
        failCount: count,
        lastError: error,
        timestamp: new Date().toISOString(),
      }),
    })
  }
}

export const scraperWorker = new Worker<ScraperJobData>(
  SCRAPER_QUEUE,
  async (job) => {
    const { platform } = job.data
    const scraper = scrapers[platform]

    if (!scraper) throw new Error(`Unknown platform: ${platform}`)

    const run = await prisma.scraperRun.create({
      data: {
        platform,
        status: "PARTIAL",
        startedAt: new Date(),
      },
    })

    let eventsNew = 0
    let eventsUpdated = 0
    let errorMessage: string | null = null

    try {
      const result = await scraper.scrape()

      for (const scraped of result.events) {
        const venue = await prisma.venue.upsert({
          where: { id: `venue-${scraped.venueName.toLowerCase().replace(/\s+/g, "-")}` },
          update: {},
          create: {
            id: `venue-${scraped.venueName.toLowerCase().replace(/\s+/g, "-")}`,
            name: scraped.venueName,
            address: scraped.venueAddress,
          },
        })

        const existing = await prisma.event.findFirst({
          where: {
            title: scraped.title,
            dateStart: scraped.dateStart,
            venueId: venue.id,
          },
        })

        if (existing) {
          const prevSaleStatus = existing.saleStatus

          if (!existing.manuallyEdited) {
            await prisma.event.update({
              where: { id: existing.id },
              data: {
                imageUrl: scraped.imageUrl,
                priceMin: scraped.priceMin,
                priceMax: scraped.priceMax,
              },
            })
          }

          await prisma.eventPlatform.upsert({
            where: { eventId_platform: { eventId: existing.id, platform: platform as never } },
            update: { ticketUrl: scraped.ticketUrl },
            create: { eventId: existing.id, platform: platform as never, ticketUrl: scraped.ticketUrl },
          })

          // Si el evento acaba de pasar a ON_SALE, notificar
          if (prevSaleStatus !== "ON_SALE" && existing.status === "PUBLISHED") {
            void notifyAffectedUsers(existing.id, "SALE_OPENED").catch(console.error)
          }

          eventsUpdated++
        } else {
          const event = await prisma.event.create({
            data: {
              title: scraped.title,
              dateStart: scraped.dateStart,
              dateEnd: scraped.dateEnd,
              imageUrl: scraped.imageUrl,
              venueId: venue.id,
              priceMin: scraped.priceMin,
              priceMax: scraped.priceMax,
              status: "DRAFT",
              saleStatus: "UPCOMING",
            },
          })

          await prisma.eventPlatform.create({
            data: { eventId: event.id, platform: platform as never, ticketUrl: scraped.ticketUrl },
          })

          // Notificar evento anunciado (solo si ya tiene artistas asignados)
          void notifyAffectedUsers(event.id, "EVENT_ANNOUNCED").catch(console.error)

          eventsNew++
        }
      }

      if (result.errors.length > 0) errorMessage = result.errors.join("; ")

      const finalStatus = result.errors.length === 0 ? "SUCCESS" : "PARTIAL"

      await prisma.scraperRun.update({
        where: { id: run.id },
        data: {
          status: finalStatus,
          eventsNew,
          eventsUpdated,
          errorMessage,
          durationMs: result.durationMs,
          finishedAt: new Date(),
        },
      })

      // reset consecutive fail counter on success
      await redis.del(CONSECUTIVE_FAIL_KEY(platform))
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)

      await prisma.scraperRun.update({
        where: { id: run.id },
        data: {
          status: "FAILED",
          errorMessage: msg,
          finishedAt: new Date(),
        },
      })

      await checkAndAlertConsecutiveFails(platform, msg)

      throw err
    }
  },
  {
    connection: redis,
    concurrency: Number(process.env.SCRAPER_CONCURRENCY ?? 3),
  }
)
