import { Queue } from "bullmq"
import { redis } from "../redis"

export const SCRAPER_QUEUE = "scraper"

export const scraperQueue = new Queue(SCRAPER_QUEUE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
})
