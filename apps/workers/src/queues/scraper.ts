import { Queue } from "bullmq"
import { redis } from "../redis"
import type { PlatformKey } from "@konzert/scraper"

export const SCRAPER_QUEUE = "scraper"

export interface ScraperJobData {
  platform: PlatformKey
}

export const scraperQueue = new Queue<ScraperJobData>(SCRAPER_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5 * 60 * 1000 }, // 5min → 15min → 45min
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
})

const PLATFORMS: PlatformKey[] = ["PUNTOTICKET", "TICKETMASTER", "PASSLINE"]
const CRON = process.env.SCRAPER_CRON ?? "0 */6 * * *"

export async function registerScraperSchedules() {
  for (const platform of PLATFORMS) {
    await scraperQueue.upsertJobScheduler(
      `scraper-${platform.toLowerCase()}`,
      { pattern: CRON },
      { name: platform, data: { platform } }
    )
  }
}
