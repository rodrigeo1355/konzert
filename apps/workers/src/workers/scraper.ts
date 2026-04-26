import { Worker } from "bullmq"
import { redis } from "../redis"
import { SCRAPER_QUEUE } from "../queues/scraper"

export const scraperWorker = new Worker(
  SCRAPER_QUEUE,
  async (job) => {
    const { platform } = job.data as { platform: string }
    console.log(`[scraper] running platform: ${platform}`)
  },
  {
    connection: redis,
    concurrency: Number(process.env.SCRAPER_CONCURRENCY ?? 3),
  }
)
